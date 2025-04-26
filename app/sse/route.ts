// app/sse/route.ts
export const runtime = "edge";

import { getTools, runTool } from "../mcp";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const toolName = searchParams.get("tool") || "";
  const inputStr = searchParams.get("input") || "{}";
  let input: any;
  try {
    input = JSON.parse(inputStr);
  } catch {
    input = {};
  }

  async function* stream() {
    // 1) เช็คว่า tool นี้มีหรือไม่
    const tools = getTools().map((t) => ({
      name: t.name,
      description: t.description,
    }));
    yield `data: ${JSON.stringify({
      role: "system",
      content: "MCP server ready",
      tools,
    })}\n\n`;

    // 2) ถ้ามี tool ให้รัน
    if (toolName) {
      try {
        const output = await runTool(toolName, input);
        yield `data: ${JSON.stringify({
          role: "tool",
          tool_name: toolName,
          content: output,
        })}\n\n`;
      } catch (e: any) {
        yield `data: ${JSON.stringify({
          role: "error",
          message: e.message,
        })}\n\n`;
      }
    }

    // 3) จบ stream
  }

  return new Response(stream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
