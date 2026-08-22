import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BedDouble, Building2, MapPin, Phone, Ruler, Share2 } from "lucide-react";
import { getPublicBrokerPage } from "@/lib/public-listing.functions";
import { formatINR, ogImageUrl, photoPaths, thumbUrl, waLink } from "@/lib/property";
import { BrokerAvatar } from "@/components/BrokerAvatar";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicBrokerPage({ data: { subdomain: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Agent unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const { broker, properties, origin } = loaderData;
    const name = broker.agency_name || broker.name;
    const live = properties.filter((p) => p.status === "active").length;
    const title = `${name} — property agent in Chennai`;
    const description =
      broker.bio?.slice(0, 155) ||
      `${live} live listing${live === 1 ? "" : "s"} from ${name}. Photos, prices and instant WhatsApp enquiry.`;
    const cover =
      broker.photo_url || photoPaths(properties.find((p) => photoPaths(p.photos)[0])?.photos)[0];
    const image = cover ? `${origin}${ogImageUrl(cover)}` : null;
    const url = `${origin}/p/${broker.subdomain_slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

  errorComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center text-muted-foreground">
      This agent page could not be loaded.
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center text-muted-foreground">
      No agent found at this address.
    </div>
  ),
  component: AgentPage,
});

function AgentPage() {
  const { broker, properties } = Route.useLoaderData();
  const name = broker.agency_name || broker.name;
  const live = properties.filter((p) => p.status === "active");

  const stats = [
    { label: "Listings", value: String(live.length) },
    { label: "Years exp", value: broker.years_experience != null ? String(broker.years_experience) : "–" },
    { label: "Deals closed", value: broker.deals_closed != null ? String(broker.deals_closed) : "–" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="navy-gradient">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex justify-end">
            <ShareButton name={name} />
          </div>
          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center">
            <BrokerAvatar
              name={broker.name}
              photoUrl={broker.photo_url}
              className="size-24 bg-white/10 text-2xl text-inherit"
            />
            <div className="min-w-0">
              <p className="eyebrow opacity-70">Chennai property agent</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{name}</h1>
              {broker.agency_name ? <p className="mt-1 opacity-80">{broker.name}</p> : null}

              <dl className="mt-5 flex gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="eyebrow opacity-60">{s.label}</dt>
                    <dd className="mt-1 text-2xl font-extrabold">{s.value}</dd>
                  </div>
                ))}
              </dl>

              {broker.bio ? (
                <p className="mt-5 max-w-xl text-sm leading-relaxed opacity-85">{broker.bio}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {broker.whatsapp_number ? (
                  <Button asChild variant="secondary">
                    <a
                      href={waLink(broker.whatsapp_number, `Hi ${broker.name}, I saw your listings.`)}
                    >
                      <WhatsAppIcon className="size-4" /> WhatsApp
                    </a>
                  </Button>
                ) : null}
                {broker.phone ? (
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 bg-transparent text-inherit hover:bg-white/10"
                  >
                    <a href={`tel:${broker.phone}`}>
                      <Phone className="size-4" /> Call
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="mb-5 text-lg font-bold">
          {live.length} propert{live.length === 1 ? "y" : "ies"} available
        </h2>

        {live.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 p-12 text-center">
            <Building2 className="size-7 text-muted-foreground" />
            <p className="font-semibold">No live listings right now</p>
            <p className="text-sm text-muted-foreground">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((p) => {
              const cover = photoPaths(p.photos)[0];
              return (
                <Link
                  key={p.id}
                  to="/b/$subdomain/p/$slug"
                  params={{ subdomain: broker.subdomain_slug, slug: p.slug }}
                  className="surface group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    {cover ? (
                      <img
                        src={thumbUrl(cover)}
                        alt={p.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.price_display || formatINR(p.price)}</span>
                      <Badge variant="secondary" className="capitalize">
                        {p.listing_type === "rent" ? "Rent" : "Sale"}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {p.bhk ? (
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-3.5" /> {p.bhk} BHK
                        </span>
                      ) : null}
                      {p.area_sqft ? (
                        <span className="flex items-center gap-1">
                          <Ruler className="size-3.5" /> {p.area_sqft} sqft
                        </span>
                      ) : null}
                      {p.locality ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {p.locality}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <PoweredByAdszoo />
    </main>
  );
}

function ShareButton({ name }: { name: string }) {
  const [busy, setBusy] = useState(false);

  async function share() {
    const url = window.location.href;
    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: name, text: `Properties from ${name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed the share sheet */
    }
    setBusy(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={share}
      disabled={busy}
      className="border-white/30 bg-transparent text-inherit hover:bg-white/10"
    >
      <Share2 className="size-4" /> Share
    </Button>
  );
}
