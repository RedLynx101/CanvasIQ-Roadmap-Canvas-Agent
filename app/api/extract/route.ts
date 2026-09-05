export async function POST() {
  return Response.json(
    {
      error:
        "This legacy endpoint has been retired. Use /api/assistant with explicit consent and deployment access.",
    },
    { status: 410 },
  );
}
