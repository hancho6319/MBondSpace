import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GroupProvider } from './contexts/GroupContext';
import { AuthProvider  } from './contexts/AuthContext';
import './styles/main.css';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider >
      <GroupProvider>
        <App />
      </GroupProvider>
    </AuthProvider >
  </React.StrictMode>
);