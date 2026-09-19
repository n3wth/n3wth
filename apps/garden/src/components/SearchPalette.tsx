'use client'

import {
  useMemo,
  useRef,
  useEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandPalette,
  CommandPaletteFooter,
  useCommandPaletteContext,
  Button,
} from '@n3wth/ui/primitives'
import {
  createStaticSource,
  type SearchableItem,
} from '@n3wth/ui/primitives'
import { getVisited } from '@/lib/visited'
import type { GrowthStage } from '@/lib/content'
import { stageColor } from '@/lib/plant'
import { useGardenAnswer } from '@/hooks/useGardenAnswer'

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

interface SearchPaletteProps {
  notes: PaletteNote[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

function AnswerFooter({
  answer,
  onAsk,
  onQueryChange,
}: {
  answer: ReturnType<typeof useGardenAnswer>['answer']
  onAsk: (query: string) => void
  onQueryChange: () => void
}) {
  const ctx = useCommandPaletteContext()
  const lastQueryRef = useRef('')

  useEffect(() => {
    if (ctx?.search !== lastQueryRef.current) {
      lastQueryRef.current = ctx?.search ?? ''
      onQueryChange()
    }
  }, [ctx?.search, onQueryChange])

  const hasQuery = ctx?.search && ctx.search.trim().length > 0

  if (!hasQuery) {
    return <CommandPaletteFooter />
  }

  return (
    <div className="border-t border-[var(--color-border)]">
      <div className="px-4 py-3">
        <div className="mb-2">
          <Button
            label="Ask the garden"
            variant="secondary"
            isDisabled={answer.loading}
            onClick={() => onAsk(ctx?.search ?? '')}
          />
        </div>
        {answer.error ? (
          <div role="alert" className="text-primary text-[13px]">
            {answer.error}
          </div>
        ) : answer.loading && !answer.result ? (
          <div role="status" className="text-secondary animate-pulse text-[13px]">
            Searching the garden...
          </div>
        ) : answer.result ? (
          <div className="text-primary text-[13px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {answer.result}
            {answer.loading && <span className="animate-pulse">...</span>}
          </div>
        ) : (
          <div role="status" className="text-tertiary text-[13px]">
            Search notes here, or send your question to get an answer.
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
  const { answer, ask, reset } = useGardenAnswer(isOpen)

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

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={source}
      label="Search the garden"
      emptySearchText="Nothing by that name is planted yet"
      footer={
        <AnswerFooter answer={answer} onAsk={ask} onQueryChange={reset} />
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
