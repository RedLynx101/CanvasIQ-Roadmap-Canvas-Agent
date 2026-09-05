"use client";
import { useState } from "react";
import { Project, projectSchema } from "../domain/schema";
import { updateProject } from "../store/workspace";
import { Button, Field } from "./shared";
export function Brief({ project: p }: { project: Project }) {
  const [draft, setDraft] = useState(p),
    [message, setMessage] = useState("");
  const patch = (v: Partial<Project>) => setDraft({ ...draft, ...v });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const result = projectSchema.safeParse(draft);
        if (!result.success) {
          setMessage(result.error.issues[0].message);
          return;
        }
        // The assistant may update initiatives while this form is open.
        // Save only fields owned by the brief, preserving those newer changes.
        const {
          name,
          organization,
          industry,
          objective,
          decisionOwner,
          startDate,
          discountRate,
          budgets,
          capacity,
        } = result.data;
        updateProject((current) =>
          Object.assign(current, {
            name,
            organization,
            industry,
            objective,
            decisionOwner,
            startDate,
            discountRate,
            budgets,
            capacity,
          }),
        );
        setMessage("Brief saved. Continue to initiatives.");
      }}
    >
      <div className="section-heading">
        <div>
          <h2>The decision to make</h2>
          <p>A clear objective is the starting point for a useful portfolio.</p>
        </div>
        <span className="section-number">01</span>
      </div>
      <div className="form-grid">
        <Field label="Strategy name">
          <input
            required
            maxLength={160}
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>
        <Field label="Organization">
          <input
            maxLength={160}
            value={draft.organization}
            onChange={(e) => patch({ organization: e.target.value })}
            placeholder="Your organization"
          />
        </Field>
        <Field label="Industry">
          <input
            maxLength={160}
            value={draft.industry}
            onChange={(e) => patch({ industry: e.target.value })}
          />
        </Field>
        <Field label="Decision owner">
          <input
            maxLength={120}
            value={draft.decisionOwner}
            onChange={(e) => patch({ decisionOwner: e.target.value })}
          />
        </Field>
      </div>
      <Field label="What outcome matters?">
        <textarea
          maxLength={2000}
          rows={3}
          value={draft.objective}
          onChange={(e) => patch({ objective: e.target.value })}
          placeholder="Describe the operating problem, the desired outcome and how you will measure it."
        />
      </Field>
      <div className="section-heading">
        <div>
          <h2>Resources & timing</h2>
          <p>
            Implementation funding per window. Ongoing operating costs are
            modeled separately.
          </p>
        </div>
        <span className="section-number">02</span>
      </div>
      <div className="form-grid three">
        {[
          "Months 1–3 budget ($)",
          "Months 4–12 budget ($)",
          "Months 13–36 budget ($)",
        ].map((label, i) => (
          <Field key={label} label={label} hint="Leave blank if unknown">
            <input
              type="number"
              min={0}
              max={1e12}
              value={draft.budgets[i] ?? ""}
              onChange={(e) => {
                const budgets = [...draft.budgets] as Project["budgets"];
                budgets[i] =
                  e.target.value === "" ? null : Number(e.target.value);
                patch({ budgets });
              }}
            />
          </Field>
        ))}
      </div>
      <div className="form-grid three">
        <Field label="Concurrent delivery people">
          <input
            type="number"
            min={1}
            max={50}
            required
            value={draft.capacity}
            onChange={(e) => patch({ capacity: Number(e.target.value) })}
          />
        </Field>
        <Field label="Planning start">
          <input
            type="date"
            required
            value={draft.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
        </Field>
        <Field label="Annual discount rate (%)">
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            required
            value={draft.discountRate * 100}
            onChange={(e) =>
              patch({ discountRate: Number(e.target.value) / 100 })
            }
          />
        </Field>
      </div>
      <div className="form-footer">
        <p role="status">
          {message || "All amounts in USD. Estimates are not guarantees."}
        </p>
        <Button type="submit">Save brief</Button>
      </div>
    </form>
  );
}
