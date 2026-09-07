# n3wth/kit

Component registry + marketing site. hey@n3wth.com | github.com/n3wth/kit

## Quick Reference

```
registry/              # Publishable components (shadcn format)
├── new-york/[name]/   # UI components: button.tsx, card.tsx...
├── hooks/             # React hooks: use-theme.ts, use-toast.ts...
└── lib/               # Utilities: cn.ts

app/                   # Marketing site (kit.n3wth.com)
├── page.tsx           # Landing page
├── layout.tsx         # Root layout (applies Nav globally)
├── _components/       # Site chrome (NOT registry components)
│   ├── nav.tsx        # Site header
│   └── footer.tsx     # Site footer
└── [route]/page.tsx   # Other pages

registry.json          # Component manifest → builds to public/r/
```

## Chrome vs Registry

**Site chrome** lives in `app/_components/`. These are NOT shadcn registry components.

To edit site header/footer: modify `app/_components/nav.tsx` or `footer.tsx` directly.
Do NOT read `registry/new-york/nav/` or `registry/new-york/footer/` for site changes.

## Commands

```bash
npm run dev              # Dev server
npm run registry:build   # Build registry JSON
npm run build            # Build everything
```

## Code Style

TypeScript, 2 spaces, single quotes, no semicolons. Tailwind v4 with CSS vars.
Flat, minimal design. No shadows/gradients unless specified.

## Registry Protocol

Components in `registry/new-york/[name]/` have `[name].tsx` + `index.ts`.
Defined in `registry.json`, built to `public/r/[name].json`.
Install: `npx shadcn add https://kit.n3wth.com/r/[name].json`
