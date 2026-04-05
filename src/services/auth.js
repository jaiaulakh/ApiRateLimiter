/**
 * Auth Service
 * ────────────
 * Mock implementation. Replace body of each function with:
 *   return fetchApi('/auth/login', { method: 'POST', body: { email, password } });
 */

import { delay, DEMO_USER } from './mockData';
// import fetchApi from './api';  // uncomment when backend is ready

function generateMockToken(user) {
  return btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }));
}

export async function login(email, password) {
  await delay(600);

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const token = generateMockToken(DEMO_USER);
    const user = { ...DEMO_USER };
    delete user.password;
    return { user, token };
  }

  throw new Error('Invalid email or password');
}

export async function signup(name, email, password) {
  await delay(800);

  if (email === DEMO_USER.email) {
    throw new Error('An account with this email already exists');
  }

  const user = {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    name,
    email,
    avatar: null,
    role: 'Developer',
    plan: 'Free',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  const token = generateMockToken(user);
  return { user, token };
}

export async function updateProfile(updates) {
  await delay(500);
  // Mock: just return the updates merged with current user
  const stored = JSON.parse(localStorage.getItem('rl_user') || '{}');
  const updated = { ...stored, ...updates };
  localStorage.setItem('rl_user', JSON.stringify(updated));
  return updated;
}

export async function changePassword(currentPassword, newPassword) {
  await delay(500);
  if (currentPassword !== DEMO_USER.password) {
    throw new Error('Current password is incorrect');
  }
  return { success: true };
}

export function logout() {
  localStorage.removeItem('rl_token');
  localStorage.removeItem('rl_user');
}
