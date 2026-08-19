export const PROPERTY_TYPES = ["apartment", "villa", "plot", "commercial"] as const;
export const LISTING_TYPES = ["sale", "rent"] as const;
export const PROPERTY_STATUSES = ["draft", "active", "sold", "rented", "inactive"] as const;
export const LEAD_STATUSES = ["new", "contacted", "site_visit", "closed", "lost"] as const;

export const FACINGS = ["East", "West", "North", "South", "North-East", "South-East", "North-West", "South-West"];

export const AMENITY_OPTIONS = [
  "Covered car parking",
  "Lift",
  "Power backup",
  "24x7 security",
  "Gym",
  "Swimming pool",
  "Children's play area",
  "Clubhouse",
  "Borewell / water supply",
  "Vaastu compliant",
  "Modular kitchen",
  "Piped gas",
  "CCTV",
  "Park / open space",
  "Rain water harvesting",
];

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  site_visit: "Site visit",
  closed: "Closed",
  lost: "Lost",
};

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "listing"
  );
}

export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `/api/public/media/${path}`;
}

/** Small (400px) variant written at upload time; the media route falls back to the original. */
export function thumbUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `/api/public/media/${path}.thumb.jpg`;
}

export function photoPaths(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((p): p is string => typeof p === "string");
}

export function formatINR(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} Lakhs`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function waLink(number: string, text: string): string {
  const digits = (number || "").replace(/\D/g, "");
  const withCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCode}?text=${encodeURIComponent(text)}`;
}

export function propertyPath(subdomain: string, slug: string) {
  return `/b/${subdomain}/p/${slug}`;
}
