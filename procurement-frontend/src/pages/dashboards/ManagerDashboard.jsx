import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusStamp from '../../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../../components/Feedback';
import { getMyPendingApprovals } from '../../api/endpoints';
import useReferenceData from '../../hooks/useReferenceData';
import { useAuth } from '../../auth/AuthContext';
import { money } from '../../utils/format';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const ref = useReferenceData();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyPendingApprovals()
      .then(setPending)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPendingValue = pending.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
  const myRole = user?.roles?.find((r) => ['MANAGER', 'SENIOR_MANAGER', 'DEPARTMENT_HEAD'].includes(r));
  const roleLabel = { MANAGER: 'Manager', SENIOR_MANAGER: 'Senior Manager', DEPARTMENT_HEAD: 'Department Head' }[myRole] || 'Approver';

  return (
    <>
      <PageHeader
        title={`${roleLabel} Dashboard`}
        subtitle="Requisitions currently waiting on your decision"
      />
      <div className="content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Pending your approval</div>
                <div className="value num">{pending.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total value pending</div>
                <div className="value num">{money(totalPendingValue)}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Pending Approvals</h2>
                <Link className="btn btn-small" to="/requisitions">All requisitions</Link>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Requested by</th>
                      <th>Department</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && <EmptyRow colSpan={5}>Nothing waiting on you right now.</EmptyRow>}
                    {pending.map((r) => (
                      <tr key={r.id} className="clickable" onClick={() => navigate(`/requisitions/${r.id}`)}>
                        <td className="mono">{r.requisitionNumber}</td>
                        <td>{ref.employeeName(r.requestedBy)}</td>
                        <td>{ref.departmentName(r.departmentId)}</td>
                        <td className="num">{money(r.totalAmount)}</td>
                        <td><StatusStamp status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
