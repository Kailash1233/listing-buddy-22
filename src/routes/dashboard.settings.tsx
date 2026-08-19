import { createFileRoute, Link } from "@tanstack/react-router";
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
          <h2 className="text-lg font-bold">Listings & billing</h2>
          <Badge variant="secondary" className="uppercase">
            {broker.account_type === "agency" ? "Agency" : "Solo"}
          </Badge>
        </div>
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-semibold">
              {broker.account_type === "agency"
                ? "Listings come from your agency's shared monthly pool"
                : `${broker.listing_credits_remaining ?? 0} listing credit${
                    (broker.listing_credits_remaining ?? 0) === 1 ? "" : "s"
                  } remaining`}
            </p>
            <p className="text-sm text-muted-foreground">
              {broker.account_type === "agency"
                ? "The pool resets at the start of each billing cycle."
                : "One-time packs, credits never expire."}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/pricing">
              {broker.account_type === "agency" ? "View agency plans" : "Buy listing credits"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

