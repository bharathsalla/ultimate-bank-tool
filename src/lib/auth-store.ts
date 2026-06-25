const KEY = "mahabank_auth";
export const login = (_userId?: string) => { if (typeof window !== "undefined") localStorage.setItem(KEY, "1"); };
export const logout = () => { if (typeof window !== "undefined") localStorage.removeItem(KEY); };
export const isAuthed = () => typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
