import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { processPendingOwnerUpdates } from './api/api'

// Attempt to process any pending owner updates queued previously (e.g. when
// the deed service returned 404). This is best-effort and will not block the
// app render.
(async () => {
  try {
    const res = await processPendingOwnerUpdates();
    if (res.success || res.failed) {
      console.log('Processed pending owner updates', res);
    }
  } catch (e) {
    console.warn('Error processing pending owner updates', e);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
