import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// CSS Studio — dev-only visual CSS editor. Dynamic import so it is NEVER bundled
// into the production build. Removed entirely when import.meta.env.DEV is false.
if (import.meta.env.DEV) {
  import('cssstudio').then(({ startStudio }) => startStudio())
}

// Defer PostHog init to after first paint - not needed for FCP/LCP
const deferCallback = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
deferCallback(() => {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', {
      api_host: 'https://elephant.n3wth.com',
      ui_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      capture_performance: { web_vitals: true },
      disable_web_experiments: false,
    })
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
