import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import bomLogo from "@/assets/bom-official-logo.png";

export const ACCOUNT_BALANCE = 4455212; // ₹44,55,212
export const ACCOUNT_HOLDER = "Salla Bharath Kumar";
export const ACCOUNT_NUMBER = "60412238907";
export const IFSC = "MAHB0001234";
export const BRANCH = "Hyderabad Main Branch";

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const formatNum = (n: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export type Txn = {
  id: string;
  date: string; // ISO
  description: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  mode: string;
  reference?: string;
  channel?: string;
};

const MONTHLY_DESCS = [
  ["NEFT Credit — Project Consultancy", "credit", 28600, "NEFT"],
  ["UPI/Zomato/Order", "debit", 642, "UPI"],
  ["ATM Withdrawal — FC Road", "debit", 10000, "ATM"],
  ["IMPS to Priya Sharma", "debit", 25000, "IMPS"],
  ["Electricity Bill — MSEDCL", "debit", 3420, "BillPay"],
  ["Mutual Fund SIP — Axis Bluechip", "debit", 15000, "ECS"],
  ["UPI/Amazon/Purchase", "debit", 4599, "UPI"],
  ["Interest Credit — Savings", "credit", 1245, "INT"],
  ["NEFT Credit — Reimbursement", "credit", 18500, "NEFT"],
  ["Fuel — HP Petrol Pump", "debit", 2200, "Card"],
  ["Swiggy Order", "debit", 489, "UPI"],
  ["Rent Payment — Landlord", "debit", 29500, "IMPS"],
  ["Refund — Flipkart", "credit", 1799, "UPI"],
  ["Mobile Recharge — Jio", "debit", 399, "UPI"],
  ["Insurance Premium — LIC", "debit", 8750, "ECS"],
] as const;

export function generateTransactions(months = 6): Txn[] {
  const now = new Date();
  const chronological: Omit<Txn, "balance">[] = [];

  for (let monthOffset = months - 1; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    MONTHLY_DESCS.forEach(([desc, type, amt, mode], idx) => {
      const day = [2, 4, 7, 9, 11, 13, 16, 18, 20, 21, 23, 24, 25, 26, 27][idx];
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 12);
      if (date > now) return;
      const amount = Number(amt) + ((monthOffset + idx) % 5) * 37;
      chronological.push({
        id: `BOM-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, "0")}-${idx}`,
        date: date.toISOString(),
        description: desc as string,
        type: type as "credit" | "debit",
        amount,
        mode: mode as string,
        reference: String(59000 + idx + monthOffset * 13),
        channel: idx % 3 === 0 ? "1091-null" : "1655-null",
      });
    });
  }

  const totalMovement = chronological.reduce((sum, txn) => sum + (txn.type === "credit" ? txn.amount : -txn.amount), 0);
  let balance = ACCOUNT_BALANCE - totalMovement;

  return chronological.map((txn) => {
    balance += txn.type === "credit" ? txn.amount : -txn.amount;
    return { ...txn, balance };
  }).reverse();
}

