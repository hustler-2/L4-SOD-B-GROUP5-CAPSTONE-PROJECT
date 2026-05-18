import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { fmtRWF, ROUTES } from "@/lib/mock-data";
import { QrCode, Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";

export const Route = createFileRoute("/tickets")({
  component: Tickets,
  head: () => ({ meta: [{ title: "My tickets · Green Route" }] }),
});

const TICKETS = [
  { id: "KGL-203481", routeId: "r-302", date: "Today · 14:20", seats: ["12"], status: "active" as const },
  { id: "KGL-198722", routeId: "r-118", date: "Yesterday · 08:05", seats: ["7", "8"], status: "used" as const },
  { id: "KGL-187210", routeId: "r-405", date: "May 12 · 19:40", seats: ["3"], status: "used" as const },
];

function Tickets() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My tickets</h1>
            <p className="text-muted-foreground text-sm mt-1">Active and past trips, all in one place.</p>
          </div>
          <Link to="/book" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">+ New ticket</Link>
        </div>

        <div className="space-y-3">
          {TICKETS.map((t) => {
            const r = ROUTES.find((x) => x.id === t.routeId)!;
            return (
              <div key={t.id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-stretch">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:justify-between">
                  <div className="size-14 rounded-xl grid place-items-center font-bold text-lg" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</div>
                  <div className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider font-semibold ${t.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {t.status}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5"><MapPin className="size-3" /> {r.from} → {r.to}</div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {t.date}</span>
                    <span className="flex items-center gap-1.5"><TicketIcon className="size-3.5" /> Seat {t.seats.join(", ")}</span>
                    <span>{fmtRWF(r.fare * t.seats.length)}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Ticket · {t.id}</div>
                </div>
                <div className="grid place-items-center">
                  <div className={`p-2 rounded-xl ${t.status === "active" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                    <QrCode className="size-20" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
