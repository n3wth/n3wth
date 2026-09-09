# n3wth/kit

A React component registry with design context for Antigravity CLI.

## Install components

```sh
npx shadcn add https://kit.n3wth.com/r/button.json
```

## Project context

Download https://kit.n3wth.com/ai/GEMINI.md and merge its component guidance into your project’s GEMINI.md. Preserve any existing project instructions. Antigravity CLI loads GEMINI.md as project context; review generated changes and run your project checks.

- Components: https://kit.n3wth.com/components
- Setup: https://kit.n3wth.com/docs/getting-started
- Context guide: https://kit.n3wth.com/docs/agents
- Source: https://github.com/n3wth/n3wth/tree/main/apps/kit
- Antigravity context reference: https://antigravity.google/docs/rules-workflows/

## Development

From the workspace root, run `npm run dev -w @n3wth/kit` or `npm run check -w @n3wth/kit`. Registry sources remain in `registry/` and generated assets in `public/r/`.

## License

MIT
