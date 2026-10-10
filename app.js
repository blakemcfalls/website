/* =========================================================
   CONTENT — edit everything about the site here.
   ========================================================= */
const PROFILE = {
  name: "Blake McFalls",
  tagline: "National security & defense technology",
  intro: "I build tools and write about the systems that keep deterrence stable: risk monitoring, missile defense, and the policy choices around them.",
};

// Each project's visual: viz "risk" (risk globe) or a 3D scene id:
// "nuke", "icbm", "interceptor", "jet", "drone", "satellite", "aesa".
const PROJECTS = [
  {
    title: "Geopolitical Risk Tracker",
    tag: "Data · Intelligence",
    viz: "risk",
    desc: "A dashboard that pulls open-source indicators like conflict events, military posture and diplomatic signals into one country-level risk score. Hotspots on a live globe pulse and change color as conditions shift, so an emerging flashpoint is visible at a glance.",
    stack: ["Python", "OSINT feeds", "Risk scoring", "Data viz"],
  },
  {
    title: "Missile Defense Glove",
    tag: "Hardware · Human–machine interface",
    viz: "interceptor",
    inset: "glove",
    dist: 1.3,
    cap: "Gesture-guided intercept · simulated",
    desc: "A wearable controller that reads hand motion with flex sensors and an inertial measurement unit, then uses those gestures to direct a simulated interceptor against an incoming track. It is a prototype for faster, more intuitive operator control in air and missile defense.",
    stack: ["Microcontroller", "Flex sensors", "IMU", "Embedded C"],
  },
  {
    title: "Your Next Project",
    tag: "Placeholder",
    viz: "drone",
    desc: "Add another project by copying an entry in the PROJECTS list in app.js. Give it a title, tag, description and stack, then pick its visual from the list above that entry.",
    stack: ["Edit app.js"],
  },
];

// Each piece: slug (URL id), title, date, venue/tag, summary, body (array of paragraphs),
// and scene: the 3D model shown with the piece (same ids as project visuals).
const WRITING = [
  {
    slug: "polaris-cold-war-nuclear-strategy",
    title: "Polaris and Cold War Nuclear Strategy, 1953–64",
    date: "",
    venue: "Research paper",
    summary: "How the Polaris submarine-launched ballistic missile program shaped American nuclear strategy from the Eisenhower years through the early 1960s.",
    body: [
      "[Paste the full text of this paper here. In app.js, find this entry in the WRITING list and add each paragraph as its own string in the body array.]",
    ],
    scene: "icbm",
  },
  {
    slug: "people-problem-rare-earths",
    title: "The People Problem in Rare Earths",
    date: "",
    venue: "Essay",
    summary: "Why the rare earth supply chain is constrained by people and expertise, not only by ore.",
    body: [
      "[Paste the full text of this essay here. In app.js, find this entry in the WRITING list and add each paragraph as its own string in the body array.]",
    ],
    scene: "drone",
  },
];

const DISTINCTIONS = {
  gpa: "4.7",
  sat: "1550",
  aps: [
    "Chemistry", "Calculus AB", "U.S. History", "Comparative Government",
    "U.S. Government", "English Language", "Biology", "World History", "Human Geography",
  ],
  honors: [
    { title: "John Locke Global Essay Prize", detail: "Commendation", org: "John Locke Institute" },
  ],
  debate: {
    stats: [
      { value: "4", unit: "th", label: "Ranked in the nation" },
      { value: "13", label: "National circuit tournament placements" },
      { value: "3", unit: "×", label: "Broke at nationals" },
      { value: "2", unit: "×", label: "Second place at state" },
    ],
    honors: [{ title: "Academic All-American", sub: "Speech & debate", badge: "Honor" }],
  },
};

/* =========================================================
   PROJECT VISUALIZATIONS
   ========================================================= */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = n => String(n).padStart(2, "0");

