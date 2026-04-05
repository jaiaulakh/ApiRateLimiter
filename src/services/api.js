/**
 * API Client
 * ──────────
 * Centralized fetch wrapper. When backend is ready:
 *   1. Set BASE_URL to your API server
 *   2. Remove mock interceptors from service files
 *   3. Everything else stays the same
 */

const BASE_URL = ''; // e.g. 'https://api.yourdomain.com'

/**
 * Make an authenticated API request.
 * @param {string} endpoint  - e.g. '/auth/login'
 * @param {object} options   - { method, body, headers }
 * @returns {Promise<any>}
 */
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('rl_token');

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401) {
    localStorage.removeItem('rl_token');
    localStorage.removeItem('rl_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

export default fetchApi;
