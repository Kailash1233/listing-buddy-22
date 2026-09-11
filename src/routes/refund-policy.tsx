import { createFileRoute } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refunds & Cancellation — PropertyGenie by Adszoo" },
      {
        name: "description",
        content:
          "Refund and cancellation policy for PropertyGenie listing credit packs and agency subscription plans.",
      },
      { property: "og:title", content: "Refunds & Cancellation — PropertyGenie by Adszoo" },
      {
        property: "og:description",
        content: "Refund and cancellation policy for PropertyGenie listing credit packs and agency subscription plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        <div className="navy-gradient">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <p className="eyebrow opacity-60">Payments</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Refunds & Cancellation
            </h1>
            <p className="mx-auto mt-4 max-w-xl opacity-70">
              Last updated: 23 August 2026
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 py-12">
          <div className="surface space-y-8 p-6 sm:p-10">
            <section>
              <h2 className="text-lg font-bold">1. One-time listing credit packs</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PropertyGenie sells one-time listing credit packs such as the Starter Pack and Launch Pack. These packs add a fixed number of listing credits to your account. Credits are digital goods and are added to your account immediately after a successful payment.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">2. Refund eligibility window</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You may request a refund within 7 days of purchase, provided none of the purchased credits have been used to activate or publish a listing. Refund requests must be sent to{" "}
                <a href="mailto:askar@adszoo.in" className="text-primary hover:underline">
                  askar@adszoo.in
                </a>{" "}
                from the email address associated with your PropertyGenie account, along with the order reference.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">3. No refund once credits are used</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If any credit from the purchased pack has been consumed to activate a property listing, the pack is considered used and is no longer eligible for a refund. Partial refunds are not issued for partially used packs.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">4. Agency and recurring plan cancellation</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Agency subscription plans are billed on a recurring monthly basis. You may cancel your subscription at any time from your dashboard or by contacting support. Cancellation takes effect at the end of the current billing period, and you will continue to have access until that date. We do not offer prorated refunds for unused days in a billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">5. Refund processing</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Approved refunds are processed within 5 to 7 business days. The refund will be credited back to the original payment method or bank account used for the transaction. Depending on your bank or payment provider, it may take additional time for the amount to reflect in your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">6. Contact for refund requests</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For refund or cancellation requests, email{" "}
                <a href="mailto:askar@adszoo.in" className="text-primary hover:underline">
                  askar@adszoo.in
                </a>{" "}
                or call{" "}
                <a href="tel:8190069737" className="text-primary hover:underline">
                  81900 69737
                </a>
                . Please include your registered email address and order details so we can assist you quickly.
              </p>
            </section>
          </div>
        </article>
      </main>

      <PoweredByAdszoo />
    </div>
  );
}
