// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { checkAuth } from './redux/slices/authSlice';

// import { SocketProvider } from './context/SocketContext';
// import NotificationListener from './components/NotificationListener';
// import NetworkStatus from './components/NetworkStatus';

// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';

// function App() {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector(state => state.auth);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) dispatch(checkAuth());
//   }, [dispatch]);

//   return (
//     <BrowserRouter>
//       <NetworkStatus />
//       <NotificationListener />

//       <Toaster
//         position="top-right"
//         gutter={8}
//         toastOptions={{
//           duration: 3000,
//           style: {
//             fontFamily: "'DM Sans', system-ui, sans-serif",
//             fontSize: 13,
//             fontWeight: 500,
//             borderRadius: 10,
//             padding: '10px 14px',
//             boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
//           },
//           success: {
//             style: {
//               background: '#0d1117',
//               color: '#34d399',
//               border: '1px solid rgba(16,185,129,0.2)',
//             },
//             iconTheme: { primary: '#10b981', secondary: '#0d1117' },
//           },
//           error: {
//             duration: 4000,
//             style: {
//               background: '#0d1117',
//               color: '#f87171',
//               border: '1px solid rgba(239,68,68,0.2)',
//             },
//             iconTheme: { primary: '#ef4444', secondary: '#0d1117' },
//           },
//           loading: {
//             style: {
//               background: '#0d1117',
//               color: '#93c5fd',
//               border: '1px solid rgba(59,130,246,0.2)',
//             },
//           },
//         }}
//       />

//       <Routes>
//         <Route path="/login"     element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
//         <Route path="/signup"    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
//         <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
//         <Route path="/"          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice';

// ✅ FIX: Removed duplicate SocketProvider — it already wraps App in main.jsx
import NotificationListener from './components/NotificationListener';
import NetworkStatus from './components/NetworkStatus';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <NetworkStatus />
      <NotificationListener />

      {/* ✅ Single Toaster — removed from main.jsx */}
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
        <Route path="/login"     element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup"    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/"          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;