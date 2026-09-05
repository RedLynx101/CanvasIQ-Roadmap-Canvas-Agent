import { mkdir, writeFile } from "node:fs/promises";
import { runAssistant } from "../server/ai/agent";
import { exampleProject } from "../data/example";
import { applyProposal } from "../domain/assistant";

if (!process.env.OPENAI_API_KEY)
  throw new Error(
    "OPENAI_API_KEY is required. No key is stored by this runner.",
  );
const cases = [
  {
    name: "evidence-review",
    prompt:
      "Briefly identify the most important uncertainty in this synthetic portfolio. Do not propose changes.",
    check: (a: Awaited<ReturnType<typeof runAssistant>>) =>
      a.proposal === null && a.answer.length > 20,
  },
  {
    name: "preserve-unknowns",
    prompt:
      "Draft a new initiative named Invoice routing to reduce manual routing. We do not know its implementation cost, operating cost, or annual benefits. Do not invent them. Do not add dependencies. Leave unknown money as null.",
    check: (a: Awaited<ReturnType<typeof runAssistant>>) =>
      !!a.proposal &&
      a.proposal.initiative.implementationCost === null &&
      a.proposal.initiative.annualCost === null &&
      a.proposal.initiative.annualBenefit === null,
  },
];
const results = [];
for (const item of cases) {
  let usage = { inputTokens: 0, outputTokens: 0, requests: 0 };
  try {
    const answer = await runAssistant(
      exampleProject(),
      item.prompt,
      [],
      AbortSignal.timeout(60000),
      (u) => {
        usage = u;
      },
    );
    if (answer.proposal) applyProposal(exampleProject(), answer.proposal);
    results.push({
      case: item.name,
      passed: item.check(answer),
      usage,
      answer,
    });
  } catch (error) {
    results.push({
      case: item.name,
      passed: false,
      usage,
      error: error instanceof Error ? error.message : "Evaluation failed",
    });
  }
}
await mkdir("evals/results", { recursive: true });
await writeFile(
  "evals/results/latest.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      results,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    results.map(({ case: name, passed, usage }) => ({
      case: name,
      passed,
      usage,
    })),
    null,
    2,
  ),
);
if (results.some((r) => !r.passed)) process.exitCode = 1;
