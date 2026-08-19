import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBroker } from "@/hooks/useBroker";
import { slugify } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your broker profile — Plotly" },
      {
        name: "description",
        content: "Add your name, WhatsApp number and profile link to start publishing property pages.",
      },
      { property: "og:title", content: "Set up your broker profile — Plotly" },
      {
        property: "og:description",
        content: "Add your name, WhatsApp number and profile link to start publishing property pages.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { session, loading, user } = useAuth();
  const { data: broker, isLoading, refetch } = useBroker();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (broker) navigate({ to: "/dashboard" });
  }, [broker, navigate]);

  async function submit() {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Add your name.");
      return;
    }
    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 10) {
      toast.error("Add a valid WhatsApp number.");
      return;
    }
    const sub = slugify(subdomain || name);
    if (sub.length < 3) {
      toast.error("Choose a longer profile link.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("brokers").insert({
      id: user.id,
      name: name.trim(),
      agency_name: agency.trim() || null,
      whatsapp_number: waDigits,
      phone: phone.replace(/\D/g, "") || waDigits,
      subdomain_slug: sub,
    });
    setSaving(false);

    if (error) {
      toast.error(
        /duplicate|unique/i.test(error.message)
          ? "That profile link is already taken — try another."
          : error.message,
      );
      return;
    }
    await refetch();
    toast.success("You're all set!");
    navigate({ to: "/dashboard" });
  }

  if (loading || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Set up your profile</h1>
      <p className="mt-2 text-muted-foreground">
        This appears on every property page you publish. Takes a minute.
      </p>

      <div className="surface mt-6 space-y-5 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ravi Kumar" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agency">Agency name (optional)</Label>
          <Input
            id="agency"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            placeholder="Kumar Realty"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wa">WhatsApp number</Label>
          <Input
            id="wa"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="98765 43210"
          />
          <p className="text-xs text-muted-foreground">Buyer enquiries are sent here.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Call number (optional)</Label>
          <Input
            id="phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Same as WhatsApp if left blank"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub">Your profile link</Label>
          <div className="flex items-center gap-1 text-sm">
            <span className="whitespace-nowrap text-muted-foreground">/b/</span>
            <Input
              id="sub"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              onBlur={() => setSubdomain((s) => slugify(s || name))}
              placeholder="ravi-kumar"
            />
          </div>
        </div>
        <Button className="w-full" onClick={submit} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Finish setup
        </Button>
      </div>
    </div>
  );
}
