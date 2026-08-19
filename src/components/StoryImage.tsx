import { useState } from "react";
import { toast } from "sonner";
import { ImageDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, mediaUrl, photoPaths } from "@/lib/property";

type StoryProperty = {
  title: string;
  price_display: string | null;
  price: number | null;
  bhk: number | null;
  area_sqft: number | null;
  locality: string | null;
  city: string | null;
  listing_type: string;
  property_type: string;
  photos: unknown;
  slug: string;
};

const W = 1080;
const H = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) return lines;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

/**
 * Renders a 1080x1920 vertical share card for WhatsApp / Instagram status.
 * Drawn client-side on a canvas so no server image pipeline is needed.
 */
export async function buildStoryImage(
  property: StoryProperty,
  brokerName: string,
  contact: string,
  siteUrl: string,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(1, "#1a2a8a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cover photo
  const cover = photoPaths(property.photos)[0];
  const photoTop = 220;
  const photoH = 900;
  if (cover) {
    try {
      const img = await loadImage(mediaUrl(cover));
      const scale = Math.max(W / img.width, photoH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.save();
      roundRect(ctx, 60, photoTop, W - 120, photoH, 48);
      ctx.clip();
      ctx.drawImage(img, 60 + (W - 120 - dw) / 2, photoTop + (photoH - dh) / 2, dw, dh);
      const shade = ctx.createLinearGradient(0, photoTop + photoH * 0.55, 0, photoTop + photoH);
      shade.addColorStop(0, "rgba(15,12,50,0)");
      shade.addColorStop(1, "rgba(15,12,50,0.75)");
      ctx.fillStyle = shade;
      ctx.fillRect(60, photoTop, W - 120, photoH);
      ctx.restore();
    } catch {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, 60, photoTop, W - 120, photoH, 48);
      ctx.fill();
    }
  }

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 46px Manrope, system-ui, sans-serif";
  ctx.fillText(brokerName.slice(0, 30), 64, 130);
  ctx.font = "600 30px Manrope, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText(
    `${property.listing_type === "rent" ? "FOR RENT" : "FOR SALE"} · ${property.property_type.toUpperCase()}`,
    64,
    178,
  );

  // Price pill
  const price = property.price_display || formatINR(property.price);
  ctx.font = "800 64px Manrope, system-ui, sans-serif";
  const pillW = ctx.measureText(price).width + 80;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 64, photoTop + photoH + 60, pillW, 108, 54);
  ctx.fill();
  ctx.fillStyle = "#312e81";
  ctx.fillText(price, 104, photoTop + photoH + 134);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Manrope, system-ui, sans-serif";
  const titleLines = wrap(ctx, property.title, W - 128, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, 64, photoTop + photoH + 250 + i * 74));

  // Location + specs
  let y = photoTop + photoH + 250 + titleLines.length * 74 + 30;
  ctx.font = "600 40px Manrope, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const location = [property.locality, property.city].filter(Boolean).join(", ");
  if (location) {
    ctx.fillText(location, 64, y);
    y += 66;
  }
  const specs = [
    property.bhk ? `${property.bhk} BHK` : null,
    property.area_sqft ? `${property.area_sqft} sq.ft` : null,
  ].filter(Boolean) as string[];
  if (specs.length) {
    ctx.fillText(specs.join("  •  "), 64, y);
    y += 66;
  }

  // Footer contact strip
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, 60, H - 250, W - 120, 170, 40);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 38px Manrope, system-ui, sans-serif";
  ctx.fillText(`WhatsApp ${contact}`, 100, H - 178);
  ctx.font = "500 30px Manrope, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(siteUrl.replace(/^https?:\/\//, "").slice(0, 46), 100, H - 126);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/jpeg", 0.92),
  );
}

export function StoryImageButton({
  property,
  brokerName,
  contact,
  siteUrl,
  className,
  variant = "outline",
}: {
  property: StoryProperty;
  brokerName: string;
  contact: string;
  siteUrl: string;
  className?: string;
  variant?: "outline" | "secondary" | "default";
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const blob = await buildStoryImage(property, brokerName, contact, siteUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${property.slug}-story.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Story image saved — share it on WhatsApp status.");
    } catch {
      toast.error("Could not build the story image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant={variant} className={className} onClick={download} disabled={busy}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageDown className="size-4" />}
      WhatsApp story
    </Button>
  );
}
