import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0f172a' } },
        }} />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
