import { useState, useRef, useCallback } from 'react';
import { testRequest, resetLimiter } from '../services/rateLimiter';
import './Dashboard.css';

const ENDPOINTS = [
  { label: 'GET  /api/users', value: '/api/users', method: 'GET' },
  { label: 'POST /api/data', value: '/api/data', method: 'POST' },
  { label: 'GET  /api/status', value: '/api/status', method: 'GET' },
  { label: 'PUT  /api/config', value: '/api/config', method: 'PUT' },
];

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export default function Dashboard() {
  const [maxReqs, setMaxReqs] = useState(10);
  const [windowSec, setWindowSec] = useState(60);
  const [endpoint, setEndpoint] = useState(ENDPOINTS[0].value);

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ success: 0, limited: 0, total: 0 });
  const [remaining, setRemaining] = useState(null);
  const [isBursting, setIsBursting] = useState(false);
  const burstRef = useRef(false);

  const addLog = useCallback((entry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const fireRequest = useCallback(() => {
    const ep = ENDPOINTS.find((e) => e.value === endpoint) || ENDPOINTS[0];
    const result = testRequest(maxReqs, windowSec * 1000, ep.method, ep.value);

    if (result.allowed) {
      addLog({
        id: Date.now() + Math.random(),
        time: ts(),
        status: result.remaining <= 2 ? 299 : 200,
        type: result.remaining <= 2 ? 'warning' : 'success',
        msg: `${ep.method} ${ep.value} → 200 OK  (${result.remaining}/${result.total} remaining)`,
      });
      setStats((s) => ({ success: s.success + 1, limited: s.limited, total: s.total + 1 }));
    } else {
      addLog({
        id: Date.now() + Math.random(),
        time: ts(),
        status: 429,
        type: 'error',
        msg: `${ep.method} ${ep.value} → 429 Too Many Requests  (retry in ${result.retryAfter}s)`,
      });
      setStats((s) => ({ success: s.success, limited: s.limited + 1, total: s.total + 1 }));
    }

    setRemaining({ used: result.total - result.remaining, total: result.total });
  }, [maxReqs, windowSec, endpoint, addLog]);

  const handleBurst = useCallback(() => {
    if (isBursting) return;
    setIsBursting(true);
    burstRef.current = true;
    let count = 0;
    const max = maxReqs + 5;
    const interval = setInterval(() => {
      if (!burstRef.current || count >= max) {
        clearInterval(interval);
        setIsBursting(false);
        burstRef.current = false;
        return;
      }
      fireRequest();
      count++;
    }, 120);
  }, [isBursting, maxReqs, fireRequest]);

  const handleReset = useCallback(() => {
    burstRef.current = false;
    setIsBursting(false);
    setLogs([]);
    setStats({ success: 0, limited: 0, total: 0 });
    setRemaining(null);
    resetLimiter();
  }, []);

  const usedPct = remaining ? Math.min((remaining.used / remaining.total) * 100, 100) : 0;
  const barClass =
    usedPct >= 90
      ? 'dash-bar__fill--danger'
      : usedPct >= 60
        ? 'dash-bar__fill--warning'
        : 'dash-bar__fill--ok';

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Test and visualize API rate limiting in real time</p>
      </div>

      {/* Config */}
      <section className="dash-card glass" id="config-panel">
        <h2 className="dash-card__title">
          <span>⚙️</span> Configuration
        </h2>
        <div className="dash-config-grid">
          <div className="dash-field">
            <label htmlFor="max-requests">Max Requests</label>
            <input
              id="max-requests"
              type="number"
              min={1}
              max={1000}
              value={maxReqs}
              onChange={(e) => setMaxReqs(Math.max(1, +e.target.value))}
            />
          </div>
          <div className="dash-field">
            <label htmlFor="window-seconds">Window (seconds)</label>
            <input
              id="window-seconds"
              type="number"
              min={1}
              max={3600}
              value={windowSec}
              onChange={(e) => setWindowSec(Math.max(1, +e.target.value))}
            />
          </div>
          <div className="dash-field">
            <label htmlFor="endpoint-select">Endpoint</label>
            <select id="endpoint-select" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
              {ENDPOINTS.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="dash-actions">
        <button id="send-request-btn" className="btn btn--primary" onClick={fireRequest} disabled={isBursting}>
          🚀 Send Request
        </button>
        <button id="burst-btn" className="btn btn--secondary" onClick={handleBurst} disabled={isBursting}>
          {isBursting ? (
            <>
              <span className="btn-spinner" /> Sending…
            </>
          ) : (
            <>⚡ Burst Test ({maxReqs + 5} reqs)</>
          )}
        </button>
        <button id="reset-btn" className="btn btn--danger" onClick={handleReset}>
          🔄 Reset
        </button>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat glass">
          <div className="dash-stat__label">Total Requests</div>
          <div className="dash-stat__value dash-stat__value--primary">{stats.total}</div>
        </div>
        <div className="dash-stat glass">
          <div className="dash-stat__label">Successful (2xx)</div>
          <div className="dash-stat__value dash-stat__value--success">{stats.success}</div>
        </div>
        <div className="dash-stat glass">
          <div className="dash-stat__label">Rate Limited (429)</div>
          <div className="dash-stat__value dash-stat__value--error">{stats.limited}</div>
        </div>
        <div className="dash-stat glass">
          <div className="dash-stat__label">Success Rate</div>
          <div className="dash-stat__value dash-stat__value--warning">
            {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100}%
          </div>
        </div>
      </div>

      {/* Rate Bar */}
      <div className="dash-card glass">
        <h2 className="dash-card__title">📊 Rate Limit Usage</h2>
        <div className="dash-bar">
          <div className={`dash-bar__fill ${barClass}`} style={{ width: `${usedPct}%` }} />
        </div>
        <div className="dash-bar__text">
          <span>{remaining ? `${remaining.used} / ${remaining.total} used` : 'No requests yet'}</span>
          <span>{Math.round(usedPct)}%</span>
        </div>
      </div>

      {/* Log */}
      <section className="dash-card glass" id="log-panel">
        <h2 className="dash-card__title">📋 Request Log</h2>
        <div className="dash-log">
          {logs.length === 0 ? (
            <div className="dash-log__empty">No requests yet — click "Send Request" to begin.</div>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className={`dash-log__entry dash-log__entry--${entry.type}`}>
                <span className="dash-log__time">{entry.time}</span>
                <span className="dash-log__status">{entry.status}</span>
                <span className="dash-log__msg">{entry.msg}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
