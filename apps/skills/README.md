# Skills for Gemini CLI

Markdown instructions for Gemini CLI. Browse the catalog at https://skills.n3wth.com.

```bash
curl -fsSL https://skills.n3wth.com/install.sh | bash -s -- gemini
```

Install a selected skill by appending its ID:

```bash
curl -fsSL https://skills.n3wth.com/install.sh | bash -s -- gemini gsap-animations
```

Downloads install under `~/.gemini/skills` and preserve existing files. Catalog entries without downloadable content are marked unavailable.

Source lives in `apps/skills` in https://github.com/n3wth/n3wth. Run `npm ci` at the workspace root, then `npm run check --workspace @n3wth/skills`.
