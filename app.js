/* =========================================================
   CONTENT — edit everything about the site here.
   ========================================================= */
const PROFILE = {
  name: "Blake McFalls",
  tagline: "National security & defense technology",
  intro: "I build tools and write about the systems that keep deterrence stable: risk monitoring, missile defense, and the policy choices around them.",
};

const PROJECTS = [
  {
    id: "risk",
    title: "Geopolitical Risk Tracker",
    tag: "Data · Intelligence",
    color: "bone",
    viz: "risk",
    desc: "A dashboard that pulls open-source indicators like conflict events, military posture and diplomatic signals into one country-level risk score. Each region is drawn as a column whose height and color change as conditions shift, so an emerging flashpoint is visible at a glance.",
    stack: ["Python", "OSINT feeds", "Risk scoring", "Data viz"],
  },
  {
    id: "glove",
    title: "Missile Defense Glove",
    tag: "Hardware · Human–machine interface",
    color: "olive",
    viz: "glove",
    desc: "A wearable controller that reads hand motion with flex sensors and an inertial measurement unit, then uses those gestures to direct a simulated interceptor against an incoming track. It is a prototype for faster, more intuitive operator control in air and missile defense.",
    stack: ["Microcontroller", "Flex sensors", "IMU", "Embedded C"],
  },
  {
    id: "next",
    title: "Your Next Project",
    tag: "Placeholder",
    color: "rust",
    viz: "morph",
    desc: "Add another project by copying an entry in the PROJECTS list in app.js. Give it a title, tag, description and stack, then choose a visualization: \"risk\", \"glove\" or \"morph\".",
    stack: ["Edit app.js"],
  },
];

