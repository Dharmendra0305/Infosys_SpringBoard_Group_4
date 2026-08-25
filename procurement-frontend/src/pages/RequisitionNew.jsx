import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { ErrorBanner, Loading } from '../components/Feedback';
import { createRequisition } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { useAuth } from '../auth/AuthContext';

let lineKeySeed = 0;
const blankLine = () => ({ key: lineKeySeed++, itemDescription: '', quantity: 1, unitPrice: '', categoryId: '' });

export default function RequisitionNew() {
  const ref = useReferenceData();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [departmentId, setDepartmentId] = useState(user?.departmentId ? String(user.departmentId) : '');
  const [costCenterId, setCostCenterId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [justification, setJustification] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [lines, setLines] = useState([blankLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  const updateLine = (key, patch) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const removeLine = (key) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.key !== key)));
  };

  const filteredCostCenters = ref.costCenters.filter(
    (cc) => !departmentId || String(cc.departmentId) === String(departmentId)
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!user?.employeeId || !departmentId || !costCenterId || !categoryId) {
      setError('Please fill in requester, department, cost center and category.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Please enter the delivery address — the supplier needs to know where to send this.');
      return;
    }
    if (lines.some((l) => !l.itemDescription || !l.quantity || !l.unitPrice || !l.categoryId)) {
      setError('Every line item needs a description, quantity, unit price and category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        requestedBy: user.employeeId,
        departmentId: Number(departmentId),
        costCenterId: Number(costCenterId),
        categoryId: Number(categoryId),
        justification,
        deliveryAddress: deliveryAddress.trim(),
        lineItems: lines.map((l) => ({
          itemDescription: l.itemDescription,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          categoryId: Number(l.categoryId),
        })),
      };
      const created = await createRequisition(payload);
      navigate(`/requisitions/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="New requisition" subtitle="Submits directly into the matching approval chain" />
      <div className="content" style={{ maxWidth: 860 }}>
        <div className="breadcrumb">
          <Link to="/requisitions">Requisitions</Link> / New
        </div>

        {ref.loading ? (
          <Loading />
        ) : (
          <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
              <ErrorBanner message={error} />

              <div className="section-title">Request details</div>
              <div className="field-row">
                <div className="field">
                  <label>Requested by</label>
                  <input value={`${user.firstName} ${user.lastName} (${user.designation || 'Employee'})`} disabled />
                </div>
                <div className="field">
                  <label>Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => {
                      setDepartmentId(e.target.value);
                      setCostCenterId('');
                    }}
                  >
                    <option value="">Select department…</option>
                    {ref.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Cost center</label>
                  <select value={costCenterId} onChange={(e) => setCostCenterId(e.target.value)}>
                    <option value="">Select cost center…</option>
                    {filteredCostCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Select category…</option>
                    {ref.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Justification</label>
                <textarea rows={2} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Why is this purchase needed?" />
              </div>

              <div className="field">
                <label>Delivery address</label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Where should the supplier send this? Building, floor, department, city…"
                />
              </div>

              <div className="section-title">Line items</div>
              <div className="line-item-row" style={{ marginBottom: 6 }}>
                <span className="tag">Description</span>
                <span className="tag">Qty</span>
                <span className="tag">Unit price</span>
                <span className="tag">Category</span>
                <span />
              </div>
              {lines.map((l) => (
                <div className="line-item-row" key={l.key}>
                  <input
                    placeholder="Item description"
                    value={l.itemDescription}
                    onChange={(e) => updateLine(l.key, { itemDescription: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    value={l.quantity}
                    onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={l.unitPrice}
                    onChange={(e) => updateLine(l.key, { unitPrice: e.target.value })}
                  />
                  <select value={l.categoryId} onChange={(e) => updateLine(l.key, { categoryId: e.target.value })}>
                    <option value="">Category…</option>
                    {ref.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-small" onClick={() => removeLine(l.key)} disabled={lines.length === 1}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-small" onClick={() => setLines((prev) => [...prev, blankLine()])}>
                + Add line
              </button>

              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 24, alignItems: 'baseline' }}>
                <span className="muted">Requisition total</span>
                <span className="mono" style={{ fontSize: 20, fontWeight: 600 }}>
                  {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit for approval'}
                </button>
                <button type="button" className="btn" onClick={() => navigate('/requisitions')}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
