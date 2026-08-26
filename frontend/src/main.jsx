import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { globalCss } from './styles/theme.js';

// Basic reset
const globalStyles = globalCss({
  '*': { boxSizing: 'border-box', margin: 0, padding: 0 },
  body: {
    fontFamily: '$sans',
    backgroundColor: '$baseNavy',
    color: '$fog',
    margin: 0,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  'html, body, #root': { height: '100%' },
});

globalStyles();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
