'use client'

import { Button } from '@/registry/new-york/button/button'
import { Badge } from '@/registry/new-york/badge/badge'
import { Input } from '@/registry/new-york/input/input'
import { Switch } from '@/registry/new-york/switch/switch'
import { Progress } from '@/registry/new-york/progress/progress'
import { Avatar } from '@/registry/new-york/avatar/avatar'
import { InstallCommand } from './install-command'

/**
 * Registry components inherit the canonical n3wth tokens directly from
 * @n3wth/ui/theme (imported in globals.css), so no remapping is needed.
 */
function DesignSystemScope({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

const showcaseItems = [
  {
    name: 'Button',
    install: 'npx shadcn add https://kit.n3wth.com/r/button.json',
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg">Primary</Button>
        <Button variant="secondary" size="lg">Secondary</Button>
        <Button variant="ghost" size="lg">Ghost</Button>
        <Button variant="glass" size="lg">Glass</Button>
      </div>
    ),
  },
  {
    name: 'Badge',
    install: 'npx shadcn add https://kit.n3wth.com/r/badge.json',
    render: () => (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="sage" size="md">Success</Badge>
        <Badge variant="coral" size="md">Error</Badge>
        <Badge variant="mint" size="md">Info</Badge>
        <Badge variant="gold" size="md">Warning</Badge>
        <Badge variant="outline" size="md">Outline</Badge>
      </div>
    ),
  },
  {
    name: 'Input',
    install: 'npx shadcn add https://kit.n3wth.com/r/input.json',
    render: () => (
      <Input placeholder="Enter your email" inputSize="md" />
    ),
  },
  {
    name: 'Switch',
    install: 'npx shadcn add https://kit.n3wth.com/r/switch.json',
    render: () => (
      <div className="flex items-center gap-4">
        <Switch defaultChecked size="md" label="Toggle" />
        <Switch size="md" label="Toggle off" />
      </div>
    ),
  },
  {
    name: 'Progress',
    install: 'npx shadcn add https://kit.n3wth.com/r/progress.json',
    render: () => (
      <div className="flex flex-col gap-3">
        <Progress value={72} variant="success" size="md" />
        <Progress value={45} variant="warning" size="md" />
      </div>
    ),
  },
  {
    name: 'Avatar',
    install: 'npx shadcn add https://kit.n3wth.com/r/avatar.json',
    render: () => (
      <div className="flex items-center gap-3">
        <Avatar fallback="ON" size="lg" />
        <Avatar fallback="KT" size="lg" />
        <Avatar fallback="JD" size="lg" />
      </div>
    ),
  },
]

export function ComponentShowcase() {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-rail-strong bg-rail-strong sm:grid-cols-2 lg:grid-cols-3">
      {showcaseItems.map((item) => (
        <div key={item.name} className="flex flex-col bg-bg-raise p-6">
          <p className="text-xs font-medium tracking-wide uppercase text-ink-label">{item.name}</p>
          <DesignSystemScope>
            <div className="mt-5 flex-1 flex items-center">
              {item.render()}
            </div>
          </DesignSystemScope>
          <div className="mt-5">
            <InstallCommand command={item.install} />
          </div>
        </div>
      ))}
    </div>
  )
}
