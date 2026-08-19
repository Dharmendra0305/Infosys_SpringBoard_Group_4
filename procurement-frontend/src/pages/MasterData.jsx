import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import useReferenceData from '../hooks/useReferenceData';
import {
  createDepartment,
  createCostCenter,
  createCategory,
  createSupplier,
} from '../api/endpoints';

const TABS = ['Departments', 'Cost centers', 'Categories', 'Suppliers'];

export default function MasterData() {
  const ref = useReferenceData();
  const [tab, setTab] = useState('Departments');
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');

  return (
    <>
      <PageHeader title="Master data" subtitle="Reference records used across requisitions and orders" />
      <div className="content">
        <ErrorBanner message={error} />
        <div className="toolbar">
          <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map((t) => (
              <button
                key={t}
                className="btn btn-small"
                style={{
                  background: tab === t ? 'var(--ledger-blue-tint)' : undefined,
                  borderColor: tab === t ? 'var(--ledger-blue)' : undefined,
                  color: tab === t ? 'var(--ledger-blue)' : undefined,
                }}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {ref.loading ? (
          <Loading />
        ) : (
          <>
            {tab === 'Departments' && (
              <DepartmentsPanel
                key={reloadKey}
                items={ref.departments}
                onCreated={() => setReloadKey((k) => k + 1)}
                onError={setError}
              />
            )}
            {tab === 'Cost centers' && (
              <CostCentersPanel
                key={reloadKey}
                items={ref.costCenters}
                departments={ref.departments}
                onCreated={() => setReloadKey((k) => k + 1)}
                onError={setError}
              />
            )}
            {tab === 'Categories' && (
              <CategoriesPanel key={reloadKey} items={ref.categories} onCreated={() => setReloadKey((k) => k + 1)} onError={setError} />
            )}
            {tab === 'Suppliers' && (
              <SuppliersPanel key={reloadKey} items={ref.suppliers} onCreated={() => setReloadKey((k) => k + 1)} onError={setError} />
            )}
          </>
        )}
      </div>
    </>
  );
}

function Panel({ title, table, form }) {
  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>{title}</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {table}
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h2>Add new</h2>
        </div>
        <div className="card-body">{form}</div>
      </div>
    </>
  );
}

function DepartmentsPanel({ items, onCreated, onError }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    onError('');
    setSubmitting(true);
    try {
      await createDepartment({ name, code });
      setName('');
      setCode('');
      onCreated();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel
      title="Departments"
      table={
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyRow colSpan={2}>No departments yet.</EmptyRow>}
            {items.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td className="mono">{d.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      form={
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add department'}
          </button>
        </form>
      }
    />
  );
}

function CostCentersPanel({ items, departments, onCreated, onError }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    onError('');
    setSubmitting(true);
    try {
      await createCostCenter({ name, code, departmentId: Number(departmentId) });
      setName('');
      setCode('');
      setDepartmentId('');
      onCreated();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const deptById = Object.fromEntries(departments.map((d) => [d.id, d]));

  return (
    <Panel
      title="Cost centers"
      table={
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyRow colSpan={3}>No cost centers yet.</EmptyRow>}
            {items.map((cc) => (
              <tr key={cc.id}>
                <td>{cc.name}</td>
                <td className="mono">{cc.code}</td>
                <td>{deptById[cc.departmentId]?.name || `#${cc.departmentId}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      form={
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                <option value="">Select…</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add cost center'}
          </button>
        </form>
      }
    />
  );
}

function CategoriesPanel({ items, onCreated, onError }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    onError('');
    setSubmitting(true);
    try {
      await createCategory({ name, code, description });
      setName('');
      setCode('');
      setDescription('');
      onCreated();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel
      title="Procurement categories"
      table={
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyRow colSpan={3}>No categories yet.</EmptyRow>}
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="mono">{c.code}</td>
                <td className="muted">{c.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      form={
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add category'}
          </button>
        </form>
      }
    />
  );
}

function SuppliersPanel({ items, onCreated, onError }) {
  const [name, setName] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    onError('');
    setSubmitting(true);
    try {
      await createSupplier({ name, supplierCode, taxId, paymentTerms, status: 'ACTIVE' });
      setName('');
      setSupplierCode('');
      setTaxId('');
      setPaymentTerms('');
      onCreated();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel
      title="Suppliers"
      table={
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
              <th>Payment terms</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyRow colSpan={5}>No suppliers yet.</EmptyRow>}
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td className="mono">{s.supplierCode}</td>
                <td className="muted">{s.status}</td>
                <td className="muted">{s.paymentTerms || '—'}</td>
                <td className="num">{s.rating ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      form={
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Supplier code</label>
              <input value={supplierCode} onChange={(e) => setSupplierCode(e.target.value)} required />
            </div>
            <div className="field">
              <label>Tax ID</label>
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </div>
            <div className="field">
              <label>Payment terms</label>
              <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30" />
            </div>
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add supplier'}
          </button>
        </form>
      }
    />
  );
}
