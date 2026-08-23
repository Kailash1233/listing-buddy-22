import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cashfree-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const { verifyCashfreeSignature, sendPaymentEmail } = await import("@/lib/cashfree.server");

        const ok = await verifyCashfreeSignature(
          raw,
          request.headers.get("x-webhook-signature"),
          request.headers.get("x-webhook-timestamp"),
        );
        if (!ok) return new Response("Invalid signature", { status: 401 });

        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const type: string = payload?.type ?? "UNKNOWN";
        const order = payload?.data?.order ?? {};
        const payment = payload?.data?.payment ?? {};
        const orderId: string | undefined = order.order_id;
        const eventId =
          payment.cf_payment_id?.toString() ??
          `${orderId ?? "unknown"}:${type}:${payload?.event_time ?? ""}`;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotency: a duplicate event id is rejected by the unique constraint.
        const { error: dupError } = await supabaseAdmin.from("payment_webhook_events").insert({
          provider: "cashfree",
          event_id: eventId,
          event_type: type,
          payload,
        });
        if (dupError) return new Response("ok (duplicate)", { status: 200 });

        if (!orderId) return new Response("ok", { status: 200 });

        const paid = type === "PAYMENT_SUCCESS_WEBHOOK" || payment.payment_status === "SUCCESS";

        const { data: settled, error: settleError } = await supabaseAdmin.rpc("settle_credit_purchase", {
          _cashfree_order_id: orderId,
          _cashfree_payment_id: payment.cf_payment_id?.toString() ?? "",
          _status: paid ? "paid" : "failed",
        });
        if (settleError) {
          console.error("[cashfree] settle failed", settleError);
          return new Response("Settlement failed", { status: 500 });
        }

        const result = settled as { paid?: boolean; already?: boolean } | null;

        if (paid && result?.paid) {
          const { data: purchase } = await supabaseAdmin
            .from("credit_purchases")
            .select("customer_email, credits_granted, amount_paise, broker_id")
            .eq("cashfree_order_id", orderId)
            .maybeSingle();
          if (purchase) {
            const { data: broker } = await supabaseAdmin
              .from("brokers")
              .select("name")
              .eq("id", purchase.broker_id)
              .maybeSingle();
            const to = purchase.customer_email ?? order?.customer_details?.customer_email ?? "";
            if (to) {
              await sendPaymentEmail({
                to,
                name: broker?.name ?? "",
                credits: purchase.credits_granted,
                amountPaise: purchase.amount_paise,
                orderId,
                paymentId: payment.cf_payment_id?.toString() ?? null,
              });
            }
          }
        }

        await supabaseAdmin
          .from("payment_webhook_events")
          .update({ processed_at: new Date().toISOString() })
          .eq("provider", "cashfree")
          .eq("event_id", eventId);

        return new Response("ok", { status: 200 });
      },
    },
  },
});
