/**
 * Auth emails (signup confirmation), sent via Resend instead of Supabase's
 * built-in mailer — Lovable Cloud routes the default Supabase auth mailer
 * through its own relay, which we don't want for account-confirmation mail.
 */

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

function resendConfig() {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return null;
  const from = process.env["RESEND_FROM"] ?? "PropertyGenie <onboarding@resend.dev>";
  return { apiKey, from };
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const config = resendConfig();
  if (!config) {
    console.error(
      "[auth-email] RESEND_API_KEY is not configured — cannot send auth email. " +
        "Add RESEND_API_KEY (and optionally RESEND_FROM) as a secret in the project.",
    );
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) console.error("[auth-email] Resend send failed", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[auth-email] Resend send threw", String(err));
    return false;
  }
}

function shell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;color:#111533">
      <h2 style="color:#0F1A63;margin:0 0 8px">${escapeHtml(title)}</h2>
      ${bodyHtml}
      <p style="font-size:12px;color:#777;margin-top:24px">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0">
    <a href="${href}" style="background:#0F1A63;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

/** New signup or a resend for an unconfirmed account — the link both confirms the email and signs the user in. */
export async function sendSignupConfirmationEmail(
  to: string,
  actionLink: string,
): Promise<boolean> {
  const html = shell(
    "Confirm your email",
    `<p>Thanks for signing up for PropertyGenie. Click below to confirm your email and get into your dashboard.</p>
     ${button(actionLink, "Confirm email")}
     <p style="font-size:12px;color:#777">Or paste this link into your browser:<br>${escapeHtml(actionLink)}</p>`,
  );
  return sendViaResend({ to, subject: "Confirm your email — PropertyGenie", html });
}

/** Anti-enumeration: a signup attempt on an email that's already registered gets this instead of an error, so the requester can't tell either way. */
export async function sendAccountExistsEmail(to: string): Promise<boolean> {
  const html = shell(
    "You already have a PropertyGenie account",
    `<p>Someone (hopefully you) just tried to sign up for PropertyGenie with this email address, which already has an account.</p>
     <p>If that was you, just log in instead with your existing password.</p>`,
  );
  return sendViaResend({ to, subject: "You already have a PropertyGenie account", html });
}

/** Password reset — clicking the link signs the user in so they can set a new password. */
export async function sendPasswordResetEmail(to: string, actionLink: string): Promise<boolean> {
  const html = shell(
    "Reset your password",
    `<p>We got a request to reset the password on your PropertyGenie account.</p>
     ${button(actionLink, "Reset password")}
     <p style="font-size:12px;color:#777">Or paste this link into your browser:<br>${escapeHtml(actionLink)}</p>`,
  );
  return sendViaResend({ to, subject: "Reset your password — PropertyGenie", html });
}

/** Sent when an agency owner invites a sub-agent by email. */
export async function sendAgencyInviteEmail(
  to: string,
  agencyName: string,
  origin: string,
): Promise<boolean> {
  const signupLink = `${origin}/auth?mode=signup`;
  const html = shell(
    "You've been invited to a PropertyGenie team",
    `<p><strong>${escapeHtml(agencyName)}</strong> invited you to join their team on PropertyGenie.</p>
     <p>Sign up with this email address (${escapeHtml(to)}) and you'll join their shared listing pool automatically.</p>
     ${button(signupLink, "Create your account")}`,
  );
  return sendViaResend({ to, subject: `${agencyName} invited you to PropertyGenie`, html });
}
