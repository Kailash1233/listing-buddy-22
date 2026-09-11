import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentialsInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(72),
});

const emailInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

/** Generic response so a caller can never tell whether an email was already registered. */
type SignUpResult = { ok: true } | { ok: false; message: string };

export const signUpBroker = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => credentialsInput.parse(data))
  .handler(async ({ data }): Promise<SignUpResult> => {
    const { clientIp, allow } = await import("@/lib/rate-limit.server");
    const ip = clientIp();
    if (!(await allow("signup", ip, 8, 3600))) {
      return { ok: false, message: "Too many attempts. Please try again in a while." };
    }
    if (!(await allow("signup_email", data.email, 4, 3600))) {
      return {
        ok: false,
        message: "Too many attempts for this email. Please try again in a while.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSignupConfirmationEmail, sendAccountExistsEmail } =
      await import("@/lib/auth-email.server");
    const { requestOrigin } = await import("@/lib/request-origin");

    const redirectTo = `${requestOrigin()}/dashboard`;

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: data.email,
      password: data.password,
      options: { redirectTo },
    });

    if (error || !link?.properties?.action_link) {
      // Anti-enumeration: a duplicate/registered email must look identical to success.
      if (
        error?.status === 422 ||
        /already.*registered|already.*exists/i.test(error?.message ?? "")
      ) {
        await sendAccountExistsEmail(data.email);
        return { ok: true };
      }
      console.error("[auth] generateLink(signup) failed", error?.message);
      return { ok: false, message: "Something went wrong. Please try again." };
    }

    const sent = await sendSignupConfirmationEmail(data.email, link.properties.action_link);
    if (!sent)
      return {
        ok: false,
        message: "Could not send the confirmation email. Please try again shortly.",
      };
    return { ok: true };
  });

export const resendConfirmation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }): Promise<SignUpResult> => {
    const { allow } = await import("@/lib/rate-limit.server");
    if (!(await allow("resend_confirmation", data.email, 3, 600))) {
      return { ok: false, message: "Please wait a bit before requesting another email." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSignupConfirmationEmail } = await import("@/lib/auth-email.server");
    const { requestOrigin } = await import("@/lib/request-origin");

    const redirectTo = `${requestOrigin()}/dashboard`;

    // magiclink doesn't need the original password and, like the signup link,
    // both confirms the email and signs the user in once clicked.
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
      options: { redirectTo },
    });

    if (error || !link?.properties?.action_link) {
      // Anti-enumeration: don't reveal whether the account exists.
      return { ok: true };
    }

    const sent = await sendSignupConfirmationEmail(data.email, link.properties.action_link);
    if (!sent) return { ok: false, message: "Could not send the email. Please try again shortly." };
    return { ok: true };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }): Promise<SignUpResult> => {
    const { allow } = await import("@/lib/rate-limit.server");
    if (!(await allow("password_reset", data.email, 3, 600))) {
      return { ok: false, message: "Please wait a bit before requesting another email." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendPasswordResetEmail } = await import("@/lib/auth-email.server");
    const { requestOrigin } = await import("@/lib/request-origin");

    const redirectTo = `${requestOrigin()}/reset-password`;

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: { redirectTo },
    });

    if (error || !link?.properties?.action_link) {
      // Anti-enumeration: an unknown email must look identical to success.
      return { ok: true };
    }

    const sent = await sendPasswordResetEmail(data.email, link.properties.action_link);
    if (!sent) return { ok: false, message: "Could not send the email. Please try again shortly." };
    return { ok: true };
  });
