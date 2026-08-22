import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BedDouble, Building2, MapPin, Ruler } from "lucide-react";
import { getPublicBrokerPage } from "@/lib/public-listing.functions";
import { formatINR, mediaUrl, photoPaths, waLink } from "@/lib/property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/b/$subdomain/")({
  loader: async ({ params }) => {
    const result = await getPublicBrokerPage({ data: { subdomain: params.subdomain } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const name = loaderData.broker.agency_name || loaderData.broker.name;
    const title = `${name} — properties in Chennai`;
    const description = `Browse ${loaderData.properties.length} live listings from ${name}. Photos, prices and instant WhatsApp enquiry.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center text-muted-foreground">
      This page could not be loaded.
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center text-muted-foreground">
      No broker page found at this address.
    </div>
  ),
  component: BrokerPage,
});

function BrokerPage() {
  const { broker, properties } = Route.useLoaderData();
  const name = broker.agency_name || broker.name;

  return (
    <main className="min-h-screen bg-background">
      <header className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Chennai</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{name}</h1>
          <p className="mt-1 text-muted-foreground">
            {properties.length} propert{properties.length === 1 ? "y" : "ies"} available
          </p>
          {broker.whatsapp_number ? (
            <Button asChild className="mt-5">
              <a href={waLink(broker.whatsapp_number, `Hi ${broker.name}, I saw your listings.`)}>
                <WhatsAppIcon className="size-4" /> WhatsApp {broker.name.split(" ")[0]}
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        {properties.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 p-12 text-center">
            <Building2 className="size-7 text-muted-foreground" />
            <p className="font-semibold">No live listings right now</p>
            <p className="text-sm text-muted-foreground">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
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
                        src={mediaUrl(cover)}
                        alt={p.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.price_display || formatINR(p.price)}</span>
                      {p.status !== "active" ? (
                        <Badge variant="secondary" className="capitalize">
                          {p.status}
                        </Badge>
                      ) : null}
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
