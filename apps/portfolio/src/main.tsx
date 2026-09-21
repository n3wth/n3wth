import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useLoaderData, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { flushAnalytics } from './lib/analytics'
import { initializeGoogleAnalytics, withSiteAnalyticsPrivacy } from '@n3wth/site-config/analytics'
import Home from './pages/Home'

// Route-level splitting: Home stays eager (it's the index route); every
// other page loads on navigation. App.tsx wraps the outlet in Suspense.
const Work = lazy(() => import('./pages/Work'))
const Projects = lazy(() => import('./pages/Projects'))
const Art = lazy(() => import('./pages/Art'))
const Thinking = lazy(() => import('./pages/Thinking'))
const ThinkingPiece = lazy(() => import('./pages/ThinkingPiece'))
const ThinkingNote = lazy(() => import('./pages/ThinkingNote'))
const Library = lazy(() => import('./pages/Library'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))
const Login = lazy(() => import('./pages/Login'))
const Logout = lazy(() => import('./pages/Logout'))
const Support = lazy(() => import('./pages/Support'))
const Elsa = lazy(() => import('./pages/Elsa'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Consent = lazy(() => import('./pages/Consent'))

function ThinkingRoute() {
  const note = useLoaderData()
  return note ? <ThinkingNote /> : <ThinkingPiece />
}

function ThinkingError() {
  const error = useRouteError()
  return isRouteErrorResponse(error) && error.status === 404 ? <NotFound /> : <ErrorPage />
}

// CSS Studio — dev-only visual CSS editor. Dynamic import so it is NEVER bundled
// into the production build. Removed entirely when import.meta.env.DEV is false.
if (import.meta.env.DEV) {
  import('cssstudio').then(({ startStudio }) => startStudio())
}

initializeGoogleAnalytics()

// Defer PostHog init to after first paint - not needed for FCP/LCP.
// Configuration tuned to avoid blocking critical path:
// - No session recording on marketing pages (load-heavy, not needed for analytics)
// - No autocapture extras (dead-clicks, rage-clicks, exceptions load separately)
// - Defer feature flags to avoid /decide request before interactive
const deferCallback = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
deferCallback(() => {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', withSiteAnalyticsPrivacy({
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
    }) as Parameters<typeof posthog.init>[1])
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
      {
        path: 'thinking/*',
        loader: async ({ params, request }) => {
          const { registeredPieces } = await import('./components/thinking/registry')
          if (registeredPieces.some(piece => piece.meta.id === params['*'])) return null
          const slug = (params['*'] || '').split('/').map(encodeURIComponent).join('/')
          const response = await fetch(`/writing/notes/${slug}.json`, { signal: request.signal })
          if (!response.ok) throw new Response('Note unavailable', { status: response.status })
          return response.json()
        },
        element: <ThinkingRoute />,
        errorElement: <ThinkingError />,
      },
      { path: 'library', element: <Library /> },
      { path: 'contact', element: <Contact /> },
      { path: 'error', element: <ErrorPage /> },
      { path: 'login', element: <Login /> },
      { path: 'logout', element: <Logout /> },
      { path: 'support', element: <Support /> },
      { path: 'elsa', element: <Elsa /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'consent', element: <Consent /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:slug', element: <ProjectPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
// Mark hydrated to hide SEO fallback after React paints.
// requestAnimationFrame ensures the React tree has committed to DOM.
requestAnimationFrame(() => root.classList.add('hydrated'))
