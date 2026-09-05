"use client";
import { useState } from "react";
import { Download, Printer, BookmarkPlus } from "lucide-react";
import { Project, scenarioFor } from "../domain/schema";
import {
  currency,
  percent,
  decisionMarkdown,
  prometheanHandoff,
} from "../domain/export";
import { portfolio } from "../domain/planning";
import { updateProject } from "../store/workspace";
import { Button, Field, download, Mark } from "./shared";
export function Decision({ project: p }: { project: Project }) {
  const m = portfolio(p),
    [name, setName] = useState(""),
    [rationale, setRationale] = useState(""),
    [notice, setNotice] = useState("");
  return (
    <>
      <div className="export-toolbar no-print">
        <Button
          variant="secondary"
          onClick={() =>
            download(JSON.stringify(p, null, 2), "canvasiq-project.json")
          }
        >
          <Download size={16} />
          Project JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            download(
              decisionMarkdown(p),
              "canvasiq-decision.md",
              "text/markdown",
            )
          }
        >
          Markdown
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            download(
              JSON.stringify(prometheanHandoff(p), null, 2),
              "promethean-discovery-brief.json",
            )
          }
        >
          Promethean brief
        </Button>
        <Button onClick={() => window.print()}>
          <Printer size={16} />
          Print / PDF
        </Button>
      </div>
      <article className="decision-document">
        <header className="document-header">
          <div>
            <span className="eyebrow">
              <Mark /> CANVASIQ / DECISION BRIEF
            </span>
            <h2>{p.name}</h2>
            <p>
              {p.organization || "Organization not specified"} · {p.startDate} ·{" "}
              {scenarioFor(p).name}
            </p>
          </div>
          <span className="tag">
            {p.synthetic ? "Synthetic example" : "Planning estimates"}
          </span>
        </header>
        <section className="document-objective">
          <span className="eyebrow">THE OBJECTIVE</span>
          <p>{p.objective || "Define the objective in your brief."}</p>
          <small>Decision owner: {p.decisionOwner || "Unassigned"}</small>
        </section>
        <div className="document-metrics">
          <div>
            <span>36-month NPV</span>
            <strong>{currency(m.npv)}</strong>
          </div>
          <div>
            <span>36-month ROI</span>
            <strong>{percent(m.roi)}</strong>
          </div>
          <div>
            <span>Sustained payback</span>
            <strong>
              {m.payback === null ? "Not recovered" : `${m.payback} months`}
            </strong>
          </div>
        </div>
        {!m.complete && (
          <p className="alert">
            Incomplete portfolio: {m.plan.blocked.length} blocked initiative(s)
            are excluded from financial totals.
          </p>
        )}
        <h3>Selected initiatives & delivery</h3>
        <table>
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Owner</th>
              <th>Delivery</th>
            </tr>
          </thead>
          <tbody>
            {p.initiatives
              .filter((i) => i.selected)
              .map((i) => {
                const slot = m.plan.items.find((s) => s.id === i.id);
                return (
                  <tr key={i.id}>
                    <th>
                      {i.name}
                      <small>{i.kpi || "Success measure not specified"}</small>
                    </th>
                    <td>{i.owner || "Unassigned"}</td>
                    <td>
                      {slot
                        ? `Months ${slot.start + 1}–${slot.launch}`
                        : m.plan.blocked.find((b) => b.id === i.id)?.reason}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className="document-periods">
          <div>
            <h3>Months 0–12</h3>
            <p>
              Costs {currency(m.near.cost)}
              <br />
              Benefits {currency(m.near.benefit)}
              <br />
              Period ROI {percent(m.near.roi)}
            </p>
          </div>
          <div>
            <h3>Months 13–36</h3>
            <p>
              Costs {currency(m.long.cost)}
              <br />
              Benefits {currency(m.long.benefit)}
              <br />
              Period ROI {percent(m.long.roi)}
            </p>
          </div>
        </div>
        <p className="footnote">
          Monthly model in USD at {percent(p.discountRate * 100)} annual
          discount rate. Period ROI is not an independent investment return.
          Estimates depend on supplied assumptions; see the complete appendix.
        </p>
        <section className="document-appendix">
          <h2>Assumptions & evidence appendix</h2>
          <div className="markdown-document">
            {decisionMarkdown(p)
              .split("\n\n")
              .slice(6)
              .map((block, index) =>
                block.startsWith("## ") ? (
                  <h3 key={index}>{block.slice(3)}</h3>
                ) : (
                  <p key={index}>{block}</p>
                ),
              )}
          </div>
        </section>
      </article>
      <section className="no-print">
        <div className="section-heading">
          <div>
            <h2>Keep a record of the decision</h2>
            <p>
              A snapshot preserves the assumptions, selection and rationale at
              this point in time.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              updateProject((p) => {
                const m = portfolio(p);
                const assumptions = JSON.stringify({
                  ...p,
                  snapshots: [],
                  conversation: [],
                });
                if (assumptions.length > 150000)
                  throw new Error(
                    "This project is too large for an embedded snapshot. Export Project JSON to preserve the complete decision instead.",
                  );
                p.snapshots.push({
                  id: crypto.randomUUID(),
                  date: new Date().toISOString(),
                  name: name || "Portfolio decision",
                  rationale,
                  selectedIds: p.initiatives
                    .filter((i) => i.selected)
                    .map((i) => i.id),
                  selectedNames: p.initiatives
                    .filter((i) => i.selected)
                    .map((i) => i.name),
                  npv: m.complete ? m.npv : null,
                  roi: m.complete ? m.roi : null,
                  scenario: structuredClone(scenarioFor(p)),
                  assumptions,
                });
              });
              setName("");
              setRationale("");
              setNotice("Decision snapshot saved.");
            } catch (error) {
              setNotice(
                error instanceof Error
                  ? error.message
                  : "Could not save this snapshot. Export Project JSON to preserve the decision.",
              );
            }
          }}
        >
          <div className="form-grid">
            <Field label="Decision name">
              <input
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="October portfolio review"
              />
            </Field>
            <Field label="Why this portfolio?">
              <input
                maxLength={2000}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Tradeoffs, rejected options, next review…"
              />
            </Field>
          </div>
          <Button type="submit" disabled={p.snapshots.length >= 20}>
            <BookmarkPlus size={16} />
            Save decision snapshot
          </Button>
          <p role="status">{notice}</p>
        </form>
        <div className="decision-history">
          {[...p.snapshots].reverse().map((s) => (
            <article key={s.id}>
              <header>
                <h3>{s.name}</h3>
                <time>{s.date.slice(0, 10)}</time>
              </header>
              <p>{s.rationale || "No rationale recorded."}</p>
              <p>{s.selectedNames.join(", ") || "No initiatives selected"}</p>
              <small>
                Saved NPV: {currency(s.npv)} · Current difference:{" "}
                {s.npv !== null && m.complete
                  ? currency(m.npv - s.npv)
                  : "Unavailable"}
              </small>
              <div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    download(s.assumptions, `canvasiq-snapshot-${s.id}.json`)
                  }
                >
                  Export saved assumptions
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
