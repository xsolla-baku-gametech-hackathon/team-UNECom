import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Lazy so the graph libraries land in their own chunk and the first paint
// (the loading line) doesn't wait on them.
const Dashboard = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div style={{padding:40,color:'#e8e6e1'}}>Loading Fraud Radar…</div>}>
      <Dashboard />
    </Suspense>
  </StrictMode>,
)
