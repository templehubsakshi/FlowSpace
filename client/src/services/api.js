import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // ── Network error ────────────────────────────────────────────────────────
    if (!error.response) {
      if (config && (config.__retryCount || 0) < 2) {
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = Math.pow(2, config.__retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
      toast.error('Network error. Please check your connection.', {
        id: 'network-error',
        duration: 5000
      });
      return Promise.reject(new Error('Network error'));
    }

    const status  = error.response.status;
    const message = error.response.data?.message;

    // FIX: The /auth/me (checkAuth) call on app load returns 401 when the user
    // is simply not logged in yet — this is expected, not an error worth toasting.
    // Without this check, every page load for a logged-out user showed
    // "Session expired. Please login again." even on first visit.
    // We suppress the toast and force-logout logic for the checkAuth route only.
    const isCheckAuthCall = config?.url?.includes('/auth/me');

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request', { id: 'error-400' });
        break;

      case 401:
        if (!isCheckAuthCall) {
          // Real 401 — user was logged in but session expired mid-session
          toast.error('Session expired. Please login again.', { id: 'error-401' });
          window.dispatchEvent(new Event('force-logout'));
          if (!window.__isRedirecting) {
            window.__isRedirecting = true;
            setTimeout(() => {
              window.__isRedirecting = false;
              window.location.href = '/login';
            }, 500);
          }
        }
        // If it IS checkAuth, stay silent — App.jsx spinner → authSlice.rejected
        // → isLoading = false → isAuthenticated = false → routes render → /login
        break;

      case 403:
        toast.error("You don't have permission to perform this action", { id: 'error-403' });
        break;

      case 404:
        toast.error(message || 'Resource not found', { id: 'error-404' });
        break;

      case 500:
        toast.error('Server error. Please try again later.', {
          id: 'error-500',
          duration: 5000
        });
        break;

      default:
        toast.error(message || 'An error occurred', { id: 'error-default' });
    }

    return Promise.reject(error);
  }
);

export default api;