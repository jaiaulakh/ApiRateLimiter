import { useState, useEffect, useCallback } from 'react';
import { getApiKeys, createApiKey, revokeApiKey } from '../services/rateLimiter';
import './ApiKeys.css';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApiKeys();
      setKeys(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const key = await createApiKey(newKeyName.trim());
      setKeys((prev) => [key, ...prev]);
      setNewKeyName('');
      setShowForm(false);
      setRevealedId(key.id);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    await revokeApiKey(id);
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)));
  };

  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="apikeys-page">
      <div className="page-header">
        <h1>API Keys</h1>
        <p>Manage your API keys for authentication</p>
      </div>

      {/* Create key */}
      <div className="apikeys-toolbar">
        {showForm ? (
          <form className="apikeys-create glass" onSubmit={handleCreate}>
            <input
              id="new-key-name"
              type="text"
              placeholder="Key name (e.g. Production App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn--primary" disabled={creating || !newKeyName.trim()}>
              {creating ? 'Creating…' : 'Create Key'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button id="create-key-btn" className="btn btn--primary" onClick={() => setShowForm(true)}>
            ＋ Create New Key
          </button>
        )}
      </div>

      {/* Keys table */}
      <div className="apikeys-table-wrap glass">
        {loading ? (
          <div className="apikeys-loading">
            <div className="loading-spinner" />
          </div>
        ) : keys.length === 0 ? (
          <div className="apikeys-empty">No API keys yet. Create one to get started.</div>
        ) : (
          <table className="apikeys-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Status</th>
                <th>Requests</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className={k.status === 'revoked' ? 'apikeys-table__row--revoked' : ''}>
                  <td className="apikeys-table__name">{k.name}</td>
                  <td className="apikeys-table__key">
                    <code>{revealedId === k.id ? k.key : k.prefix}</code>
                    {k.status === 'active' && (
                      <button
                        className="apikeys-table__peek"
                        onClick={() => setRevealedId(revealedId === k.id ? null : k.id)}
                        title={revealedId === k.id ? 'Hide' : 'Reveal'}
                      >
                        {revealedId === k.id ? '🙈' : '👁️'}
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`apikeys-badge apikeys-badge--${k.status}`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="apikeys-table__reqs">{k.requests.toLocaleString()}</td>
                  <td className="apikeys-table__date">{formatDate(k.createdAt)}</td>
                  <td className="apikeys-table__actions">
                    {k.status === 'active' && (
                      <>
                        <button
                          className="apikeys-action"
                          onClick={() => handleCopy(k.key, k.id)}
                          title="Copy key"
                        >
                          {copiedId === k.id ? '✅' : '📋'}
                        </button>
                        <button
                          className="apikeys-action apikeys-action--danger"
                          onClick={() => handleRevoke(k.id)}
                          title="Revoke key"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
