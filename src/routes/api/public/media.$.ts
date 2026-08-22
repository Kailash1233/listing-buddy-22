import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const bucket = supabaseAdmin.storage.from("property-media");

        // `.og.jpg` asks for a 1200x630 social-preview crop of the original.
        if (path.endsWith(".og.jpg")) {
          const source = path.slice(0, -".og.jpg".length);
          const { data: signed } = await bucket.createSignedUrl(source, 60, {
            transform: { width: 1200, height: 630, resize: "cover", quality: 80 },
          });
          if (signed?.signedUrl) {
            const res = await fetch(signed.signedUrl);
            if (res.ok) {
              return new Response(await res.arrayBuffer(), {
                headers: {
                  "content-type": res.headers.get("content-type") || "image/jpeg",
                  "cache-control": "public, max-age=86400",
                },
              });
            }
          }
          const { data: original } = await bucket.download(source);
          if (!original) return new Response("Not found", { status: 404 });
          return new Response(await original.arrayBuffer(), {
            headers: {
              "content-type": original.type || "image/jpeg",
              "cache-control": "public, max-age=86400",
            },
          });
        }

        let { data } = await bucket.download(path);
        if (!data && path.endsWith(".thumb.jpg")) {
          // Older uploads have no generated thumbnail — serve the original.
          ({ data } = await bucket.download(path.slice(0, -".thumb.jpg".length)));
        }
        if (!data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },

    },
  },
});
