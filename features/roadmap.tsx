import { Project } from "../domain/schema";
import { portfolio, horizons } from "../domain/planning";
import { currency } from "../domain/export";
export function Roadmap({ project: p }: { project: Project }) {
  const { plan } = portfolio(p);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>A plan that fits</h2>
          <p>
            Dependencies first. Funding and delivery people determine the
            earliest feasible start.
          </p>
        </div>
        <span className="tag">36 months</span>
      </div>
      <div className="funding-row">
        {horizons.map((h, index) => (
          <div key={h}>
            <span>{h}</span>
            <strong>
              {currency(plan.spend[index])}{" "}
              <small>/ {currency(p.budgets[index])}</small>
            </strong>
            <progress
              aria-label={`${h} funding used`}
              value={plan.spend[index]}
              max={p.budgets[index] || 1}
            />
          </div>
        ))}
      </div>
      <div className="timeline">
        <div className="timeline-header">
          <span>Delivery schedule</span>
          <div>
            <span>Start</span>
            <span>12 months</span>
            <span>24 months</span>
            <span>36 months</span>
          </div>
        </div>
        {plan.items.map((item) => {
          const i = p.initiatives.find((i) => i.id === item.id)!;
          return (
            <div className="timeline-row" key={item.id}>
              <div>
                <strong>{i.name}</strong>
                <small>
                  {i.owner || "Owner unassigned"} · {i.people} people
                </small>
              </div>
              <div className="timeline-track">
                <div
                  className="timeline-bar"
                  style={{
                    left: `${(item.start / 36) * 100}%`,
                    width: `${((item.launch - item.start) / 36) * 100}%`,
                  }}
                  aria-label={`${i.name}: delivery months ${item.start + 1} through ${item.launch}`}
                >
                  <span>
                    {item.start + 1}–{item.launch}
                  </span>
                </div>
              </div>
              <p>
                {item.explanation} Benefits begin in month {item.launch + 1}
                {item.launch >= 36 ? " (outside this forecast)" : ""}.
              </p>
            </div>
          );
        })}
        {!plan.items.length && (
          <p className="table-empty">
            Select initiatives and resolve their constraints to build a
            schedule.
          </p>
        )}
      </div>
      <section className="capacity">
        <div className="section-heading">
          <div>
            <h2>Delivery capacity</h2>
            <p>
              Concurrent people required each month; operating staffing is
              excluded.
            </p>
          </div>
          <span>{p.capacity} available</span>
        </div>
        <div
          className="capacity-bars"
          role="img"
          aria-label={`Peak delivery capacity: ${Math.max(...plan.people)} of ${p.capacity} people.`}
        >
          {plan.people.map((n, i) => (
            <div
              key={i}
              title={`Month ${i + 1}: ${n} people`}
              style={{ height: `${Math.max(4, (n / p.capacity) * 100)}%` }}
            />
          ))}
        </div>
        <details>
          <summary>View monthly capacity</summary>
          <p>
            {plan.people
              .map((n, i) => `M${i + 1}: ${n}/${p.capacity}`)
              .join(" · ")}
          </p>
        </details>
      </section>
      {plan.blocked.length > 0 && (
        <section className="explanation warning">
          <h2>Resolve before committing</h2>
          <ul>
            {plan.blocked.map((b) => (
              <li key={b.id}>
                <strong>
                  {p.initiatives.find((i) => i.id === b.id)?.name}:
                </strong>{" "}
                {b.reason}
              </li>
            ))}
          </ul>
          <a href="/initiatives">Review initiative assumptions →</a>
        </section>
      )}
    </>
  );
}
