import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusStamp from '../components/StatusStamp';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import { getPurchaseOrders } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { useAuth } from '../auth/AuthContext';
import { money, date } from '../utils/format';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ref = useReferenceData();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    getPurchaseOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Purchase orders"
        subtitle="Orders raised against approved requisitions"
        actions={
          hasRole('PROCUREMENT_OFFICER') && (
            <button className="btn btn-primary" onClick={() => navigate('/purchase-orders/new')}>
              Convert a requisition
            </button>
          )
        }
      />
      <div className="content">
        <ErrorBanner message={error} />
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO number</th>
                    <th>Supplier</th>
                    <th>Requisition</th>
                    <th>Amount</th>
                    <th>Expected delivery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && <EmptyRow colSpan={6}>No purchase orders yet.</EmptyRow>}
                  {orders.map((o) => (
                    <tr key={o.id} className="clickable" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                      <td className="mono">{o.poNumber}</td>
                      <td>{ref.supplierName(o.supplierId)}</td>
                      <td className="mono muted">REQ #{o.requisitionId}</td>
                      <td className="num">{money(o.totalAmount)}</td>
                      <td className="muted">{date(o.expectedDeliveryDate)}</td>
                      <td>
                        <StatusStamp status={o.status} />
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