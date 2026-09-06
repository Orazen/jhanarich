"use client";
import { useMemo, useState } from "react";
import SiteFX from "./SiteFX";
import ChatWidget from "./ChatWidget";

const WA = "https://wa.me/919440121743";
const CAT_LABEL = { triply: "Triply", nonstick: "Non-Stick", steel: "Stainless Steel", handles: "Handles", plastic: "Plastic" };
const CAT_ORDER = ["triply", "nonstick", "steel", "handles", "plastic"];

const SVG_ICONS = {
  "svg:ss-handles": `<svg viewBox="0 0 120 120"><path d="M20 78 Q18 46 44 40 L92 32 Q104 30 106 40 Q108 50 96 52 L52 60 Q36 63 36 78 Q36 88 24 88 Q20 88 20 78Z" fill="none" stroke="#1B1510" stroke-width="3"/><circle cx="26" cy="82" r="5" fill="none" stroke="#C2430B" stroke-width="3"/></svg>`,
  "svg:casted": `<svg viewBox="0 0 120 120"><path d="M22 76 Q22 50 46 44 L90 34" fill="none" stroke="#1B1510" stroke-width="3" stroke-linecap="round"/><path d="M90 34 Q104 32 106 42 Q107 50 96 52 L70 57" fill="none" stroke="#1B1510" stroke-width="10" stroke-linecap="round" opacity=".25"/></svg>`,
  "svg:bakelite": `<svg viewBox="0 0 120 120"><path d="M24 78 Q22 52 46 46 L88 36" fill="none" stroke="#1B1510" stroke-width="3" stroke-linecap="round"/><path d="M88 36 Q106 33 108 44 Q109 54 96 56 L74 60" fill="none" stroke="#4a3208" stroke-width="11" stroke-linecap="round"/></svg>`,
  "svg:spice": `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="42" fill="none" stroke="#1B1510" stroke-width="3"/><circle cx="60" cy="60" r="30" fill="none" stroke="#C2430B" stroke-width="2" stroke-dasharray="4 5"/><circle cx="60" cy="34" r="4" fill="#1B1510"/><circle cx="83" cy="72" r="4" fill="#1B1510"/><circle cx="37" cy="72" r="4" fill="#1B1510"/></svg>`,
  "svg:packing": `<svg viewBox="0 0 120 120"><rect x="26" y="44" width="68" height="44" rx="8" fill="none" stroke="#1B1510" stroke-width="3"/><path d="M26 60 h68" stroke="#1B1510" stroke-width="2"/><rect x="50" y="34" width="20" height="10" rx="3" fill="none" stroke="#C2430B" stroke-width="2.5"/></svg>`,
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
);
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
);

function waEnq(name, cat) {
  return `${WA}?text=${encodeURIComponent(`Hello JHANARICH! I'd like to enquire about the ${name} (${CAT_LABEL[cat] || cat}). Please share details and pricing.`)}`;
}

