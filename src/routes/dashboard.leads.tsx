import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Inbox, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBroker, type Lead, type Property } from "@/hooks/useBroker";
import { LEAD_STATUS_LABEL, formatINR, waLink } from "@/lib/property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/leads")({
  head: () => ({
    meta: [
      { title: "Enquiries — Plotly" },
      { name: "description", content: "Every buyer enquiry from your property pages, with one-tap WhatsApp reply." },
      { property: "og:title", content: "Enquiries — Plotly" },
      { property: "og:description", content: "Every buyer enquiry from your property pages, with one-tap WhatsApp reply." },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { data: broker } = useBroker();
  const qc = useQueryClient();
  const [tab, setTab] = useState("all");

  const { data, isLoading } = useQuery({
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

  const { data: properties } = useQuery({
    queryKey: ["properties", broker?.id],
    enabled: !!broker,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("broker_id", broker!.id);
      if (error) throw error;
      return data as Property[];
    },
  });

  const titleOf = (pid: string) => properties?.find((p) => p.id === pid)?.title ?? "Property";

  async function update(lead: Lead, patch: Partial<Lead>) {
    const { error } = await supabase.from("leads").update(patch).eq("id", lead.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["leads", broker!.id] });
  }

  const list = (data ?? []).filter((l) =>
    tab === "all" ? true : tab === "unread" ? !l.is_read : l.status === tab,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Enquiries</h1>
        <p className="mt-1 text-muted-foreground">Buyers who reached out through your property pages.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="site_visit">Site visit</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="surface flex flex-col items-center gap-2 p-10 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="font-semibold">No enquiries yet</p>
          <p className="text-sm text-muted-foreground">Share your property pages to start receiving leads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((lead) => (
            <article
              key={lead.id}
              className={`surface space-y-3 p-4 ${lead.is_read ? "" : "border-primary/40"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{lead.name}</p>
                    {!lead.is_read && <Badge>New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {titleOf(lead.property_id)} · {new Date(lead.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <Select value={lead.status} onValueChange={(v) => update(lead, { status: v as Lead["status"] })}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lead.message && <p className="text-sm">{lead.message}</p>}
              {(lead.budget_min || lead.budget_max) && (
                <p className="text-sm text-muted-foreground">
                  Budget: {formatINR(lead.budget_min)} – {formatINR(lead.budget_max)}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a
                    href={waLink(lead.whatsapp_number || lead.phone, `Hi ${lead.name}, thanks for your enquiry about ${titleOf(lead.property_id)}.`)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => !lead.is_read && update(lead, { is_read: true })}
                  >
                    <WhatsAppIcon className="size-4" /> WhatsApp
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="size-4" /> {lead.phone}
                  </a>
                </Button>
                {!lead.is_read && (
                  <Button size="sm" variant="ghost" onClick={() => update(lead, { is_read: true })}>
                    Mark read
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
