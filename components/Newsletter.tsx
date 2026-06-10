"use client";
import { useState } from "react";

export default function Newsletter({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "err">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, source }) });
      const d = await r.json();
      setState(d.ok ? "done" : "err");
    } catch { setState("err"); }
  }
  return (
    <div className="nl">
      <div className="nl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></div>
      <div className="nl-body">
        <b>Get the weekly Vegas deals digest</b>
        <p>New happy hours, price drops, and what is actually worth your money this week. Free, no spam.</p>
        {state === "done" ? (
          <div className="nl-done">You are in! Check your inbox to confirm.</div>
        ) : (
          <form className="nl-form" onSubmit={submit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            <button disabled={state === "loading"}>{state === "loading" ? "..." : "Subscribe"}</button>
          </form>
        )}
        {state === "err" && <div className="nl-err">Something went wrong. Please try again.</div>}
        <span className="nl-powered">Powered by beehiiv</span>
      </div>
    </div>
  );
}
