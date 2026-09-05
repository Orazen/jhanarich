// JHANARICH AI service — catalog-grounded generation with graceful local fallbacks.
// Server-side fetches are SSRF-hardened via lib/urlguard.js: https-only, host allowlist.
import { assertSafeUrl } from "./urlguard.js";

export function getProvider() {
  if (process.env.GEMINI_API_KEY) return { name: "gemini", key: process.env.GEMINI_API_KEY };
  if (process.env.OPENAI_API_KEY) return { name: "openai", key: process.env.OPENAI_API_KEY };
  return null;
}

async function llm(prompt, system) {
  const p = getProvider();
  if (!p) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    let text = null;
    if (p.name === "gemini") {
      assertSafeUrl(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(p.key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
          }),
          signal: ctrl.signal,
        }
      );
      if (res.ok) {
        const j = await res.json();
        text = j?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } else {
      assertSafeUrl(`https://api.openai.com/v1/chat/completions`);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
        signal: ctrl.signal,
      });
      if (res.ok) {
        const j = await res.json();
        text = j?.choices?.[0]?.message?.content || null;
      }
    }
    return text ? text.trim() : null;
  } catch {
    return null; // any failure → caller falls back to local generation
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- product description ---------------- */

const CAT_TRAITS = {
  triply: "triply-bonded steel-aluminium-steel body that heats edge to edge with zero hot spots",
  nonstick: "three-layer PFOA-free non-stick release with a durable granite/matte finish",
  steel: "deep-drawn food-grade stainless steel with a mirror polish that never reacts with food",
  handles: "rivet-ready construction engineered for a lifetime of daily kitchen abuse",
  plastic: "food-grade, BPA-free polymers built for commercial kitchen duty",
};

export function localDescription({ name, category, hints = "" }) {
  const trait = CAT_TRAITS[category] || CAT_TRAITS.triply;
  const finish = /granite/i.test(hints) ? "granite"
    : /spatter/i.test(hints) ? "spatter"
    : /ceramic/i.test(hints) ? "ceramic"
    : /black|matte/i.test(hints) ? "matte"
    : /red|maroon/i.test(hints) ? "signature-colour"
    : "mirror";
  const openings = [
    `The ${name} is built around a ${trait}.`,
    `Engineered for daily service, the ${name} pairs a ${trait}.`,
    `A workshop favourite, the ${name} delivers a ${trait}.`,
  ];
  const idx = [...name].reduce((h, c) => h + c.charCodeAt(0), 0) % openings.length;
  const body =
    category === "handles" || category === "plastic"
      ? `Finished to JHANARICH's export standard and QC-checked batch by batch, it ships retail-ready or under your private label.`
      : `The ${finish} finish shrugs off commercial duty, the induction-ready base works on every cooktop, and every batch passes JHANARICH's strength and food-safety QC before it leaves Visakhapatnam.`;
  const close = `Available in standard sizes with OEM branding and bespoke packaging on request.`;
  return `${openings[idx]} ${body} ${close}`.replace(/\s+/g, " ").trim();
}

export async function generateDescription({ name, category, hints }) {
  const ai = await llm(
    `Write a 2-sentence premium e-commerce description for a cookware product.
Name: ${name}
Category: ${category}
Known details: ${hints || "none"}
Rules: confident, specific, no superlatives-stacking, no emojis, mention material/coating benefits and that OEM/private-label is available. Max 55 words.`,
    "You are the senior copywriter for JHANARICH, an Indian premium cookware manufacturer. Voice: warm, technical, assured."
  );
  const text = ai || localDescription({ name, category, hints });
  return { text, source: ai ? "ai" : "local" };
}

/* ---------------- enquiry triage + reply drafting ---------------- */

const URGENT = /(urgent|immediately|asap|bulk|large (order|qty|quantity)|tender|project|rush)/i;
const HOT_CATS = /(hotel|restaurant|distributor|wholesaler|export)/i;

export function classifyEnquiry(e) {
  const blob = `${e.message || ""} ${e.product || ""} ${e.line || ""} ${e.business || ""}`;
  const urgency = URGENT.test(blob) ? "high" : HOT_CATS.test(e.business || "") ? "medium" : "low";
  let intent = "general";
  if (/oem|private label|our brand|own brand/i.test(blob)) intent = "oem";
  else if (/price|quote|cost|m o q|moq|rate/i.test(blob)) intent = "pricing";
  else if (/sample|catalogue|catalog/i.test(blob)) intent = "catalogue";
  else if (/hotel|restaurant|commercial/i.test(blob)) intent = "horeca";
  else if (/distribut|wholesal|retail|resell/i.test(blob)) intent = "partnership";
  return { intent, urgency };
}

export async function draftReply(e) {
  const { intent, urgency } = classifyEnquiry(e);
  const first = (e.name || "there").split(" ")[0];
  let reply = null;
  if (getProvider()) {
    reply = await llm(
      `Draft a short WhatsApp reply (max 70 words, warm-professional, no greetings like "Dear Sir") from JHANARICH cookware to this enquiry:
Name: ${e.name} | Business: ${e.business || "n/a"} | Interest: ${e.product || e.line || "general"} | Message: ${e.message || "none"}
Acknowledge their specific ask, give one concrete next step (catalogue, sample, or OEM call), and invite them to share quantities.`,
      "You write concise B2B WhatsApp replies for an Indian cookware manufacturer. Sound human, never generic."
    );
  }
  if (!reply) {
    const steps = {
      oem: `we do full OEM/private-label — logo etching, custom packaging, and specs to match your market. Could you share the products and quantities you have in mind? I'll send our OEM deck and MOQ sheet right away.`,
      pricing: `happy to share pricing — it depends on sizes and quantities. Send me your SKU list or monthly volumes and I'll put a quote together the same day.`,
      catalogue: `I'll WhatsApp over our latest catalogue with sizes, finishes and specs. If you tell me which series caught your eye (triply, non-stick or stainless), I'll highlight those pages.`,
      horeca: `we supply hotels and restaurants across the region — heavy-gauge bodies built for commercial burners. Tell me your kitchen's volume and I'll recommend the right series plus bulk pricing.`,
      partnership: `great timing — we're expanding our distributor network. Share your city and monthly volumes and I'll send our distributor terms and the full catalogue.`,
      general: `thanks for reaching out! Tell me a little about what you're cooking up — sizes, quantities, or a product type — and I'll point you to the right series.`,
    };
    reply = `Hi ${first}! ${steps[intent]}`;
  }
  return { reply, intent, urgency };
}

/* ---------------- on-site assistant (catalog retrieval) ---------------- */

export function answerChat(question, products) {
  const q = (question || "").toLowerCase();
  const has = (...ws) => ws.some((w) => q.includes(w));

  if (!q.trim()) return { reply: "Ask me anything about our cookware — series, sizes, coatings, MOQs, OEM.", products: [] };

  if (has("hi", "hello", "hey") && q.length < 12)
    return { reply: "Hey! I'm JHANA, the JHANARICH workshop assistant. Ask me about our triply, non-stick or stainless ranges — or say “OEM” if you want your own brand.", products: [] };

  if (has("oem", "private label", "own brand", "my brand"))
    return { reply: "Yes — OEM is our specialty. We manufacture to your spec with your logo, colours and packaging at production scale: custom branding & logo etching, bespoke packaging, product development to spec, flexible MOQs. Send your requirements on WhatsApp and we'll share the OEM deck.", products: products.filter((p) => p.featured).slice(0, 3) };

  if (has("price", "cost", "quote", "moq", "rate"))
    return { reply: "Pricing depends on sizes, finishes and volumes — we quote the same day. Ping us on WhatsApp with your SKU list or monthly quantities and you'll have a formal quote in hand. Flexible MOQs for first-time partners.", products: products.filter((p) => p.featured).slice(0, 3) };

  if (has("triply", "three layer", "3 layer", "honeycomb"))
    return { reply: "Triply is our flagship: a steel–aluminium–steel bond that heats edge to edge with zero hot spots. Food-safe 18/8 surface, induction-ready base. The Honeycomb range adds a laser-etched non-stick lattice — sears like cast iron, releases like non-stick. Works on gas, induction, electric and ceramic.", products: products.filter((p) => p.category === "triply").slice(0, 3) };

  if (has("non stick", "non-stick", "nonstick", "granite", "kadai", "grill"))
    return { reply: "Our non-stick line runs a 3-layer PFOA-free coating in matte black, granite or spatter finishes, with induction bottoms and bakelite handles — low-oil cooking that cleans in seconds. Fry pans, casseroles, kadais, grill pans and dosa tawas.", products: products.filter((p) => p.category === "nonstick").slice(0, 3) };

  if (has("steel", "stainless", "cup", "plate", "bowl", "tope"))
    return { reply: "The stainless essentials are deep-drawn food-grade steel, mirror polished and rust-resistant — cups, plates, bowls, topes and casseroles for daily and hospitality use.", products: products.filter((p) => p.category === "steel").slice(0, 3) };

  if (has("where", "location", "address", "visit", "factory"))
    return { reply: "We're at # 27-17/9/8, Ayodhya Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048, India. Factory visits welcome — message us on WhatsApp to schedule one.", products: [] };

  if (has("ship", "dispatch", "deliver", "export", "international"))
    return { reply: "We dispatch across India and export to partner markets — retail-ready or private-label packing. Share your city and quantities on WhatsApp and we'll confirm freight and timelines.", products: [] };

  if (has("handle", "bakelite"))
    return { reply: "We manufacture the hardware too: stamped SS side/long handles, gravity-cast handles and heat-resistant bakelite grips in matte or woodgrain — all rivet-ready.", products: products.filter((p) => p.category === "handles").slice(0, 3) };

  if (has("plastic", "spice", "container", "box"))
    return { reply: "Our plastics line covers food-grade spice boxes and durable packing containers — BPA-free and built for kitchen and retail duty.", products: products.filter((p) => p.category === "plastic").slice(0, 3) };

  // retrieval: score products by token overlap
  const stop = new Set(["the", "a", "an", "do", "you", "have", "is", "are", "for", "with", "and", "of", "in", "to", "what", "which", "your"]);
  const tokens = q.replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !stop.has(t));
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length)
    return { reply: `Here's what matches “${question.trim()}” from our catalogue — tap Enquire on any card and we'll reply on WhatsApp the same day.`, products: scored.slice(0, 3).map((s) => s.p) };

  return { reply: "I couldn't find that in the catalogue — but the team will know. Message us on WhatsApp with your requirement and we'll respond within a business day. Or ask me about triply, non-stick, stainless, handles, plastics or OEM.", products: [] };
}
