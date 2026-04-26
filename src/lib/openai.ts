import OpenAI from "openai";

let client: OpenAI | null = null;

export function openai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  client = new OpenAI({ apiKey });
  return client;
}

export const CHAT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
export const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1";
