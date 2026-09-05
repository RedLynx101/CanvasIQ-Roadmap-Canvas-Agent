# CanvasIQ v2 verification record

September 5, 2026. Implementation and verification were completed by a single primary agent. All examples and live-evaluation inputs were synthetic. Production deployment is a separate Noah-owned step.

| Gate                     | Evidence                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static checks and build  | `npm run check` passed ESLint, TypeScript, 27 Vitest domain/API tests and the Next.js production build on Node 24.11.1.                                                                                                                                                                                                   |
| Browser integration      | Six Playwright workflows passed against the production server, using installed Microsoft Edge 153 on Windows.                                                                                                                                                                                                             |
| Accessibility and reflow | Desktop and mobile axe checks reported no violations for the audited WCAG A/AA rules. Dialog opening/Escape/focus restoration, phone navigation, persisted dark mode and 320/720px reflow passed. A 720px layout exercises the content width of a 1440px display at 200% zoom; this is not a screen-reader certification. |
| Live model path          | Two bounded Luna evaluations passed: evidence review without mutation and a proposal preserving unknown costs/benefits. Total 9,296 input and 810 output tokens across four model requests; estimated cost about $0.003 at the rates checked during implementation.                                                       |
| CLI and skill            | All seven commands passed; output overwrite was refused; the Promethean handoff contains selected initiatives and no execution authority. The Codex skill validator passed.                                                                                                                                               |
| Visual and export review | Eight current screenshots reviewed across desktop, phone, light and dark. The three-page A4 example PDF was rendered and manually inspected; the brief and appendix preserve the shared model's figures, funding, capacity, initiative assumptions and all 15 evidence records.                                           |
| Dependency audit         | `npm audit --audit-level=high` reported zero vulnerabilities after dependency cleanup. This is a point-in-time package advisory check, not a security certification.                                                                                                                                                      |
| Repository CI            | `.github/workflows/ci.yml` repeats checks, audit and Chromium browser tests on Linux for pushes to main and pull requests. Consult the run for the exact commit being deployed.                                                                                                                                           |

## Integrated cases

The browser suite covers corrupt-storage recovery without overwriting the original; a complete manual planning journey; keyboard, theme and mobile behavior; explicit AI proposal acceptance and persistence through a later brief save; disabled-provider recovery; and blocked dependencies remaining visible and excluded from financial totals. Domain/API tests cover financial edge cases, known small-portfolio optima, dependency and capacity failures, migration, large decision-history round trips, admission controls, validated provider input, cancellation and split/truncated stream frames.

The release review corrected low-contrast navigation labels, dialog focus restoration, hidden mobile navigation focusability, a stale brief overwriting an accepted AI draft, and an import limit too small for embedded decision history. Large snapshots now explain their limit and direct users to a complete JSON export.

## Plan completion and deliberate boundaries

- Foundation: one schema and monthly model, shared fixture, regression cases, explicit unknowns and sustained portfolio payback.
- Design and core workflow: complete manual brief-to-decision journey, comparison and selection, project switching, import/export, recovery, light/dark and responsive layouts.
- AI: one typed Agents SDK agent, deterministic read-only tool, bounded requests, consent/access checks, cancellation and review-before-apply.
- Differentiators: scenarios and break-even sensitivity, evidence ledger, prerequisite/funding/capacity scheduling, and saved decision assumptions/rationale.
- Presentation: README, architecture and financial definitions, before/after case study, screenshots, example JSON/Markdown/PDF, contribution/security guidance, CI and MIT license.
- Workflow reuse: `/canvasiq` skill, shared-engine CLI and versioned nonexecuting Promethean discovery brief.
- Handoff: deployment, environment, migration and rollback instructions. No production deployment was performed.

Real-time collaboration, billing, broad connectors and autonomous execution remain deferred as the approved plan specified. Portfolio selection is exact for subsets up to 12 initiatives under the documented fixed scheduler, not a claim of globally optimal scheduling. The AI ledger requires one instance with durable storage; browser-local storage is not cloud backup.