// Each piece: slug (URL id), title, date, venue/tag, summary, body (array of paragraphs).
const WRITING = [
  {
    slug: "john-locke-essay",
    title: "[Title of your John Locke Global Essay Prize entry]",
    date: "2026",
    venue: "John Locke Institute · Commended",
    summary: "Replace with a one or two sentence summary of the essay.",
    body: [
      "This is a placeholder for the full text of your essay. In app.js, find the WRITING list and paste each paragraph as its own string in the body array.",
      "Each paragraph you add will appear here in the reading view, laid out for long-form reading.",
    ],
  },
  {
    slug: "sample-piece",
    title: "[Title of another piece]",
    date: "2025",
    venue: "Op-ed · Policy brief",
    summary: "Replace with a short summary. Add as many pieces as you like.",
    body: [
      "Placeholder text. Replace it with the full piece.",
    ],
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
  // Replace these placeholders with your speech & debate awards.
  debate: [
    { title: "[Award / placement]", event: "[Event, e.g. Lincoln–Douglas]", meet: "[Tournament, year]" },
    { title: "[Award / placement]", event: "[Event]", meet: "[Tournament, year]" },
    { title: "[Award / placement]", event: "[Event]", meet: "[Tournament, year]" },
  ],
};

/* =========================================================
   ISOMETRIC HELPERS
   ========================================================= */
const S = 46, OX = 300, OY = 150;
const P = (x, y, z = 0) => [OX + (x - y) * S * 0.866, OY + (x + y) * S * 0.5 - z * S];
const pts = (...a) => a.map(p => p.map(n => n.toFixed(1)).join(",")).join(" ");
function cube(x, y, z, w, d, h, [top, left, right], cls = "") {
  return `<g class="${cls}">
    <polygon points="${pts(P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z))}" fill="${left}"/>
    <polygon points="${pts(P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z))}" fill="${right}"/>
    <polygon points="${pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))}" fill="${top}"/>
  </g>`;
}
const BONE = ["#ece4d2", "#c9bea4", "#a99d83"];
const OLIVE = ["#8d9c68", "#5b6940", "#46522f"];
const SLATE = ["#3a4652", "#27303a", "#1d242c"];
const RUST = ["#f0794a", "#c4572f", "#9c3e1a"];

function heroScene() {
  let s = "";
  s += cube(0, 0, -0.7, 6, 6, 0.7, OLIVE);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++)
    if ((i + j) % 2) s += `<polygon points="${pts(P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1))}" fill="rgba(0,0,0,.08)"/>`;
  // city blocks (back to front)
  [[0.2, 0.2, 1.2], [1.3, 0.2, 0.7], [0.2, 1.3, 0.9], [4.6, 0.2, 1.4], [4.7, 1.3, 0.6], [0.2, 4.7, 0.8], [1.3, 4.7, 1.3]]
    .forEach(([x, y, h]) => s += cube(x, y, 0, 0.9, 0.9, h, BONE));
  // silo
  const [cx, cy] = P(3, 3, 0.6), r = 74;
  const [, by] = P(3, 3, 0);
  s += `<rect x="${cx - r}" y="${cy}" width="${r * 2}" height="${by - cy}" fill="#a99d83"/>
        <ellipse cx="${cx}" cy="${by}" rx="${r}" ry="${r * 0.55}" fill="#a99d83"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.55}" fill="#ece4d2"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.7}" ry="${r * 0.38}" fill="#0d1014"/>
        <clipPath id="siloClip"><rect x="${cx - 60}" y="0" width="120" height="${cy + 2}"/></clipPath>
        <g clip-path="url(#siloClip)"><g class="rise">
          <path d="M${cx - 15} ${cy + 40} v-96 q15 -40 30 0 v96 z" fill="#ece4d2"/>
          <path d="M${cx - 15} ${cy - 30} h30 v10 h-30z" fill="#d9582b"/>
          <path d="M${cx - 15} ${cy + 40} l-12 16 v-30z M${cx + 15} ${cy + 40} l12 16 v-30z" fill="#c4572f"/>
        </g></g>
        ${(() => { const hx = r * 0.72, hy = r * 0.4; return `
        <path class="hatch hatch-l" d="M${cx - hx} ${cy} A${hx} ${hy} 0 0 1 ${cx} ${cy - hy} V${cy + hy} A${hx} ${hy} 0 0 1 ${cx - hx} ${cy}Z" fill="#3a4652" stroke="#1d242c" stroke-width="2"/>
        <path class="hatch hatch-r" d="M${cx + hx} ${cy} A${hx} ${hy} 0 0 0 ${cx} ${cy - hy} V${cy + hy} A${hx} ${hy} 0 0 0 ${cx + hx} ${cy}Z" fill="#46525e" stroke="#1d242c" stroke-width="2"/>`; })()}`;
  // front blocks
  [[4.5, 4.5, 0.9], [3.2, 4.8, 0.5]].forEach(([x, y, h]) => s += cube(x, y, 0, 0.9, 0.9, h, SLATE));
  // shield dome over the front-right city
  const [dx, dy] = P(4.95, 1.0, 0);
  s += `<path class="dome" d="M${dx - 92} ${dy} a92 92 0 0 1 184 0" fill="rgba(242,177,52,.12)" stroke="#f2b134" stroke-width="2" stroke-dasharray="4 6"/>`;
  // radar
  const [rx, ry] = P(0.75, 0.75, 1.2);
  s += `<circle class="pulse" cx="${rx}" cy="${ry - 10}" r="7" fill="#f2b134"/>`;
  // floating trefoil (clay disc)
  s += `<g class="float"><g transform="translate(${OX} 44)">
      <ellipse cx="0" cy="58" rx="40" ry="10" fill="rgba(0,0,0,.35)"/>
      <circle r="38" fill="#f2b134"/>
      <circle r="38" fill="url(#clayHi)"/>
      ${[0, 120, 240].map(a => `<path transform="rotate(${a})" d="M0 0 L-16 -27.7 A32 32 0 0 1 16 -27.7 Z" fill="#0d1014"/>`).join("")}
      <circle r="9" fill="#f2b134"/><circle r="6" fill="#0d1014"/>
    </g></g>`;
  return `<svg viewBox="0 0 600 560" role="img" aria-label="Isometric clay illustration of a missile silo, shielded city and radiation symbol">
    <defs><radialGradient id="clayHi" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>
    <ellipse cx="300" cy="470" rx="260" ry="60" fill="rgba(0,0,0,.35)" filter="url(#goo)"/>
    ${s}</svg>`;
}

