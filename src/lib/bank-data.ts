export const ACCOUNT_BALANCE = 4455212; // ₹44,55,212
export const ACCOUNT_HOLDER = "Salla Bharath Kumar";
export const ACCOUNT_NUMBER = "60412238907";
export const IFSC = "MAHB0001234";
export const BRANCH = "Hyderabad Main Branch";

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export type Txn = {
  id: string;
  date: string; // ISO
  description: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  mode: string;
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
  const header = "Date,Description,Mode,Type,Amount (INR),Balance (INR)\n";
  const rows = txns.map(t =>
    `${new Date(t.date).toLocaleDateString("en-IN")},"${t.description}",${t.mode},${t.type},${t.amount},${t.balance}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