// Rotating dot-matrix globe with pulsing risk hotspots (2D canvas)
function riskGlobe(canvas) {
  const ctx = canvas.getContext("2d"), N = 1100, pts = [];
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
  const HOT = [["Taiwan Strait", 24, 120], ["Korean Peninsula", 38, 127], ["Eastern Europe", 49, 32], ["Persian Gulf", 27, 52], ["Sahel", 15, 2], ["South China Sea", 12, 114], ["Kashmir", 34, 76]]
    .map(([n, la, lo], k) => { const a = la * Math.PI / 180, b = lo * Math.PI / 180; return { n, k, p: [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)] }; });
  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  function frame(t) {
    if (!canvas.isConnected) return;
    if (visible || t === 0) {
      const dpr = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
      if (canvas.width !== Math.round(W * dpr)) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * .4, cx = W * .6, cy = H * .5, rot = t / 9000, c = Math.cos(rot), s = Math.sin(rot), tilt = .35, ct = Math.cos(tilt), st = Math.sin(tilt);
      const proj = ([x, y, z]) => { const x1 = x * c + z * s, z1 = -x * s + z * c, y1 = y * ct - z1 * st, z2 = y * st + z1 * ct; return [cx + x1 * R, cy - y1 * R, z2]; };
      for (const p of pts) {
        const [x, y, z] = proj(p);
        if (z < -.1) continue;
        ctx.fillStyle = `rgba(143,230,255,${.12 + z * .55})`; ctx.fillRect(x - .9, y - .9, 1.8, 1.8);
      }
      ctx.strokeStyle = "rgba(89,225,255,.18)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const risks = HOT.map(h => .5 + .5 * Math.sin(t / 1700 * (.6 + h.k * .13) + h.k * 1.7));
      HOT.forEach((h, k) => {
        const [x, y, z] = proj(h.p), r = risks[k];
        if (z < 0) return;
        const col = r > .75 ? "255,77,61" : r > .45 ? "255,181,71" : "89,225,255";
        const ph = (t / 1400 + k * .3) % 1;
        ctx.strokeStyle = `rgba(${col},${(1 - ph) * .9})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 4 + ph * (10 + r * 18), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = "500 10px 'JetBrains Mono', monospace"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(116,129,140,1)"; ctx.fillText("RISK INDEX // SIMULATED", 16, 22);
      HOT.forEach((h, k) => {
        const y = 46 + k * 22, r = risks[k], col = r > .75 ? "#ff4d3d" : r > .45 ? "#ffb547" : "#59e1ff";
        ctx.fillStyle = "rgba(185,196,204,.9)"; ctx.fillText(h.n.toUpperCase(), 16, y);
        ctx.fillStyle = "rgba(150,200,225,.15)"; ctx.fillRect(16, y + 8, 110, 3);
        ctx.fillStyle = col; ctx.fillRect(16, y + 8, 110 * r, 3);
      });
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame(0);
}

// The glove itself, shown as an inset over its 3D intercept scene
function gloveInset() {
  const finger = (x, len, d) => `<g class="curl" style="animation-delay:${d}s">
      <rect x="${x}" y="${150 - len}" width="28" height="${len + 20}" rx="14" fill="#0a0e13" stroke="#59e1ff" stroke-opacity=".7"/>
      <line x1="${x + 14}" y1="${160 - len}" x2="${x + 14}" y2="158" stroke="#ffb547" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle class="pulse" style="animation-delay:${d}s" cx="${x + 14}" cy="${163 - len}" r="3.5" fill="#ffb547"/></g>`;
  return `<svg class="inset" viewBox="30 50 190 210" role="img" aria-label="Sensor glove with flex sensors on each finger and an IMU on the back of the hand">
    <style>.curl{animation:curl 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes curl{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.8)}}
      .pulse{animation:pulse 1.6s ease-in-out infinite}@keyframes pulse{50%{opacity:.25}}</style>
    ${finger(52, 66, 0)}${finger(84, 86, .15)}${finger(116, 80, .3)}${finger(148, 62, .45)}
    <g class="curl" style="animation-delay:.6s"><rect x="166" y="160" width="28" height="72" rx="14" fill="#0a0e13" stroke="#59e1ff" stroke-opacity=".7" transform="rotate(26 181 225)"/></g>
    <rect x="48" y="140" width="132" height="98" rx="30" fill="#0a0e13" stroke="#59e1ff"/>
    <rect x="86" y="170" width="54" height="36" fill="none" stroke="#59e1ff" stroke-opacity=".7"/>
    <path d="M113 188h18M113 188v-14M113 188l-10 8" stroke="#ffb547" stroke-width="1.5"/>
    <text x="86" y="221" font-family="JetBrains Mono" font-size="8" fill="#74818c" letter-spacing="1">IMU</text>
  </svg>`;
}

/* =========================================================
   VIEWS
   ========================================================= */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const metaLine = w => [w.venue, w.date].filter(Boolean).map(esc).join(" · ");
// A 3D model rendered into the page by lab.js
const scene = (id, cls = "", dist = 1) => `<div class="scene ${cls}" data-scene="${id}"${dist !== 1 ? ` data-dist="${dist}"` : ""} aria-hidden="true"></div>`;
const pageHead = (eyebrow, title, lede, sceneId) => `<div class="pagehead has-visual">
    <div class="ph-copy"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ""}</div>
    ${scene(sceneId, "ph-visual")}
  </div>`;

function home() {
  const [first, ...rest] = PROFILE.name.split(" ");
  return `<section class="page">
    <div class="hero">
      <canvas class="hero-globe" aria-hidden="true"></canvas>
      <div class="hero-copy">
        <p class="eyebrow">// Portfolio · ${esc(PROFILE.tagline)}</p>
        <h1>${esc(first)}<br><span>${esc(rest.join(" "))}</span></h1>
        <p class="lede">${esc(PROFILE.intro)}</p>
        <div class="cta"><a class="btn" href="#/projects">View projects →</a><a class="btn ghost" href="#/writing">Read my writing</a></div>
      </div>
      <dl class="telemetry">
        <div><dt>GPA · weighted</dt><dd><span data-count="${DISTINCTIONS.gpa}">${DISTINCTIONS.gpa}</span><small>W</small></dd></div>
        <div><dt>SAT</dt><dd><span data-count="${DISTINCTIONS.sat}">${DISTINCTIONS.sat}</span></dd></div>
        <div><dt>AP exams · score 5</dt><dd><span data-count="${DISTINCTIONS.aps.length}">${DISTINCTIONS.aps.length}</span><small>×5</small></dd></div>
        <div><dt>Speech &amp; debate · national</dt><dd><span data-count="${DISTINCTIONS.debate.stats[0].value}">${DISTINCTIONS.debate.stats[0].value}</span><small>TH</small></dd></div>
        <div><dt>John Locke Essay Prize</dt><dd>Commended</dd></div>
      </dl>
    </div>
    <div class="tiles">
      <a class="frame tile" href="#/projects">${scene("jet")}<span class="eyebrow">02 · Projects</span><h3>Defense tech I've built</h3><p>${PROJECTS.filter(p => p.tag !== "Placeholder").map(p => esc(p.title)).join(" · ")}</p><span class="go">Open →</span></a>
      <a class="frame tile" href="#/writing">${scene("icbm")}<span class="eyebrow">03 · Writing</span><h3>Essays & analysis</h3><p>${WRITING.map(w => esc(w.title)).join(" · ")}</p><span class="go">Open →</span></a>
      <a class="frame tile" href="#/distinctions">${scene("satellite")}<span class="eyebrow">04 · Distinctions</span><h3>Academics & awards</h3><p>Ranked 4th nationally in speech &amp; debate · 4.7 GPA · 1550 SAT · 9 AP 5s</p><span class="go">Open →</span></a>
    </div>
  </section>`;
}

function projects() {
  return `<section class="page">
    ${pageHead("// 02 · Projects", "Built &amp; tested", "Hardware and software prototypes for sensing, risk monitoring and operator control.", "aesa")}
    <div class="projects">${PROJECTS.map((p, i) => `
      <article class="frame project">
        <div class="copy">
          <span class="eyebrow">${pad(i + 1)} // ${esc(p.tag)}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
          <ul>${p.stack.map(s => `<li class="tag">${esc(s)}</li>`).join("")}</ul>
        </div>
        <div class="pviz">
          ${p.viz === "risk" ? `<canvas class="risk" role="img" aria-label="Rotating globe with pulsing geopolitical risk hotspots"></canvas>` : scene(p.viz, "", p.dist)}
          ${p.inset === "glove" ? gloveInset() : ""}
          ${p.cap ? `<span class="cap">${esc(p.cap)}</span>` : ""}
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function writingList() {
  return `<section class="page">
    ${pageHead("// 03 · Writing", "Essays &amp; analysis", "Research and argument on nuclear strategy, supply chains and national security. Select a piece to read it in full.", "nuke")}
    <div class="list">${WRITING.map((w, i) => `
      <a class="piece-row" href="#/writing/${encodeURIComponent(w.slug)}">
        <span class="n">${pad(i + 1)}</span>
        <div><span class="meta">${metaLine(w)}</span><h3 style="margin-top:10px">${esc(w.title)}</h3><p>${esc(w.summary)}</p><span class="go">Read →</span></div>
        <div class="thumb frame">${w.scene ? scene(w.scene) : ""}</div>
      </a>`).join("")}
    </div>
  </section>`;
}

function article(slug) {
  const w = WRITING.find(x => x.slug === slug);
  if (!w) return writingList();
  return `<section class="page">
    <div class="progress" aria-hidden="true"><i></i></div>
    <a class="btn ghost back" href="#/writing">← All writing</a>
    <article class="frame article">
      ${w.scene ? scene(w.scene, "article-visual") : ""}
      <span class="eyebrow">${metaLine(w)}</span>
      <h1>${esc(w.title)}</h1>
      <div class="meta">${[PROFILE.name, w.date].filter(Boolean).map(esc).join(" · ")}</div>
      ${w.body.map(p => `<p>${esc(p)}</p>`).join("")}
    </article>
  </section>`;
}

function distinctions() {
  const d = DISTINCTIONS;
  return `<section class="page">
    ${pageHead("// 04 · Distinctions", "Academics &amp; awards", "Ranked fourth in the nation in speech and debate, with a 4.7 weighted GPA, a 1550 SAT and a 5 on nine AP exams.", "satellite")}
    <div class="readouts">
      <div class="frame readout"><span class="eyebrow">Weighted GPA</span><div class="big"><span data-count="${d.gpa}">${d.gpa}</span><small>W</small></div><div class="meter"><i style="--v:${Math.min(1, d.gpa / 5)}"></i></div></div>
      <div class="frame readout"><span class="eyebrow">SAT</span><div class="big"><span data-count="${d.sat}">${d.sat}</span><small>/1600</small></div><div class="meter"><i style="--v:${d.sat / 1600}"></i></div></div>
      <div class="frame readout"><span class="eyebrow">AP exams</span><div class="big"><span data-count="${d.aps.length}">${d.aps.length}</span><small>× score of 5</small></div><div class="meter"><i style="--v:1"></i></div></div>
    </div>
    <div class="subsec"><header><h2>AP scholar record</h2><span class="eyebrow">Score of 5 on every exam</span></header>
      <div class="aps">${d.aps.map(a => `<div class="ap"><span>AP ${esc(a)}</span><span class="bars" aria-hidden="true">${"<i></i>".repeat(5)}</span><b>5</b></div>`).join("")}</div></div>
    <div class="subsec"><header><h2>Writing honors</h2></header>
      <div class="awards">${d.honors.map((h, i) => `<div class="award"><span class="n">${pad(i + 1)}</span><div><h3>${esc(h.title)}</h3><div class="sub">${esc(h.org)}</div></div><span class="badge">${esc(h.detail)}</span></div>`).join("")}</div></div>
    <div class="subsec"><header><h2>Speech &amp; debate</h2><span class="eyebrow">Ranked 4th in the nation</span></header>
      <div class="readouts four" style="margin-top:24px">${d.debate.stats.map(s => `<div class="frame readout"><div class="big"><span data-count="${s.value}">${s.value}</span>${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</div><span class="label">${esc(s.label)}</span></div>`).join("")}</div>
      <div class="awards" style="margin-top:12px">${d.debate.honors.map((h, i) => `<div class="award"><span class="n">${pad(i + 1)}</span><div><h3>${esc(h.title)}</h3><div class="sub">${esc(h.sub)}</div></div><span class="badge">${esc(h.badge)}</span></div>`).join("")}</div></div>
  </section>`;
}

/* =========================================================
   MOTION LAYER
   ========================================================= */
const revealer = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.querySelectorAll("[data-count]").forEach(countUp);
  revealer.unobserve(e.target);
}), { threshold: .12 });

function countUp(el) {
  const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
  if (reduceMotion || isNaN(end)) return;
  const t0 = performance.now(), dur = 1400;
  (function tick(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.textContent = (end * e).toFixed(dec);
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

// "Declassify" text scramble for mono eyebrows
const GLYPHS = "▓▒░█#/\\<>-_=+*01";
function scramble(el) {
  const text = el.textContent;
  if (reduceMotion || !text.trim()) return;
  let f = 0;
  const total = 26;
  (function step() {
    el.textContent = [...text].map((ch, i) =>
      ch === " " || i < (f / total) * text.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
    if (++f <= total) requestAnimationFrame(step); else el.textContent = text;
  })();
}

// Sliding underline under the active nav tab
function movePill() {
  const nav = document.getElementById("nav"), on = nav.querySelector("a.on"), pill = nav.querySelector(".pill");
  if (!on || !pill) return;
  pill.style.width = on.offsetWidth + "px";
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
}

function progress() {
  const bar = document.querySelector(".progress i");
  if (!bar) return;
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 1})`;
}
addEventListener("scroll", progress, { passive: true });

// Live UTC clock in the header
function tickClock() {
  const el = document.getElementById("clock");
  if (el) el.textContent = "UTC " + new Date().toISOString().slice(11, 19);
}
setInterval(tickClock, 1000); tickClock();
document.getElementById("year").textContent = new Date().getFullYear();

let mounted = [];
function animateView(view) {
  view.querySelectorAll(".pagehead, .hero-copy, .telemetry, .sechead, .frame, .piece-row, .subsec").forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", `${Math.min(i, 6) * 80}ms`);
    revealer.observe(el);
  });
  view.querySelectorAll(".eyebrow").forEach(scramble);
  view.querySelectorAll("canvas.risk").forEach(riskGlobe);
  if (window.Lab) {
    const globe = view.querySelector(".hero-globe");
    if (globe) mounted.push(Lab.heroGlobe(globe));
    view.querySelectorAll("[data-scene]").forEach(el => mounted.push(Lab.scene(el, el.dataset.scene, { dist: +el.dataset.dist || 1 })));
  }
  movePill();
  progress();
}

/* =========================================================
   ROUTER
   ========================================================= */
function draw() {
  mounted.forEach(m => m.dispose()); mounted = [];
  const [, route = "", sub] = location.hash.replace(/^#/, "").split("/");
  const view = document.getElementById("view");
  const map = { "": home, projects, writing: () => sub ? article(decodeURIComponent(sub)) : writingList(), distinctions };
  view.innerHTML = (map[route] || home)();
  document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("on", a.dataset.route === (route || "home")));
  document.title = `${PROFILE.name} — ${route ? route[0].toUpperCase() + route.slice(1) : "National Security & Defense Technology"}`;
  scrollTo(0, 0);
  if (location.hash) view.focus({ preventScroll: true });
  animateView(view);
}
function render() {
  if (document.startViewTransition && !reduceMotion && document.getElementById("view").childElementCount)
    document.startViewTransition(draw);
  else draw();
}
addEventListener("click", e => {
  const a = e.target.closest("[data-scroll]");
  if (!a) return;
  e.preventDefault();
  document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});
addEventListener("resize", movePill);
document.getElementById("nav").insertAdjacentHTML("afterbegin", '<span class="pill" aria-hidden="true"></span>');
document.fonts && document.fonts.ready.then(movePill);
addEventListener("hashchange", render);
render();
