import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { thumbUrl } from "@/lib/property";
import { encodeBlurhash } from "@/lib/blurhash";
import { BlurImage } from "@/components/BlurImage";
import { Button } from "@/components/ui/button";

async function makeThumb(file: File, width = 400): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, width / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8));
}

export function PhotoUploader({
  userId,
  paths,
  onChange,
  hashes = {},
  onHashes,
  max = 15,
  label = "Photos",
  single = false,
}: {
  userId: string;
  paths: string[];
  onChange: (paths: string[]) => void;
  hashes?: Record<string, string>;
  onHashes?: (hashes: Record<string, string>) => void;
  max?: number;
  label?: string;
  single?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const room = single ? 1 : max - paths.length;
    if (room <= 0) {
      toast.error(`You can upload up to ${max} photos.`);
      return;
    }
    setBusy(true);
    const next: string[] = [];
    const nextHashes: Record<string, string> = {};
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("property-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }
      next.push(path);

      // BlurHash is computed once, here, from the local File — never on render.
      const hash = await encodeBlurhash(file);
      if (hash) nextHashes[path] = hash;

      // Write a 400px thumbnail next to the original so grids never load full-res photos.
      const thumb = await makeThumb(file).catch(() => null);
      if (thumb) {
        await supabase.storage
          .from("property-media")
          .upload(`${path}.thumb.jpg`, thumb, { contentType: "image/jpeg", upsert: true });
      }
    }
    setBusy(false);
    const finalPaths = single ? next.slice(0, 1) : [...paths, ...next];
    onChange(finalPaths);
    onHashes?.(
      Object.fromEntries(
        Object.entries({ ...hashes, ...nextHashes }).filter(([p]) => finalPaths.includes(p)),
      ),
    );
  }


  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {paths.map((p) => (
          <div key={p} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
            <BlurImage src={thumbUrl(p)} hash={hashes[p]} alt="Property" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(paths.filter((x) => x !== p))}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-background/90 text-foreground shadow"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        {(single ? paths.length === 0 : paths.length < max) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            <span className="text-xs">{busy ? "Uploading" : "Add"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = "";
        }}
      />
      {!single && (
        <p className="mt-2 text-xs text-muted-foreground">
          Up to {max} photos. The first photo is the cover.{" "}
          {paths.length > 1 && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onChange([paths[paths.length - 1]!, ...paths.slice(0, -1)])}
            >
              Make last photo the cover
            </Button>
          )}
        </p>
      )}
    </div>
  );
}
