// app/utils/aiAdvisor.ts
import axios from "axios";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7b-instruct-v0.1";
const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) throw new Error("HF_API_TOKEN ไม่ได้ตั้งใน .env.local");

export async function aiSuggestTxTiming(
    blockNumber: number,
    gasPrice: string
  ): Promise<{ suggestion: "send_now" | "wait"; reasoning: string }> {
    const prompt = `
  ONLY OUTPUT JSON. 
  You are an expert in blockchain transaction optimization on Monad testnet.
  
  Current block number: ${blockNumber}
  Current gas price: ${gasPrice} wei
  
  Decide if the user should "send_now" or "wait".
  Return JSON exactly like this:
  {"suggestion":"send_now","reasoning":"short reason in less than 20 words."}
  
  Do NOT explain anything else. No introduction. No code. No text before or after the JSON.
  `;
  
    const { data } = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.2,  // ลด randomness ให้นิ่ง
          top_p: 0.9,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  
    const text: string =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text.trim()
        : (data as any).generated_text?.trim() || "";
  
    try {
      const json = JSON.parse(text);
      if (
        json.suggestion &&
        (json.suggestion === "send_now" || json.suggestion === "wait") &&
        typeof json.reasoning === "string"
      ) {
        return { suggestion: json.suggestion, reasoning: json.reasoning };
      }
    } catch (e) {
      console.error("Failed to parse AI output:", text);
    }
  
    return { suggestion: "send_now", reasoning: "Unable to parse AI response." };
  }
  