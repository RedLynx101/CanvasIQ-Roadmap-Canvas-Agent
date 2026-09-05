<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## CanvasIQ project conventions

- Keep finance, scheduling and validation in `domain/`; UI, CLI and AI tools must share that model.
- Preserve unknown estimates as `null`. Never invent savings, evidence or user-research results.
- AI proposals require review before application. Arithmetic and feasibility remain deterministic.
- Use the synthetic fixture in `data/example.ts` for demos and tests. Never commit credentials or runtime state.
- Run `npm run check` and the relevant browser workflow tests for behavioral changes. Use Node 24 and the lockfile.
- Review desktop, mobile, dark theme and print output when changing presentation. Capture curated assets with `scripts/capture-demo.mjs`.
- Keep model limitations and deployment conditions accurate in the README and `docs/`.
