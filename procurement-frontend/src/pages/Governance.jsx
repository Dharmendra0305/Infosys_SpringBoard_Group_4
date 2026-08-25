import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import { getRoles, getEmployees } from '../api/endpoints';

export default function Governance() {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getRoles(), getEmployees()])
      .then(([r, e]) => {
        setRoles(r);
        setEmployees(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Governance" subtitle="Roles and employees — see Audit Trail for the action log" />
      <div className="content">
        <ErrorBanner message={error} />

        <div className="card">
          <div className="card-head">
            <h2>Roles</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 && <EmptyRow colSpan={2}>No roles configured.</EmptyRow>}
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.name}</td>
                      <td className="muted">{r.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Employees</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 && <EmptyRow colSpan={4}>No employees found.</EmptyRow>}
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td className="mono">{e.employeeCode}</td>
                      <td>
                        {e.firstName} {e.lastName}
                      </td>
                      <td className="muted">{e.email}</td>
                      <td className="muted">{e.designation || '—'}</td>
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
