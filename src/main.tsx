import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n';

// Initialize i18n before rendering
i18n.init().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});