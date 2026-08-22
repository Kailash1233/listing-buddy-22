import { getRequestHeader, getRequestURL } from "@tanstack/react-start/server";

/** Absolute origin of the incoming request — needed for absolute og:image URLs. */
export function requestOrigin(): string {
  try {
    const url = getRequestURL();
    const forwardedHost = url.hostname === "localhost" ? getRequestHeader("x-forwarded-host") : null;
    return forwardedHost ? `https://${forwardedHost}` : url.origin;
  } catch {
    return "https://propertygenie.adszoo.in";
  }
}
