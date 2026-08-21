import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  Check,
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
import { cn } from "@/lib/utils";
import home4 from "@/assets/home-4.png.asset.json";
import home5 from "@/assets/home-5.png.asset.json";
import home6 from "@/assets/home-6.png.asset.json";
import home7 from "@/assets/home-7.png.asset.json";
import home8 from "@/assets/home-8.png.asset.json";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";

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

const TOTAL = 5;

function Landing() {
  const [step, setStep] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (next: number) => setStep(Math.min(TOTAL - 1, Math.max(0, next)));

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              P
            </span>
            Plotly
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            <button
              type="button"
              onClick={() => go(2)}
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              How it works
            </button>
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

      <main className="flex flex-1 items-start justify-center px-4 py-6 sm:py-10">
        <section
          className="relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-[0_30px_60px_-40px_rgba(0,0,0,0.45)]"
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const delta = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
            if (Math.abs(delta) > 60) go(delta < 0 ? step + 1 : step - 1);
            touchX.current = null;
          }}
        >
          {/* Card top bar: back + progress dots */}
          <div className="relative flex items-center justify-center px-4 pb-2 pt-4">
            {step > 0 ? (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => go(step - 1)}
                className="absolute left-3 grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-250",
                    i === step ? "w-5 bg-primary" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Slides */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-250 ease-out"
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              <Slide active={step === 0}>
                <HeroPage />
              </Slide>
              <Slide active={step === 1}>
                <WhatYouGetPage />
              </Slide>
              <Slide active={step === 2}>
                <HowItWorksPage />
              </Slide>
              <Slide active={step === 3}>
                <IncludedPage />
              </Slide>
              <Slide active={step === 4}>
                <PricingPage />
              </Slide>
            </div>
          </div>

          {/* Sticky CTA */}
          <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
            {step < TOTAL - 1 ? (
              <Button size="lg" className="w-full rounded-full" onClick={() => go(step + 1)}>
                {["Next", "See How It Works", "See Pricing", "See Plans"][step]}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full rounded-full">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start Free <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
            <PoweredByAdszoo className="pt-3" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Slide({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        "w-full shrink-0 px-5 pb-6 pt-2 transition-opacity duration-250",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Page 1 — Hero ---------------- */

function HeroPage() {
  return (
    <div className="text-center">
      <span className="eyebrow inline-block rounded-full bg-primary/10 px-3 py-1 text-primary">
        Built for Chennai brokers
      </span>
      <h1 className="mt-4 text-[1.75rem] font-extrabold leading-[1.1]">
        Don&apos;t waste another lead on a WhatsApp photo dump
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Paste the same rough note you&apos;d send a buyer. Plotly writes the listing, builds a
        property page, a share message and a PDF brochure — in seconds.
      </p>

      <div className="mx-auto mt-6 w-full overflow-hidden rounded-3xl border border-border bg-card text-left text-card-foreground">
        <img src={home4.url} alt="Example Plotly property page cover" className="h-40 w-full object-cover" />
        <div className="space-y-3 p-4">
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

      <p className="mt-4 text-xs text-muted-foreground">2 free listing credits · No card needed</p>
    </div>
  );
}

/* ---------------- Page 2 — What you get ---------------- */

const FEATURES = [
  { icon: Sparkles, t: "AI Quick Add", d: "Paste a rough note, get a structured listing" },
  { icon: MessageCircle, t: "WhatsApp-ready", d: "Pre-written share message + Story image" },
  { icon: FileText, t: "PDF brochures", d: "Clean one-pager, generated instantly" },
  { icon: Inbox, t: "Lead inbox", d: "Every enquiry in one place, views tracked" },
];

function WhatYouGetPage() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold leading-tight">One listing in. Four ways to sell it out.</h2>
      <ul className="mt-6 space-y-3">
        {FEATURES.map((f) => (
          <li key={f.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold">{f.t}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{f.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Page 3 — How it works ---------------- */

const STEPS = [
  {
    tab: "Paste Listing",
    n: "01",
    t: "Paste your listing",
    d: "Drop in the rough note you'd send on WhatsApp, add photos.",
    img: home5.url,
  },
  {
    tab: "AI Builds Page",
    n: "02",
    t: "AI builds the page",
    d: "Structured details, a clean write-up and a mobile-first page — fully editable.",
    img: home6.url,
  },
  {
    tab: "Share & Capture",
    n: "03",
    t: "Share and capture",
    d: "Send the link, post the Story, download the brochure. Leads land in your dashboard.",
    img: home8.url,
  },
];

function HowItWorksPage() {
  const [tab, setTab] = useState(0);
  const s = STEPS[tab] ?? STEPS[0]!;
  return (
    <div>
      <h2 className="text-2xl font-extrabold leading-tight">Three steps, under a minute</h2>
      <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {STEPS.map((x, i) => (
          <button
            key={x.tab}
            type="button"
            onClick={() => setTab(i)}
            className={cn(
              "rounded-full px-2 py-2 text-[11px] font-semibold transition-colors",
              i === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border">
        <img src={s.img} alt={s.t} loading="lazy" className="aspect-[16/10] w-full object-cover" />
      </div>

      <ol className="mt-5 space-y-3">
        {STEPS.map((x, i) => (
          <li
            key={x.n}
            className={cn(
              "flex gap-3 rounded-2xl border p-3 transition-colors",
              i === tab ? "border-primary/40 bg-primary/5" : "border-border bg-card",
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {x.n}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{x.t}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{x.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Page 4 — Everything included ---------------- */

const CHECKS = ["AI Quick Add", "WhatsApp share", "PDF brochure", "Lead inbox", "No card needed"];

function IncludedPage() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold leading-tight">Start with 2 free listings</h2>

      <div className="relative mx-auto mt-6 h-52 w-full max-w-[300px]">
        {[home7.url, home6.url, home4.url].map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="absolute top-0 h-52 w-32 rounded-2xl border border-border object-cover shadow-lg"
            style={{
              left: `${i * 28 + 8}%`,
              zIndex: i,
              transform: `rotate(${(i - 1) * 6}deg)`,
            }}
          />
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {CHECKS.map((c) => (
          <li key={c} className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-semibold">
            <Check className="size-4 shrink-0 text-primary" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Page 5 — Pricing ---------------- */

function PricingPage() {
  const packs = [SOLO_PACKS.free, SOLO_PACKS.starter, SOLO_PACKS.launch];
  return (
    <div>
      <h2 className="text-2xl font-extrabold leading-tight">Pay for listings, not for months</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Start with 2 free listings. After that, one-time packs — credits never expire.
      </p>

      <div className="mt-5 space-y-3">
        {packs.map((pack) => {
          const offer = pack.compareAtPaise && isOfferLive(pack);
          const off = offer
            ? Math.round((1 - pack.amountPaise / (pack.compareAtPaise as number)) * 100)
            : null;
          return (
            <div
              key={pack.id}
              className={cn(
                "rounded-2xl border p-4",
                pack.id === "launch" ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{pack.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.credits} listings
                    {pack.perListingLabel !== "—" ? ` · ${pack.perListingLabel}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-extrabold">{rupees(pack.amountPaise)}</p>
                  {offer ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {rupees(pack.compareAtPaise as number)}
                    </p>
                  ) : null}
                </div>
              </div>
              {off ? (
                <span className="mt-3 inline-block rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                  {off}% OFF
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Agencies get a shared monthly pool —{" "}
        <Link to="/pricing" className="font-semibold text-primary underline-offset-2 hover:underline">
          see all plans
        </Link>
      </p>
    </div>
  );
}
