import { decode, encode } from "blurhash";

/**
 * BlurHash helpers.
 *
 * Encoding happens ONCE, in the browser, at upload time (from the local File —
 * no network fetch, so no tainted-canvas/CORS risk) and the string is persisted
 * on the listing. Decoding is cheap (a 32x32 canvas) and memoised per hash.
 */

const dataUrlCache = new Map<string, string>();

/** Encode a BlurHash string from a File the user just picked. */
export async function encodeBlurhash(file: File): Promise<string | null> {
  try {
    if (typeof document === "undefined") return null;
    const bitmap = await createImageBitmap(file);
    const w = 32;
    const h = Math.max(1, Math.round((bitmap.height / bitmap.width) * w)) || 32;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const { data } = ctx.getImageData(0, 0, w, h);
    return encode(data, w, h, 4, 3);
  } catch {
    return null;
  }
}

/** Decode a stored BlurHash into a tiny data URL usable as a CSS background. */
export function blurhashToDataURL(hash: string, width = 32, height = 32): string | null {
  if (!hash) return null;
  const cached = dataUrlCache.get(hash);
  if (cached) return cached;
  if (typeof document === "undefined") return null;
  try {
    const pixels = decode(hash, width, height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    const url = canvas.toDataURL("image/png");
    dataUrlCache.set(hash, url);
    return url;
  } catch {
    return null;
  }
}

/** Reads the { [photoPath]: blurhash } map stored on a property row. */
export function blurhashMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string" && v.length > 5) out[k] = v;
  }
  return out;
}

export function blurhashFor(value: unknown, path?: string | null): string | undefined {
  if (!path) return undefined;
  return blurhashMap(value)[path];
}
