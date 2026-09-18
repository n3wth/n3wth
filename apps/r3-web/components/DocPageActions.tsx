'use client';

import { useState } from 'react';
import { Button } from '@n3wth/ui/primitives';
import { Copy, Check } from 'lucide-react';

export function DocPageActions({ slug }: { slug: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const href = `/docs-markdown/${slug}`;
  async function copy() {
    setStatus('loading');
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error('Unable to load page');
      await navigator.clipboard.writeText(await response.text());
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm not-prose">
      <Button label={status === 'copied' ? 'Copied' : 'Copy page'} variant="ghost" size="sm" icon={status === 'copied' ? <Check size={16} /> : <Copy size={16} />} isLoading={status === 'loading'} onClick={copy} />
      <Button label="Markdown" variant="ghost" size="sm" href={href} />
      <span role="status" className="text-ink-dim">{status === 'error' ? 'Copy failed. Open Markdown to copy manually.' : status === 'copied' ? 'Page copied as Markdown.' : ''}</span>
    </div>
  );
}
