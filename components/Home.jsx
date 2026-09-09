"use client";
import { useMemo, useState } from "react";
import SiteFX from "./SiteFX";
import ChatWidget from "./ChatWidget";
import OrderTray from "./OrderTray";

const WA = "https://wa.me/919440121743";
const CAT_LABEL = { triply: "Triply", nonstick: "Non-Stick", steel: "Stainless Steel", handles: "Handles", plastic: "Plastic" };
const CAT_ORDER = ["triply", "nonstick", "steel", "handles", "plastic"];

const SVG_ICONS = {
  "svg:ss-handles": `<svg viewBox="0 0 120 120"><path d="M20 78 Q18 46 44 40 L92 32 Q104 30 106 40 Q108 50 96 52 L52 60 Q36 63 36 78 Q36 88 24 88 Q20 88 20 78Z" fill="none" stroke="#1B1510" stroke-width="3"/><circle cx="26" cy="82" r="5" fill="none" stroke="#B08D3F" stroke-width="3"/></svg>`,
  "svg:casted": `<svg viewBox="0 0 120 120"><path d="M22 76 Q22 50 46 44 L90 34" fill="none" stroke="#1B1510" stroke-width="3" stroke-linecap="round"/><path d="M90 34 Q104 32 106 42 Q107 50 96 52 L70 57" fill="none" stroke="#1B1510" stroke-width="10" stroke-linecap="round" opacity=".25"/></svg>`,
  "svg:bakelite": `<svg viewBox="0 0 120 120"><path d="M24 78 Q22 52 46 46 L88 36" fill="none" stroke="#1B1510" stroke-width="3" stroke-linecap="round"/><path d="M88 36 Q106 33 108 44 Q109 54 96 56 L74 60" fill="none" stroke="#4a3208" stroke-width="11" stroke-linecap="round"/></svg>`,
  "svg:spice": `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="42" fill="none" stroke="#1B1510" stroke-width="3"/><circle cx="60" cy="60" r="30" fill="none" stroke="#B08D3F" stroke-width="2" stroke-dasharray="4 5"/><circle cx="60" cy="34" r="4" fill="#1B1510"/><circle cx="83" cy="72" r="4" fill="#1B1510"/><circle cx="37" cy="72" r="4" fill="#1B1510"/></svg>`,
  "svg:packing": `<svg viewBox="0 0 120 120"><rect x="26" y="44" width="68" height="44" rx="8" fill="none" stroke="#1B1510" stroke-width="3"/><path d="M26 60 h68" stroke="#1B1510" stroke-width="2"/><rect x="50" y="34" width="20" height="10" rx="3" fill="none" stroke="#B08D3F" stroke-width="2.5"/></svg>`,
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
);
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M4.5 12.5l5 5 10-11"/></svg>
);

const SIZES = {"honeycomb-fry-pan":"18–32 cm","triply-casserole":"18–28 cm","honeycomb-tawa":"24–32 cm","triply-sauce-pan":"14–16 cm","triply-fry-pan":"18–32 cm","dosa-tawa":"26–32 cm","triply-set":"Full range","triply-tope":"14–28 cm","granite-fry-pan":"18–30 cm","nonstick-casserole":"18–26 cm","nonstick-kadai":"18–28 cm","grill-pan":"24–28 cm","fry-pan-set":"3 sizes","fry-pan-set-red":"3 sizes","nonstick-fry-pan":"18–30 cm","nonstick-tawa":"24–28 cm","steel-cups-plates":"Assorted","ss-casserole":"18–28 cm","ss-tope":"14–28 cm","steel-bowls":"Assorted","steel-tumblers":"Assorted","ss-handles":"All rivet sizes","casted-handles":"All rivet sizes","bakelite-handles":"All rivet sizes","spice-boxes":"Assorted","packing-boxes":"Assorted"};

function waEnq(name, cat) {
  return `${WA}?text=${encodeURIComponent(`Hello JHANARICH! I'd like to enquire about the ${name} (${CAT_LABEL[cat] || cat}). Please share details and pricing.`)}`;
}

