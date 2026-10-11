import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unikai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Extracts a clean, user-friendly error message:
 * - If MongoDB is offline: "Database connection unavailable. Please start MongoDB and try again."
 * - If backend is offline: "Unable to connect to server."
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  if (error.response) {
    const data = error.response.data;
    if (
      error.response.status === 503 ||
      data?.code === 'DB_UNAVAILABLE' ||
      data?.database === 'disconnected'
    ) {
      return 'Database connection unavailable. Please start MongoDB and try again.';
    }
    return data?.message || `Request failed with status ${error.response.status}`;
  }

  if (error.request || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to connect to server.';
  }

  return error.message || 'An unexpected error occurred.';
};

/**
 * Resolves an official or local product image URL.
 * Returns null if no image exists — never generates fake product images.
 */
export const resolveImageUrl = (path) => {
  if (!path || typeof path !== 'string' || !path.trim()) return null;
  const trimmed = path.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_BASE_URL}${normalized}`;
};

/**
 * Checks whether a price value is a valid positive number.
 */
export const hasValidPrice = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
};

/**
 * Formats a valid positive OMR price.
 * Returns null if price is null, undefined, or <= 0 so UI never shows "OMR 0.000".
 */
export const formatOMR = (value) => {
  if (!hasValidPrice(value)) return null;
  return `OMR ${Number(value).toFixed(3)}`;
};

export default api;
