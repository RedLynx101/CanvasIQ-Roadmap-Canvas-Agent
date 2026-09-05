import { createHash, timingSafeEqual } from "node:crypto";
import { assistantRequestSchema, answerSchema } from "../../domain/assistant";
import { runAssistant } from "./agent";
import { reserveRequest } from "./budget";

type Dependencies = {
  run: typeof runAssistant;
  reserve: typeof reserveRequest;
};
const defaults: Dependencies = { run: runAssistant, reserve: reserveRequest };
const errorResponse = (error: string, status: number) =>
  Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
function authorized(value: string | null) {
  const expected = process.env.AI_ACCESS_TOKEN || "";
  if (expected.length < 24 || !value) return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(value), hash(expected));
}
export async function handleAssistant(
  request: Request,
  deps: Dependencies = defaults,
): Promise<Response> {
  if (process.env.AI_ENABLED !== "true" || !process.env.OPENAI_API_KEY)
    return errorResponse(
      "AI assistance is disabled on this deployment. The complete manual workflow is available.",
      503,
    );
  if (!authorized(request.headers.get("x-canvasiq-access")))
    return errorResponse("A valid deployment access code is required.", 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return errorResponse("Cross-origin requests are not allowed.", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return errorResponse("JSON content is required.", 415);
  // Count bytes while reading: do not trust Content-Length or allocate an unbounded body.
  const reader = request.body?.getReader();
  if (!reader) return errorResponse("Request body is required.", 400);
  const decoder = new TextDecoder();
  let body = "",
    bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 90000) {
        await reader.cancel();
        return errorResponse(
          "Planning context exceeds 90 KB. Export/archive older evidence before requesting AI assistance.",
          413,
        );
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } catch {
    return errorResponse("Request could not be read.", 400);
  }
  let input;
  try {
    input = assistantRequestSchema.parse(JSON.parse(body));
  } catch {
    return errorResponse(
      "Invalid planning request. Check the project and confirm data-sharing consent.",
      400,
    );
  }
  try {
    await deps.reserve();
  } catch (e) {
    return errorResponse((e as Error).message, 429);
  }
  const encoder = new TextEncoder(),
    cancel = new AbortController();
  const signal = AbortSignal.any([
    request.signal,
    cancel.signal,
    AbortSignal.timeout(60000),
  ]);
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      try {
        send({
          type: "status",
          message: "Reviewing the planning assumptions…",
        });
        const output = answerSchema.parse(
          await deps.run(input.project, input.prompt, input.history, signal),
        );
        if (!signal.aborted) send({ type: "result", data: output });
      } catch {
        if (!request.signal.aborted)
          try {
            send({
              type: "error",
              message:
                "The assistant could not complete this request. Your project is unchanged. Retry or continue manually.",
            });
          } catch {}
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      cancel.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
