import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

export interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

type FallbackRender = (props: ErrorBoundaryFallbackProps) => ReactNode

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode | FallbackRender
  onReset?: () => void
  onError?: (error: Error, info: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
]

const CHUNK_RELOAD_KEY = 'n3wth:chunk-reload'

function isChunkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function shouldAutoReloadChunk(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const { sessionStorage } = window
    if (!sessionStorage) return false
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === 'true') return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, 'true')
    return true
  } catch {
    return false
  }
}

function haveResetKeysChanged(
  prevKeys: unknown[] | undefined,
  nextKeys: unknown[] | undefined
): boolean {
  if (!prevKeys || !nextKeys) return false
  if (prevKeys.length !== nextKeys.length) return true
  return prevKeys.some((key, index) => !Object.is(key, nextKeys[index]))
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)

    if (isChunkError(error) && shouldAutoReloadChunk()) {
      window.location.reload()
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && haveResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const fallbackError = this.state.error ?? new Error('Unknown error')
    const { fallback } = this.props

    if (typeof fallback === 'function') {
      return fallback({ error: fallbackError, resetErrorBoundary: this.resetErrorBoundary })
    }

    return fallback
  }
}
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

export interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

type FallbackRender = (props: ErrorBoundaryFallbackProps) => ReactNode

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode | FallbackRender
  onReset?: () => void
  onError?: (error: Error, info: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
]

const CHUNK_RELOAD_KEY = 'n3wth:chunk-reload'

function isChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function shouldAutoReloadChunk(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (!window.sessionStorage) return false
    if (window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === 'true') return false
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, 'true')
    return true
  } catch {
    return false
  }
}

function haveResetKeysChanged(
  prevKeys: unknown[] | undefined,
  nextKeys: unknown[] | undefined
): boolean {
  if (!prevKeys || !nextKeys) return false
  if (prevKeys.length !== nextKeys.length) return true
  return prevKeys.some((key, index) => !Object.is(key, nextKeys[index]))
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)

    if (isChunkError(error) && shouldAutoReloadChunk()) {
      window.location.reload()
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      haveResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { fallback, children } = this.props

    if (!hasError) {
      return children
    }

    const fallbackError = error ?? new Error('Unknown error')

    if (typeof fallback === 'function') {
      return fallback({
        error: fallbackError,
        resetErrorBoundary: this.resetErrorBoundary,
      })
    }

    return fallback
  }
}
