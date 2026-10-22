import axios from 'axios';
import toast from 'react-hot-toast';
import { getSocketId } from '../utils/socketId';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

// Only these methods are safe to repeat automatically.
const RETRYABLE_METHODS = ['get', 'head', 'options'];

api.interceptors.request.use(
  (config) => {
    // Lets the server exclude this tab from the live broadcast of its own change.
    const socketId = getSocketId();
    if (socketId) config.headers['X-Socket-Id'] = socketId;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // ── Network error / timeout ───────────────────────────────────────────────
    if (!error.response) {
      // FIX: this used to retry EVERY request, including POST. A timed-out POST
      // may already have been processed by the server, so retrying it created
      // duplicate tasks / comments / workspaces. Only idempotent reads retry now.
      const method = (config?.method || 'get').toLowerCase();
      if (config && RETRYABLE_METHODS.includes(method) && (config.__retryCount || 0) < 2) {
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = Math.pow(2, config.__retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
      toast.error('Network error. Please check your connection.', {
        id: 'network-error',
        duration: 5000
      });
      return Promise.reject(error);
    }

    const status  = error.response.status;
    const message = error.response.data?.message;

    // 401 on these routes is EXPECTED and must not be treated as "session expired":
    //  - /auth/me     : user simply isn't logged in yet
    //  - /auth/login, /auth/signup : wrong credentials. FIX: before, a wrong
    //    password showed "Session expired", fired force-logout and hard-reloaded
    //    the page to /login (wiping what the user had typed).
    const url = config?.url || '';
    const isAuthCall = ['/auth/me', '/auth/login', '/auth/signup'].some((p) => url.includes(p));

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request', { id: 'error-400' });
        break;

      case 401:
        if (!isAuthCall) {
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
        // Auth calls: stay silent here — the thunk's rejectWithValue shows the
        // server message ("Invalid email or password") in the form.
        break;

      case 403:
        toast.error(message || "You don't have permission to perform this action", { id: 'error-403' });
        break;

      case 404:
        toast.error(message || 'Resource not found', { id: 'error-404' });
        break;

      case 429:
        toast.error(message || 'Too many requests. Please slow down.', { id: 'error-429' });
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
