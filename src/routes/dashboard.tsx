import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building2, Home, Inbox, Settings, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBroker } from "@/hooks/useBroker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/NotificationBell";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const nav: Array<{
  to: "/dashboard" | "/dashboard/properties" | "/dashboard/leads" | "/dashboard/settings";
  label: string;
  icon: typeof Home;
  exact?: boolean;
}> = [
  { to: "/dashboard", label: "Dashboard", icon: Home, exact: true },
  { to: "/dashboard/properties", label: "Properties", icon: Building2 },
  { to: "/dashboard/leads", label: "Leads", icon: Inbox },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  const { session, loading, signOut } = useAuth();
  const { data: broker, isLoading } = useBroker();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (session && !isLoading && broker === null) navigate({ to: "/onboarding" });
  }, [session, isLoading, broker, navigate]);

  if (loading || isLoading || !broker) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              P
            </span>
            <span className="hidden sm:inline">Plotly</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell brokerId={broker.id} />
            <Button asChild size="sm">
              <Link to="/dashboard/properties/new">
                <Plus className="size-4" /> <span className="hidden sm:inline">Add property</span>
              </Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Log out"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
