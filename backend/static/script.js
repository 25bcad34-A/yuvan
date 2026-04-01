/* Page visit counter */
(function () {
  fetch("/api/visit", { method: "POST" }).catch(function () {});
})();

/* ─────────────────────────────────────────────
   1. CANVAS STARFIELD
───────────────────────────────────────────── */
(function () {
  const cv = document.getElementById("stars");
  const ctx = cv.getContext("2d");
  let W,
    H,
    stars = [],
    shoots = [];

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* Star factory */
  function mkStar() {
    const cols = ["#e8f4fd", "#00f5ff", "#c724ff", "#ff2d78", "#ffb800"];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.2,
      a: Math.random(),
      da: (Math.random() * 0.012 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      c: Math.random() > 0.8 ? cols[Math.floor(Math.random() * cols.length)] : "#e8f4fd",
    };
  }

  /* Shooting star factory */
  function mkShoot() {
    const spd = Math.random() * 8 + 6;
    const ang = Math.PI / 6;
    return {
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      len: Math.random() * 110 + 55,
      life: 1,
      decay: Math.random() * 0.015 + 0.01,
    };
  }

  /* Init stars */
  const N = Math.min(300, Math.floor((W * H) / 6500));
  for (let i = 0; i < N; i++) stars.push(mkStar());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Twinkle stars */
    stars.forEach((s) => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      s.a = Math.max(0, Math.min(1, s.a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.c;
      ctx.globalAlpha = s.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    /* Shooting stars */
    if (Math.random() < 0.008) shoots.push(mkShoot());
    shoots = shoots.filter((s) => s.life > 0);
    shoots.forEach((s) => {
      const tx = s.x - s.vx * (s.len / 14);
      const ty = s.y - s.vy * (s.len / 14);
      const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
      g.addColorStop(0, "rgba(0,245,255,0)");
      g.addColorStop(1, `rgba(255,255,255,${s.life})`);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────────────────────
   2. CUSTOM CURSOR — Fixed version
───────────────────────────────────────────── */
(function () {
  const ring = document.getElementById("cur-ring");
  const dot = document.getElementById("cur-dot");

  let mx = window.innerWidth / 2,
    my = window.innerHeight / 2;
  let rx = mx,
    ry = my;

  document.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  });

  function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    requestAnimationFrame(animRing);
  }
  animRing();

  const targets = document.querySelectorAll("a, button, .skcard, .pcard, .chip, .soclink");
  targets.forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.addEventListener("mouseleave", () => {
    ring.style.opacity = "0";
    dot.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    ring.style.opacity = "1";
    dot.style.opacity = "1";
  });
})();

/* ─────────────────────────────────────────────
   3. NAVBAR SCROLL + HAMBURGER
───────────────────────────────────────────── */
(function () {
  const nav = document.getElementById("nav");
  const hbg = document.getElementById("hbg");
  const ul = document.getElementById("navul");

  window.addEventListener("scroll", () => nav.classList.toggle("up", scrollY > 60));

  hbg.addEventListener("click", () => ul.classList.toggle("open"));
  ul.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => ul.classList.remove("open")));
})();

/* ─────────────────────────────────────────────
   4. THEME TOGGLE
───────────────────────────────────────────── */
document.getElementById("thm").addEventListener("click", function () {
  const html = document.documentElement;
  const dark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", dark ? "light" : "dark");
  this.textContent = dark ? "🌑 DARK" : "☀ LIGHT";
});

/* ─────────────────────────────────────────────
   5. SCROLL REVEAL
───────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll(".rev,.rev-l,.rev-r");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const del = parseInt(el.dataset.delay || 0, 10);
          setTimeout(() => el.classList.add("on"), del);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.14 }
  );
  els.forEach((el) => obs.observe(el));
})();

/* ─────────────────────────────────────────────
   6. SKILL BARS
───────────────────────────────────────────── */
(function () {
  const fills = document.querySelectorAll(".sbar-fill");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.w + "%";
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  fills.forEach((f) => obs.observe(f));
})();

/* ─────────────────────────────────────────────
   7. SKILL CIRCLES (SVG stroke-dashoffset)
───────────────────────────────────────────── */
(function () {
  const C = 2 * Math.PI * 40;
  const circles = document.querySelectorAll(".cfill");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const pct = parseInt(e.target.dataset.pct, 10);
          e.target.style.strokeDashoffset = C - (pct / 100) * C;
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  circles.forEach((c) => obs.observe(c));
})();

/* ─────────────────────────────────────────────
   8. 3D TILT — project cards
───────────────────────────────────────────── */
document.querySelectorAll(".pcard").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-12px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) scale(1.02)`;
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});

/* ─────────────────────────────────────────────
   9. PARTICLE BURST — global function
───────────────────────────────────────────── */
function burst(e) {
  const x = e.clientX,
    y = e.clientY;
  const COLS = ["#00f5ff", "#ff2d78", "#c724ff", "#ffb800", "#ffffff", "#4d6fff"];
  const N = 20;
  for (let i = 0; i < N; i++) {
    const p = document.createElement("div");
    p.className = "bpart";
    const ang = (i / N) * 2 * Math.PI;
    const dist = Math.random() * 80 + 40;
    const tx = Math.cos(ang) * dist;
    const ty = Math.sin(ang) * dist;
    const col = COLS[i % COLS.length];
    const sz = Math.random() * 5 + 3 + "px";
    p.style.cssText = `
      left:${x}px;top:${y}px;
      width:${sz};height:${sz};
      background:${col};
      box-shadow:0 0 8px ${col};
      --tx:${tx}px;--ty:${ty}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

document.querySelectorAll(".btn,.bsm,.bsend,.soclink,.skcard").forEach((el) => {
  el.addEventListener("click", burst);
});

document.getElementById("sun")?.addEventListener("click", (e) => {
  for (let k = 0; k < 4; k++)
    setTimeout(
      () =>
        burst({
          clientX: e.clientX + (Math.random() - 0.5) * 50,
          clientY: e.clientY + (Math.random() - 0.5) * 50,
        }),
      k * 100
    );
});

/* ─────────────────────────────────────────────
   10. HERO FLOATING STARS (JS layer)
───────────────────────────────────────────── */
(function () {
  const hero = document.getElementById("hero");
  const COLS = ["#00f5ff", "#c724ff", "#ff2d78", "#ffb800", "#ffffff"];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("div");
    const sz = Math.random() * 4 + 2;
    const col = COLS[Math.floor(Math.random() * COLS.length)];
    const dur = Math.random() * 4 + 2;
    const del = Math.random() * 5;
    s.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      width:${sz}px;height:${sz}px;
      background:${col};border-radius:50%;
      pointer-events:none;
      box-shadow:0 0 ${sz * 3}px ${col};
      opacity:.8;z-index:1;
      animation:hstarf ${dur}s ease-in-out ${del}s infinite alternate;
    `;
    hero.appendChild(s);
  }
  const st = document.createElement("style");
  st.textContent = `
    @keyframes hstarf{
      from{transform:translate(0,0) scale(1);opacity:.35}
      to{transform:translate(0,var(--ty,-12px)) scale(1.5);opacity:1}
    }
  `;
  document.head.appendChild(st);
})();

/* ─────────────────────────────────────────────
   11. CONTACT FORM — backend API
───────────────────────────────────────────── */
function validEmail(email) {
  if (!email || typeof email !== "string") return false;
  const t = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  const parts = t.split("@");
  return parts.length === 2 && parts[1].includes(".");
}

document.getElementById("sendBtn").addEventListener("click", async function (e) {
  burst(e);
  const n = document.getElementById("cname").value.trim();
  const em = document.getElementById("cemail").value.trim();
  const m = document.getElementById("cmsg").value.trim();
  const cstat = document.getElementById("cstat");

  function showStatus(text, ok) {
    cstat.textContent = text;
    cstat.classList.toggle("on", !!text);
    cstat.classList.toggle("cstat-err", !ok && !!text);
  }

  if (!n || !em || !m) {
    [
      ["cname", n],
      ["cemail", em],
      ["cmsg", m],
    ].forEach(([id, val]) => {
      if (!val) {
        const el = document.getElementById(id);
        el.style.borderColor = "var(--magenta)";
        el.style.boxShadow = "var(--gmag)";
        setTimeout(() => {
          el.style.borderColor = "";
          el.style.boxShadow = "";
        }, 1600);
      }
    });
    showStatus("Please fill in name, email, and message.", false);
    return;
  }

  if (!validEmail(em)) {
    const el = document.getElementById("cemail");
    el.style.borderColor = "var(--magenta)";
    el.style.boxShadow = "var(--gmag)";
    setTimeout(() => {
      el.style.borderColor = "";
      el.style.boxShadow = "";
    }, 1600);
    showStatus("Please enter a valid email address.", false);
    return;
  }

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, email: em, message: m }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      showStatus("✦ Signal received! I'll respond from across the cosmos. ✦", true);
      document.getElementById("cname").value = "";
      document.getElementById("cemail").value = "";
      document.getElementById("cmsg").value = "";
      setTimeout(() => burst({ clientX: innerWidth / 2, clientY: innerHeight / 2 }), 300);
    } else {
      showStatus(data.error || "Transmission failed. Please try again.", false);
    }
  } catch (err) {
    showStatus("Network error. Please try again.", false);
  }
});

/* ─────────────────────────────────────────────
   12. ACTIVE NAV LINK
───────────────────────────────────────────── */
(function () {
  const secs = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-ul a");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => {
            a.style.color = a.getAttribute("href") === "#" + e.target.id ? "var(--cyan)" : "";
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  secs.forEach((s) => obs.observe(s));
})();

/* ─────────────────────────────────────────────
   13. SMOOTH SCROLL
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ─────────────────────────────────────────────
   14. CONSOLE EASTER EGG
───────────────────────────────────────────── */
console.log("%c✦ YUVAN SHAKTHI S ✦", "color:#00f5ff;font-size:2rem;font-weight:900;font-family:monospace");
console.log("%cWelcome to the cosmos. The stars are made of data.", "color:#c724ff;font-size:1rem;font-family:monospace");
