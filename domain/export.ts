import { Evidence, Project, scenarioFor } from "./schema";
import { portfolio, recommend, sensitivity } from "./planning";
export const currency = (n: number | null) =>
  n === null
    ? "Not available"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
export const percent = (n: number | null) =>
  n === null ? "Not available" : `${n.toFixed(1)}%`;
export const evidenceLabels: Record<Evidence["field"], string> = {
  annualBenefit: "Annual benefit",
  implementationCost: "Implementation cost",
  annualCost: "Annual operating cost",
  schedule: "Delivery schedule",
  other: "Other assumption",
};
export function decisionData(p: Project) {
  const metrics = portfolio(p),
    selected = p.initiatives.filter((i) => i.selected);
  return {
    project: p,
    metrics,
    selected,
    scenario: scenarioFor(p),
    breakEven: sensitivity(p),
  };
}
export function decisionMarkdown(p: Project): string {
  const { metrics: m, selected, scenario: s } = decisionData(p);
  return [
    `# ${p.name}`,
    `${p.organization || "Organization not specified"} · ${p.synthetic ? "Synthetic example" : "Planning estimates"} · ${s.name}`,
    "## Decision brief",
    p.objective || "Objective not specified.",
    `Owner: ${p.decisionOwner || "Unassigned"} | Start: ${p.startDate}`,
    `Selected: ${selected.length} | Scheduled: ${m.plan.items.length} | Blocked: ${m.plan.blocked.length}`,
    `36-month NPV: ${currency(m.npv)} | ROI: ${percent(m.roi)} | Sustained payback: ${m.payback === null ? "Not recovered within 36 months" : `Month ${m.payback}`}`,
    m.complete
      ? "All selected initiatives have a feasible schedule."
      : "INCOMPLETE: financial totals include scheduled initiatives only. Resolve blocked items before making a decision.",
    "## Financial model",
    `USD. ${percent(p.discountRate * 100)} annual discount rate. Implementation costs at start; recurring costs and benefits after delivery; benefits ramp over ${s.rampMonths} months. Scenario benefit multiplier ${s.benefitMultiplier}, cost multiplier ${s.costMultiplier}, delay ${s.delayMonths} months. No inflation, tax, residual value or monetized soft benefits.`,
    `Months 0–12: costs ${currency(m.near.cost)}, benefits ${currency(m.near.benefit)}, ROI ${percent(m.near.roi)}.`,
    `Months 13–36: costs ${currency(m.long.cost)}, benefits ${currency(m.long.benefit)}, ROI ${percent(m.long.roi)}. Period ROI is not an independent investment return.`,
    `Implementation funding: months 1–3 ${currency(p.budgets[0])}; months 4–12 ${currency(p.budgets[1])}; months 13–36 ${currency(p.budgets[2])}. Concurrent delivery capacity: ${p.capacity} people. Industry: ${p.industry || "Not specified"}.`,
    "## Portfolio and roadmap",
    ...p.initiatives.map((i) => {
      const item = m.plan.items.find((t) => t.id === i.id),
        blocked = m.plan.blocked.find((t) => t.id === i.id);
      const prerequisites = i.dependencies
        .map(
          (id) =>
            p.initiatives.find((entry) => entry.id === id)?.name ??
            `Missing initiative (${id})`,
        )
        .join(", ");
      return `- ${i.name} — ${!i.selected ? "Not selected" : item ? `delivery months ${item.start + 1}–${item.launch}; ${item.explanation}` : `Blocked: ${blocked?.reason}`}\n  Problem: ${i.problem || "Not specified"}. Owner: ${i.owner || "Unassigned"}; KPI: ${i.kpi || "Not specified"}; risk: ${i.risk}; prerequisites: ${prerequisites || "none"}; external: ${i.prerequisites || "none"} (${i.prerequisitesReady ? "confirmed ready" : "not confirmed"}).`;
    }),
    "## Assumption appendix",
    ...p.initiatives.map(
      (i) =>
        `- ${i.name}: implementation ${currency(i.implementationCost)}; annual operating ${currency(i.annualCost)}; annual full-adoption benefit ${currency(i.annualBenefit)}; ${i.people} delivery people for ${i.durationMonths} months, requested start month ${i.startMonth + 1}. Impact ${i.impact}/5; effort ${i.effort}/5 (qualitative ratings).`,
    ),
    "## Evidence ledger",
    ...(p.evidence.length
      ? p.evidence.map(
          (e) =>
            `- ${p.initiatives.find((i) => i.id === e.initiativeId)?.name ?? "Project"} / ${evidenceLabels[e.field]}: ${e.source || "Source missing"}; ${e.owner || "Owner missing"}; ${e.date || "Undated"}; ${e.confidence}; ${e.origin}. ${e.rationale}`,
        )
      : ["No evidence recorded."]),
    "## Decision history",
    ...(p.snapshots.length
      ? p.snapshots.map(
          (s) =>
            `- ${s.date}: ${s.name} — ${s.rationale || "No rationale supplied"}. Selected: ${s.selectedNames.join(", ") || "none"}. NPV: ${currency(s.npv)}.`,
        )
      : ["No decisions recorded."]),
    "## Limitations",
    "Estimates are conditional on supplied assumptions. Capacity represents concurrent delivery people; operating staffing is not scheduled. Fixed earliest-fit scheduling is not a global scheduling optimum. Data remains in this browser unless exported or explicitly sent to the optional AI assistant. Generated by CanvasIQ.",
  ].join("\n\n");
}
export function prometheanHandoff(p: Project) {
  return {
    schema: "canvasiq.promethean-brief",
    version: 1,
    executionAuthorized: false,
    project: p.name,
    objective: p.objective,
    synthetic: p.synthetic,
    initiatives: p.initiatives
      .filter((i) => i.selected)
      .map((i) => ({
        id: i.id,
        name: i.name,
        problem: i.problem,
        kpi: i.kpi,
        owner: i.owner,
        dependencies: i.dependencies,
        assumptions: {
          implementationCost: i.implementationCost,
          annualCost: i.annualCost,
          annualBenefit: i.annualBenefit,
        },
        evidence: p.evidence.filter((e) => e.initiativeId === i.id),
      })),
    nextAction:
      "Diagnose the minimum viable workflow; validate assumptions and request explicit authority before execution.",
  };
}
export function diagnose(p: Project) {
  return {
    project: p.name,
    missing: p.initiatives.flatMap((i) =>
      (["implementationCost", "annualCost", "annualBenefit"] as const)
        .filter((k) => i[k] === null)
        .map((field) => ({ id: i.id, field })),
    ),
    unverifiedEvidence: p.evidence.filter((e) => e.confidence === "Unverified")
      .length,
    metrics: portfolio(p),
    recommendation: recommend(p),
    breakEven: sensitivity(p),
  };
}
