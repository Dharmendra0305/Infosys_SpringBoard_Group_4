import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusStamp from '../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import { getRequisitions } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { money, date } from '../utils/format';

const STATUS_FILTERS = ['ALL', 'DRAFT', 'IN_APPROVAL', 'APPROVED', 'REJECTED', 'CONVERTED_TO_PO', 'CANCELLED'];

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const ref = useReferenceData();
  const navigate = useNavigate();

  useEffect(() => {
    getRequisitions()
      .then(setRequisitions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === 'ALL' ? requisitions : requisitions.filter((r) => r.status === filter)),
    [requisitions, filter]
  );

  return (
    <>
      <PageHeader
        title="Requisitions"
        subtitle="Purchase requests moving through the approval chain"
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/requisitions/new')}>
            New requisition
          </button>
        }
      />
      <div className="content">
        <ErrorBanner message={error} />

        <div className="toolbar">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className="btn btn-small"
                style={{
                  background: filter === s ? 'var(--ledger-blue-tint)' : undefined,
                  borderColor: filter === s ? 'var(--ledger-blue)' : undefined,
                  color: filter === s ? 'var(--ledger-blue)' : undefined,
                }}
                onClick={() => setFilter(s)}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Requested by</th>
                    <th>Department</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && <EmptyRow colSpan={8}>No requisitions match this filter.</EmptyRow>}
                  {filtered.map((r) => (
                    <tr key={r.id} className="clickable" onClick={() => navigate(`/requisitions/${r.id}`)}>
                      <td className="mono">{r.requisitionNumber}</td>
                      <td>{ref.employeeName(r.requestedBy)}</td>
                      <td>{ref.departmentName(r.departmentId)}</td>
                      <td>{ref.categoryName(r.categoryId)}</td>
                      <td className="num">{money(r.totalAmount)}</td>
                      <td className="muted">{r.currentApprovalLevel ?? '—'}</td>
                      <td>
                        <StatusStamp status={r.status} />
                      </td>
                      <td className="muted">{date(r.createdAt)}</td>
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
