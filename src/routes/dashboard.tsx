import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  IndianRupee,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PiggyBank,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  User,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isAuthed, logout } from "@/lib/auth-store";
import {
  ACCOUNT_BALANCE,
  ACCOUNT_HOLDER,
  ACCOUNT_NUMBER,
  BRANCH,
  IFSC,
  downloadCSV,
  downloadStatementPDF,
  formatINR,
  generateTransactions,
  parseExcelTransactions,
  type Txn,
} from "@/lib/bank-data";
import bomLogo from "@/assets/bom-official-logo.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Bank of Maharashtra" }] }),
  component: Dashboard,
});

type Tab = "overview" | "accounts" | "transfers" | "deposits" | "loans" | "cards" | "statements" | "profile" | "settings";
type StatementType = "all" | "credit" | "debit";

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Home", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
  { id: "deposits", label: "Deposits", icon: PiggyBank },
  { id: "loans", label: "Loans", icon: Building2 },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "statements", label: "Statement", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const quickActions: { label: string; tab: Tab; icon: typeof ArrowLeftRight }[] = [
  { label: "Transfer", tab: "transfers", icon: ArrowLeftRight },
  { label: "Statement", tab: "statements", icon: FileText },
  { label: "Open FD", tab: "deposits", icon: PiggyBank },
  { label: "Cards", tab: "cards", icon: CreditCard },
];

const money = (amount: number) => formatINR(amount).replace("₹", "₹ ");

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const pickTab = (next: Tab) => {
    setTab(next);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="hidden border-b bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 text-[11px] sm:px-5 lg:px-8">
          <div className="flex items-center gap-4 opacity-90">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Secure Session</span>
            <span className="hidden lg:inline">Last login: Today, 09:42 AM IST</span>
            <span className="hidden lg:inline">Session expires in 09:58</span>
          </div>
          <div className="flex items-center gap-4 opacity-90">
            <span>IFSC {IFSC}</span>
            <span>Toll-free: 1800-233-4526</span>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu />
            </Button>
            <img src={bomLogo} alt="Bank of Maharashtra" className="h-9 w-auto shrink-0 sm:h-11" />
            <div className="flex min-w-0 items-center gap-2 border-l pl-3">
              <span className="truncate text-sm font-semibold uppercase tracking-wide text-primary sm:text-base">Net Banking</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden min-w-64 items-center gap-2 rounded-md border bg-secondary px-3 py-2 lg:flex">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search services" />
            </div>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
            </Button>
            <div className="hidden items-center gap-2 rounded-md border px-2 py-1.5 md:flex">
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">SB</div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{ACCOUNT_HOLDER}</p>
                <p className="text-xs text-muted-foreground">MAHA12345</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>


      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-80 max-w-[88vw] p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle className="flex min-w-0 items-center gap-2 text-primary">
              <img src={bomLogo} alt="" className="h-8 w-auto shrink-0" />
              <span className="truncate">Bank of Maharashtra</span>
            </SheetTitle>
          </SheetHeader>
          <Navigation active={tab} onPick={pickTab} mobile />
        </SheetContent>
      </Sheet>

      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 border-r bg-card md:block">
          <Navigation active={tab} onPick={pickTab} />
        </aside>

        <main className="min-w-0 flex-1 px-3 py-4 pb-8 sm:px-5 lg:px-8">
          {tab === "overview" && <Overview onJump={pickTab} />}
          {tab === "accounts" && <Accounts />}
          {tab === "statements" && <Accounts startOpen />}
          {tab === "transfers" && <ServicePage title="Transfers" subtitle="Move money quickly and safely" icon={ArrowLeftRight} items={["Within Bank", "NEFT / RTGS", "IMPS Instant", "UPI Payment", "Beneficiary Management", "Scheduled Transfers"]} />}
          {tab === "deposits" && <Deposits />}
          {tab === "loans" && <ServicePage title="Loans" subtitle="Track and apply for credit products" icon={Building2} items={["Home Loan", "Personal Loan", "Vehicle Loan", "Education Loan", "Gold Loan", "Loan Statements"]} />}
          {tab === "cards" && <Cards />}
          {tab === "profile" && <Profile />}
          {tab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function Navigation({ active, onPick, mobile = false }: { active: Tab; onPick: (tab: Tab) => void; mobile?: boolean }) {
  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV.map((item) => (
        <button
          key={item.id}
          onClick={() => onPick(item.id)}
          className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium transition ${
            active === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          {mobile && <ChevronRight className="size-4 opacity-60" />}
        </button>
      ))}
      <div className="mt-auto hidden rounded-lg border bg-secondary p-4 md:block">
        <Sparkles className="mb-2 size-5 text-primary" />
        <p className="text-sm font-semibold">AI banking insight</p>
        <p className="mt-1 text-xs text-muted-foreground">Your debits are trending lower than last month.</p>
      </div>
    </nav>
  );
}

function PageTitle({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof LayoutDashboard }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold text-primary sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid size-11 shrink-0 place-items-center rounded-lg border bg-card text-primary">
        <Icon className="size-5" />
      </div>
    </div>
  );
}

