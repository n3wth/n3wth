'use client'

import { useState } from 'react'
import { Button } from '@/registry/new-york/button/button'

export function ButtonExample() {
  const [pressCount, setPressCount] = useState(0)

  return (
    <div className="rounded-lg border border-rail bg-bg-soft p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="primary"
          size="md"
          touchTarget
          onClick={() => setPressCount((count) => count + 1)}
        >
          Check button
        </Button>
        <p className="text-sm text-ink-dim" role="status" aria-live="polite">
          {pressCount === 0
            ? 'Not pressed yet.'
            : `Pressed ${pressCount} ${pressCount === 1 ? 'time' : 'times'}.`}
        </p>
      </div>
    </div>
  )
}
