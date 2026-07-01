import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  HeadphonesIcon,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  Phone,
  PiggyBank,
  Power,
  Receipt,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  head: () => ({ meta: [{ title: "Net Banking — Bank of Maharashtra" }] }),
  component: Dashboard,
});

type Tab =
  | "overview"
  | "accounts"
  | "transfers"
  | "cards"
  | "deposits"
  | "bills"
  | "loans"
  | "invest"
  | "insure"
  | "statements"
  | "profile"
  | "settings";

type StatementType = "all" | "credit" | "debit";

const TOP_NAV: { id: Tab; label: string }[] = [
  { id: "overview", label: "Home" },
  { id: "accounts", label: "Accounts" },
  { id: "transfers", label: "Send Money" },
  { id: "cards", label: "Cards" },
  { id: "deposits", label: "FD/RD" },
  { id: "bills", label: "Bill & Recharges" },
  { id: "loans", label: "Loans" },
  { id: "invest", label: "Invest" },
  { id: "insure", label: "Insure" },
];

const money = (amount: number) => formatINR(amount).replace("₹", "₹ ");

const PAGE_META: Record<Tab, { title: string; sub: string }> = {
  overview: { title: "Welcome back", sub: "Your net banking dashboard" },
  accounts: { title: "Accounts", sub: "Balance, statement & account services" },
  transfers: { title: "Send Money", sub: "Transfers, UPI, NEFT/RTGS & IMPS" },
  cards: { title: "Cards", sub: "Debit and credit card management" },
  deposits: { title: "FD / RD", sub: "Fixed and recurring deposits" },
  bills: { title: "Bill & Recharges", sub: "Utility payments and recharges" },
  loans: { title: "Loans", sub: "Manage and apply for credit products" },
  invest: { title: "Invest", sub: "Mutual funds, bonds & demat" },
  insure: { title: "Insure", sub: "Life, health and general insurance" },
  statements: { title: "Services & Support", sub: "Statements and self-service tools" },
  profile: { title: "My Profile", sub: "Personal information & KYC" },
  settings: { title: "Settings", sub: "Security, alerts and preferences" },
};

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

  const meta = PAGE_META[tab];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.97_0.008_245)] text-foreground">
      {/* Top brand bar */}
      <div className="bg-[oklch(0.19_0.06_255)] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-5 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
          <div className="flex shrink-0 items-center gap-2">
            <img src={bomLogo} alt="Bank of Maharashtra" className="h-8 w-auto" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:inline">| Net Banking</span>
          </div>

          <div className="mx-2 hidden max-w-xl flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-foreground md:flex">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Book Deposit / Download Form 16 / etc."
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => pickTab("statements")}
              className="hidden items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 md:inline-flex"
            >
              <HeadphonesIcon className="size-4" /> Services & Support
            </button>
            <button className="relative grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label="Notifications">
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[oklch(0.62_0.22_25)] text-[9px] font-bold">1</span>
            </button>
            <button
              onClick={handleLogout}
              className="grid size-9 place-items-center rounded-full hover:bg-white/10"
              aria-label="Logout"
            >
              <Power className="size-4" />
            </button>
            <div className="hidden items-center gap-2 border-l border-white/20 pl-3 md:flex">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-bold">SB</div>
              <div className="hidden leading-tight lg:block">
                <p className="text-xs font-semibold">{ACCOUNT_HOLDER.split(" ")[0]}</p>
                <p className="text-[10px] text-white/70">MAHA12345</p>
              </div>
              <ChevronDown className="size-3 opacity-70" />
            </div>
          </div>
        </div>

        {/* Horizontal primary nav */}
        <nav className="border-t border-white/10">
          <div className="mx-auto hidden max-w-7xl items-center gap-1 px-3 sm:px-5 lg:flex lg:px-8">
            {TOP_NAV.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => pickTab(item.id)}
                  className={`relative flex items-center gap-1 px-4 py-3 text-[13px] font-medium transition ${
                    active ? "text-white" : "text-white/75 hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-[3px] rounded-t bg-[oklch(0.68_0.16_60)]" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Hero band with page title */}
        <div className="border-t border-white/10 bg-[oklch(0.17_0.06_255)]">
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-6 sm:px-5 lg:px-8">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold sm:text-3xl">{meta.title}</h1>
              <p className="mt-1 truncate text-xs text-white/70 sm:text-sm">{meta.sub}</p>
            </div>
            <button className="hidden items-center gap-2 rounded-md bg-[oklch(0.48_0.19_260)] px-4 py-2 text-xs font-semibold hover:bg-[oklch(0.55_0.19_260)] sm:inline-flex">
              Track Raised Requests <ChevronDown className="size-3" />
            </button>
          </div>
          <div className="mx-auto flex max-w-7xl gap-6 px-3 sm:px-5 lg:px-8">
            <button className="border-b-2 border-white pb-3 text-sm font-semibold">Services</button>
            <button className="border-b-2 border-transparent pb-3 text-sm text-white/70 hover:text-white">Contact Us</button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-80 max-w-[88vw] p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle className="flex min-w-0 items-center gap-2 text-primary">
              <img src={bomLogo} alt="" className="h-8 w-auto shrink-0" />
              <span className="truncate text-sm font-semibold uppercase tracking-wider">Net Banking</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2">
            {TOP_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => pickTab(item.id)}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium ${
                  tab === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="size-4 opacity-60" />
              </button>
            ))}
            <div className="my-2 border-t" />
            {[
              { id: "statements" as Tab, label: "Statements & Support" },
              { id: "profile" as Tab, label: "My Profile" },
              { id: "settings" as Tab, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => pickTab(item.id)}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium ${
                  tab === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="size-4 opacity-60" />
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Body */}
      <main className="mx-auto -mt-6 grid w-full max-w-7xl gap-5 px-3 pb-10 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section className="min-w-0">
          {tab === "overview" && <Overview onJump={pickTab} />}
          {tab === "accounts" && <Accounts />}
          {tab === "statements" && <Accounts startOpen />}
          {tab === "transfers" && <ServicePage groups={TRANSFER_GROUPS} />}
          {tab === "cards" && <Cards />}
          {tab === "deposits" && <Deposits />}
          {tab === "bills" && <ServicePage groups={BILLS_GROUPS} />}
          {tab === "loans" && <ServicePage groups={LOAN_GROUPS} />}
          {tab === "invest" && <ServicePage groups={INVEST_GROUPS} />}
          {tab === "insure" && <ServicePage groups={INSURE_GROUPS} />}
          {tab === "profile" && <Profile />}
          {tab === "settings" && <SettingsPanel />}
        </section>

        <aside className="space-y-4">
          <QuickLinks onJump={pickTab} />
          <PromoCard />
          <SupportCard />
        </aside>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-3 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-5 lg:px-8">
          <p>© {new Date().getFullYear()} Bank of Maharashtra. All rights reserved.</p>
          <p>Toll-free 1800-233-4526 · care@mahabank.co.in · IFSC {IFSC}</p>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------- Right rail widgets --------------------------- */

function QuickLinks({ onJump }: { onJump: (tab: Tab) => void }) {
  const links: { label: string; icon: typeof Phone; tab?: Tab }[] = [
    { label: "Do Not Call", icon: Phone },
    { label: "Message Us", icon: HeadphonesIcon, tab: "statements" },
    { label: "Branch Locator", icon: MapPin },
    { label: "ATMs near me", icon: MapPin },
    { label: "Forms Centre", icon: FileText, tab: "statements" },
    { label: "Report an issue/bug", icon: Shield },
  ];
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <div className="bg-[oklch(0.94_0.02_245)] px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
      </div>
      <CardContent className="divide-y p-0">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => link.tab && onJump(link.tab)}
            className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm text-primary hover:bg-accent"
          >
            <span className="flex items-center gap-3">
              <link.icon className="size-4 text-primary" />
              {link.label}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function PromoCard() {
  return (
    <Card className="overflow-hidden border-none text-white shadow-sm">
      <div className="bg-gradient-to-br from-[oklch(0.55_0.19_285)] to-[oklch(0.38_0.19_275)] p-5">
        <div className="grid size-10 place-items-center rounded-md bg-white/15">
          <Sparkles className="size-5" />
        </div>
        <p className="mt-3 text-xs opacity-80">Get instant funds with</p>
        <h4 className="text-xl font-bold leading-tight">Bank of Maharashtra Pre-approved Personal Loan</h4>
        <Button variant="secondary" size="sm" className="mt-4 bg-white text-primary hover:bg-white/90">
          Apply Now
        </Button>
      </div>
    </Card>
  );
}

function SupportCard() {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold">24×7 Assistance</h3>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4 text-primary" /> 1800-233-4526</p>
          <p className="flex items-center gap-2 text-muted-foreground"><HeadphonesIcon className="size-4 text-primary" /> care@mahabank.co.in</p>
          <p className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Report unauthorised txn</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Overview -------------------------------- */

function Overview({ onJump }: { onJump: (tab: Tab) => void }) {
  const [hidden, setHidden] = useState(false);
  const recent = useMemo(() => generateTransactions(2).slice(0, 5), []);
  const quick: { label: string; tab: Tab; icon: typeof ArrowLeftRight }[] = [
    { label: "Send Money", tab: "transfers", icon: ArrowLeftRight },
    { label: "Statement", tab: "statements", icon: FileText },
    { label: "Open FD", tab: "deposits", icon: PiggyBank },
    { label: "Pay Bills", tab: "bills", icon: Receipt },
    { label: "Cards", tab: "cards", icon: CreditCard },
    { label: "Invest", tab: "invest", icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="p-5 sm:p-6">
            <Badge variant="secondary" className="rounded-sm">Savings Account · Active</Badge>
            <h2 className="mt-3 text-lg font-semibold">{ACCOUNT_HOLDER}</h2>
            <p className="text-xs text-muted-foreground">A/c {ACCOUNT_NUMBER} · {BRANCH}</p>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-3xl font-bold text-primary sm:text-4xl">{hidden ? "₹ •••••••" : money(ACCOUNT_BALANCE)}</p>
              <Button variant="ghost" size="icon" onClick={() => setHidden((v) => !v)}>
                {hidden ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Available Balance</p>
          </div>
          <div className="border-t bg-[oklch(0.97_0.01_245)] p-4 sm:border-l sm:border-t-0 sm:p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-2">
              {quick.slice(0, 4).map((q) => (
                <button
                  key={q.label}
                  onClick={() => onJump(q.tab)}
                  className="grid gap-1 rounded-lg border bg-white p-3 text-center hover:border-primary/40"
                >
                  <q.icon className="mx-auto size-4 text-primary" />
                  <span className="text-[11px] font-semibold">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <SectionCard title="All Banking Services" search>
        <ServiceGroup
          icon={Wallet}
          title="Accounts"
          links={[
            { label: "Manage Account Nominee", tab: "profile" },
            { label: "Manage e-Statement", tab: "statements" },
            { label: "Download Interest Certificate", tab: "statements" },
            { label: "Safe Deposit Locker" },
            { label: "Sweep-In & OD against FD", tab: "deposits" },
            { label: "View Hold Transactions", tab: "statements" },
            { label: "Manage Primary Account", tab: "profile" },
          ]}
          onJump={onJump}
        />
        <ServiceGroup
          icon={ArrowLeftRight}
          title="Send Money"
          subtitle="Own Account Transfer, Send money to payee, Customise Transfer Limit and more"
          links={[
            { label: "Within Bank Transfer", tab: "transfers" },
            { label: "NEFT / RTGS", tab: "transfers" },
            { label: "IMPS Instant", tab: "transfers" },
            { label: "Manage Beneficiaries", tab: "transfers" },
          ]}
          onJump={onJump}
          collapsible
        />
        <ServiceGroup
          icon={Receipt}
          title="Cheque / DD / Cash"
          subtitle="View Cheque Status, Stop Cheque Payment, Request New Cheque book and more"
          links={[
            { label: "Cheque Status", tab: "statements" },
            { label: "Stop Cheque Payment", tab: "statements" },
            { label: "Request Cheque Book", tab: "statements" },
          ]}
          onJump={onJump}
          collapsible
        />
      </SectionCard>

      <SectionCard title="Recent Activity" action={{ label: "View statement", onClick: () => onJump("statements") }}>
        <div className="divide-y">
          {recent.map((txn) => (
            <TransactionLine key={txn.id} txn={txn} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------ Reusable section building ------------------------ */

function SectionCard({
  title,
  children,
  search,
  action,
}: {
  title: string;
  children: React.ReactNode;
  search?: boolean;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Card className="border-none shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {search && (
          <div className="flex min-w-0 flex-1 justify-end sm:max-w-xs">
            <div className="flex w-full items-center gap-2 rounded-md border bg-white px-3 py-1.5">
              <Search className="size-4 text-muted-foreground" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder='Search e.g. "Update Email ID"' />
            </div>
          </div>
        )}
        {action && (
          <button onClick={action.onClick} className="text-xs font-semibold text-primary hover:underline">
            {action.label} →
          </button>
        )}
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

type ServiceLink = { label: string; tab?: Tab };

function ServiceGroup({
  icon: Icon,
  title,
  subtitle,
  links,
  onJump,
  collapsible = false,
}: {
  icon: typeof Wallet;
  title: string;
  subtitle?: string;
  links: ServiceLink[];
  onJump: (tab: Tab) => void;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[oklch(0.95_0.03_255)] text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid gap-x-6 gap-y-2 px-5 pb-5 sm:grid-cols-2">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => link.tab && onJump(link.tab)}
              className="text-left text-sm font-medium text-primary hover:underline"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Accounts -------------------------------- */

function Accounts({ startOpen = false }: { startOpen?: boolean }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Savings Account Summary">
        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <Badge variant="secondary" className="rounded-sm">Primary Account</Badge>
            <h2 className="mt-3 text-xl font-semibold">{ACCOUNT_HOLDER}</h2>
            <p className="mt-1 text-sm text-muted-foreground">A/c No: {ACCOUNT_NUMBER}</p>
            <p className="mt-1 text-xs text-muted-foreground">{BRANCH} · IFSC {IFSC}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">Available balance</p>
            <p className="mt-1 text-3xl font-bold text-primary sm:text-4xl">{money(ACCOUNT_BALANCE)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Forty four lakh fifty five thousand two hundred twelve only</p>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t bg-[oklch(0.97_0.01_245)] sm:grid-cols-4">
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
      </SectionCard>

      <StatementPanel startOpen={startOpen} />
    </div>
  );
}

/* ------------------------------ Statements -------------------------------- */

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
      setUploadError("Upload failed. Try an .xlsx, .xls or .csv file.");
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
    <SectionCard title="Account Statement">
      <div className="space-y-4 p-5">
        <div className="grid gap-3 rounded-md border bg-[oklch(0.97_0.01_245)] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0 flex items-center gap-3">
            <FileSpreadsheet className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Upload Excel Statement</p>
              <p className="text-xs text-muted-foreground">Auto-detects Date, Narration, Debit, Credit, Balance.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload /> Upload Excel
            </Button>
            {uploaded && <Button variant="ghost" size="sm" onClick={clearUpload}><X /> Clear</Button>}
          </div>
          {uploaded && <p className="sm:col-span-2 text-xs text-success">Loaded {uploaded.length} rows from {uploadName}</p>}
          {uploadError && <p className="sm:col-span-2 text-xs text-destructive">{uploadError}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Period</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)} disabled={!!uploaded}>
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
            <Select value={txnType} onValueChange={(v) => setTxnType(v as StatementType)}>
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
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
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
      </div>

      {showStatement && results && <StatementResults results={results} period={period} from={from} to={to} uploaded={!!uploaded} />}
    </SectionCard>
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
    <div className="border-t">
      <div className="grid gap-3 border-b p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <h3 className="truncate text-sm font-semibold">Statement — {results.length} transactions</h3>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => downloadCSV(results, `BoM-Statement-${Date.now()}.csv`)}>
            <Download /> CSV
          </Button>
          <Button size="sm" onClick={() => downloadStatementPDF(results, `BoM-Statement-${Date.now()}.pdf`, period === "custom" ? { from, to } : undefined)}>
            <FileDown /> PDF
          </Button>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            {columns.map((column) => <col key={column} style={{ width: `${100 / columns.length}%` }} />)}
          </colgroup>
          <thead className="bg-[oklch(0.94_0.02_245)] text-xs uppercase text-muted-foreground">
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
        {results.length === 0 && <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">No transactions found</div>}
        {results.map((txn) => (
          <div key={txn.id} className="rounded-md border bg-white p-3">
            {uploadedColumns.length ? (
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => {
                  const value = String(valueFor(txn, column));
                  return (
                    <div key={column} className="min-w-0 rounded bg-[oklch(0.97_0.01_245)] p-2">
                      <p className="truncate text-[10px] font-semibold uppercase text-muted-foreground">{column}</p>
                      <p className={`mt-1 text-xs font-medium ${isNumeric(value) ? "whitespace-nowrap tabular-nums" : "break-words"}`}>{value || "—"}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TransactionLine txn={txn} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionLine({ txn }: { txn: Txn }) {
  const credit = txn.type === "credit";
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3">
      <div className={`grid size-9 shrink-0 place-items-center rounded-full ${credit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
        {credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold">{txn.description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {txn.mode}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`whitespace-nowrap text-sm font-bold tabular-nums ${credit ? "text-success" : "text-destructive"}`}>{credit ? "+" : "−"} {money(txn.amount)}</p>
        <p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground tabular-nums">Bal {money(txn.balance)}</p>
      </div>
    </div>
  );
}

/* ---------------------------- Service pages ------------------------------- */

type ServiceGroupDef = { icon: typeof Wallet; title: string; subtitle?: string; links: string[] };

const TRANSFER_GROUPS: ServiceGroupDef[] = [
  { icon: ArrowLeftRight, title: "Send Money", subtitle: "Own Account, Payee, IMPS, NEFT, RTGS and UPI", links: ["Own Account Transfer", "Send to Payee", "IMPS Instant", "NEFT / RTGS", "UPI Payment", "Manage Beneficiaries"] },
  { icon: Wallet, title: "Scheduled Transfers", links: ["Standing Instructions", "Auto-Debit Mandates", "Scheduled UPI"] },
  { icon: Shield, title: "Limits & Controls", links: ["Customise Transfer Limit", "Cooling Period", "Block Beneficiary"] },
];

const BILLS_GROUPS: ServiceGroupDef[] = [
  { icon: Receipt, title: "Utility Payments", subtitle: "Electricity, Gas, Water, DTH and Broadband", links: ["Electricity", "Piped Gas", "Water", "Landline & Broadband", "DTH Recharge"] },
  { icon: Smartphone, title: "Recharges", links: ["Mobile Postpaid", "Mobile Prepaid", "FASTag Recharge", "Metro Card"] },
  { icon: Building2, title: "Taxes & Fees", links: ["Income Tax", "GST Payment", "Municipal Taxes", "Education Fees"] },
];

const LOAN_GROUPS: ServiceGroupDef[] = [
  { icon: Home, title: "Retail Loans", subtitle: "Home, Personal, Car, Gold and Education", links: ["Home Loan", "Personal Loan", "Vehicle Loan", "Education Loan", "Gold Loan"] },
  { icon: FileText, title: "Loan Servicing", links: ["Loan Statements", "Interest Certificate", "Foreclosure", "Repayment Schedule"] },
];

const INVEST_GROUPS: ServiceGroupDef[] = [
  { icon: TrendingUp, title: "Mutual Funds", subtitle: "SIP, lumpsum and goal-based investing", links: ["Start SIP", "Lumpsum Invest", "My Portfolio", "Redeem"] },
  { icon: PiggyBank, title: "Bonds & Deposits", links: ["Sovereign Gold Bond", "RBI Floating Bond", "Tax-Free Bonds", "Corporate FDs"] },
  { icon: CreditCard, title: "Demat & Trading", links: ["Open Demat", "Equity Trading", "IPO Application", "Holding Statement"] },
];

const INSURE_GROUPS: ServiceGroupDef[] = [
  { icon: Shield, title: "Life Insurance", links: ["Term Plan", "ULIP", "Endowment", "Pension Plan"] },
  { icon: BadgeCheck, title: "Health Insurance", links: ["Individual Health", "Family Floater", "Critical Illness", "Top-up Plan"] },
  { icon: Building2, title: "General Insurance", links: ["Motor Insurance", "Home Insurance", "Travel Insurance", "Cyber Insurance"] },
];

function ServicePage({ groups }: { groups: ServiceGroupDef[] }) {
  return (
    <SectionCard title="All Banking Services" search>
      {groups.map((group, idx) => (
        <ServiceGroup
          key={group.title}
          icon={group.icon}
          title={group.title}
          subtitle={group.subtitle}
          links={group.links.map((label) => ({ label }))}
          onJump={() => {}}
          collapsible={idx > 0}
        />
      ))}
    </SectionCard>
  );
}

/* -------------------------------- Cards ---------------------------------- */

function Cards() {
  return (
    <div className="space-y-5">
      <SectionCard title="My Cards">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {[
            { name: "RuPay Platinum Debit", num: "4521", brand: "RuPay", limit: "₹ 75,000" },
            { name: "MahaCard Gold Credit", num: "8821", brand: "Visa", limit: "₹ 2,50,000" },
          ].map((card) => (
            <div key={card.name} className="overflow-hidden rounded-lg border">
              <div className="bg-gradient-to-br from-primary to-[oklch(0.42_0.17_270)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest opacity-80">{card.brand}</p>
                  <CreditCard className="size-6 opacity-80" />
                </div>
                <p className="mt-6 font-mono text-lg tracking-widest">**** **** **** {card.num}</p>
                <div className="mt-4 flex items-end justify-between text-xs">
                  <div>
                    <p className="opacity-70">Card Holder</p>
                    <p className="font-semibold">{ACCOUNT_HOLDER}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-70">Limit</p>
                    <p className="font-semibold">{card.limit}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x bg-white">
                {["Set PIN", "Limits", "Block"].map((action) => (
                  <button key={action} className="py-3 text-xs font-semibold text-primary hover:bg-accent">{action}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <ServicePage groups={[
        { icon: CreditCard, title: "Card Services", subtitle: "Manage PIN, limits, statements and rewards", links: ["Change ATM PIN", "Set Domestic/International Limits", "Card Statement", "Rewards Catalogue", "Add-on Card"] },
        { icon: Shield, title: "Safety & Controls", links: ["Block/Unblock Card", "Report Lost/Stolen", "Dispute Transaction", "Chargeback"] },
      ]} />
    </div>
  );
}

/* ------------------------------ Deposits --------------------------------- */

function Deposits() {
  return (
    <div className="space-y-5">
      <SectionCard title="Open a Deposit">
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {[
            { title: "Fixed Deposit", rate: "7.25%", tenor: "1 - 10 years", body: "Premium rates with flexible payouts." },
            { title: "Recurring Deposit", rate: "6.75%", tenor: "6 mo - 10 yrs", body: "Disciplined monthly savings." },
            { title: "Tax Saver FD", rate: "7.00%", tenor: "5 years", body: "Save tax under 80C up to ₹1.5L." },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border p-5">
              <PiggyBank className="size-6 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-2xl font-bold text-primary">{item.rate}<span className="text-xs font-medium text-muted-foreground"> p.a.</span></p>
              <p className="text-xs text-muted-foreground">Tenure {item.tenor}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              <Button className="mt-4 w-full" size="sm">Open now</Button>
            </div>
          ))}
        </div>
      </SectionCard>
      <ServicePage groups={[
        { icon: PiggyBank, title: "Deposit Services", subtitle: "Manage FD, RD and view interest certificates", links: ["Open FD", "Open RD", "Close FD Prematurely", "Interest Certificate", "Auto-Renew Preferences"] },
      ]} />
    </div>
  );
}

/* ------------------------------ Profile ---------------------------------- */

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
      <SectionCard title="Customer Profile">
        <div className="grid gap-4 border-b p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="grid size-16 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">SB</div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{ACCOUNT_HOLDER}</h2>
            <p className="text-xs text-muted-foreground">Premium Customer · Since 2018</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary"><BadgeCheck className="mr-1 size-3" /> KYC Verified</Badge>
              <Badge variant="secondary"><ShieldCheck className="mr-1 size-3" /> Active</Badge>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-md border bg-[oklch(0.97_0.01_245)] p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------------ Settings --------------------------------- */

function SettingsPanel() {
  const items = [
    { title: "Login password", desc: "Change your banking password", icon: LockKeyhole },
    { title: "Biometric sign-in", desc: "Manage fingerprint and Face ID", icon: Fingerprint },
    { title: "Mobile alerts", desc: "SMS, email and push controls", icon: Smartphone },
    { title: "Security centre", desc: "Devices, sessions and risk checks", icon: ShieldCheck },
  ];
  return (
    <SectionCard title="Settings & Security">
      <div className="divide-y">
        {items.map((item) => (
          <button key={item.title} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 text-left hover:bg-accent">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-[oklch(0.95_0.03_255)] text-primary">
              <item.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
