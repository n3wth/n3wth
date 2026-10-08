'use client'

import { useState } from 'react'
import { Button } from '@n3wth/ui'

export default function Client() {
  const [count, setCount] = useState(0)
  return <section>
    <Button onClick={() => setCount(count + 1)}>Root button</Button>
    <output data-testid="root-count">Root clicks: {count}</output>
  </section>
}
