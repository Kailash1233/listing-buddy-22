import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/brochure/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const download = new URL(request.url).searchParams.has("dl");
        const { buildBrochure } = await import("@/lib/brochure.server");
        try {
          const pdf = await buildBrochure(params.id);
          if (!pdf) return new Response("Not found", { status: 404 });
          return new Response(pdf.bytes as BodyInit, {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `${download ? "attachment" : "inline"}; filename="${pdf.filename}"`,
              "cache-control": "public, max-age=300",
            },
          });
        } catch (err) {
          console.error("brochure error", err);
          return new Response("Could not generate brochure", { status: 500 });
        }
      },
    },
  },
});
