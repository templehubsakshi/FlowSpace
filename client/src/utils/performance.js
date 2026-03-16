// Performance monitoring utilities

export const measureRenderTime = (componentName) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) { // Longer than 1 frame (60fps)
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
};

export const debounce = (func, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
