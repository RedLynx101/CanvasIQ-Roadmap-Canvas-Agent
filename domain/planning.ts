import {
  Initiative,
  Project,
  Scenario,
  missingFinancials,
  scenarioFor,
} from "./schema";

export const horizonIndex = (month: number) =>
  month < 3 ? 0 : month < 12 ? 1 : 2;
export const horizons = ["Months 1–3", "Months 4–12", "Months 13–36"];
export type Scheduled = {
  id: string;
  start: number;
  launch: number;
  explanation: string;
};
export type Schedule = {
  items: Scheduled[];
  blocked: { id: string; reason: string }[];
  spend: number[];
  people: number[];
};

/** Deterministic earliest-fit schedule. Budget funds implementation; capacity covers delivery only. */
export function schedule(
  p: Project,
  scenario: Scenario = scenarioFor(p),
): Schedule {
  const selected = p.initiatives.filter((i) => i.selected);
  const result: Schedule = {
    items: [],
    blocked: [],
    spend: [0, 0, 0],
    people: Array(36).fill(0),
  };
  const visiting = new Set<string>();
  const done = new Set<string>();
  const byId = new Map(selected.map((i) => [i.id, i]));
  function place(i: Initiative): boolean {
    if (done.has(i.id)) return result.items.some((s) => s.id === i.id);
    if (visiting.has(i.id)) return false;
    visiting.add(i.id);
    const block = (reason: string) => {
      result.blocked.push({ id: i.id, reason });
      done.add(i.id);
      visiting.delete(i.id);
      return false;
    };
    if (missingFinancials(i).length)
      return block("Complete the cost and benefit assumptions.");
    if (i.prerequisites.trim() && !i.prerequisitesReady)
      return block("External prerequisites are not confirmed ready.");
    for (const dep of i.dependencies) {
      if (!byId.has(dep))
        return block("A prerequisite initiative is missing or not selected.");
      if (!place(byId.get(dep)!))
        return block(
          "A prerequisite is blocked or part of a dependency cycle.",
        );
    }
    const afterDeps = Math.max(
      0,
      ...i.dependencies.map(
        (id) => result.items.find((s) => s.id === id)!.launch,
      ),
    );
    const earliest = Math.max(i.startMonth + scenario.delayMonths, afterDeps);
    const cost = i.implementationCost! * scenario.costMultiplier;
    for (let start = earliest; start + i.durationMonths <= 36; start++) {
      const h = horizonIndex(start);
      if (
        p.budgets[h] === null ||
        result.spend[h] + cost > p.budgets[h]! + 0.001
      )
        continue;
      if (
        result.people
          .slice(start, start + i.durationMonths)
          .some((n) => n + i.people > p.capacity)
      )
        continue;
      for (let m = start; m < start + i.durationMonths; m++)
        result.people[m] += i.people;
      result.spend[h] += cost;
      result.items.push({
        id: i.id,
        start,
        launch: start + i.durationMonths,
        explanation:
          start > earliest
            ? "Moved later to fit implementation funding and delivery capacity."
            : i.dependencies.length
              ? "Starts after its prerequisites finish."
              : "Fits the requested start, funding and capacity.",
      });
      visiting.delete(i.id);
      done.add(i.id);
      return true;
    }
    return block(
      "No funded capacity slot within the 36-month planning window.",
    );
  }
  [...selected]
    .sort((a, b) => a.startMonth - b.startMonth || a.id.localeCompare(b.id))
    .forEach(place);
  return result;
}

