import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppErrorFallback } from './components/ErrorFallback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={(props) => <AppErrorFallback {...props} />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
