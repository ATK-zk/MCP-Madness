// app/mcp.ts
import { z } from "zod";
import { analyzeNetwork } from "./utils/networkAnalyzer";
import { aiSuggestTxTiming } from "./utils/aiAdvisor";

type ToolFunction = (input: any) => Promise<any>;
interface ToolSchema {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  run: ToolFunction;
}
const tools: ToolSchema[] = [];

export function tool(
  name: string,
  description: string,
  inputSchema: z.ZodTypeAny,
  run: ToolFunction
) {
  tools.push({ name, description, inputSchema, run });
}

export function getTools() {
  return tools;
}

export async function runTool(name: string, input: any) {
  const t = tools.find((t) => t.name === name);
  if (!t) throw new Error(`Tool not found: ${name}`);
  const parsed = t.inputSchema.parse(input);
  return await t.run(parsed);
}

// — ลงทะเบียน tool เดียวที่ทำทั้งสองอย่าง —
tool(
  "suggest_tx_timing",
  "Fetch real-time blockNumber & gasPrice from Monad, then ask AI for send_now/wait + reasoning",
  z.object({}), // ไม่มี input จาก client
  async () => {
    // 1) ดึง blockNumber และ gasPrice จริง
    const { blockNumber, gasPrice } = await analyzeNetwork();
    // 2) เอาไปให้ AI วิเคราะห์
    const { suggestion, reasoning } = await aiSuggestTxTiming(
      blockNumber,
      gasPrice
    );
    // 3) ส่งกลับครบทั้ง 4 ค่าพร้อมกัน
    return { blockNumber, gasPrice, suggestion, reasoning };
  }
);
