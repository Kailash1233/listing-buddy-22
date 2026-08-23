import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/brochure/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const download = new URL(request.url).searchParams.has("dl");
        try {
          // NOTE: the import itself must stay inside the try — a module-eval
          // failure here previously escaped the handler and rendered the
          // generic SSR error page instead of a JSON error.
          console.log("[brochure] start", params.id);
          const { buildBrochure } = await import("@/lib/brochure.server");
          const pdf = await buildBrochure(params.id);
          if (!pdf) {
            return new Response(
              JSON.stringify({ error: "not_found", message: "This listing is not available." }),
              { status: 404, headers: { "content-type": "application/json" } },
            );
          }
          console.log("[brochure] done", params.id, pdf.bytes.byteLength, "bytes");
          return new Response(pdf.bytes as BodyInit, {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `${download ? "attachment" : "inline"}; filename="${pdf.filename}"`,
              "cache-control": "public, max-age=300",
            },
          });
        } catch (err) {
          console.error(
            "[brochure] failed",
            params.id,
            err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : String(err),
          );
          return new Response(
            JSON.stringify({
              error: "brochure_generation_failed",
              message: "Brochure temporarily unavailable, please try again.",
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});

