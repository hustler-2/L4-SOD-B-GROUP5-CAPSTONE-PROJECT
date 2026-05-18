import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LiveMap } from "@/components/live-map";
import { BUSES, ROUTES, REVENUE_WEEK, KIGALI_DEMAND, fmtRWF } from "@/lib/mock-data";
import { adminLogin, adminLogout, isAdminAuthed } from "@/lib/admin-auth";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import { TrendingUp, Bus, Users, AlertTriangle, DollarSign, Sparkles, Mail, Lock, ArrowRight, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Operator dashboard · Green Route" }] }),
});

function AdminLoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(email, pwd);
      if (ok) {
        onAuth();
      } else {
        setErr("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl gradient-hero grid place-items-center glow shadow-elevated">
            <ShieldCheck className="size-8 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center">Admin Access</h1>
        <p className="text-muted-foreground text-sm text-center mt-1 mb-8">
          Sign in to access the operator dashboard.
        </p>

        <div className="glass rounded-2xl p-6 shadow-elevated space-y-4">
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1.5">Email</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input border border-border focus-within:border-primary transition">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                  placeholder="admin@gmail.com"
                />
              </div>
            </label>

            <label className="block">
              <div className="text-xs text-muted-foreground mb-1.5">Password</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input border border-border focus-within:border-primary transition">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {err && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <button
              id="admin-signin-btn"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 glow transition"
            >
              {loading ? "Verifying…" : "Sign in to Dashboard"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Admin access only · Green Route Operations
        </p>
      </div>
    </div>
  );
}

function Admin() {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const totalRevenue = REVENUE_WEEK.reduce((a, b) => a + b.revenue, 0);
  const delayed = BUSES.filter((b) => b.status === "delayed").length;

  if (!authed) {
    return <AdminLoginGate onAuth={() => setAuthed(true)} />;
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">Operator Console</div>
            <h1 className="text-3xl lg:text-4xl font-bold mt-1">Live network overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Updated just now
            </div>
            <button
              onClick={() => { adminLogout(); setAuthed(false); }}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-destructive/15 hover:text-destructive transition text-muted-foreground"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Revenue (7d)" value={fmtRWF(totalRevenue)} icon={DollarSign} delta="+12.4%" tone="success" />
          <Stat label="Active buses" value={`${BUSES.length}/${BUSES.length + 18}`} icon={Bus} delta="98% fleet" tone="primary" />
          <Stat label="Riders today" value="14,820" icon={Users} delta="+8.1%" tone="primary" />
          <Stat label="Delays" value={String(delayed)} icon={AlertTriangle} delta="2 routes" tone="warning" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Revenue · last 7 days</div>
                <div className="text-xs text-muted-foreground">All routes, RWF</div>
              </div>
              <TrendingUp className="size-4 text-success" />
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={REVENUE_WEEK}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.16 230)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.7 0.16 230)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.01 260 / 0.4)" />
                  <XAxis dataKey="day" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "oklch(0.17 0.015 255)", border: "1px solid oklch(0.28 0.015 260)", borderRadius: 12 }} />
                  <Area dataKey="revenue" stroke="oklch(0.7 0.16 230)" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Demand by hour</div>
                <div className="text-xs text-muted-foreground">AI peak forecast</div>
              </div>
              <Sparkles className="size-4 text-secondary" />
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={KIGALI_DEMAND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.01 260 / 0.4)" />
                  <XAxis dataKey="hour" stroke="oklch(0.7 0.02 250)" fontSize={10} />
                  <YAxis stroke="oklch(0.7 0.02 250)" fontSize={10} />
                  <Tooltip contentStyle={{ background: "oklch(0.17 0.015 255)", border: "1px solid oklch(0.28 0.015 260)", borderRadius: 12 }} />
                  <Bar dataKey="riders" fill="oklch(0.86 0.17 90)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-2xl p-3 h-[460px]">
            <LiveMap />
          </div>
          <div className="glass rounded-2xl p-5 space-y-3 max-h-[460px] overflow-y-auto">
            <div className="text-sm font-semibold">Active fleet</div>
            {BUSES.map((b) => {
              const r = ROUTES.find((x) => x.id === b.routeId)!;
              const occ = b.occupancy;
              return (
                <div key={b.id} className="p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded grid place-items-center text-[11px] font-bold" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</span>
                    <div className="text-sm font-semibold">{b.plate}</div>
                    <div className={`ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${b.status === "delayed" ? "bg-destructive/15 text-destructive" : b.status === "boarding" ? "bg-secondary/20 text-secondary" : "bg-success/15 text-success"}`}>{b.status}</div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{b.driver} · {b.speed} km/h · ETA {b.eta}m</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${occ}%`, background: occ > 80 ? "oklch(0.62 0.22 25)" : occ > 50 ? "oklch(0.86 0.17 90)" : "oklch(0.7 0.17 155)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Routes</div>
            <button className="text-xs text-primary">+ Add route</button>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2">Code</th><th>Route</th><th>Stops</th><th>Fare</th><th>Duration</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-3"><span className="size-7 rounded grid place-items-center text-[11px] font-bold inline-flex" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</span></td>
                    <td className="font-medium">{r.name}</td>
                    <td className="text-muted-foreground">{r.stops.length}</td>
                    <td>{fmtRWF(r.fare)}</td>
                    <td>{r.duration}m</td>
                    <td><span className="text-xs px-2 py-0.5 rounded bg-success/15 text-success">Live</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon, delta, tone }: { label: string; value: string; icon: typeof Bus; delta: string; tone: "primary" | "success" | "warning" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${toneCls}`} />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className={`mt-0.5 text-xs ${toneCls}`}>{delta}</div>
    </div>
  );
}
