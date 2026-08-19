import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { ErrorBanner, EmptyRow } from '../components/Feedback';
import { getAuditTrail } from '../api/endpoints';
import { dateTime } from '../utils/format';

const ENTITY_OPTIONS = [
  'purchase_requisitions',
  'purchase_orders',
  'suppliers',
  'employees',
  'goods_receipts',
];

export default function AuditTrail() {
  const [entityName, setEntityName] = useState(ENTITY_OPTIONS[0]);
  const [entityId, setEntityId] = useState('');
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(e) {
    e.preventDefault();
    if (!entityId) return;
    setError('');
    setLoading(true);
    try {
      const result = await getAuditTrail(entityName, entityId);
      setEntries(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Audit Trail" subtitle="Look up every recorded action against a specific record" />
      <div className="content">
        <ErrorBanner message={error} />

        <div className="card">
          <div className="card-head">
            <h2>Lookup</h2>
          </div>
          <div className="card-body">
            <form onSubmit={search} className="field-row" style={{ alignItems: 'end', marginBottom: entries ? 16 : 0 }}>
              <div className="field">
                <label>Entity</label>
                <select value={entityName} onChange={(e) => setEntityName(e.target.value)}>
                  {ENTITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Record ID</label>
                <input type="number" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="e.g. 4" />
              </div>
              <button className="btn btn-primary" style={{ height: 37 }} disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {entries && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Performed by</th>
                    <th>When</th>
                    <th>Old value</th>
                    <th>New value</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && <EmptyRow colSpan={5}>No audit entries for this record.</EmptyRow>}
                  {entries.map((a) => (
                    <tr key={a.id}>
                      <td className="mono">{a.action}</td>
                      <td className="muted">{a.performedBy ? `#${a.performedBy}` : '—'}</td>
                      <td className="muted">{dateTime(a.performedAt)}</td>
                      <td className="muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.oldValue || '—'}
                      </td>
                      <td className="muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.newValue || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
