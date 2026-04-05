/**
 * Rate Limiter Service
 * ────────────────────
 * Mock implementation. Replace with fetchApi calls when backend is ready.
 */

import {
  delay,
  MOCK_API_KEYS,
  addMockKey,
  revokeMockKey,
  getMockAnalytics,
  MOCK_SETTINGS,
} from './mockData';
// import fetchApi from './api';

// ──── Sliding Window Rate Limiter (client-side mock) ────
const timestamps = [];

export function testRequest(maxRequests, windowMs, method, path) {
  const now = Date.now();
  while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length < maxRequests) {
    timestamps.push(now);
    return {
      allowed: true,
      status: 200,
      remaining: maxRequests - timestamps.length,
      total: maxRequests,
      retryAfter: null,
      method,
      path,
    };
  }

  const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
  return {
    allowed: false,
    status: 429,
    remaining: 0,
    total: maxRequests,
    retryAfter,
    method,
    path,
  };
}

export function resetLimiter() {
  timestamps.length = 0;
}

// ──── API Keys ────
export async function getApiKeys() {
  await delay();
  return [...MOCK_API_KEYS];
}

export async function createApiKey(name) {
  await delay(600);
  return addMockKey(name);
}

export async function revokeApiKey(id) {
  await delay(400);
  revokeMockKey(id);
  return { success: true };
}

// ──── Analytics ────
export async function getAnalytics(range = '24h') {
  await delay(500);
  return getMockAnalytics(range);
}

// ──── Settings ────
let currentSettings = { ...MOCK_SETTINGS };

export async function getSettings() {
  await delay(300);
  return { ...currentSettings };
}

export async function updateSettings(section, updates) {
  await delay(400);
  currentSettings = {
    ...currentSettings,
    [section]: { ...currentSettings[section], ...updates },
  };
  return { ...currentSettings };
}
