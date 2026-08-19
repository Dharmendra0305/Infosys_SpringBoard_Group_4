import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusStamp from '../components/StatusStamp';
import { Loading, ErrorBanner } from '../components/Feedback';
import { getPurchaseOrders, updatePOStatus, receiveGoods } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { useAuth } from '../auth/AuthContext';
import { money, date } from '../utils/format';

const NEXT_STATUS = {
  CREATED: ['SENT', 'CANCELLED'],
  SENT: ['ACKNOWLEDGED', 'DISPUTED', 'CANCELLED'],
  ACKNOWLEDGED: ['PARTIALLY_DELIVERED', 'DELIVERED', 'DISPUTED'],
  PARTIALLY_DELIVERED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['CLOSED'],
  DISPUTED: ['SENT', 'CANCELLED'],
};

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const ref = useReferenceData();
  const { user } = useAuth();

  const [po, setPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changedBy, setChangedBy] = useState(user?.employeeId ? String(user.employeeId) : '');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    // Backend only exposes a list endpoint for POs, so find this one from it.
    getPurchaseOrders()
      .then((all) => {
        const found = all.find((o) => String(o.id) === String(id));
        if (!found) throw new Error(`Purchase order ${id} not found`);
        setPO(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(status) {
    if (!changedBy) {
      setError('Select who is making this change.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const updated = await updatePOStatus(id, { status, changedBy, remarks });
      setPO(updated);
      setRemarks('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Purchase order" />
        <div className="content">
          <Loading />
        </div>
      </>
    );
  }

  if (error && !po) {
    return (
      <>
        <PageHeader title="Purchase order" />
        <div className="content">
          <ErrorBanner message={error} />
        </div>
      </>
    );
  }

  const nextOptions = NEXT_STATUS[po.status] || [];

  return (
    <>
      <PageHeader title={po.poNumber} subtitle={`Supplier: ${ref.supplierName(po.supplierId)}`} />
      <div className="content" style={{ maxWidth: 900 }}>
        <div className="breadcrumb">
          <Link to="/purchase-orders">Purchase orders</Link> / {po.poNumber}
        </div>

        <ErrorBanner message={error} />

        <div className="stat-row">
          <div className="stat-card">
            <div className="label">Status</div>
            <div className="value">
              <StatusStamp status={po.status} />
            </div>
          </div>
          <div className="stat-card">
            <div className="label">Total amount</div>
            <div className="value num">{money(po.totalAmount)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Expected delivery</div>
            <div className="value" style={{ fontSize: 15 }}>{date(po.expectedDeliveryDate)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Source requisition</div>
            <div className="value mono" style={{ fontSize: 15 }}>#{po.requisitionId}</div>
          </div>
        </div>

        {po.deliveryAddress && (
          <div className="card">
            <div className="card-head">
              <h2>Delivery address</h2>
            </div>
            <div className="card-body">
              <p style={{ margin: 0 }}>{po.deliveryAddress}</p>
            </div>
          </div>
        )}

        {nextOptions.length > 0 && (
          <div className="card">
            <div className="card-head">
              <h2>Update status</h2>
            </div>
            <div className="card-body">
              <div className="field-row">
                <div className="field">
                  <label>Changed by</label>
                  <select value={changedBy} onChange={(e) => setChangedBy(e.target.value)}>
                    <option value="">Select employee…</option>
                    {ref.employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label>Remarks</label>
                  <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="form-actions">
                {nextOptions.map((status) => (
                  <button
                    key={status}
                    className={`btn ${status === 'CANCELLED' || status === 'DISPUTED' ? 'btn-reject' : 'btn-primary'}`}
                    disabled={busy}
                    onClick={() => handleStatusChange(status)}
                  >
                    Mark {status.replace(/_/g, ' ').toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {['CREATED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_DELIVERED'].includes(po.status) ? (
          <ReceiveGoodsCard poId={po.id} employees={ref.employees} onError={setError} currentUserId={user?.employeeId} />
        ) : (
          <div className="card">
            <div className="card-head">
              <h2>Goods receipt</h2>
            </div>
            <div className="card-body">
              <p className="muted" style={{ margin: 0 }}>
                {po.status === 'DELIVERED'
                  ? 'All goods on this order have been received and verified. Close the order once you\'re done reconciling it.'
                  : `This order is ${po.status.toLowerCase()} and can't receive goods right now.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ReceiveGoodsCard({ poId, employees, onError, currentUserId }) {
  const [poLineItemId, setPoLineItemId] = useState('');
  const [quantityReceived, setQuantityReceived] = useState('');
  const [receivedBy, setReceivedBy] = useState(currentUserId ? String(currentUserId) : '');
  const [conditionNotes, setConditionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    onError('');
    if (!poLineItemId || !quantityReceived || !receivedBy) {
      onError('PO line item id, quantity, and receiver are required.');
      return;
    }
    setSubmitting(true);
    try {
      const receipt = await receiveGoods(poId, {
        poLineItemId,
        quantityReceived,
        receivedBy,
        conditionNotes,
      });
      setLastReceipt(receipt);
      setPoLineItemId('');
      setQuantityReceived('');
      setConditionNotes('');
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>Record goods receipt</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>PO line item ID</label>
              <input
                type="number"
                value={poLineItemId}
                onChange={(e) => setPoLineItemId(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div className="field">
              <label>Quantity received</label>
              <input
                type="number"
                min="1"
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Received by</label>
              <select value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Condition notes</label>
              <input value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording…' : 'Record receipt'}
            </button>
          </div>
        </form>

        {lastReceipt && (
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Recorded receipt <span className="mono">{lastReceipt.receiptNumber}</span> on {date(lastReceipt.receivedDate)}.
          </p>
        )}
      </div>
    </div>
  );
}