export default function Home({ products }) {
  const [activeCat, setActiveCat] = useState("all");

  const goRange = (cat) => {
    setActiveCat(cat);
    const l = typeof window !== "undefined" ? window.__lenis : null;
    if (l) l.scrollTo("#products", { offset: -60, duration: 1.6 });
    else document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
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
        <div className="sub">Forged for fire</div>
        <div className="bar"><i></i></div>
      </div>

      {/* CURSOR */}
      <div className="cursor"></div>
      <div className="cursor-ring"><span className="cl"></span></div>
      <div className="scroll-progress"><i id="scrollBar"></i></div>

      {/* NAV */}
      <nav id="nav">
        <a href="#top" className="logo" data-hover><img src="/assets/logo.png" alt="JHANARICH — home" /></a>
        <div className="nav-links">
          <a href="#about" data-hover>Story</a>
          <a href="#triply" data-hover>Triply</a>
          <a href="#products" data-hover>Products</a>
          <a href="#process" data-hover>Process</a>
          <a href="#oem" data-hover>OEM</a>
          <a href="#contact" className="nav-cta" data-hover>Get Catalogue</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-bg"></div>
        <div className="hero-grid">
          <div>
            <div className="kicker">Kitchenware Manufacturer — Visakhapatnam, India</div>
            <h1>
              <span className="line"><span>Forged</span></span>
              <span className="line"><span className="stroke">For&nbsp;Fire.</span></span>
              <span className="line"><span>Built&nbsp;<i>for&nbsp;life.</i></span></span>
            </h1>
            <p className="hero-sub">Premium triply, non-stick and stainless steel cookware — engineered for households, hotels, restaurants and commercial kitchens. Superior craftsmanship, modern design, uncompromising durability.</p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary" data-hover>Explore the range <Arrow /></a>
              <a href="#contact" className="btn btn-ghost" data-hover>Request catalogue</a>
            </div>
          </div>
          <div className="hero-stage" id="heroStage">
            <div className="flame"><i></i><i></i><i></i><i></i></div>
            <div className="stage-disc"></div>
            <img className="medallion" src="/assets/logo.png" alt="" aria-hidden="true" />
            <div className="steam" aria-hidden="true"><i></i><i></i><i></i></div>
            <div className="callout co1" style={{ "--d": "2s" }} aria-hidden="true"><i></i><span>Triply bonded core</span></div>
            <div className="callout co2" style={{ "--d": "2.5s" }} aria-hidden="true"><i></i><span>Honeycoat non-stick</span></div>
            <div className="callout co3" style={{ "--d": "3s" }} aria-hidden="true"><i></i><span>Induction ready</span></div>
            <div className="pan pan-1" data-depth="0.5"><img src="/assets/image6.jpg" alt="Triply casserole with glass lid" /></div>
            <div className="pan pan-2" data-depth="1"><img src="/assets/pan-hero.png" alt="JHANARICH triply honeycomb fry pan" /></div>
            <div className="pan pan-3" data-depth="0.3"><img src="/assets/image9.jpg" alt="Triply dosa tawa" /></div>
            <svg className="orbit-badge" viewBox="0 0 120 120">
              <defs><path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <circle className="core" cx="60" cy="60" r="7" />
              <text><textPath href="#circ">Triply Bonded • PFOA Free • Induction Ready •{"\u00A0"}</textPath></text>
            </svg>
          </div>
        </div>
        <div className="hero-meta">
          <div className="item"><b data-count="26">0</b>SKUs in catalogue</div>
          <div className="item"><b><span data-count="5">0</span><em style={{ fontStyle: "normal" }}>+</em></b>Product lines</div>
          <div className="item"><b data-count="3">0</b>Layer triply core</div>
          <div className="item"><b><span data-count="100">0</span>%</b>QC tested</div>
          <div className="item"><b style={{ fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.4 }}>EST. VISAKHAPATNAM<br />ANDHRA PRADESH — IN</b></div>
        </div>
        <div className="hero-side">Forged in Visakhapatnam — 530048 — India</div>
        <div className="scroll-hint">Scroll</div>
      </header>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Triply Cookware <i className="sep">✦</i> <i>Non-Stick</i> <i className="sep">✦</i> Stainless Steel <i className="sep">✦</i> <i>Cookware Handles</i> <i className="sep">✦</i> Plastic Products <i className="sep">✦</i> <i>OEM &amp; Private Label</i> <i className="sep">✦</i></span>
          <span>Triply Cookware <i className="sep">✦</i> <i>Non-Stick</i> <i className="sep">✦</i> Stainless Steel <i className="sep">✦</i> <i>Cookware Handles</i> <i className="sep">✦</i> Plastic Products <i className="sep">✦</i> <i>OEM &amp; Private Label</i> <i className="sep">✦</i></span>
        </div>
      </div>

      {/* TRUST TICKER */}
      <div className="trust-ticker" aria-hidden="true">
        <div className="trust-inner">
          {["3-layer coating","PFOA free","Induction bottom","Food-grade steel","ISO-style QC","OEM ready"].map((t,i)=>(
            <span key={i}><i>◆</i>{t}</span>
          ))}
          {["3-layer coating","PFOA free","Induction bottom","Food-grade steel","ISO-style QC","OEM ready"].map((t,i)=>(
            <span key={"b"+i}><i>◆</i>{t}</span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">01 — Our Story</div>
              <h2 className="rv rv-d1">Craft you can<br /><i>cook with.</i></h2>
            </div>
            <div className="heat-line" style={{ flex: 1, alignSelf: "center", minWidth: 120 }}></div>
          </div>
          <div className="about-grid">
            <div className="about-copy">
              <p className="rv"><strong>JHANARICH</strong> has been dedicated to manufacturing premium kitchen utensils that make cooking easier, safer and more enjoyable — for modern homes, hotels, restaurants and commercial kitchens across domestic and international markets.</p>
              <p className="rv rv-d1">Our state-of-the-art production facility, skilled workforce and strict quality-control processes ensure every product meets international standards of excellence — from raw material selection to final packaging.</p>
              <p className="rv rv-d2">We build long-term partnerships with distributors, retailers, wholesalers, hospitality businesses and kitchenware brands through reliability, quality and customer satisfaction.</p>
              <div className="stats">
                <div className="stat rv"><b><span data-count="26">0</span><em>+</em></b><span>SKUs manufactured</span></div>
                <div className="stat rv rv-d1"><b><span data-count="5">0</span></b><span>Product lines</span></div>
                <div className="stat rv rv-d2"><b><span data-count="3">0</span></b><span>Layer bonded core</span></div>
                <div className="stat rv rv-d3"><b><span data-count="100">0</span><em>%</em></b><span>Rigorously tested</span></div>
              </div>
            </div>
            <div className="about-imgs rv rv-d2">
              <div className="main"><img src="/assets/image2.jpg" alt="JHANARICH triply cookware family" loading="lazy" /></div>
              <div className="inset"><img src="/assets/image6.jpg" alt="JHANARICH triply casserole" loading="lazy" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">03 — Collections</div>
              <h2 className="rv rv-d1">Three series.<br /><i>One signature.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Curated families, engineered for different fires — from everyday rotis to hotel line kitchens.</p>
          </div>
          <div className="col-grid">
            <button onClick={() => goRange("triply")} className="col-card" data-cursor="Shop triply" data-hover>
              <img src="/assets/image2.jpg" alt="Triply series" data-parallax />
              <span className="col-tag">Bestseller</span>
              <div className="col-info">
                <div><span className="no">SERIES — 01</span><h3>The Triply Series</h3><p>Bonded steel-aluminium-steel. Even heat, forever build.</p></div>
                <span className="col-arrow"><Arrow /></span>
              </div>
            </button>
            <button onClick={() => goRange("nonstick")} className="col-card" data-cursor="Shop non-stick" data-hover>
              <img src="/assets/image12.jpg" alt="Non-stick series" data-parallax />
              <span className="col-tag">PFOA free</span>
              <div className="col-info">
                <div><span className="no">SERIES — 02</span><h3>The Non-Stick Series</h3><p>Three-layer release, granite &amp; spatter finishes, low-oil cooking.</p></div>
                <span className="col-arrow"><Arrow /></span>
              </div>
            </button>
            <button onClick={() => goRange("steel")} className="col-card" data-cursor="Shop steel" data-hover>
              <img src="/assets/wa-casserole.jpg" alt="Stainless steel series" data-parallax />
              <span className="col-tag">Food-grade</span>
              <div className="col-info">
                <div><span className="no">SERIES — 03</span><h3>The Steel Essentials</h3><p>Mirror-polished serveware and deep-drawn daily vessels.</p></div>
                <span className="col-arrow"><Arrow /></span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* TRIPLY SIGNATURE */}
      <section className="triply-sec" id="triply">
        <div className="triply-stage" id="triplyStage">
          <div className="triply-pin">
            <div className="triply-head">
              <div className="sec-num">04 — The Technology</div>
              <h2>Three layers. <i>One bond.</i></h2>
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
                  <span className="tag right">18/8 Stainless Steel — food-safe cooking surface</span>
                  <span className="idx">01</span>
                </div>
                <div className="layer layer-core" id="lMid">
                  <span className="tag left">Aluminium core — even heat, no hot spots</span>
                  <span className="idx">02</span>
                </div>
                <div className="layer layer-steel-bot" id="lBot">
                  <span className="tag right">Induction-ready magnetic steel</span>
                  <span className="idx">03</span>
                </div>
              </div>
            </div>
            <div className="spec-strip">
              <span className="spec"><i>◆</i>20 / 22 / 24 / 26 / 28 cm</span>
              <span className="spec"><i>◆</i>Riveted SS handle</span>
              <span className="spec"><i>◆</i>Works on all cooktops</span>
              <span className="spec"><i>◆</i>Oven safe</span>
              <span className="spec"><i>◆</i>Dishwasher safe</span>
              <a className="spec wa-link" href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! I'm interested in your Triply range — please share the catalogue and pricing.")}`} target="_blank" rel="noopener" data-hover><i style={{ color: "#22c15e" }}>✆</i>Enquire on WhatsApp</a>
            </div>
            <div className="triply-caption">
              <div className="tcap" id="c1"><b>Food-safe surface</b><p>Food-grade stainless steel cooking surface — corrosion resistant, non-reactive, safe for all foods.</p></div>
              <div className="tcap" id="c2"><b>Even-heating core</b><p>A pure aluminium core spreads heat edge to edge. No hot spots, no scorching — better cooking results.</p></div>
              <div className="tcap" id="c3"><b>Induction ready</b><p>Magnetic stainless steel base locks onto induction, gas and electric cooktops with full efficiency.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">05 — The Range</div>
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
              <article className={`card pop${p.featured ? " wide" : ""}`} data-cat={p.category} style={{ animationDelay: `${(i % 4) * 70}ms` }} key={p.id}>
                <div className="shine"></div>
                <div className="ph">
                  {p.image.startsWith("svg:")
                    ? <div className="ph-svg" style={{ width: "56%" }} dangerouslySetInnerHTML={{ __html: SVG_ICONS[p.image] }} />
                    : <img src={p.image} alt={p.name} loading="lazy" />}
                </div>
                <div className="info">
                  <span className="cat">{CAT_LABEL[p.category] || p.category}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="actions">
                    <a className="wa-enq" href={waEnq(p.name, p.category)} target="_blank" rel="noopener" data-hover>
                      <WaIcon />Enquire
                    </a>
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

      {/* WHY US */}
      <section className="why">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">06 — Why JHANARICH</div>
              <h2 className="rv rv-d1">Built different,<br /><i>on purpose.</i></h2>
            </div>
          </div>
          <div className="why-grid">
            <div className="why-card rv"><div className="ember-bar"></div><div className="n">A / 01</div><h3>Premium quality materials</h3><p>Food-grade stainless steel and high-grade coatings for long-lasting durability, corrosion resistance and safe food preparation.</p><span className="ghost">Q</span></div>
            <div className="why-card rv rv-d1"><div className="ember-bar"></div><div className="n">A / 02</div><h3>Innovative design</h3><p>Ergonomically engineered for comfort, efficiency and ease of use — helping users achieve better cooking results, every day.</p><span className="ghost">D</span></div>
            <div className="why-card rv rv-d2"><div className="ember-bar"></div><div className="n">A / 03</div><h3>Strict quality control</h3><p>Every product undergoes rigorous testing for strength, performance and compliance with industry standards before it ships.</p><span className="ghost">QC</span></div>
            <div className="why-card rv rv-d3"><div className="ember-bar"></div><div className="n">A / 04</div><h3>OEM &amp; private label</h3><p>Custom manufacturing — branding, packaging and product development tailored to your business requirements.</p><span className="ghost">OEM</span></div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">07 — Manufacturing</div>
              <h2 className="rv rv-d1">From raw steel<br /><i>to your stove.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Modern machinery, precision technology and experienced professionals monitoring every stage of production at scale.</p>
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

      {/* OEM */}
      <section className="oem" id="oem">
        <div className="wrap">
          <div className="oem-grid">
            <div>
              <div className="sec-num rv" style={{ color: "var(--ember-hot)" }}>08 — OEM &amp; Private Label</div>
              <h2 className="rv rv-d1">Your brand.<br /><i>Our forge.</i></h2>
              <p className="rv rv-d2">Launch or expand your cookware line without building a factory. We manufacture to your specification — your logo, your colours, your packaging — at production scale.</p>
              <ul className="oem-list rv rv-d3">
                <li>Custom branding &amp; logo etching <span>→</span></li>
                <li>Bespoke packaging development <span>→</span></li>
                <li>Product development to spec <span>→</span></li>
                <li>Flexible MOQs for partners <span>→</span></li>
              </ul>
              <div className="hero-actions rv rv-d4" style={{ marginTop: 38 }}>
                <a href="#contact" className="btn btn-primary" style={{ background: "var(--ember)" }} data-hover>Start a partnership <Arrow /></a>
              </div>
            </div>
            <div className="oem-poster rv rv-d2">
              <img src="/assets/wa-brand-poster.jpg" alt="JHANARICH brand strategy and pillars" loading="lazy" />
              <div className="cap"><span>Jhanarich Private Limited</span><b>Brand &amp; OEM</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG BAND */}
      <section className="catalog-band">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="sec-num rv" style={{ justifyContent: "center" }}>09 — Spec Sheets</div>
          <h2 className="rv rv-d1" style={{ marginBottom: "clamp(36px,5vw,64px)" }}>Retail-ready <i>catalogues.</i></h2>
          <div className="posters">
            <div className="poster rv"><img src="/assets/wa-frypan-poster.jpg" alt="Triply fry pan spec sheet" loading="lazy" /></div>
            <div className="poster rv rv-d1"><img src="/assets/wa-triply-range.jpg" alt="Triply cookware range spec sheet" loading="lazy" /></div>
            <div className="poster rv rv-d2"><img src="/assets/wa-elevate-ad.jpg" alt="Elevate your kitchen campaign" loading="lazy" /></div>
          </div>
        </div>
      </section>

      {/* GLOBAL + SUSTAIN */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">10 — Reach &amp; Responsibility</div>
              <h2 className="rv rv-d1">Global markets,<br /><i>cleaner methods.</i></h2>
            </div>
          </div>
          <div className="glob-grid">
            <div className="glob-card rv"><h3>Serving global markets</h3><p>Trusted by distributors, retailers, wholesalers, hospitality businesses and kitchenware brands across domestic and international markets — partnerships built on reliability and quality.</p></div>
            <div className="glob-card rv rv-d1"><h3>Sustainability commitment</h3><p>Environmentally responsible manufacturing: reducing waste, improving resource efficiency and promoting sustainable production methods, continuously.</p></div>
            <div className="glob-card rv rv-d2"><h3>Long-term partners</h3><p>We measure success in decades, not orders — customer satisfaction and dependable supply are the foundation of everything we make.</p></div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-num rv">11 — Contact</div>
              <h2 className="rv rv-d1">Let&apos;s make<br /><i>something hot.</i></h2>
            </div>
            <p className="sec-desc rv rv-d2">Discuss your requirements, request a product catalogue, or explore custom manufacturing solutions.</p>
          </div>
          <div className="contact-grid">
            <div>
              <div className="c-item rv">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg></div>
                <div><b>Factory &amp; Office</b><p># 27-17/9/8, Ayodhya Nagar,<br />Madhurawada, Visakhapatnam,<br />Andhra Pradesh, India — 530048</p></div>
              </div>
              <a className="c-item rv rv-d1" href="tel:+919440121743" data-hover>
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" /></svg></div>
                <div><b>Phone</b><p>+91 9440 121743<br />+91 9182 236843</p></div>
              </a>
              <a className="c-item rv rv-d2" href="mailto:admin@jhanarich.com" data-hover>
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg></div>
                <div><b>Email</b><p>admin@jhanarich.com</p></div>
              </a>
              <a className="c-item rv rv-d3" href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! I'd like to discuss a cookware requirement.")}`} target="_blank" rel="noopener" data-hover>
                <div className="ic"><WaIcon /></div>
                <div><b>WhatsApp</b><p>+91 9440 121743</p></div>
              </a>
            </div>
            <form id="enquiryForm" className="rv rv-d1">
              <span className="fs">Enquiry — replies within one business day</span>
              <h3>Request a catalogue</h3>
              <div className="field"><label>Your name</label><input type="text" name="name" placeholder="Full name" required /></div>
              <div className="field"><label>Phone / WhatsApp</label><input type="tel" name="phone" placeholder="+91 …" /></div>
              <div className="field"><label>Business type</label>
                <select name="business">
                  <option>Distributor / Wholesaler</option>
                  <option>Retailer</option>
                  <option>Hotel / Restaurant</option>
                  <option>Kitchenware brand (OEM)</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field"><label>Interested in</label>
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
              <button type="submit" className="btn btn-primary" data-hover>Send via WhatsApp <Arrow /></button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="wrap">
          <div className="sec-num rv" style={{ color: "var(--ember-hot)" }}>12 — Start today</div>
          <h2 className="rv rv-d1">Ready when<br /><i>you are.</i></h2>
          <p className="rv rv-d2">Catalogues, samples, OEM conversations — one message on WhatsApp and our team responds within a business day.</p>
          <div className="hero-actions rv rv-d3">
            <a href={`${WA}?text=${encodeURIComponent("Hello JHANARICH! I'd like to discuss a cookware requirement.")}`} target="_blank" rel="noopener" className="btn btn-primary" style={{ background: "var(--ember)" }} data-hover>Message us on WhatsApp <Arrow /></a>
            <a href="mailto:admin@jhanarich.com" className="btn btn-ghost-light" data-hover>admin@jhanarich.com</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-top">
          <div style={{ maxWidth: 320 }}>
            <a href="#top" className="logo" data-hover><img src="/assets/logo.png" alt="JHANARICH" /></a>
            <p style={{ color: "rgba(243,237,225,.5)", fontSize: 14, marginTop: 14 }}>Premium kitchen utensils manufactured in Visakhapatnam, India — for homes, hotels, restaurants and commercial kitchens worldwide.</p>
          </div>
          <div className="links">
            <div className="col"><b>Explore</b>
              <a href="#about" data-hover>Story</a><a href="#triply" data-hover>Triply tech</a><a href="#products" data-hover>Products</a><a href="#process" data-hover>Process</a>
            </div>
            <div className="col"><b>Products</b>
              <a href="#products" data-hover>Triply</a><a href="#products" data-hover>Non-stick</a><a href="#products" data-hover>Stainless steel</a><a href="#products" data-hover>OEM / Private label</a>
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
      </footer>

      <ChatWidget />
    </>
  );
}
