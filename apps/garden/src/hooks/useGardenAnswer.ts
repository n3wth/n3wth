'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface GardenAnswer {
  loading: boolean
  result: string
  error: string
}

const EMPTY_ANSWER: GardenAnswer = { loading: false, result: '', error: '' }

async function streamAnswer(
  query: string,
  signal: AbortSignal,
  onChunk: (text: string) => void,
): Promise<void> {
  const response = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  })

  if (!response.ok || !response.body) {
    await response.body?.cancel()
    throw new Error('Search unavailable')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = done ? '' : lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (data === '[DONE]') return

        let parsed
        try {
          parsed = JSON.parse(data)
        } catch {
          continue
        }
        const content = parsed?.choices?.[0]?.delta?.content
        if (typeof content === 'string') onChunk(content)
      }

      if (done) throw new Error('Search stream ended before completion')
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export function useGardenAnswer(isOpen: boolean) {
  const [answer, setAnswer] = useState<GardenAnswer>(EMPTY_ANSWER)
  const requestRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
  }, [])

  const reset = useCallback(() => {
    cancel()
    setAnswer(EMPTY_ANSWER)
  }, [cancel])

  const ask = useCallback(async (query: string) => {
    if (!isOpen || !query.trim()) return
    cancel()
    const controller = new AbortController()
    requestRef.current = controller
    setAnswer({ loading: true, result: '', error: '' })
    let result = ''

    try {
      await streamAnswer(query.trim(), controller.signal, (chunk) => {
        if (requestRef.current !== controller) return
        result += chunk
        setAnswer({ loading: true, result, error: '' })
      })
      if (requestRef.current !== controller) return
      if (!result.trim()) throw new Error('No answer received')
      setAnswer({ loading: false, result, error: '' })
    } catch {
      if (requestRef.current !== controller) return
      setAnswer({
        loading: false,
        result: '',
        error: 'The garden could not answer. Try again or open a note from the results.',
      })
    } finally {
      if (requestRef.current === controller) requestRef.current = null
    }
  }, [cancel, isOpen])

  useEffect(() => {
    if (!isOpen) reset()
    return cancel
  }, [isOpen, reset, cancel])

  return { answer, ask, reset }
}
