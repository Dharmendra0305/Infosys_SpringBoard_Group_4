import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { Loading, ErrorBanner } from '../../components/Feedback';
import {
  getDepartments, getSuppliers, getCategories, getEmployees,
  getRequisitions, getPurchaseOrders,
} from '../../api/endpoints';
import { money } from '../../utils/format';

const QUICK_LINKS = [
  { to: '/master-data', title: 'Departments, Categories & Suppliers', desc: 'Manage master data records' },
  { to: '/governance', title: 'Employees & Roles', desc: 'View the org chart and role assignments' },
  { to: '/governance', title: 'Audit Logs', desc: 'Every recorded action, by entity and employee' },
  { to: '/reports', title: 'Reports', desc: 'Budget allocations and spend summaries' },
  { to: '/statistics', title: 'Procurement Analytics', desc: 'Spend by department, monthly trend' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDepartments(), getSuppliers(), getCategories(), getEmployees(), getRequisitions(), getPurchaseOrders()])
      .then(([departments, suppliers, categories, employees, requisitions, orders]) => {
        setData({ departments, suppliers, categories, employees, requisitions, orders });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeRequisitions = data?.requisitions.filter((r) => r.status === 'IN_APPROVAL').length ?? 0;
  const openPOs = data?.orders.filter((o) => !['CLOSED', 'CANCELLED'].includes(o.status)).length ?? 0;
  const totalCommitted = data?.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) ?? 0;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Organization-wide view — master data, people, and spend" />
      <div className="content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Departments</div>
                <div className="value num">{data.departments.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Employees</div>
                <div className="value num">{data.employees.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Active suppliers</div>
                <div className="value num">{data.suppliers.filter((s) => s.status === 'ACTIVE').length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Categories</div>
                <div className="value num">{data.categories.length}</div>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Requisitions in approval</div>
                <div className="value num">{activeRequisitions}</div>
              </div>
              <div className="stat-card">
                <div className="label">Open purchase orders</div>
                <div className="value num">{openPOs}</div>
              </div>
              <div className="stat-card">
                <div className="label">Committed spend</div>
                <div className="value num">{money(totalCommitted)}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Manage</h2>
              </div>
              <div className="card-body quick-link-grid">
                {QUICK_LINKS.map((link) => (
                  <Link className="quick-link-card" to={link.to} key={link.title}>
                    <div className="quick-link-title">{link.title}</div>
                    <div className="quick-link-desc">{link.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
