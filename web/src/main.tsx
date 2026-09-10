import { StrictMode, lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './landing/Landing.tsx'

const Dashboard = lazy(() => import('./App.tsx'))

function Root() {
  const [dashboard, setDashboard] = useState(window.location.hash.startsWith('#/app'))
  useEffect(() => {
    function navigate() {
      const next = window.location.hash.startsWith('#/app')
      setDashboard(next)
      if (next || !window.location.hash) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  return dashboard ? <Suspense fallback={<div style={{padding:40,color:'#e8e6e1'}}>Loading Fraud Radar…</div>}><Dashboard /></Suspense> : <Landing />
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)
