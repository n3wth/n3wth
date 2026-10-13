import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, HStack, Slider, VStack } from '@n3wth/ui/primitives'
import type { PulseTuning } from './storyInteractions'

const initial: PulseTuning = { duration: 1500, gap: 2700, length: .27, easing: 3, noise: .2, smoothing: .65, afterimages: .35 }
const easingNames = ['Linear', 'Quadratic out', 'Cubic out', 'Quartic out', 'Quintic out']

export default function PulseTuner({ onChange }: { onChange: (settings: PulseTuning) => void }) {
  const [settings, setSettings] = useState(initial)
  const [status, setStatus] = useState('Changes replay immediately.')
  useEffect(() => { onChange(settings) }, [settings, onChange])
  function update(key: keyof PulseTuning, value: number) {
    setSettings(current => ({ ...current, [key]: value }))
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
      setStatus('Settings copied.')
    } catch { setStatus('Copy unavailable. Use the values shown above.') }
  }
  return createPortal(<VStack as="aside" aria-label="Pulse tuning" gap={3} padding={4} style={{
    position: 'fixed', insetInlineEnd: 'var(--spacing-4)', insetBlockEnd: 'var(--spacing-4)',
    width: 'min(90vw, calc(var(--spacing-10) * 8))', maxHeight: '80dvh', overflow: 'auto',
    background: 'var(--color-background-popover)', color: 'var(--color-text-primary)',
    border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-md)',
  }}>
    <h2>Pulse tuning</h2>
    <Slider label="Travel time" min={100} max={2000} step={25} value={settings.duration} valueDisplay="text" formatValue={value => `${value} ms`} onChange={(value: number) => update('duration', value)} />
    <Slider label="Quiet gap between bursts" min={0} max={5000} step={100} value={settings.gap} valueDisplay="text" formatValue={value => `${value} ms`} onChange={(value: number) => update('gap', value)} />
    <Slider label="Pulse length" min={.02} max={.3} step={.01} value={settings.length} valueDisplay="text" formatValue={value => `${Math.round(value * 100)}%`} onChange={(value: number) => update('length', value)} />
    <Slider label="Easing" min={1} max={5} step={1} value={settings.easing} valueDisplay="text" formatValue={value => easingNames[value - 1]} onChange={(value: number) => update('easing', value)} />
    <Slider label="Noise" min={0} max={1} step={.05} value={settings.noise} valueDisplay="text" formatValue={value => `${Math.round(value * 100)}%`} onChange={(value: number) => update('noise', value)} />
    <Slider label="Smoothing" min={0} max={1} step={.05} value={settings.smoothing} valueDisplay="text" formatValue={value => `${Math.round(value * 100)}%`} onChange={(value: number) => update('smoothing', value)} />
    <Slider label="Afterimages" min={0} max={1} step={.05} value={settings.afterimages} valueDisplay="text" formatValue={value => `${Math.round(value * 100)}%`} onChange={(value: number) => update('afterimages', value)} />
    <HStack gap={2} wrap="wrap">
      <Button size="sm" label="Replay" onClick={() => setSettings(current => ({ ...current }))} />
      <Button size="sm" label="Reset" onClick={() => setSettings({ ...initial })} />
      <Button size="sm" label="Copy settings" onClick={copy} />
    </HStack>
    <p role="status">{status}</p>
    <p>Preview only. Reduced motion stays respected.</p>
  </VStack>, document.body)
}
