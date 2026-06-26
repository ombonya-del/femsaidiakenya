import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// Auto-refresh when a new deployment's service worker takes control, so the PWA
// can never keep serving a stale app bundle. (This was why shipped fixes
// appeared "not to work" until a manual cache clear.) Guard with hadController
// so a first-ever install doesn't trigger a reload loop.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    if (hadController) window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)