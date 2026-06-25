export const ACCOUNT_BALANCE = 5000235; // ₹50,00,235
export const ACCOUNT_HOLDER = "Rohan Deshmukh";
export const ACCOUNT_NUMBER = "60412238907";
export const IFSC = "MAHB0001234";
export const BRANCH = "Pune Main Branch";

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

const DESCS = [
  ["Salary Credit — Infotech Pvt Ltd", "credit", 185000, "NEFT"],
  ["UPI/Zomato/Order", "debit", 642, "UPI"],
  ["ATM Withdrawal — FC Road", "debit", 10000, "ATM"],
  ["IMPS to Priya Sharma", "debit", 25000, "IMPS"],
  ["Electricity Bill — MSEDCL", "debit", 3420, "BillPay"],
  ["Mutual Fund SIP — Axis Bluechip", "debit", 15000, "ECS"],
  ["UPI/Amazon/Purchase", "debit", 4599, "UPI"],
  ["Interest Credit — Savings", "credit", 1245, "INT"],
  ["NEFT from Father", "credit", 50000, "NEFT"],
  ["Fuel — HP Petrol Pump", "debit", 2200, "Card"],
  ["Swiggy Order", "debit", 489, "UPI"],
  ["Rent Payment — Landlord", "debit", 32000, "IMPS"],
  ["Refund — Flipkart", "credit", 1799, "UPI"],
  ["Mobile Recharge — Jio", "debit", 399, "UPI"],
  ["Insurance Premium — LIC", "debit", 8750, "ECS"],
] as const;

export function generateTransactions(months = 6): Txn[] {
  const txns: Txn[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
  let balance = ACCOUNT_BALANCE - 350000; // approximate starting balance
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  // deterministic pseudo-random
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let d = 0; d <= days; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const count = Math.floor(rand() * 3); // 0-2 per day
    for (let i = 0; i < count; i++) {
      const tpl = DESCS[Math.floor(rand() * DESCS.length)];
      const [desc, type, amt, mode] = tpl;
      const amount = (amt as number) + Math.floor(rand() * 200);
      balance = type === "credit" ? balance + amount : balance - amount;
      txns.push({
        id: `T${d}-${i}-${Math.floor(rand() * 9999)}`,
        date: date.toISOString(),
        description: desc as string,
        type: type as "credit" | "debit",
        amount,
        balance,
        mode: mode as string,
      });
    }
  }
  // adjust last txn to end exactly at ACCOUNT_BALANCE
  if (txns.length) {
    const diff = ACCOUNT_BALANCE - txns[txns.length - 1].balance;
    txns[txns.length - 1].balance = ACCOUNT_BALANCE;
    txns[txns.length - 1].amount += Math.abs(diff);
  }
  return txns.reverse(); // newest first
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
