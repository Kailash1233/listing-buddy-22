import adszooLogo from "@/assets/adszoo-logo.png.asset.json";

/** Small, unobtrusive attribution badge shown on every public-facing page. */
export function PoweredByAdszoo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <a
        href="https://adszoo.in"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <img src={adszooLogo.url} alt="Adszoo" className="size-4 rounded-full" loading="lazy" />
        Powered by <span className="font-semibold text-foreground">Adszoo</span>
      </a>
    </div>
  );
}
