// import React from 'react'


// function App() {
//   return (
//     <div className="min-h-screen bg-black-100 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-lg">
//         <h1 className="text-3xl font-bold text-blue-600">
//           FlowSpace
//         </h1>
//         <p className="text-red-600 mt-2">
//           Project Management Tool
//         </p>
//       </div>
//     </div>
//   );
// }

// export default App;
import NetworkStatus from './components/NetworkStatus';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is logged in on app load
  // useEffect(() => {
  //   dispatch(checkAuth());
  // }, [dispatch]);
useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    dispatch(checkAuth());
  }
}, [dispatch]);

  return (
    <BrowserRouter>
      <NetworkStatus />
     <Toaster 
  position="top-right"
  toastOptions={{
    // Success
    success: {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    },
    // Error
    error: {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    },
    // Loading
    loading: {
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;