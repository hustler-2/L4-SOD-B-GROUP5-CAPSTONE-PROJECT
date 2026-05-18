import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { LiveMap } from "@/components/live-map";
import { BUSES, ROUTES, REVENUE_WEEK, KIGALI_DEMAND, fmtRWF, type Bus } from "@/lib/mock-data";
import { adminLogin, adminLogout, isAdminAuthed } from "@/lib/admin-auth";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  Bus as BusIcon,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Sliders,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

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
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
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
                  placeholder="••••••••"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {err && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center">
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
  const [buses, setBuses] = useState<Bus[]>(BUSES);
  const [simActive, setSimActive] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  
  const [manualProgress, setManualProgress] = useState(0.5);
  const [manualSpeed, setManualSpeed] = useState(30);
  const [manualStatus, setManualStatus] = useState<Bus["status"]>("on-time");

  const totalRevenue = REVENUE_WEEK.reduce((a, b) => a + b.revenue, 0);
  const delayed = buses.filter((b) => b.status === "delayed").length;

  const fetchFleet = async () => {
    try {
      const res = await fetch("/api/gps");
      const data = await res.json();
      if (data && data.buses) {
        setBuses(data.buses);
        setSimActive(data.simulationActive);
      }
    } catch (err) {
      console.error("Failed to fetch fleet telemetry:", err);
    }
  };

  useEffect(() => {
    if (!authed) return;
    fetchFleet();
    const interval = setInterval(fetchFleet, 1000);
    return () => clearInterval(interval);
  }, [authed]);

  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find(b => b.id === selectedBusId);
      if (bus) {
        setManualProgress(bus.progress);
        setManualSpeed(bus.speed);
        setManualStatus(bus.status);
      }
    }
  }, [selectedBusId]);

  const toggleSimulation = async () => {
    try {
      const res = await fetch("/api/gps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate", active: !simActive }),
      });
      const data = await res.json();
      if (data.success) {
        setSimActive(data.simulationActive);
      }
    } catch (err) {
      console.error("Failed to toggle simulation:", err);
    }
  };

  const resetFleet = async () => {
    try {
      const res = await fetch("/api/gps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFleet();
      }
    } catch (err) {
      console.error("Failed to reset fleet:", err);
    }
  };

  const sendManualGPSUpdate = async () => {
    if (!selectedBusId) return;
    try {
      const res = await fetch("/api/gps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          busId: selectedBusId,
          progress: manualProgress,
          speed: manualSpeed,
          status: manualStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFleet();
      }
    } catch (err) {
      console.error("Failed to update manual coordinates:", err);
    }
  };

  if (!authed) {
    return <AdminLoginGate onAuth={() => setAuthed(true)} />;
  }

  const selectedBus = buses.find(b => b.id === selectedBusId);

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
              <span className="size-2 rounded-full bg-success animate-pulse" /> Live Telemetry Running
            </div>
            <button
              onClick={() => { adminLogout(); setAuthed(false); }}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-destructive/15 hover:text-destructive transition text-muted-foreground cursor-pointer"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 p-4 glass rounded-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold">GPS Tracking Simulator:</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono ${simActive ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
              {simActive ? "ACTIVE SIMULATION" : "SIMULATION PAUSED"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              {simActive ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {simActive ? "Pause Autopilot" : "Resume Autopilot"}
            </button>
            <button
              onClick={resetFleet}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Reset Fleet Positions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Revenue (7d)" value={fmtRWF(totalRevenue)} icon={DollarSign} delta="+12.4%" tone="success" />
          <Stat label="Active buses" value={`${buses.length}/${buses.length + 18}`} icon={BusIcon} delta="98% fleet" tone="primary" />
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
            <LiveMap selectedBus={selectedBusId || undefined} onSelectBus={(id) => setSelectedBusId(id)} />
          </div>

          <div className="glass rounded-2xl p-5 flex flex-col h-[460px] overflow-hidden">
            <div className="text-sm font-semibold flex items-center justify-between border-b border-border pb-2.5">
              <span>GPS Fleet Control Panel</span>
              <Sliders className="size-4 text-primary" />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {selectedBus ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase">Manual GPS Injection</span>
                    <button
                      onClick={() => setSelectedBusId(null)}
                      className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                  
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-1">Bus: <strong className="text-foreground">{selectedBus.plate}</strong> ({selectedBus.driver})</div>
                    <div className="text-[11px] text-muted-foreground">Route Position (Progress): <span className="font-mono text-primary font-bold">{Math.round(manualProgress * 100)}%</span></div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={manualProgress}
                      onChange={(e) => {
                        setManualProgress(parseFloat(e.target.value));
                        sendManualGPSUpdate();
                      }}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Speed (km/h)</div>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={manualSpeed}
                        onChange={(e) => {
                          setManualSpeed(Number(e.target.value));
                          setTimeout(sendManualGPSUpdate, 50);
                        }}
                        className="w-full bg-input border border-border rounded px-2 py-1 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Status</div>
                      <select
                        value={manualStatus}
                        onChange={(e) => {
                          setManualStatus(e.target.value as Bus["status"]);
                          setTimeout(sendManualGPSUpdate, 50);
                        }}
                        className="w-full bg-input border border-border rounded px-1.5 py-1 text-xs outline-none focus:border-primary text-foreground"
                      >
                        <option value="on-time">On-time</option>
                        <option value="delayed">Delayed</option>
                        <option value="boarding">Boarding</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4 bg-card rounded-xl border border-dashed border-border">
                  Click a bus on the live map or list below to inject manual GPS coordinates!
                </div>
              )}

              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Bus to Control:</div>
                {buses.map((b) => {
                  const r = ROUTES.find((x) => x.id === b.routeId)!;
                  const isSel = selectedBusId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBusId(b.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer hover:border-primary/50 ${isSel ? "bg-primary/5 border-primary" : "bg-card border-border"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="size-7 rounded grid place-items-center text-[11px] font-bold" style={{ background: r.color, color: "#0B0B0F" }}>{r.code}</span>
                        <div className="text-sm font-semibold">{b.plate}</div>
                        <div className={`ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${b.status === "delayed" ? "bg-destructive/15 text-destructive" : b.status === "boarding" ? "bg-secondary/20 text-secondary" : "bg-success/15 text-success"}`}>{b.status}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                        <span>{b.driver}</span>
                        <span>{b.speed} km/h · Progress {Math.round(b.progress * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

function Stat({ label, value, icon: Icon, delta, tone }: { label: string; value: string; icon: any; delta: string; tone: "primary" | "success" | "warning" }) {
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
