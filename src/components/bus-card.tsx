import { ROUTES, BUSES, fmtRWF, type Bus } from "@/lib/mock-data";
import { Clock, Users, Gauge, Wifi } from "lucide-react";

export function BusCard({ bus, onClick, active }: { bus: Bus; onClick?: () => void; active?: boolean }) {
  const route = ROUTES.find((r) => r.id === bus.routeId)!;
  const occColor = bus.occupancy > 80 ? "text-destructive" : bus.occupancy > 50 ? "text-warning" : "text-success";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass rounded-xl p-4 hover:border-primary/50 transition-all ${
        active ? "border-primary glow" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-lg grid place-items-center font-bold text-sm" style={{ background: route.color, color: "#0B0B0F" }}>
          {route.code}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{route.name}</div>
          <div className="text-xs text-muted-foreground truncate">{bus.plate} · {bus.driver}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold gradient-text">{bus.eta}m</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">ETA</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5"><Gauge className="size-3.5 text-muted-foreground" /> {bus.speed} km/h</div>
        <div className={`flex items-center gap-1.5 ${occColor}`}><Users className="size-3.5" /> {bus.occupancy}%</div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="size-3.5" /> {fmtRWF(route.fare)}</div>
      </div>
      {bus.status !== "on-time" && (
        <div className={`mt-2 text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${
          bus.status === "delayed" ? "bg-destructive/15 text-destructive" : "bg-secondary/20 text-secondary"
        }`}>
          <Wifi className="size-2.5" /> {bus.status}
        </div>
      )}
    </button>
  );
}

export function BusList({ selectedId, onSelect }: { selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {BUSES.map((b) => (
        <BusCard key={b.id} bus={b} active={selectedId === b.id} onClick={() => onSelect(b.id)} />
      ))}
    </div>
  );
}
