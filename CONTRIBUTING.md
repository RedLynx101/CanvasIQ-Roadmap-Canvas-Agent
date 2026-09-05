# Contributing

Use Node 24, run `npm ci`, then `npm run dev`. Keep changes focused and explain the user-visible behavior in a pull request.

Before submitting, run `npm run check`. For browser changes, run `npx playwright install chromium` and `npm run test:e2e`; the test server uses the production build. `PLAYWRIGHT_CHANNEL=msedge` or `chrome` can use an installed browser when download access is restricted.

Keep financial logic in `domain/`; use it from UI, CLI and AI tools. Add regression cases for changed formulas or scheduling behavior. Do not duplicate demo fixtures, silently replace missing assumptions with zero, or make a financial claim without its horizon and assumptions.

Use synthetic inputs in fixtures and screenshots. Do not commit env files, local projects, API transcripts, runtime ledgers, test traces or provider keys. New AI operations require explicit schemas, bounded execution and a reviewable state transition.

Visual changes should include actual desktop and narrow-screen evidence. Preserve keyboard semantics, visible focus, readable contrast and reduced-motion behavior. Keep screenshots and docs accurate to the committed implementation.
