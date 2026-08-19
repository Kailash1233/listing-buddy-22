import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TEAL = rgb(0.06, 0.46, 0.43);
const INK = rgb(0.13, 0.17, 0.19);
const GREY = rgb(0.42, 0.46, 0.48);

function money(value: number | null): string {
  if (value == null) return "Price on request";
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2).replace(/\.00$/, "")} Lakhs`;
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function clean(text: string): string {
  return text.replace(/₹/g, "Rs ").replace(/[^\x20-\x7E\n]/g, "");
}

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split(/\n+/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      if ((line + " " + word).trim().length > max) {
        out.push(line.trim());
        line = word;
      } else line = (line + " " + word).trim();
    }
    if (line) out.push(line);
    out.push("");
  }
  return out;
}

export async function buildBrochure(propertyId: string) {
  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("*, brokers(name, agency_name, phone, whatsapp_number)")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property || !["active", "sold", "rented"].includes(property.status)) return null;

  const filename = `${property.slug || "property"}.pdf`;
  // Cached per property revision: editing the listing bumps updated_at and busts the key.
  const cacheKey = `brochures/${property.id}/${Date.parse(property.updated_at ?? "") || 0}.pdf`;
  const cached = await supabaseAdmin.storage.from("property-media").download(cacheKey);
  if (cached.data) {
    return { bytes: new Uint8Array(await cached.data.arrayBuffer()), filename };
  }

  const broker = (property.brokers ?? {}) as {
    name?: string;
    agency_name?: string | null;
    phone?: string;
    whatsapp_number?: string;
  };

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 762, width: 595, height: 80, color: TEAL });
  page.drawText(clean(property.title || "Property"), {
    x: 40,
    y: 806,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
    maxWidth: 515,
  });
  page.drawText(
    clean([property.locality, property.city].filter(Boolean).join(", ")) || "Chennai",
    { x: 40, y: 784, size: 11, font, color: rgb(0.88, 0.96, 0.95) },
  );

  let y = 742;

  const photos = Array.isArray(property.photos) ? (property.photos as unknown[]) : [];
  const first = photos.find((p): p is string => typeof p === "string");
  if (first) {
    try {
      const { data: file } = await supabaseAdmin.storage.from("property-media").download(first);
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const img = first.toLowerCase().endsWith(".png")
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
        const w = 515;
        const h = Math.min(260, (img.height / img.width) * w);
        page.drawImage(img, { x: 40, y: y - h, width: w, height: h });
        y -= h + 24;
      }
    } catch {
      /* skip unsupported image */
    }
  }

  page.drawText(property.price_display ? clean(property.price_display) : money(property.price), {
    x: 40,
    y,
    size: 22,
    font: bold,
    color: TEAL,
  });
  y -= 30;

  const facts: Array<[string, string]> = [
    ["Type", property.property_type],
    ["For", property.listing_type === "rent" ? "Rent" : "Sale"],
    ["Configuration", property.bhk ? `${property.bhk} BHK` : "-"],
    ["Built-up area", property.area_sqft ? `${property.area_sqft} sqft` : "-"],
    ["Floor", property.floor || "-"],
    ["Facing", property.facing || "-"],
    ["Parking", property.parking || "-"],
    ["Status", property.status],
  ];

  facts.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * 260;
    const yy = y - row * 34;
    page.drawText(label.toUpperCase(), { x, y: yy, size: 8, font, color: GREY });
    page.drawText(clean(String(value)), { x, y: yy - 14, size: 12, font: bold, color: INK });
  });
  y -= Math.ceil(facts.length / 2) * 34 + 16;

  if (property.description) {
    page.drawText("About this property", { x: 40, y, size: 12, font: bold, color: INK });
    y -= 18;
    for (const line of wrap(property.description, 92)) {
      if (y < 170) break;
      page.drawText(line, { x: 40, y, size: 10, font, color: INK });
      y -= 14;
    }
  }

  const amenities = (property.amenities ?? []) as string[];
  if (amenities.length && y > 200) {
    page.drawText("Amenities", { x: 40, y, size: 12, font: bold, color: INK });
    y -= 16;
    for (const line of wrap(amenities.join("  •  "), 92)) {
      if (y < 170) break;
      page.drawText(line, { x: 40, y, size: 10, font, color: INK });
      y -= 14;
    }
  }

  page.drawRectangle({ x: 0, y: 0, width: 595, height: 120, color: rgb(0.96, 0.97, 0.97) });
  page.drawText(clean(broker.name || "Your broker"), {
    x: 40,
    y: 82,
    size: 14,
    font: bold,
    color: INK,
  });
  if (broker.agency_name)
    page.drawText(clean(broker.agency_name), { x: 40, y: 64, size: 10, font, color: GREY });
  page.drawText(`Call / WhatsApp: ${clean(broker.whatsapp_number || broker.phone || "")}`, {
    x: 40,
    y: 44,
    size: 11,
    font,
    color: TEAL,
  });
  page.drawText(
    property.rera_number
      ? `RERA No. provided by broker: ${clean(property.rera_number)} (not platform verified)`
      : "RERA number not provided by broker.",
    { x: 40, y: 22, size: 8, font, color: GREY },
  );
  page.drawText("Powered by Adszoo - adszoo.in", {
    x: 430,
    y: 22,
    size: 8,
    font,
    color: GREY,
  });

  const bytes = await pdf.save();

  await supabaseAdmin.storage
    .from("property-media")
    .upload(cacheKey, bytes, { contentType: "application/pdf", upsert: true })
    .catch(() => null);

  return { bytes, filename };
}
