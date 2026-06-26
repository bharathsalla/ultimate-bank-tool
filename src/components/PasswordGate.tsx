import { useEffect, useState, type ReactNode } from "react";

const KEY = "bom_pwgate";
const PASSWORD = "@$";

export function PasswordGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [ok, setOk] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1") setOk(true);
  }, []);

  if (!mounted) {
    // SSR-safe blank shell — prevents form submitting before hydration
    return <div className="min-h-screen w-full bg-white" />;
  }

  if (ok) return <>{children}</>;

  const submit = () => {
    if (val.trim() === PASSWORD) {
      sessionStorage.setItem(KEY, "1");
      setOk(true);
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white grid place-items-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold text-neutral-800">Enter Password</h1>
        <input
          autoFocus
          type="password"
          value={val}
          onChange={(e) => { setVal(e.target.value); setErr(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          className="mt-4 w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#1463b1]"
          placeholder="Password"
        />
        {err && <p className="mt-2 text-xs text-red-600">Incorrect password</p>}
        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full rounded bg-[#1463b1] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
