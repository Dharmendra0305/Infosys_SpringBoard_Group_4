import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import RoleDashboard from './pages/RoleDashboard';
import Requisitions from './pages/Requisitions';
import RequisitionNew from './pages/RequisitionNew';
import RequisitionDetail from './pages/RequisitionDetail';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderNew from './pages/PurchaseOrderNew';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import MasterData from './pages/MasterData';
import Reports from './pages/Reports';
import Statistics from './pages/Statistics';
import Governance from './pages/Governance';
import AuditTrail from './pages/AuditTrail';
import './styles/app.css';
import './styles/auth.css';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<RoleDashboard />} />
            <Route path="/requisitions" element={<Requisitions />} />
            <Route path="/requisitions/new" element={<RequisitionNew />} />
            <Route path="/requisitions/:id" element={<RequisitionDetail />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/new" element={<PurchaseOrderNew />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
