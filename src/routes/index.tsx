import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Accessibility, ArrowRight, Building2, Calculator, CreditCard, Download, Landmark, Lock, Menu, Search, ShieldCheck, Smartphone, Volume2, X } from "lucide-react";
import { login } from "@/lib/auth-store";
import bomLogo from "@/assets/bom-official-logo.png.asset.json";
import heroBg from "@/assets/bom-hero-valley.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bank of Maharashtra — Digital Banking" },
      { name: "description", content: "Bank of Maharashtra demo portal with net banking login, accounts, transfers, deposits, statements and AI-powered tools." },
    ],
  }),
  component: Landing,
});

const primaryNav = ["Personal", "Corporate", "MSME", "Agriculture", "NRI Services", "Treasury", "IBU GIFT"];

const serviceTags = [
  "HOME LOANS", "CAR LOAN", "GOLD LOAN AGAINST ORNAMENTS", "DEPOSIT INTEREST RATES", "LOAN INTEREST RATES",
  "DOWNLOAD FORMS", "HELPLINE", "BANK OF MAHARASHTRA SBI CREDIT CARD", "NETC-FASTAG", "DIGITAL BANKING",
  "ONLINE LOANS", "SAVINGS ACCOUNT", "ONLINE LOCKER APPLICATION", "BOM REWARDS", "RE-KYC", "V-CIP",
  "ONLINE JEEVAN PRAMAAN PATRA SUBMISSION", "IMPORTANT ANNOUNCEMENT FOR SHAREHOLDERS", "NOMINATION",
  "POSITIVE PAY SYSTEM", "KCC JANSAMARTH", "E-OTS", "BHARAT AADHAAR SEEDING ENABLER", "MUDRA LOAN",
  "LODGE A COMPLAINT", "ZEN LYFE APP", "DIGITAL BALANCE CONFIRMATION PORTAL",
];

const ancillaryTags = ["PPF SCHEME", "LC/BG CONFIRMATION", "INSURANCE", "EQUITY TRADING SERVICES", "LOCKERS", "SOVEREIGN GOLD BOND SCHEME", "SENIOR CITIZEN SAVING SCHEME", "SUKANYA SAMRIDDHI YOJANA", "ATAL PENSION YOJANA", "NATIONAL PENSION SYSTEM", "NPS VATSALYA", "DOORSTEP BANKING SERVICES"];

const gallery = [
  ["Best Mid-Sized Bank Award", "Bank of Maharashtra"],
  ["IBA Technology Award under five different categories", "Digital banking excellence"],
  ["Bank receives prestigious award", "Public sector leadership"],
  ["Press Meet — Financial Results for Q4 FY 2025-26", "20th April 2026"],
  ["91st Foundation Day Celebrations 2025", "Pune head office"],
  ["India's Leading Mid-Sized Public Sector Bank Award", "Recognition ceremony"],
];

