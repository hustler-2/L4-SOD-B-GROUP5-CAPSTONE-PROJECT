import { Link, useLocation } from "@tanstack/react-router";
import { Bus, Map, Ticket, LayoutDashboard, Sparkles, LifeBuoy, LogIn } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Sparkles },
  { to: "/map", label: "Live Map", icon: Map },
  { to: "/book", label: "Book Ticket", icon: Ticket },
  { to: "/tickets", label: "My Tickets", icon: Bus },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl gradient-hero grid place-items-center glow">
            <Bus className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">GreenRoute</div>
            <div className="text-xs text-muted-foreground mt-1">Smart Transit</div>
          </div>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 space-y-2">
          <Link
            to="/login"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition"
          >
            <LogIn className="size-4" /> Sign in
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <LifeBuoy className="size-3.5" /> 24/7 support · Kinyarwanda
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-lg gradient-hero grid place-items-center">
            <Bus className="size-4 text-primary-foreground" />
          </div>
          <div className="font-bold">Green Route</div>
          <Link to="/login" className="ml-auto text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground font-medium">
            Sign in
          </Link>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-40 glass-strong border-t border-border grid grid-cols-5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
                {n.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
