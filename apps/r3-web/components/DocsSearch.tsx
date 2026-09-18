'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Dialog, TextInput } from '@n3wth/ui/primitives';
import { Search, X } from 'lucide-react';
import { searchDocs, searchExcerpt, type SearchSection } from '@/lib/docs-search';

const SearchContext = createContext<(trigger?: HTMLElement) => void>(() => {});
const searchEndpoint = 'https://r3-docs-search.newth.workers.dev/ask';
type Answer = { answer: string; sources: Pick<SearchSection, 'id' | 'title' | 'heading' | 'href'>[] };

export function DocsSearchTrigger({ compact = false }: { compact?: boolean }) {
  const open = useContext(SearchContext);
  if (compact) return <Button label="Search docs" variant="ghost" size="sm" icon={<Search size={16} />} isIconOnly onClick={(event) => open(event.currentTarget)} />;
  return (
    <div className="text-sm font-normal text-ink-dim hover:text-ink transition-colors">
      <Button
        label="Search docs"
        variant="ghost"
        size="sm"
        icon={<Search size={16} />}
        onClick={(event) => open(event.currentTarget)}
        endContent={<span className="text-ink-faint">⌘K</span>}
        style={{ width: '100%', height: 'auto', justifyContent: 'flex-start', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', backgroundImage: 'none' }}
      />
    </div>
  );
}

export function DocsSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sections, setSections] = useState<SearchSection[]>([]);
  const [indexError, setIndexError] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const results = searchDocs(sections, query);

  function show(target?: HTMLElement) {
    trigger.current = target || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOpen(true);
  }

  useEffect(() => { if (!open) trigger.current?.focus(); }, [open]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!open) show();
        else close();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); request.current?.abort(); };
  }, [open]);

  useEffect(() => {
    if (!open || sections.length) return;
    const controller = new AbortController();
    setIndexError(false);
    fetch('/docs-index.json', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Index unavailable');
      setSections((await response.json()).sections);
    }).catch(() => { if (!controller.signal.aborted) setIndexError(true); });
    return () => controller.abort();
  }, [open, sections.length]);

  function close() {
    request.current?.abort();
    setLoading(false);
    setOpen(false);
  }

  function changeQuery(value: string) {
    request.current?.abort();
    setLoading(false);
    setAnswer(null);
    setError('');
    setQuery(value.slice(0, 500));
  }

  async function ask() {
    if (!query.trim() || loading) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setAnswer(null);
    setError('');
    try {
      const response = await fetch(searchEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'Too many questions. Try again in a minute.' : 'AI answers are unavailable. You can still search the docs below.');
      const data: Answer = await response.json();
      if (!controller.signal.aborted) setAnswer(data);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'The answer took too long. Try again or use the results below.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <SearchContext.Provider value={show}>
      {children}
      <Dialog isOpen={open} onOpenChange={(value) => value ? setOpen(true) : close()} width="min(680px, calc(100vw - 32px))" maxHeight="85dvh" aria-labelledby="docs-search-title" padding={6}>
        <div className="flex min-h-0 flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h2 id="docs-search-title" className="text-xl font-medium">Search docs</h2>
            <Button label="Close search" variant="ghost" size="sm" icon={<X size={18} />} isIconOnly onClick={close} />
          </div>
          {open && <TextInput label="Search or ask a question" isLabelHidden placeholder="Search or ask a question…" value={query} onChange={changeQuery} onEnter={ask} hasAutoFocus width="100%" startIcon={<Search size={16} />} />}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-dim">Answers use the published r3 docs.</p>
            <Button label="Ask AI" variant="secondary" size="sm" isDisabled={!query.trim()} isLoading={loading} onClick={ask} />
          </div>
          <div className="min-h-0 overflow-y-auto space-y-6" aria-busy={loading}>
            <div aria-live="polite">
              {loading && <p className="text-sm text-ink-dim">Reading the docs…</p>}
              {error && <p role="alert" className="text-sm text-ink-dim">{error}</p>}
              {answer && <section className="space-y-4" aria-label="AI answer">
                <p className="whitespace-pre-wrap text-sm leading-6">{answer.answer}</p>
                {answer.sources.length > 0 && <ol className="space-y-2 text-sm list-none">
                  {answer.sources.map((source, index) => <li key={source.id}>
                    <Link href={source.href} onClick={close} className="text-ink-dim hover:text-ink underline underline-offset-4">[{index + 1}] {source.title} · {source.heading}</Link>
                  </li>)}
                </ol>}
                <p className="text-xs text-ink-faint">AI-generated. Check the linked sources.</p>
              </section>}
            </div>
            <div className="space-y-1" aria-label="Search results">
              {indexError ? <p role="alert" className="text-sm text-ink-dim">Search could not load. Close and reopen to retry.</p>
                : !sections.length ? <p className="text-sm text-ink-dim">Loading documentation…</p>
                : !query.trim() ? <p className="text-sm text-ink-dim">Search tools, configuration, examples, and releases.</p>
                : !results.length ? <p className="text-sm text-ink-dim">No matching sections. Try a tool name or a shorter phrase.</p>
                : results.map((result) => <Link key={result.id} href={result.href} onClick={close} className="block rounded-lg p-3 hover:bg-bg-raise focus-visible:bg-bg-raise">
                  <span className="block text-sm font-medium">{result.title} · {result.heading}</span>
                  <span className="mt-1 block text-sm leading-5 text-ink-dim">{searchExcerpt(result.content, query)}</span>
                </Link>)}
            </div>
          </div>
        </div>
      </Dialog>
    </SearchContext.Provider>
  );
}
