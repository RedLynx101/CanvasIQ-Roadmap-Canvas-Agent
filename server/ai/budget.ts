import {
  mkdir,
  open,
  readFile,
  writeFile,
  rename,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
const ledgerSchema = z.object({
  date: z.string(),
  requests: z.number().int().nonnegative(),
  lastRequestAt: z.number().nonnegative(),
});
/** File-locked admission counter. Failed attempts consume a slot; loss/corruption fails closed. */
export async function reserveRequest(
  directory = process.env.AI_STATE_DIR ||
    path.join(process.cwd(), "work", "ai-state"),
  now = Date.now(),
) {
  const limit = Number(process.env.AI_DAILY_REQUEST_LIMIT || 20);
  if (!Number.isInteger(limit) || limit < 1 || limit > 200)
    throw new Error("Invalid AI request limit.");
  await mkdir(directory, { recursive: true });
  const lock = path.join(directory, "admission.lock");
  let handle;
  try {
    handle = await open(lock, "wx");
  } catch {
    throw new Error("Another AI request is being admitted. Try again shortly.");
  }
  try {
    const file = path.join(directory, "ledger.json"),
      date = new Date(now).toISOString().slice(0, 10);
    let ledger = { date, requests: 0, lastRequestAt: 0 };
    try {
      ledger = ledgerSchema.parse(JSON.parse(await readFile(file, "utf8")));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        throw new Error("AI usage ledger needs operator review.");
    }
    if (ledger.date !== date)
      ledger = { date, requests: 0, lastRequestAt: ledger.lastRequestAt };
    if (now - ledger.lastRequestAt < 5000)
      throw new Error("Please wait five seconds between requests.");
    if (ledger.requests >= limit)
      throw new Error(
        "The daily AI request allowance has been reached. Manual planning remains available.",
      );
    const next = { date, requests: ledger.requests + 1, lastRequestAt: now };
    await writeFile(file + ".tmp", JSON.stringify(next), "utf8");
    await rename(file + ".tmp", file);
  } finally {
    await handle.close();
    await unlink(lock);
  }
}
