import './App.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register service worker for PWA install + push.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(r => console.log('SW registered:', r.scope))
      .catch(e => console.log('SW error:', e))
  })
  const hadController = !!navigator.serviceWorker.controller
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return; reloaded = true
    if (hadController) window.location.reload()
  })
}
