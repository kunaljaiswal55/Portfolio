/* The global sheet must be evaluated FIRST so component stylesheets,
   which are imported through <App />, always win on equal specificity. */
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

document.documentElement.classList.add('js');

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}