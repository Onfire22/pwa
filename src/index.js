import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { requestNotification } from './utils';
import { BrowserRouter } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename='/pwa'>
   <App />
  </BrowserRouter>
);

requestNotification();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  })
}