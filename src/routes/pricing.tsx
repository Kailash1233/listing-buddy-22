import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { createPackCheckout } from "@/lib/payments.functions";
import { openCashfreeCheckout } from "@/lib/cashfree-checkout";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/marketing";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";
import {
  AGENCY_PLANS,
  SOLO_PACKS,
  isOfferLive,
  rupees,
  type SoloPackId,
} from "@/lib/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Plotly listing packs & agency plans" },
      {
        name: "description",
        content:
          "Pay per listing pack — ₹299 for 10 listings or ₹499 for 30. Credits never expire. Agency plans from ₹999/month with a shared listing pool.",
      },
      { property: "og:title", content: "Pricing — Plotly listing packs & agency plans" },
      {
        property: "og:description",
        content:
          "One-time listing packs for solo brokers, monthly shared pools for agencies. No subscription needed to start.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

/** WhatsApp link for agency plan enquiries. */
function agencyWhatsAppUrl(planName: string) {
  return `https://wa.me/918190069737?text=${encodeURIComponent(
    `Hi, I'm interested in the ${planName} plan on Property Genie.`,
  )}`;
}

/** Starts a Cashfree checkout for a one-time listing credit pack. */
export function usePackCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startCheckout = useServerFn(createPackCheckout);
  const [busy, setBusy] = useState(false);

  const buy = async (packId: "starter" | "launch") => {
    if (!user) {
      toast.info("Create your free account first — then you can top up credits.");
      void navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    setBusy(true);
    try {
      const order = await startCheckout({ data: { packId } });
      await openCashfreeCheckout(order.paymentSessionId, order.mode as "sandbox" | "production");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the payment.");
      setBusy(false);
    }
  };

  return { buy, busy };
}

const INCLUDED = [
  "AI Quick Add from a rough WhatsApp note",
  "Mobile-first property page with its own link",
  "WhatsApp share copy + 1080×1920 Story image",
  "PDF brochure per listing",
  "Lead inbox with views and click tracking",
];

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PricingPage() {
  const [audience, setAudience] = useState<"solo" | "agency">("solo");

  return (
    <main className="min-h-screen bg-background">
      <div className="navy-gradient">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <Eyebrow className="text-navy-foreground/60">Pricing</Eyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Pay for listings, not for months
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-navy-foreground/70">
            Solo brokers buy one-time listing packs — credits stack and never expire. Agencies get a
            shared monthly pool with seats for their team.
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-full bg-navy-foreground/10 p-1">
            {(
              [
                ["solo", "Solo broker"],
                ["agency", "Agency owner"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setAudience(key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  audience === key
                    ? "bg-primary text-primary-foreground"
                    : "text-navy-foreground/70 hover:text-navy-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-12">
        {audience === "solo" ? <SoloCard /> : <AgencyPlans />}

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" /> Every plan includes AI Quick Add, PDF
          brochures and WhatsApp-ready share copy.
        </p>
      </section>

      <PoweredByAdszoo />
    </main>
  );
}

function SoloCard() {
  const packs = [SOLO_PACKS.free, SOLO_PACKS.starter, SOLO_PACKS.launch];
  const [selected, setSelected] = useState<SoloPackId>("launch");
  const { buy, busy } = usePackCheckout();
  const pack = SOLO_PACKS[selected];
  const offer = isOfferLive(pack);
  const ends = formatDate(pack.offerEndsAt);

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-primary/30 bg-card">
      <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
        Most popular
      </div>

      <div className="p-6 sm:p-8">
        <span className="eyebrow rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
          One-time
        </span>
        <h2 className="mt-4 text-2xl font-extrabold">Solo broker packs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No subscription, nothing to cancel. Credits never expire.
        </p>

        {offer && (
          <div className="mt-5 rounded-2xl bg-peach px-4 py-3 text-peach-foreground">
            <p className="text-sm font-bold">Launch offer live</p>
            <p className="text-sm">
              {rupees(pack.amountPaise)}{" "}
              {pack.compareAtPaise ? (
                <span className="line-through opacity-60">{rupees(pack.compareAtPaise)}</span>
              ) : null}
              {ends ? ` · Ends ${ends}` : ""}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {packs.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-bold">{p.name}</p>
                <p className="mt-2 text-xl font-extrabold">{rupees(p.amountPaise)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.credits} listings · {p.perListingLabel}
                </p>
              </button>
            );
          })}
        </div>

        <ul className="mt-6 space-y-2 text-sm">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm text-muted-foreground">{pack.note}</p>

        {pack.purchasable ? (
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={busy}
            onClick={() => void buy(pack.id as "starter" | "launch")}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Buy {pack.credits} listings — {rupees(pack.amountPaise)}
          </Button>
        ) : (
          <Button asChild size="lg" className="mt-5 w-full">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start free with {pack.credits} listings
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function AgencyPlans() {
  const agencies = [
    AGENCY_PLANS.starter_agency,
    AGENCY_PLANS.growth_agency,
    AGENCY_PLANS.enterprise,
  ];

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-peach px-4 py-3 text-center text-sm font-medium text-peach-foreground">
        Agency plans are currently available via direct contact only.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {agencies.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
          >
            <h3 className="font-bold">{plan.name}</h3>
            <div className="text-3xl font-extrabold">
              {plan.amountPaise === null ? (
                "Custom"
              ) : (
                <>
                  {rupees(plan.amountPaise)}
                  <span className="text-sm font-medium text-muted-foreground">/mo</span>
                </>
              )}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                {plan.monthlyListingPool ?? "Custom"} listings / month, shared
              </li>
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                {plan.seats ?? "Custom"} sub-agent seats
              </li>
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                {plan.note}
              </li>
            </ul>

            <Button asChild className="mt-auto">
              <a href={agencyWhatsAppUrl(plan.name)} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4" /> Contact on WhatsApp
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
