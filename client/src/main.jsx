import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary' // ADD
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>  {/* ADD */}
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>  {/* ADD */}
  </React.StrictMode>,
)