import { describe, it, expect } from "vitest";
import {
  newProject,
  newInitiative,
  baseScenarios,
  projectSchema,
} from "../domain/schema";
import {
  cashFlows,
  summarize,
  portfolio,
  schedule,
  recommend,
  sensitivity,
} from "../domain/planning";
import { decisionMarkdown, prometheanHandoff } from "../domain/export";
import { parseProject, migrateLegacy } from "../domain/persistence";
import { exampleProject } from "../data/example";
const fixture = () => {
  const p = newProject("test");
  p.budgets = [1000, 1000, 1000];
  p.capacity = 2;
  p.scenarios[0].rampMonths = 1;
  p.initiatives = [
    {
      ...newInitiative("a"),
      name: "A",
      implementationCost: 120,
      annualCost: 0,
      annualBenefit: 120,
      selected: true,
      durationMonths: 1,
    },
  ];
  return p;
};
describe("consistent financial model", () => {
  it("uses monthly launch timing and annual discounting", () => {
    const p = fixture();
    const m = portfolio(p);
    expect(m.cost).toBe(120);
    expect(m.benefit).toBe(350);
    expect(m.payback).toBe(13);
    expect(m.npv).toBeCloseTo(
      -120 +
        Array.from({ length: 35 }, (_, i) => 10 / 1.1 ** ((i + 2) / 12)).reduce(
          (a, b) => a + b,
          0,
        ),
    );
    expect(m.near.cost + m.long.cost).toBeCloseTo(m.cost);
    expect(m.near.benefit + m.long.benefit).toBeCloseTo(m.benefit);
  });
  it("does not report zero-month payback for a loss", () => {
    const p = fixture();
    p.initiatives[0].annualCost = 240;
    expect(portfolio(p).payback).toBeNull();
    expect(portfolio(p).npv).toBeLessThan(0);
  });
  it("represents unknown values and free investments explicitly", () => {
    const p = fixture();
    p.initiatives[0].annualBenefit = null;
    expect(cashFlows(p.initiatives[0], 0, p, baseScenarios[0])).toBeNull();
    expect(portfolio(p).complete).toBe(false);
    p.initiatives[0].annualBenefit = 120;
    p.initiatives[0].implementationCost = 0;
    expect(portfolio(p).roi).toBeNull();
  });
  it("only reports sustained recovery after later investment", () => {
    expect(
      summarize(
        [
          { month: 0, cost: 0, benefit: 0, net: 0 },
          { month: 1, cost: 0, benefit: 10, net: 10 },
          { month: 2, cost: 100, benefit: 0, net: -100 },
        ],
        0,
      ).payback,
    ).toBeNull();
  });
  it("reduces value under conservative assumptions", () => {
    const p = exampleProject();
    expect(portfolio(p, p.scenarios[1]).npv).toBeLessThan(portfolio(p).npv);
    expect(sensitivity(p)).toBeGreaterThan(0);
    expect(sensitivity(p)).toBeLessThan(1);
  });
});
describe("feasible planning", () => {
  it("schedules prerequisites before their dependents", () => {
    const p = fixture();
    p.initiatives.push({ ...p.initiatives[0], id: "b", dependencies: ["a"] });
    const s = schedule(p);
    expect(s.items.find((i) => i.id === "b")!.start).toBeGreaterThanOrEqual(
      s.items.find((i) => i.id === "a")!.launch,
    );
  });
  it("blocks missing dependencies, cycles and unconfirmed prerequisites", () => {
    const p = fixture();
    p.initiatives[0].dependencies = ["missing"];
    expect(schedule(p).blocked).toHaveLength(1);
    p.initiatives[0].dependencies = ["a"];
    expect(schedule(p).blocked.length).toBeGreaterThan(0);
    p.initiatives[0].dependencies = [];
    p.initiatives[0].prerequisites = "Data access";
    expect(schedule(p).blocked).toHaveLength(1);
  });
  it("never exceeds funding or monthly capacity", () => {
    const p = exampleProject();
    const s = schedule(p);
    s.spend.forEach((n, h) => expect(n).toBeLessThanOrEqual(p.budgets[h]!));
    s.people.forEach((n) => expect(n).toBeLessThanOrEqual(p.capacity));
  });
  it("blocks unknown budgets and impossible capacity", () => {
    const p = fixture();
    p.budgets = [null, null, null];
    expect(schedule(p).blocked).toHaveLength(1);
    p.budgets = [1000, 1000, 1000];
    p.initiatives[0].people = 3;
    expect(schedule(p).blocked).toHaveLength(1);
  });
  it("finds the better small subset rather than a greedy high-value item", () => {
    const p = fixture();
    p.budgets = [100, 0, 0];
    p.capacity = 3;
    p.initiatives = [
      {
        ...p.initiatives[0],
        id: "a",
        implementationCost: 100,
        annualBenefit: 60,
      },
      {
        ...p.initiatives[0],
        id: "b",
        implementationCost: 50,
        annualBenefit: 40,
      },
      {
        ...p.initiatives[0],
        id: "c",
        implementationCost: 50,
        annualBenefit: 40,
      },
    ];
    expect(recommend(p).ids.sort()).toEqual(["b", "c"]);
  });
  it("can select a negative-value prerequisite that enables a valuable project", () => {
    const p = fixture();
    p.initiatives[0].annualBenefit = 0;
    p.initiatives.push({
      ...p.initiatives[0],
      id: "b",
      annualBenefit: 1000,
      dependencies: ["a"],
    });
    expect(recommend(p).ids.sort()).toEqual(["a", "b"]);
  });
  it("selects nothing when every feasible option destroys value", () => {
    const p = fixture();
    p.initiatives[0].annualBenefit = 0;
    expect(recommend(p).ids).toEqual([]);
  });
});
describe("portable and validated data", () => {
  it("rejects malformed numbers, duplicate IDs and unknown scenario", () => {
    const p = fixture();
    expect(projectSchema.safeParse({ ...p, discountRate: NaN }).success).toBe(
      false,
    );
    expect(
      projectSchema.safeParse({
        ...p,
        initiatives: [p.initiatives[0], p.initiatives[0]],
      }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...p, activeScenarioId: "missing" }).success,
    ).toBe(false);
  });
  it("round trips a project without losing evidence", () => {
    const p = exampleProject();
    expect(parseProject(JSON.stringify(p))).toEqual(p);
    expect(decisionMarkdown(p)).toContain(p.evidence[0].source);
    expect(prometheanHandoff(p).executionAuthorized).toBe(false);
  });
  it("round trips embedded history larger than 2 MB without dropping decisions", () => {
    const p = exampleProject();
    p.snapshots = Array.from({ length: 20 }, (_, n) => ({
      id: String(n),
      date: "2026-09-05",
      name: "Saved decision",
      rationale: "",
      selectedIds: [],
      selectedNames: [],
      npv: 0,
      roi: null,
      scenario: p.scenarios[0],
      assumptions: " ".repeat(149000),
    }));
    const exported = JSON.stringify(p, null, 2);
    expect(exported.length).toBeGreaterThan(2_000_000);
    expect(parseProject(exported).snapshots).toEqual(p.snapshots);
  });
  it("migrates old data without inventing horizon funding or resolved prerequisites", () => {
    const p = migrateLegacy(
      JSON.stringify({
        state: {
          companyName: "Legacy",
          budgetConstraint: 1000,
          useCases: [
            { id: "a", name: "Old", dependencies: ["Data warehouse"] },
          ],
        },
      }),
    );
    expect(p.organization).toBe("Legacy");
    expect(p.budgets).toEqual([null, null, null]);
    expect(p.initiatives[0].annualBenefit).toBeNull();
    expect(p.initiatives[0].prerequisitesReady).toBe(false);
  });
});
