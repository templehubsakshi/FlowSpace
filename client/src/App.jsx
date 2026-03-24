import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, forceLogout } from './redux/slices/authSlice';

import NotificationListener from './components/NotificationListener';
import NetworkStatus from './components/NetworkStatus';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Full-screen spinner shown while checkAuth is pending
function AppLoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#070810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(99,102,241,.2)',
        borderTopColor: '#6366f1',
        animation: 'spin .7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);

  // Always verify session with backend on every app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Listen for 401 events fired by api.js interceptor
  useEffect(() => {
    const handleForceLogout = () => dispatch(forceLogout());
    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, [dispatch]);

  // Block all routes until checkAuth has resolved.
  // FIX: Previously the dashboard route had a shortcut:
  //   (cachedUser && isLoading) ? <Dashboard /> : <Navigate to="/login" />
  // This let anyone with a 'user' key in localStorage (even a deleted account
  // or a manually pasted value) see the dashboard while checkAuth was pending.
  // Now we show a spinner for the brief checkAuth window instead.
  if (isLoading) {
    return <AppLoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <NetworkStatus />
      <NotificationListener />

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          },
          success: {
            style: {
              background: '#0d1117',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.2)',
            },
            iconTheme: { primary: '#10b981', secondary: '#0d1117' },
          },
          error: {
            duration: 4000,
            style: {
              background: '#0d1117',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            },
            iconTheme: { primary: '#ef4444', secondary: '#0d1117' },
          },
          loading: {
            style: {
              background: '#0d1117',
              color: '#93c5fd',
              border: '1px solid rgba(59,130,246,0.2)',
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;