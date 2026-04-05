import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/rateLimiter';
import './Analytics.css';

const RANGES = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function Analytics() {
  const [range, setRange] = useState('24h');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnalytics(range).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [range]);

  const maxBucketValue = data
    ? Math.max(...data.buckets.map((b) => b.total), 1)
    : 1;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Monitor request volume and rate limiting activity</p>
      </div>

      {/* Range selector */}
      <div className="analytics-range">
        {RANGES.map((r) => (
          <button
            key={r.value}
            className={`analytics-range__btn ${range === r.value ? 'analytics-range__btn--active' : ''}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="analytics-loading">
          <div className="loading-spinner" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="analytics-stats">
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Total Requests</div>
              <div className="analytics-stat__value analytics-stat__value--primary">
                {data.summary.totalRequests.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Successful</div>
              <div className="analytics-stat__value analytics-stat__value--success">
                {data.summary.successfulRequests.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Rate Limited</div>
              <div className="analytics-stat__value analytics-stat__value--error">
                {data.summary.rateLimited.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Success Rate</div>
              <div className="analytics-stat__value analytics-stat__value--warning">
                {data.summary.successRate}%
              </div>
            </div>
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Avg Response</div>
              <div className="analytics-stat__value analytics-stat__value--primary">
                {data.summary.avgResponseTime}ms
              </div>
            </div>
            <div className="analytics-stat glass">
              <div className="analytics-stat__label">Peak RPS</div>
              <div className="analytics-stat__value analytics-stat__value--accent">
                {data.summary.peakRps}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="analytics-chart glass">
            <h3 className="analytics-chart__title">📊 Request Volume</h3>
            <div className="analytics-chart__bars">
              {data.buckets.map((bucket, i) => {
                const successPct = (bucket.success / maxBucketValue) * 100;
                const limitedPct = (bucket.limited / maxBucketValue) * 100;
                return (
                  <div key={i} className="analytics-bar-col">
                    <div className="analytics-bar" title={`${bucket.total} total`}>
                      <div
                        className="analytics-bar__fill analytics-bar__fill--limited"
                        style={{ height: `${limitedPct}%`, bottom: `${successPct}%` }}
                      />
                      <div
                        className="analytics-bar__fill analytics-bar__fill--success"
                        style={{ height: `${successPct}%` }}
                      />
                    </div>
                    <span className="analytics-bar__label">{bucket.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="analytics-chart__legend">
              <span className="analytics-legend">
                <span className="analytics-legend__dot analytics-legend__dot--success" /> Successful
              </span>
              <span className="analytics-legend">
                <span className="analytics-legend__dot analytics-legend__dot--limited" /> Rate Limited
              </span>
            </div>
          </div>

          {/* Top Endpoints */}
          <div className="analytics-endpoints glass">
            <h3 className="analytics-chart__title">🔥 Top Endpoints</h3>
            <table className="analytics-ep-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Requests</th>
                  <th>Avg Response</th>
                  <th>Load</th>
                </tr>
              </thead>
              <tbody>
                {data.topEndpoints.map((ep, i) => {
                  const maxReqs = Math.max(...data.topEndpoints.map((e) => e.requests));
                  const pct = Math.round((ep.requests / maxReqs) * 100);
                  return (
                    <tr key={i}>
                      <td className="analytics-ep__name">
                        <span className={`analytics-ep__method analytics-ep__method--${ep.method.toLowerCase()}`}>
                          {ep.method}
                        </span>
                        {ep.path}
                      </td>
                      <td className="analytics-ep__reqs">{ep.requests.toLocaleString()}</td>
                      <td className="analytics-ep__ms">{ep.avgMs}ms</td>
                      <td className="analytics-ep__bar-cell">
                        <div className="analytics-ep__bar">
                          <div className="analytics-ep__bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
