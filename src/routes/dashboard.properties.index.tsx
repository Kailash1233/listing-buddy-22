import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBroker, type Property } from "@/hooks/useBroker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/PropertyCard";

export const Route = createFileRoute("/dashboard/properties/")({
  head: () => ({
    meta: [
      { title: "Your properties — PropertyGenie" },
      { name: "description", content: "Every listing you've created, with its own shareable page and brochure." },
      { property: "og:title", content: "Your properties — PropertyGenie" },
      { property: "og:description", content: "Every listing you've created, with its own shareable page and brochure." },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const { data: broker } = useBroker();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
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

  const list = (data ?? [])
    .filter((p) => (tab === "all" ? true : tab === "live" ? p.status === "active" : p.status === tab))
    .filter((p) =>
      q.trim()
        ? `${p.title} ${p.locality ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())
        : true,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Properties</h1>
        <Button asChild>
          <Link to="/dashboard/properties/new">
            <Plus className="size-4" /> Add property
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or locality"
          className="sm:max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="surface p-10 text-center text-muted-foreground">No properties here yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} subdomain={broker!.subdomain_slug} />
          ))}
        </div>
      )}
    </div>
  );
}
