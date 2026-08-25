import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Loading, ErrorBanner } from '../components/Feedback';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import { getStatistics } from '../api/endpoints';
import { money } from '../utils/format';

// Live from GET /api/statistics (current month by default) - no hardcoded
// or pre-aggregated data. The backend computes everything straight from
// purchase_orders, joined through the requisition to the department.
export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  function load(silent) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    getStatistics()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => load(false), []);

  const { pieData, lineSeries, hasAnySpend } = useMemo(() => {
    if (!stats) return { pieData: [], lineSeries: [], hasAnySpend: false };

    const pie = stats.departmentBreakdown.map((d) => ({ label: d.department, value: Number(d.spend) }));

    const series = stats.monthlyTrend.departments.map((d) => ({
      label: d.name,
      points: stats.monthlyTrend.months.map((m, i) => ({ x: m, y: Number(d.values[i] || 0) })),
    }));

    const anySpend = stats.monthlyTrend.departments.some((d) => d.values.some((v) => Number(v) > 0));

    return { pieData: pie, lineSeries: series, hasAnySpend: anySpend || pie.length > 0 };
  }, [stats]);

  const totalSpend = stats ? Number(stats.totalSpend) : 0;

  return (
    <>
      <PageHeader
        title="Statistics"
        subtitle={stats ? `Department-wise spend for ${stats.period}, and the trend leading up to it` : 'Department-wise spend'}
        actions={
          <button className="btn" onClick={() => load(true)} disabled={loading || refreshing}>
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        }
      />
      <div className="content">
        <ErrorBanner message={error} />

        {loading ? (
          <Loading />
        ) : !stats || !hasAnySpend ? (
          <div className="card">
            <div className="card-body empty-row">No purchase order spend recorded yet.</div>
          </div>
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Period</div>
                <div className="value" style={{ fontSize: 16 }}>{stats.period}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total spend this month</div>
                <div className="value num">{money(totalSpend)}</div>
              </div>
              <div className="stat-card">
                <div className="label">Departments spending</div>
                <div className="value num">{stats.departmentsSpending}</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="card">
                <div className="card-head">
                  <h2>Spend by department — {stats.period}</h2>
                </div>
                <div className="card-body">
                  {pieData.length === 0 ? (
                    <p className="muted" style={{ margin: 0 }}>No department spend this month yet.</p>
                  ) : (
                    <PieChart data={pieData} />
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h2>Department breakdown</h2>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Department</th><th>Spend</th><th>Share</th></tr>
                    </thead>
                    <tbody>
                      {stats.departmentBreakdown.length === 0 && (
                        <tr className="empty-row"><td colSpan={3}>No department spend this month yet.</td></tr>
                      )}
                      {stats.departmentBreakdown.map((d) => (
                        <tr key={d.department}>
                          <td>{d.department}</td>
                          <td className="num">{money(d.spend)}</td>
                          <td className="num muted">{d.share.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Monthly spend trend by department</h2>
              </div>
              <div className="card-body">
                {lineSeries.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>Not enough history yet to chart a trend.</p>
                ) : (
                  <LineChart series={lineSeries} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
