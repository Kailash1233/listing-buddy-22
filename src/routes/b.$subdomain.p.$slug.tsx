import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getPublicListing, submitLead, trackPublicEvent } from "@/lib/public-listing.functions";
import type { Broker, Property } from "@/hooks/useBroker";
import { formatINR, mediaUrl, thumbUrl, photoPaths, waLink } from "@/lib/property";
import { BrochureButton } from "@/components/BrochureButton";
import { BrokerAvatar } from "@/components/BrokerAvatar";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";
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
      activeCount: result.activeCount,
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
  const { broker, property, activeCount } = Route.useLoaderData();
  const photos = photoPaths(property.photos);
  const [active, setActive] = useState(0);

  useEffect(() => {
    void trackPublicEvent({ data: { propertyId: property.id, eventType: "view" } });
  }, [property.id]);

  // Set after hydration so SSR and client markup match.
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setShareUrl(window.location.href), []);
  const waMessage = `${property.whatsapp_message || property.title}\n\n${shareUrl}`;

  const facts = [
    property.bhk != null && { label: "Configuration", value: `${property.bhk} BHK` },
    property.area_sqft != null && { label: "Built-up area", value: `${property.area_sqft} sqft` },
    property.facing && { label: "Facing", value: property.facing },
    property.floor && { label: "Floor", value: property.floor },
    property.parking && { label: "Parking", value: property.parking },
    { label: "Property type", value: property.property_type },
    { label: "Listed for", value: property.listing_type === "rent" ? "Rent" : "Sale" },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const track = (t: "whatsapp_click" | "call_click") =>
    void trackPublicEvent({ data: { propertyId: property.id, eventType: t } });

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
                    <img src={thumbUrl(p)} alt="" className="size-full object-cover" loading="lazy" />
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

        <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="border-b border-r border-border p-4">
              <p className="eyebrow text-muted-foreground">{f.label}</p>
              <p className="mt-1 text-base font-bold capitalize">{f.value}</p>
            </div>
          ))}
        </section>

        {property.broker_note && (
          <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="eyebrow text-primary">Note from {broker.name.split(" ")[0]}</p>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">
              {property.broker_note}
            </p>
          </section>
        )}

        {property.description && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">About this property</h2>
            <Expandable text={property.description} />
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
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
              {property.lat != null && property.lng != null && (
                <iframe
                  title="Map"
                  loading="lazy"
                  className="h-56 w-full border-0"
                  src={`https://www.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                />
              )}
              <p className="p-4 text-sm text-muted-foreground">{property.address_text}</p>
            </div>
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

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <BrokerAvatar name={broker.name} photoUrl={broker.photo_url} className="size-12" />
            <div className="min-w-0">
              <p className="truncate font-bold">{broker.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {broker.agency_name ? `${broker.agency_name} · ` : ""}Property agent
              </p>
              <p className="text-sm text-muted-foreground">
                {activeCount} active listing{activeCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link
            to="/p/$slug"
            params={{ slug: broker.subdomain_slug }}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View {broker.name.split(" ")[0]}'s profile <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <p className="eyebrow text-muted-foreground">Contact agent</p>
          <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {broker.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{broker.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {broker.agency_name || "Independent broker"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild onClick={() => track("whatsapp_click")}>
              <a href={waLink(broker.whatsapp_number, waMessage)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" onClick={() => track("call_click")}>
              <a href={`tel:${broker.phone || broker.whatsapp_number}`}>
                <Phone className="size-4" /> Call
              </a>
            </Button>
          </div>
        </section>

        <LeadForm property={property} />

        <section className="mt-6">
          <BrochureButton propertyId={property.id} slug={property.slug} />
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          {property.rera_number
            ? `RERA: ${property.rera_number} (provided by broker, not independently verified).`
            : "RERA number not provided by the broker."}{" "}
          Listing details are provided by {broker.name} and are not verified by this platform. Please verify
          documents before any transaction.
        </p>

        <PoweredByAdszoo />
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

function LeadForm({ property }: { property: Property }) {
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
    const digits = phone.replace(/\D/g, "");
    const result = await submitLead({
      data: {
        propertyId: property.id,
        name: name.trim(),
        phone: digits,
        message: message.trim() || null,
        budgetMax: budget ? Number(budget.replace(/\D/g, "")) || null : null,
      },
    }).catch(() => null);
    setSending(false);
    if (!result?.ok) {
      toast.error(
        result?.reason === "rate_limited" || result?.reason === "duplicate"
          ? "You've already sent an enquiry. Please WhatsApp the broker directly."
          : "Could not send your enquiry. Please try WhatsApp instead.",
      );
      return;
    }
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

function Expandable({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 420;
  return (
    <div>
      <p
        className={`mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground ${
          long && !open ? "line-clamp-6" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
