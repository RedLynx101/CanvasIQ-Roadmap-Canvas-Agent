/** Incremental SSE parser preserves UTF-8 and JSON across arbitrary network chunk boundaries. */
export async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");
      let end;
      while ((end = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const data = frame
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trimStart())
          .join("\n");
        if (data) yield JSON.parse(data);
      }
      if (done) {
        if (buffer.trim())
          throw new Error(
            "The response ended before the final event was complete.",
          );
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
