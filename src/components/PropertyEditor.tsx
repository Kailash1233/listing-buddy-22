import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { parseListing, regenerateCopy } from "@/lib/ai.functions";
import type { Broker, Property } from "@/hooks/useBroker";
import { AMENITY_OPTIONS, FACINGS, formatINR, photoPaths, slugify } from "@/lib/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "@/components/PhotoUploader";

const PUBLISH_ERRORS: Record<string, string> = {
  no_credits: "You're out of listing credits. Grab a pack to publish this listing.",
  pool_exhausted: "Your agency's monthly listing pool is used up.",
  no_active_subscription: "Your agency plan isn't active. Renew to publish listings.",
  not_found: "Listing not found.",
  unauthenticated: "Please sign in again.",
};

type Draft = {
  title: string;
  description: string;
  whatsapp_message: string;
  meta_description: string;
  property_type: "apartment" | "villa" | "plot" | "commercial";
  listing_type: "sale" | "rent";
  price: string;
  price_display: string;
  bhk: string;
  area_sqft: string;
  floor: string;
  facing: string;
  parking: string;
  locality: string;
  address_text: string;
  lat: string;
  lng: string;
  amenities: string[];
  rera_number: string;
  photos: string[];
  floor_plan: string[];
};

function emptyDraft(): Draft {
  return {
    title: "",
    description: "",
    whatsapp_message: "",
    meta_description: "",
    property_type: "apartment",
    listing_type: "sale",
    price: "",
    price_display: "",
    bhk: "",
    area_sqft: "",
    floor: "",
    facing: "",
    parking: "",
    locality: "",
    address_text: "",
    lat: "",
    lng: "",
    amenities: [],
    rera_number: "",
    photos: [],
    floor_plan: [],
  };
}

function fromProperty(p: Property): Draft {
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    whatsapp_message: p.whatsapp_message ?? "",
    meta_description: p.meta_description ?? "",
    property_type: p.property_type,
    listing_type: p.listing_type,
    price: p.price != null ? String(p.price) : "",
    price_display: p.price_display ?? "",
    bhk: p.bhk != null ? String(p.bhk) : "",
    area_sqft: p.area_sqft != null ? String(p.area_sqft) : "",
    floor: p.floor ?? "",
    facing: p.facing ?? "",
    parking: p.parking ?? "",
    locality: p.locality ?? "",
    address_text: p.address_text ?? "",
    lat: p.lat != null ? String(p.lat) : "",
    lng: p.lng != null ? String(p.lng) : "",
    amenities: p.amenities ?? [],
    rera_number: p.rera_number ?? "",
    photos: photoPaths(p.photos),
    floor_plan: p.floor_plan_url ? [p.floor_plan_url] : [],
  };
}

