import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, PiggyBank, CreditCard, FileText,
  User, Settings, LogOut, Bell, Eye, EyeOff, Download, Search, Sparkles, Building2, TrendingUp, Shield, Receipt, IndianRupee
} from "lucide-react";
import { isAuthed, logout } from "@/lib/auth-store";
import {
  ACCOUNT_BALANCE, ACCOUNT_HOLDER, ACCOUNT_NUMBER, IFSC, BRANCH,
  formatINR, generateTransactions, downloadCSV, type Txn
} from "@/lib/bank-data";
import bomLogo from "@/assets/bom-official-logo.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Bank of Maharashtra" }] }),
  component: Dashboard,
});

type Tab = "overview" | "accounts" | "transfers" | "deposits" | "loans" | "cards" | "statements" | "profile" | "settings";
type StatementType = "all" | "credit" | "debit";

const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
  { id: "deposits", label: "Deposits", icon: PiggyBank },
  { id: "loans", label: "Loans", icon: Building2 },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "statements", label: "Statements", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const handleLogout = () => { logout(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-30 shadow">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={bomLogo} alt="Bank of Maharashtra" className="h-10 w-auto object-contain bg-primary-foreground" />
            <div>
              <div className="font-display font-bold text-lg leading-none">Bank of Maharashtra</div>
              <div className="text-[10px] opacity-80">Net Banking</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-md px-3 py-1.5 w-80">
            <Search className="size-4 opacity-80" />
            <input placeholder="Search payee, transaction, service..." className="bg-transparent text-sm outline-none placeholder:text-white/60 w-full" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-white/10 rounded-md"><Bell className="size-5" /><span className="absolute top-1.5 right-1.5 size-2 bg-gold rounded-full" /></button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="size-8 rounded-full bg-gold text-gold-foreground grid place-items-center font-bold text-xs">{ACCOUNT_HOLDER.split(" ").map(n=>n[0]).join("")}</div>
              <div className="leading-tight"><div className="font-semibold">{ACCOUNT_HOLDER}</div><div className="text-[10px] opacity-80">Cust ID: MAHA12345</div></div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-md" title="Logout"><LogOut className="size-5" /></button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-60 shrink-0 bg-card border-r min-h-[calc(100vh-60px)] sticky top-[60px] self-start">
          <nav className="p-3 space-y-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === n.id ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent"}`}>
                <n.icon className="size-4" /> {n.label}
              </button>
            ))}
          </nav>
          <div className="m-3 mt-6 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.30_0.12_25)] text-primary-foreground p-4 text-xs">
            <Sparkles className="size-4 text-gold mb-2" />
            <div className="font-semibold">AI Spend Insights</div>
            <div className="opacity-80 mt-1">You've spent 12% less this month. Great job!</div>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t flex justify-around py-2">
          {NAV.slice(0, 5).map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`flex flex-col items-center text-[10px] gap-0.5 ${tab===n.id?"text-primary":"text-muted-foreground"}`}>
              <n.icon className="size-5" />{n.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 pb-20">
          {tab === "overview" && <Overview onJump={setTab} />}
          {tab === "accounts" && <Accounts />}
          {tab === "transfers" && <Placeholder title="Transfers" subtitle="Send money via NEFT, RTGS, IMPS or UPI" icon={ArrowLeftRight} items={["Within MahaBank", "Other Bank (NEFT/RTGS)", "IMPS Instant", "UPI Pay", "International Wire"]} />}
          {tab === "deposits" && <Deposits />}
          {tab === "loans" && <Placeholder title="Loans" subtitle="Apply, manage and prepay" icon={Building2} items={["Home Loan", "Personal Loan", "Vehicle Loan", "Education Loan", "Gold Loan"]} />}
          {tab === "cards" && <Placeholder title="Cards" subtitle="Manage your debit & credit cards" icon={CreditCard} items={["Debit Card — RuPay Platinum", "Credit Card — MahaCard Gold", "Set PIN", "Block/Unblock", "Card Limits"]} />}
          {tab === "statements" && <Statements />}
          {tab === "profile" && <Profile />}
          {tab === "settings" && <Placeholder title="Settings" subtitle="Security, notifications, preferences" icon={Settings} items={["Change Password", "2FA Settings", "Notification Preferences", "Linked Devices", "Privacy Controls"]} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ onJump }: { onJump: (t: Tab) => void }) {
  const [hidden, setHidden] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">Welcome back, {ACCOUNT_HOLDER.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Here's your financial snapshot for today.</p>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-[oklch(0.38_0.13_250)] text-primary-foreground p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-gold/20 blur-2xl" />
        <div className="relative flex justify-between items-start">
          <div>
            <div className="text-xs opacity-80">Savings Account • {ACCOUNT_NUMBER}</div>
            <div className="text-sm mt-3 opacity-80 flex items-center gap-2">Available Balance
              <button onClick={() => setHidden(h=>!h)} className="opacity-70 hover:opacity-100">{hidden? <EyeOff className="size-4"/>:<Eye className="size-4"/>}</button>
            </div>
            <div className="font-display text-4xl md:text-5xl font-black mt-1 tracking-tight">
              {hidden ? "₹ ••••••••" : formatINR(ACCOUNT_BALANCE)}
            </div>
            <div className="text-xs opacity-80 mt-2">{BRANCH} • IFSC {IFSC}</div>
          </div>
          <div className="hidden md:block bg-white/10 backdrop-blur rounded-lg px-4 py-3 text-xs">
            <div className="flex items-center gap-1 text-gold"><Sparkles className="size-3.5"/> AI Tip</div>
            <div className="opacity-90 mt-1 max-w-[200px]">Split monthly credits<br/>into smart savings goals</div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2">
          {[
            ["Transfer", "transfers"], ["Pay Bills", "transfers"], ["Open FD", "deposits"], ["Statement", "statements"], ["Cards", "cards"]
          ].map(([l, t]) => (
            <button key={l} onClick={() => onJump(t as Tab)} className="rounded-md bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 text-sm font-medium">{l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: "Monthly Credits", v: 236245, c: "text-success", i: TrendingUp },
          { l: "Monthly Debits", v: 124890, c: "text-destructive", i: Receipt },
          { l: "Net Savings", v: 111355, c: "text-primary", i: PiggyBank },
        ].map(s => (
          <div key={s.l} className="rounded-xl bg-card border p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <s.i className={`size-4 ${s.c}`} />
            </div>
            <div className={`mt-2 font-display text-2xl font-bold ${s.c}`}>{formatINR(s.v)}</div>
          </div>
        ))}
      </div>

      {/* Quick categories grid */}
      <div>
        <h2 className="font-display text-xl font-bold mb-3">Banking Services</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {NAV.filter(n=>n.id!=="overview").map(n => (
            <button key={n.id} onClick={() => onJump(n.id)} className="rounded-xl bg-card border p-4 hover:border-primary hover:shadow-md transition text-center">
              <div className="size-10 mx-auto rounded-lg bg-accent grid place-items-center"><n.icon className="size-5 text-primary"/></div>
              <div className="mt-2 text-xs font-medium">{n.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Accounts() {
  const [showStatement, setShowStatement] = useState(false);
  const [period, setPeriod] = useState<"3m"|"6m"|"1y"|"custom">("6m");
  const [txnType, setTxnType] = useState<StatementType>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<Txn[] | null>(null);
  const allTxns = useMemo(() => generateTransactions(12), []);

  const handleView = () => {
    let f: Date, t: Date = new Date();
    if (period === "custom") {
      if (!from || !to) return alert("Select both From & To dates");
      f = new Date(from); f.setHours(0, 0, 0, 0);
      t = new Date(to); t.setHours(23, 59, 59, 999);
      if (f > t) return alert("From date cannot be after To date");
    } else {
      const months = period === "3m" ? 3 : period === "6m" ? 6 : 12;
      f = new Date(); f.setMonth(f.getMonth() - months); f.setHours(0, 0, 0, 0);
    }
    setResults(allTxns.filter(x => {
      const d = new Date(x.date);
      const typeMatch = txnType === "all" || x.type === txnType;
      const depositLimitMatch = x.type !== "credit" || x.amount <= 30000;
      return d >= f && d <= t && typeMatch && depositLimitMatch;
    }));
    setShowStatement(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">My Accounts</h1>
        <p className="text-sm text-muted-foreground">All your accounts at a glance</p>
      </div>

      {/* Account card */}
      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-[oklch(0.38_0.13_250)] text-primary-foreground p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="text-xs opacity-80 uppercase tracking-wider">Savings Account</div>
              <div className="font-display text-xl font-bold mt-1">{ACCOUNT_HOLDER}</div>
              <div className="text-sm opacity-90">A/c No: {ACCOUNT_NUMBER}</div>
              <div className="text-xs opacity-80 mt-1">IFSC: {IFSC} • {BRANCH}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">Available Balance</div>
              <div className="font-display text-4xl font-black flex items-center gap-1 justify-end mt-1">
                <IndianRupee className="size-7" />{new Intl.NumberFormat("en-IN").format(ACCOUNT_BALANCE)}
              </div>
              <div className="text-xs opacity-80 mt-1">₹ Forty Four Lakh Fifty Five Thousand Two Hundred Twelve Only</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-t text-sm">
          {[
            ["Account Type", "Savings Plus"],
            ["Branch", BRANCH],
            ["Interest Rate", "3.50% p.a."],
            ["Status", "Active ✓"],
          ].map(([l, v]) => (
            <div key={l} className="p-4">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="font-semibold mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statement filter */}
      <div className="rounded-xl bg-card border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="size-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Account Statement</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-foreground/70">Select Period</label>
            <select value={period} onChange={e => setPeriod(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/70">Transaction Filter</label>
            <select value={txnType} onChange={e => setTxnType(e.target.value as StatementType)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option value="all">All Transactions</option>
              <option value="credit">Credits / Deposits only</option>
              <option value="debit">Debits only</option>
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">Credits above ₹30,000 are excluded.</p>
          </div>

          {period === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground/70">From Date</label>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/70">To Date</label>
                <input type="date" value={to} onChange={e=>setTo(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          )}
        </div>

        <button onClick={handleView}
          className="mt-5 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          View Statement
        </button>
      </div>

      {/* Statement results */}
      {showStatement && results && (
        <div className="rounded-xl bg-card border overflow-hidden">
          <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold">Statement — {results.length} transactions</h3>
              <p className="text-xs text-muted-foreground">{period==="custom" ? `${from} to ${to}` : `Last ${period === "3m" ? "3 months" : period === "6m" ? "6 months" : "1 year"}`} • {txnType === "all" ? "All types" : txnType === "credit" ? "Credits only" : "Debits only"} • no credit above ₹30,000</p>
            </div>
            <button onClick={() => downloadCSV(results, `MahaBank-Statement-${Date.now()}.csv`)}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:opacity-90 flex items-center gap-2">
              <Download className="size-4" /> Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Mode</th>
                  <th className="text-right p-3">Debit</th>
                  <th className="text-right p-3">Credit</th>
                  <th className="text-right p-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {results.map(t => (
                  <tr key={t.id} className="border-t hover:bg-muted/50">
                    <td className="p-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3"><span className="text-xs bg-accent px-2 py-0.5 rounded">{t.mode}</span></td>
                    <td className="p-3 text-right text-destructive font-medium">{t.type==="debit" ? formatINR(t.amount) : "—"}</td>
                    <td className="p-3 text-right text-success font-medium">{t.type==="credit" ? formatINR(t.amount) : "—"}</td>
                    <td className="p-3 text-right font-semibold">{formatINR(t.balance)}</td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions in selected period</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Deposits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">Deposits</h1>
        <p className="text-sm text-muted-foreground">Grow your savings with high-interest deposits</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { t:"Fixed Deposit", r:"7.25%", d:"1yr-10yr", c:"Premium rates with flexible tenure" },
          { t:"Recurring Deposit", r:"6.75%", d:"6m-10yr", c:"Save monthly, earn quarterly" },
          { t:"Tax Saver FD", r:"7.00%", d:"5 years", c:"Save tax under 80C up to ₹1.5L" },
        ].map(d => (
          <div key={d.t} className="rounded-xl bg-card border p-6 hover:border-primary transition">
            <PiggyBank className="size-8 text-primary" />
            <h3 className="font-display text-lg font-bold mt-3">{d.t}</h3>
            <div className="text-3xl font-black text-primary mt-2">{d.r}<span className="text-sm font-normal text-muted-foreground"> p.a.</span></div>
            <div className="text-xs text-muted-foreground">Tenure: {d.d}</div>
            <p className="text-sm mt-3">{d.c}</p>
            <button className="mt-4 w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-semibold">Open Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const fields = [
    ["Full Name", ACCOUNT_HOLDER], ["Customer ID", "MAHA12345"],
    ["Email", "salla.bharath@example.com"], ["Mobile", "+91 98765 43210"],
    ["PAN", "ABCDE1234F"], ["Aadhaar", "XXXX XXXX 4521"],
    ["Address", "Flat 402, Sahyadri Heights, Pune 411038"], ["Branch", BRANCH],
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">My Profile</h1>
      <div className="rounded-xl bg-card border p-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="size-20 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-2xl font-black">SB</div>
          <div>
            <div className="font-display text-xl font-bold">{ACCOUNT_HOLDER}</div>
            <div className="text-sm text-muted-foreground">Premium Customer • Since 2018</div>
            <div className="mt-2 flex gap-2"><span className="text-xs bg-gold/20 text-gold-foreground px-2 py-0.5 rounded">KYC Verified</span><span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">Active</span></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-6">
          {fields.map(([l,v]) => (
            <div key={l}>
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="font-medium mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title, subtitle, icon: Icon, items }: { title: string; subtitle: string; icon: any; items: string[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i} className="rounded-xl bg-card border p-5 hover:border-primary hover:shadow-md transition cursor-pointer">
            <Icon className="size-6 text-primary" />
            <h3 className="font-semibold mt-3">{i}</h3>
            <p className="text-xs text-muted-foreground mt-1">Tap to proceed with this service</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-accent/50 border border-gold/30 p-4 flex items-start gap-3">
        <Shield className="size-5 text-primary shrink-0" />
        <div className="text-sm">All transactions are secured with 256-bit encryption & RBI-grade compliance.</div>
      </div>
    </div>
  );
}

function Statements() {
  return <Accounts />;
}
