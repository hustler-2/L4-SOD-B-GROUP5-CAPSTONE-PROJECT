import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LiveMap } from "@/components/live-map";
import { ROUTES, BUSES, fmtRWF } from "@/lib/mock-data";
import heroImg from "@/assets/kigali-hero.jpg";
import { ArrowRight, Bus, MapPin, Sparkles, Ticket, Shield, Languages, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Green Route — Smart bus tracking & ticket booking" },
      { name: "description", content: "Track buses live, book seats, and pay with Mobile Money. AI-powered ETA and route recommendations with Green Route." },
    ],
  }),
});

function Index() {
  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="City at dusk with glowing bus routes"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative px-6 lg:px-12 pt-12 lg:pt-20 pb-16 lg:pb-24 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Live across 24 routes on Green Route
          </div>
          <h1 className="mt-5 text-4xl lg:text-7xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            Move smarter. <span className="gradient-text">Greener.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Track every bus in real time, predict crowds with AI, and pay your fare in seconds with Mobile Money or card. Built for Green Route commuters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/map"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold glow hover:opacity-95 transition"
            >
              <MapPin className="size-4" /> Open live map
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:opacity-95 transition"
            >
              <Ticket className="size-4" /> Book a ticket
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {[
              { k: "Active buses", v: BUSES.length, icon: Bus },
              { k: "Routes live", v: ROUTES.length, icon: MapPin },
              { k: "Avg. ETA accuracy", v: "94%", icon: Zap },
              { k: "Languages", v: "EN · KIN · FR", icon: Languages },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.k} className="glass rounded-xl p-4">
                  <Icon className="size-4 text-primary" />
                  <div className="mt-2 text-2xl font-bold">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.k}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto -mt-6 lg:-mt-12 relative z-10">
        <div className="glass-strong rounded-2xl p-2 shadow-elevated">
          <div className="h-[420px] rounded-xl overflow-hidden">
            <LiveMap />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">Why Green Route</div>
            <h2 className="text-3xl lg:text-5xl font-bold mt-2 max-w-2xl">A complete transit OS for the city.</h2>
          </div>
          <Link to="/admin" className="text-sm text-primary hover:underline">View operator dashboard →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-primary/40 transition group">
              <div className="size-11 rounded-xl grid place-items-center mb-4" style={{ background: f.bg, color: f.color }}>
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROUTES STRIP */}
      <section className="px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Popular routes today</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROUTES.map((r) => (
            <Link to="/book" key={r.id} className="glass rounded-xl p-4 hover:border-primary/40 transition">
              <div className="flex items-center gap-2">
                <span className="size-9 rounded-lg grid place-items-center font-bold text-sm" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</span>
                <div className="text-xs text-muted-foreground">{r.duration} min · {fmtRWF(r.fare)}</div>
              </div>
              <div className="mt-3 font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{r.stops.join(" → ")}</div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

const FEATURES = [
  { title: "Real-time GPS tracking", desc: "Watch every bus move with sub-second updates and predicted arrival times.", icon: MapPin, bg: "oklch(0.7 0.16 230 / 0.18)", color: "oklch(0.7 0.16 230)" },
  { title: "AI ETA & demand forecasting", desc: "Machine-learned models predict crowding, peak hours and route delays.", icon: Sparkles, bg: "oklch(0.86 0.17 90 / 0.18)", color: "oklch(0.86 0.17 90)" },
  { title: "Instant booking & QR tickets", desc: "Pick a seat, pay, board. Tickets scan from your wallet — even offline.", icon: Ticket, bg: "oklch(0.55 0.14 155 / 0.2)", color: "oklch(0.7 0.17 155)" },
  { title: "Mobile Money & card", desc: "MTN MoMo, Airtel Money, Visa, Mastercard. One tap, secure receipts.", icon: Shield, bg: "oklch(0.7 0.16 230 / 0.18)", color: "oklch(0.7 0.16 230)" },
  { title: "SOS & lost-and-found", desc: "One-tap emergency reporting and integrated lost item recovery.", icon: Users, bg: "oklch(0.62 0.22 25 / 0.18)", color: "oklch(0.7 0.2 25)" },
  { title: "Kinyarwanda first", desc: "Full Kinyarwanda, English & French support with accessibility built in.", icon: Languages, bg: "oklch(0.55 0.14 155 / 0.2)", color: "oklch(0.7 0.17 155)" },
];
