import { useEffect, useState } from "react";
import { BUSES, ROUTES, type Bus } from "@/lib/mock-data";
import { Bus as BusIcon } from "lucide-react";

// Animated SVG "Kigali map" — simulated routes & moving buses.
// Coords are normalized in a 0..100 viewBox.
const ROUTE_PATHS: Record<string, string> = {
  "r-302": "M 8 78 C 22 60, 36 64, 48 50 S 76 36, 92 22",
  "r-216": "M 12 22 C 26 36, 40 30, 50 50 S 70 78, 90 82",
  "r-118": "M 14 50 C 30 46, 46 56, 60 50 S 82 42, 92 50",
  "r-405": "M 88 90 C 70 78, 56 70, 48 50 S 30 24, 10 14",
};

function pointAt(d: string, t: number) {
  // Use a hidden SVG path to compute point-at-length in browsers.
  const ns = "http://www.w3.org/2000/svg";
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", d);
  const len = p.getTotalLength();
  return p.getPointAtLength(len * t);
}

export function LiveMap({ selectedBus, onSelectBus }: {
  selectedBus?: string;
  onSelectBus?: (id: string) => void;
}) {
  const [buses, setBuses] = useState<Bus[]>(BUSES);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setBuses((bs) =>
        bs.map((b) => {
          const speed = b.status === "boarding" ? 0 : 0.0012 + b.speed / 60000;
          let progress = b.progress + speed;
          if (progress > 1) progress = 0;
          return { ...b, progress };
        })
      );
      setTick((t) => t + 1);
    }, 120);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-card grid-bg">
      {/* Soft gradient overlays — Kigali "hills" feel */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 80%, oklch(0.55 0.14 155 / 0.18), transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.7 0.16 230 / 0.18), transparent 55%)" }} />

      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Hill silhouettes */}
        <path d="M 0 88 Q 25 76 50 84 T 100 80 L 100 100 L 0 100 Z" fill="oklch(0.55 0.14 155 / 0.10)" />
        <path d="M 0 92 Q 30 84 55 90 T 100 88 L 100 100 L 0 100 Z" fill="oklch(0.55 0.14 155 / 0.14)" />

        {/* Routes */}
        {ROUTES.map((r) => (
          <path
            key={r.id}
            d={ROUTE_PATHS[r.id]}
            fill="none"
            stroke={r.color}
            strokeWidth={0.7}
            strokeLinecap="round"
            opacity={0.85}
            strokeDasharray="0.8 1.2"
          />
        ))}

        {/* Stops (junction dots) */}
        {[
          [50, 50, "Downtown"],
          [10, 80, "Nyabugogo"],
          [92, 22, "Kimironko"],
          [12, 22, "Remera"],
          [88, 90, "Airport"],
          [92, 50, "Nyamirambo"],
        ].map(([x, y, label], i) => (
          <g key={i}>
            <circle cx={x as number} cy={y as number} r={0.9} fill="oklch(0.98 0.01 240)" />
            <circle cx={x as number} cy={y as number} r={1.6} fill="none" stroke="oklch(0.98 0.01 240 / 0.4)" strokeWidth={0.15} />
            <text x={(x as number) + 2} y={(y as number) + 1} fontSize={2.2} fill="oklch(0.95 0.01 240 / 0.85)" style={{ fontFamily: "system-ui" }}>
              {label as string}
            </text>
          </g>
        ))}
      </svg>

      {/* Buses overlay (positioned absolutely using point-at-length) */}
      <div className="absolute inset-0 pointer-events-none">
        {buses.map((b) => {
          const route = ROUTES.find((r) => r.id === b.routeId)!;
          if (typeof window === "undefined") return null;
          let pt: { x: number; y: number } = { x: 50, y: 50 };
          try {
            const p = pointAt(ROUTE_PATHS[b.routeId], b.progress);
            pt = { x: p.x, y: p.y };
          } catch {}
          const sel = selectedBus === b.id;
          return (
            <button
              key={b.id + tick * 0}
              onClick={() => onSelectBus?.(b.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform ${sel ? "scale-125 z-10" : ""}`}
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, color: route.color }}
            >
              <span className="pulse-dot inline-flex items-center justify-center size-7 rounded-full text-primary-foreground shadow-elevated"
                    style={{ background: route.color }}>
                <BusIcon className="size-3.5" />
              </span>
              {sel && (
                <span className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] px-1.5 py-0.5 rounded bg-card border border-border text-foreground">
                  {b.plate}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 glass rounded-lg px-3 py-2 text-xs space-y-1">
        <div className="font-semibold mb-1 text-foreground">Active routes</div>
        {ROUTES.map((r) => (
          <div key={r.id} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: r.color }} />
            <span className="text-foreground">{r.code}</span>
            <span>{r.name}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-success animate-pulse" /> Live · {buses.length} buses</div>
      </div>
    </div>
  );
}
