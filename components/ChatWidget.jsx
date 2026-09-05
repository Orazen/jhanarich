"use client";
import { useEffect, useRef, useState } from "react";

const WaIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
);

const QUICK = ["What is triply?", "Do you do OEM?", "Show non-stick", "Pricing & MOQ"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { who: "ai", text: "Hey! I'm JHANA — the JHANARICH workshop assistant. Ask me about our series, sizes, coatings, MOQs or OEM.", products: [] },
  ]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { who: "me", text: q }]);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { who: "ai", text: j.reply || j.error || "Something went wrong.", products: j.products || [] }]);
    } catch {
      setMsgs((m) => [...m, { who: "ai", text: "Connection hiccup — try again, or reach us directly on WhatsApp.", products: [] }]);
    }
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      <button
        className={`jh-chat-fab${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Chat with JHANA"
        data-hover
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.4" fill="none"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <>
            <img src="/assets/logo.png" alt="" />
            <span className="dot" />
          </>
        )}
      </button>

      <div className={`jh-chat${open ? " open" : ""}`} role="dialog" aria-label="JHANA assistant">
        <div className="jh-chat-head">
          <img src="/assets/logo.png" alt="" />
          <div>
            <b>JHANA</b>
            <span><i />Online — replies instantly</span>
          </div>
        </div>
        <div className="jh-chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`jh-msg ${m.who}`}>
              {m.text}
              {m.products?.length > 0 && (
                <div className="jh-prods">
                  {m.products.map((p, k) => (
                    <a key={k} href="#products" onClick={() => setOpen(false)} className="jh-prod">
                      {p.image && !p.image.startsWith("svg:") && <img src={p.image} alt="" />}
                      <div><b>{p.name}</b><span>{p.category}</span></div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="jh-msg ai typing"><i></i><i></i><i></i></div>}
        </div>
        <div className="jh-quick">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
        <form
          className="jh-chat-input"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, OEM, pricing…"
            maxLength={500}
          />
          <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.4 20.4L20.9 12 3.4 3.6l-.01 6.53L14 12 3.39 13.87z"/></svg>
          </button>
        </form>
        <a
          className="jh-wa"
          href={`https://wa.me/919440121743?text=${encodeURIComponent("Hello JHANARICH! (from JHANA chat)")}`}
          target="_blank"
          rel="noopener"
        >
          <WaIcon /> Continue on WhatsApp
        </a>
      </div>
    </>
  );
}
