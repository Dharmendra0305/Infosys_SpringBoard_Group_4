import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Loading, ErrorBanner, EmptyRow } from '../components/Feedback';
import { getSpendSummary, getBudgetAllocations } from '../api/endpoints';
import useReferenceData from '../hooks/useReferenceData';
import { money } from '../utils/format';

export default function Reports() {
  const [spend, setSpend] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const ref = useReferenceData();

  function load(silent) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    Promise.all([getSpendSummary(), getBudgetAllocations()])
      .then(([s, b]) => {
        setSpend(s);
        setBudgets(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => load(false), []);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Spend summary and budget consumption"
        actions={
          <button className="btn" onClick={() => load(true)} disabled={loading || refreshing}>
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        }
      />
      <div className="content">
        <ErrorBanner message={error} />

        <div className="card">
          <div className="card-head">
            <h2>Spend summary</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Category</th>
                    <th>Period</th>
                    <th>Total spend</th>
                    <th>PO count</th>
                  </tr>
                </thead>
                <tbody>
                  {spend.length === 0 && <EmptyRow colSpan={5}>No spend summary generated yet.</EmptyRow>}
                  {spend.map((s) => (
                    <tr key={s.id}>
                      <td>{ref.departmentName(s.departmentId)}</td>
                      <td>{ref.categoryName(s.categoryId)}</td>
                      <td className="mono muted">
                        {s.fiscalYear}-{String(s.fiscalMonth).padStart(2, '0')}
                      </td>
                      <td className="num">{money(s.totalSpend)}</td>
                      <td className="num">{s.poCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Budget allocations</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <Loading />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Cost center</th>
                    <th>Category</th>
                    <th>Fiscal year</th>
                    <th>Allocated</th>
                    <th>Consumed</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.length === 0 && <EmptyRow colSpan={7}>No budget allocations yet.</EmptyRow>}
                  {budgets.map((b) => {
                    const allocated = Number(b.allocatedAmount || 0);
                    const consumed = Number(b.consumedAmount || 0);
                    const remaining = allocated - consumed;
                    const pct = allocated ? Math.min(100, Math.round((consumed / allocated) * 100)) : 0;
                    return (
                      <tr key={b.id}>
                        <td>{ref.departmentName(b.departmentId)}</td>
                        <td>{ref.costCenterName(b.costCenterId)}</td>
                        <td>{b.categoryId ? ref.categoryName(b.categoryId) : <span className="muted">All</span>}</td>
                        <td className="mono muted">{b.fiscalYear}</td>
                        <td className="num">{money(allocated)}</td>
                        <td className="num">
                          {money(consumed)} <span className="muted">({pct}%)</span>
                        </td>
                        <td className="num">{money(remaining)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
