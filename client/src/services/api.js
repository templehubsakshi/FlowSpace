import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // sends httpOnly cookie automatically on every request
  timeout: 10000
});

// Request interceptor — cookie is sent automatically, nothing to inject
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// FIX: Previously there were TWO response interceptors. Axios chains them, so
// every error passed through both. A 401 would show the toast in the first
// interceptor, then the second (retry) interceptor would catch the same
// rejection and evaluate it again. A 500 could show two toasts if retried.
// Merged into one interceptor that handles both toasts and retry logic.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // ── Network error (no response at all) ───────────────────────────────────
    if (!error.response) {
      // Retry up to 2 times with exponential backoff for network errors only
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

    // ── HTTP error responses ─────────────────────────────────────────────────
    const status  = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request', { id: 'error-400' });
        break;

      case 401:
        toast.error('Session expired. Please login again.', { id: 'error-401' });
        // Fire forceLogout via custom event — App.jsx listener dispatches to Redux
        window.dispatchEvent(new Event('force-logout'));
        if (!window.__isRedirecting) {
          window.__isRedirecting = true;
          setTimeout(() => {
            window.__isRedirecting = false;
            window.location.href = '/login';
          }, 500);
        }
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