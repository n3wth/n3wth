export function TerminalDemo() {
  return (
    <div className="rounded-lg border border-rail bg-bg p-6">
      <p className="mb-4 text-sm text-ink-dim">Gemini CLI setup</p>
      <pre className="overflow-x-auto text-sm text-ink"><code>{`gemini mcp add r3 npx -y @n3wth/r3
gemini mcp list`}</code></pre>
      <p className="mt-4 text-sm text-ink-dim">Start a session and use /mcp to inspect the connection.</p>
    </div>
  );
}
