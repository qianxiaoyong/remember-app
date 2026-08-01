import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('missing #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
