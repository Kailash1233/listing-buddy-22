import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BedDouble,
  Building2,
  Compass,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Layers,
  Car,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Broker, Property } from "@/hooks/useBroker";
import { formatINR, mediaUrl, photoPaths, waLink } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/b/$subdomain/p/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicListing({
      data: { subdomain: params.subdomain, slug: params.slug },
    });
    if (!result) throw notFound();
    return {
      broker: result.broker as unknown as Broker,
      property: result.property as Property,
    };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Property unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const { property, broker } = loaderData;
    const title = `${property.title} — ${broker.agency_name || broker.name}`;
    const description =
      property.meta_description ||
      `${property.title} in ${property.locality ?? "Chennai"}. ${property.price_display || formatINR(property.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">This listing couldn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try refreshing the page.</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Listing not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This property may have been sold or removed by the broker.
        </p>
      </div>
    </div>
  ),
  component: PublicProperty,
});

function PublicProperty() {
  const { broker, property } = Route.useLoaderData();
  const photos = photoPaths(property.photos);
  const [active, setActive] = useState(0);

  useEffect(() => {
    void supabase.rpc("track_property_event", {
      _property_id: property.id,
      _event_type: "view",
    });
  }, [property.id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const waMessage = `${property.whatsapp_message || property.title}\n\n${shareUrl}`;

  const specs = [
    property.bhk != null && { icon: BedDouble, label: `${property.bhk} BHK` },
    property.area_sqft != null && { icon: Ruler, label: `${property.area_sqft} sqft` },
    property.facing && { icon: Compass, label: `${property.facing} facing` },
    property.floor && { icon: Layers, label: `Floor ${property.floor}` },
    property.parking && { icon: Car, label: property.parking },
    { icon: Building2, label: property.property_type },
  ].filter(Boolean) as Array<{ icon: typeof BedDouble; label: string }>;

  const track = (t: "whatsapp_click" | "call_click") =>
    void supabase.rpc("track_property_event", { _property_id: property.id, _event_type: t });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-bold">{broker.agency_name || broker.name}</p>
            <p className="text-xs text-muted-foreground">Chennai real estate</p>
          </div>
          {property.status !== "active" && (
            <Badge variant="secondary" className="uppercase">{property.status}</Badge>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {photos.length > 0 && (
          <section className="pt-4">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={mediaUrl(photos[active])}
                alt={property.title}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setActive(i)}
                    className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === active ? "border-primary" : "border-transparent"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                  >
                    <img src={mediaUrl(p)} alt="" className="size-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="pt-6">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight">{property.title}</h1>
          {property.locality && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {property.locality}, {property.city}
            </p>
          )}
          <p className="mt-3 text-3xl font-extrabold text-primary">
            {property.price_display || formatINR(property.price)}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              {property.listing_type === "rent" ? "per month" : ""}
            </span>
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {specs.map((s) => (
            <div key={s.label} className="surface flex items-center gap-2 p-3 text-sm capitalize">
              <s.icon className="size-4 text-primary" />
              {s.label}
            </div>
          ))}
        </section>

        {property.description && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">About this property</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </section>
        )}

        {property.amenities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="rounded-full px-3 py-1 font-normal">
                  {a}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {property.floor_plan_url && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Floor plan</h2>
            <img
              src={mediaUrl(property.floor_plan_url)}
              alt="Floor plan"
              className="mt-3 w-full rounded-xl border border-border"
              loading="lazy"
            />
          </section>
        )}

        {property.address_text && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Location</h2>
            <p className="mt-2 text-sm text-muted-foreground">{property.address_text}</p>
            {property.lat != null && property.lng != null && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="size-4" /> Open in Maps
                </a>
              </Button>
            )}
          </section>
        )}

        <section className="surface mt-8 flex items-center gap-4 p-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {broker.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{broker.name}</p>
            <p className="text-sm text-muted-foreground">{broker.agency_name || "Independent broker"}</p>
          </div>
          <Button asChild size="sm" variant="outline" onClick={() => track("call_click")}>
            <a href={`tel:${broker.phone || broker.whatsapp_number}`}>
              <Phone className="size-4" /> Call
            </a>
          </Button>
        </section>

        <LeadForm property={property} brokerId={broker.id} />

        <section className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/public/brochure/${property.id}`} target="_blank" rel="noreferrer">
              <Download className="size-4" /> Download brochure
            </a>
          </Button>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          {property.rera_number
            ? `RERA: ${property.rera_number} (provided by broker, not independently verified).`
            : "RERA number not provided by the broker."}{" "}
          Listing details are provided by {broker.name} and are not verified by this platform. Please verify
          documents before any transaction.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button
            asChild
            className="flex-1"
            onClick={() => track("whatsapp_click")}
          >
            <a href={waLink(broker.whatsapp_number, waMessage)} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> WhatsApp broker
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" })}
          >
            Enquire
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadForm({ property, brokerId }: { property: Property; brokerId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please add your name and a valid phone number.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("leads").insert({
      property_id: property.id,
      broker_id: brokerId,
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      whatsapp_number: phone.replace(/\D/g, ""),
      message: message.trim() || null,
      budget_max: budget ? Number(budget.replace(/\D/g, "")) || null : null,
    });
    setSending(false);
    if (error) {
      toast.error("Could not send your enquiry. Please try WhatsApp instead.");
      return;
    }
    void supabase.rpc("track_property_event", {
      _property_id: property.id,
      _event_type: "enquiry_submit",
    });
    setDone(true);
  }

  if (done) {
    return (
      <section id="enquiry" className="surface mt-8 flex flex-col items-center gap-2 p-8 text-center">
        <ShieldCheck className="size-8 text-primary" />
        <p className="font-semibold">Enquiry sent!</p>
        <p className="text-sm text-muted-foreground">The broker will get in touch with you shortly.</p>
      </section>
    );
  }

  return (
    <section id="enquiry" className="surface mt-8 space-y-4 p-5">
      <div>
        <h2 className="text-lg font-bold">Interested in this property?</h2>
        <p className="text-sm text-muted-foreground">Leave your details and the broker will call you back.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Your name</Label>
          <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Phone / WhatsApp</Label>
          <Input
            id="lead-phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lead-budget">Your budget (optional)</Label>
        <Input
          id="lead-budget"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="8000000"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lead-msg">Message (optional)</Label>
        <Textarea
          id="lead-msg"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I'd like to schedule a site visit this weekend."
        />
      </div>
      <Button className="w-full" onClick={submit} disabled={sending}>
        {sending && <Loader2 className="size-4 animate-spin" />} Send enquiry
      </Button>
    </section>
  );
}
