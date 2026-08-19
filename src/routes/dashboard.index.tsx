import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ExternalLink,
  Eye,
  Globe,
  Inbox,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBroker, type Lead, type Property } from "@/hooks/useBroker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Plotly" },
      {
        name: "description",
        content: "Track views, enquiries and your live property pages in one place.",
      },
      { property: "og:title", content: "Your dashboard — Plotly" },
      {
        property: "og:description",
        content: "Track views, enquiries and your live property pages in one place.",
      },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { data: broker } = useBroker();

  const properties = useQuery({
    queryKey: ["properties", broker?.id],
    enabled: !!broker,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("broker_id", broker!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const leads = useQuery({
    queryKey: ["leads", broker?.id],
    enabled: !!broker,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("broker_id", broker!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const list = properties.data ?? [];
  const views = list.reduce((a, p) => a + (p.view_count ?? 0), 0);
  const waClicks = list.reduce((a, p) => a + (p.whatsapp_click_count ?? 0), 0);
  const newLeads = (leads.data ?? []).filter((l) => !l.is_read).length;

  const stats = [
    {
      label: "Live listings",
      value: list.filter((p) => p.status === "active").length,
      icon: Building2,
    },
    { label: "Page views", value: views, icon: Eye },
    { label: "WhatsApp clicks", value: waClicks, icon: MessageCircle },
    { label: "New enquiries", value: newLeads, icon: Inbox },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Hi {broker?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's how your listings are doing.</p>
      </div>

      {broker ? <CreditsBanner broker={broker} /> : null}

      {broker ? (
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-semibold">Your website is live</p>
              <p className="text-sm text-muted-foreground">
                All your published listings on one shareable page.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/b/$subdomain" params={{ subdomain: broker.subdomain_slug }} target="_blank">
              Visit page <ExternalLink className="size-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface p-4">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent properties</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/properties">View all</Link>
          </Button>
        </div>

        {properties.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 p-10 text-center">
            <Building2 className="size-8 text-muted-foreground" />
            <p className="font-semibold">No properties yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a rough WhatsApp description and we'll build a shareable property page for you.
            </p>
            <Button asChild>
              <Link to="/dashboard/properties/new">
                <Plus className="size-4" /> Add your first property
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} subdomain={broker!.subdomain_slug} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CreditsBanner({ broker }: { broker: NonNullable<ReturnType<typeof useBroker>["data"]> }) {
  const credits = broker.listing_credits_remaining ?? 0;
  const low = credits <= 1;

  if (broker.account_type === "agency") {
    return (
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-semibold">Agency plan</p>
          <p className="text-sm text-muted-foreground">
            Listings are drawn from your agency's shared monthly pool.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/pricing">View plans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`surface flex flex-wrap items-center justify-between gap-3 p-5 ${
        low ? "border-warm bg-warm/10" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 text-primary" />
        <div>
          <p className="font-semibold">
            {credits} listing credit{credits === 1 ? "" : "s"} left{" "}
            <Badge variant="secondary" className="ml-1 align-middle">
              never expires
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            {low
              ? "You're nearly out — top up to keep publishing."
              : "Each published listing uses one credit."}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant={low ? "default" : "outline"}>
        <Link to="/pricing">Buy listing credits</Link>
      </Button>
    </div>
  );
}
