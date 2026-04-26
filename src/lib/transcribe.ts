import { openai, TRANSCRIBE_MODEL } from "./openai";

/**
 * Transcribe a video/audio URL by streaming it into Whisper.
 * The video file is NEVER persisted to disk or storage; it is streamed in-memory
 * to the transcription API and discarded.
 */
export async function transcribeRemoteMedia(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  // OpenAI SDK expects a File-like object. Use the global File to avoid persisting.
  const file = new File([buf], "ad-media.mp4", { type: res.headers.get("content-type") ?? "video/mp4" });

  const result = await openai().audio.transcriptions.create({
    file,
    model: TRANSCRIBE_MODEL,
  });

  return result.text ?? "";
}
