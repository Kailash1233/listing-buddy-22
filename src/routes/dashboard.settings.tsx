import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBroker } from "@/hooks/useBroker";
import { slugify } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Plotly" },
      { name: "description", content: "Update your broker profile, WhatsApp number and public profile link." },
      { property: "og:title", content: "Settings — Plotly" },
      { property: "og:description", content: "Update your broker profile, WhatsApp number and public profile link." },
    ],
  }),
  component: SettingsPage,
});

const PLANS = [
  { id: "free", name: "Free", price: "₹0", limit: "3 listings", perks: ["Property pages", "WhatsApp share", "Lead inbox"] },
  { id: "starter", name: "Starter", price: "₹499/mo", limit: "25 listings", perks: ["Everything in Free", "PDF brochures", "Listing analytics"] },
  { id: "pro", name: "Pro", price: "₹999/mo", limit: "Unlimited listings", perks: ["Everything in Starter", "Priority AI copy", "Custom branding"] },
];

function SettingsPage() {
  const { data: broker } = useBroker();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [sub, setSub] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!broker) return;
    setName(broker.name ?? "");
    setAgency(broker.agency_name ?? "");
    setWhatsapp(broker.whatsapp_number ?? "");
    setPhone(broker.phone ?? "");
    setSub(broker.subdomain_slug ?? "");
  }, [broker]);

  if (!broker) return null;

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("brokers")
      .update({
        name: name.trim(),
        agency_name: agency.trim() || null,
        whatsapp_number: whatsapp.replace(/\D/g, ""),
        phone: phone.replace(/\D/g, ""),
        subdomain_slug: slugify(sub),
      })
      .eq("id", broker!.id);
    setSaving(false);
    if (error) {
      toast.error(/duplicate|unique/i.test(error.message) ? "That profile link is taken." : error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["broker", broker!.id] });
    toast.success("Profile updated");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Your details appear on every property page.</p>
      </div>

      <div className="surface space-y-5 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agency">Agency</Label>
          <Input id="agency" value={agency} onChange={(e) => setAgency(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="wa">WhatsApp number</Label>
            <Input id="wa" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Call number</Label>
            <Input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub">Profile link</Label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">/b/</span>
            <Input id="sub" value={sub} onChange={(e) => setSub(e.target.value)} onBlur={() => setSub(slugify(sub))} />
          </div>
          <p className="text-xs text-muted-foreground">
            Changing this breaks links you've already shared.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Save changes
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Your plan</h2>
          <Badge variant="secondary" className="uppercase">{broker.plan}</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`surface space-y-3 p-4 ${p.id === broker.plan ? "border-primary" : ""}`}
            >
              <p className="font-semibold">{p.name}</p>
              <p className="text-xl font-bold text-primary">{p.price}</p>
              <p className="text-xs text-muted-foreground">{p.limit}</p>
              <ul className="space-y-1 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {perk}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.id === broker.plan ? "secondary" : "outline"}
                size="sm"
                className="w-full"
                disabled={p.id === broker.plan}
                onClick={() => toast("Upgrades are coming soon — you'll be able to pay in-app.")}
              >
                {p.id === broker.plan ? "Current plan" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          You're using {broker.property_limit === 999 ? "unlimited" : broker.property_limit} listing slots on this plan.
        </p>
      </section>
    </div>
  );
}
