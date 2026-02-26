// utils/api.js
// Centralized API helper
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;
  console.warn("VITE_API_URL not set, using localhost:5001");
  return "http://localhost:5001";
};

const API_URL = getApiUrl();

const getToken = () => localStorage.getItem("token");

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const url = `${API_URL}${endpoint}`;
  console.log("Fetching:", url);

  // Don't set Content-Type for FormData (browser handles it)
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// ==========================================
// 🔐 Auth
// ==========================================
export const auth = {
  register: (email, password, username, display_name) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username, display_name }),
    }),
  login: (email, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  google: (googleToken) =>
    apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ googleToken }),
    }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch("/api/auth/me"),
  refresh: () => apiFetch("/api/auth/refresh", { method: "POST" }),
};

// ==========================================
// 👤 Users
// ==========================================
export const users = {
  getById: (id) => apiFetch(`/api/users/${id}`),
  getByUsername: (username) => apiFetch(`/api/users/username/${username}`),
  updateProfile: (data) =>
    apiFetch("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  becomeSeller: () => apiFetch("/api/users/become-seller", { method: "POST" }),
  updateSellerInfo: (data) =>
    apiFetch("/api/users/seller-info", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getServices: (userId) => apiFetch(`/api/users/${userId}/services`),
  getStats: (userId) => apiFetch(`/api/users/${userId}/stats`),
};

// ==========================================
// 🎵 Services
// ==========================================
export const services = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/services${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiFetch(`/api/services/${id}`),
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
  uploadFiles: (id, formData) =>
    apiFetch(`/api/services/${id}/upload-files`, {
      method: "POST",
      body: formData,
    }),
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/services/search${query ? `?${query}` : ""}`);
  },
  getFeatured: () => apiFetch("/api/services/featured"),
};

// ==========================================
// 🛒 Orders
// ==========================================
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
  uploadFiles: (id, formData) =>
    apiFetch(`/api/orders/${id}/upload-files`, {
      method: "PUT",
      body: formData,
    }),
  deliver: (id) => apiFetch(`/api/orders/${id}/deliver`, { method: "PUT" }),
  complete: (id) => apiFetch(`/api/orders/${id}/complete`, { method: "PUT" }),
  cancel: (id) => apiFetch(`/api/orders/${id}/cancel`, { method: "PUT" }),
  dispute: (id, data) =>
    apiFetch(`/api/orders/${id}/dispute`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ==========================================
// 💳 Payments
// ==========================================
export const payments = {
  createIntent: (data) =>
    apiFetch("/api/payments/create-intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirm: (data) =>
    apiFetch("/api/payments/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getConnectOnboardingLink: () => apiFetch("/api/payments/connect-onboard"),
  getConnectStatus: () => apiFetch("/api/payments/connect-status"),
};

// ==========================================
// 📦 Subscriptions
// ==========================================
export const subscriptions = {
  getMy: () => apiFetch("/api/subscriptions/my"),
  create: (data) =>
    apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  cancel: (id) => apiFetch(`/api/subscriptions/${id}`, { method: "DELETE" }),
  getPacks: (serviceId) => apiFetch(`/api/subscriptions/${serviceId}/packs`),
  uploadPack: (serviceId, formData) =>
    apiFetch(`/api/subscriptions/${serviceId}/upload-pack`, {
      method: "POST",
      body: formData,
    }),
};

// ==========================================
// 📥 Downloads
// ==========================================
export const downloads = {
  getMy: () => apiFetch("/api/downloads/my"),
  downloadOrder: (orderId) =>
    apiFetch(`/api/downloads/order/${orderId}`, { method: "POST" }),
  downloadPack: (packId) =>
    apiFetch(`/api/downloads/pack/${packId}`, { method: "POST" }),
  getUrl: (id) => apiFetch(`/api/downloads/${id}/url`),
};

// ==========================================
// 🚨 Disputes
// ==========================================
export const disputes = {
  getAll: () => apiFetch("/api/disputes"),
  getById: (id) => apiFetch(`/api/disputes/${id}`),
  create: (data) =>
    apiFetch("/api/disputes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/disputes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ==========================================
// 👑 Admin
// ==========================================
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
  resolveDispute: (id, data) =>
    apiFetch(`/api/admin/disputes/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/transactions${query ? `?${query}` : ""}`);
  },
  deleteService: (id) =>
    apiFetch(`/api/admin/services/${id}`, { method: "DELETE" }),
};

// ==========================================
// 📊 Stats
// ==========================================
export const stats = {
  getPlatform: () => apiFetch("/api/stats/platform"),
  getSeller: (id) => apiFetch(`/api/stats/seller/${id}`),
  getMySales: () => apiFetch("/api/stats/my-sales"),
  getMyPurchases: () => apiFetch("/api/stats/my-purchases"),
};

// ==========================================
// 🔍 Search
// ==========================================
export const search = {
  services: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/search/services${query ? `?${query}` : ""}`);
  },
  users: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/search/users${query ? `?${query}` : ""}`);
  },
  autocomplete: (q) =>
    apiFetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}`),
};

export default {
  auth,
  users,
  services,
  orders,
  payments,
  subscriptions,
  downloads,
  disputes,
  admin,
  stats,
  search,
};
