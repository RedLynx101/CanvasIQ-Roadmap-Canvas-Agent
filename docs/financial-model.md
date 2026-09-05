# Financial and planning model

CanvasIQ models 36 months of nominal USD cash flows. Every screen, CLI command and export uses `domain/planning.ts`. The model is an estimate under explicit assumptions, not investment advice or a prediction of realized savings.

## Time and costs

- Internal month 0 is the planning start; delivery labels use months 1–36.
- Implementation cost is charged at the scheduled start. Funding windows are starts in months 0–2, 3–11 and 12–35. They fund implementation only.
- Annual operating costs are divided by 12 and begin in the month after delivery finishes.
- Annual benefits mean full-adoption annual benefits. Monthly benefits begin after delivery and ramp linearly over the scenario's ramp months. No benefits are recognized before launch.
- A scenario changes benefits, implementation/operating costs, earliest start delay and benefit ramp. It carries no invented probability.
- No tax, inflation, depreciation, residual value, operating staffing capacity or monetized soft benefits are modeled.

## Metrics

`NPV = sum(monthly net cash flow / (1 + annual discount rate)^(month / 12))`.

`ROI = (total modeled benefits - total modeled costs) / total modeled costs × 100`. Zero cost yields “Not available,” not an infinite return. The headline window is months 0–36. Period summaries use months 0–12 and 13–36 consistently for costs, benefits and ROI. Period ROI is not an independent project investment return.

Payback is the first month after the final negative cumulative balance, provided the portfolio ends nonnegative and produces benefits. This avoids claiming recovery before a later investment sends the balance negative again. A portfolio that does not recover in the forecast window says so. It is not an average of project paybacks.

Standalone initiative comparisons use requested starts and scenario delay. The selected portfolio uses its actual constrained schedule. Blocked projects are excluded from totals and prominently disclosed; they do not silently become zero-value successful projects. Unknown financial inputs remain `null` and prevent scheduling.

Risk, impact and effort are decision judgments. They are never multiplied into dollar NPV. Confidence describes the supplied evidence, not a probability of success.

## Scheduling and selection

The scheduler orders selected initiatives by requested start and stable ID, recursively schedules prerequisites, then finds each initiative's earliest funded slot within delivery capacity. Dependencies refer to initiative IDs; missing/unselected prerequisites, cycles, unconfirmed external prerequisites, unknown financial inputs and infeasible capacity remain blockers. Delivery capacity means simultaneous people assigned during implementation.

For up to 12 initiatives, recommendation enumerates every subset and selects the highest positive NPV subset feasible under this fixed earliest-fit scheduler. A negative-value foundation can be selected when it enables greater downstream value. For 13–30 initiatives, a dependency-aware greedy search is used and labeled as a heuristic. Neither method optimizes over every possible scheduling order. The empty portfolio is a valid recommendation when no positive-value feasible subset is found.

Sensitivity solves for the benefit multiplier that yields nonnegative NPV while holding the active scenario's costs, ramp and timing fixed. It searches multipliers from 0 to 3. Missing/blocked portfolios, no selected projects and break-even beyond that range return “Unavailable.”

## Evidence

Each evidence record has an initiative/field, source, owner, date, rationale, confidence and origin. Accepting an AI draft does not verify its estimates; changed financial fields receive unverified AI-origin records. The synthetic example intentionally includes unverified assumptions. Replace them before using the project for a real decision.

Regression coverage includes independent arithmetic expectations, late investments, unknown and zero-cost inputs, loss-making projects, dependencies/cycles, capacity/budgets, and a small counterexample to naive greedy selection.
