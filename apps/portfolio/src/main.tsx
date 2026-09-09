import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { flushAnalytics } from './lib/analytics'
import Home from './pages/Home'

// Route-level splitting: Home stays eager (it's the index route); every
// other page loads on navigation. App.tsx wraps the outlet in Suspense.
const Work = lazy(() => import('./pages/Work'))
const Art = lazy(() => import('./pages/Art'))
const Thinking = lazy(() => import('./pages/Thinking'))
const ThinkingPiece = lazy(() => import('./pages/ThinkingPiece'))
const Library = lazy(() => import('./pages/Library'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))
const Login = lazy(() => import('./pages/Login'))
const Logout = lazy(() => import('./pages/Logout'))
const Support = lazy(() => import('./pages/Support'))

// CSS Studio — dev-only visual CSS editor. Dynamic import so it is NEVER bundled
// into the production build. Removed entirely when import.meta.env.DEV is false.
if (import.meta.env.DEV) {
  import('cssstudio').then(({ startStudio }) => startStudio())
}

// Defer PostHog init to after first paint - not needed for FCP/LCP.
// Configuration tuned to avoid blocking critical path:
// - No session recording on marketing pages (load-heavy, not needed for analytics)
// - No autocapture extras (dead-clicks, rage-clicks, exceptions load separately)
// - Defer feature flags to avoid /decide request before interactive
const deferCallback = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
deferCallback(() => {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', {
      api_host: 'https://elephant.n3wth.com',
      ui_host: 'https://us.i.posthog.com',
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      // Web vitals still captured, but deferred with the rest of PostHog
      capture_performance: { web_vitals: true },
      disable_surveys: true,
      // Disable features that load extra scripts before LCP
      disable_session_recording: true,
      disable_web_experiments: true,
      autocapture: {
        dom_event_allowlist: ['click', 'submit'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
      },
      // Prevent /decide (flags) call from blocking - bootstrap with empty state
      advanced_disable_decide: true,
      bootstrap: { featureFlags: {} },
    })
    flushAnalytics()
  })
})

/* The data router owns route loading and error boundaries. */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'work', element: <Work /> },
      { path: 'art', element: <Art /> },
      { path: 'thinking', element: <Thinking /> },
      { path: 'thinking/:slug', element: <ThinkingPiece /> },
      { path: 'library', element: <Library /> },
      { path: 'contact', element: <Contact /> },
      { path: 'error', element: <ErrorPage /> },
      { path: 'login', element: <Login /> },
      { path: 'logout', element: <Logout /> },
      { path: 'support', element: <Support /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
