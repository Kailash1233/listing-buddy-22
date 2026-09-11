import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestOrigin } from "@/lib/request-origin";

const listingInput = z.object({
  subdomain: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(200),
});

const eventInput = z.object({
  propertyId: z.string().uuid(),
  eventType: z.enum(["view", "whatsapp_click", "call_click", "enquiry_submit"]),
});

const leadInput = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/),
  message: z.string().trim().max(1000).nullable().optional(),
  budgetMax: z.number().int().positive().max(100_000_000_000).nullable().optional(),
});

export const getPublicListing = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listingInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: broker } = await supabaseAdmin
      .from("brokers")
      .select(
        "id, name, agency_name, phone, whatsapp_number, subdomain_slug, bio, photo_url, years_experience, deals_closed",
      )
      .eq("subdomain_slug", data.subdomain)
      .maybeSingle();
    if (!broker) return null;

    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("broker_id", broker.id)
      .eq("slug", data.slug)
      .in("status", ["active", "sold", "rented"])
      .maybeSingle();
    if (!property) return null;

    const { count } = await supabaseAdmin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("broker_id", broker.id)
      .eq("status", "active");

    return { broker, property, activeCount: count ?? 0, origin: requestOrigin() };
  });

export const trackPublicEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventInput.parse(data))
  .handler(async ({ data }) => {
    const { clientIp, allow } = await import("@/lib/rate-limit.server");
    const ip = clientIp();
    // Generous per-IP ceiling: real visitors never hit it, scripted inflation does.
    if (!(await allow("event", `${ip}:${data.propertyId}`, 30, 300))) {
      return { ok: false, reason: "rate_limited" as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("track_property_event", {
      _property_id: data.propertyId,
      _event_type: data.eventType,
    });
    return { ok: true };
  });

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadInput.parse(data))
  .handler(async ({ data }) => {
    const { clientIp, allow } = await import("@/lib/rate-limit.server");
    const ip = clientIp();
    if (!(await allow("lead", ip, 5, 3600))) {
      return { ok: false as const, reason: "rate_limited" as const };
    }
    if (!(await allow("lead_property", `${ip}:${data.propertyId}`, 2, 86_400))) {
      return { ok: false as const, reason: "duplicate" as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("id, broker_id")
      .eq("id", data.propertyId)
      .eq("status", "active")
      .maybeSingle();
    if (!property) return { ok: false as const, reason: "not_found" as const };

    const { error } = await supabaseAdmin.from("leads").insert({
      property_id: property.id,
      broker_id: property.broker_id,
      name: data.name,
      phone: data.phone,
      whatsapp_number: data.phone,
      message: data.message ?? null,
      budget_max: data.budgetMax ?? null,
    });
    if (error) return { ok: false as const, reason: "failed" as const };

    await supabaseAdmin.rpc("track_property_event", {
      _property_id: property.id,
      _event_type: "enquiry_submit",
    });
    return { ok: true as const };
  });

export const getPublicBrokerPage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ subdomain: z.string().trim().min(1).max(80) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: broker } = await supabaseAdmin
      .from("brokers")
      .select(
        "id, name, agency_name, phone, whatsapp_number, subdomain_slug, bio, photo_url, years_experience, deals_closed",
      )
      .eq("subdomain_slug", data.subdomain)
      .maybeSingle();
    if (!broker) return null;

    const { data: properties } = await supabaseAdmin
      .from("properties")
      .select(
        "id, slug, title, price_display, price, bhk, area_sqft, locality, city, photos, photo_blurhashes, status, property_type, listing_type",
      )
      .eq("broker_id", broker.id)
      .in("status", ["active", "sold", "rented"])
      .order("created_at", { ascending: false })
      .limit(60);

    return { broker, properties: properties ?? [], origin: requestOrigin() };
  });
