import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/** Sticky marketing header used on public policy and content pages. */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            P
          </span>
          Plotly
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/pricing"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
          >
            Pricing
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start free
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