function Landing() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(userId || "demo-user");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 text-primary-foreground shadow-sm">
        <div className="bg-primary/88 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-[12px]">
            <nav className="hidden items-center md:flex">
              {['Home', 'About Us', 'Locate Us', 'Careers', 'Contact Us'].map((item, idx) => (
                <a key={item} href="#" className={`px-3 py-2 ${idx === 0 ? 'bg-[oklch(0.62_0.17_250)]' : 'hover:bg-primary-foreground/10'}`}>{item}</a>
              ))}
            </nav>
            <div className="flex flex-1 justify-end gap-2">
              <div className="hidden items-center bg-primary-foreground/10 px-3 md:flex">
                <input aria-label="Search" placeholder="Type here to search..." className="h-8 w-44 bg-transparent text-xs outline-none placeholder:text-primary-foreground/75" />
                <Search className="size-4" />
              </div>
              <button className="hidden bg-primary-foreground/10 px-3 py-1.5 md:inline-flex">Skip to Content</button>
              <button className="hidden bg-primary-foreground/10 px-3 py-1.5 md:inline-flex">English</button>
              <button className="bg-primary-foreground px-2 py-1 text-primary">अ A</button>
              <button className="grid size-8 place-items-center rounded-full bg-[oklch(0.62_0.17_250)]"><Accessibility className="size-4" /></button>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.13_0.02_250)]/82 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
            <img src={bomLogo.url} alt="Bank of Maharashtra logo" className="h-12 w-auto object-contain" />
            <nav className="hidden items-center gap-7 text-[13px] lg:flex">
              {primaryNav.map((item) => <a key={item} href="#services" className="hover:text-[oklch(0.78_0.14_80)]">{item}</a>)}
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLogin(true)} className="rounded bg-[oklch(0.52_0.23_265)] px-4 py-2 text-xs font-bold shadow-sm hover:opacity-90">
                🔒 LOG-IN
              </button>
              <button className="p-2"><Menu className="size-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[720px] overflow-hidden pt-24">
          <img src={heroBg} alt="Banking app in green hills" className="absolute inset-0 size-full object-cover" width={1600} height={900} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/72 via-primary-foreground/32 to-transparent" />
          <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center px-4 pb-24">
            <div className="max-w-xl pt-10">
              <h1 className="font-display text-5xl font-black leading-tight text-[oklch(0.42_0.19_290)] md:text-7xl">
                Banking that<br /><span className="text-[oklch(0.42_0.16_240)]">feels like lifestyle!</span>
              </h1>
              <div className="mt-8 flex items-center gap-4">
                <div className="grid size-20 place-items-center rounded-xl bg-[oklch(0.34_0.11_205)] text-center font-display text-xl font-black italic text-[oklch(0.82_0.14_90)] shadow-lg">Zen<br />Lyfe</div>
                <div className="rounded-md bg-[oklch(0.52_0.12_205)]/85 px-6 py-3 text-2xl text-primary-foreground shadow">Making Life Simpler</div>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-5">
                {[['1.5M+', 'Downloads', Download], ['Gesture', 'Friendly Layout', Smartphone], ['Advanced', 'Security', ShieldCheck]].map(([top, bottom, Icon]) => (
                  <div key={String(top)} className="rounded-2xl bg-card/90 px-4 py-7 text-center shadow-lg backdrop-blur">
                    <Icon className="mx-auto mb-3 size-8 text-success" />
                    <div className="text-2xl font-semibold leading-tight text-foreground">{String(top)}</div>
                    <div className="text-xl leading-tight text-foreground">{String(bottom)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <FloatingTools />
        </section>

        <section id="services" className="bg-muted/55 py-12">
          <div className="mx-auto max-w-5xl rounded bg-card p-8 shadow-xl">
            <h2 className="text-center text-2xl font-semibold text-muted-foreground">Bank of Maharashtra</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-[150px_1fr]">
              <h3 className="self-center text-center text-2xl leading-tight text-foreground/80 md:text-right">What are you<br />looking for?</h3>
              <div className="flex flex-wrap gap-2">
                {serviceTags.map((tag, idx) => <ServicePill key={tag} active={idx % 9 === 2 || idx % 11 === 0} label={tag} isNew={idx > 12 && idx % 3 === 0} />)}
              </div>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-[150px_1fr]">
              <h3 className="self-center text-center text-2xl leading-tight text-foreground/80 md:text-right">Ancillary<br />Products</h3>
              <div className="flex flex-wrap gap-2">
                {ancillaryTags.map((tag, idx) => <ServicePill key={tag} active={idx === 10} label={tag} isNew={idx === 10} />)}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-4 text-2xl font-semibold">Photo Gallery</h2>
            <div className="grid overflow-hidden md:grid-cols-[1fr_1fr_1fr_2fr]">
              {gallery.map(([title, caption], idx) => (
                <div key={title} className={`${idx === 3 ? 'md:row-span-2' : ''} relative min-h-40 bg-gradient-to-br from-[oklch(0.71_0.12_235)] via-[oklch(0.45_0.10_230)] to-[oklch(0.18_0.04_250)] p-4 text-primary-foreground`}>
                  <div className="absolute inset-x-0 bottom-0 bg-[oklch(0.13_0.02_250)]/60 p-2 text-sm">{title}<div className="text-lg opacity-90">{caption}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <InfoPanel title="SLBC Maharashtra" items={["About Us", "Banking Network", "Data Submission", "Govt Sponsored Programmes"]} />
              <InfoPanel title="Offers for you" items={["Credit Card Offers", "Digital Banking Offers", "Deposit Campaign", "Insurance Benefits"]} />
              <InfoPanel title="AI Digital Help" items={["Smart search", "Statement insights", "Fraud alerts", "Personalized service shortcuts"]} />
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-4 rounded bg-card/92 p-3 text-xs text-muted-foreground shadow-lg backdrop-blur">
        <span>Bank of Maharashtra uses cookies to enhance your experience. Check our Cookie/Privacy Policy and Terms & Conditions.</span>
        <button className="rounded bg-[oklch(0.52_0.17_240)] px-4 py-2 font-semibold text-primary-foreground">OK</button>
      </div>

      <button className="fixed left-0 top-[72%] z-40 rounded-r bg-destructive px-2 py-3 text-[11px] font-bold text-destructive-foreground [writing-mode:vertical-rl]">ALERT CUSTOMERS!</button>
      <button className="fixed left-0 top-[43%] z-40 grid size-9 place-items-center rounded-r-full bg-[oklch(0.62_0.17_250)] text-primary-foreground"><Volume2 className="size-4" /></button>

      {showLogin && <LoginModal userId={userId} pwd={pwd} setUserId={setUserId} setPwd={setPwd} handleLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function ServicePill({ label, active, isNew }: { label: string; active?: boolean; isNew?: boolean }) {
  return <button className={`rounded border border-[oklch(0.62_0.17_240)] px-3 py-1.5 text-xs ${active ? 'bg-[oklch(0.42_0.14_235)] text-primary-foreground' : 'bg-card text-muted-foreground'}`}>{active ? '🔗 ' : ''}{label}{isNew && <span className="ml-1 rounded bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">NEW</span>}</button>;
}

function FloatingTools() {
  const tools = [[Landmark, "Internet Banking"], [CreditCard, "Interest Rates"], [ArrowRight, "Apply Online"], [Download, "Downloads"], [Calculator, "Calculators"]];
  return <div className="fixed right-0 top-[31%] z-40 hidden w-16 overflow-hidden rounded-l bg-[oklch(0.56_0.18_250)] text-primary-foreground shadow-lg md:block">{tools.map(([Icon, label]) => <button key={String(label)} className="flex w-full flex-col items-center gap-1 border-b border-primary-foreground/20 px-1 py-2 text-[10px]"><Icon className="size-5" />{String(label)}</button>)}</div>;
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return <div className="min-h-52 rounded bg-card p-5 shadow-lg"><h3 className="text-xl font-semibold text-muted-foreground">{title}</h3><div className="mt-4 divide-y border-y">{items.map((item) => <button key={item} className="flex w-full items-center justify-between py-3 text-left text-sm text-muted-foreground"><span>{item}</span><ArrowRight className="size-4 text-[oklch(0.52_0.17_240)]" /></button>)}</div></div>;
}

function LoginModal({ userId, pwd, setUserId, setPwd, handleLogin, onClose }: { userId: string; pwd: string; setUserId: (v: string) => void; setPwd: (v: string) => void; handleLogin: (e: React.FormEvent) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[oklch(0.13_0.02_250)]/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-bold text-primary">Internet Banking Login</h2><p className="text-xs text-muted-foreground">Demo project: enter any ID and password.</p></div>
          <button onClick={onClose} className="p-1 text-muted-foreground"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Customer ID / User ID" className="w-full rounded border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
          <input value={pwd} onChange={e => setPwd(e.target.value)} type="password" placeholder="Password" className="w-full rounded border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Lock className="size-4" /> Login</button>
        </form>
      </div>
    </div>
  );
}