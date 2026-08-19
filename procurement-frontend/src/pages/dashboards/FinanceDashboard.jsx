import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusStamp from '../../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../../components/Feedback';
import { getMyPendingApprovals, getBudgetAllocations, getPurchaseOrders } from '../../api/endpoints';
import useReferenceData from '../../hooks/useReferenceData';
import { money } from '../../utils/format';

export default function FinanceDashboard() {
  const ref = useReferenceData();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMyPendingApprovals(), getBudgetAllocations(), getPurchaseOrders()])
      .then(([p, b, o]) => {
        setPending(p);
        setBudgets(b);
        setOrders(o);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const openPOValue = orders
    .filter((o) => !['CLOSED', 'CANCELLED'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <>
      <PageHeader title="Finance Dashboard" subtitle="Budget verification, finance-level approvals, and open commitments" />
      <div className="content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Pending finance approval</div>
                <div className="value num">{pending.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Open PO value</div>
                <div className="value num">{money(openPOValue)}</div>
              </div>
              <div className="stat-card">
                <div className="label">Budget lines tracked</div>
                <div className="value num">{budgets.length}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Finance Approvals</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Number</th><th>Department</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && <EmptyRow colSpan={4}>Nothing waiting on Finance right now.</EmptyRow>}
                    {pending.map((r) => (
                      <tr key={r.id} className="clickable" onClick={() => navigate(`/requisitions/${r.id}`)}>
                        <td className="mono">{r.requisitionNumber}</td>
                        <td>{ref.departmentName(r.departmentId)}</td>
                        <td className="num">{money(r.totalAmount)}</td>
                        <td><StatusStamp status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Budget Verification</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Department</th><th>Fiscal year</th><th>Allocated</th><th>Consumed</th><th>Remaining</th></tr>
                  </thead>
                  <tbody>
                    {budgets.length === 0 && <EmptyRow colSpan={5}>No budget allocations recorded yet.</EmptyRow>}
                    {budgets.map((b) => (
                      <tr key={b.id}>
                        <td>{ref.departmentName(b.departmentId)}</td>
                        <td className="muted">{b.fiscalYear}</td>
                        <td className="num">{money(b.allocatedAmount)}</td>
                        <td className="num">{money(b.consumedAmount)}</td>
                        <td className="num">{money(Number(b.allocatedAmount || 0) - Number(b.consumedAmount || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Purchase Orders</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>PO Number</th><th>Supplier</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && <EmptyRow colSpan={4}>No purchase orders yet.</EmptyRow>}
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="clickable" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                        <td className="mono">{o.poNumber}</td>
                        <td>{ref.supplierName(o.supplierId)}</td>
                        <td className="num">{money(o.totalAmount)}</td>
                        <td><StatusStamp status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="muted" style={{ fontSize: 12 }}>
              Payments tracking isn't built yet — this view covers verification and approval, not disbursement.
            </p>
          </>
        )}
      </div>
    </>
  );
}
