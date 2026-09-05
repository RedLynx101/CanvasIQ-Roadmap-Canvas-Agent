import { z } from "zod";
import {
  Project,
  initiativeSchema,
  newInitiative,
  newProject,
  projectSchema,
} from "./schema";

export const workspaceSchema = z
  .object({
    version: z.literal(2),
    activeId: z.string(),
    projects: z.array(projectSchema).min(1).max(10),
  })
  .superRefine((w, ctx) => {
    if (
      new Set(w.projects.map((p) => p.id)).size !== w.projects.length ||
      !w.projects.some((p) => p.id === w.activeId)
    )
      ctx.addIssue({
        code: "custom",
        message: "Workspace project IDs are invalid.",
      });
  });
export type Workspace = z.infer<typeof workspaceSchema>;
// Includes embedded decision history; a valid exported project may exceed 2 MB.
export const MAX_PROJECT_BYTES = 20_000_000;
export function parseProject(raw: string): Project {
  if (new TextEncoder().encode(raw).length > MAX_PROJECT_BYTES)
    throw new Error("Project file exceeds 20 MB.");
  const input: unknown = JSON.parse(raw);
  return projectSchema.parse(input);
}
/** Migration leaves the original storage key untouched. Defaults are explicitly unverified. */
export function migrateLegacy(raw: string): Project {
  const legacy = z
    .object({
      state: z.object({
        companyName: z.string().optional(),
        industry: z.string().optional(),
        budgetConstraint: z.number().nonnegative().optional(),
        useCases: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              problemStatement: z.string().optional(),
              hardBenefits: z.number().nonnegative().optional(),
              implementationCost: z.number().nonnegative().optional(),
              annualCost: z.number().nonnegative().optional(),
              selected: z.boolean().optional(),
              dependencies: z.array(z.string()).optional(),
              timeframe: z.string().optional(),
            }),
          )
          .max(30),
      }),
    })
    .parse(JSON.parse(raw)).state;
  const p = newProject("migrated-legacy");
  p.name = "Imported legacy strategy";
  p.organization = legacy.companyName ?? "";
  p.industry = legacy.industry ?? "";
  // The old budget did not distinguish horizons. Preserve it as a note, not an invented allocation.
  p.objective = `Imported from CanvasIQ v1. Confirm funding by horizon and delivery assumptions. Legacy total budget: ${legacy.budgetConstraint ?? "unknown"}.`;
  p.initiatives = legacy.useCases.map((i) =>
    initiativeSchema.parse({
      ...newInitiative(i.id),
      name: i.name,
      problem: i.problemStatement ?? "",
      annualBenefit: i.hardBenefits ?? null,
      implementationCost: i.implementationCost ?? null,
      annualCost: i.annualCost ?? null,
      selected: i.selected ?? false,
      prerequisites: (i.dependencies ?? []).join("; "),
      startMonth:
        i.timeframe === "3-Year" ? 12 : i.timeframe === "1-Year" ? 3 : 0,
    }),
  );
  return projectSchema.parse(p);
}
