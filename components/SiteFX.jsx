"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SiteFX() {
  useEffect(() => {
    const cleanups = [];
    const on = (target, type, fn, opt) => {
      target.addEventListener(type, fn, opt);
      cleanups.push(() => target.removeEventListener(type, fn, opt));
    };

    /* ---------- preloader ---------- */
    const loader = document.getElementById("loader");
    let loaderTimer, fallbackTimer;
    const finishLoad = () => {
      if (!loader) return;
      loader.classList.add("done");
      document.body.classList.add("loaded");
      loaderTimer = setTimeout(() => loader.remove(), 1100);
    };
    if (document.readyState === "complete") loaderTimer = setTimeout(finishLoad, 900);
    else on(window, "load", () => (loaderTimer = setTimeout(finishLoad, 400)));
    fallbackTimer = setTimeout(finishLoad, 3200);
    cleanups.push(() => { clearTimeout(loaderTimer); clearTimeout(fallbackTimer); });

    /* ---------- lenis smooth scroll + anchors ---------- */
    const lenis = new Lenis({ lerp: 0.09 });
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    cleanups.push(() => { cancelAnimationFrame(raf); lenis.destroy(); });
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const fn = (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70, duration: 1.4 });
        }
      };
      on(a, "click", fn);
    });

    /* ---------- marquee: velocity-reactive + hover pause ---------- */
    const marq = document.querySelector(".marquee-track");
    if (marq) {
      let mRaf, vel = 0, lastX = scrollY, skew = 0;
      const dir = -1; // always leftward; velocity adds skew only (robust wrap)
      const tick = () => {
        const dx = scrollY - lastX; lastX = scrollY;
        vel += (dx - vel) * .12;
        skew += (Math.max(-8, Math.min(8, vel * .35)) - skew) * .1;
        const speed = 1.1 + Math.min(4.5, Math.abs(vel) * .09);
        let cur = parseFloat(marq.dataset.x || 0);
        let nx = cur + dir * speed;
        const half = marq.scrollWidth / 2;
        if (half > 0) { if (nx <= -half) nx += half; if (nx > 0) nx -= half; }
        marq.dataset.x = nx;
        marq.style.transform = `translateX(${nx}px) skewX(${skew}deg)`;
        mRaf = requestAnimationFrame(tick);
      };
      mRaf = requestAnimationFrame(tick);
      cleanups.push(() => cancelAnimationFrame(mRaf));
    }

    /* ---------- exposed lenis for anchors ---------- */
    window.__lenis = lenis;

    /* ---------- scroll progress bar ---------- */
    const sBar = document.getElementById("scrollBar");
    if (sBar) {
      const pf = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        sBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      };
      on(window, "scroll", pf, { passive: true });
      on(window, "resize", pf);
      pf();
    }

    /* ---------- clip-path reveals + inner parallax ---------- */
    const pImages = [...document.querySelectorAll("[data-parallax]")];
    if (pImages.length) {
      let p2Raf;
      const pf2 = () => {
        pImages.forEach((img) => {
          const r = img.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          const prog = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          img.style.transform = `translateY(${prog * -9}%) scale(1.02)`;
        });
        p2Raf = requestAnimationFrame(pf2);
      };
      p2Raf = requestAnimationFrame(pf2);
      cleanups.push(() => cancelAnimationFrame(p2Raf));
    }

    /* ---------- cursor contextual labels ---------- */
    const cl = document.querySelector(".cursor-ring .cl");
    const ringEl = document.querySelector(".cursor-ring");
    if (cl && ringEl) {
      document.querySelectorAll("[data-cursor]").forEach((el) => {
        const enter = () => { cl.textContent = el.dataset.cursor; ringEl.classList.add("label"); };
        const leave = () => { ringEl.classList.remove("label"); };
        on(el, "pointerenter", enter); on(el, "pointerleave", leave);
      });
    }

    /* ---------- custom cursor ---------- */
    const dot = document.querySelector(".cursor"), ring = document.querySelector(".cursor-ring");
    if (window.matchMedia("(pointer:fine)").matches && dot && ring) {
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, curRaf;
      const mv = (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; };
      const cl = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.left = rx + "px"; ring.style.top = ry + "px"; curRaf = requestAnimationFrame(cl); };
      curRaf = requestAnimationFrame(cl);
      on(window, "pointermove", mv);
      document.querySelectorAll("[data-hover]").forEach((el) => {
        const h = () => ring.classList.add("hovering"), l = () => ring.classList.remove("hovering");
        on(el, "pointerenter", h); on(el, "pointerleave", l);
      });
      cleanups.push(() => cancelAnimationFrame(curRaf));
    }

    /* ---------- nav hide/show ---------- */
    const nav = document.getElementById("nav");
    if (nav) {
      let last = 0;
      const nf = () => {
        const y = scrollY;
        nav.classList.toggle("scrolled", y > 40);
        nav.classList.toggle("hidden", y > last && y > 420);
        last = y;
      };
      on(window, "scroll", nf, { passive: true });
    }

    /* ---------- reveals ---------- */
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv,.step").forEach((el) => io.observe(el));
    document.querySelectorAll(".col-grid").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* ---------- counters ---------- */
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1600;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * ease);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: .6 });
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));
    cleanups.push(() => cio.disconnect());

    /* ---------- hero parallax ---------- */
    const stage = document.getElementById("heroStage");
    if (stage) {
      const pans = [...stage.querySelectorAll(".pan")];
      let tx = 0, ty = 0, cx = 0, cy = 0, pRaf;
      const mv = (e) => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; };
      on(window, "pointermove", mv);
      (function pl() {
        cx += (tx - cx) * .06; cy += (ty - cy) * .06;
        pans.forEach((p) => { const d = +p.dataset.depth; p.style.translate = `${cx * 14 * d}px ${cy * 10 * d}px`; });
        pRaf = requestAnimationFrame(pl);
      })();
      cleanups.push(() => cancelAnimationFrame(pRaf));
    }

    /* ---------- triply sticky scene ---------- */
    const tStage = document.getElementById("triplyStage");
    if (tStage) {
      const top = document.getElementById("lTop"), mid = document.getElementById("lMid"), bot = document.getElementById("lBot");
      const pan = document.getElementById("heatPan"), rings = document.getElementById("heatRings"), flash = document.getElementById("bondFlash");
      const specs = [...document.querySelectorAll(".spec-strip .spec")];
      const caps = ["c1", "c2", "c3"].map((id) => document.getElementById(id));
      const update = () => {
        const r = tStage.getBoundingClientRect();
        const total = r.height - innerHeight;
        let p = Math.min(Math.max(-r.top / total, 0), 1);
        const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const sep = e * (innerWidth < 760 ? 30 : 95);
        if (top) top.style.transform = `translateY(${-sep}px) rotateX(${e * 10}deg)`;
        if (bot) bot.style.transform = `translateY(${sep}px) rotateX(${-e * 10}deg)`;
        if (mid) mid.style.transform = `scaleX(${1 + e * .06})`;
        if (top && bot) top.style.boxShadow = bot.style.boxShadow = `0 ${18 + e * 22}px ${30 + e * 30}px rgba(0,0,0,${.25 + e * .3})`;
        if (pan) pan.style.transform = `translateY(${-8 - p * 30}px) rotate(${(.5 - p) * 5}deg) scale(${.93 + p * .09})`;
        if (rings) rings.classList.toggle("play", p > .12);
        if (flash) flash.style.opacity = Math.max(0, 1 - Math.abs(p - .55) / .12) * .9;
        specs.forEach((s, i) => s.classList.toggle("on", p > .5 + i * .07));
        caps.forEach((c, i) => {
          if (!c) return;
          const on = p > .6 + i * .1;
          c.style.opacity = on ? 1 : 0;
          c.style.transform = on ? "none" : "translateY(22px)";
        });
        tStage.querySelectorAll(".tag").forEach((t, i) => { t.style.opacity = p > .28 + i * .14 ? 1 : 0; });
      };
      on(window, "scroll", update, { passive: true });
      on(window, "resize", update);
      update();
    }

    /* ---------- steps progress ---------- */
    const steps = document.getElementById("steps"), sFill = document.getElementById("stepsFill");
    if (steps && sFill) {
      const uf = () => {
        const r = steps.getBoundingClientRect();
        const p = Math.min(Math.max((innerHeight * .75 - r.top) / r.height, 0), 1);
        sFill.style.height = p * 100 + "%";
      };
      on(window, "scroll", uf, { passive: true });
      uf();
    }

    /* ---------- magnetic buttons ---------- */
    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".btn,.nav-cta").forEach((el) => {
        const mv = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) / r.width;
          const y = (e.clientY - r.top - r.height / 2) / r.height;
          el.style.transform = `translate(${x * 10}px,${y * 8}px)`;
        };
        const lv = () => { el.style.transform = ""; };
        on(el, "pointermove", mv); on(el, "pointerleave", lv);
      });
    }

    /* ---------- glow-follow cards ---------- */
    document.querySelectorAll(".card").forEach((card) => {
      const mv = (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      };
      on(card, "pointermove", mv);
    });

    /* ---------- 3D tilt on cards ---------- */
    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".card").forEach((card) => {
        const mv = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          card.style.transform = `translateY(-10px) perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 7}deg)`;
        };
        const lv = () => { card.style.transform = ""; };
        on(card, "pointermove", mv); on(card, "pointerleave", lv);
      });
    }

    /* ---------- instagram-style like buttons ---------- */
    const likes = JSON.parse(localStorage.getItem("jh_likes") || "{}");
    const seedCount = (id) => { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997; return 12 + (h % 48); };
    document.querySelectorAll(".like-btn").forEach((btn) => {
      const id = btn.dataset.id;
      const span = btn.querySelector(".lc");
      const count = () => (likes[id] || 0) + seedCount(id);
      span.textContent = count();
      if (likes[id]) btn.classList.add("liked");
      const click = (e) => {
        e.preventDefault();
        const was = !!likes[id];
        likes[id] = was ? 0 : (likes[id] || 0) + 1;
        localStorage.setItem("jh_likes", JSON.stringify(likes));
        btn.classList.toggle("liked", !was);
        span.textContent = count();
        if (!was) {
          const b = document.createElement("span");
          b.className = "like-burst";
          for (let i = 0; i < 8; i++) {
            const p = document.createElement("i");
            const a = (Math.PI * 2 / 8) * i + Math.random() * .5;
            const d = 26 + Math.random() * 22;
            p.style.setProperty("--bx", Math.cos(a) * d + "px");
            p.style.setProperty("--by", Math.sin(a) * d + "px");
            b.appendChild(p);
          }
          btn.appendChild(b);
          setTimeout(() => b.remove(), 750);
        }
      };
      on(btn, "click", click);
    });

    /* ---------- random reward glints on featured cards ---------- */
    const wideCards = [...document.querySelectorAll(".card.wide")];
    if (wideCards.length) {
      const gTimer = setInterval(() => {
        const c = wideCards[Math.floor(Math.random() * wideCards.length)];
        c.classList.add("glinting");
        setTimeout(() => c.classList.remove("glinting"), 1200);
      }, 4200);
      cleanups.push(() => clearInterval(gTimer));
    }

    /* ---------- click ripples ---------- */
    document.querySelectorAll(".btn,.nav-cta,.tab").forEach((el) => {
      const fn = (e) => {
        const r = el.getBoundingClientRect();
        const s = document.createElement("span");
        s.className = "ripple";
        const size = Math.max(r.width, r.height);
        s.style.width = s.style.height = size + "px";
        s.style.left = (e.clientX - r.left - size / 2) + "px";
        s.style.top = (e.clientY - r.top - size / 2) + "px";
        if (el.classList.contains("btn-ghost") || el.classList.contains("tab")) s.style.background = "rgba(194,67,11,.22)";
        el.appendChild(s);
        setTimeout(() => s.remove(), 700);
      };
      on(el, "click", fn);
    });

    /* ---------- pan spin on click ---------- */
    document.querySelectorAll(".pan").forEach((p) => {
      const fn = () => { p.classList.remove("spin"); void p.offsetWidth; p.classList.add("spin"); setTimeout(() => p.classList.remove("spin"), 950); };
      on(p, "click", fn);
    });

    /* ---------- cursor press feedback ---------- */
    const ringPress = document.querySelector(".cursor-ring");
    on(window, "pointerdown", () => ringPress && ringPress.classList.add("press"));
    on(window, "pointerup", () => ringPress && ringPress.classList.remove("press"));

    /* ---------- live price overlay (Hostinger: overrides baked-in prices) ---------- */
    (async () => {
      try {
        const r = await fetch("/api/prices.php");
        if (!r.ok) return;
        const map = await r.json();
        document.querySelectorAll(".card[data-slug]").forEach((card) => {
          const d = map[card.dataset.slug];
          if (!d) return;
          const row = card.querySelector(".price-row");
          if (!row) return;
          const inr = (n) => "₹" + n.toLocaleString("en-IN");
          if (d.price) {
            const off = d.mrp ? Math.round((1 - d.price / d.mrp) * 100) : 0;
            row.innerHTML =
              `<span class="price">${inr(d.price)}</span>` +
              (d.mrp && d.mrp > d.price ? `<span class="mrp">${inr(d.mrp)}</span>` : "") +
              (off >= 15 ? `<span class="off-badge">${off}% off</span>` : "");
          } else {
            row.innerHTML = `<span class="moq-note">${d.moq ? "MOQ " + d.moq + " units · " : ""}price on request</span>`;
          }
        });
      } catch {}
    })();

    /* ---------- enquiry form ---------- */
    const form = document.getElementById("enquiryForm");
    if (form) {
      const btn = form.querySelector('button[type="submit"]');
      const sf = async (e) => {
        e.preventDefault();
        if (!btn) return;
        const fd = Object.fromEntries(new FormData(form).entries());
        const orig = btn.innerHTML;
        btn.innerHTML = "Opening WhatsApp…";
        btn.disabled = true;
        let wa = null;
        try {
          const r = await fetch("/api/enquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fd),
          });
          const data = await r.json();
          wa = data.wa;
        } catch {}
        if (!wa) {
          const msg = `Hello JHANARICH! I'm ${fd.name} (${fd.business}). Interested in: ${fd.line}. ${fd.message || ""}`;
          wa = "https://wa.me/919440121743?text=" + encodeURIComponent(msg);
        }
        window.open(wa, "_blank");
        btn.innerHTML = "Sent ✓ — continuing on WhatsApp";
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; form.reset(); }, 3200);
      };
      on(form, "submit", sf);
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return null;
}