function Overview({ onJump }: { onJump: (tab: Tab) => void }) {
  const [hidden, setHidden] = useState(false);
  const recent = useMemo(() => generateTransactions(2).slice(0, 4), []);

  return (
    <div className="space-y-5">
      <PageTitle title={`Hi, ${ACCOUNT_HOLDER.split(" ")[0]}`} subtitle="Your complete mobile-first banking control centre" icon={LayoutDashboard} />

      <Card className="overflow-hidden border-primary/20 shadow-sm">
        <CardContent className="p-0">
          <div className="bg-primary p-5 text-primary-foreground sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs opacity-80">Available balance</p>
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <p className="break-words font-display text-3xl font-black leading-tight sm:text-5xl">{hidden ? "₹ •••••••" : money(ACCOUNT_BALANCE)}</p>
                  <Button variant="ghost" size="icon" className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => setHidden((value) => !value)}>
                    {hidden ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <p className="mt-2 text-xs opacity-85">Savings • {ACCOUNT_NUMBER} • IFSC {IFSC}</p>
              </div>
              <Badge className="shrink-0 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">Active</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x border-b">
            {quickActions.map((action) => (
              <button key={action.label} onClick={() => onJump(action.tab)} className="min-w-0 p-3 text-center hover:bg-accent sm:p-4">
                <action.icon className="mx-auto size-5 text-primary" />
                <span className="mt-2 block truncate text-xs font-semibold sm:text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Monthly credits" value={236245} icon={ArrowDownLeft} tone="success" />
        <Metric label="Monthly debits" value={124890} icon={ArrowUpRight} tone="danger" />
        <Metric label="Net savings" value={111355} icon={PiggyBank} tone="primary" />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Banking services</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NAV.filter((item) => item.id !== "overview").map((item) => (
            <button key={item.id} onClick={() => onJump(item.id)} className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent">
              <div className="grid size-10 place-items-center rounded-md bg-secondary text-primary">
                <item.icon className="size-5" />
              </div>
              <p className="mt-3 truncate font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Open service</p>
            </button>
          ))}
        </div>
      </section>

      <Card className="shadow-sm">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
          <CardTitle className="truncate font-display text-lg">Recent activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onJump("statements")}>View all</Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {recent.map((txn) => <TransactionLine key={txn.id} txn={txn} />)}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Wallet; tone: "primary" | "success" | "danger" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-primary";
  return (
    <Card className="shadow-sm">
      <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className={`mt-1 truncate font-display text-xl font-bold ${toneClass}`}>{money(value)}</p>
        </div>
        <Icon className={`size-5 shrink-0 ${toneClass}`} />
      </CardContent>
    </Card>
  );
}

function Accounts({ startOpen = false }: { startOpen?: boolean }) {
  return (
    <div className="space-y-5">
      <PageTitle title="Accounts" subtitle="Savings account, balance and statement tools" icon={Wallet} />

      <Card className="overflow-hidden border-primary/20 shadow-sm">
        <CardContent className="p-0">
          <div className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <Badge variant="secondary">Savings Account</Badge>
                <h2 className="mt-3 truncate font-display text-xl font-bold">{ACCOUNT_HOLDER}</h2>
                <p className="mt-1 text-sm text-muted-foreground">A/c No: {ACCOUNT_NUMBER}</p>
                <p className="mt-1 text-xs text-muted-foreground">{BRANCH} • IFSC {IFSC}</p>
              </div>
              <div className="min-w-0 sm:text-right">
                <p className="text-xs text-muted-foreground">Available balance</p>
                <p className="mt-1 break-words font-display text-3xl font-black text-primary sm:text-4xl">{money(ACCOUNT_BALANCE)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Forty four lakh fifty five thousand two hundred twelve only</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t sm:grid-cols-4">
            {[
              ["Account type", "Savings Plus"],
              ["Branch", BRANCH],
              ["Interest", "3.50% p.a."],
              ["Status", "Active"],
            ].map(([label, value]) => (
              <div key={label} className="border-r p-4 last:border-r-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StatementPanel startOpen={startOpen} />
    </div>
  );
}

function StatementPanel({ startOpen }: { startOpen: boolean }) {
  const [period, setPeriod] = useState<"3m" | "6m" | "1y" | "custom">("6m");
  const [txnType, setTxnType] = useState<StatementType>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showStatement, setShowStatement] = useState(startOpen);
  const [results, setResults] = useState<Txn[] | null>(startOpen ? generateTransactions(6) : null);
  const [uploaded, setUploaded] = useState<Txn[] | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const allTxns = useMemo(() => uploaded ?? generateTransactions(12), [uploaded]);

  const handleView = () => {
    if (uploaded) {
      const filtered = allTxns.filter((txn) => txnType === "all" || txn.type === txnType);
      setResults(filtered);
      setShowStatement(true);
      return;
    }

    let f: Date;
    let t = new Date();
    if (period === "custom") {
      if (!from || !to) {
        setUploadError("Select both From and To dates.");
        return;
      }
      f = new Date(from);
      t = new Date(to);
      f.setHours(0, 0, 0, 0);
      t.setHours(23, 59, 59, 999);
      if (f > t) {
        setUploadError("From date cannot be after To date.");
        return;
      }
    } else {
      f = new Date();
      f.setMonth(f.getMonth() - (period === "3m" ? 3 : period === "6m" ? 6 : 12));
      f.setHours(0, 0, 0, 0);
    }

    setUploadError("");
    setResults(allTxns.filter((txn) => {
      const date = new Date(txn.date);
      return date >= f && date <= t && (txnType === "all" || txn.type === txnType) && (txn.type !== "credit" || txn.amount <= 30000);
    }));
    setShowStatement(true);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");

    try {
      const parsed = await parseExcelTransactions(file);
      if (!parsed.length) {
        setUploadError("No rows were found. Please upload a sheet that has transaction rows and headers.");
        return;
      }

      const sorted = [...parsed].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      setUploaded(sorted);
      setUploadName(file.name);
      setResults(sorted);
      setShowStatement(true);
    } catch (error) {
      console.error(error);
      setUploadError("Upload failed. Try an .xlsx, .xls or .csv file; the app will auto-detect Date, Narration, Debit, Credit and Balance columns.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearUpload = () => {
    setUploaded(null);
    setUploadName("");
    setResults(null);
    setShowStatement(false);
    setUploadError("");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate font-display text-xl text-primary">Account Statement</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Upload Excel or view generated bank statement</p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
            <FileSpreadsheet className="size-5" />
          </div>
        </div>

        <div className="rounded-lg border bg-secondary p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Excel upload</p>
              <p className="mt-1 text-xs text-muted-foreground">Shows your uploaded columns exactly in the UI and download files.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload /> Upload Excel
              </Button>
              {uploaded && <Button variant="ghost" onClick={clearUpload}>Clear</Button>}
            </div>
          </div>
          {uploaded && <p className="mt-3 rounded-md border bg-card px-3 py-2 text-xs text-success">Loaded {uploaded.length} rows from {uploadName}</p>}
          {uploadError && <p className="mt-3 rounded-md border border-destructive/30 bg-card px-3 py-2 text-xs text-destructive">{uploadError}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Period</label>
            <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)} disabled={!!uploaded}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last 1 year</SelectItem>
                <SelectItem value="custom">Custom date range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Type</label>
            <Select value={txnType} onValueChange={(value) => setTxnType(value as StatementType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All transactions</SelectItem>
                <SelectItem value="credit">Credits only</SelectItem>
                <SelectItem value="debit">Debits only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === "custom" && !uploaded ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <Button className="w-full" onClick={handleView}>
                <FileText /> View Statement
              </Button>
            </div>
          )}
        </div>

        {period === "custom" && !uploaded && (
          <Button className="w-full sm:w-auto" onClick={handleView}>
            <FileText /> View Statement
          </Button>
        )}
      </CardHeader>

      {showStatement && results && <StatementResults results={results} period={period} from={from} to={to} uploaded={!!uploaded} />}
    </Card>
  );
}

function StatementResults({ results, period, from, to, uploaded }: { results: Txn[]; period: string; from: string; to: string; uploaded: boolean }) {
  const uploadedColumns = results.find((txn) => txn.sourceColumns?.length)?.sourceColumns ?? [];
  const defaultColumns = ["Date", "Type", "Particulars", "Cheque/Reference No", "Debit", "Credit", "Balance", "Channel"];
  const columns = uploadedColumns.length ? uploadedColumns : defaultColumns;
  const isNumeric = (value: string) => /^[-+]?₹?[\d,]+(\.\d+)?$/.test(String(value).trim());

  const valueFor = (txn: Txn, column: string) => {
    if (uploadedColumns.length) return txn.sourceRow?.[column] ?? "";
    if (column === "Date") return new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (column === "Type") return txn.mode;
    if (column === "Particulars") return txn.description;
    if (column === "Cheque/Reference No") return txn.reference || "—";
    if (column === "Debit") return txn.type === "debit" ? money(txn.amount) : "—";
    if (column === "Credit") return txn.type === "credit" ? money(txn.amount) : "—";
    if (column === "Balance") return money(txn.balance);
    return txn.channel || "—";
  };

  return (
    <CardContent className="border-t p-0">
      <div className="grid gap-3 border-b p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold">Statement — {results.length} transactions</h3>
          {uploaded && <p className="mt-1 text-xs text-muted-foreground">Excel mode: original columns are preserved and wrapped.</p>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" onClick={() => downloadCSV(results, `BoM-Statement-${Date.now()}.csv`)}>
            <Download /> CSV
          </Button>
          <Button onClick={() => downloadStatementPDF(results, `BoM-Statement-${Date.now()}.pdf`, period === "custom" ? { from, to } : undefined)}>
            <FileDown /> PDF
          </Button>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            {columns.map((column) => <col key={column} style={{ width: `${100 / columns.length}%` }} />)}
          </colgroup>
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>{columns.map((column) => <th key={column} className="p-3 text-left align-top break-words">{column}</th>)}</tr>
          </thead>
          <tbody>
            {results.length === 0 && <tr><td className="p-8 text-center text-muted-foreground" colSpan={columns.length}>No transactions found</td></tr>}
            {results.map((txn) => (
              <tr key={txn.id} className="border-t align-top hover:bg-accent/50">
                {columns.map((column) => {
                  const value = String(valueFor(txn, column));
                  return <td key={column} className={`p-3 ${isNumeric(value) ? "whitespace-nowrap text-right tabular-nums" : "break-words"}`}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {results.length === 0 && <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">No transactions found</div>}
        {results.map((txn) => (
          <div key={txn.id} className="rounded-lg border bg-card p-3 shadow-sm">
            {uploadedColumns.length ? (
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => {
                  const value = String(valueFor(txn, column));
                  return (
                    <div key={column} className="min-w-0 rounded-md bg-secondary p-2">
                      <p className="truncate text-[10px] font-semibold uppercase text-muted-foreground">{column}</p>
                      <p className={`mt-1 text-xs font-medium ${isNumeric(value) ? "whitespace-nowrap tabular-nums" : "break-words"}`}>{value || "—"}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TransactionLine txn={txn} roomy />
            )}
          </div>
        ))}
      </div>
    </CardContent>
  );
}

function TransactionLine({ txn, roomy = false }: { txn: Txn; roomy?: boolean }) {
  const credit = txn.type === "credit";
  return (
    <div className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 ${roomy ? "" : "rounded-lg border p-3"}`}>
      <div className={`grid size-10 shrink-0 place-items-center rounded-md ${credit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
        {credit ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold">{txn.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • {txn.mode}</p>
        {txn.reference && <p className="mt-1 break-words text-xs text-muted-foreground">Ref: {txn.reference}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className={`whitespace-nowrap text-sm font-bold tabular-nums ${credit ? "text-success" : "text-destructive"}`}>{credit ? "+" : "−"} {money(txn.amount)}</p>
        <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground tabular-nums">{money(txn.balance)}</p>
      </div>
    </div>
  );
}

function Deposits() {
  return (
    <div className="space-y-5">
      <PageTitle title="Deposits" subtitle="Open and manage fixed, recurring and tax-saving deposits" icon={PiggyBank} />
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { title: "Fixed Deposit", rate: "7.25%", tenor: "1 year - 10 years", body: "Premium rates with flexible payout options." },
          { title: "Recurring Deposit", rate: "6.75%", tenor: "6 months - 10 years", body: "Build disciplined monthly savings." },
          { title: "Tax Saver FD", rate: "7.00%", tenor: "5 years", body: "Save tax under 80C up to ₹1.5L." },
        ].map((item) => (
          <Card key={item.title} className="shadow-sm">
            <CardContent className="p-5">
              <PiggyBank className="size-8 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-2 font-display text-3xl font-black text-primary">{item.rate}<span className="text-sm font-medium text-muted-foreground"> p.a.</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Tenure: {item.tenor}</p>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
              <Button className="mt-4 w-full">Open now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Cards() {
  return (
    <div className="space-y-5">
      <PageTitle title="Cards" subtitle="Manage debit and credit card controls" icon={CreditCard} />
      <div className="grid gap-3 lg:grid-cols-2">
        {["RuPay Platinum Debit", "MahaCard Gold Credit"].map((name, index) => (
          <Card key={name} className="border-primary/20 bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold text-primary">{name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">**** **** **** {index ? "8821" : "4521"}</p>
                </div>
                <CreditCard className="size-8 shrink-0 text-primary" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  ["Status", "Active"],
                  ["Limit", index ? "₹ 2,50,000" : "₹ 75,000"],
                  ["Network", index ? "Visa" : "RuPay"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border bg-secondary p-3">
                    <p className="text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline">Set PIN</Button>
                <Button variant="outline">Limits</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const fields = [
    ["Full name", ACCOUNT_HOLDER],
    ["Customer ID", "MAHA12345"],
    ["Email", "salla.bharath@example.com"],
    ["Mobile", "+91 98765 43210"],
    ["PAN", "ABCDE1234F"],
    ["Aadhaar", "XXXX XXXX 4521"],
    ["Address", "Flat 402, Sahyadri Heights, Hyderabad 500001"],
    ["Branch", BRANCH],
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Profile" subtitle="Customer information and verification status" icon={User} />
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="grid gap-4 border-b pb-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <div className="grid size-20 place-items-center rounded-lg bg-primary font-display text-2xl font-black text-primary-foreground">SB</div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-bold">{ACCOUNT_HOLDER}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Premium Customer • Since 2018</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary"><BadgeCheck className="mr-1 size-3" /> KYC Verified</Badge>
                <Badge variant="secondary"><ShieldCheck className="mr-1 size-3" /> Active</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-md border bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-5">
      <PageTitle title="Settings" subtitle="Security, alerts and device controls" icon={Settings} />
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { title: "Login password", desc: "Change your banking password", icon: LockKeyhole },
          { title: "Biometric sign-in", desc: "Manage fingerprint and Face ID", icon: Fingerprint },
          { title: "Mobile alerts", desc: "SMS, email and push controls", icon: Smartphone },
          { title: "Security centre", desc: "Devices, sessions and risk checks", icon: ShieldCheck },
        ].map((item) => (
          <Card key={item.title} className="shadow-sm">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary"><item.icon className="size-5" /></div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServicePage({ title, subtitle, icon: Icon, items }: { title: string; subtitle: string; icon: typeof LayoutDashboard; items: string[] }) {
  return (
    <div className="space-y-5">
      <PageTitle title={title} subtitle={subtitle} icon={Icon} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item} className="shadow-sm transition hover:border-primary/40 hover:bg-accent">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Icon className="size-5" /></div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item}</p>
                <p className="text-sm text-muted-foreground">Tap to proceed</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardContent className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
          <ShieldCheck className="size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">All actions are protected with secure authorization and session checks.</p>
        </CardContent>
      </Card>
    </div>
  );
}