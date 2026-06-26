import { useEffect, useState, type ReactNode } from "react";
import bomLogo from "@/assets/bom-official-logo.png";

const KEY = "bom_pwgate";
const PASSWORD = "@$";

export function PasswordGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1") setOk(true);
  }, []);

  if (ok) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val === PASSWORD) {
      sessionStorage.setItem(KEY, "1");
      setOk(true);
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <img src={bomLogo} alt="Bank of Maharashtra" className="mx-auto h-16 w-auto object-contain" />
        <h1 className="mt-6 text-lg font-semibold text-neutral-800">Enter Password</h1>
        <input
          autoFocus
          type="password"
          value={val}
          onChange={(e) => { setVal(e.target.value); setErr(false); }}
          className="mt-4 w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#1463b1]"
          placeholder="Password"
        />
        {err && <p className="mt-2 text-xs text-red-600">Incorrect password</p>}
        <button type="submit" className="mt-4 w-full rounded bg-[#1463b1] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Continue
        </button>
      </form>
    </div>
  );
}
