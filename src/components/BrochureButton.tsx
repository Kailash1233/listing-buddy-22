import { useState } from "react";
import { AlertTriangle, Download, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Downloads the server-generated (and server-cached) PDF brochure.
 * Fetches as a blob so mobile Safari/Chrome save the file instead of
 * silently opening a blank tab, and surfaces a real retry on failure.
 */
export function BrochureButton({
  propertyId,
  slug,
  className,
  variant = "outline",
  size = "sm",
}: {
  propertyId: string;
  slug?: string | null;
  className?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function download() {
    setState("loading");
    try {
      const res = await fetch(`/api/public/brochure/${propertyId}?dl=1`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug || "property"}.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (state === "error") {
    return (
      <div className={className}>
        <p className="mb-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5" /> Brochure couldn&apos;t be generated.
        </p>
        <Button variant={variant} size={size} onClick={download}>
          <RotateCw className="size-4" /> Retry download
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={download}
      disabled={state === "loading"}
    >
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {state === "loading" ? "Preparing PDF" : "Download brochure"}
    </Button>
  );
}
