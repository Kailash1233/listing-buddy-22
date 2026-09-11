/**
 * Cashfree Payment Gateway helpers. Server-only.
 * Requires secrets: CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, CASHFREE_ENV ("sandbox" | "production").
 * Optional: RESEND_API_KEY + RESEND_FROM for payment receipt emails.
 */

const API_VERSION = "2023-08-01";

export function cashfreeConfig() {
  const clientId = process.env["CASHFREE_CLIENT_ID"];
  const clientSecret = process.env["CASHFREE_CLIENT_SECRET"];
  const env = (process.env["CASHFREE_ENV"] ?? "sandbox").toLowerCase();
  if (!clientId || !clientSecret) {
    throw new Error("Cashfree is not configured (missing CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET).");
  }
  const mode = env === "production" || env === "prod" || env === "live" ? "production" : "sandbox";
  const baseUrl = mode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  return { clientId, clientSecret, mode, baseUrl } as const;
}

type CreateOrderInput = {
  orderId: string;
  amountRupees: number;
  customer: { id: string; name: string; phone: string; email: string };
  returnUrl: string;
  note?: string;
};

export async function createCashfreeOrder(input: CreateOrderInput) {
  const { clientId, clientSecret, baseUrl, mode } = cashfreeConfig();

  const res = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amountRupees,
      order_currency: "INR",
      order_note: input.note ?? "PropertyGenie listing credits",
      customer_details: {
        customer_id: input.customer.id,
        customer_name: input.customer.name,
        customer_phone: input.customer.phone,
        customer_email: input.customer.email,
      },
      order_meta: { return_url: input.returnUrl },
    }),
  });

  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = (body?.["message"] as string) ?? `Cashfree order failed (${res.status})`;
    throw new Error(message);
  }
  return {
    paymentSessionId: body["payment_session_id"] as string,
    orderId: body["order_id"] as string,
    mode,
  };
}

export async function fetchCashfreeOrder(orderId: string) {
  const { clientId, clientSecret, baseUrl } = cashfreeConfig();
  const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      "x-api-version": API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
    },
  });
  if (!res.ok) return null;
  return (await res.json()) as { order_status?: string; cf_order_id?: string | number };
}

/** Cashfree signs `timestamp + rawBody` with the client secret (HMAC-SHA256, base64). */
export async function verifyCashfreeSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
): Promise<boolean> {
  if (!signature || !timestamp) return false;
  const { clientSecret } = cashfreeConfig();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

/** Sends a receipt via Resend when configured; silently no-ops otherwise. */
export async function sendPaymentEmail(opts: {
  to: string;
  name: string;
  credits: number;
  amountPaise: number;
  orderId: string;
  paymentId?: string | null;
}) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !opts.to) return { sent: false, reason: "not_configured" as const };
  const from = process.env["RESEND_FROM"] ?? "PropertyGenie <onboarding@resend.dev>";
  const amount = `₹${(opts.amountPaise / 100).toLocaleString("en-IN")}`;

  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;color:#111533">
      <h2 style="color:#0F1A63;margin:0 0 8px">Payment received</h2>
      <p>Hi ${escapeHtml(opts.name || "there")},</p>
      <p>We've received your payment of <strong>${amount}</strong> and added
      <strong>${opts.credits} listing credits</strong> to your PropertyGenie account.</p>
      <table style="border-collapse:collapse;margin:16px 0;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Order ID</td><td>${escapeHtml(opts.orderId)}</td></tr>
        ${opts.paymentId ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Payment ID</td><td>${escapeHtml(opts.paymentId)}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#666">Amount</td><td>${amount}</td></tr>
      </table>
      <p><a href="https://propertygenie.adszoo.in/dashboard" style="background:#0F1A63;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Go to dashboard</a></p>
      <p style="font-size:12px;color:#777;margin-top:24px">Questions? Reply to this email or write to askar@adszoo.in.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: `Payment received — ${opts.credits} listing credits added`,
        html,
      }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