export type CashMonth = {
  month: number;
  cost: number;
  benefit: number;
  net: number;
};
export function cashFlows(
  i: Initiative,
  start: number,
  p: Project,
  s: Scenario,
): CashMonth[] | null {
  if (missingFinancials(i).length) return null;
  const launch = start + i.durationMonths;
  return Array.from({ length: 37 }, (_, month) => {
    const operating = month > launch;
    const ramp = operating ? Math.min(1, (month - launch) / s.rampMonths) : 0;
    const benefit = ((i.annualBenefit! * s.benefitMultiplier) / 12) * ramp;
    const cost =
      (month === start ? i.implementationCost! * s.costMultiplier : 0) +
      (operating ? (i.annualCost! * s.costMultiplier) / 12 : 0);
    return { month, cost, benefit, net: benefit - cost };
  });
}
export function summarize(flows: CashMonth[], discountRate: number) {
  const cost = flows.reduce((sum, f) => sum + f.cost, 0),
    benefit = flows.reduce((sum, f) => sum + f.benefit, 0);
  const npv = flows.reduce(
    (sum, f) => sum + f.net / Math.pow(1 + discountRate, f.month / 12),
    0,
  );
  let cumulative = 0,
    recovery: number | null = null;
  for (const f of flows) {
    cumulative += f.net;
    if (f.month > 0 && cumulative >= 0 && benefit > 0 && recovery === null)
      recovery = f.month;
  }
  // Recovery must be sustained after later investments, not a transient early surplus.
  if (recovery !== null) {
    cumulative = 0;
    let lastNegative = -1;
    for (const f of flows) {
      cumulative += f.net;
      if (cumulative < -0.001) lastNegative = f.month;
    }
    recovery =
      cumulative >= 0 && benefit > 0 ? Math.max(0, lastNegative + 1) : null;
  }
  return {
    cost,
    benefit,
    npv,
    roi: cost > 0 ? ((benefit - cost) / cost) * 100 : null,
    payback: recovery,
  };
}
export function portfolio(p: Project, s: Scenario = scenarioFor(p)) {
  const plan = schedule(p, s);
  const flows: CashMonth[] = Array.from({ length: 37 }, (_, month) => ({
    month,
    cost: 0,
    benefit: 0,
    net: 0,
  }));
  for (const item of plan.items) {
    const i = p.initiatives.find((i) => i.id === item.id)!;
    cashFlows(i, item.start, p, s)!.forEach((f, m) => {
      flows[m].cost += f.cost;
      flows[m].benefit += f.benefit;
      flows[m].net += f.net;
    });
  }
  return {
    ...summarize(flows, p.discountRate),
    flows,
    plan,
    complete: plan.blocked.length === 0,
    near: summarize(
      flows.filter((f) => f.month <= 12),
      p.discountRate,
    ),
    long: summarize(
      flows.filter((f) => f.month > 12),
      p.discountRate,
    ),
  };
}
export function initiativeMetrics(
  i: Initiative,
  p: Project,
  s: Scenario = scenarioFor(p),
) {
  const flows = cashFlows(i, i.startMonth + s.delayMonths, p, s);
  return flows ? summarize(flows, p.discountRate) : null;
}

/** Enumerates all subsets up to 12 items under a fixed, documented earliest-fit scheduler. */
export function recommend(p: Project) {
  const n = p.initiatives.length,
    s = scenarioFor(p);
  let bestIds: string[] = [],
    bestValue = 0;
  const evaluate = (ids: string[]) => {
    const candidate = {
      ...p,
      initiatives: p.initiatives.map((i) => ({
        ...i,
        selected: ids.includes(i.id),
      })),
    };
    const m = portfolio(candidate, s);
    if (m.complete && m.npv > bestValue + 0.001) {
      bestValue = m.npv;
      bestIds = ids;
    }
  };
  if (n <= 12) {
    for (let mask = 1; mask < 2 ** n; mask++)
      evaluate(
        p.initiatives
          .filter((_, i) => (mask & (1 << i)) !== 0)
          .map((i) => i.id),
      );
  } else {
    const ranked = [...p.initiatives].sort(
      (a, b) =>
        (initiativeMetrics(b, p, s)?.npv ?? -Infinity) -
        (initiativeMetrics(a, p, s)?.npv ?? -Infinity),
    );
    for (const i of ranked) {
      const closure = new Set(bestIds);
      const collect = (id: string) => {
        if (closure.has(id)) return;
        closure.add(id);
        p.initiatives.find((i) => i.id === id)?.dependencies.forEach(collect);
      };
      collect(i.id);
      evaluate([...closure]);
    }
  }
  return {
    ids: bestIds,
    npv: bestValue,
    method:
      n <= 12
        ? "Exhaustive subsets · fixed earliest-fit schedule"
        : "Greedy dependency-aware heuristic · no optimality guarantee",
    reasons: p.initiatives.map((i) => ({
      id: i.id,
      reason: bestIds.includes(i.id)
        ? "Included in the best feasible portfolio found."
        : missingFinancials(i).length
          ? "Missing financial assumptions."
          : "Excluded by value, prerequisites, capacity or funding constraints.",
    })),
  };
}
export function sensitivity(p: Project) {
  const s = scenarioFor(p),
    base = portfolio(p, s);
  let lo = 0,
    hi = 3;
  if (
    portfolio(p, { ...s, benefitMultiplier: hi }).npv < 0 ||
    !base.complete ||
    !base.plan.items.length
  )
    return null;
  for (let n = 0; n < 36; n++) {
    const mid = (lo + hi) / 2;
    if (portfolio(p, { ...s, benefitMultiplier: mid }).npv >= 0) hi = mid;
    else lo = mid;
  }
  return hi;
}
