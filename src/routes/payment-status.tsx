import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";
import { getCheckoutStatus } from "@/lib/payments.functions";

type Search = { order_id?: string };

export const Route = createFileRoute("/payment-status")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    order_id: typeof search["order_id"] === "string" ? search["order_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment status — Plotly" },
      { name: "description", content: "Confirming your Plotly listing credit purchase." },
      { property: "og:title", content: "Payment status — Plotly" },
      { property: "og:description", content: "Confirming your Plotly listing credit purchase." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentStatusPage,
});

function PaymentStatusPage() {
  const { order_id: orderId } = useSearch({ from: "/payment-status" });
  const check = useServerFn(getCheckoutStatus);
  const [state, setState] = useState<"pending" | "paid" | "failed">("pending");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await check({ data: { orderId } });
        if (cancelled || !res) return;
        if (res.status === "paid") {
          setCredits(res.credits);
          setState("paid");
          return;
        }
        if (res.status === "failed") {
          setState("failed");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (!cancelled && attempts < 10) setTimeout(poll, 2500);
      else if (!cancelled) setState("failed");
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, check]);

  return (
    <main className="min-h-screen bg-background">
      <MarketingHeader />
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        {state === "pending" && (
          <>
            <Loader2 className="size-10 animate-spin text-primary" />
            <h1 className="mt-6 text-2xl font-extrabold">Confirming your payment…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please don't close this page. This usually takes a few seconds.
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <CheckCircle2 className="size-12 text-primary" />
            <h1 className="mt-6 text-2xl font-extrabold">Payment successful</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {credits} listing credits have been added to your account. A receipt is on its way to your
              email.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </>
        )}

        {state === "failed" && (
          <>
            <XCircle className="size-12 text-destructive" />
            <h1 className="mt-6 text-2xl font-extrabold">We couldn't confirm this payment</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If money left your account, your credits will be added automatically once the bank confirms.
              Write to askar@adszoo.in with order id {orderId ?? "—"} if it stays stuck.
            </p>
            <div className="mt-6 flex gap-2">
              <Button asChild variant="outline">
                <Link to="/pricing">Back to pricing</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </>
        )}
      </section>
      <PoweredByAdszoo />
    </main>
  );
}
