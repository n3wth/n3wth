import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'

posthog.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', {
  api_host: 'https://telemetry.n3wth.com',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  capture_performance: { web_vitals: true },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
