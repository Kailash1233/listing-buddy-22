// Server-only: uses request headers and the service-role client. Always
// reach this via a dynamic `await import(...)` inside a server fn handler —
// never a top-level import in a *.functions.ts file — or the bundler can't
// split it out of the client build (see client.server.ts for the same rule).
import { getRequestHeader } from "@tanstack/react-start/server";

export function clientIp(): string {
  const forwarded = getRequestHeader("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    "unknown";
  return ip.slice(0, 60);
}

/** Returns false when the caller has exceeded the bucket's allowance. */
export async function allow(bucket: string, subject: string, limit: number, windowSeconds: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("hit_rate_limit", {
    _bucket: bucket,
    _subject: subject,
    _limit: limit,
    _window_seconds: windowSeconds,
  });
  if (error) return true; // never block real users on a limiter outage
  return data === true;
}
