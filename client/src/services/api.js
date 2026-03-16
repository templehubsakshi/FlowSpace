import axios from 'axios';
import toast from 'react-hot-toast';
// import store from '../redux/store'
// import { logout } from '../redux/slices/authSlice'


const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      toast.error('Network error. Please check your connection.', {
        id: 'network-error',
        duration: 5000
      });
      return Promise.reject(new Error('Network error'));
    }

    // Handle specific status codes
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request', { id: 'error-400' });
        break;
      
 case 401:
  toast.error('Session expired. Please login again.', { id: 'error-401' });

  // 🔥 Clear storage
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // 🔥 Notify app about logout
  window.dispatchEvent(new Event("force-logout"));

  if (!window.__isRedirecting) {
    window.__isRedirecting = true;
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }
  break;



      
      case 403:
        toast.error('You don\'t have permission to perform this action', { 
          id: 'error-403' 
        });
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

// Retry failed requests (for network errors)
api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;

  // Don't retry if already retried or if it's not a network error
  if (!config || config.__retryCount >= 2 || error.response?.status === 401) {
    return Promise.reject(error);
  }

  // Increment retry count
  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;

  // Wait before retrying (exponential backoff)
  const delay = Math.pow(2, config.__retryCount) * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry request
  return api(config);
});

export default api;