export function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.split("/")[0];
  d = d.split("?")[0];
  return d;
}

export function brandNameFromDomain(domain: string): string {
  const root = normalizeDomain(domain).split(".")[0];
  if (!root) return domain;
  return root
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

export function detectMediaType(
  raw: Record<string, unknown>,
  hasBodyText = false
): {
  media_type: "image" | "video" | "carousel" | "text" | "unknown";
  image_url: string | null;
  video_url: string | null;
} {
  const snap = (raw.snapshot ?? raw) as Record<string, unknown>;
  const videos = (snap.videos as Array<Record<string, unknown>> | undefined) ?? [];
  const images = (snap.images as Array<Record<string, unknown>> | undefined) ?? [];
  const cards = (snap.cards as Array<Record<string, unknown>> | undefined) ?? [];

  const videoUrl =
    (videos[0]?.video_hd_url as string | undefined) ??
    (videos[0]?.video_sd_url as string | undefined) ??
    (snap.video_hd_url as string | undefined) ??
    (snap.video_sd_url as string | undefined) ??
    null;

  const imageUrl =
    (images[0]?.original_image_url as string | undefined) ??
    (images[0]?.resized_image_url as string | undefined) ??
    (snap.original_image_url as string | undefined) ??
    (snap.resized_image_url as string | undefined) ??
    null;

  if (videoUrl) return { media_type: "video", image_url: imageUrl, video_url: videoUrl };
  if (cards.length > 1) return { media_type: "carousel", image_url: imageUrl, video_url: null };
  if (imageUrl) return { media_type: "image", image_url: imageUrl, video_url: null };
  if (hasBodyText) return { media_type: "text", image_url: null, video_url: null };
  return { media_type: "unknown", image_url: null, video_url: null };
}

export function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
