import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBroker, type Property } from "@/hooks/useBroker";
import { propertyPath, waLink } from "@/lib/property";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PropertyEditor } from "@/components/PropertyEditor";
import { StoryImageButton } from "@/components/StoryImage";
import { BrochureButton } from "@/components/BrochureButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/dashboard/properties/$id")({
  head: () => ({
    meta: [
      { title: "Edit property — Plotly" },
      { name: "description", content: "Update listing details, photos, price and sharing copy." },
      { property: "og:title", content: "Edit property — Plotly" },
      { property: "og:description", content: "Update listing details, photos, price and sharing copy." },
    ],
  }),
  component: EditProperty,
});

function EditProperty() {
  const { id } = Route.useParams();
  const { data: broker } = useBroker();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Property | null;
    },
  });

  if (isLoading || !broker) {
    return (
      <div className="grid min-h-60 place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-semibold">Property not found</p>
        <Button asChild variant="link">
          <Link to="/dashboard/properties">Back to properties</Link>
        </Button>
      </div>
    );
  }

  const url = propertyPath(broker.subdomain_slug, property.slug);
  const shareText = `${property.whatsapp_message || property.title}\n\n${
    typeof window !== "undefined" ? window.location.origin : ""
  }${url}`;

  async function setStatus(status: Property["status"]) {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["property", id] });
    void qc.invalidateQueries({ queryKey: ["properties", broker!.id] });
    toast.success("Status updated");
  }

  async function remove() {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["properties", broker!.id] });
    toast.success("Property deleted");
    navigate({ to: "/dashboard/properties" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{property.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {property.view_count} views · {property.whatsapp_click_count} WhatsApp clicks
          </p>
        </div>
        <Select value={property.status} onValueChange={(v) => setStatus(v as Property["status"])}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Live</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="inactive">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="surface flex flex-wrap gap-2 p-4">
        <Button asChild variant="outline" size="sm">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" /> View page
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={waLink("", shareText).replace("https://wa.me/?", "https://wa.me/?")} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" /> Share on WhatsApp
          </a>
        </Button>
        <BrochureButton propertyId={property.id} slug={property.slug} />
        <StoryImageButton
          property={property}
          brokerName={broker.agency_name || broker.name}
          contact={broker.whatsapp_number}
          siteUrl={`${typeof window !== "undefined" ? window.location.origin : ""}${url}`}
          className="h-8 gap-1.5 px-3 text-sm"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="size-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this property?</AlertDialogTitle>
              <AlertDialogDescription>
                The public page and its brochure will stop working. Leads already received stay in your inbox.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <PropertyEditor
        broker={broker}
        property={property}
        onSaved={() => {
          void qc.invalidateQueries({ queryKey: ["property", id] });
          void qc.invalidateQueries({ queryKey: ["properties", broker.id] });
          toast.success("Changes saved");
        }}
      />
    </div>
  );
}
