import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Sparkles, Smartphone, Lock, ArrowRight, Building2, CreditCard, PiggyBank, TrendingUp } from "lucide-react";
import { login } from "@/lib/auth-store";
import bomLogo from "@/assets/bom-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bank of Maharashtra — One Family One Bank" },
      { name: "description", content: "Official net banking portal of Bank of Maharashtra — accounts, transfers, deposits, loans, cards and AI-powered insights." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !pwd) return;
    login();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex justify-between">
          <span>Customer Care: 1800-233-4526 (Toll-Free)</span>
          <span>Powered by AI • RBI Regulated</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={bomLogo} alt="Bank of Maharashtra" className="size-12 object-contain" />
            <div>
              <div className="font-display text-xl font-black text-primary leading-none">Bank of Maharashtra</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">ONE FAMILY ONE BANK</div>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-foreground/80">
            <a href="#personal" className="hover:text-primary">Personal</a>
            <a href="#business" className="hover:text-primary">Business</a>
            <a href="#loans" className="hover:text-primary">Loans</a>
            <a href="#cards" className="hover:text-primary">Cards</a>
            <a href="#about" className="hover:text-primary">About</a>
          </nav>
          <button onClick={() => setShowLogin(true)} className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-gold-foreground hover:opacity-90 shadow">
            Net Banking Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[oklch(0.30_0.12_25)] text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="size-3.5 text-gold" /> AI-Powered Smart Banking
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-black leading-tight">
              Banking that thinks <span className="text-gold">ahead of you.</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl">
              Manage accounts, transfer instantly, open deposits and get AI-driven insights on your spends — all in one secure place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setShowLogin(true)} className="rounded-md bg-gold px-6 py-3 text-sm font-bold text-gold-foreground hover:opacity-90 flex items-center gap-2">
                Login to Net Banking <ArrowRight className="size-4" />
              </button>
              <a href="#features" className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10">Explore Features</a>
            </div>
            <div className="mt-8 flex gap-6 text-xs text-primary-foreground/70">
              <div className="flex items-center gap-1.5"><Shield className="size-4 text-gold" /> 256-bit Encryption</div>
              <div className="flex items-center gap-1.5"><Lock className="size-4 text-gold" /> 2FA Secured</div>
              <div className="flex items-center gap-1.5"><Smartphone className="size-4 text-gold" /> 24/7 Mobile</div>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 md:p-8 border border-gold/20">
            <h2 className="font-display text-xl font-bold text-primary">Secure Login</h2>
            <p className="text-xs text-muted-foreground mt-1">Enter your credentials to access net banking</p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/70">Customer ID / User ID</label>
                <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="e.g. MAHA12345" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70">Password</label>
                <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5"><input type="checkbox" /> Remember me</label>
                <a href="#" className="text-primary font-medium">Forgot Password?</a>
              </div>
              <button type="submit" className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
                Secure Login <Lock className="size-4" />
              </button>
              <p className="text-[11px] text-muted-foreground text-center">Demo: enter any User ID & Password to continue</p>
            </form>
          </div>
        </div>
      </section>

      {/* Quick services */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-primary">Everything You Need, Smarter</h2>
        <p className="text-center text-muted-foreground mt-2">AI-powered tools for modern banking</p>
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Building2, t: "Accounts", d: "Savings, Current & Salary with real-time balance" },
            { icon: CreditCard, t: "Cards", d: "Debit, Credit & RuPay with instant control" },
            { icon: PiggyBank, t: "Deposits", d: "FD, RD & Tax-saver with best interest rates" },
            { icon: TrendingUp, t: "AI Insights", d: "Smart spending analysis & recommendations" },
          ].map(f => (
            <div key={f.t} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="size-11 rounded-lg bg-accent grid place-items-center">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground/80 text-xs py-6 text-center">
        © {new Date().getFullYear()} Bank of Maharashtra • Demo project • All rights reserved
      </footer>

      {/* Login modal trigger */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-card rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold text-primary">Secure Login</h2>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Customer ID" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <button type="submit" className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Login</button>
              <p className="text-[11px] text-muted-foreground text-center">Demo: any credentials work</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
