/**
 * Mock Data Layer
 * ───────────────
 * Replace this file's exports with real API responses when backend is ready.
 * Every mock function simulates network delay for realistic UX.
 */

export const MOCK_DELAY = 400; // ms

export function delay(ms = MOCK_DELAY) {
  return new Promise((r) => setTimeout(r, ms));
}

// ──── Demo User ────
export const DEMO_USER = {
  id: 'usr_1a2b3c4d',
  name: 'Jai Aulakh',
  email: 'demo@ratelimiter.io',
  password: 'password', // only used in mock auth
  avatar: null,
  role: 'Developer',
  plan: 'Pro',
  createdAt: '2025-11-12T08:30:00Z',
  lastLogin: new Date().toISOString(),
};

// ──── API Keys ────
let nextKeyId = 4;
export let MOCK_API_KEYS = [
  {
    id: 'key_1',
    name: 'Production App',
    key: 'rl_live_a1b2c3d4e5f6g7h8i9j0',
    prefix: 'rl_live_a1b2...j0',
    createdAt: '2025-12-01T10:00:00Z',
    lastUsed: '2026-04-04T18:22:00Z',
    status: 'active',
    requests: 12847,
  },
  {
    id: 'key_2',
    name: 'Staging Server',
    key: 'rl_test_k1l2m3n4o5p6q7r8s9t0',
    prefix: 'rl_test_k1l2...t0',
    createdAt: '2026-01-15T14:30:00Z',
    lastUsed: '2026-04-03T09:10:00Z',
    status: 'active',
    requests: 3421,
  },
  {
    id: 'key_3',
    name: 'Old Mobile App',
    key: 'rl_live_u1v2w3x4y5z6a7b8c9d0',
    prefix: 'rl_live_u1v2...d0',
    createdAt: '2025-09-20T12:00:00Z',
    lastUsed: '2026-02-14T21:05:00Z',
    status: 'revoked',
    requests: 8910,
  },
];

export function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'rl_live_';
  for (let i = 0; i < 20; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export function addMockKey(name) {
  const key = generateApiKey();
  const newKey = {
    id: `key_${nextKeyId++}`,
    name,
    key,
    prefix: key.slice(0, 12) + '...' + key.slice(-2),
    createdAt: new Date().toISOString(),
    lastUsed: null,
    status: 'active',
    requests: 0,
  };
  MOCK_API_KEYS = [newKey, ...MOCK_API_KEYS];
  return newKey;
}

export function revokeMockKey(id) {
  MOCK_API_KEYS = MOCK_API_KEYS.map((k) =>
    k.id === id ? { ...k, status: 'revoked' } : k
  );
}

// ──── Analytics ────
function generateHourlyData(hours, base, variance) {
  const data = [];
  const now = new Date();
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now - i * 3600000);
    const success = Math.floor(base + Math.random() * variance);
    const limited = Math.floor(Math.random() * (success * 0.15));
    data.push({
      time: d.toISOString(),
      label: d.getHours().toString().padStart(2, '0') + ':00',
      success,
      limited,
      total: success + limited,
    });
  }
  return data;
}

export function getMockAnalytics(range = '24h') {
  const hours = range === '7d' ? 168 : range === '30d' ? 720 : 24;
  const bucketCount = range === '24h' ? 24 : range === '7d' ? 7 : 30;
  const rawData = generateHourlyData(hours, 120, 80);

  // Aggregate into buckets
  const bucketSize = Math.floor(hours / bucketCount);
  const buckets = [];
  for (let i = 0; i < bucketCount; i++) {
    const slice = rawData.slice(i * bucketSize, (i + 1) * bucketSize);
    const label =
      range === '24h'
        ? slice[0]?.label || ''
        : range === '7d'
          ? new Date(slice[0]?.time).toLocaleDateString('en-US', { weekday: 'short' })
          : new Date(slice[0]?.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.push({
      label,
      success: slice.reduce((s, d) => s + d.success, 0),
      limited: slice.reduce((s, d) => s + d.limited, 0),
      total: slice.reduce((s, d) => s + d.total, 0),
    });
  }

  const totalSuccess = buckets.reduce((s, b) => s + b.success, 0);
  const totalLimited = buckets.reduce((s, b) => s + b.limited, 0);

  return {
    buckets,
    summary: {
      totalRequests: totalSuccess + totalLimited,
      successfulRequests: totalSuccess,
      rateLimited: totalLimited,
      successRate: Math.round((totalSuccess / (totalSuccess + totalLimited)) * 100),
      avgResponseTime: Math.floor(45 + Math.random() * 30),
      peakRps: Math.floor(180 + Math.random() * 60),
    },
    topEndpoints: [
      { method: 'GET', path: '/api/users', requests: Math.floor(2000 + Math.random() * 1000), avgMs: 42 },
      { method: 'POST', path: '/api/data', requests: Math.floor(1200 + Math.random() * 800), avgMs: 68 },
      { method: 'GET', path: '/api/status', requests: Math.floor(800 + Math.random() * 500), avgMs: 12 },
      { method: 'PUT', path: '/api/config', requests: Math.floor(300 + Math.random() * 200), avgMs: 55 },
      { method: 'DELETE', path: '/api/keys', requests: Math.floor(50 + Math.random() * 50), avgMs: 38 },
    ],
  };
}

// ──── Settings ────
export const MOCK_SETTINGS = {
  rateLimiting: {
    maxRequests: 100,
    windowSeconds: 60,
    strategy: 'sliding-window',
  },
  notifications: {
    emailOnRateLimit: true,
    emailOnKeyRevoked: true,
    weeklyReport: false,
  },
  account: {
    timezone: 'UTC',
    theme: 'dark',
  },
};
