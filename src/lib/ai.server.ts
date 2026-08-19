const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export type ListingDraft = {
  title: string;
  description: string;
  whatsapp_message: string;
  meta_description: string;
  property_type: "apartment" | "villa" | "plot" | "commercial";
  listing_type: "sale" | "rent";
  price: number | null;
  price_display: string | null;
  bhk: number | null;
  area_sqft: number | null;
  floor: string | null;
  facing: string | null;
  parking: string | null;
  locality: string | null;
  amenities: string[];
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    whatsapp_message: { type: "string" },
    meta_description: { type: "string" },
    property_type: { type: "string", enum: ["apartment", "villa", "plot", "commercial"] },
    listing_type: { type: "string", enum: ["sale", "rent"] },
    price: { type: ["number", "null"] },
    price_display: { type: ["string", "null"] },
    bhk: { type: ["integer", "null"] },
    area_sqft: { type: ["number", "null"] },
    floor: { type: ["string", "null"] },
    facing: { type: ["string", "null"] },
    parking: { type: ["string", "null"] },
    locality: { type: ["string", "null"] },
    amenities: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "description",
    "whatsapp_message",
    "meta_description",
    "property_type",
    "listing_type",
    "price",
    "price_display",
    "bhk",
    "area_sqft",
    "floor",
    "facing",
    "parking",
    "locality",
    "amenities",
  ],
} as const;

const SYSTEM = `You are a listing assistant for independent real-estate brokers in Chennai, India.
You receive a rough WhatsApp-style property note and turn it into structured listing data plus polished copy.
Rules:
- Never invent facts that are not implied by the note (no fake amenities, no fake RERA, no fake landmarks).
- Prices: Indian conventions. "85 lakhs" => price 8500000, price_display "₹85 Lakhs". "1.2 cr" => 12000000, "₹1.2 Cr".
- For rent listings the price is the monthly rent; price_display like "₹28,000 / month".
- title: short, confident, buyer-facing (e.g. "Bright 2BHK in Anna Nagar — 1200 sqft, East facing").
- description: 2-3 short paragraphs, warm and factual, no emojis, no ALL CAPS, no "contact us now" spam.
- whatsapp_message: 3-6 lines, scannable, may use a couple of relevant emojis, ends with a line inviting the buyer to open the link. Do NOT include a URL placeholder.
- meta_description: under 155 characters.
- amenities: only those clearly mentioned or strongly implied (e.g. "covered car parking").
- If something is unknown, use null (or an empty array) instead of guessing.`;

export async function runListingAI(input: {
  mode: "parse" | "copy";
  raw: string;
  tone?: string | undefined;
}): Promise<ListingDraft> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const userPrompt =
    input.mode === "copy"
      ? `Rewrite the listing copy with fresh wording${input.tone ? ` in a ${input.tone} tone` : ""}, keeping every fact identical.\n\nListing details:\n${input.raw}`
      : `Parse this broker note into structured listing data and polished copy.\n\nNote:\n${input.raw}`;

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "listing", strict: true, schema: SCHEMA },
      },
    }),
  });

  if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable settings.");
  if (!res.ok) {
    console.error("AI gateway error", res.status, await res.text());
    throw new Error("Could not read that listing. Try adding a bit more detail.");
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");
  return JSON.parse(content) as ListingDraft;
}
