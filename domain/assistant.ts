import { z } from "zod";
import { Project, initiativeSchema, projectSchema } from "./schema";
export const proposalSchema = z.object({
  targetId: z.string().nullable(),
  initiative: initiativeSchema.omit({ id: true, selected: true }),
});
export const answerSchema = z.object({
  answer: z.string().max(5000),
  questions: z.array(z.string().max(500)).max(5),
  proposal: proposalSchema.nullable(),
});
export type Answer = z.infer<typeof answerSchema>;
export const assistantRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  project: projectSchema,
  consent: z.literal(true),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(5000),
      }),
    )
    .max(6),
});
export function applyProposal(
  p: Project,
  proposal: z.infer<typeof proposalSchema>,
  id = crypto.randomUUID(),
): Project {
  const copy = structuredClone(p),
    old = proposal.targetId
      ? copy.initiatives.find((i) => i.id === proposal.targetId)
      : null;
  if (proposal.targetId && !old)
    throw new Error("The initiative no longer exists.");
  const target = old?.id ?? id;
  if (
    proposal.initiative.dependencies.some(
      (dep) => dep === target || !p.initiatives.some((i) => i.id === dep),
    )
  )
    throw new Error("The proposal contains an invalid prerequisite.");
  const next = {
    ...proposal.initiative,
    id: target,
    selected: old?.selected ?? false,
  };
  if (old)
    copy.initiatives = copy.initiatives.map((i) =>
      i.id === target ? next : i,
    );
  else copy.initiatives.push(next);
  for (const field of [
    "implementationCost",
    "annualCost",
    "annualBenefit",
  ] as const) {
    if (next[field] !== null && (!old || old[field] !== next[field]))
      copy.evidence.push({
        id: crypto.randomUUID(),
        initiativeId: target,
        field,
        source: "AI-assisted draft; confirm against operating evidence",
        owner: "",
        date: new Date().toISOString().slice(0, 10),
        rationale:
          "User accepted the proposed draft. Acceptance does not independently verify this estimate.",
        confidence: "Unverified",
        origin: "AI suggestion",
      });
  }
  return projectSchema.parse(copy);
}
