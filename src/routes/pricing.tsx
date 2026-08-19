import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AGENCY_PLANS, SALES_WHATSAPP_URL, SOLO_PACKS, isOfferLive, rupees } from "@/lib/pricing";

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

function comingSoon() {
  toast.info("Card payments switch on shortly — we'll email you the moment checkout is live.");
}

function PricingPage() {
  const packs = [SOLO_PACKS.free, SOLO_PACKS.starter, SOLO_PACKS.launch];
  const agencies = [
    AGENCY_PLANS.starter_agency,
    AGENCY_PLANS.growth_agency,
    AGENCY_PLANS.enterprise,
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pay for listings, not for months
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Solo brokers buy one-time listing packs — credits stack and never expire. Agencies get a
            shared monthly pool with seats for their team.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-lg font-bold">Solo brokers</h2>
        <p className="text-sm text-muted-foreground">
          One-time packs. No subscription, nothing to cancel.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {packs.map((pack) => {
            const offer = isOfferLive(pack);
            return (
              <div key={pack.id} className="surface flex flex-col gap-4 p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{pack.name}</h3>
                    {offer ? (
                      <span className="rounded-full bg-warm/20 px-2 py-0.5 text-[11px] font-semibold text-warm-foreground">
                        Launch offer
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">{rupees(pack.amountPaise)}</span>
                    {pack.compareAtPaise && offer ? (
                      <span className="text-sm text-muted-foreground line-through">
                        {rupees(pack.compareAtPaise)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.credits} listings · {pack.perListingLabel}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">{pack.note}</p>

                {pack.purchasable ? (
                  <Button className="mt-auto" onClick={comingSoon}>
                    Buy {pack.credits} listings
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-auto">
                    <Link to="/auth">Start free</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Users className="size-4 text-primary" /> Agencies
        </h2>
        <p className="text-sm text-muted-foreground">
          Monthly subscription with a shared listing pool. Cancel anytime.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {agencies.map((plan) => (
            <div key={plan.id} className="surface flex flex-col gap-4 p-6">
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

              {plan.selfServe ? (
                <Button className="mt-auto" onClick={comingSoon}>
                  Subscribe
                </Button>
              ) : (
                <Button asChild variant="outline" className="mt-auto">
                  <a href={SALES_WHATSAPP_URL} target="_blank" rel="noreferrer">
                    Talk to us
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" /> Every plan includes AI Quick Add, PDF
          brochures and WhatsApp-ready share copy.
        </p>
      </section>
    </main>
  );
}