const inr = (n) => "₹" + n.toLocaleString("en-IN");

const FAQS = [
  {
    q: "Where is JHANARICH located?",
    a: "Our factory and office are in Madhurawada, Visakhapatnam, Andhra Pradesh 530048, India. Visitors and partners are welcome — call +91 9440 121743 to schedule a visit.",
  },
  {
    q: "What does JHANARICH manufacture?",
    a: "JHANARICH (Jhanarich Private Limited) manufactures premium triply cookware, non-stick cookware, stainless steel vessels, cookware handles and plastic kitchen products — 26+ SKUs across five product lines, for homes, hotels, restaurants and commercial kitchens.",
  },
  {
    q: "How do I place a wholesale order?",
    a: "Tap \u201C+ Order\u201D on any product to build an order request, or message us on WhatsApp at +91 9440 121743. We confirm pricing and delivery timelines within one business day. Wholesale pricing applies to bulk quantities.",
  },
  {
    q: "Do you offer OEM and private-label manufacturing?",
    a: "Yes. We manufacture to your specification — your logo, your colours, your packaging — at production scale. Flexible MOQs for new partners. Ask for the OEM deck on WhatsApp or email admin@jhanarich.com.",
  },
  {
    q: "What is the minimum order quantity (MOQ)?",
    a: "MOQ varies by product and finish. Share your requirement on WhatsApp (+91 9440 121743) or via the enquiry form and we'll respond with MOQ, pricing and lead times within one business day.",
  },
  {
    q: "Is JHANARICH a registered company? Can you export?",
    a: "Yes — Jhanarich Private Limited, registered with the Ministry of Corporate Affairs (CIN U46909AP2025PTC119851), GST-registered (GSTIN 37AAGCJ9332F1ZF) with export documentation ready. We supply domestic and international buyers.",
  },
];
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function priceBlock(p) {
  if (p.price) {
    const off = p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return (
      <div className="price-row">
        <span className="price">{inr(p.price)}</span>
        {p.mrp && p.mrp > p.price ? <span className="mrp">{inr(p.mrp)}</span> : null}
        {off >= 15 ? <span className="off-badge">{off}% off</span> : null}
      </div>
    );
  }
  if (p.moq) return <div className="price-row"><span className="moq-note">MOQ {p.moq} units · price on request</span></div>;
  return <div className="price-row"><span className="moq-note">Price on request</span></div>;
}

const FEATURES = [
  {
    t: "Premium Quality Materials",
    s: "Food-grade steel, certified coatings",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2.5l7.5 3v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6z"/><path d="M8.8 12l2.2 2.2 4.2-4.6"/></svg>,
  },
  {
    t: "Induction & Gas Compatible",
    s: "Performs on every cooktop",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="13" r="3.2"/><path d="M12 2v3M5 6l2 2M19 6l-2 2M3 21h18"/></svg>,
  },
  {
    t: "Healthy Cooking",
    s: "Less oil, more nutrition",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 4C11 4 5 9 5 16c0 1.6.4 3 1 4 6 0 14-4 14-16z"/><path d="M5 20c3-6 7-9 11-11"/></svg>,
  },
  {
    t: "Proudly Made in India",
    s: "Manufactured in Visakhapatnam",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 21V4M5 4h13l-2.5 4L18 12H5"/></svg>,
  },
];

