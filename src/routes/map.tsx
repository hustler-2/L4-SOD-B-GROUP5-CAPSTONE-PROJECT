import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LiveMap } from "@/components/live-map";
import { BusList } from "@/components/bus-card";
import { BUSES, ROUTES } from "@/lib/mock-data";
import { Search, Locate, Sparkles } from "lucide-react";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({ meta: [{ title: "Live bus map · Green Route" }, { name: "description", content: "Real-time bus tracking with AI-powered ETAs on Green Route." }] }),
});

function MapPage() {
  const [selected, setSelected] = useState<string | undefined>(BUSES[0].id);
  const bus = BUSES.find((b) => b.id === selected);
  const route = bus ? ROUTES.find((r) => r.id === bus.routeId)! : undefined;

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[380px_1fr] gap-4 p-4 lg:p-6 h-[calc(100vh-0px)] lg:h-screen">
        {/* Sidebar */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="glass rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input">
              <Search className="size-4 text-muted-foreground" />
              <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Where to? e.g. Kimironko" />
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              <Locate className="size-4" /> Use current location
            </button>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-secondary" />
              AI suggests <strong className="text-foreground mx-1">Route 302</strong> — 6 min faster now
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
            <BusList selectedId={selected} onSelect={setSelected} />
          </div>
        </div>

        {/* Map */}
        <div className="relative min-h-[420px] lg:h-full">
          <LiveMap selectedBus={selected} onSelectBus={setSelected} />
          {bus && route && (
            <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:max-w-sm glass-strong rounded-2xl p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-lg grid place-items-center font-bold" style={{ background: route.color, color: "#0B0B0F" }}>{route.code}</span>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{route.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{bus.plate} · driver {bus.driver}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold gradient-text">{bus.eta}m</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">arriving</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${bus.progress * 100}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{route.from}</span>
                <span>{route.to}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
