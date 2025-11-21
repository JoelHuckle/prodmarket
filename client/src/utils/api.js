// utils/api.js
// Centralized API helper

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const getToken = () => localStorage.getItem("token");

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Auth
export const auth = {
  login: (email, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  googleLogin: (token) =>
    apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  testLogin: (email, name) =>
    apiFetch("/api/auth/test", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    }),
  getProfile: () => apiFetch("/api/users/profile"),
};

// Services
export const services = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/services${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiFetch(`/api/services/${id}`),
  getByUsername: (username) => apiFetch(`/api/services/user/${username}`),
  create: (data) =>
    apiFetch("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => apiFetch(`/api/services/${id}`, { method: "DELETE" }),
};

// Orders
export const orders = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/orders${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiFetch(`/api/orders/${id}`),
  create: (data) =>
    apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    apiFetch(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getStats: () => apiFetch("/api/orders/stats"),
};

// Subscriptions
export const subscriptions = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/subscriptions${query ? `?${query}` : ""}`);
  },
  subscribe: (serviceId) =>
    apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ service_id: serviceId }),
    }),
  cancel: (id) =>
    apiFetch(`/api/subscriptions/${id}/cancel`, { method: "PUT" }),
  getPacks: (id) => apiFetch(`/api/subscriptions/${id}/packs`),
};

// Disputes
export const disputes = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/disputes${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiFetch(`/api/disputes/${id}`),
  create: (data) =>
    apiFetch("/api/disputes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  respond: (id, response) =>
    apiFetch(`/api/disputes/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    }),
};

// Payments
export const payments = {
  createIntent: (orderId) =>
    apiFetch("/api/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }),
  getHistory: () => apiFetch("/api/payments/history"),
};

// Downloads
export const downloads = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/downloads${query ? `?${query}` : ""}`);
  },
  record: (data) =>
    apiFetch("/api/downloads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStats: () => apiFetch("/api/downloads/stats"),
};

// Admin
export const admin = {
  getDashboard: () => apiFetch("/api/admin/dashboard"),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/users${query ? `?${query}` : ""}`);
  },
  verifyUser: (id) =>
    apiFetch(`/api/admin/users/${id}/verify`, { method: "PUT" }),
  getDisputes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/disputes${query ? `?${query}` : ""}`);
  },
  resolveDispute: (id, resolution, notes) =>
    apiFetch(`/api/admin/disputes/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ resolution, admin_notes: notes }),
    }),
};

export default {
  auth,
  services,
  orders,
  subscriptions,
  disputes,
  payments,
  downloads,
  admin,
};
