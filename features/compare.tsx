"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Initiative, Project, scenarioFor } from "../domain/schema";
import { portfolio, sensitivity } from "../domain/planning";
import { currency, percent } from "../domain/export";
import { updateProject } from "../store/workspace";
import { InitiativeEditor, InitiativeTable } from "./initiatives";
import { Field } from "./shared";
export function Compare({ project: p }: { project: Project }) {
  const s = scenarioFor(p),
    m = portfolio(p),
    [editing, setEditing] = useState<Initiative | null>(null),
    [detail, setDetail] = useState(false);
  const points = m.flows.reduce<number[]>(
    (values, f) => [...values, (values.at(-1) ?? 0) + f.net],
    [],
  );
  const min = Math.min(0, ...points),
    max = Math.max(1, ...points);
  const y = (n: number) => 190 - ((n - min) / (max - min)) * 160;
  const path = points
      .map((n, i) => `${i === 0 ? "M" : "L"} ${(i / 36) * 600 + 15} ${y(n)}`)
      .join(" "),
    breakEven = sensitivity(p);
  return (
    <>
      <div className="scenario-tabs" aria-label="Planning scenario">
        {p.scenarios.map((s) => (
          <button
            key={s.id}
            aria-pressed={s.id === p.activeScenarioId}
            onClick={() =>
              updateProject((p) => {
                p.activeScenarioId = s.id;
              })
            }
          >
            {s.name}
          </button>
        ))}
      </div>
      {!m.complete && (
        <div className="alert" role="status">
          {m.plan.blocked.length} selected initiative(s) cannot be scheduled.
          Totals below include scheduled initiatives only. Resolve blockers in
          Roadmap.
        </div>
      )}
      <div className="metric-strip">
        <button
          className="metric"
          onClick={() => setDetail(!detail)}
          aria-expanded={detail}
        >
          <span>
            36-month net present value <ArrowUpRight size={14} />
          </span>
          <strong>{currency(m.npv)}</strong>
          <small>
            {percent(p.discountRate * 100)} discount rate · view calculation
          </small>
        </button>
        <div className="metric">
          <span>Return on investment</span>
          <strong>{percent(m.roi)}</strong>
          <small>Over the complete 36-month window</small>
        </div>
        <div className="metric">
          <span>Sustained payback</span>
          <strong>
            {m.payback === null ? "Not recovered" : `${m.payback} months`}
          </strong>
          <small>
            {m.plan.items.length} of{" "}
            {p.initiatives.filter((i) => i.selected).length} selected
            initiatives scheduled
          </small>
        </div>
      </div>
      {detail && (
        <div className="explanation">
          <h3>Where this number comes from</h3>
          <p>
            NPV = sum of each monthly net cash flow ÷ (1 + {p.discountRate}
            )^(month / 12). Modeled costs: {currency(m.cost)}. Benefits:{" "}
            {currency(m.benefit)}. ROI = (benefits − costs) ÷ costs.
            Implementation costs occur at delivery start; recurring costs and
            benefits begin after launch.
          </p>
          <a href="/evidence">Review source evidence →</a>
        </div>
      )}
      <div className="analysis-grid">
        <section className="cash-chart">
          <div className="section-heading">
            <div>
              <h2>The path to value</h2>
              <p>Cumulative net cash flow · {s.name.toLowerCase()}</p>
            </div>
            <span className="tag">USD</span>
          </div>
          <svg
            viewBox="0 0 630 235"
            role="img"
            aria-label={`Cumulative net cash flow ends at ${currency(m.benefit - m.cost)} after 36 months.`}
          >
            <line x1="15" x2="615" y1={y(0)} y2={y(0)} className="chart-zero" />
            <path d={`${path} L 615 205 L 15 205 Z`} className="chart-area" />
            <path d={path} className="chart-line" />
            {[0, 12, 24, 36].map((n) => (
              <text
                key={n}
                x={(n / 36) * 600 + 15}
                y="229"
                textAnchor={n === 0 ? "start" : n === 36 ? "end" : "middle"}
              >
                {n === 0 ? "Start" : `Month ${n}`}
              </text>
            ))}
            <circle cx="615" cy={y(points[36])} r="5" className="chart-dot" />
          </svg>
          <details>
            <summary>Monthly cash-flow table</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Costs</th>
                    <th>Benefits</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {m.flows.map((f) => (
                    <tr key={f.month}>
                      <td>{f.month}</td>
                      <td>{currency(f.cost)}</td>
                      <td>{currency(f.benefit)}</td>
                      <td>{currency(f.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <aside className="scenario-inspector">
          <span className="eyebrow">ASSUMPTIONS</span>
          <h2>Test the decision</h2>
          <p>Change this scenario to see what moves the result.</p>
          <div className="form-grid">
            {(
              [
                "benefitMultiplier",
                "costMultiplier",
                "delayMonths",
                "rampMonths",
              ] as const
            ).map((key, index) => (
              <Field
                key={key}
                label={
                  ["Benefit ×", "Cost ×", "Delay (months)", "Ramp (months)"][
                    index
                  ]
                }
              >
                <input
                  type="number"
                  min={
                    key === "rampMonths"
                      ? 1
                      : key === "costMultiplier"
                        ? 0.1
                        : 0
                  }
                  max={key.includes("Multiplier") ? 3 : 24}
                  step={key.includes("Multiplier") ? 0.05 : 1}
                  value={s[key]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (e.target.validity.valid)
                      updateProject((p) => {
                        p.scenarios.find((v) => v.id === p.activeScenarioId)![
                          key
                        ] = v;
                      });
                  }}
                />
              </Field>
            ))}
          </div>
          <div className="sensitivity">
            <span>Break-even benefit level</span>
            <strong>
              {breakEven === null
                ? "Unavailable"
                : `${(breakEven * 100).toFixed(0)}% of base`}
            </strong>
            <small>
              Benefit multiplier needed for nonnegative NPV, holding this
              scenario’s timing and costs fixed.
            </small>
          </div>
        </aside>
      </div>
      <div className="section-heading">
        <div>
          <h2>Compare the alternatives</h2>
          <p>
            All scenarios use the same portfolio and shared financial model.
          </p>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th className="numeric">NPV</th>
              <th className="numeric">ROI</th>
              <th>Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {p.scenarios.map((s) => {
              const m = portfolio(p, s);
              return (
                <tr key={s.id}>
                  <th>{s.name}</th>
                  <td className="numeric">{currency(m.npv)}</td>
                  <td className="numeric">{percent(m.roi)}</td>
                  <td>
                    {m.plan.items.length} /{" "}
                    {p.initiatives.filter((i) => i.selected).length}
                    {!m.complete ? " · incomplete" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="section-heading">
        <div>
          <h2>Initiatives, side by side</h2>
          <p>Select a name to review its assumptions.</p>
        </div>
      </div>
      <InitiativeTable project={p} onEdit={setEditing} />
      {editing && (
        <InitiativeEditor
          initiative={editing}
          project={p}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
