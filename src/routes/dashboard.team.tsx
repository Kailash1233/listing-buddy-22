import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Crown, Loader2, Mail, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAgency } from "@/hooks/useAgency";
import { useBroker } from "@/hooks/useBroker";
import { AGENCY_PLANS } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PropertyCard } from "@/components/PropertyCard";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({
    meta: [
      { title: "Your team — Plotly" },
      {
        name: "description",
        content: "Invite sub-agents, manage seats and track your agency's shared listing pool.",
      },
      { property: "og:title", content: "Your team — Plotly" },
      {
        property: "og:description",
        content: "Invite sub-agents, manage seats and track your agency's shared listing pool.",
      },
    ],
  }),
  component: TeamPage,
});

const INVITE_ERRORS: Record<string, string> = {
  not_agency: "Switch your account to agency mode first.",
  no_active_subscription: "You need an active agency plan before adding seats.",
  seats_full: "All seats on your plan are used. Upgrade to add more.",
  already_invited: "That email is already invited.",
  invalid_email: "Enter a valid email address.",
  unauthenticated: "Please sign in again.",
};

function TeamPage() {
  const { data: broker } = useBroker();
  const { ownerId, isOwner, subscription, members, teammates, pool, invite } = useAgency();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  if (!broker) return null;

  async function switchToAgency() {
    setBusy(true);
    const { error } = await supabase
      .from("brokers")
      .update({ account_type: "agency", agency_seat_role: "owner" })
      .eq("id", broker!.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    void qc.invalidateQueries({ queryKey: ["broker", broker!.id] });
    toast.success("Agency mode enabled. Pick a plan to unlock seats.");
  }

  async function acceptInvite() {
    setBusy(true);
    const { data, error } = await supabase.rpc("accept_agency_invite");
    setBusy(false);
    const res = data as { ok: boolean; reason?: string } | null;
    if (error || !res?.ok) {
      toast.error(INVITE_ERRORS[res?.reason ?? ""] ?? "Could not accept the invite.");
      return;
    }
    void qc.invalidateQueries();
    toast.success("You've joined the agency.");
  }

  async function sendInvite() {
    setBusy(true);
    const { data, error } = await supabase.rpc("invite_agency_member", { _email: email });
    setBusy(false);
    const res = data as { ok: boolean; reason?: string } | null;
    if (error || !res?.ok) {
      toast.error(INVITE_ERRORS[res?.reason ?? ""] ?? "Could not send the invite.");
      return;
    }
    setEmail("");
    void qc.invalidateQueries({ queryKey: ["agency-members", ownerId] });
    toast.success("Seat invited. They join by signing up with that email.");
  }

  async function removeMember(id: string) {
    const { data, error } = await supabase.rpc("remove_agency_member", { _member_id: id });
    const res = data as { ok: boolean } | null;
    if (error || !res?.ok) { toast.error("Could not remove that teammate."); return; }
    void qc.invalidateQueries({ queryKey: ["agency-members", ownerId] });
    void qc.invalidateQueries({ queryKey: ["agency-teammates", ownerId] });
    toast.success("Teammate removed.");
  }

  // Solo broker: offer agency mode or accept a pending invite.
  if (!ownerId) {
    const pending = invite.data?.invite;
    return (
      <div className="space-y-6">
        <Header />
        {pending ? (
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold">{invite.data?.agency_name} invited you to their team</p>
              <p className="text-sm text-muted-foreground">
                Join to publish from their shared monthly listing pool.
              </p>
            </div>
            <Button onClick={acceptInvite} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Accept invite
            </Button>
          </div>
        ) : null}

        <div className="surface space-y-4 p-6">
          <Users className="size-6 text-primary" />
          <div>
            <p className="font-semibold">You're on a solo account</p>
            <p className="text-sm text-muted-foreground">
              Agency mode gives your team a shared monthly listing pool, sub-agent seats and one team
              dashboard.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["starter_agency", "growth_agency"] as const).map((id) => {
              const plan = AGENCY_PLANS[id];
              return (
                <div key={id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.monthlyListingPool} listings/mo · {plan.seats} sub-agents
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={switchToAgency} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Enable agency mode
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">See agency pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sub = subscription.data;
  const used = sub?.listings_used_this_cycle ?? 0;
  const poolSize = sub?.monthly_listing_pool ?? 0;
  const seatsUsed = (members.data ?? []).length;
  const seatLimit = sub?.seat_limit ?? 0;
  const listings = pool.data ?? [];
  const nameOf = (id: string) =>
    teammates.data?.find((t) => t.id === id)?.name ?? "Teammate";

  return (
    <div className="space-y-8">
      <Header />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface space-y-3 p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Shared listing pool</p>
            <Badge variant="secondary">{sub ? AGENCY_PLANS[sub.plan].name : "No active plan"}</Badge>
          </div>
          <Progress value={poolSize ? Math.min(100, (used / poolSize) * 100) : 0} />
          <p className="text-sm text-muted-foreground">
            {used} of {poolSize} listings used this cycle
            {sub?.current_period_end
              ? ` · resets ${new Date(sub.current_period_end).toLocaleDateString("en-IN")}`
              : ""}
          </p>
          {!sub ? (
            <Button asChild size="sm">
              <Link to="/pricing">Activate an agency plan</Link>
            </Button>
          ) : null}
        </div>

        <div className="surface space-y-3 p-5">
          <p className="font-semibold">Seats</p>
          <Progress value={seatLimit ? Math.min(100, (seatsUsed / seatLimit) * 100) : 0} />
          <p className="text-sm text-muted-foreground">
            {seatsUsed} of {seatLimit} sub-agent seats used
          </p>
        </div>
      </div>

      {isOwner ? (
        <section className="surface space-y-4 p-5">
          <div>
            <h2 className="text-lg font-bold">Sub-agents</h2>
            <p className="text-sm text-muted-foreground">
              Invite by email. They sign up with that email and join automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@agency.com"
              />
            </div>
            <Button onClick={sendInvite} disabled={busy || !email.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Invite
            </Button>
          </div>

          <ul className="divide-y divide-border">
            <li className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Crown className="size-4 text-primary" />
                <span className="text-sm font-medium">{broker.name} (you)</span>
              </div>
              <Badge variant="secondary">Owner</Badge>
            </li>
            {(members.data ?? []).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {m.member_broker_id ? nameOf(m.member_broker_id) : m.invited_email}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.invited_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === "active" ? "default" : "secondary"}>
                    {m.status === "active" ? "Active" : "Invited"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove teammate"
                    onClick={() => removeMember(m.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
            {(members.data ?? []).length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">No sub-agents yet.</li>
            ) : null}
          </ul>
        </section>
      ) : (
        <div className="surface p-5">
          <p className="font-semibold">You're a sub-agent on this team</p>
          <p className="text-sm text-muted-foreground">
            Your listings publish from the shared pool. Only the agency owner can manage seats.
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Team listings</h2>
        {listings.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 p-10 text-center">
            <Building2 className="size-8 text-muted-foreground" />
            <p className="font-semibold">No team listings yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((p) => (
              <div key={p.id} className="space-y-1">
                <PropertyCard
                  property={p}
                  subdomain={
                    teammates.data?.find((t) => t.id === p.broker_id)?.subdomain_slug ??
                    broker.subdomain_slug
                  }
                />
                <p className="px-1 text-xs text-muted-foreground">by {nameOf(p.broker_id)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Team</h1>
      <p className="mt-1 text-muted-foreground">
        Sub-agent seats and your agency's shared listing pool.
      </p>
    </div>
  );
}
