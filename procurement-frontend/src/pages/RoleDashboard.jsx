import { useAuth } from '../auth/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import CEODashboard from './dashboards/CEODashboard';
import FinanceDashboard from './dashboards/FinanceDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

// Priority matters: an employee can hold more than one role (e.g. the
// Procurement Officer is also ADMIN) - highest-authority view wins.
export default function RoleDashboard() {
  const { hasRole } = useAuth();

  if (hasRole('ADMIN')) return <AdminDashboard />;
  if (hasRole('CEO')) return <CEODashboard />;
  if (hasRole('FINANCE_APPROVER')) return <FinanceDashboard />;
  if (hasRole('MANAGER', 'SENIOR_MANAGER', 'DEPARTMENT_HEAD')) return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
