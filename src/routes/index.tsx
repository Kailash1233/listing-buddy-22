import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  FileText,
  MessageCircle,
  Sparkles,
  Share2,
  Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plotly — Turn listings into a digital sales catalogue" },
      {
        name: "description",
        content:
          "Chennai brokers: paste a rough WhatsApp note, get a polished property page, a ready share message and a PDF brochure. Leads land in your inbox.",
      },
      { property: "og:title", content: "Plotly — Property microsites for brokers" },
      {
        property: "og:description",
        content:
          "One link per property. WhatsApp-native. AI writes the listing for you. Built for independent brokers in Chennai.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Sparkles,
    title: "Paste your listing",
    body: "Drop in the same rough note you'd send on WhatsApp. Add photos. That's the whole input.",
  },
  {
    icon: Smartphone,
    title: "AI builds the page",
    body: "Structured details, a clean write-up and a mobile-first property page — ready in seconds, fully editable.",
  },
  {
    icon: Share2,
    title: "Share and capture leads",
    body: "Copy the WhatsApp message, send the link, download the brochure. Enquiries land in your dashboard.",
  },
];

const plans = [
  { name: "Free", price: "₹0", note: "3 live properties", perks: ["Property pages", "WhatsApp share", "Lead inbox"] },
  {
    name: "Starter",
    price: "₹499",
    note: "25 live properties",
    perks: ["Everything in Free", "PDF brochures", "Basic analytics"],
    featured: true,
  },
  {
    name: "Pro",
    price: "₹1,499",
    note: "Unlimited properties",
    perks: ["Everything in Starter", "Custom broker link", "Priority support"],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              P
            </span>
            Plotly
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <Badge className="mb-5 bg-accent text-accent-foreground hover:bg-accent">
              Built for independent brokers in Chennai
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] md:text-6xl">
              Turn your property listings into a digital sales catalogue
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              One link per property. WhatsApp-native. The AI writes the listing for you — you just
              review it and hit publish.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free plan includes 3 live properties. No card needed.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="surface overflow-hidden p-0 shadow-[var(--shadow-lift)]">
              <div className="h-40 bg-gradient-to-br from-primary to-primary/70" />
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">₹85 Lakhs</p>
                  <Badge variant="secondary">2 BHK</Badge>
                </div>
                <p className="text-sm font-semibold">Bright 2BHK in Anna Nagar — 1200 sqft</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="rounded-lg bg-muted p-2">East facing</div>
                  <div className="rounded-lg bg-muted p-2">4th floor</div>
                  <div className="rounded-lg bg-muted p-2">Covered parking</div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1">
                    <MessageCircle className="size-4" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    I'm interested
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="text-3xl font-bold md:text-4xl">Three steps, under a minute</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="surface p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {[
            { icon: Smartphone, t: "Pages buyers trust", d: "Image-forward, mobile-first listings that look like a real portal page — not a form dump." },
            { icon: MessageCircle, t: "WhatsApp-ready", d: "A pre-written share message and a wa.me button on every page, tracked as clicks." },
            { icon: FileText, t: "PDF brochure", d: "Download a clean one-page brochure generated from the same listing data." },
          ].map((f) => (
            <div key={f.t}>
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-3 font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="text-3xl font-bold md:text-4xl">Simple pricing</h2>
        <p className="mt-2 text-muted-foreground">
          Start with 2 free listings. After that, buy one-time listing packs — no subscription, and
          credits never expire. Agencies get a shared monthly pool.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[SOLO_PACKS.free, SOLO_PACKS.starter, SOLO_PACKS.launch].map((pack) => (
            <div
              key={pack.id}
              className={`surface p-6 ${pack.id === "launch" ? "ring-2 ring-primary" : ""}`}
            >
              {pack.id === "launch" && <Badge className="mb-3">Best value</Badge>}
              <h3 className="text-lg font-bold">{pack.name}</h3>
              <p className="mt-2 flex items-baseline gap-2 text-3xl font-extrabold">
                {rupees(pack.amountPaise)}
                {pack.compareAtPaise && isOfferLive(pack) ? (
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    {rupees(pack.compareAtPaise)}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pack.credits} listings · {pack.perListingLabel}
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> {pack.note}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> AI Quick Add + PDF brochure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> WhatsApp-ready share copy
                </li>
              </ul>
              <Button
                asChild
                className="mt-6 w-full"
                variant={pack.id === "launch" ? "default" : "outline"}
              >
                <Link to="/pricing">{pack.purchasable ? "See pack details" : "Start free"}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>


      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        Plotly · Property microsites for brokers · Chennai
      </footer>
    </div>
  );
}
