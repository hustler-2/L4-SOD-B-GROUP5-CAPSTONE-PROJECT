import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ROUTES, fmtRWF } from "@/lib/mock-data";
import { ArrowRight, Smartphone, CreditCard, Wallet, CheckCircle2, QrCode } from "lucide-react";

export const Route = createFileRoute("/book")({
  component: Book,
  head: () => ({ meta: [{ title: "Book a ticket · Green Route" }] }),
});

const SEATS = Array.from({ length: 32 }, (_, i) => i + 1);
const TAKEN = new Set([3, 4, 7, 12, 14, 19, 22, 23, 28]);

function Book() {
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [seats, setSeats] = useState<number[]>([]);
  const [pay, setPay] = useState<"momo" | "card" | "wallet">("momo");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const route = ROUTES.find((r) => r.id === routeId)!;

  const total = seats.length * route.fare;

  function toggleSeat(n: number) {
    if (TAKEN.has(n)) return;
    setSeats((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Book a ticket</h1>
          <p className="text-muted-foreground text-sm mt-1">Pick a route, choose your seats, pay in seconds.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6 text-xs">
          {["Route", "Seats", "Payment", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`size-7 rounded-full grid place-items-center font-bold ${step > i ? "bg-success text-success-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <span className={step >= i + 1 ? "text-foreground" : "text-muted-foreground"}>{s}</span>
              {i < 3 && <ArrowRight className="size-3 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="text-sm font-semibold mb-2">Choose route</div>
                {ROUTES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRouteId(r.id)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition ${routeId === r.id ? "bg-primary/15 border border-primary/40" : "hover:bg-muted"}`}
                  >
                    <span className="size-10 rounded-lg grid place-items-center font-bold" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.stops.length} stops · {r.duration} min</div>
                    </div>
                    <div className="font-bold">{fmtRWF(r.fare)}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="glass rounded-2xl p-6">
                <div className="text-sm font-semibold mb-1">Choose seats</div>
                <div className="text-xs text-muted-foreground mb-5">Tap to select. Taken seats are greyed out.</div>
                <div className="mx-auto max-w-xs">
                  <div className="text-center text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Driver →</div>
                  <div className="grid grid-cols-4 gap-2">
                    {SEATS.map((n) => {
                      const taken = TAKEN.has(n);
                      const sel = seats.includes(n);
                      return (
                        <button
                          key={n}
                          disabled={taken}
                          onClick={() => toggleSeat(n)}
                          className={`aspect-square rounded-lg text-xs font-semibold transition ${
                            taken
                              ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                              : sel
                              ? "bg-primary text-primary-foreground glow"
                              : "bg-card border border-border hover:border-primary/50"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-card border border-border" /> Free</span>
                    <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-primary" /> Yours</span>
                    <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-muted" /> Taken</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="glass rounded-2xl p-6 space-y-3">
                <div className="text-sm font-semibold mb-2">Payment method</div>
                {[
                  { id: "momo" as const, icon: Smartphone, label: "MTN MoMo / Airtel Money", sub: "Pay with mobile money — instant" },
                  { id: "card" as const, icon: CreditCard, label: "Visa / Mastercard", sub: "3-D secure checkout" },
                  { id: "wallet" as const, icon: Wallet, label: "Green Route Wallet", sub: "Balance: 4,200 RWF" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPay(p.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition ${pay === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                  >
                    <p.icon className="size-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.sub}</div>
                    </div>
                    <div className={`ml-auto size-4 rounded-full border-2 ${pay === p.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="glass rounded-2xl p-8 text-center">
                <CheckCircle2 className="size-14 text-success mx-auto" />
                <h2 className="mt-3 text-2xl font-bold">Ticket confirmed</h2>
                <p className="text-muted-foreground text-sm mt-1">Show this QR to the driver when boarding.</p>
                <div className="mt-6 inline-block p-4 rounded-2xl bg-foreground text-background">
                  <QrCode className="size-40" />
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Ticket ID · KGL-{Math.floor(Math.random() * 999999).toString().padStart(6, "0")}</div>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="glass-strong rounded-2xl p-5 h-fit lg:sticky lg:top-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Trip summary</div>
            <div className="mt-2 font-semibold">{route.name}</div>
            <div className="text-xs text-muted-foreground">{route.from} → {route.to}</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span>{seats.length || 1}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fare each</span><span>{fmtRWF(route.fare)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{fmtRWF(50)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="gradient-text">{fmtRWF((seats.length || 1) * route.fare + 50)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {step > 1 && step < 4 && (
                <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium">Back</button>
              )}
              {step < 4 && (
                <button
                  onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                  disabled={step === 2 && seats.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  {step === 3 ? `Pay ${fmtRWF(total + 50)}` : "Continue"}
                </button>
              )}
              {step === 4 && (
                <button onClick={() => { setStep(1); setSeats([]); }} className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold">
                  Book another
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
