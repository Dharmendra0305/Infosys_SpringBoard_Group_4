import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { ErrorBanner, Loading } from '../components/Feedback';
import StatusStamp from '../components/StatusStamp';
import { getRequisitions, convertToPO } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { useAuth } from '../auth/AuthContext';
import { money } from '../utils/format';

export default function PurchaseOrderNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useReferenceData();
  const { user, hasRole } = useAuth();

  const [approvedReqs, setApprovedReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [requisitionId, setRequisitionId] = useState(location.state?.requisitionId ?? '');
  const [supplierId, setSupplierId] = useState('');
  const [createdBy, setCreatedBy] = useState(user?.employeeId ? String(user.employeeId) : '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRequisitions()
      .then((all) => setApprovedReqs(all.filter((r) => r.status === 'APPROVED')))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedReq = approvedReqs.find((r) => String(r.id) === String(requisitionId));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!requisitionId || !supplierId || !createdBy || !expectedDeliveryDate) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const po = await convertToPO({
        requisitionId: Number(requisitionId),
        supplierId: Number(supplierId),
        createdBy: Number(createdBy),
        expectedDeliveryDate,
      });
      navigate(`/purchase-orders/${po.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasRole('PROCUREMENT_OFFICER')) {
    return (
      <>
        <PageHeader title="Convert requisition to PO" />
        <div className="content" style={{ maxWidth: 720 }}>
          <div className="breadcrumb">
            <Link to="/purchase-orders">Purchase orders</Link> / New
          </div>
          <div className="card">
            <div className="card-body">
              <p className="muted" style={{ margin: 0 }}>
                Only a Procurement Officer can assign a supplier and raise a purchase order.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Convert requisition to PO" subtitle="Only APPROVED requisitions are eligible" />
      <div className="content" style={{ maxWidth: 720 }}>
        <div className="breadcrumb">
          <Link to="/purchase-orders">Purchase orders</Link> / New
        </div>

        {loading || ref.loading ? (
          <Loading />
        ) : (
          <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
              <ErrorBanner message={error} />

              <div className="field">
                <label>Requisition</label>
                <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)}>
                  <option value="">Select an approved requisition…</option>
                  {approvedReqs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.requisitionNumber} — {money(r.totalAmount)}
                    </option>
                  ))}
                </select>
                {approvedReqs.length === 0 && (
                  <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    No requisitions are currently APPROVED and waiting to be converted.
                  </p>
                )}
              </div>

              {selectedReq && (
                <div className="field">
                  <label>Status</label>
                  <StatusStamp status={selectedReq.status} />
                </div>
              )}

              <div className="field">
                <label>Supplier</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">Select supplier…</option>
                  {ref.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Expected delivery date</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create purchase order'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}