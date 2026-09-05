# Deployment handoff

Noah owns redeployment. The repository's new version does not prove the existing hosted demo is running it.

## Build and serve

Use Node 24 and the committed lockfile:

```sh
npm ci
npm run check
npm run start -- --hostname 0.0.0.0 --port 3000
```

For Replit, use `npm ci && npm run build` as the build command and `npm run start -- --hostname 0.0.0.0 --port 3000` as the run command. Bind the configured external port to 3000, or replace 3000 with the platform's required port. No external database is needed. The manual product requires no secret configuration.

## Optional AI

Keep `AI_ENABLED=false` for an unrestricted public demo. To enable the assistant on a controlled deployment, configure the variables documented in `env.example` through the host's secret manager. Never put them in client-visible `NEXT_PUBLIC_*` variables or commit an env file.

`AI_ACCESS_TOKEN` is a deployment access code, not an organizational account system. Share it only with intended users. It must be at least 24 characters and stays in the browser panel's memory; it is not persisted with the project. Every request requires explicit consent and validates the active project. The server rejects cross-origin browser requests.

The default model is `gpt-5.6-luna`. Each run has at most three model turns, 2,500 output tokens per turn, no automatic provider retries, and a 60-second route deadline. The request body is bounded to 90 KB. A file-locked ledger admits at most 20 attempts per UTC day by default, with five seconds between admissions. Failed attempts consume slots. This is a request/token bound, not an exact dollar cap. Monitor provider usage and configure available account controls; do not assume that a budget alert is a hard spending cap.

Mount a persistent writable directory at `AI_STATE_DIR`. Do not run multiple replicas with independent ledgers: each would get its own allowance. Use one process/instance with shared durable admission storage, or implement a centralized atomic quota service before scaling. Ephemeral hosts that cannot preserve the ledger should leave AI disabled. A stale lock or corrupt ledger fails closed; investigate before removing it, and preserve its usage history. Do not reset the ledger as a normal retry step.

## Data and migration

Projects, evidence, snapshots and recent assistant conversation are stored in the current browser. Export JSON before changing hosts, clearing browser storage or transferring to another device. Export/import creates an independent project copy. A limit of 10 projects, 30 initiatives, 200 evidence records and 20 decision snapshots bounds the local workspace. Project imports allow up to 20 MB so embedded decision history can round-trip. Embedded snapshots allow 150,000 characters of planning assumptions and exclude chat history; larger projects should use Project JSON exports as their decision record. Browser storage may reach its own quota sooner; the UI warns and keeps unsaved changes in memory for export.

Legacy v1 data remains in its original storage key. Migration preserves initiative estimates but treats horizon budgets as unknown and legacy dependency strings as unconfirmed external prerequisites. Review those assumptions before trusting a migrated portfolio. Retain a JSON backup before removing old storage.

## Release checklist

1. Record the exact Git commit being deployed and confirm CI for that revision.
2. Build from the lockfile with Node 24. Configure AI only if its storage/access conditions are met.
3. Check the root, `/compare`, `/initiatives`, `/roadmap` and `/canvas`; old `/dashboard` and `/interview` URLs redirect.
4. Load the synthetic example, edit an initiative, switch scenarios, recommend a portfolio, refresh, export/import JSON and print the decision brief.
5. Check phone navigation, dark mode and keyboard operation. Confirm synthetic labeling and actual data handling.
6. Record the live deployment URL and revision. Only then describe it as deployed.

## Rollback

Keep the prior deployment available until verification finishes. If the new build fails, redeploy the preceding known-good commit through the host. Browser v2 and legacy storage keys are separate; rollback does not migrate v2 data backward. Export v2 projects first and keep their JSON files for returning to v2 later. The migration does not delete the legacy key.
