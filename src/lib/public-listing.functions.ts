import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const listingInput = z.object({
  subdomain: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(200),
});

const eventInput = z.object({
  propertyId: z.string().uuid(),
  eventType: z.enum(["view", "whatsapp_click", "call_click", "enquiry_submit"]),
});

export const getPublicListing = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listingInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: broker } = await supabaseAdmin
      .from("brokers")
      .select("id, name, agency_name, phone, whatsapp_number, subdomain_slug")
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

    return { broker, property };
  });

export const trackPublicEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("track_property_event", {
      _property_id: data.propertyId,
      _event_type: data.eventType,
    });
    return { ok: true };
  });