export default function Home({ products }) {
  const [activeCat, setActiveCat] = useState("all");

  const goRange = (cat) => {
    setActiveCat(cat);
    const l = typeof window !== "undefined" ? window.__lenis : null;
    if (l) l.scrollTo("#products", { offset: -60, duration: 1.6 });
    else document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
  };

  const goOEM = () => {
    const l = typeof window !== "undefined" ? window.__lenis : null;
    if (l) l.scrollTo("#oem", { offset: -60, duration: 1.6 });
    else document.querySelector("#oem")?.scrollIntoView({ behavior: "smooth" });
  };

  // reads the LIVE price from the card DOM so the tray matches what the
  // customer sees (SiteFX's price overlay may have replaced baked-in prices)
  const addToOrder = (e) => {
    const card = e.currentTarget.closest(".card");
    if (!card) return;
    const slug = card.dataset.slug;
    if (!slug) return;
    const name = card.querySelector("h3")?.textContent || slug;
    let price = null;
    const priceEl = card.querySelector(".price-row .price");
    if (priceEl) {
      const n = parseInt(priceEl.textContent.replace(/[^\d]/g, ""), 10);
      if (!Number.isNaN(n) && n > 0) price = n;
    }
    window.dispatchEvent(new CustomEvent("jr:order", { detail: { slug, name, price } }));
  };

  const visible = useMemo(
    () => (activeCat === "all" ? products : products.filter((p) => p.category === activeCat)),
    [products, activeCat]
  );

  return (
    <>
      <SiteFX />

      {/* PRELOADER */}
      <div id="loader">
        <div className="mark"><img src="/assets/logo.png" alt="JHANARICH" /></div>
        <div className="sub">Cookware for a better tomorrow</div>
        <div className="bar"><i></i></div>
      </div>

      {/* CURSOR */}
      <div className="cursor"></div>
      <div className="cursor-ring"><span className="cl"></span></div>
      <div className="scroll-progress"><i id="scrollBar"></i></div>

      {/* NAV */}
      <nav id="nav">
        <a href="#top" className="logo" data-hover>
          <img src="/assets/logo.png" alt="JHANARICH — home" />
          <span className="wordmark"><b>JHANARICH</b><span>Cookware for a better tomorrow</span></span>
        </a>
        <div className="nav-links">
          <a href="#top" data-hover>Home</a>
          <a href="#products" data-hover>Products</a>
          <a href="#process" data-hover>Manufacturing</a>
          <a href="#oem" data-hover>OEM / Wholesale</a>
          <a href="#about" data-hover>About</a>
          <a href="#contact" className="nav-cta" data-hover>Enquiry</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-bg"><img src="/assets/wa-frypan-lifestyle.jpg" alt="JHANARICH cookware in a modern kitchen" /></div>
        <div className="hero-shade"></div>
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="kicker">Indian Craftsmanship | Global Standards</div>
            <h1>Forged for Fire.<br /><i>Built for Life.</i></h1>
            <p className="hero-sub">Premium cookware designed for modern kitchens. Durable. Healthy. Beautiful. Made in India — in our own Visakhapatnam factory.</p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary" data-hover>Explore Products <Arrow /></a>
              <a href="#contact" className="btn btn-ghost-light" data-hover>Request Catalogue</a>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURE STRIP */}
      <div className="fstrip">
        <div className="frow">
          {FEATURES.map((f, i) => (
            <div className="f-item rv" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="fic">{f.icon}</span>
              <div><b>{f.t}</b><span>{f.s}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST TICKER */}
      <div className="trust-ticker" aria-hidden="true">
        <div className="trust-inner">
          {["Own factory in Visakhapatnam","GST-registered exporter","3-layer triply bonding","PFOA free coatings","Induction ready","OEM & private label","Reply within 1 business day"].map((t,i)=>(
            <span key={i}><i>◆</i>{t}</span>
          ))}
          {["Own factory in Visakhapatnam","GST-registered exporter","3-layer triply bonding","PFOA free coatings","Induction ready","OEM & private label","Reply within 1 business day"].map((t,i)=>(
            <span key={"b"+i}><i>◆</i>{t}</span>
          ))}
        </div>
      </div>

      {/* PRODUCT RANGES */}
      <section id="collections">
        <div className="wrap">
          <div className="sec-head center">
            <div>
              <div className="sec-num rv">01 — Our Products</div>
              <h2 className="rv rv-d1">A complete range<br /><i>for every kitchen.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Designed for homes, hotels and professional kitchens. Built with quality. Trusted worldwide.</p>
          </div>
          <div className="col-grid">
            <button onClick={() => goRange("triply")} className="col-card rv" data-cursor="View range" data-hover>
              <img src="/assets/catalog/family.jpg" alt="Triply cookware range" />
              <span className="col-tag">Bestseller</span>
              <div className="col-info">
                <h3>Triply Cookware</h3>
                <p>Superior heat distribution for perfect cooking.</p>
                <span className="col-more">View Range <Arrow /></span>
              </div>
            </button>
            <button onClick={() => goRange("nonstick")} className="col-card rv" data-cursor="View range" data-hover>
              <img src="/assets/catalog/nonstick-set.jpg" alt="Non-stick cookware range" />
              <span className="col-tag">PFOA free</span>
              <div className="col-info">
                <h3>Non-Stick Cookware</h3>
                <p>Cook healthy, clean easy, lasts longer.</p>
                <span className="col-more">View Range <Arrow /></span>
              </div>
            </button>
            <button onClick={() => goRange("steel")} className="col-card rv" data-cursor="View range" data-hover>
              <img src="/assets/catalog/saucepan.jpg" alt="Stainless steel essentials" />
              <span className="col-tag">Food-grade</span>
              <div className="col-info">
                <h3>Stainless Steel Essentials</h3>
                <p>Everyday utensils for a smarter kitchen.</p>
                <span className="col-more">View Range <Arrow /></span>
              </div>
            </button>
            <button onClick={goOEM} className="col-card rv" data-cursor="Partner with us" data-hover>
              <img src="/assets/wa-brand-poster.jpg" alt="OEM and private label cookware" />
              <span className="col-tag">For brands</span>
              <div className="col-info">
                <h3>OEM &amp; Private Label</h3>
                <p>Partner with us for customised solutions.</p>
                <span className="col-more">Learn More <Arrow /></span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products">
        <div className="wrap">
          <div className="sec-head center">
            <div>
              <div className="sec-num rv">02 — The Full Range</div>
              <h2 className="rv rv-d1">Every pan.<br /><i>Every purpose.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">From casseroles to dosa tawas, frypans to spice boxes — engineered across five product lines for home and professional kitchens.</p>
          </div>
          <div className="tabs rv">
            <button className={`tab${activeCat === "all" ? " active" : ""}`} onClick={() => setActiveCat("all")} data-hover>All</button>
            {CAT_ORDER.map((c) => (
              <button key={c} className={`tab${activeCat === c ? " active" : ""}`} onClick={() => setActiveCat(c)} data-hover>{CAT_LABEL[c]}</button>
            ))}
          </div>
          <div className="prod-grid" key={activeCat}>
            {visible.map((p, i) => (
              <article className={`card pop${p.featured ? " wide" : ""}`} data-cat={p.category} data-slug={p.slug} style={{ animationDelay: `${(i % 4) * 70}ms` }} key={p.id}>
                <div className="shine"></div>
                <div className="ph">
                  {p.image.startsWith("svg:")
                    ? <div className="ph-svg" style={{ width: "56%" }} dangerouslySetInnerHTML={{ __html: SVG_ICONS[p.image] }} />
                    : <img src={p.image} alt={p.name} loading="lazy" />}
                </div>
                <div className="info">
                  <span className="cat">{CAT_LABEL[p.category] || p.category}{SIZES[p.slug] ? <em className="size-chip">{SIZES[p.slug]}</em> : null}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {priceBlock(p)}
                  <div className="actions">
                    <a className="wa-enq" href={waEnq(p.name, p.category)} target="_blank" rel="noopener" data-hover>
                      <WaIcon />Enquire
                    </a>
                    <button className="order-btn" onClick={addToOrder} data-hover aria-label={`Add ${p.name} to order`}>
                      + Order
                    </button>
                    <button className="like-btn" data-id={p.id} data-hover aria-label="Show interest">
                      <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                      <span className="lc">0</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="finishes rv">
            <h4>Finishes &amp; <i>colours</i>, your call.</h4>
            <div className="swatches">
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#2b2b2b,#3d3d3d)" }}></i>Matte black</div>
              <div className="sw"><i style={{ background: "radial-gradient(circle at 35% 35%,#5a5f63,#2f3438 70%)" }}></i>Granite</div>
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#8a8f94,#c9ced2)" }}></i>Spatter</div>
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#f2efe6,#e0dbca)" }}></i>Ceramic</div>
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#c8342a,#8e1f16)" }}></i>Red</div>
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#6e1f22,#3f1012)" }}></i>Maroon</div>
              <div className="sw"><i style={{ background: "linear-gradient(135deg,#43484c,#26292c)" }}></i>Charcoal</div>
            </div>
            <div className="feat-chips">
              <span className="chip">3-layer coating</span><span className="chip">PFOA free</span><span className="chip">Induction bottom</span><span className="chip">Bakelite handle</span><span className="chip">Food-grade steel</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">03 — Our Story</div>
              <h2 className="rv rv-d1">Craft you can<br /><i>cook with.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Premium kitchen utensils manufactured in Visakhapatnam for homes, hotels, restaurants and commercial kitchens worldwide.</p>
          </div>
          <div className="about-grid">
            <div className="about-copy">
              <p className="rv"><strong>JHANARICH</strong> is dedicated to manufacturing premium kitchen utensils that make cooking easier, safer and more enjoyable — for modern homes, hotels, restaurants and commercial kitchens across domestic and international markets.</p>
              <p className="rv rv-d1">Our state-of-the-art production facility, skilled workforce and strict quality-control processes ensure every product meets international standards of excellence — from raw material selection to final packaging.</p>
              <p className="rv rv-d2">We build long-term partnerships with distributors, retailers, wholesalers, hospitality businesses and kitchenware brands through reliability, quality and customer satisfaction.</p>
              <div className="cred-inline rv rv-d3">
                <span>CIN U46909AP2025PTC119851</span>
                <span>GSTIN 37AAGCJ9332F1ZF</span>
                <span>Export-ready</span>
              </div>
            </div>
            <div className="about-imgs rv rv-d2">
              <div className="main"><img src="/assets/image2.jpg" alt="JHANARICH triply cookware family" loading="lazy" /></div>
              <div className="inset"><img src="/assets/image6.jpg" alt="JHANARICH triply casserole" loading="lazy" /></div>
            </div>
          </div>
          <div className="stats">
            <div className="stat rv"><b><span data-count="26">0</span><em>+</em></b><span>SKUs manufactured</span></div>
            <div className="stat rv rv-d1"><b><span data-count="5">0</span></b><span>Product lines</span></div>
            <div className="stat rv rv-d2"><b><span data-count="3">0</span></b><span>Layer bonded core</span></div>
            <div className="stat rv rv-d3"><b><span data-count="100">0</span><em>%</em></b><span>Rigorously tested</span></div>
          </div>
        </div>
      </section>

      {/* MANUFACTURING */}
      <section id="process">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">04 — Our Manufacturing</div>
              <h2 className="rv rv-d1">Built on Precision.<br /><i>Driven by People.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Modern machinery, precision technology and experienced professionals monitoring every stage of production at scale.</p>
          </div>
          <a href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! Please share details of your manufacturing process and capabilities.")}`} target="_blank" rel="noopener" className="mfg-cta btn btn-primary rv" data-hover>Our Manufacturing Process <Arrow /></a>
          <div className="mfg-grid rv rv-d1">
            <div className="mfg-main"><img src="/assets/wa-triply-range.jpg" alt="JHANARICH manufacturing and product range" loading="lazy" /></div>
            <div className="mfg-tiles">
              <div className="mfg-tile"><div className="mt-img"><img src="/assets/image29.jpg" alt="High-grade raw materials" loading="lazy" /></div><b>High-Grade Raw Materials</b><span>Sourced &amp; verified</span></div>
              <div className="mfg-tile"><div className="mt-img"><img src="/assets/image13.jpg" alt="Precision metal forming" loading="lazy" /></div><b>Precision Metal Forming</b><span>Deep-drawn &amp; bonded</span></div>
              <div className="mfg-tile"><div className="mt-img"><img src="/assets/image30.jpg" alt="Premium coatings and finishing" loading="lazy" /></div><b>Premium Coatings &amp; Finishing</b><span>3-layer, PFOA free</span></div>
              <div className="mfg-tile"><div className="mt-img"><img src="/assets/image2.jpg" alt="Strict quality inspection" loading="lazy" /></div><b>Strict Quality Inspection</b><span>100% batch tested</span></div>
            </div>
          </div>
          <div className="steps" id="steps">
            <div className="fill" id="stepsFill"></div>
            <div className="step"><div className="node"></div><div><h3><span className="no">Step 01</span>Material selection</h3><p>Food-grade stainless steel, pure aluminium and certified coatings are sourced and verified against international standards before entering production.</p></div></div>
            <div className="step"><div className="node"></div><div><h3><span className="no">Step 02</span>Forming &amp; bonding</h3><p>Bodies are deep-drawn, spun and triply-bonded with precision machinery — consistent thickness, no hot spots, no warping.</p></div></div>
            <div className="step"><div className="node"></div><div><h3><span className="no">Step 03</span>Coating &amp; finishing</h3><p>3-layer non-stick, granite, spatter or ceramic finishes are applied and cured, with bakelite or steel handles fitted and riveted.</p></div></div>
            <div className="step"><div className="node"></div><div><h3><span className="no">Step 04</span>Quality control</h3><p>Every batch is tested for strength, coating integrity, induction performance and food safety — compliance before it leaves the floor.</p></div></div>
            <div className="step"><div className="node"></div><div><h3><span className="no">Step 05</span>Packing &amp; dispatch</h3><p>Retail-ready or custom private-label packaging, then dispatched to distributors, retailers and hospitality partners worldwide.</p></div></div>
          </div>
        </div>
      </section>

      {/* TRIPLY TECHNOLOGY */}
      <section className="triply-sec" id="triply">
        <div className="triply-stage" id="triplyStage">
          <div className="triply-pin">
            <div className="triply-head">
              <div className="sec-num rv">05 — Our Technology</div>
              <h2>The Strength of <i>Three.</i></h2>
              <p className="triply-sub">Triply construction for faster, even heating and long-lasting performance.</p>
            </div>
            <div className="triply-showcase">
              <div className="heatpan-wrap">
                <div className="heat-stage" aria-hidden="true"></div>
                <img className="heatpan" id="heatPan" src="/assets/pan-hero.png" alt="JHANARICH triply honeycomb fry pan" />
                <div className="rings" id="heatRings" aria-hidden="true"><i></i><i></i><i></i></div>
                <div className="bond-flash" id="bondFlash" aria-hidden="true"></div>
              </div>
              <div className="triply-stack">
                <div className="layer layer-steel-top" id="lTop">
                  <span className="tag right">Food Grade Stainless Steel (Interior)</span>
                  <span className="idx">01</span>
                </div>
                <div className="layer layer-core" id="lMid">
                  <span className="tag left">Aluminium Core (Middle Layer)</span>
                  <span className="idx">02</span>
                </div>
                <div className="layer layer-steel-bot" id="lBot">
                  <span className="tag right">Induction Friendly Stainless Steel (Outer Layer)</span>
                  <span className="idx">03</span>
                </div>
              </div>
            </div>
            <div className="triply-caption">
              <div className="tcap" id="c1"><b>Food Grade Stainless Steel — Interior</b><p>Non-reactive, safe and easy to clean. The pure cooking surface that touches your food.</p></div>
              <div className="tcap" id="c2"><b>Aluminium Core — Middle Layer</b><p>Even heat distribution for better cooking — no hot spots, no scorching.</p></div>
              <div className="tcap" id="c3"><b>Induction Friendly Stainless Steel — Outer Layer</b><p>Durable, works on all cooktops — induction, gas and electric.</p></div>
            </div>
            <div className="spec-strip">
              <span className="spec"><i>◆</i>Faster Cooking</span>
              <span className="spec"><i>◆</i>Even Heat Distribution</span>
              <span className="spec"><i>◆</i>Energy Efficient</span>
              <span className="spec"><i>◆</i>Longer Life</span>
              <a className="spec wa-link" href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! I'm interested in your Triply range — please share the catalogue and pricing.")}`} target="_blank" rel="noopener" data-hover><i style={{ color: "#22c15e" }}>✆</i>Enquire on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* OEM */}
      <section className="oem" id="oem">
        <div className="wrap">
          <div className="oem-grid">
            <div>
              <div className="sec-num rv">06 — Partner with JHANARICH</div>
              <h2 className="rv rv-d1">Grow your business with a<br /><i>trusted manufacturing partner.</i></h2>
              <p className="rv rv-d2">We partner with distributors, retailers, hotels, restaurants and global brands to manufacture premium cookware at scale — your logo, your colours, your packaging. Launch or expand your line without building a factory.</p>
              <ul className="oem-checks rv rv-d3">
                <li><i><Check /></i>Custom Branding &amp; Packaging</li>
                <li><i><Check /></i>Wide Range of Products</li>
                <li><i><Check /></i>Reliable Bulk Supply</li>
                <li><i><Check /></i>Competitive Pricing</li>
                <li><i><Check /></i>Dedicated Support</li>
              </ul>
              <div className="hero-actions rv rv-d4">
                <a href="#contact" className="btn btn-primary" data-hover>Get Wholesale Quote <Arrow /></a>
              </div>
            </div>
            <div className="oem-poster rv rv-d2">
              <img src="/assets/wa-brand-poster.jpg" alt="JHANARICH — your brand, our expertise" loading="lazy" />
              <div className="cap"><span>Your Brand, Our Expertise</span><b>OEM &amp; Private Label Cookware</b></div>
            </div>
          </div>
          <div className="aud-strip rv rv-d3">
            <div className="aud"><b>For Distributors</b><span>Bulk supply</span></div>
            <div className="aud"><b>For Retail Chains</b><span>Private label</span></div>
            <div className="aud"><b>For Hotels &amp; Restaurants</b><span>Pro kitchens</span></div>
            <div className="aud"><b>For Global Brands</b><span>Export ready</span></div>
          </div>
        </div>
      </section>

      {/* CATALOG BAND */}
      <section className="catalog-band">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="sec-num rv" style={{ justifyContent: "center" }}>07 — The Catalogue</div>
          <h2 className="rv rv-d1" style={{ marginBottom: "clamp(36px,5vw,64px)" }}>Retail-ready <i>catalogues.</i></h2>
          <div className="posters">
            <div className="poster rv"><img src="/assets/wa-frypan-poster.jpg" alt="Triply fry pan spec sheet" loading="lazy" /></div>
            <div className="poster rv rv-d1"><img src="/assets/wa-triply-range.jpg" alt="Triply cookware range spec sheet" loading="lazy" /></div>
            <div className="poster rv rv-d2"><img src="/assets/wa-elevate-ad.jpg" alt="Elevate your kitchen campaign" loading="lazy" /></div>
          </div>
          <div className="hero-actions rv rv-d3" style={{ justifyContent: "center", marginTop: "clamp(30px,4vw,50px)" }}>
            <a href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! Please send me the complete product catalogue with wholesale pricing.")}`} target="_blank" rel="noopener" className="btn btn-primary" data-hover>Get the full catalogue on WhatsApp <Arrow /></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">08 — FAQ</div>
              <h2 className="rv rv-d1">Questions,<br /><i>answered.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Everything buyers usually ask before their first order. Anything else — one WhatsApp message away.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details className="faq-item rv" key={i} open={i === 0}>
                <summary>{f.q}<span className="faq-x" aria-hidden="true">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">09 — Get in Touch</div>
              <h2 className="rv rv-d1">Let&apos;s build something<br /><i>great together.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Discuss your requirements, request a product catalogue, or explore custom manufacturing solutions.</p>
          </div>
          <div className="contact-grid">
            <div>
              <div className="c-item rv">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg></div>
                <div><b>Location</b><p># 27-17/9/8, Ayodhya Nagar,<br />Madhurawada, Visakhapatnam,<br />Andhra Pradesh, India — 530048</p></div>
              </div>
              <a className="c-item rv rv-d1" href="tel:+919440121743" data-hover>
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" /></svg></div>
                <div><b>Call Us</b><p>+91 9440 121743<br />+91 9182 236843</p></div>
              </a>
              <a className="c-item rv rv-d2" href="mailto:admin@jhanarich.com" data-hover>
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg></div>
                <div><b>Email Us</b><p>admin@jhanarich.com</p></div>
              </a>
              <div className="c-item rv rv-d3">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg></div>
                <div><b>Business Hours</b><p>Mon – Sat · 9:00 AM – 6:30 PM</p></div>
              </div>
            </div>
            <form id="enquiryForm" className="rv rv-d1">
              <span className="fs">Send Us an Enquiry — replies within one business day</span>
              <h3>Send Us an Enquiry</h3>
              <div className="field"><label>Your Name *</label><input type="text" name="name" placeholder="Full name" required /></div>
              <div className="field"><label>Company Name</label><input type="text" name="business" placeholder="Company / business (optional)" /></div>
              <div className="field"><label>Email Address *</label><input type="email" name="email" placeholder="you@company.com" required /></div>
              <div className="field"><label>Phone Number *</label><input type="tel" name="phone" placeholder="+91 …" required /></div>
              <div className="field"><label>Enquiry Type</label>
                <select name="line">
                  <option>Triply cookware</option>
                  <option>Non-stick cookware</option>
                  <option>Stainless steel</option>
                  <option>Cookware handles</option>
                  <option>Plastic products</option>
                  <option>OEM / Private label</option>
                </select>
              </div>
              <div className="field"><label>Message</label><textarea name="message" placeholder="Quantities, markets, timelines…"></textarea></div>
              <button type="submit" className="btn btn-primary" data-hover>Submit Enquiry <Arrow /></button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-top">
          <a href="#top" className="logo" data-hover>
            <img src="/assets/logo.png" alt="JHANARICH" />
            <span className="wordmark"><b>JHANARICH</b></span>
          </a>
          <span className="tagline">Made in India | Trusted Worldwide</span>
          <p className="fdesc">Premium kitchen utensils manufactured in Visakhapatnam, India — for homes, hotels, restaurants and commercial kitchens worldwide.</p>
          <div className="links">
            <div className="col"><b>Explore</b>
              <a href="#products" data-hover>Products</a><a href="#process" data-hover>Manufacturing</a><a href="#triply" data-hover>Triply technology</a><a href="#oem" data-hover>OEM / Wholesale</a>
            </div>
            <div className="col"><b>Ranges</b>
              <a href="#products" data-hover>Triply</a><a href="#products" data-hover>Non-stick</a><a href="#products" data-hover>Stainless steel</a><a href="#oem" data-hover>Private label</a>
            </div>
            <div className="col"><b>Contact</b>
              <a href="tel:+919440121743" data-hover>+91 9440 121743</a>
              <a href="mailto:admin@jhanarich.com" data-hover>admin@jhanarich.com</a>
              <a href={`${WA}?text=${encodeURIComponent("Hello JHANARICH!")}`} target="_blank" rel="noopener" data-hover>WhatsApp us</a>
            </div>
          </div>
        </div>
        <div className="foot-mark">Jhana<em><i>rich</i></em></div>
        <div className="foot-bot">
          <span>© {new Date().getFullYear()} JHANARICH — Visakhapatnam, India</span>
          <span>Triply · Non-stick · Stainless · OEM</span>
        </div>
        <div className="foot-legal">
          Jhanarich Private Limited · CIN U46909AP2025PTC119851 · GSTIN 37AAGCJ9332F1ZF · # 27-17/9/8, Ayodhya Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048, India
        </div>
      </footer>

      <OrderTray />
      <ChatWidget />
    </>
  );
}
