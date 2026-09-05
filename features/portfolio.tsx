"use client";
import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { Initiative, Project } from "../domain/schema";
import { currency } from "../domain/export";
import { initiativeMetrics, portfolio, recommend } from "../domain/planning";
import { updateProject } from "../store/workspace";
import { Button } from "./shared";
import { InitiativeEditor } from "./initiatives";
const quadrants = [
  {
    title: "Quick wins",
    description: "High impact · lower effort",
    accept: (i: Initiative) => i.impact >= 4 && i.effort <= 3,
  },
  {
    title: "Strategic investments",
    description: "High impact · higher effort",
    accept: (i: Initiative) => i.impact >= 4 && i.effort > 3,
  },
  {
    title: "Incremental improvements",
    description: "Lower impact · lower effort",
    accept: (i: Initiative) => i.impact < 4 && i.effort <= 3,
  },
  {
    title: "Reconsider",
    description: "Lower impact · higher effort",
    accept: (i: Initiative) => i.impact < 4 && i.effort > 3,
  },
];
export function Portfolio({ project: p }: { project: Project }) {
  const [result, setResult] = useState<ReturnType<typeof recommend> | null>(
      null,
    ),
    [editing, setEditing] = useState<Initiative | null>(null),
    [busy, setBusy] = useState(false);
  const m = portfolio(p);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Choose what earns a place</h2>
          <p>Balance impact with a funded, feasible delivery plan.</p>
        </div>
        <Button
          disabled={busy || !p.initiatives.length}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              const r = recommend(p);
              setResult(r);
              updateProject((p) => {
                p.initiatives.forEach((i) => {
                  i.selected = r.ids.includes(i.id);
                });
              });
              setBusy(false);
            }, 0);
          }}
        >
          <WandSparkles size={16} />
          {busy ? "Comparing…" : "Recommend portfolio"}
        </Button>
      </div>
      <div className="selection-summary">
        <strong>
          {p.initiatives.filter((i) => i.selected).length} selected
        </strong>
        <span>{m.plan.items.length} scheduled</span>
        <span>{m.plan.blocked.length} blocked</span>
        <span className="push">
          Scheduled NPV <b>{currency(m.npv)}</b>
        </span>
      </div>
      <div className="quadrants">
        {quadrants.map((q, index) => (
          <section key={q.title} className="quadrant">
            <header>
              <span className="section-number">0{index + 1}</span>
              <div>
                <h2>{q.title}</h2>
                <p>{q.description}</p>
              </div>
            </header>
            {p.initiatives.filter(q.accept).map((i) => (
              <div
                className={`selection-row ${i.selected ? "selected" : ""}`}
                key={i.id}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={i.selected}
                    aria-label={`Include ${i.name}`}
                    onChange={(e) => {
                      setResult(null);
                      updateProject((p) => {
                        p.initiatives.find((v) => v.id === i.id)!.selected =
                          e.target.checked;
                      });
                    }}
                  />
                  <span>
                    <strong>{i.name}</strong>
                    <small>
                      {currency(i.implementationCost)} implementation ·{" "}
                      {i.risk.toLowerCase()} risk
                    </small>
                  </span>
                </label>
                <button className="text-button" onClick={() => setEditing(i)}>
                  Details
                </button>
                <p>
                  Standalone NPV{" "}
                  <b>{currency(initiativeMetrics(i, p)?.npv ?? null)}</b>
                </p>
              </div>
            ))}
            {!p.initiatives.some(q.accept) && (
              <p className="muted quadrant-empty">
                No initiatives in this group.
              </p>
            )}
          </section>
        ))}
      </div>
      {result && (
        <section className="explanation" aria-live="polite">
          <h3>Why this portfolio</h3>
          <p>
            {result.method}. Maximizes modeled NPV among the feasible subsets
            examined. Risk and impact remain visible judgments; they are not
            dollar multipliers.
          </p>
          <ul>
            {result.reasons.map((r) => (
              <li key={r.id}>
                <strong>
                  {p.initiatives.find((i) => i.id === r.id)?.name}:
                </strong>{" "}
                {r.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="footnote">
        Recommendations use implementation funding and concurrent delivery
        capacity. An exhaustive subset search is used through 12 initiatives;
        larger portfolios use a disclosed heuristic. Scheduling order is
        deterministic, so this is not a global schedule optimum.
      </p>
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
