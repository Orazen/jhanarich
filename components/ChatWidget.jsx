"use client";
import { useEffect, useRef, useState } from "react";

const WA = "https://wa.me/919440121743";
const WaIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
);

const CATS = ["Triply cookware", "Non-stick cookware", "Stainless steel", "Handles", "Plastic products", "OEM / private label"];
const VOLS = ["Retail", "20–50 pieces", "50–200 pieces", "200+ / bulk", "Not sure yet"];

export default function ChatWidget({ products }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { who: "ai", text: "Hey! I'm JHANA — your JHANARICH specialist. Ask me anything about our cookware, or tap “Get a quote” and I'll set you up in under a minute.", products: [], cta: "quote" },
  ]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  // wizard state: null | {step, name, business, cat, volume, phone}
  const [wiz, setWiz] = useState(null);
  const [wizInput, setWizInput] = useState("");
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open, busy, wiz]);

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
      setMsgs((m) => [...m, { who: "ai", text: "Connection hiccup — try again, or reach us on WhatsApp below.", products: [] }]);
    }
    setBusy(false);
  };

  const startQuote = () => {
    setMsgs((m) => [...m, { who: "ai", text: "Perfect — let's get you a quote. First, what should I call you?", step: "name" }]);
    setWiz({ step: "name" });
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const wizSubmit = (raw) => {
    const val = (raw ?? wizInput).trim();
    if (!val) return;
    setInput(""); setWizInput("");
    setMsgs((m) => [...m, { who: "me", text: val }]);
    const w = { ...wiz, val };

    if (w.step === "name") {
      setWiz({ ...w, step: "business", name: val });
      setMsgs((m) => [...m, { who: "ai", text: `Nice to meet you, ${val.split(" ")[0]}. What best describes you?`, chips: ["Home cook", "Restaurant / hotel", "Retailer", "Distributor", "Building my own brand"] }]);
    } else if (w.step === "business") {
      setWiz({ ...w, step: "cat", business: val });
      setMsgs((m) => [...m, { who: "ai", text: "Got it. Which range interests you?", chips: CATS }]);
    } else if (w.step === "cat") {
      setWiz({ ...w, step: "volume", cat: val });
      setMsgs((m) => [...m, { who: "ai", text: "Great choice. And roughly what volume are you looking at?", chips: VOLS }]);
    } else if (w.step === "volume") {
      setWiz({ ...w, step: "phone", volume: val });
      setMsgs((m) => [...m, { who: "ai", text: "Last thing — your phone number (with country code) so our team can lock in your quote. We reply within one business day.", step: "phone" }]);
    } else if (w.step === "phone") {
      const phone = val.replace(/[^\d+]/g, "");
      setBusy(true);
      fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: w.name, business: w.business, line: w.cat, message: `Volume: ${w.volume}. Phone: ${phone}`, phone, source: "chat-wizard" }),
      })
        .then((j) => {
          setBusy(false);
          setMsgs((m) => [
            ...m,
            {
              who: "ai",
              text: `Done, ${w.name.split(" ")[0]} — your enquiry is booked and the team has been notified. Reference #${(j.id || "").slice(-6).toUpperCase()}.`,
              cta: "wa",
            },
          ]);
          setWiz(null);
        })
        .catch(() => {
          setBusy(false);
          setMsgs((m) => [...m, { who: "ai", text: "Hmm, the connection dropped. Tap below and we'll pick it up on WhatsApp instead.", cta: "wa" }]);
          setWiz(null);
        });
    }
  };

  const chipsClick = (c) => {
    if (wiz && (wiz.step === "business" || wiz.step === "cat" || wiz.step === "volume")) { wizSubmit(c); return; }
    if (c === "Get a quote") { startQuote(); return; }
    send(c);
  };

  const inputPlaceholder = wiz
    ? { name: "Your name…", business: "e.g. Retailer, Hotel…", cat: "e.g. Triply cookware…", volume: "e.g. 50 pieces…", phone: "+91 98xxx xxxxx…" }[wiz.step]
    : "Ask about products, OEM, pricing…";

  return (
    <>
      <button className={`jh-chat-fab${open ? " open" : ""}`} onClick={() => setOpen(!open)} aria-label="Chat with JHANA" data-hover>
        {open ? (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.4" fill="none"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <>
            <img src="/assets/logo.png" alt="" />
            <span className="dot" />
            <span className="fab-tag">Ask JHANA</span>
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
          <span className="jh-badge">AI</span>
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
              {m.cta === "quote" && !wiz && (
                <button className="jh-cta" onClick={startQuote}>Get a quote — 60 seconds</button>
              )}
              {m.cta === "wa" && (
                <a className="jh-cta wa" href={`${WA}?text=${encodeURIComponent("Hi JHANARICH! Continuing my enquiry from JHANA chat.")}`} target="_blank" rel="noopener">
                  <WaIcon size={14} />Continue on WhatsApp
                </a>
              )}
              {m.chips && (
                <div className="jh-chips">
                  {m.chips.map((c) => (
                    <button key={c} onClick={() => chipsClick(c)}>{c}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="jh-msg ai typing"><i></i><i></i><i></i></div>}
        </div>

        {wiz && (
          <div className="jh-wiz-bar">
            {["name", "business", "cat", "volume", "phone"].map((s, i) => (
              <i key={s} className={["name", "business", "cat", "volume"].indexOf(wiz.step) >= i || (wiz.step === "phone" && true) ? "on" : ""} />
            ))}
            <span>{["Your name", "Your role", "Range", "Volume", "Phone"][["name", "business", "cat", "volume", "phone"].indexOf(wiz.step)]}</span>
          </div>
        )}

        <form className="jh-chat-input" onSubmit={(e) => { e.preventDefault(); wiz ? wizSubmit() : send(); }}>
          <input
            ref={inputRef}
            value={wiz ? wizInput : input}
            onChange={(e) => (wiz ? setWizInput(e.target.value) : setInput(e.target.value))}
            placeholder={inputPlaceholder}
            maxLength={500}
          />
          <button type="submit" aria-label="Send" disabled={busy || !(wiz ? wizInput : input).trim()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.4 20.4L20.9 12 3.4 3.6l-.01 6.53L14 12 3.39 13.87z"/></svg>
          </button>
        </form>
        {!wiz && (
          <a className="jh-wa" href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! (from JHANA chat)")}`} target="_blank" rel="noopener">
            <WaIcon /> Continue on WhatsApp
          </a>
        )}
      </div>
    </>
  );
}
