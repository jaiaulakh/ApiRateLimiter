import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/rateLimiter';
import './Settings.css';

const STRATEGIES = [
  { value: 'sliding-window', label: 'Sliding Window' },
  { value: 'fixed-window', label: 'Fixed Window' },
  { value: 'token-bucket', label: 'Token Bucket' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [saveMsg, setSaveMsg] = useState({ section: '', text: '', type: '' });

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (section, updates) => {
    setSaving(section);
    setSaveMsg({ section: '', text: '', type: '' });
    try {
      const updated = await updateSettings(section, updates);
      setSettings(updated);
      setSaveMsg({ section, text: 'Saved', type: 'success' });
    } catch (err) {
      setSaveMsg({ section, text: err.message, type: 'error' });
    } finally {
      setSaving('');
      setTimeout(() => setSaveMsg({ section: '', text: '', type: '' }), 2500);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Configure your rate limiter</p>
        </div>
        <div className="analytics-loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const rl = settings.rateLimiting;
  const notif = settings.notifications;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure rate limiting rules and preferences</p>
      </div>

      {/* Rate Limiting */}
      <section className="settings-section glass">
        <div className="settings-section__header">
          <div>
            <h2>⚡ Rate Limiting</h2>
            <p>Global rate limiting configuration</p>
          </div>
          {saveMsg.section === 'rateLimiting' && (
            <span className={`settings-msg settings-msg--${saveMsg.type}`}>{saveMsg.text}</span>
          )}
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>Max Requests</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={rl.maxRequests}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  rateLimiting: { ...s.rateLimiting, maxRequests: Math.max(1, +e.target.value) },
                }))
              }
            />
            <span className="settings-field__hint">Per time window per key</span>
          </div>

          <div className="settings-field">
            <label>Window (seconds)</label>
            <input
              type="number"
              min={1}
              max={86400}
              value={rl.windowSeconds}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  rateLimiting: { ...s.rateLimiting, windowSeconds: Math.max(1, +e.target.value) },
                }))
              }
            />
            <span className="settings-field__hint">Time window duration</span>
          </div>

          <div className="settings-field">
            <label>Strategy</label>
            <select
              value={rl.strategy}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  rateLimiting: { ...s.rateLimiting, strategy: e.target.value },
                }))
              }
            >
              {STRATEGIES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <span className="settings-field__hint">Rate limiting algorithm</span>
          </div>
        </div>

        <div className="settings-section__footer">
          <button
            className="btn btn--primary"
            onClick={() => handleUpdate('rateLimiting', rl)}
            disabled={saving === 'rateLimiting'}
          >
            {saving === 'rateLimiting' ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-section glass">
        <div className="settings-section__header">
          <div>
            <h2>🔔 Notifications</h2>
            <p>Email and alert preferences</p>
          </div>
          {saveMsg.section === 'notifications' && (
            <span className={`settings-msg settings-msg--${saveMsg.type}`}>{saveMsg.text}</span>
          )}
        </div>

        <div className="settings-toggles">
          <div className="settings-toggle">
            <div>
              <div className="settings-toggle__label">Rate Limit Alerts</div>
              <div className="settings-toggle__desc">Get emailed when a key exceeds rate limits</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notif.emailOnRateLimit}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, emailOnRateLimit: e.target.checked },
                  }))
                }
              />
              <span className="toggle__slider" />
            </label>
          </div>

          <div className="settings-toggle">
            <div>
              <div className="settings-toggle__label">Key Revocation Alerts</div>
              <div className="settings-toggle__desc">Get notified when an API key is revoked</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notif.emailOnKeyRevoked}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, emailOnKeyRevoked: e.target.checked },
                  }))
                }
              />
              <span className="toggle__slider" />
            </label>
          </div>

          <div className="settings-toggle">
            <div>
              <div className="settings-toggle__label">Weekly Report</div>
              <div className="settings-toggle__desc">Receive a weekly usage summary</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notif.weeklyReport}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, weeklyReport: e.target.checked },
                  }))
                }
              />
              <span className="toggle__slider" />
            </label>
          </div>
        </div>

        <div className="settings-section__footer">
          <button
            className="btn btn--primary"
            onClick={() => handleUpdate('notifications', notif)}
            disabled={saving === 'notifications'}
          >
            {saving === 'notifications' ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section settings-section--danger glass">
        <div className="settings-section__header">
          <div>
            <h2>⚠️ Danger Zone</h2>
            <p>Irreversible account actions</p>
          </div>
        </div>
        <div className="settings-danger-actions">
          <div className="settings-danger-item">
            <div>
              <div className="settings-toggle__label">Delete Account</div>
              <div className="settings-toggle__desc">
                Permanently delete your account and all data. This cannot be undone.
              </div>
            </div>
            <button className="btn btn--danger">Delete Account</button>
          </div>
        </div>
      </section>
    </div>
  );
}
