import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { exampleProject } from "../data/example";
import { parseProject } from "../domain/persistence";
import {
  decisionMarkdown,
  diagnose,
  prometheanHandoff,
} from "../domain/export";
import { portfolio, recommend } from "../domain/planning";

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { input: { type: "string" }, output: { type: "string" } },
  });
  const command = positionals[0] || "help";
  if (command === "help") {
    console.log(
      "CanvasIQ: example | validate | diagnose | recommend | scenarios | brief | handoff\nUsage: npx tsx scripts/canvasiq.ts diagnose --input project.json [--output result.json]\nCommands are deterministic and make no network or provider calls. Output files are never overwritten.",
    );
    return;
  }
  const p =
    command === "example"
      ? exampleProject()
      : values.input
        ? parseProject(await readFile(values.input, "utf8"))
        : null;
  if (!p) throw new Error("--input project.json is required.");
  const data =
    command === "example"
      ? p
      : command === "validate"
        ? { valid: true, version: p.version, project: p.name }
        : command === "diagnose"
          ? diagnose(p)
          : command === "recommend"
            ? recommend(p)
            : command === "scenarios"
              ? p.scenarios.map((s) => ({ scenario: s, ...portfolio(p, s) }))
              : command === "brief"
                ? decisionMarkdown(p)
                : command === "handoff"
                  ? prometheanHandoff(p)
                  : null;
  if (data === null)
    throw new Error("Unknown command. Run help for supported commands.");
  const output =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  if (values.output) {
    await writeFile(values.output, output + "\n", { flag: "wx" });
    console.log(`Created ${values.output}`);
  } else console.log(output);
}
main().catch((error) => {
  console.error(
    `CanvasIQ: ${error instanceof Error ? error.message : "Command failed"}`,
  );
  process.exitCode = 1;
});
