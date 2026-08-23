import { Link } from "@tanstack/react-router";
import adszooLogo from "@/assets/adszoo-logo.png.asset.json";

/** Small footer shown on every public-facing page: attribution + policy links. */
export function PoweredByAdszoo({ className = "" }: { className?: string }) {
  return (
    <footer className={`flex flex-col items-center gap-4 py-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-xs text-muted-foreground">
        <Link to="/contact" className="hover:text-foreground">
          Contact Us
        </Link>
        <span className="hidden sm:inline">·</span>
        <Link to="/terms" className="hover:text-foreground">
          Terms & Conditions
        </Link>
        <span className="hidden sm:inline">·</span>
        <Link to="/refund-policy" className="hover:text-foreground">
          Refunds & Cancellation
        </Link>
      </div>
      <a
        href="https://adszoo.in"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <img src={adszooLogo.url} alt="Adszoo" className="size-4 rounded-full" loading="lazy" />
        Powered by <span className="font-semibold text-foreground">Adszoo</span>
      </a>
    </footer>
  );
}
