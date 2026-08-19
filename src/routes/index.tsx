import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  Inbox,
  MessageCircle,
  Sparkles,
  BedDouble,
  Ruler,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOLO_PACKS, isOfferLive, rupees } from "@/lib/pricing";
import { ArrowButton, Eyebrow, IconBadge } from "@/components/marketing";
import home4 from "@/assets/home-4.png.asset.json";
import home5 from "@/assets/home-5.png.asset.json";
import home6 from "@/assets/home-6.png.asset.json";
import home7 from "@/assets/home-7.png.asset.json";
import home8 from "@/assets/home-8.png.asset.json";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/**
 * Social-proof numbers. Keep these honest — replace the placeholders with real
 * counts as they grow. A dash renders when a number isn't ready to be claimed.
 */
const STATS: Array<{ value: string | null; label: string }> = [
  { value: null, label: "Properties listed" },
  { value: null, label: "Brokers onboarded" },
  { value: null, label: "Leads captured" },
];

const EXAMPLES = [
  { img: home4.url, title: "4 BHK villa, Thoraipakkam", price: "₹2.4 Cr", meta: "3200 sqft · East" },
  { img: home5.url, title: "3 BHK duplex, Perungudi", price: "₹1.15 Cr", meta: "1850 sqft · North" },
  { img: home6.url, title: "2 BHK home, Adambakkam", price: "₹78 Lakhs", meta: "1100 sqft · West" },
  { img: home7.url, title: "3 BHK flat, Velachery", price: "₹1.05 Cr", meta: "1420 sqft · East" },
  { img: home8.url, title: "4 BHK house, Medavakkam", price: "₹1.9 Cr", meta: "2600 sqft · South" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              P
            </span>
            Plotly
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            <a href="#how" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
              How it works
            </a>
            <Link
              to="/pricing"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              Pricing
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="navy-gradient relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-0 pt-16 text-center md:pt-24">
          <Eyebrow className="text-navy-foreground/60">Built for independent brokers in Chennai</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Don&apos;t waste another lead
            <br className="hidden sm:block" /> on a WhatsApp photo dump
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-navy-foreground/70 md:text-lg">
            Paste the same rough note you&apos;d send a buyer. Plotly writes the listing, builds a
            mobile property page, a share message and a PDF brochure — in seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-navy-foreground/25 text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground"
            >
              <a href="#examples">See a live example</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-navy-foreground/55">
            2 free listing credits. No card needed.
          </p>

          {/* Product on a stage */}
          <div className="stage-gradient relative mt-14 pb-16">
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-card text-left text-card-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
              <img
                src={home4.url}
                alt="Example Plotly property page cover"
                className="h-44 w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-extrabold text-primary">₹85 Lakhs</p>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    2 BHK
                  </span>
                </div>
                <p className="text-sm font-semibold">Bright 2BHK in Anna Nagar — 1200 sqft</p>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
                  {[
                    { icon: BedDouble, l: "2 BHK" },
                    { icon: Ruler, l: "1200 sqft" },
                    { icon: Compass, l: "East" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-muted px-2 py-2.5">
                      <s.icon className="mx-auto mb-1 size-3.5" />
                      {s.l}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                    <MessageCircle className="size-3.5" /> WhatsApp
                  </div>
                  <div className="flex-1 rounded-xl border border-border px-3 py-2 text-center text-xs font-semibold">
                    I&apos;m interested
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Eyebrow className="text-primary">Everything in one link</Eyebrow>
        <h2 className="mt-3 max-w-xl text-3xl font-extrabold md:text-4xl">
          One listing in. Four ways to sell it out.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="tile navy-gradient group">
            <IconBadge icon={Sparkles} className="bg-navy-foreground/12 text-navy-foreground" />
            <h3 className="mt-6 text-2xl font-bold">AI Quick Add</h3>
            <p className="mt-2 max-w-sm text-sm text-navy-foreground/70">
              Paste a rough WhatsApp note. Get a structured, ready-to-edit listing.
            </p>
            <div className="mt-auto flex justify-end pt-6">
              <ArrowButton className="text-navy-foreground" />
            </div>
          </article>

          <article className="tile group bg-peach text-peach-foreground">
            <IconBadge icon={MessageCircle} className="bg-peach-foreground/10 text-peach-foreground" />
            <h3 className="mt-6 text-2xl font-bold">WhatsApp-ready</h3>
            <p className="mt-2 max-w-sm text-sm text-peach-foreground/75">
              A pre-written share message plus a 1080×1920 Story image for every listing.
            </p>
            <div className="mt-auto flex justify-end pt-6">
              <ArrowButton className="text-peach-foreground" />
            </div>
          </article>

          <article className="tile group justify-end text-white">
            <img
              src={home7.url}
              alt="Modern Chennai apartment interior"
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="relative">
              <IconBadge icon={FileText} className="bg-white/15 text-white" />
              <h3 className="mt-6 text-2xl font-bold">PDF brochures</h3>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                A clean one-pager generated from the same listing data — cached and instant.
              </p>
              <div className="mt-6 flex justify-end">
                <ArrowButton className="text-white" />
              </div>
            </div>
          </article>

          <article className="tile group bg-secondary text-secondary-foreground">
            <IconBadge icon={Inbox} />
            <h3 className="mt-6 text-2xl font-bold">Lead inbox</h3>
            <p className="mt-2 max-w-sm text-sm text-secondary-foreground/75">
              Every enquiry lands in one place, with views and WhatsApp clicks tracked per listing.
            </p>
            <div className="mt-auto flex justify-end pt-6">
              <ArrowButton className="text-secondary-foreground" />
            </div>
          </article>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Eyebrow className="text-primary">How it works</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Three steps, under a minute</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Paste your listing",
                d: "Drop in the same rough note you'd send on WhatsApp. Add photos. That's the whole input.",
                img: home5.url,
              },
              {
                n: "02",
                t: "AI builds the page",
                d: "Structured details, a clean write-up and a mobile-first property page — fully editable.",
                img: home6.url,
              },
              {
                n: "03",
                t: "Share and capture leads",
                d: "Send the link, post the Story image, download the brochure. Enquiries land in your dashboard.",
                img: home8.url,
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <img src={s.img} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.n}
                  </span>
                  <h3 className="text-lg font-bold">{s.t}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 rounded-3xl bg-muted px-6 py-10 text-center sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold tracking-tight text-primary">{s.value ?? "—"}</p>
              <p className="eyebrow mt-2 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example listings */}
      <section id="examples" className="mx-auto max-w-6xl px-5 py-10 md:py-16">
        <Eyebrow className="text-primary">Live examples</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">What a published page looks like</h2>
        <div className="no-scrollbar mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {EXAMPLES.map((e) => (
            <article
              key={e.title}
              className="w-[17rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img src={e.img} alt={e.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <p className="text-lg font-extrabold text-primary">{e.price}</p>
                <p className="mt-1 text-sm font-semibold leading-snug">{e.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Eyebrow className="text-primary">Pricing</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Pay for listings, not for months</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Start with 2 free listings. After that, one-time packs — credits never expire. Agencies get
          a shared monthly pool.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[SOLO_PACKS.free, SOLO_PACKS.starter, SOLO_PACKS.launch].map((pack) => (
            <div
              key={pack.id}
              className={`rounded-3xl border p-6 ${
                pack.id === "launch" ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <h3 className="font-bold">{pack.name}</h3>
              <p className="mt-3 flex items-baseline gap-2 text-3xl font-extrabold">
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
              <Button
                asChild
                variant={pack.id === "launch" ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link to="/pricing">{pack.purchasable ? "See pack details" : "Start free"}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="navy-gradient rounded-3xl px-6 py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold md:text-4xl">
            Your next listing could be a link instead of ten blurry photos.
          </h2>
          <Button asChild size="lg" variant="secondary" className="mt-7 bg-background text-foreground hover:bg-background/90">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        Plotly · Property microsites for brokers · Chennai
      </footer>
    </div>
  );
}
