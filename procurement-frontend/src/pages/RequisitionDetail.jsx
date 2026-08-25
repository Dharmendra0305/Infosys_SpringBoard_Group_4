import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusStamp from '../components/StatusStamp';
import { Loading, ErrorBanner } from '../components/Feedback';
import { getRequisition, getRequisitionApprovals, decideRequisition } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { useAuth } from '../auth/AuthContext';
import { money } from '../utils/format';

const ROLE_LABELS = {
  MANAGER: 'Manager',
  SENIOR_MANAGER: 'Senior Manager',
  DEPARTMENT_HEAD: 'Department Head',
  FINANCE_APPROVER: 'Finance',
  CEO: 'CEO',
};

function roleLabel(roleName) {
  return ROLE_LABELS[roleName] || roleName;
}

export default function RequisitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ref = useReferenceData();
 const { user, hasRole } = useAuth();

  const [req, setReq] = useState(null);
  // Each item: { levelNumber, roleName, approverId, action, comments, actionDate }
  // The chain's length and roles depend on the requisition's amount (see the
  // amount-tiered approval_hierarchy_rules on the backend) so this is never
  // a fixed list - it comes straight from the API for this specific requisition.
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [deciding, setDeciding] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getRequisition(id), getRequisitionApprovals(id)])
      .then(([r, a]) => {
        setReq(r);
        setApprovals(a);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const pendingApproval = approvals.find(
    (a) => a.levelNumber === req?.currentApprovalLevel && a.action === 'PENDING'
  );
  const isMyTurn = pendingApproval && user && pendingApproval.approverId === user.employeeId;
  const currentStep = approvals.find((a) => a.levelNumber === req?.currentApprovalLevel);

  async function submitDecision(action) {
    if (!user) return;
    setError('');
    setDeciding(true);
    try {
      const updated = await decideRequisition(id, {
        action,
        approverId: user.employeeId,
        comments,
      });
      setReq(updated);
      setComments('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeciding(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Requisition" />
        <div className="content">
          <Loading />
        </div>
      </>
    );
  }

  if (error && !req) {
    return (
      <>
        <PageHeader title="Requisition" />
        <div className="content">
          <ErrorBanner message={error} />
        </div>
      </>
    );
  }

  const canConvert = req.status === 'APPROVED' && hasRole('PROCUREMENT_OFFICER');

  return (
    <>
      <PageHeader
        title={req.requisitionNumber}
        subtitle={`Requested by ${ref.employeeName(req.requestedBy)}`}
        actions={
          canConvert && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/purchase-orders/new', { state: { requisitionId: req.id } })}
            >
              Convert to purchase order
            </button>
          )
        }
      />
      <div className="content" style={{ maxWidth: 900 }}>
        <div className="breadcrumb">
          <Link to="/requisitions">Requisitions</Link> / {req.requisitionNumber}
        </div>

        <ErrorBanner message={error} />

        <div className="stat-row">
          <div className="stat-card">
            <div className="label">Status</div>
            <div className="value">
              <StatusStamp status={req.status} />
            </div>
          </div>
          <div className="stat-card">
            <div className="label">Total amount</div>
            <div className="value num">{money(req.totalAmount)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Approval level</div>
            <div className="value num">{req.currentApprovalLevel ?? '—'} of {approvals.length || '—'}</div>
          </div>
          <div className="stat-card">
            <div className="label">Department</div>
            <div className="value" style={{ fontSize: 15 }}>{ref.departmentName(req.departmentId)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Details</h2>
          </div>
          <div className="card-body">
            <div className="field-row">
              <div>
                <div className="section-title" style={{ margin: '0 0 4px' }}>Cost center</div>
                <div>{ref.costCenterName(req.costCenterId)}</div>
              </div>
              <div>
                <div className="section-title" style={{ margin: '0 0 4px' }}>Category</div>
                <div>{ref.categoryName(req.categoryId)}</div>
              </div>
              <div>
                <div className="section-title" style={{ margin: '0 0 4px' }}>Applied rule</div>
                <div className="mono">{req.appliedRuleId ? `#${req.appliedRuleId}` : '—'}</div>
              </div>
            </div>
            {req.justification && (
              <>
                <div className="section-title">Justification</div>
                <p style={{ margin: 0 }}>{req.justification}</p>
              </>
            )}
            {req.deliveryAddress && (
              <>
                <div className="section-title">Delivery address</div>
                <p style={{ margin: 0 }}>{req.deliveryAddress}</p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Approval chain</h2>
            <span className="muted" style={{ fontSize: 12.5 }}>
              {approvals.length} level{approvals.length === 1 ? '' : 's'} - set by requisition amount
            </span>
          </div>
          <div className="card-body">
            <div className="chain-strip">
              {approvals.map((approval, idx) => {
                const level = approval.levelNumber;
                const isRejectedHere = req.status === 'REJECTED' && level === req.currentApprovalLevel;
                const isDone =
                  level < req.currentApprovalLevel || req.status === 'APPROVED' || req.status === 'CONVERTED_TO_PO';
                const state = isRejectedHere ? 'rejected' : isDone ? 'approved' : 'pending';
                return (
                  <div className={`chain-node chain-${state}`} key={level}>
                    <div className="chain-badge">
                      {state === 'approved' ? '✓' : state === 'rejected' ? '✕' : level}
                    </div>
                    <div className="chain-role">{roleLabel(approval.roleName)}</div>
                    <div className="chain-approver">
                      {approval.approverId ? ref.employeeName(approval.approverId) : '—'}
                    </div>
                    {idx < approvals.length - 1 && <div className="chain-connector" />}
                  </div>
                );
              })}
              {approvals.length === 0 && <div className="muted">No approval chain recorded for this requisition.</div>}
            </div>
          </div>
        </div>

        {req.status === 'IN_APPROVAL' && (
          <div className="card">
            <div className="card-head">
              <h2>Record a decision — {currentStep ? roleLabel(currentStep.roleName) : `level ${req.currentApprovalLevel}`}</h2>
            </div>
            <div className="card-body">
              {isMyTurn ? (
                <>
                  <div className="field">
                    <label>Comments</label>
                    <input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Optional remarks" />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-approve" disabled={deciding} onClick={() => submitDecision('APPROVED')}>
                      Approve as {currentStep ? roleLabel(currentStep.roleName) : 'approver'}
                    </button>
                    <button className="btn btn-reject" disabled={deciding} onClick={() => submitDecision('REJECTED')}>
                      Reject requisition
                    </button>
                  </div>
                </>
              ) : (
                <div className="waiting-note">
                  Waiting on <strong>{pendingApproval ? ref.employeeName(pendingApproval.approverId) : 'the next approver'}</strong>
                  {' '}({currentStep ? roleLabel(currentStep.roleName) : '—'}) to sign in and act on this level.
                  {user && <> You're signed in as {user.firstName} {user.lastName}.</>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
