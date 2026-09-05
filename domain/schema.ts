import { z } from "zod";

const text = z.string().max(2000);
const money = z.number().finite().min(0).max(1e12);
export const moneyInput = money.nullable();
export const scenarioSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  benefitMultiplier: z.number().min(0).max(3),
  costMultiplier: z.number().min(0.1).max(3),
  delayMonths: z.number().int().min(0).max(24),
  rampMonths: z.number().int().min(1).max(24),
});
export const evidenceSchema = z.object({
  id: z.string().min(1).max(80),
  initiativeId: z.string().max(80),
  field: z.enum([
    "annualBenefit",
    "implementationCost",
    "annualCost",
    "schedule",
    "other",
  ]),
  source: text,
  owner: z.string().max(120),
  date: z.string().max(30),
  rationale: text,
  confidence: z.enum(["Unverified", "Low", "Medium", "High"]),
  origin: z.enum(["User", "Imported", "AI suggestion", "Synthetic example"]),
});
export const initiativeSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  problem: text,
  owner: z.string().max(120),
  kpi: z.string().max(300),
  implementationCost: moneyInput,
  annualCost: moneyInput,
  annualBenefit: moneyInput,
  effort: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  risk: z.enum(["Low", "Medium", "High"]),
  selected: z.boolean(),
  dependencies: z.array(z.string().min(1).max(80)).max(30),
  prerequisites: z.string().max(1000),
  prerequisitesReady: z.boolean(),
  startMonth: z.number().int().min(0).max(35),
  durationMonths: z.number().int().min(1).max(24),
  people: z.number().int().min(1).max(50),
});
export const snapshotSchema = z.object({
  id: z.string().max(80),
  date: z.string().max(40),
  name: z.string().max(120),
  rationale: text,
  selectedIds: z.array(z.string().max(80)).max(30),
  selectedNames: z.array(z.string().max(160)).max(30),
  npv: z.number().finite().nullable(),
  roi: z.number().finite().nullable(),
  scenario: scenarioSchema,
  assumptions: z.string().max(150000),
});
export const projectSchema = z
  .object({
    version: z.literal(2),
    id: z.string().min(1).max(80),
    name: z.string().trim().min(1).max(160),
    organization: z.string().max(160),
    industry: z.string().max(160),
    objective: text,
    decisionOwner: z.string().max(120),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    synthetic: z.boolean(),
    discountRate: z.number().min(0).max(1),
    budgets: z.tuple([moneyInput, moneyInput, moneyInput]),
    capacity: z.number().int().min(1).max(50),
    initiatives: z.array(initiativeSchema).max(30),
    evidence: z.array(evidenceSchema).max(200),
    scenarios: z.array(scenarioSchema).min(1).max(6),
    activeScenarioId: z.string().max(80),
    snapshots: z.array(snapshotSchema).max(20),
    conversation: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(5000),
        }),
      )
      .max(20)
      .default([]),
  })
  .superRefine((p, ctx) => {
    for (const [key, values] of [
      ["initiatives", p.initiatives],
      ["scenarios", p.scenarios],
      ["evidence", p.evidence],
    ] as const) {
      if (new Set(values.map((v) => v.id)).size !== values.length)
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "IDs must be unique.",
        });
    }
    if (!p.scenarios.some((s) => s.id === p.activeScenarioId))
      ctx.addIssue({
        code: "custom",
        path: ["activeScenarioId"],
        message: "Choose an existing scenario.",
      });
    const date = new Date(p.startDate);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== p.startDate
    )
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Enter a valid start date.",
      });
  });
export type Project = z.infer<typeof projectSchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export const baseScenarios: Scenario[] = [
  {
    id: "base",
    name: "Base case",
    benefitMultiplier: 1,
    costMultiplier: 1,
    delayMonths: 0,
    rampMonths: 3,
  },
  {
    id: "conservative",
    name: "Conservative",
    benefitMultiplier: 0.7,
    costMultiplier: 1.2,
    delayMonths: 3,
    rampMonths: 6,
  },
  {
    id: "upside",
    name: "Upside",
    benefitMultiplier: 1.2,
    costMultiplier: 0.95,
    delayMonths: 0,
    rampMonths: 2,
  },
];
export function newInitiative(id = crypto.randomUUID()): Initiative {
  return {
    id,
    name: "New initiative",
    problem: "",
    owner: "",
    kpi: "",
    implementationCost: null,
    annualCost: null,
    annualBenefit: null,
    effort: 3,
    impact: 3,
    risk: "Medium",
    selected: false,
    dependencies: [],
    prerequisites: "",
    prerequisitesReady: false,
    startMonth: 0,
    durationMonths: 3,
    people: 1,
  };
}
export function newProject(id = crypto.randomUUID()): Project {
  return {
    version: 2,
    id,
    name: "Untitled strategy",
    organization: "",
    industry: "",
    objective: "",
    decisionOwner: "",
    startDate: new Date().toISOString().slice(0, 10),
    synthetic: false,
    discountRate: 0.1,
    budgets: [null, null, null],
    capacity: 2,
    initiatives: [],
    evidence: [],
    scenarios: structuredClone(baseScenarios),
    activeScenarioId: "base",
    snapshots: [],
    conversation: [],
  };
}
export function scenarioFor(p: Project): Scenario {
  return p.scenarios.find((s) => s.id === p.activeScenarioId)!;
}
export function missingFinancials(i: Initiative): string[] {
  return (
    ["implementationCost", "annualCost", "annualBenefit"] as const
  ).filter((k) => i[k] === null);
}
