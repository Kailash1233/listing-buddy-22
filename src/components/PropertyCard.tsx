import { Link } from "@tanstack/react-router";
import { Eye, MessageCircle, Pencil, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Property } from "@/hooks/useBroker";
import { formatINR, thumbUrl, photoPaths, propertyPath } from "@/lib/property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  active: "Live",
  sold: "Sold",
  rented: "Rented",
  inactive: "Paused",
};

export function PropertyCard({ property, subdomain }: { property: Property; subdomain: string }) {
  const cover = photoPaths(property.photos)[0];
  const url = propertyPath(subdomain, property.slug);

  return (
    <article className="surface overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {cover ? (
          <img src={thumbUrl(cover)} alt={property.title} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">No photo</div>
        )}
        <Badge
          variant={property.status === "active" ? "default" : "secondary"}
          className="absolute left-3 top-3"
        >
          {STATUS_LABEL[property.status] ?? property.status}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="font-semibold leading-snug line-clamp-2">{property.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {[property.locality, property.bhk && `${property.bhk} BHK`, property.area_sqft && `${property.area_sqft} sqft`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <p className="text-lg font-bold text-primary">
          {property.price_display || formatINR(property.price)}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" /> {property.view_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" /> {property.whatsapp_click_count}
          </span>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/dashboard/properties/$id" params={{ id: property.id }}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              void navigator.clipboard.writeText(`${window.location.origin}${url}`);
              toast.success("Link copied");
            }}
          >
            <Share2 className="size-4" /> Copy link
          </Button>
        </div>
      </div>
    </article>
  );
}
