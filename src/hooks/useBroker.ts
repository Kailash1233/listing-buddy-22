import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export type Broker = Database["public"]["Tables"]["brokers"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export function useBroker() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["broker", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brokers")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Broker | null;
    },
  });
  return { ...query, authLoading: loading, user };
}