/* =========================================================
   PROJECT VISUALIZATIONS
   ========================================================= */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function riskViz(canvas) {
  const ctx = canvas.getContext("2d"), N = 7;
  const seeds = Array.from({ length: N * N }, () => [Math.random() * 6.28, 0.4 + Math.random() * 0.9]);
  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  function frame(t) {
    if (!canvas.isConnected) return;
    if (visible || t === 0) {
      const dpr = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
      if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const s = Math.min(W, H) / 11, ox = W / 2, oy = H * 0.3;
      const p = (x, y, z) => [ox + (x - y) * s * 0.866, oy + (x + y) * s * 0.5 - z * s];
      const poly = (c, ...q) => { ctx.beginPath(); q.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
      const order = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) order.push([i, j]);
      order.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
      for (const [i, j] of order) {
        const [ph, sp] = seeds[i * N + j];
        const risk = 0.5 + 0.5 * Math.sin(t / 1000 * sp + ph) * Math.sin(t / 2700 + i * 0.7 - j * 0.4);
        const h = 0.15 + risk * risk * 2.6, x = i + 0.12, y = j + 0.12, w = 0.76;
        const hue = 95 - risk * 85, L = 58;
        const c = l => `hsl(${hue},${45 + risk * 35}%,${l}%)`;
        poly(c(L - 18), p(x, y + w, h), p(x + w, y + w, h), p(x + w, y + w, 0), p(x, y + w, 0));
        poly(c(L - 28), p(x + w, y, h), p(x + w, y + w, h), p(x + w, y + w, 0), p(x + w, y, 0));
        poly(c(L), p(x, y, h), p(x + w, y, h), p(x + w, y + w, h), p(x, y + w, h));
        if (risk > 0.88) {
          const [a, b] = p(x + w / 2, y + w / 2, h + 0.3);
          ctx.beginPath(); ctx.arc(a, b, 3 + 4 * ((t / 400) % 1), 0, 6.28);
          ctx.strokeStyle = `rgba(242,177,52,${1 - ((t / 400) % 1)})`; ctx.lineWidth = 2; ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame(0);
}

function gloveViz() {
  const finger = (x, len, d) => `<g class="curl" style="animation-delay:${d}s"><rect x="${x}" y="${150 - len}" width="30" height="${len + 20}" rx="15" fill="#ece4d2"/>
    <line x1="${x + 15}" y1="${160 - len}" x2="${x + 15}" y2="160" stroke="#c4572f" stroke-width="3" stroke-linecap="round"/>
    <circle class="pulse" style="animation-delay:${d}s" cx="${x + 15}" cy="${163 - len}" r="4" fill="#f2b134"/></g>`;
  return `<svg viewBox="0 0 400 300" role="img" aria-label="Animated sensor glove steering an interceptor toward an incoming track">
    <style>.curl{animation:curl 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes curl{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.78)}}
      .sweep{animation:spin 4s linear infinite;transform-origin:300px 110px}
      .intc{offset-path:path('M150 140 Q 230 20 300 92');animation:fly 3.2s ease-in infinite}
      @keyframes fly{0%{offset-distance:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{offset-distance:100%;opacity:0}}
      .threat{animation:threat 3.2s linear infinite}
      @keyframes threat{0%{transform:translate(70px,-60px);opacity:0}15%{opacity:1}100%{transform:translate(0,0);opacity:1}}</style>
    <defs><radialGradient id="gHi" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <!-- radar -->
    <circle cx="300" cy="110" r="70" fill="none" stroke="#27303a" stroke-width="2"/>
    <circle cx="300" cy="110" r="45" fill="none" stroke="#27303a" stroke-width="2"/>
    <circle cx="300" cy="110" r="20" fill="none" stroke="#27303a" stroke-width="2"/>
    <path class="sweep" d="M300 110 L370 110 A70 70 0 0 0 349.5 60.5 Z" fill="rgba(141,156,104,.35)"/>
    <g class="threat"><circle cx="300" cy="92" r="6" fill="#d9582b"/><line x1="300" y1="92" x2="318" y2="80" stroke="#d9582b" stroke-width="2" stroke-dasharray="3 3"/></g>
    <path class="dash" d="M150 140 Q 230 20 300 92" fill="none" stroke="#f2b134" stroke-width="2"/>
    <circle class="intc" r="6" fill="#f2b134"/>
    <!-- glove -->
    <g transform="translate(-14 14)">
      <ellipse cx="110" cy="250" rx="80" ry="10" fill="rgba(0,0,0,.4)"/>
      ${finger(52, 66, 0)}${finger(84, 86, .15)}${finger(116, 80, .3)}${finger(148, 62, .45)}
      <g class="curl" style="animation-delay:.6s"><rect x="166" y="160" width="30" height="72" rx="15" fill="#ece4d2" transform="rotate(26 181 225)"/></g>
      <rect x="48" y="140" width="132" height="98" rx="34" fill="#ece4d2"/>
      <rect x="48" y="140" width="132" height="98" rx="34" fill="url(#gHi)"/>
      <rect x="86" y="170" width="54" height="36" rx="10" fill="#27303a"/>
      <circle class="pulse" cx="113" cy="188" r="6" fill="#8d9c68"/>
      <rect x="58" y="228" width="112" height="22" rx="11" fill="#6f7d4e"/>
    </g>
  </svg>`;
}

function morphViz() {
  const a = "M200,60 C270,60 330,110 320,170 C310,230 250,250 200,245 C140,240 80,215 85,155 C90,95 130,60 200,60Z";
  const b = "M200,45 C285,70 300,120 330,175 C350,230 240,265 190,240 C130,215 60,230 75,160 C90,100 120,25 200,45Z";
  const c = "M210,70 C260,40 345,120 305,175 C270,225 260,260 195,250 C120,240 95,190 100,140 C105,90 160,95 210,70Z";
  return `<svg viewBox="0 0 400 300" role="img" aria-label="Liquid morphing placeholder shape">
    <g filter="url(#goo)">
      <path fill="#d9582b"><animate attributeName="d" dur="9s" repeatCount="indefinite" values="${a};${b};${c};${a}"/></path>
      <circle cx="320" cy="80" r="26" fill="#f2b134"><animate attributeName="cy" dur="6s" repeatCount="indefinite" values="80;130;80"/></circle>
      <circle cx="90" cy="240" r="18" fill="#f2b134"><animate attributeName="cx" dur="7s" repeatCount="indefinite" values="90;140;90"/></circle>
    </g>
    <text x="200" y="165" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#fff4ea" letter-spacing="3">+ ADD PROJECT</text>
  </svg>`;
}

/* =========================================================
   VIEWS
   ========================================================= */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

function home() {
  return `<section class="page">
    <div class="hero">
      <div>
        <p class="eyebrow">Portfolio · ${esc(PROFILE.tagline)}</p>
        <h1>${esc(PROFILE.name.split(" ")[0])}<br><span>${esc(PROFILE.name.split(" ").slice(1).join(" "))}</span></h1>
        <p class="lede" style="margin-top:20px">${esc(PROFILE.intro)}</p>
        <div class="cta"><a class="btn" href="#/projects">View projects →</a><a class="btn ghost" href="#/writing">Read my writing</a></div>
      </div>
      <div class="iso-wrap">${heroScene()}</div>
    </div>
    <div class="statrow">
      <div class="clay stat"><b data-count="${DISTINCTIONS.gpa}">${DISTINCTIONS.gpa}</b><span>Weighted GPA</span></div>
      <div class="clay olive stat"><b data-count="${DISTINCTIONS.sat}">${DISTINCTIONS.sat}</b><span>SAT</span></div>
      <div class="clay rust stat"><b><em data-count="${DISTINCTIONS.aps.length}">${DISTINCTIONS.aps.length}</em>×5</b><span>AP exam scores</span></div>
      <div class="clay slate stat"><b>Locke</b><span>Global Essay Prize · Commended</span></div>
    </div>
    <div class="tiles">
      <a class="clay dark tile" href="#/projects"><span class="eyebrow">01 · Projects</span><h3>Defense tech I've built</h3><p>${PROJECTS.filter(p => p.tag !== "Placeholder").map(p => esc(p.title)).join(", ")}.</p><span class="arrow">→</span></a>
      <a class="clay dark tile" href="#/writing"><span class="eyebrow">02 · Writing</span><h3>Essays & analysis</h3><p>${WRITING.length} pieces on deterrence, strategy and policy.</p><span class="arrow">→</span></a>
      <a class="clay dark tile" href="#/distinctions"><span class="eyebrow">03 · Distinctions</span><h3>Academics & awards</h3><p>Test scores, AP exams, essay prizes and speech & debate.</p><span class="arrow">→</span></a>
    </div>
  </section>`;
}

function projects() {
  return `<section class="page">
    <div class="pagehead"><p class="eyebrow">Projects</p><h2>Defense technology, built and tested</h2>
      <p class="lede">Hardware and software prototypes for sensing, risk monitoring and operator control.</p></div>
    <div class="projects">${PROJECTS.map((p, i) => `
      <article class="clay ${p.color === "bone" ? "" : p.color} project">
        <div>
          <span class="tag">${String(i + 1).padStart(2, "0")} · ${esc(p.tag)}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
          <ul>${p.stack.map(s => `<li class="tag">${esc(s)}</li>`).join("")}</ul>
        </div>
        <div class="pviz" data-viz="${p.viz}">
          ${p.viz === "risk" ? `<canvas aria-label="Animated isometric risk map: columns rise and turn red as risk increases" role="img"></canvas><span class="cap">Live risk index · simulated</span>`
            : p.viz === "glove" ? gloveViz() + `<span class="cap">Gesture → intercept · simulated</span>`
            : morphViz()}
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function writingList() {
  return `<section class="page">
    <div class="pagehead"><p class="eyebrow">Writing</p><h2>Essays, briefs & analysis</h2>
      <p class="lede">Select a title to read the full piece.</p></div>
    <div class="list">${WRITING.map((w, i) => `
      <a class="clay piece-row ${i % 3 === 1 ? "olive" : i % 3 === 2 ? "slate" : ""}" href="#/writing/${encodeURIComponent(w.slug)}">
        <span class="n">${String(i + 1).padStart(2, "0")}</span>
        <div><span class="tag">${esc(w.venue)} · ${esc(w.date)}</span><h3 style="margin-top:10px">${esc(w.title)}</h3><p>${esc(w.summary)}</p></div>
        <span class="btn" aria-hidden="true">Read</span>
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
    <article class="clay article">
      <span class="tag">${esc(w.venue)}</span>
      <h1>${esc(w.title)}</h1>
      <div class="meta">${esc(PROFILE.name.toUpperCase())} · ${esc(w.date)}</div>
      ${w.body.map(p => `<p>${esc(p)}</p>`).join("")}
    </article>
  </section>`;
}

function distinctions() {
  const d = DISTINCTIONS;
  return `<section class="page">
    <div class="pagehead"><p class="eyebrow">Distinctions</p><h2>Academics & awards</h2></div>
    <div class="grid">
      <div class="clay"><span class="tag">Weighted GPA</span><div class="big" style="margin-top:14px"><em data-count="${d.gpa}">${d.gpa}</em><small> W</small></div></div>
      <div class="clay olive"><span class="tag">SAT</span><div class="big" style="margin-top:14px"><em data-count="${d.sat}">${d.sat}</em></div></div>
      <div class="clay rust"><span class="tag">AP exams</span><div class="big" style="margin-top:14px"><em data-count="${d.aps.length}">${d.aps.length}</em><small> × score of 5</small></div></div>
    </div>
    <div class="sec"><h2>AP scholar record</h2><p class="lede">Score of 5 on every exam below.</p>
      <div class="ap-grid">${d.aps.map(a => `<div class="ap"><i>5</i><span>AP ${esc(a)}</span></div>`).join("")}</div></div>
    <div class="sec"><h2>Writing honors</h2>
      <div class="awards">${d.honors.map(h => `<div class="clay slate award"><div><h3>${esc(h.title)}</h3><span class="mono" style="opacity:.75">${esc(h.org)}</span></div><span class="btn static">${esc(h.detail)}</span></div>`).join("")}</div></div>
    <div class="sec"><h2>Speech & debate</h2>
      <div class="awards">${d.debate.map((a, i) => `<div class="clay ${i % 2 ? "olive" : ""} award"><div><h3>${esc(a.title)}</h3><span class="mono" style="opacity:.75">${esc(a.event)}</span></div><span class="tag">${esc(a.meet)}</span></div>`).join("")}</div></div>
  </section>`;
}

/* =========================================================
   MOTION LAYER
   ========================================================= */
const finePointer = matchMedia("(pointer: fine)").matches;

// Staggered reveal as elements scroll into view
const revealer = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.querySelectorAll("[data-count]").forEach(countUp);
  revealer.unobserve(e.target);
}), { threshold: 0.12 });

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

// Clay tilt + sheen that follows the pointer
function tilt(el) {
  if (!finePointer || reduceMotion) return;
  el.classList.add("tilt");
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
}

// Liquid pill that slides between nav tabs
function movePill() {
  const nav = document.getElementById("nav"), on = nav.querySelector("a.on"), pill = nav.querySelector(".pill");
  if (!on || !pill) return;
  pill.style.width = on.offsetWidth + "px";
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
}

// Hero parallax
function parallax(wrap) {
  if (!finePointer || reduceMotion || !wrap) return;
  const svg = wrap.querySelector("svg");
  wrap.closest(".hero").addEventListener("pointermove", e => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    svg.style.transform = `translate(${x * -18}px, ${y * -12}px) rotateX(${y * 6}deg) rotateY(${x * 8}deg)`;
  });
}

// Reading progress
function progress() {
  const bar = document.querySelector(".progress i");
  if (!bar) return;
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 1})`;
}
addEventListener("scroll", progress, { passive: true });

function animateView(view) {
  view.querySelectorAll(".pagehead, .hero > *, .clay, .ap, .sec > h2, .sec > .lede").forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", `${Math.min(i, 8) * 70}ms`);
    revealer.observe(el);
  });
  view.querySelectorAll(".eyebrow").forEach(scramble);
  view.querySelectorAll(".project, .stat, .grid > .clay, .award").forEach(tilt);
  parallax(view.querySelector(".iso-wrap"));
  movePill();
  progress();
}

/* =========================================================
   ROUTER
   ========================================================= */
function draw() {
  const [, route = "", sub] = location.hash.replace(/^#/, "").split("/");
  const view = document.getElementById("view");
  const map = { "": home, projects, writing: () => sub ? article(decodeURIComponent(sub)) : writingList(), distinctions };
  view.innerHTML = (map[route] || home)();
  document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("on", a.dataset.route === (route || "home")));
  view.querySelectorAll('[data-viz="risk"] canvas').forEach(riskViz);
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
// Transitions expand from wherever the visitor clicked
addEventListener("click", e => {
  document.documentElement.style.setProperty("--vx", `${e.clientX}px`);
  document.documentElement.style.setProperty("--vy", `${e.clientY}px`);
});
addEventListener("resize", movePill);
document.getElementById("nav").insertAdjacentHTML("afterbegin", '<span class="pill" aria-hidden="true"></span>');
document.fonts && document.fonts.ready.then(movePill);
addEventListener("hashchange", render);
render();
