"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Evidence, Project, evidenceSchema } from "../domain/schema";
import { evidenceLabels } from "../domain/export";
import { updateProject } from "../store/workspace";
import { Button, Dialog, Field } from "./shared";
export function EvidenceLedger({ project: p }: { project: Project }) {
  const [draft, setDraft] = useState<Evidence | null>(null),
    [error, setError] = useState("");
  const patch = (v: Partial<Evidence>) =>
    setDraft(draft ? { ...draft, ...v } : null);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Make the assumptions inspectable</h2>
          <p>
            Sources, owners and confidence travel with every exported decision.
          </p>
        </div>
        <Button
          disabled={p.evidence.length >= 200}
          title={
            p.evidence.length >= 200
              ? "This project has reached its 200-record evidence limit."
              : undefined
          }
          onClick={() =>
            setDraft({
              id: crypto.randomUUID(),
              initiativeId: p.initiatives[0]?.id ?? "",
              field: "annualBenefit",
              source: "",
              owner: "",
              date: new Date().toISOString().slice(0, 10),
              rationale: "",
              confidence: "Unverified",
              origin: "User",
            })
          }
        >
          <Plus size={16} />
          Add evidence
        </Button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Initiative / assumption</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Confidence</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {p.evidence.map((e) => (
              <tr key={e.id}>
                <th>
                  {p.initiatives.find((i) => i.id === e.initiativeId)?.name ??
                    "Project"}
                  <small>{evidenceLabels[e.field]}</small>
                </th>
                <td>
                  {e.source || "Source missing"}
                  <small>
                    {e.date} · {e.origin}
                  </small>
                </td>
                <td>{e.owner || "Unassigned"}</td>
                <td>
                  <span
                    className={`tag ${e.confidence === "Unverified" ? "warning" : ""}`}
                  >
                    {e.confidence}
                  </span>
                </td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => setDraft(e)}
                    aria-label={`Edit evidence for ${p.initiatives.find((i) => i.id === e.initiativeId)?.name ?? "project"} ${e.field}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!p.evidence.length && (
          <p className="table-empty">
            No evidence recorded. Add the source behind a key estimate.
          </p>
        )}
      </div>
      {draft && (
        <Dialog title="Assumption evidence" onClose={() => setDraft(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const r = evidenceSchema.safeParse(draft);
              if (!r.success) {
                setError(r.error.issues[0].message);
                return;
              }
              updateProject((p) => {
                const index = p.evidence.findIndex((e) => e.id === draft.id);
                if (index >= 0) p.evidence[index] = r.data;
                else p.evidence.push(r.data);
              });
              setDraft(null);
            }}
          >
            <Field label="Initiative">
              <select
                value={draft.initiativeId}
                onChange={(e) => patch({ initiativeId: e.target.value })}
              >
                <option value="">Project-wide</option>
                {p.initiatives.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assumption">
              <select
                value={draft.field}
                onChange={(e) =>
                  patch({ field: e.target.value as Evidence["field"] })
                }
              >
                {Object.entries(evidenceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Source or reference">
              <textarea
                maxLength={2000}
                rows={2}
                value={draft.source}
                onChange={(e) => patch({ source: e.target.value })}
                placeholder="Operating report, interview note, estimate…"
              />
            </Field>
            <Field label="Rationale">
              <textarea
                maxLength={2000}
                rows={3}
                value={draft.rationale}
                onChange={(e) => patch({ rationale: e.target.value })}
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
              <Field label="Date">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Field>
              <Field label="Confidence">
                <select
                  value={draft.confidence}
                  onChange={(e) =>
                    patch({
                      confidence: e.target.value as Evidence["confidence"],
                    })
                  }
                >
                  {["Unverified", "Low", "Medium", "High"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Origin">
                <select
                  value={draft.origin}
                  onChange={(e) =>
                    patch({ origin: e.target.value as Evidence["origin"] })
                  }
                >
                  {[
                    "User",
                    "Imported",
                    "AI suggestion",
                    "Synthetic example",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            {error && <p role="alert">{error}</p>}
            <div className="form-footer">
              <Button
                variant="danger ghost"
                onClick={() => {
                  updateProject((p) => {
                    p.evidence = p.evidence.filter((e) => e.id !== draft.id);
                  });
                  setDraft(null);
                }}
              >
                Remove evidence
              </Button>
              <Button type="submit">Save evidence</Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
