"use client";
import { useState } from "react";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import {
  Initiative,
  Project,
  initiativeSchema,
  missingFinancials,
  newInitiative,
} from "../domain/schema";
import { initiativeMetrics } from "../domain/planning";
import { currency, percent } from "../domain/export";
import { updateProject } from "../store/workspace";
import { Button, Dialog, Field } from "./shared";

export function InitiativeEditor({
  initiative: i,
  project: p,
  onClose,
}: {
  initiative: Initiative;
  project: Project;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(i),
    [error, setError] = useState("");
  const patch = (v: Partial<Initiative>) => setDraft({ ...draft, ...v });
  const existing = p.initiatives.some((v) => v.id === i.id);
  return (
    <Dialog
      title={existing ? "Edit initiative" : "New initiative"}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const r = initiativeSchema.safeParse(draft);
          if (!r.success) {
            setError(r.error.issues[0].message);
            return;
          }
          try {
            updateProject((p) => {
              if (existing)
                p.initiatives = p.initiatives.map((item) =>
                  item.id === i.id ? r.data : item,
                );
              else p.initiatives.push(r.data);
            });
            onClose();
          } catch {
            setError(
              "Could not save. Check the project limit and input values.",
            );
          }
        }}
      >
        <Field label="Initiative name">
          <input
            required
            maxLength={160}
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>
        <Field label="Operating problem">
          <textarea
            maxLength={2000}
            rows={3}
            value={draft.problem}
            onChange={(e) => patch({ problem: e.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="Owner">
            <input
              maxLength={120}
              value={draft.owner}
              onChange={(e) => patch({ owner: e.target.value })}
            />
          </Field>
          <Field label="Success measure">
            <input
              maxLength={300}
              value={draft.kpi}
              onChange={(e) => patch({ kpi: e.target.value })}
            />
          </Field>
        </div>
        <h3>Financial assumptions</h3>
        <p className="muted">
          Annual benefits at full adoption. Leave unknown amounts blank.
        </p>
        {(["implementationCost", "annualCost", "annualBenefit"] as const).map(
          (key, index) => (
            <Field
              key={key}
              label={
                [
                  "Implementation cost ($)",
                  "Annual operating cost ($)",
                  "Annual benefit ($)",
                ][index]
              }
            >
              <input
                type="number"
                min={0}
                max={1e12}
                step="any"
                value={draft[key] ?? ""}
                onChange={(e) =>
                  patch({
                    [key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
          ),
        )}
        <div className="form-grid three">
          {(["effort", "impact"] as const).map((key) => (
            <Field
              key={key}
              label={`${key === "effort" ? "Effort" : "Impact"} (1–5)`}
            >
              <input
                type="number"
                required
                min={1}
                max={5}
                value={draft[key]}
                onChange={(e) => patch({ [key]: Number(e.target.value) })}
              />
            </Field>
          ))}
          <Field label="Risk">
            <select
              value={draft.risk}
              onChange={(e) =>
                patch({ risk: e.target.value as Initiative["risk"] })
              }
            >
              {["Low", "Medium", "High"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <h3>Delivery assumptions</h3>
        <div className="form-grid three">
          <Field label="Earliest start (month)">
            <input
              type="number"
              min={1}
              max={36}
              required
              value={draft.startMonth + 1}
              onChange={(e) =>
                patch({ startMonth: Number(e.target.value) - 1 })
              }
            />
          </Field>
          <Field label="Duration (months)">
            <input
              type="number"
              min={1}
              max={24}
              required
              value={draft.durationMonths}
              onChange={(e) =>
                patch({ durationMonths: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Delivery people">
            <input
              type="number"
              min={1}
              max={50}
              required
              value={draft.people}
              onChange={(e) => patch({ people: Number(e.target.value) })}
            />
          </Field>
        </div>
        <fieldset>
          <legend>Prerequisite initiatives</legend>
          {p.initiatives
            .filter((item) => item.id !== i.id)
            .map((item) => (
              <label className="check-row" key={item.id}>
                <input
                  type="checkbox"
                  checked={draft.dependencies.includes(item.id)}
                  onChange={(e) =>
                    patch({
                      dependencies: e.target.checked
                        ? [...draft.dependencies, item.id]
                        : draft.dependencies.filter((id) => id !== item.id),
                    })
                  }
                />
                {item.name}
              </label>
            ))}
          {p.initiatives.length < 2 && (
            <p className="muted">
              Add another initiative to link a prerequisite.
            </p>
          )}
        </fieldset>
        <Field label="External prerequisites">
          <textarea
            maxLength={1000}
            rows={2}
            value={draft.prerequisites}
            onChange={(e) => patch({ prerequisites: e.target.value })}
            placeholder="Data access, sensor installation, approvals…"
          />
        </Field>
        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.prerequisitesReady}
            onChange={(e) => patch({ prerequisitesReady: e.target.checked })}
          />
          External prerequisites are confirmed ready
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.selected}
            onChange={(e) => patch({ selected: e.target.checked })}
          />
          Include in selected portfolio
        </label>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="form-footer">
          {existing ? (
            <Button
              variant="danger ghost"
              onClick={() => {
                if (
                  confirm(
                    "Remove this initiative? Dependencies pointing to it will remain visible as blockers.",
                  )
                ) {
                  updateProject((p) => {
                    p.initiatives = p.initiatives.filter(
                      (item) => item.id !== i.id,
                    );
                    p.evidence = p.evidence.filter(
                      (e) => e.initiativeId !== i.id,
                    );
                  });
                  onClose();
                }
              }}
            >
              Remove
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit">Save initiative</Button>
        </div>
      </form>
    </Dialog>
  );
}
export function InitiativeTable({
  project: p,
  onEdit,
}: {
  project: Project;
  onEdit: (i: Initiative) => void;
}) {
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState("value");
  const rows = p.initiatives
    .filter((i) =>
      (i.name + " " + i.problem).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : (initiativeMetrics(b, p)?.npv ?? -Infinity) -
          (initiativeMetrics(a, p)?.npv ?? -Infinity),
    );
  return (
    <>
      <div className="table-tools">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search initiatives"
            placeholder="Find an initiative…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Sort initiatives"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="value">Sort by NPV</option>
          <option value="name">Sort by name</option>
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Initiative comparison; standalone estimates use requested start
            dates.
          </caption>
          <thead>
            <tr>
              <th scope="col">Select</th>
              <th scope="col">Initiative</th>
              <th scope="col" className="numeric">
                Implementation
              </th>
              <th scope="col" className="numeric">
                36-month NPV
              </th>
              <th scope="col" className="numeric">
                ROI
              </th>
              <th scope="col">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const m = initiativeMetrics(i, p);
              return (
                <tr key={i.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${i.name}`}
                      checked={i.selected}
                      onChange={(e) =>
                        updateProject((p) => {
                          p.initiatives.find((v) => v.id === i.id)!.selected =
                            e.target.checked;
                        })
                      }
                    />
                  </td>
                  <th scope="row">
                    <button className="row-link" onClick={() => onEdit(i)}>
                      {i.name}
                      <ArrowUpRight size={14} />
                    </button>
                    <small>{i.owner || "Owner unassigned"}</small>
                  </th>
                  <td className="numeric">{currency(i.implementationCost)}</td>
                  <td className={`numeric ${m && m.npv < 0 ? "negative" : ""}`}>
                    {currency(m?.npv ?? null)}
                  </td>
                  <td className="numeric">{percent(m?.roi ?? null)}</td>
                  <td>
                    <span
                      className={`tag ${missingFinancials(i).length ? "warning" : ""}`}
                    >
                      {missingFinancials(i).length
                        ? "Needs inputs"
                        : `${i.risk} risk`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="table-empty">
            No matching initiatives. Add one to start comparing.
          </p>
        )}
      </div>
      <p className="footnote">
        Standalone values assume the requested start. Portfolio values use the
        funded, capacity-constrained schedule.
      </p>
    </>
  );
}
export function Initiatives({ project: p }: { project: Project }) {
  const [editing, setEditing] = useState<Initiative | null>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>
            Initiative register{" "}
            <span className="count">{p.initiatives.length}</span>
          </h2>
          <p>Capture the operating problem before choosing the technology.</p>
        </div>
        <Button
          onClick={() => setEditing(newInitiative())}
          disabled={p.initiatives.length >= 30}
        >
          <Plus size={16} />
          Add initiative
        </Button>
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
