import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* This wrapper provides the context to the App component */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);