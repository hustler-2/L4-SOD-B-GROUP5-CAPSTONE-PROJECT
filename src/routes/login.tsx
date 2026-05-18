import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import heroImg from "@/assets/kigali-hero.jpg";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in · Green Route" }] }),
});

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pwd, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setErr("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErr("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setErr(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="size-10 rounded-xl gradient-hero grid place-items-center"><Bus className="size-5 text-primary-foreground" /></div>
            <span className="font-bold text-lg">Green Route</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight max-w-md">Smart transit, in your pocket.</h2>
            <p className="text-muted-foreground mt-3 max-w-md">Real-time tracking, instant booking, AI travel insights — built for Green Route commuters.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="size-9 rounded-lg gradient-hero grid place-items-center"><Bus className="size-4 text-primary-foreground" /></div>
            <span className="font-bold">Green Route</span>
          </Link>
          <h1 className="text-3xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{mode === "signin" ? "Sign in to book and track buses." : "Free forever for riders."}</p>

          <button onClick={google} className="mt-6 w-full py-3 rounded-xl bg-card border border-border font-medium text-sm hover:border-primary/50 transition flex items-center justify-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v3.2h5.3c-.2 1.4-1.7 4-5.3 4-3.2 0-5.8-2.6-5.8-5.9S8.8 6.4 12 6.4c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.9 14.5 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.8 0-.6-.1-1-.2-1.4H12z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1.5">Email</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input border border-border focus-within:border-primary">
                <Mail className="size-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-sm" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1.5">Password</div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-input border border-border focus-within:border-primary">
                <Lock className="size-4 text-muted-foreground" />
                <input type="password" required minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)} className="bg-transparent outline-none flex-1 text-sm" placeholder="••••••••" />
              </div>
            </label>
            {err && <div className="text-xs text-destructive">{err}</div>}
            <button disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 glow">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-muted-foreground">
            {mode === "signin" ? "New to Green Route? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
