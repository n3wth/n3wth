# AI Context Packs for @n3wth/kit

Structured context files that help AI coding assistants understand the @n3wth/kit component registry.

## Files

| File | Purpose | Target |
|---|---|---|
| `cursorrules` | Natural language instructions and component catalog | Cursor AI |
| `AGENTS.md` | Component API reference with props and patterns | AI coding tools |
| `mcp.json` | MCP server config for shadcn registry access | Any MCP client |
| `components.json` | Structured JSON with every component's props, usage, and a11y notes | Programmatic / any AI |

## Setup

### Cursor
Copy `cursorrules` to your project root:
```bash
cp public/ai/cursorrules .cursorrules
```

### AI Context Pack
Copy `AGENTS.md` to your project root:
```bash
cp public/ai/AGENTS.md AGENTS.md
```

### MCP (Cursor, Windsurf, etc.)
Copy `mcp.json` to your editor config directory:
```bash
# Cursor
cp public/ai/mcp.json .cursor/mcp.json

# Other MCP clients
cp public/ai/mcp.json .mcp/mcp.json
```

The MCP server provides direct registry access, letting the AI install and inspect components from the registry.

### Programmatic
Use `components.json` directly for custom tooling or AI pipelines. It contains structured prop types, usage examples, and accessibility notes for every component.
