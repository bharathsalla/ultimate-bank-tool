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
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

  const norm = (k: string) => k.toLowerCase().replace(/[^a-z]/g, "");
  const getVal = (row: Record<string, any>, keys: string[]) => {
    for (const key of Object.keys(row)) {
      const nk = norm(key);
      if (keys.some(k => nk === norm(k) || nk.includes(norm(k)))) {
        return row[key];
      }
    }
    return "";
  };
  const numVal = (v: any): number => {
    if (v === "" || v == null) return 0;
    if (typeof v === "number") return v;
    return Number(String(v).replace(/[,₹\s]/g, "")) || 0;
  };

  let runningBal = 0;
  return rows.map((r, i) => {
    const rawDate = getVal(r, ["date"]);
    let dt: Date;
    if (rawDate instanceof Date) dt = rawDate;
    else if (typeof rawDate === "string" && rawDate) {
      const parts = rawDate.split(/[\/\-]/);
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        dt = new Date(y < 100 ? 2000 + y : y, m - 1, d);
      } else dt = new Date(rawDate);
    } else dt = new Date();

    const debit = numVal(getVal(r, ["debit", "withdrawal"]));
    const credit = numVal(getVal(r, ["credit", "deposit"]));
    const balance = numVal(getVal(r, ["balance"]));
    runningBal = balance || (runningBal + credit - debit);

    return {
      id: `UP-${i}`,
      date: dt.toISOString(),
      description: String(getVal(r, ["particulars", "description", "narration"]) || "Transaction"),
      type: credit > 0 ? "credit" : "debit",
      amount: credit > 0 ? credit : debit,
      balance: runningBal,
      mode: String(getVal(r, ["type", "mode"]) || "Txn"),
      reference: String(getVal(r, ["cheque", "reference", "ref"]) || ""),
      channel: String(getVal(r, ["channel"]) || ""),
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
