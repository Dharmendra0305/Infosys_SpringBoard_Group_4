import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusStamp from '../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import { getRequisitions, getPurchaseOrders } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { money, date } from '../utils/format';

export default function Dashboard() {
  const [requisitions, setRequisitions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ref = useReferenceData();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getRequisitions(), getPurchaseOrders()])
      .then(([reqs, pos]) => {
        setRequisitions(reqs);
        setOrders(pos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const pendingApproval = requisitions.filter((r) => r.status === 'IN_APPROVAL').length;
  const approved = requisitions.filter((r) => r.status === 'APPROVED').length;
  const openPOs = orders.filter((o) => !['CLOSED', 'CANCELLED'].includes(o.status)).length;
  const totalCommitted = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const recentReqs = [...requisitions]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Requisition-to-PO pipeline at a glance" />
      <div className="content">
        <ErrorBanner message={error} />

        <div className="workflow-strip">
          {['Employee', 'Manager', 'Sr. Manager', 'Dept. Head', 'Finance', 'CEO', 'PO Generated', 'Order Fulfilled'].map((step, i, arr) => (
            <div className="workflow-step" key={step}>
              <span className="workflow-dot">{i + 1}</span>
              <span>{step}</span>
              {i < arr.length - 1 && <span className="workflow-arrow">→</span>}
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12, margin: '-14px 0 20px' }}>
          Full chain shown above ₹5L. Smaller requisitions skip levels — a request under ₹25K needs only a Manager.
        </p>

        <div className="stat-row">
          <div className="stat-card">
            <div className="label">Awaiting approval</div>
            <div className="value num">{loading ? '—' : pendingApproval}</div>
          </div>
          <div className="stat-card">
            <div className="label">Approved, not converted</div>
            <div className="value num">{loading ? '—' : approved}</div>
          </div>
          <div className="stat-card">
            <div className="label">Open purchase orders</div>
            <div className="value num">{loading ? '—' : openPOs}</div>
          </div>
          <div className="stat-card">
            <div className="label">Committed spend</div>
            <div className="value num">{loading ? '—' : money(totalCommitted)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Recent requisitions</h2>
            <Link className="btn btn-small" to="/requisitions">
              View all
            </Link>
          </div>
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
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReqs.length === 0 && <EmptyRow colSpan={6}>No requisitions yet.</EmptyRow>}
                  {recentReqs.map((r) => (
                    <tr key={r.id} className="clickable" onClick={() => navigate(`/requisitions/${r.id}`)}>
                      <td className="mono">{r.requisitionNumber}</td>
                      <td>{ref.employeeName(r.requestedBy)}</td>
                      <td>{ref.departmentName(r.departmentId)}</td>
                      <td className="num">{money(r.totalAmount)}</td>
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
