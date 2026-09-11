import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inviteInput = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

type InviteResult = { ok: boolean; reason?: string };

/**
 * Wraps the invite_agency_member RPC (unchanged business rules: agency mode,
 * active subscription, seat limits, duplicate invites) so an actual email
 * goes out — the RPC alone only inserted a row, the invitee never heard
 * about it unless the owner told them separately.
 */
export const inviteAgencyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteInput.parse(data))
  .handler(async ({ data, context }): Promise<InviteResult> => {
    const { allow } = await import("@/lib/rate-limit.server");
    if (!(await allow("agency_invite", context.userId, 15, 3600))) {
      return { ok: false, reason: "rate_limited" };
    }

    const { data: broker } = await context.supabase
      .from("brokers")
      .select("name, agency_name")
      .eq("id", context.userId)
      .maybeSingle();

    const { data: result, error } = await context.supabase.rpc("invite_agency_member", {
      _email: data.email,
    });
    if (error) return { ok: false, reason: "failed" };

    const res = result as InviteResult | null;
    if (!res?.ok) return res ?? { ok: false, reason: "failed" };

    const { sendAgencyInviteEmail } = await import("@/lib/auth-email.server");
    const { requestOrigin } = await import("@/lib/request-origin");
    await sendAgencyInviteEmail(
      data.email,
      broker?.agency_name || broker?.name || "A PropertyGenie agency",
      requestOrigin(),
    );

    return { ok: true };
  });
