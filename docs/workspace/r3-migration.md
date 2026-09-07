# r3 website migration

Source: n3wth/r3 main 895c27fe3525eb9cdb559180a08d302fa18ae0f9, matching the production snapshot. Only website/ is imported into apps/r3-web. Original repository history, core package and release authority remain in n3wth/r3.

Next remains 15.5.19 and the registry UI package remains exactly 0.9.1. Direct dependency versions are pinned to the source lockfile. React/React DOM align from 19.1.0 to workspace 19.2.7, and React types align to 19.2.9/19.2.3 to avoid multiple React module identities and missing Three JSX augmentation. A stable environment.d.ts makes typecheck work before Next generates next-env.d.ts.

Framer Motion remains 12.23.12. Its motion-dom 12.23.12 and motion-utils 12.23.6 dependencies are explicitly pinned to their original lock versions: the newer hoisted motion-dom removed activeAnimations, breaking the existing Framer Motion import. No animation implementation was rewritten.

Vercel preview configuration uses apps/r3-web, Node 24, Next.js, the root npm 11.19.1 install and app-local build/output. Next tracing and Turbopack roots include workspace dependencies. Original regions and deployment settings are retained. Current production remains on the old source until preview verification and cutover; the previous project runtime is Node 22.

Validation: app typecheck and production build pass. Twelve browser checks cover home, docs, nested installation, discovery endpoints and OG image at 390/852/1440px. Mobile screenshot inspected. The core memory tests are separate N-419 work and are not suppressed by this migration.
