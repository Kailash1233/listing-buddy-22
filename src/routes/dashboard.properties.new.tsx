import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBroker } from "@/hooks/useBroker";
import { PropertyEditor } from "@/components/PropertyEditor";

export const Route = createFileRoute("/dashboard/properties/new")({
  head: () => ({
    meta: [
      { title: "Add a property — PropertyGenie" },
      { name: "description", content: "Paste a rough description or fill the form to publish a property page in minutes." },
      { property: "og:title", content: "Add a property — PropertyGenie" },
      { property: "og:description", content: "Paste a rough description or fill the form to publish a property page in minutes." },
    ],
  }),
  component: NewProperty,
});

function NewProperty() {
  const { data: broker } = useBroker();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!broker) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Add a property</h1>
        <p className="mt-1 text-muted-foreground">
          Paste your WhatsApp-style notes and let AI draft it, or fill the form yourself.
        </p>
      </div>

      <PropertyEditor
        broker={broker}
        onSaved={(p, published) => {
          void qc.invalidateQueries({ queryKey: ["properties", broker.id] });
          toast.success(published ? "Property published!" : "Draft saved");
          navigate({ to: "/dashboard/properties/$id", params: { id: p.id } });
        }}
      />
    </div>
  );
}
