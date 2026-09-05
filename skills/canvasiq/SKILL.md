---
name: canvasiq
description: Inspect a CanvasIQ planning export, diagnose missing evidence, compare AI investment scenarios, and derive a minimum viable discovery brief using the repository's deterministic planning engine.
---

# CanvasIQ

Use `/canvasiq` with a CanvasIQ v2 project JSON to review an AI investment decision. Run from this repository after `npm ci`; do not upload the file or invoke a provider merely to inspect it.

1. Validate with `npx tsx scripts/canvasiq.ts validate --input <project.json>`.
2. Diagnose with `npx tsx scripts/canvasiq.ts diagnose --input <project.json>`. Inspect missing assumptions, blocked dependencies, unverified evidence, and financial completeness before recommending action.
3. Compare with `npx tsx scripts/canvasiq.ts scenarios --input <project.json>`. Separate scheduled totals from blocked initiatives; show which timing, benefit or cost assumption changes the decision.
4. Recommend the smallest useful discovery or pilot workflow. Name the operating problem, owner, inputs, output, success measure, uncertain assumptions and a stopping rule. Include manual/process-only options when they satisfy the need. A high modeled NPV is not evidence that AI is necessary.
5. Produce `brief` for a Markdown decision record or `handoff` for the versioned Promethean discovery format. Use `--output <new-file>` to save; existing files are protected from overwrite.

The optimizer examines all subsets through 12 initiatives under a deterministic earliest-fit scheduler, then uses a disclosed heuristic for larger inputs. Neither mode proves a globally optimal schedule. Financial arithmetic, dependencies and sensitivity must come from the shared engine rather than improvised formulas. See [../../docs/financial-model.md](../../docs/financial-model.md).

Preserve unknowns and distinguish user data, synthetic fixtures, AI suggestions and verified evidence. Return a concise recommendation with source fields and remaining questions. Handoff files carry `executionAuthorized: false`; they authorize no execution, external data sharing, or deployment. Ask for a specific missing artifact only when it blocks the requested analysis.