export function downloadCSV(txns: Txn[], filename: string) {
  const header = "Date,Type,Particulars,Reference,Debit,Credit,Balance,Channel\n";
  const rows = txns.map(t =>
    `${new Date(t.date).toLocaleDateString("en-IN")},${t.mode},"${t.description}",${t.reference ?? ""},${t.type === "debit" ? t.amount : ""},${t.type === "credit" ? t.amount : ""},${t.balance},${t.channel ?? ""}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// =========== Excel Upload Parser ===========
export async function parseExcelTransactions(file: File): Promise<Txn[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });

  const norm = (s: any) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const HINTS = ["date", "particular", "description", "narration", "debit", "credit", "withdrawal", "deposit", "balance", "amount"];

  let headerIdx = 0;
  for (let i = 0; i < Math.min(aoa.length, 15); i++) {
    const row = aoa[i] || [];
    const hits = row.filter((c) => HINTS.some((h) => norm(c).includes(h))).length;
    if (hits >= 2) { headerIdx = i; break; }
  }

  const headers = (aoa[headerIdx] || []).map((c) => String(c ?? ""));
  const rows = aoa.slice(headerIdx + 1).filter((r) => r && r.some((c) => String(c ?? "").trim() !== ""));

  const colIdx = (...keys: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      const nh = norm(headers[i]);
      if (keys.some((k) => nh === norm(k) || nh.includes(norm(k)))) return i;
    }
    return -1;
  };

  const iDate = colIdx("date", "txndate", "transactiondate", "valuedate");
  const iDesc = colIdx("particulars", "description", "narration", "details", "remarks");
  const iDebit = colIdx("debit", "withdrawal", "dr");
  const iCredit = colIdx("credit", "deposit", "cr");
  const iAmount = colIdx("amount");
  const iBal = colIdx("balance", "runningbalance", "closingbalance");
  const iMode = colIdx("type", "mode", "txntype");
  const iRef = colIdx("cheque", "reference", "ref", "chequeno", "refno");
  const iChan = colIdx("channel");

  const numVal = (v: any): number => {
    if (v === "" || v == null) return 0;
    if (typeof v === "number") return v;
    const s = String(v).replace(/[,₹$\s]/g, "").replace(/\((.+)\)/, "-$1");
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };

  const parseDate = (v: any): Date => {
    if (v instanceof Date) return v;
    if (typeof v === "number") {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(epoch.getTime() + v * 86400000);
    }
    if (typeof v === "string" && v.trim()) {
      const s = v.trim();
      const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
      if (m) {
        const [, d, mo, y] = m;
        const yr = Number(y) < 100 ? 2000 + Number(y) : Number(y);
        return new Date(yr, Number(mo) - 1, Number(d));
      }
      const dt = new Date(s);
      if (!isNaN(+dt)) return dt;
    }
    return new Date();
  };

  let runningBal = 0;
  return rows.map((r, i) => {
    const debit = iDebit >= 0 ? numVal(r[iDebit]) : 0;
    const credit = iCredit >= 0 ? numVal(r[iCredit]) : 0;
    let amount = 0;
    let type: "credit" | "debit" = "debit";
    if (credit > 0 || debit > 0) {
      amount = credit > 0 ? credit : debit;
      type = credit > 0 ? "credit" : "debit";
    } else if (iAmount >= 0) {
      const a = numVal(r[iAmount]);
      amount = Math.abs(a);
      type = a >= 0 ? "credit" : "debit";
    }
    const balance = iBal >= 0 ? numVal(r[iBal]) : 0;
    runningBal = balance || (runningBal + (type === "credit" ? amount : -amount));

    return {
      id: `UP-${i}`,
      date: parseDate(iDate >= 0 ? r[iDate] : "").toISOString(),
      description: String((iDesc >= 0 ? r[iDesc] : "") || "Transaction"),
      type,
      amount,
      balance: runningBal,
      mode: String((iMode >= 0 ? r[iMode] : "") || (type === "credit" ? "Credit" : "Debit")),
      reference: String((iRef >= 0 ? r[iRef] : "") || ""),
      channel: String((iChan >= 0 ? r[iChan] : "") || ""),
    } as Txn;
  });
}

// =========== PDF Statement Download (replica of BoM format) ===========
export async function downloadStatementPDF(txns: Txn[], filename: string, opts?: { from?: string; to?: string }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 36;

  // Load logo
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = bomLogo;
  }).catch(() => null);

  if (img) {
    const w = 180, h = (img.height / img.width) * w;
    doc.addImage(img, "PNG", (pageW - w) / 2, 24, w, h);
  }

  let y = 110;

  // Customer + Branch details — two-column table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4, textColor: 20, lineColor: [180, 200, 220], lineWidth: 0.5 },
    head: [["Customer Details", "Branch & Account Details"]],
    headStyles: { fillColor: [219, 232, 244], textColor: 20, fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { cellWidth: (pageW - margin * 2) / 2 }, 1: { cellWidth: (pageW - margin * 2) / 2 } },
    body: [[
      `${ACCOUNT_HOLDER}\nKHATA NO 238/244\nF BLOCK SARASWATI ENCLAVE\nKADIPUR INDUSTRIAL AREA\nHYDERABAD - 500001\nTelangana, India\nMobile : 919876543210\nEmail : salla.bharath@example.com\nDate of Birth : 12/05/1990\nPAN/TAN : ABCDE1234F\n\nStatement Date : ${new Date().toLocaleDateString("en-IN")}`,
      `Branch No : 01234\nBranch IFSC : ${IFSC}\nBranch Name : ${BRANCH}\nBldg No.12, Banjara Hills,\nRoad No 5, Hyderabad - 500034\nBranch GSTIN : 36AACCB0774B2Z7\nAccount No : ${ACCOUNT_NUMBER}\nAccount Type : Savings-Premium\nTotal Balance : ${formatNum(ACCOUNT_BALANCE)}\nClear Balance : ${formatNum(ACCOUNT_BALANCE)}\nPrimary GSTIN: NA`,
    ]],
  });

  const periodLabel = opts?.from && opts?.to
    ? `from ${opts.from} to ${opts.to}`
    : `from ${new Date(txns[txns.length - 1]?.date || Date.now()).toLocaleDateString("en-IN")} to ${new Date(txns[0]?.date || Date.now()).toLocaleDateString("en-IN")}`;

  const sorted = [...txns].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3, textColor: 20, lineColor: [180, 200, 220], lineWidth: 0.5, overflow: "linebreak" },
    headStyles: { fillColor: [219, 232, 244], textColor: 20, fontStyle: "bold", halign: "center" },
    head: [
      [{ content: `Statement for Account No ${ACCOUNT_NUMBER} ${periodLabel}.`, colSpan: 8, styles: { halign: "center", fontStyle: "bold" } }],
      ["Date", "Type", "Particulars", "Cheque/Reference No", "Debit", "Credit", "Balance", "Channel"],
    ],
    body: sorted.map(t => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.mode,
      t.description,
      t.reference ?? "",
      t.type === "debit" ? formatNum(t.amount) : "",
      t.type === "credit" ? formatNum(t.amount) : "",
      formatNum(t.balance),
      t.channel ?? "",
    ]),
    columnStyles: {
      0: { halign: "center", cellWidth: 55 },
      1: { halign: "center", cellWidth: 45 },
      2: { cellWidth: "auto" },
      3: { halign: "center", cellWidth: 65 },
      4: { halign: "right", cellWidth: 60 },
      5: { halign: "right", cellWidth: 60 },
      6: { halign: "right", cellWidth: 65 },
      7: { halign: "center", cellWidth: 55 },
    },
    didDrawPage: (data) => {
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(9);
      doc.text(str, pageW / 2, doc.internal.pageSize.getHeight() - 16, { align: "center" });
    },
  });

  doc.save(filename);
}
