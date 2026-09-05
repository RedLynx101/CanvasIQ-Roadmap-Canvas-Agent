import { handleAssistant } from "@/server/ai/handler";
export const runtime = "nodejs";
export const maxDuration = 65;
export async function POST(request: Request) {
  return handleAssistant(request);
}
