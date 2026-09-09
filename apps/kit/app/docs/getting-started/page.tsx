import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Getting started', description: 'Install registry components and add Antigravity CLI project context.' }

export default function Guide() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Getting started</h1>
      <h2 className="mt-10 text-xl text-ink">Install a component</h2>
      <pre className="mt-4 overflow-x-auto text-sm">npx shadcn add https://kit.n3wth.com/r/button.json</pre>
      <h2 className="mt-10 text-xl text-ink">Add project context</h2>
      <p className="mt-4 text-ink-dim">Download the context file and merge its component guidance into your existing GEMINI.md. Keep your project instructions. Antigravity CLI loads this file as project context.</p>
      <a className="mt-4 inline-block text-ink" href="/ai/GEMINI.md">Download GEMINI.md</a>
      <p className="mt-4 text-ink-dim">Review generated code and run your project checks before shipping changes.</p>
      <a className="mt-4 inline-block text-ink" href="https://antigravity.google/docs/rules-workflows/">Antigravity CLI context documentation</a>
    </main>
  )
}
