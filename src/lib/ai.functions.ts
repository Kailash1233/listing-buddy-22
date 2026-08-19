import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runListingAI } from "./ai.server";

export const parseListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ raw: z.string().min(5).max(4000) }).parse(data))
  .handler(async ({ data }) => runListingAI({ mode: "parse", raw: data.raw }));

export const regenerateCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ raw: z.string().min(5).max(4000), tone: z.string().optional() }).parse(data),
  )
  .handler(async ({ data }) => runListingAI({ mode: "copy", raw: data.raw, tone: data.tone }));
