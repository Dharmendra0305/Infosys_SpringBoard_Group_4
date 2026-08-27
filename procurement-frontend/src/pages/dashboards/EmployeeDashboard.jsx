import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusStamp from '../../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../../components/Feedback';
import { getMyRequisitions, getPurchaseOrders } from '../../api/endpoints';
import useReferenceData from '../../hooks/useReferenceData';
import { useAuth } from '../../auth/AuthContext';
import { money, date } from '../../utils/format';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const ref = useReferenceData();
  const navigate = useNavigate();

  const [requisitions, setRequisitions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMyRequisitions(), getPurchaseOrders()])
      .then(([mine, allOrders]) => {
        setRequisitions(mine);
        const myReqIds = new Set(mine.map((r) => r.id));
        setOrders(allOrders.filter((o) => myReqIds.has(o.requisitionId)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const inApproval = requisitions.filter((r) => r.status === 'IN_APPROVAL').length;
  const approved = requisitions.filter((r) => ['APPROVED', 'CONVERTED_TO_PO'].includes(r.status)).length;
  const rejected = requisitions.filter((r) => r.status === 'REJECTED').length;

  return (
    <>
      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome back, ${user?.firstName || ''} — track your requisitions here`}
        actions={
          <Link className="btn btn-primary" to="/requisitions/new">
            + New Requisition
          </Link>
        }
      />
      <div className="content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Awaiting approval</div>
                <div className="value num">{inApproval}</div>
              </div>
              <div className="stat-card">
                <div className="label">Approved</div>
                <div className="value num">{approved}</div>
              </div>
              <div className="stat-card">
                <div className="label">Rejected</div>
                <div className="value num">{rejected}</div>
              </div>
              <div className="stat-card">
                <div className="label">My purchase orders</div>
                <div className="value num">{orders.length}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>My Requisitions</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Department</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Approval level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions.length === 0 && <EmptyRow colSpan={5}>You haven't raised any requisitions yet.</EmptyRow>}
                    {requisitions.map((r) => (
                      <tr key={r.id} className="clickable" onClick={() => navigate(`/requisitions/${r.id}`)}>
                        <td className="mono">{r.requisitionNumber}</td>
                        <td>{ref.departmentName(r.departmentId)}</td>
                        <td className="num">{money(r.totalAmount)}</td>
                        <td><StatusStamp status={r.status} /></td>
                        <td className="muted">{r.currentApprovalLevel ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <h2>Purchase Orders from my requisitions</h2>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>PO Number</th><th>Status</th><th>Amount</th><th>Expected delivery</th></tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="clickable" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                          <td className="mono">{o.poNumber}</td>
                          <td><StatusStamp status={o.status} /></td>
                          <td className="num">{money(o.totalAmount)}</td>
                          <td className="muted">{date(o.expectedDeliveryDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
