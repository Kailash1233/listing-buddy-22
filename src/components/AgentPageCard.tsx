import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Globe, PenLine } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";

/**
 * "Your website is live" card. Confirms the public agent page once at least one
 * listing is published, and nudges the broker to add a bio when it's missing.
 */
export function AgentPageCard({
  slug,
  hasLive,
  hasBio,
}: {
  slug: string;
  hasLive: boolean;
  hasBio: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const path = `/p/${slug}`;
  const link = origin ? `${origin}${path}` : path;
  const display = link.replace(/^https?:\/\//, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="surface space-y-4 p-5">
      <div className="flex items-start gap-3">
        <Globe className="mt-0.5 size-5 text-primary" />
        <div className="min-w-0">
          <p className="font-semibold">
            {hasLive ? "Your agent page is live" : "Your agent page is ready"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasLive
              ? "Every published listing shows up here on one shareable page."
              : "Publish your first listing and buyers will see it on this page."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{display}</span>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out my properties: ${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="size-4" /> Share on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/p/$slug" params={{ slug }} target="_blank">
            Visit page <ExternalLink className="size-4" />
          </Link>
        </Button>
      </div>

      {!hasBio ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
          <span className="flex items-center gap-2">
            <PenLine className="size-4" /> Add a short bio so buyers know who they&apos;re talking
            to.
          </span>
          <Button asChild variant="secondary" size="sm">
            <Link to="/dashboard/settings">Add bio</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
