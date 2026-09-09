export function TerminalDemo() {
  return (
    <div className="rounded-lg border border-rail bg-bg p-6">
      <p className="mb-4 text-sm text-ink-dim">Antigravity CLI setup</p>
      <pre className="overflow-x-auto text-sm text-ink"><code>{`agy mcp add r3 npx -y @n3wth/r3
agy mcp list`}</code></pre>
      <p className="mt-4 text-sm text-ink-dim">Start a session and use /mcp to inspect the connection.</p>
    </div>
  );
}
