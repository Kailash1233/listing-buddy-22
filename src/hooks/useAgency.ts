import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBroker, type Broker, type Property } from "@/hooks/useBroker";

export type AgencyMember = {
  id: string;
  invited_email: string;
  role: "owner" | "member";
  status: "invited" | "active" | "removed";
  member_broker_id: string | null;
  created_at: string;
};

export type AgencySubscription = {
  id: string;
  plan: "starter_agency" | "growth_agency";
  status: "active" | "past_due" | "cancelled";
  monthly_listing_pool: number;
  listings_used_this_cycle: number;
  seat_limit: number;
  current_period_end: string | null;
};

/** The agency this broker belongs to (as owner or member), or null for solo brokers. */
export function agencyOwnerId(broker: Broker | null | undefined): string | null {
  if (!broker) return null;
  return broker.agency_id ?? (broker.account_type === "agency" ? broker.id : null);
}

export function useAgency() {
  const { data: broker } = useBroker();
  const ownerId = agencyOwnerId(broker);
  const isOwner = !!broker && broker.account_type === "agency" && !broker.agency_id;

  const subscription = useQuery({
    queryKey: ["agency-subscription", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_subscriptions")
        .select("id, plan, status, monthly_listing_pool, listings_used_this_cycle, seat_limit, current_period_end")
        .eq("agency_owner_id", ownerId!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return (data as AgencySubscription | null) ?? null;
    },
  });

  const members = useQuery({
    queryKey: ["agency-members", ownerId],
    enabled: !!ownerId && isOwner,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_members")
        .select("id, invited_email, role, status, member_broker_id, created_at")
        .eq("agency_owner_id", ownerId!)
        .neq("status", "removed")
        .order("created_at");
      if (error) throw error;
      return data as AgencyMember[];
    },
  });

  const teammates = useQuery({
    queryKey: ["agency-teammates", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brokers")
        .select("id, name, agency_name, subdomain_slug, account_type, agency_id")
        .or(`id.eq.${ownerId},agency_id.eq.${ownerId}`);
      if (error) throw error;
      return data as Array<Pick<Broker, "id" | "name" | "agency_name" | "subdomain_slug" | "account_type" | "agency_id">>;
    },
  });

  const pool = useQuery({
    queryKey: ["agency-listings", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const ids = (teammates.data ?? []).map((t) => t.id);
      if (ids.length === 0) return [] as Property[];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("broker_id", ids)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Property[];
    },
  });

  const invite = useQuery({
    queryKey: ["agency-pending-invite", broker?.id],
    enabled: !!broker && !ownerId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("pending_agency_invite");
      if (error) throw error;
      return data as { invite: boolean; agency_name?: string };
    },
  });

  return { broker, ownerId, isOwner, subscription, members, teammates, pool, invite };
}
