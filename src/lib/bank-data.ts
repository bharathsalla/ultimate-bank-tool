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
  sourceColumns?: string[];
  sourceRow?: Record<string, string>;
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
  const uploadedColumns = txns.find((t) => t.sourceColumns?.length)?.sourceColumns;
  if (uploadedColumns?.length) {
    const safe = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = txns.map((txn) => uploadedColumns.map((column) => safe(txn.sourceRow?.[column] ?? "")).join(","));
    const blob = new Blob([uploadedColumns.map(safe).join(",") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    return;
  }

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
  const wb = XLSX.read(data, { type: "array", cellDates: true, WTF: false });
  const sheetName = wb.SheetNames.find((name) => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: true }) as any[][];
    return rows.some((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  });

  if (!sheetName) return [];

  const ws = wb.Sheets[sheetName];
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true, blankrows: false });
  const cleanRows = aoa.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  if (!cleanRows.length) return [];

  const norm = (s: any) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const text = (v: any) => {
    if (v instanceof Date) return v.toLocaleDateString("en-IN");
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)));
    return String(v ?? "").trim();
  };

  const HINTS = [
    "date", "txn", "transaction", "value", "particular", "description", "narration", "remarks",
    "debit", "withdrawal", "withdraw", "dr", "credit", "deposit", "cr", "balance", "amount", "cheque", "reference",
  ];

  let headerIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < Math.min(cleanRows.length, 25); i++) {
    const row = cleanRows[i] || [];
    const normalized = row.map(norm);
    const hints = normalized.filter((c) => HINTS.some((h) => c === h || c.includes(h))).length;
    const filled = row.filter((c) => String(c ?? "").trim() !== "").length;
    const score = hints * 3 + Math.min(filled, 8);
    if (score > bestScore && filled >= 2) {
      bestScore = score;
      headerIdx = i;
    }
  }

  let headers = (cleanRows[headerIdx] || []).map((c) => text(c));
  // Determine which columns actually contain data (non-empty header OR any non-empty value in body)
  const bodyRowsAll = cleanRows.slice(headerIdx + 1);
  const keepIdx: number[] = [];
  const maxCols = Math.max(headers.length, ...bodyRowsAll.map((r) => r.length));
  for (let c = 0; c < maxCols; c++) {
    const headerHas = (headers[c] ?? "").trim() !== "";
    const bodyHas = bodyRowsAll.some((r) => String(r[c] ?? "").trim() !== "");
    if (headerHas && bodyHas) keepIdx.push(c);
  }
  if (!keepIdx.length) return [];

  const seen = new Map<string, number>();
  headers = keepIdx.map((c) => {
    const base = (headers[c] || "").trim() || `Column ${c + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base} ${count + 1}` : base;
  });


  const rows = cleanRows.slice(headerIdx + 1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  if (!rows.length) return [];

  const colIdx = (...keys: string[]) => {
    const wanted = keys.map(norm);
    for (let i = 0; i < headers.length; i++) {
      const h = norm(headers[i]);
      if (!h) continue;
      if (wanted.some((k) => h === k || (k.length > 2 && h.includes(k)))) return i;
    }
    return -1;
  };

  const iDate = colIdx("date", "txndate", "transactiondate", "posteddate", "postingdate", "valuedate", "dateoftransaction");
  const iDesc = colIdx("particulars", "description", "narration", "transactionremarks", "details", "remarks", "transactiondetails");
  const iDebit = colIdx("debit", "withdrawal", "withdrawals", "withdrawalamt", "withdrawalamount", "debitamount", "dramount");
  const iCredit = colIdx("credit", "deposit", "deposits", "depositamt", "depositamount", "creditamount", "cramount");
  const iAmount = colIdx("amount", "transactionamount", "txnamount");
  const iBal = colIdx("balance", "runningbalance", "closingbalance", "availablebalance");
  const iMode = colIdx("type", "mode", "txntype", "transactiontype", "drcr");
  const iRef = colIdx("cheque", "chequeno", "chequenumber", "reference", "referenceno", "refno", "utr", "rrn");
  const iChan = colIdx("channel", "branch", "terminal", "source");

  const numVal = (v: any): number => {
    if (v === "" || v == null) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const raw = String(v).trim();
    if (!raw || raw === "-" || raw === "—") return 0;
    const negative = /\bdr\b|debit|withdraw/i.test(raw) || /^-/.test(raw) || /^\(.+\)$/.test(raw);
    let s = raw
      .replace(/\((.+)\)/, "$1")
      .replace(/[₹$€£,\s]/g, "")
      .replace(/cr|dr|credit|debit|deposit|withdrawal|withdraw/gi, "")
      .replace(/[–—]/g, "-");
    if (/^\d+\.\d{3},\d{1,2}$/.test(s)) s = s.replace(".", "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? Math.abs(n) * (negative ? -1 : 1) : 0;
  };

  const parseDate = (v: any, row: any[]): Date => {
    const tryOne = (value: any): Date | null => {
      if (value instanceof Date && !isNaN(+value)) return value;
      if (typeof value === "number" && value > 25000 && value < 80000) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
      }
      const s = String(value ?? "").trim();
      if (!s) return null;
      const numericSerial = Number(s);
      if (Number.isFinite(numericSerial) && numericSerial > 25000 && numericSerial < 80000) {
        const parsed = XLSX.SSF.parse_date_code(numericSerial);
        if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
      }
      const short = s.split(/\s+/)[0];
      const dm = short.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
      if (dm) {
        const [, d, mo, y] = dm;
        const yr = Number(y) < 100 ? 2000 + Number(y) : Number(y);
        return new Date(yr, Number(mo) - 1, Number(d));
      }
      const md = short.match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/);
      if (md) {
        const [, d, mon, y] = md;
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = months.findIndex((m) => mon.toLowerCase().startsWith(m));
        if (month >= 0) return new Date(Number(y) < 100 ? 2000 + Number(y) : Number(y), month, Number(d));
      }
      const dt = new Date(s);
      return isNaN(+dt) ? null : dt;
    };

    const direct = tryOne(v);
    if (direct) return direct;
    for (const cell of row.slice(0, 4)) {
      const guessed = tryOne(cell);
      if (guessed) return guessed;
    }
    return new Date();
  };

  const fallbackDesc = (row: any[]) => row
    .map((cell, idx) => ({ cell: text(cell), idx }))
    .filter(({ cell, idx }) => cell && ![iDate, iDebit, iCredit, iAmount, iBal].includes(idx))
    .map(({ cell }) => cell)
    .slice(0, 3)
    .join(" • ") || "Transaction";

  let runningBal = 0;
  return rows.map((row, i) => {
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h] = text(row[idx]); });

    const debitRaw = iDebit >= 0 ? numVal(row[iDebit]) : 0;
    const creditRaw = iCredit >= 0 ? numVal(row[iCredit]) : 0;
    const amountRaw = iAmount >= 0 ? numVal(row[iAmount]) : 0;
    const modeCell = String((iMode >= 0 ? row[iMode] : "") ?? "");

    let type: "credit" | "debit" = "debit";
    let amount = 0;
    if (creditRaw > 0 || debitRaw > 0) {
      amount = Math.abs(creditRaw > 0 ? creditRaw : debitRaw);
      type = creditRaw > 0 ? "credit" : "debit";
    } else if (amountRaw !== 0) {
      const modeSaysDebit = /\bdr\b|debit|withdraw/i.test(modeCell);
      const modeSaysCredit = /\bcr\b|credit|deposit/i.test(modeCell);
      type = amountRaw < 0 || modeSaysDebit ? "debit" : modeSaysCredit ? "credit" : "credit";
      amount = Math.abs(amountRaw);
    }

    const balance = iBal >= 0 ? Math.abs(numVal(row[iBal])) : 0;
    runningBal = balance || (runningBal + (type === "credit" ? amount : -amount));
    const date = parseDate(iDate >= 0 ? row[iDate] : "", row);

    return {
      id: `UP-${sheetName}-${i}-${date.getTime()}`,
      date: date.toISOString(),
      description: String((iDesc >= 0 ? text(row[iDesc]) : "") || fallbackDesc(row)),
      type,
      amount,
      balance: runningBal,
      mode: String(modeCell || (type === "credit" ? "Credit" : "Debit")),
      reference: String((iRef >= 0 ? text(row[iRef]) : "") || ""),
      channel: String((iChan >= 0 ? text(row[iChan]) : "") || ""),
      sourceColumns: headers,
      sourceRow: raw,
    } as Txn;
  }).filter((txn) => txn.description || txn.amount || txn.balance || txn.sourceRow);
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

  const uploadedColumns = sorted.find((t) => t.sourceColumns?.length)?.sourceColumns;
  const statementHead = uploadedColumns?.length
    ? uploadedColumns
    : ["Date", "Type", "Particulars", "Cheque/Reference No", "Debit", "Credit", "Balance", "Channel"];
  const statementBody = uploadedColumns?.length
    ? sorted.map((t) => uploadedColumns.map((column) => t.sourceRow?.[column] ?? ""))
    : sorted.map(t => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.mode,
      t.description,
      t.reference ?? "",
      t.type === "debit" ? formatNum(t.amount) : "",
      t.type === "credit" ? formatNum(t.amount) : "",
      formatNum(t.balance),
      t.channel ?? "",
    ]);
  const tableWidth = pageW - margin * 2;
  const dynamicColumnStyles = uploadedColumns?.length
    ? Object.fromEntries(uploadedColumns.map((_, index) => [index, { cellWidth: tableWidth / uploadedColumns.length }]))
    : {
      0: { halign: "center", cellWidth: 55 },
      1: { halign: "center", cellWidth: 45 },
      2: { cellWidth: "auto" },
      3: { halign: "center", cellWidth: 65 },
      4: { halign: "right", cellWidth: 60 },
      5: { halign: "right", cellWidth: 60 },
      6: { halign: "right", cellWidth: 65 },
      7: { halign: "center", cellWidth: 55 },
    };

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    margin: { left: margin, right: margin },
    theme: "grid",
    tableWidth,
    styles: { fontSize: uploadedColumns && uploadedColumns.length > 8 ? 6 : 8, cellPadding: 3, textColor: 20, lineColor: [180, 200, 220], lineWidth: 0.5, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [219, 232, 244], textColor: 20, fontStyle: "bold", halign: "center" },
    head: [
      [{ content: `Statement for Account No ${ACCOUNT_NUMBER} ${periodLabel}.`, colSpan: statementHead.length, styles: { halign: "center", fontStyle: "bold" } }],
      statementHead,
    ],
    body: statementBody,
    columnStyles: dynamicColumnStyles as any,
    didDrawPage: (data) => {
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(9);
      doc.text(str, pageW / 2, doc.internal.pageSize.getHeight() - 16, { align: "center" });
    },
  });

  doc.save(filename);
}
