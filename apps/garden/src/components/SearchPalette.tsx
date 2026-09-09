'use client'

import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandPalette,
  CommandPaletteFooter,
  useCommandPaletteContext,
} from '@n3wth/ui/primitives'
import {
  createStaticSource,
  type SearchableItem,
} from '@n3wth/ui/primitives'
import { getVisited } from '@/lib/visited'
import type { GrowthStage } from '@/lib/content'
import { stageColor } from '@/lib/plant'

export interface PaletteNote {
  slug: string
  title: string
  tags: string[]
  stage: GrowthStage
  description?: string
}

interface PaletteAux {
  group: string
  tags?: string[]
  stage?: GrowthStage
  description?: string
}

type PaletteItem = SearchableItem<PaletteAux>

const ACTIONS: PaletteItem[] = [
  { id: '/notes', label: 'Browse all notes', auxiliaryData: { group: 'Go to' } },
  { id: '/random', label: 'Random note', auxiliaryData: { group: 'Go to' } },
  { id: '/graph', label: 'Garden graph', auxiliaryData: { group: 'Go to' } },
  { id: '/tags', label: 'Groves', auxiliaryData: { group: 'Go to' } },
]

const STAGE_LABEL: Record<GrowthStage, string> = {
  seedling: 'seedling',
  budding: 'budding',
  evergreen: 'evergreen',
}

const AI_DEBOUNCE_MS = 300

interface SearchPaletteProps {
  notes: PaletteNote[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

async function streamAIResponse(
  query: string,
  signal: AbortSignal,
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`AI search failed: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
}

interface AIState {
  loading: boolean
  result: string
  query: string
}

function AIResultFooter({
  aiState,
  onQueryChange,
}: {
  aiState: AIState
  onQueryChange: (query: string) => void
}) {
  const ctx = useCommandPaletteContext()
  const lastQueryRef = useRef('')

  useEffect(() => {
    if (ctx?.search !== lastQueryRef.current) {
      lastQueryRef.current = ctx?.search ?? ''
      onQueryChange(ctx?.search ?? '')
    }
  }, [ctx?.search, onQueryChange])

  const hasQuery = ctx?.search && ctx.search.trim().length > 0

  if (!hasQuery) {
    return <CommandPaletteFooter />
  }

  return (
    <div className="border-t border-[var(--color-border)]">
      <div className="px-4 py-3">
        <div className="text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
          Ask AI
        </div>
        {aiState.loading && !aiState.result ? (
          <div className="text-secondary animate-pulse text-[13px]">
            Thinking...
          </div>
        ) : aiState.result ? (
          <div className="text-primary text-[13px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {aiState.result}
            {aiState.loading && <span className="animate-pulse">...</span>}
          </div>
        ) : (
          <div className="text-tertiary text-[13px]">
            Searching...
          </div>
        )}
      </div>
    </div>
  )
}

export function SearchPalette({
  notes,
  isOpen,
  onOpenChange,
}: SearchPaletteProps) {
  const router = useRouter()
  const [aiState, setAiState] = useState<AIState>({
    loading: false,
    result: '',
    query: '',
  })

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visited = useMemo<Record<string, number>>(
    () => (isOpen ? getVisited() : {}),
    [isOpen]
  )

  const noteItems = useMemo<PaletteItem[]>(() => {
    const recent: PaletteItem[] = notes
      .filter((note) => visited[note.slug] !== undefined)
      .sort((a, b) => visited[b.slug] - visited[a.slug])
      .slice(0, 4)
      .map((note) => ({
        id: `recent:/${note.slug}`,
        label: note.title,
        auxiliaryData: {
          group: 'Recently walked',
          tags: [...note.tags, STAGE_LABEL[note.stage]],
          stage: note.stage,
          description: note.description,
        },
      }))

    return [
      ...recent,
      ...ACTIONS,
      ...notes.map((note) => ({
        id: `/${note.slug}`,
        label: note.title,
        auxiliaryData: {
          group: 'Notes',
          tags: [...note.tags, STAGE_LABEL[note.stage]],
          stage: note.stage,
          description: note.description,
        },
      })),
    ]
  }, [notes, visited])

  const cancelAISearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const runAISearch = useCallback(async (query: string) => {
    const controller = new AbortController()
    abortRef.current = controller

    let accumulated = ''

    try {
      await streamAIResponse(query, controller.signal, (chunk) => {
        accumulated += chunk
        setAiState((prev) => ({
          ...prev,
          result: accumulated,
        }))
      })
      setAiState((prev) => ({ ...prev, loading: false }))
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('AI search error:', err)
        setAiState((prev) => ({ ...prev, loading: false }))
      }
    }
  }, [])

  const handleQueryChange = useCallback(
    (query: string) => {
      cancelAISearch()

      if (!query.trim()) {
        setAiState({ loading: false, result: '', query: '' })
        return
      }

      setAiState({ loading: true, result: '', query })

      debounceRef.current = setTimeout(() => {
        runAISearch(query)
      }, AI_DEBOUNCE_MS)
    },
    [cancelAISearch, runAISearch]
  )

  const source = useMemo(() => {
    return createStaticSource(noteItems, {
      keywords: (item) => [
        ...(item.auxiliaryData?.tags ?? []),
        ...(item.auxiliaryData?.description
          ? [item.auxiliaryData.description]
          : []),
      ],
    })
  }, [noteItems])

  useEffect(() => {
    if (!isOpen) {
      cancelAISearch()
      setAiState({ loading: false, result: '', query: '' })
    }
  }, [isOpen, cancelAISearch])

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={source}
      label="Search the garden"
      emptySearchText="Nothing by that name is planted yet"
      footer={
        <AIResultFooter aiState={aiState} onQueryChange={handleQueryChange} />
      }
      renderItem={(item) => {
        const aux = item.auxiliaryData
        const stage = aux?.stage

        return (
          <span className="flex w-full items-center justify-between gap-3">
            <span className="truncate">{item.label}</span>
            {stage && (
              <span
                className="font-mono text-[11px] shrink-0"
                style={{ color: stageColor[stage] }}
              >
                {STAGE_LABEL[stage]}
              </span>
            )}
          </span>
        )
      }}
      onValueChange={(value) => {
        onOpenChange(false)
        router.push(value.replace(/^recent:/, ''))
      }}
    />
  )
}
