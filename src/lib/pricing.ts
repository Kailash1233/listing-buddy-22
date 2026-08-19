/**
 * Single source of truth for all Plotly pricing.
 * Change numbers here — never hardcode prices or credit counts in components.
 * The server re-reads this file when creating orders; client values are display only.
 */

export type SoloPackId = "free" | "starter" | "launch";
export type AgencyPlanId = "starter_agency" | "growth_agency" | "enterprise";

export type SoloPack = {
  id: SoloPackId;
  name: string;
  /** price in paise (0 for free) */
  amountPaise: number;
  /** original price in paise, shown struck through when set */
  compareAtPaise?: number;
  credits: number;
  perListingLabel: string;
  note: string;
  purchasable: boolean;
  /** ISO date. After this, revert `amountPaise` to `compareAtPaise` in this file. */
  offerEndsAt?: string;
  razorpayItemId?: string;
};

export type AgencyPlan = {
  id: AgencyPlanId;
  name: string;
  amountPaise: number | null;
  monthlyListingPool: number | null;
  seats: number | null;
  note: string;
  selfServe: boolean;
  razorpayPlanId?: string;
};

export const SOLO_PACKS: Record<SoloPackId, SoloPack> = {
  free: {
    id: "free",
    name: "Free",
    amountPaise: 0,
    credits: 2,
    perListingLabel: "—",
    note: "Granted at signup. No card needed. Never expires.",
    purchasable: false,
  },
  starter: {
    id: "starter",
    name: "Starter Pack",
    amountPaise: 29900,
    credits: 10,
    perListingLabel: "₹30 / listing",
    note: "One-time purchase. Credits added instantly.",
    purchasable: true,
  },
  launch: {
    id: "launch",
    name: "Launch Pack",
    amountPaise: 49900,
    compareAtPaise: 79900,
    credits: 30,
    perListingLabel: "~₹17 / listing",
    note: "Limited-time launch pricing.",
    purchasable: true,
    offerEndsAt: "2026-12-31",
  },
};

export const AGENCY_PLANS: Record<AgencyPlanId, AgencyPlan> = {
  starter_agency: {
    id: "starter_agency",
    name: "Starter Agency",
    amountPaise: 99900,
    monthlyListingPool: 50,
    seats: 3,
    note: "Shared pool resets each billing cycle.",
    selfServe: true,
  },
  growth_agency: {
    id: "growth_agency",
    name: "Growth Agency",
    amountPaise: 199900,
    monthlyListingPool: 150,
    seats: 8,
    note: "Shared pool resets each billing cycle.",
    selfServe: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    amountPaise: null,
    monthlyListingPool: null,
    seats: null,
    note: "Custom pool and seats.",
    selfServe: false,
  },
};

/** Sales contact for the Enterprise tier. */
export const SALES_WHATSAPP = "918190069737";
export const SALES_WHATSAPP_URL = `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(
  "Hi Plotly team, I'd like to talk about the Enterprise plan.",
)}`;

export function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function isOfferLive(pack: SoloPack, now = new Date()): boolean {
  if (!pack.offerEndsAt) return false;
  return now <= new Date(`${pack.offerEndsAt}T23:59:59+05:30`);
}
