// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
// import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './redux/store';
import { SocketProvider } from './context/SocketContext'; // Socket context
import ErrorBoundary from './components/ErrorBoundary'; // Error boundary
import { ThemeProvider } from './context/ThemeContext'; // Theme context
import './index.css';
import "@fontsource/inter/index.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Catch any runtime errors in the whole app */}
    <ErrorBoundary>
      {/* Provide Redux store */}
      <Provider store={store}>
        {/* Provide React Router */}
        <ThemeProvider>
          {/* Provide Socket context */}
          <SocketProvider>
            {/* Main App */}
            <App />
            {/* Global toast notifications */}
            <Toaster position="top-right" />
          </SocketProvider>
      </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
