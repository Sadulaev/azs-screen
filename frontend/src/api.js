const TOKEN_KEY = 'mustang_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.json) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  getConfig: () => request('/api/config'),
  getLayouts: () => request('/api/layouts'),
  login: (password) => request('/api/auth/login', { method: 'POST', json: { password } }),
  saveConfig: (config) => request('/api/config', { method: 'PUT', json: config }),
  resetConfig: () => request('/api/config/reset', { method: 'POST' }),
  uploadBackground: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/api/upload/background', { method: 'POST', body: form });
  },
  uploadLogo: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/api/upload/logo', { method: 'POST', body: form });
  },
};
