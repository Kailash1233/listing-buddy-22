import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const packInput = z.object({ packId: z.enum(["starter", "launch"]) });
const orderInput = z.object({ orderId: z.string().trim().min(4).max(80) });

export const createPackCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => packInput.parse(data))
  .handler(async ({ data, context }) => {
    const { SOLO_PACKS } = await import("@/lib/pricing");
    const { createCashfreeOrder } = await import("@/lib/cashfree.server");
    const { requestOrigin } = await import("@/lib/request-origin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const pack = SOLO_PACKS[data.packId];
    if (!pack?.purchasable) throw new Error("This pack is not available for purchase.");

    const { data: broker, error: brokerError } = await context.supabase
      .from("brokers")
      .select("id, name, phone, whatsapp_number")
      .eq("id", context.userId)
      .maybeSingle();
    if (brokerError || !broker) throw new Error("Finish setting up your profile before buying credits.");

    const email = (context.claims["email"] as string | undefined) ?? "";
    const orderId = `plotly_${data.packId}_${Date.now()}_${context.userId.slice(0, 8)}`;

    const { error: insertError } = await supabaseAdmin.from("credit_purchases").insert({
      broker_id: broker.id,
      pack_type: data.packId,
      amount_paise: pack.amountPaise,
      credits_granted: pack.credits,
      status: "created",
      cashfree_order_id: orderId,
      customer_email: email || null,
    });
    if (insertError) throw new Error("Could not start checkout. Please try again.");

    const phone = (broker.phone || broker.whatsapp_number || "").replace(/\D/g, "").slice(-10);

    const order = await createCashfreeOrder({
      orderId,
      amountRupees: pack.amountPaise / 100,
      customer: {
        id: broker.id,
        name: broker.name || "Plotly user",
        phone: phone.length === 10 ? phone : "9999999999",
        email: email || "no-reply@adszoo.in",
      },
      returnUrl: `${requestOrigin()}/payment-status?order_id=${orderId}`,
      note: `${pack.name} — ${pack.credits} listing credits`,
    });

    return {
      orderId,
      paymentSessionId: order.paymentSessionId,
      mode: order.mode,
      credits: pack.credits,
      amountPaise: pack.amountPaise,
    };
  });

/** Poll after redirect: reconciles with Cashfree in case the webhook is delayed. */
export const getCheckoutStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchCashfreeOrder, sendPaymentEmail } = await import("@/lib/cashfree.server");

    const { data: purchase } = await supabaseAdmin
      .from("credit_purchases")
      .select("*")
      .eq("cashfree_order_id", data.orderId)
      .maybeSingle();

    if (!purchase || purchase.broker_id !== context.userId) return null;
    if (purchase.status === "paid") {
      return { status: "paid" as const, credits: purchase.credits_granted, amountPaise: purchase.amount_paise };
    }

    const remote = await fetchCashfreeOrder(data.orderId);
    const remoteStatus = remote?.order_status;
    if (remoteStatus === "PAID") {
      const { data: settled } = await supabaseAdmin.rpc("settle_credit_purchase", {
        _cashfree_order_id: data.orderId,
        _cashfree_payment_id: null,
        _status: "paid",
      });
      const result = settled as { paid?: boolean } | null;
      if (result?.paid && purchase.customer_email) {
        const { data: broker } = await supabaseAdmin
          .from("brokers")
          .select("name")
          .eq("id", purchase.broker_id)
          .maybeSingle();
        await sendPaymentEmail({
          to: purchase.customer_email,
          name: broker?.name ?? "",
          credits: purchase.credits_granted,
          amountPaise: purchase.amount_paise,
          orderId: data.orderId,
        });
      }
      return { status: "paid" as const, credits: purchase.credits_granted, amountPaise: purchase.amount_paise };
    }

    if (remoteStatus === "EXPIRED" || remoteStatus === "TERMINATED" || purchase.status === "failed") {
      return { status: "failed" as const, credits: 0, amountPaise: purchase.amount_paise };
    }
    return { status: "pending" as const, credits: 0, amountPaise: purchase.amount_paise };
  });