export function PropertyEditor({
  broker,
  property,
  onSaved,
}: {
  broker: Broker;
  property?: Property;
  onSaved: (p: Property, published: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(property ? fromProperty(property) : emptyDraft());
  const [raw, setRaw] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const qc = useQueryClient();
  const [reviewed, setReviewed] = useState(!!property);
  const navigate = useNavigate();
  const runParse = useServerFn(parseListing);
  const runCopy = useServerFn(regenerateCopy);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function runAI() {
    if (raw.trim().length < 10) {
      toast.error("Add a little more detail first.");
      return;
    }
    setAiBusy(true);
    try {
      const out = await runParse({ data: { raw } });
      setDraft((d) => ({
        ...d,
        title: out.title,
        description: out.description,
        whatsapp_message: out.whatsapp_message,
        meta_description: out.meta_description,
        property_type: out.property_type,
        listing_type: out.listing_type,
        price: out.price != null ? String(out.price) : d.price,
        price_display: out.price_display ?? d.price_display,
        bhk: out.bhk != null ? String(out.bhk) : d.bhk,
        area_sqft: out.area_sqft != null ? String(out.area_sqft) : d.area_sqft,
        floor: out.floor ?? d.floor,
        facing: out.facing ?? d.facing,
        parking: out.parking ?? d.parking,
        locality: out.locality ?? d.locality,
        amenities: out.amenities?.length ? out.amenities : d.amenities,
      }));
      setReviewed(true);
      toast.success("Listing drafted — review the details before publishing.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI failed");
    } finally {
      setAiBusy(false);
    }
  }

  async function regenerate() {
    setAiBusy(true);
    try {
      const summary = [
        draft.title,
        draft.property_type,
        draft.listing_type === "rent" ? "for rent" : "for sale",
        draft.bhk && `${draft.bhk} BHK`,
        draft.area_sqft && `${draft.area_sqft} sqft`,
        draft.price && `price ${draft.price}`,
        draft.locality,
        draft.facing && `${draft.facing} facing`,
        draft.floor && `floor ${draft.floor}`,
        draft.parking,
        draft.amenities.join(", "),
        draft.description,
      ]
        .filter(Boolean)
        .join(", ");
      const out = await runCopy({ data: { raw: summary } });
      setDraft((d) => ({
        ...d,
        description: out.description,
        whatsapp_message: out.whatsapp_message,
        meta_description: out.meta_description,
      }));
      toast.success("Fresh copy generated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI failed");
    } finally {
      setAiBusy(false);
    }
  }

  async function save(publish: boolean) {
    if (publish) {
      const missing: string[] = [];
      if (!draft.title.trim()) missing.push("title");
      if (!draft.price.trim()) missing.push("price");
      if (!draft.locality.trim()) missing.push("locality");
      if (draft.photos.length === 0) missing.push("at least 1 photo");
      if (missing.length) {
        toast.error(`To publish, add: ${missing.join(", ")}.`);
        return;
      }
    } else if (!draft.title.trim()) {
      toast.error("Give the listing a title first.");
      return;
    }

    setSaving(publish ? "publish" : "draft");
    try {
      const price = draft.price ? Number(draft.price) : null;
      const base = {
        broker_id: broker.id,
        title: draft.title.trim(),
        description: draft.description || null,
        whatsapp_message: draft.whatsapp_message || null,
        meta_description: draft.meta_description || null,
        property_type: draft.property_type,
        listing_type: draft.listing_type,
        price,
        price_display: draft.price_display || formatINR(price),
        bhk: draft.bhk ? Number(draft.bhk) : null,
        area_sqft: draft.area_sqft ? Number(draft.area_sqft) : null,
        floor: draft.floor || null,
        facing: draft.facing || null,
        parking: draft.parking || null,
        locality: draft.locality || null,
        address_text: draft.address_text || null,
        lat: draft.lat ? Number(draft.lat) : null,
        lng: draft.lng ? Number(draft.lng) : null,
        amenities: draft.amenities,
        rera_number: draft.rera_number || null,
        rera_status: draft.rera_number
          ? ("provided_unverified" as const)
          : ("not_provided" as const),
        photos: draft.photos,
        floor_plan_url: draft.floor_plan[0] ?? null,
        status: property?.status ?? ("draft" as const),
      };

      let saved: Property;
      if (property) {
        const { data, error } = await supabase
          .from("properties")
          .update(base)
          .eq("id", property.id)
          .select()
          .single();
        if (error) throw error;
        saved = data as Property;
      } else {
        let slug = slugify(
          [draft.bhk && `${draft.bhk}bhk`, draft.property_type, draft.locality]
            .filter(Boolean)
            .join(" ") || draft.title,
        );
        const { count } = await supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("broker_id", broker.id)
          .like("slug", `${slug}%`);
        if (count && count > 0) slug = `${slug}-${count + 1}`;

        const { data, error } = await supabase
          .from("properties")
          .insert({ ...base, slug })
          .select()
          .single();
        if (error) throw error;
        saved = data as Property;
      }

      if (publish && saved.status !== "active") {
        // Credits/pool are enforced server-side; the client never grants publish rights.
        const { data: result, error: rpcError } = await supabase.rpc("publish_property", {
          _property_id: saved.id,
        });
        if (rpcError) throw rpcError;
        const outcome = (result ?? {}) as { ok?: boolean; reason?: string };
        if (!outcome.ok) {
          await qc.invalidateQueries({ queryKey: ["broker"] });
          toast.error(PUBLISH_ERRORS[outcome.reason ?? ""] ?? "Could not publish this listing.");
          if (outcome.reason === "no_credits" || outcome.reason === "pool_exhausted") {
            navigate({ to: "/pricing" });
          }
          onSaved(saved, false);
          return;
        }
        saved = { ...saved, status: "active" };
        await qc.invalidateQueries({ queryKey: ["broker"] });
      }

      onSaved(saved, publish && saved.status === "active");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(null);
    }
  }

  const fields = (
    <div className="space-y-6">
      <div className="surface space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Listing title</Label>
          <Input
            id="title"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Bright 2BHK in Anna Nagar — 1200 sqft"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Property type</Label>
            <Select
              value={draft.property_type}
              onValueChange={(v) => set("property_type", v as Draft["property_type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Listing for</Label>
            <Select
              value={draft.listing_type}
              onValueChange={(v) => set("listing_type", v as Draft["listing_type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              inputMode="numeric"
              value={draft.price}
              onChange={(e) => {
                set("price", e.target.value);
                set("price_display", formatINR(Number(e.target.value) || null));
              }}
              placeholder="8500000"
            />
            <p className="text-xs text-muted-foreground">
              Shown as {draft.price_display || formatINR(Number(draft.price) || null)}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_display">Price label (optional)</Label>
            <Input
              id="price_display"
              value={draft.price_display}
              onChange={(e) => set("price_display", e.target.value)}
              placeholder="₹85 Lakhs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bhk">BHK</Label>
            <Input
              id="bhk"
              inputMode="numeric"
              value={draft.bhk}
              onChange={(e) => set("bhk", e.target.value)}
              placeholder="2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area">Area (sqft)</Label>
            <Input
              id="area"
              inputMode="numeric"
              value={draft.area_sqft}
              onChange={(e) => set("area_sqft", e.target.value)}
              placeholder="1200"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              value={draft.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder="4th of 6"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Facing</Label>
            <Select
              value={draft.facing || "none"}
              onValueChange={(v) => set("facing", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {FACINGS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parking">Parking</Label>
            <Input
              id="parking"
              value={draft.parking}
              onChange={(e) => set("parking", e.target.value)}
              placeholder="1 covered car park"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locality">Locality</Label>
            <Input
              id="locality"
              value={draft.locality}
              onChange={(e) => set("locality", e.target.value)}
              placeholder="Anna Nagar"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address (optional)</Label>
          <Input
            id="address"
            value={draft.address_text}
            onChange={(e) => set("address_text", e.target.value)}
            placeholder="Near Blue Star signal, 2nd Avenue"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lat">Latitude (optional)</Label>
            <Input
              id="lat"
              value={draft.lat}
              onChange={(e) => set("lat", e.target.value)}
              placeholder="13.0878"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lng">Longitude (optional)</Label>
            <Input
              id="lng"
              value={draft.lng}
              onChange={(e) => set("lng", e.target.value)}
              placeholder="80.2101"
            />
          </div>
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="description">Description</Label>
          <Button type="button" size="sm" variant="outline" onClick={regenerate} disabled={aiBusy}>
            {aiBusy ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            Regenerate
          </Button>
        </div>
        <Textarea
          id="description"
          rows={7}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the property for buyers…"
        />
        <div className="space-y-1.5">
          <Label htmlFor="wa">WhatsApp share message</Label>
          <Textarea
            id="wa"
            rows={5}
            value={draft.whatsapp_message}
            onChange={(e) => set("whatsapp_message", e.target.value)}
            placeholder="Message buyers receive when you share this listing"
          />
        </div>
      </div>

      <div className="surface space-y-3 p-5">
        <Label>Amenities</Label>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.amenities.includes(a)}
                onCheckedChange={(c) =>
                  set(
                    "amenities",
                    c ? [...draft.amenities, a] : draft.amenities.filter((x) => x !== a),
                  )
                }
              />
              {a}
            </label>
          ))}
        </div>
        {draft.amenities.filter((a) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
          <p className="text-xs text-muted-foreground">
            Also listed: {draft.amenities.filter((a) => !AMENITY_OPTIONS.includes(a)).join(", ")}
          </p>
        )}
      </div>

      <div className="surface space-y-5 p-5">
        <PhotoUploader userId={broker.id} paths={draft.photos} onChange={(p) => set("photos", p)} />
        <PhotoUploader
          userId={broker.id}
          paths={draft.floor_plan}
          onChange={(p) => set("floor_plan", p)}
          single
          label="Floor plan (optional)"
        />
      </div>

      <div className="surface space-y-2 p-5">
        <Label htmlFor="rera">RERA number (optional)</Label>
        <Input
          id="rera"
          value={draft.rera_number}
          onChange={(e) => set("rera_number", e.target.value)}
          placeholder="TN/29/Building/0123/2023"
        />
        <p className="text-xs text-muted-foreground">
          Shown to buyers as broker-provided. Plotly does not verify RERA numbers.
        </p>
      </div>

      <div className="sticky bottom-16 z-20 flex gap-3 rounded-xl border border-border bg-card/95 p-3 backdrop-blur md:bottom-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => save(false)}
          disabled={saving !== null}
        >
          {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : null} Save as draft
        </Button>
        <Button className="flex-1" onClick={() => save(true)} disabled={saving !== null}>
          {saving === "publish" ? <Loader2 className="size-4 animate-spin" /> : null} Publish
        </Button>
      </div>
      <button type="button" className="hidden" onClick={() => navigate({ to: "/dashboard" })} />
    </div>
  );

  if (property) return fields;

  return (
    <Tabs defaultValue="ai">
      <TabsList className="mb-5 grid w-full grid-cols-2">
        <TabsTrigger value="ai">
          <Sparkles className="size-4" /> AI quick add
        </TabsTrigger>
        <TabsTrigger value="manual">Manual form</TabsTrigger>
      </TabsList>

      <TabsContent value="ai" className="space-y-6">
        <div className="surface space-y-3 p-5">
          <Label htmlFor="raw">
            Paste your property details — even a rough WhatsApp message works
          </Label>
          <Textarea
            id="raw"
            rows={5}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Anna Nagar 2bhk 1200 sqft 85 lakhs east facing 4th floor covered car parking good location"
          />
          <Button onClick={runAI} disabled={aiBusy}>
            {aiBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Build my listing
          </Button>
          {reviewed && (
            <p className="text-sm text-muted-foreground">
              Review and correct everything below — nothing is published until you hit Publish.
            </p>
          )}
        </div>
        {fields}
      </TabsContent>

      <TabsContent value="manual">{fields}</TabsContent>
    </Tabs>
  );
}
