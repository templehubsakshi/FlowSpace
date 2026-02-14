import toast from 'react-hot-toast';

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      icon: '✅',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
      ...options
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      icon: '❌',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
      ...options
    });
  },

  warning: (message, options = {}) => {
    toast(message, {
      duration: 3500,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      },
      ...options
    });
  },

  info: (message, options = {}) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
      ...options
    });
  },

  promise: async (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    }, {
      style: {
        fontWeight: '500',
        padding: '16px 20px',
        borderRadius: '12px',
      }
    });
}
};