import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, PiggyBank, CreditCard, FileText,
  User, Settings, LogOut, Bell, Eye, EyeOff, Download, Search, Sparkles, Building2, TrendingUp, Shield, Receipt, IndianRupee, Upload, FileDown, Menu, X
} from "lucide-react";
import { isAuthed, logout } from "@/lib/auth-store";
import {
  ACCOUNT_BALANCE, ACCOUNT_HOLDER, ACCOUNT_NUMBER, IFSC, BRANCH,
  formatINR, generateTransactions, downloadCSV, downloadStatementPDF, parseExcelTransactions, type Txn
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

const BRAND = "#1463b1";
const cardClass = "rounded-xl bg-white border border-[#1463b1]/20 hover:border-[#1463b1]/40 transition";

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const handleLogout = () => { logout(); navigate({ to: "/" }); };
  const pickTab = (t: Tab) => { setTab(t); setDrawerOpen(false); };

  return (
    <div className="min-h-screen bg-muted/40 overflow-x-hidden">
      {/* Top header — WHITE */}
      <header className="bg-white text-neutral-800 sticky top-0 z-40 shadow-sm border-b border-[#1463b1]/20">
        <div className="px-3 sm:px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-neutral-100 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <img src={bomLogo} alt="Bank of Maharashtra" className="h-8 sm:h-10 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-lg leading-none truncate" style={{ color: BRAND }}>Bank of Maharashtra</div>
              <div className="text-[10px] text-neutral-500 hidden sm:block">Net Banking</div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-neutral-100 rounded-md px-3 py-1.5 border border-neutral-200 min-w-0">
            <Search className="size-4 text-neutral-500 shrink-0" />
            <input placeholder="Search payee, transaction, service..." className="bg-transparent text-sm outline-none placeholder:text-neutral-400 w-full min-w-0" />
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button className="relative p-2 hover:bg-neutral-100 rounded-md"><Bell className="size-5" /><span className="absolute top-1.5 right-1.5 size-2 bg-amber-500 rounded-full" /></button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="size-8 rounded-full text-white grid place-items-center font-bold text-xs shrink-0" style={{ background: BRAND }}>{ACCOUNT_HOLDER.split(" ").map(n=>n[0]).join("")}</div>
              <div className="leading-tight"><div className="font-semibold">{ACCOUNT_HOLDER}</div><div className="text-[10px] text-neutral-500">Cust ID: MAHA12345</div></div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-neutral-100 rounded-md" title="Logout"><LogOut className="size-5" /></button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1463b1]/20">
              <div className="flex items-center gap-2 min-w-0">
                <img src={bomLogo} alt="" className="h-8 w-auto shrink-0" />
                <span className="font-display font-bold text-sm truncate" style={{ color: BRAND }}>Bank of Maharashtra</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-neutral-100"><X className="size-5" /></button>
            </div>
            <nav className="p-3 space-y-1 overflow-y-auto">
              {NAV.map(n => (
                <button key={n.id} onClick={() => pickTab(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${tab === n.id ? "bg-[#1463b1]/10 text-[#1463b1]" : "text-neutral-700 hover:bg-neutral-100"}`}>
                  <n.icon className="size-4" /> {n.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-60 shrink-0 bg-white border-r border-[#1463b1]/20 min-h-[calc(100vh-60px)] sticky top-[60px] self-start">
          <nav className="p-3 space-y-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === n.id ? "bg-[#1463b1]/10 text-[#1463b1]" : "text-neutral-700 hover:bg-neutral-100"}`}>
                <n.icon className="size-4" /> {n.label}
              </button>
            ))}
          </nav>
          <div className="m-3 mt-6 rounded-lg bg-white border border-[#1463b1]/20 p-4 text-xs">
            <Sparkles className="size-4 mb-2" style={{ color: BRAND }} />
            <div className="font-semibold text-neutral-800">AI Spend Insights</div>
            <div className="text-neutral-500 mt-1">You've spent 12% less this month. Great job!</div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6">

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
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: BRAND }}>Welcome back, {ACCOUNT_HOLDER.split(" ")[0]} 👋</h1>
        <p className="text-sm text-neutral-500">Here's your financial snapshot for today.</p>
      </div>

      {/* Balance card — WHITE w/ stroke */}
      <div className="rounded-2xl bg-white border border-[#1463b1]/20 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative flex justify-between items-start">
          <div>
            <div className="text-xs text-neutral-500">Savings Account • {ACCOUNT_NUMBER}</div>
            <div className="text-sm mt-3 text-neutral-500 flex items-center gap-2">Available Balance
              <button onClick={() => setHidden(h=>!h)} className="opacity-70 hover:opacity-100">{hidden? <EyeOff className="size-4"/>:<Eye className="size-4"/>}</button>
            </div>
            <div className="font-display text-4xl md:text-5xl font-black mt-1 tracking-tight" style={{ color: BRAND }}>
              {hidden ? "₹ ••••••••" : formatINR(ACCOUNT_BALANCE)}
            </div>
            <div className="text-xs text-neutral-500 mt-2">{BRANCH} • IFSC {IFSC}</div>
          </div>
          <div className="hidden md:block bg-[#1463b1]/5 border border-[#1463b1]/20 rounded-lg px-4 py-3 text-xs">
            <div className="flex items-center gap-1" style={{ color: BRAND }}><Sparkles className="size-3.5"/> AI Tip</div>
            <div className="text-neutral-600 mt-1 max-w-[200px]">Split monthly credits<br/>into smart savings goals</div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2">
          {[
            ["Transfer", "transfers"], ["Pay Bills", "transfers"], ["Open FD", "deposits"], ["Statement", "statements"], ["Cards", "cards"]
          ].map(([l, t]) => (
            <button key={l} onClick={() => onJump(t as Tab)} className="rounded-md bg-white border border-[#1463b1]/30 hover:bg-[#1463b1]/5 px-4 py-2 text-sm font-medium text-[#1463b1]">{l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: "Monthly Credits", v: 236245, c: "text-emerald-600", i: TrendingUp },
          { l: "Monthly Debits", v: 124890, c: "text-red-600", i: Receipt },
          { l: "Net Savings", v: 111355, c: "", i: PiggyBank },
        ].map(s => (
          <div key={s.l} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">{s.l}</div>
              <s.i className={`size-4 ${s.c || ""}`} style={!s.c ? { color: BRAND } : {}} />
            </div>
            <div className={`mt-2 font-display text-2xl font-bold ${s.c}`} style={!s.c ? { color: BRAND } : {}}>{formatINR(s.v)}</div>
          </div>
        ))}
      </div>

      {/* Quick categories grid */}
      <div>
        <h2 className="font-display text-xl font-bold mb-3 text-neutral-800">Banking Services</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {NAV.filter(n=>n.id!=="overview").map(n => (
            <button key={n.id} onClick={() => onJump(n.id)} className={`${cardClass} p-4 hover:shadow-sm text-center`}>
              <div className="size-10 mx-auto rounded-lg bg-[#1463b1]/10 grid place-items-center"><n.icon className="size-5" style={{ color: BRAND }}/></div>
              <div className="mt-2 text-xs font-medium text-neutral-700">{n.label}</div>
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
  const [uploaded, setUploaded] = useState<Txn[] | null>(null);
  const [uploadName, setUploadName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const allTxns = useMemo(() => uploaded ?? generateTransactions(12), [uploaded]);

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
      const depositLimitMatch = uploaded ? true : (x.type !== "credit" || x.amount <= 30000);
      return d >= f && d <= t && typeMatch && depositLimitMatch;
    }));
    setShowStatement(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseExcelTransactions(file);
      if (!parsed.length) {
        alert("No transactions found in the Excel file. Please check the sheet has headers like Date, Particulars, Debit, Credit, Balance.");
        return;
      }
      // Sort newest first
      parsed.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      setUploaded(parsed);
      setUploadName(file.name);
      setResults(parsed);
      setShowStatement(true);
    } catch (err) {
      console.error(err);
      alert("Could not parse Excel file. Make sure it's a valid .xlsx/.xls/.csv with Date, Particulars, Debit, Credit, Balance columns.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: BRAND }}>My Accounts</h1>
        <p className="text-sm text-neutral-500">All your accounts at a glance</p>
      </div>

      {/* Account card — WHITE */}
      <div className="rounded-2xl bg-white border border-[#1463b1]/20 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Savings Account</div>
              <div className="font-display text-xl font-bold mt-1 text-neutral-800">{ACCOUNT_HOLDER}</div>
              <div className="text-sm text-neutral-600">A/c No: {ACCOUNT_NUMBER}</div>
              <div className="text-xs text-neutral-500 mt-1">IFSC: {IFSC} • {BRANCH}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500">Available Balance</div>
              <div className="font-display text-4xl font-black flex items-center gap-1 justify-end mt-1" style={{ color: BRAND }}>
                <IndianRupee className="size-7" />{new Intl.NumberFormat("en-IN").format(ACCOUNT_BALANCE)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">₹ Forty Four Lakh Fifty Five Thousand Two Hundred Twelve Only</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-t border-[#1463b1]/15 text-sm">
          {[
            ["Account Type", "Savings Plus"],
            ["Branch", BRANCH],
            ["Interest Rate", "3.50% p.a."],
            ["Status", "Active ✓"],
          ].map(([l, v]) => (
            <div key={l} className="p-4">
              <div className="text-xs text-neutral-500">{l}</div>
              <div className="font-semibold mt-0.5 text-neutral-800">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statement filter */}
      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="size-5" style={{ color: BRAND }} />
            <h2 className="font-display text-lg font-bold text-neutral-800">Account Statement</h2>
          </div>
          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
            <button onClick={() => fileRef.current?.click()} className="rounded-md border border-[#1463b1]/40 px-4 py-2 text-sm font-semibold text-[#1463b1] hover:bg-[#1463b1]/5 flex items-center gap-2">
              <Upload className="size-4" /> Upload Excel
            </button>
          </div>
        </div>
        {uploaded && (
          <div className="mb-4 text-xs text-neutral-600 bg-[#1463b1]/5 border border-[#1463b1]/20 rounded px-3 py-2 flex items-center justify-between">
            <span>Showing data from <strong>{uploadName}</strong> ({uploaded.length} transactions)</span>
            <button onClick={() => { setUploaded(null); setUploadName(""); setResults(null); setShowStatement(false); }} className="text-[#1463b1] hover:underline">Clear</button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Select Period</label>
            <select value={period} onChange={e => setPeriod(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1463b1]">
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Transaction Filter</label>
            <select value={txnType} onChange={e => setTxnType(e.target.value as StatementType)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1463b1]">
              <option value="all">All Transactions</option>
              <option value="credit">Credits / Deposits only</option>
              <option value="debit">Debits only</option>
            </select>
          </div>

          {period === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700">From Date</label>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1463b1]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700">To Date</label>
                <input type="date" value={to} onChange={e=>setTo(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1463b1]" />
              </div>
            </div>
          )}
        </div>

        <button onClick={handleView}
          className="mt-5 rounded-md px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90" style={{ background: BRAND }}>
          View Statement
        </button>
      </div>

      {/* Statement results */}
      {showStatement && results && (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="p-5 border-b border-[#1463b1]/15 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-neutral-800">Statement — {results.length} transactions</h3>
            <div className="flex gap-2">
              <button onClick={() => downloadCSV(results, `BoM-Statement-${Date.now()}.csv`)}
                className="rounded-md border border-[#1463b1]/40 px-4 py-2 text-sm font-semibold text-[#1463b1] hover:bg-[#1463b1]/5 flex items-center gap-2">
                <Download className="size-4" /> Download CSV
              </button>
              <button onClick={() => downloadStatementPDF(results, `BoM-Statement-${Date.now()}.pdf`, period === "custom" ? { from, to } : undefined)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 flex items-center gap-2" style={{ background: BRAND }}>
                <FileDown className="size-4" /> Download PDF
              </button>
            </div>
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[22%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead className="bg-[#1463b1]/10 text-xs uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="text-left p-3 break-words">Date</th>
                  <th className="text-left p-3 break-words">Type</th>
                  <th className="text-left p-3 break-words">Particulars</th>
                  <th className="text-left p-3 break-words">Cheque/Reference No</th>
                  <th className="text-right p-3 break-words">Debit</th>
                  <th className="text-right p-3 break-words">Credit</th>
                  <th className="text-right p-3 break-words">Balance</th>
                  <th className="text-left p-3 break-words">Channel</th>
                </tr>
              </thead>
              <tbody>
                {results.map(t => (
                  <tr key={t.id} className="border-t border-neutral-100 hover:bg-neutral-50 align-top">
                    <td className="p-3 break-words text-neutral-700">{new Date(t.date).toLocaleDateString("en-IN", { day:"2-digit", month:"2-digit", year:"numeric" })}</td>
                    <td className="p-3 break-words"><span className="text-xs bg-[#1463b1]/10 text-[#1463b1] px-2 py-0.5 rounded">{t.mode}</span></td>
                    <td className="p-3 break-words text-neutral-700">{t.description}</td>
                    <td className="p-3 break-words text-neutral-700">{t.reference || "—"}</td>
                    <td className="p-3 text-right text-red-600 font-medium whitespace-nowrap">{t.type==="debit" ? formatINR(t.amount) : "—"}</td>
                    <td className="p-3 text-right text-emerald-600 font-medium whitespace-nowrap">{t.type==="credit" ? formatINR(t.amount) : "—"}</td>
                    <td className="p-3 text-right font-semibold text-neutral-800 whitespace-nowrap">{formatINR(t.balance)}</td>
                    <td className="p-3 break-words text-neutral-600 text-xs">{t.channel || "—"}</td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-neutral-500">No transactions in selected period</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {results.length === 0 && <div className="p-6 text-center text-sm text-neutral-500">No transactions in selected period</div>}
            {results.map(t => (
              <div key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-[#1463b1]/10 text-[#1463b1] px-2 py-0.5 rounded shrink-0">{t.mode}</span>
                      <span className="text-xs text-neutral-500">{new Date(t.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-neutral-800 break-words">{t.description}</div>
                    {t.reference && <div className="text-[11px] text-neutral-500 mt-0.5 break-words">Ref: {t.reference}</div>}
                  </div>
                  <div className={`text-right shrink-0 font-semibold text-sm whitespace-nowrap ${t.type==="credit"?"text-emerald-600":"text-red-600"}`}>
                    {t.type==="credit"?"+":"−"} {formatINR(t.amount)}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Balance</span>
                  <span className="font-semibold text-neutral-800 whitespace-nowrap">{formatINR(t.balance)}</span>
                </div>
              </div>
            ))}
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
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: BRAND }}>Deposits</h1>
        <p className="text-sm text-neutral-500">Grow your savings with high-interest deposits</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { t:"Fixed Deposit", r:"7.25%", d:"1yr-10yr", c:"Premium rates with flexible tenure" },
          { t:"Recurring Deposit", r:"6.75%", d:"6m-10yr", c:"Save monthly, earn quarterly" },
          { t:"Tax Saver FD", r:"7.00%", d:"5 years", c:"Save tax under 80C up to ₹1.5L" },
        ].map(d => (
          <div key={d.t} className={`${cardClass} p-6`}>
            <PiggyBank className="size-8" style={{ color: BRAND }} />
            <h3 className="font-display text-lg font-bold mt-3 text-neutral-800">{d.t}</h3>
            <div className="text-3xl font-black mt-2" style={{ color: BRAND }}>{d.r}<span className="text-sm font-normal text-neutral-500"> p.a.</span></div>
            <div className="text-xs text-neutral-500">Tenure: {d.d}</div>
            <p className="text-sm mt-3 text-neutral-700">{d.c}</p>
            <button className="mt-4 w-full rounded-md py-2 text-sm font-semibold text-white" style={{ background: BRAND }}>Open Now</button>
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
    ["Address", "Flat 402, Sahyadri Heights, Hyderabad 500001"], ["Branch", BRANCH],
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: BRAND }}>My Profile</h1>
      <div className={`${cardClass} p-6`}>
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="size-20 rounded-full text-white grid place-items-center font-display text-2xl font-black" style={{ background: BRAND }}>SB</div>
          <div>
            <div className="font-display text-xl font-bold text-neutral-800">{ACCOUNT_HOLDER}</div>
            <div className="text-sm text-neutral-500">Premium Customer • Since 2018</div>
            <div className="mt-2 flex gap-2"><span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">KYC Verified</span><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-6">
          {fields.map(([l,v]) => (
            <div key={l}>
              <div className="text-xs text-neutral-500">{l}</div>
              <div className="font-medium mt-0.5 text-neutral-800">{v}</div>
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
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: BRAND }}>{title}</h1>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i} className={`${cardClass} p-5 hover:shadow-sm cursor-pointer`}>
            <Icon className="size-6" style={{ color: BRAND }} />
            <h3 className="font-semibold mt-3 text-neutral-800">{i}</h3>
            <p className="text-xs text-neutral-500 mt-1">Tap to proceed with this service</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white border border-[#1463b1]/20 p-4 flex items-start gap-3">
        <Shield className="size-5 shrink-0" style={{ color: BRAND }} />
        <div className="text-sm text-neutral-700">All transactions are secured with 256-bit encryption & RBI-grade compliance.</div>
      </div>
    </div>
  );
}

function Statements() {
  return <Accounts />;
}
