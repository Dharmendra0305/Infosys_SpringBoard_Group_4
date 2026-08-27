import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusStamp from '../../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../../components/Feedback';
import { getMyPendingApprovals, getSuppliers, getSpendSummary } from '../../api/endpoints';
import useReferenceData from '../../hooks/useReferenceData';
import { money } from '../../utils/format';

export default function CEODashboard() {
  const ref = useReferenceData();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [spend, setSpend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMyPendingApprovals(), getSuppliers(), getSpendSummary()])
      .then(([p, s, sp]) => {
        setPending(p);
        setSuppliers(s);
        setSpend(sp);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalTrackedSpend = spend.reduce((sum, s) => sum + Number(s.totalSpend || 0), 0);
  const topVendors = [...suppliers].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 6);

  return (
    <>
      <PageHeader title="CEO Dashboard" subtitle="Final approvals, procurement analytics, and vendor standing" />
      <div className="content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Awaiting your final approval</div>
                <div className="value num">{pending.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total tracked spend</div>
                <div className="value num">{money(totalTrackedSpend)}</div>
              </div>
              <div className="stat-card">
                <div className="label">Active suppliers</div>
                <div className="value num">{suppliers.filter((s) => s.status === 'ACTIVE').length}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Pending Final Approvals</h2>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Number</th><th>Department</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && <EmptyRow colSpan={4}>Nothing awaiting your sign-off right now.</EmptyRow>}
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
                <h2>Vendor Standing</h2>
                <span className="muted" style={{ fontSize: 12 }}>by rating — full performance analytics not built yet</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Supplier</th><th>Status</th><th>Payment terms</th><th>Rating</th></tr>
                  </thead>
                  <tbody>
                    {topVendors.length === 0 && <EmptyRow colSpan={4}>No suppliers recorded yet.</EmptyRow>}
                    {topVendors.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td><StatusStamp status={s.status} /></td>
                        <td className="muted">{s.paymentTerms || '—'}</td>
                        <td className="num">{s.rating ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Link className="btn" to="/statistics">Open full spend analytics →</Link>
          </>
        )}
      </div>
    </>
  );
}
