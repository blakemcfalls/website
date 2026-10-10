/* =========================================================
   SYSTEMS LAB — interactive "how it works" 3D explainers.
   Built on three.js r128 (vendor/three.min.js).
   Each system defines its steps and a build() that returns
   { update(step, t, time), labels }, where t runs 0→1 per step.
   ========================================================= */
(function () {
  "use strict";
  const T = window.THREE;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COL = { cyan: 0x59e1ff, amber: 0xffb547, red: 0xff4d3d, white: 0xe6edf2 };

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const pad = n => String(n).padStart(2, "0");

  /* ---------- geometry & material helpers ---------- */
  const metal = (color, o = {}) => new T.MeshStandardMaterial({ color, metalness: .55, roughness: .45, ...o });
  const lineMat = (color = COL.cyan, opacity = .5) => new T.LineBasicMaterial({ color, transparent: true, opacity });
  function part(geo, mat, edge = COL.cyan, opacity = .4, angle = 25) {
    const m = new T.Mesh(geo, mat);
    m.add(new T.LineSegments(new T.EdgesGeometry(geo, angle), lineMat(edge, opacity)));
    return m;
  }
  let glowTex;
  function glowTexture() {
    if (glowTex) return glowTex;
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.22, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return (glowTex = new T.CanvasTexture(c));
  }
  function glow(color, size, opacity = 1) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity, blending: T.AdditiveBlending, depthWrite: false }));
    s.scale.setScalar(size); return s;
  }
  function particles(n, color, size = .08, opacity = .9) {
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(new Float32Array(n * 3), 3));
    const p = new T.Points(geo, new T.PointsMaterial({ color, size, map: glowTexture(), transparent: true, opacity, blending: T.AdditiveBlending, depthWrite: false }));
    p.frustumCulled = false; return p;
  }
  const _v = new T.Vector3();
  function setPts(p, fn) {
    const a = p.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) { fn(i, _v.set(0, -999, 0)); a.setXYZ(i, _v.x, _v.y, _v.z); }
    a.needsUpdate = true;
  }
  function ring(r, color = COL.cyan, opacity = .6, arc = Math.PI * 2, seg = 96) {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const a = i / seg * arc; pts.push(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    return new T.Line(new T.BufferGeometry().setFromPoints(pts), lineMat(color, opacity));
  }
  const curveLine = (curve, color, opacity, n = 120) => new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(n)), lineMat(color, opacity));
  function anchor(parent, x, y, z) { const o = new T.Object3D(); o.position.set(x, y, z); parent.add(o); return o; }
  const V3 = (x, y, z) => new T.Vector3(x, y, z);
  function flat(pts, depth = .05) {
    const g = new T.ExtrudeGeometry(new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y))), { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2); return g;
  }

  /* =========================================================
     SYSTEMS
     ========================================================= */
  const SYSTEMS = [];

  /* ---------- 01 · Nuclear warhead (implosion fission, conceptual) ---------- */
  SYSTEMS.push({
    id: "nuke", name: "Nuclear Warhead", cls: "Implosion fission · conceptual",
    cam: [-4.6, 2.6, 5.6], target: [0, 0, 0], rotate: false,
    steps: [
      { t: "Architecture", d: "A cutaway of an implosion-type device. Nested shells surround a small core of fissile material. As built, the core sits safely below critical mass, so it cannot sustain a chain reaction on its own." },
      { t: "Simultaneous detonation", d: "Shaped explosive charges, arranged like the panels of a soccer ball, fire at the same instant. Timing is everything: any lag would distort the blast and the device would fail." },
      { t: "Implosion", d: "The separate blasts merge into one smooth, inward-moving shockwave. It squeezes the core to a fraction of its size, pushing it past critical density." },
      { t: "Chain reaction", d: "A burst of neutrons starts fission. Each split nucleus releases more neutrons, which split more nuclei. The reaction multiplies through dozens of generations in under a microsecond." },
      { t: "Energy release", d: "A tiny fraction of the core's mass becomes energy: heat, light, radiation and blast. That scale of destruction is why deterrence, arms control and nonproliferation matter." },
    ],
    build(root) {
      const dev = new T.Group(); root.add(dev);
      const cut = (r, w, h) => new T.SphereGeometry(r, w, h, Math.PI / 2, Math.PI * 1.5);
      const casing = part(cut(2.1, 28, 14), metal(0x222c36, { transparent: true, opacity: .5, side: T.DoubleSide }), COL.cyan, .22, 1);
      const lensMat = metal(0x3b3020, { emissive: COL.amber, emissiveIntensity: 0 });
      const p = (1 + Math.sqrt(5)) / 2, q = 1 / p, V = [];
      for (const a of [-1, 1]) for (const b of [-1, 1]) {
        V.push([0, a, b * p], [a, b * p, 0], [a * p, 0, b]);       // icosahedron vertices
        V.push([0, a * q, b * p], [a * q, b * p, 0], [a * p, 0, b * q]); // dodecahedron vertices
        for (const c of [-1, 1]) V.push([a, b, c]);
      }
      const camDir = V3(-.6, .35, .72).normalize();
      const lenses = [];
      V.forEach(v => {
        const d = V3(...v).normalize();
        if (d.x < .15 && d.z > -.15) return; // leave the cutaway quadrant open
        const m = part(new T.CylinderGeometry(.2, .46, .5, 6), lensMat, COL.amber, .35);
        m.userData.dir = d; m.position.copy(d).multiplyScalar(1.62); m.lookAt(0, 0, 0); m.rotateX(Math.PI / 2);
        dev.add(m); lenses.push(m);
      });
      const frontLens = lenses.reduce((a, b) => (b.userData.dir.dot(camDir) > a.userData.dir.dot(camDir) ? b : a));
      const tamper = part(cut(1.08, 32, 16), metal(0x34404c, { side: T.DoubleSide }), COL.cyan, .25, 1);
      const pitMat = metal(0x6b4a1c, { side: T.DoubleSide, emissive: COL.amber, emissiveIntensity: .15 });
      const pit = part(cut(.62, 28, 14), pitMat, COL.amber, .5, 1);
      const init = new T.Mesh(new T.SphereGeometry(.13, 16, 12), new T.MeshBasicMaterial({ color: COL.white }));
      const coreGlow = glow(COL.amber, 1.4, .35);
      dev.add(casing, tamper, pit, init, coreGlow);
      const shockMat = lineMat(COL.amber, .8);
      const shock = new T.LineSegments(new T.WireframeGeometry(new T.IcosahedronGeometry(1, 2)), shockMat);
      const neutrons = particles(500, COL.amber, .11);
      const flash = glow(0xfff1d6, 1);
      const blastMat = lineMat(COL.red, .6);
      const blast = new T.LineSegments(new T.WireframeGeometry(new T.IcosahedronGeometry(1, 3)), blastMat);
      root.add(shock, neutrons, flash, blast);
      const coreA = anchor(pit, -.35, -.3, .35);
      return {
        labels: [
          { text: "Outer case", at: anchor(dev, 1.2, 1.7, .2), steps: [0] },
          { text: "Explosive lenses ×32", at: frontLens, steps: [0, 1] },
          { text: "Tamper / pusher", at: anchor(tamper, -.45, .75, .5), steps: [0] },
          { text: "Fissile core · subcritical", at: coreA, steps: [0] },
          { text: "Neutron initiator", at: init, steps: [0, 3] },
          { text: "Converging shockwave", at: anchor(shock, 0, 1, 0), steps: [1, 2] },
          { text: "Core compressed · supercritical", at: coreA, steps: [2, 3] },
        ],
        update(step, t, time) {
          dev.visible = true; shock.visible = neutrons.visible = flash.visible = blast.visible = false;
          lensMat.emissiveIntensity = 0; pitMat.emissiveIntensity = .15;
          let k = 1, out = 0, glowS = 1.4;
          if (step === 0) out = Math.sin(Math.PI * seg(t, .1, .9)) * .55;
          if (step === 1) {
            lensMat.emissiveIntensity = t > .12 ? 3 * (1 - seg(t, .12, .7)) : 0;
            if (t > .18) { shock.visible = true; shock.scale.setScalar(lerp(1.75, .95, ease(seg(t, .18, 1)))); shockMat.opacity = .85; }
          }
          if (step === 2) {
            shock.visible = t < .75; shock.scale.setScalar(lerp(.95, .5, ease(seg(t, 0, .7)))); shockMat.opacity = .85 * (1 - seg(t, .5, .75));
            k = lerp(1, .62, ease(seg(t, .05, .8))); pitMat.emissiveIntensity = lerp(.15, 1.2, seg(t, .05, .8));
          }
          if (step === 3) {
            k = .62; pitMat.emissiveIntensity = 1.4 + .6 * Math.sin(time * 20);
            const n = Math.floor(500 * (Math.pow(2, seg(t, 0, .9) * 9) - 1) / 511);
            neutrons.visible = true;
            setPts(neutrons, (i, v) => {
              if (i >= n) return;
              const th = rnd(i) * Math.PI * 2, u = rnd(i + 11) * 2 - 1, s = Math.sqrt(1 - u * u), r = .4 * Math.cbrt(rnd(i + 3)) + Math.sin(time * 6 + i) * .03;
              v.set(Math.cos(th) * s * r, u * r, Math.sin(th) * s * r);
            });
            glowS = 1.4 + seg(t, 0, 1) * 2.5;
          }
          if (step === 4) {
            k = .62; dev.visible = t < .18;
            flash.visible = true; flash.scale.setScalar(lerp(1, 18, ease(seg(t, 0, .45)))); flash.material.opacity = 1 - seg(t, .35, 1);
            blast.visible = true; blast.scale.setScalar(lerp(.6, 7.5, ease(seg(t, .05, 1)))); blastMat.opacity = .7 * (1 - seg(t, .5, 1));
          }
          lenses.forEach(m => m.position.copy(m.userData.dir).multiplyScalar(1.62 + out));
          casing.scale.setScalar(1 + out * .35);
          tamper.scale.setScalar(1 - (1 - k) * .6);
          pit.scale.setScalar(k); init.scale.setScalar(k);
          coreGlow.scale.setScalar(glowS * k);
        },
      };
    },
  });

  /* ---------- 02 · ICBM ---------- */
  SYSTEMS.push({
    id: "icbm", name: "ICBM", cls: "Three-stage ballistic missile",
    cam: [6.6, 1.0, 9.4], target: [0, .1, 0],
    steps: [
      { t: "Boost", d: "The first-stage rocket motor burns for about a minute, lifting the missile out of the dense lower atmosphere while it pitches over onto its trajectory." },
      { t: "Staging", d: "Each spent stage is dropped so the missile stops carrying dead weight. The next stage ignites and keeps accelerating toward a speed of roughly 7 km/s." },
      { t: "Shroud jettison", d: "Above the atmosphere the aerodynamic nose shroud is no longer needed. It splits away, exposing the payload while the third stage completes the burn." },
      { t: "Post-boost vehicle", d: "A small maneuvering bus fine-tunes its velocity and releases each reentry vehicle on a slightly different path. This is how one missile can carry multiple independently targeted warheads (MIRVs)." },
      { t: "Reentry", d: "After about 30 minutes on a mostly unpowered ballistic arc, the reentry vehicles plunge back into the atmosphere. Their heat shields glow from compression heating." },
    ],
    build(root) {
      const rocket = new T.Group(); root.add(rocket);
      const hull = metal(0xc9d1d7, { metalness: .25, roughness: .55 }), dark = metal(0x1a2129, { side: T.DoubleSide });
      function stage(r, h, y0) {
        const g = new T.Group();
        const b = part(new T.CylinderGeometry(r, r, h, 32), hull, COL.cyan, .3); b.position.y = y0 + h / 2;
        const band = part(new T.CylinderGeometry(r + .012, r + .012, .07, 32), dark, COL.cyan, .5); band.position.y = y0 + h - .04;
        const noz = part(new T.CylinderGeometry(r * .38, r * .62, .32, 20, 1, true), dark, COL.cyan, .4); noz.position.y = y0 - .16;
        g.add(b, band, noz); g.userData.nozzleY = y0 - .32; rocket.add(g); return g;
      }
      const stages = [stage(.34, 2.0, -2.6), stage(.31, 1.3, -.6), stage(.29, .8, .7)];
      const bus = part(new T.CylinderGeometry(.29, .29, .24, 32), dark, COL.cyan, .5); bus.position.y = 1.62; rocket.add(bus);
      const rvs = [0, 1, 2].map(k => {
        const a = k / 3 * Math.PI * 2, g = new T.Group();
        g.add(part(new T.ConeGeometry(.085, .42, 20), metal(0x3a3f45), COL.amber, .55));
        const heat = glow(COL.amber, .7); heat.position.y = .22; g.add(heat); g.userData.heat = heat;
        g.position.set(Math.cos(a) * .15, 1.95, Math.sin(a) * .15); g.userData.home = g.position.clone(); g.userData.a = a;
        rocket.add(g); return g;
      });
      const shroud = [0, 1].map(k => {
        const g = new T.Group();
        g.add(part(new T.CylinderGeometry(.04, .3, 1.0, 24, 1, true, k * Math.PI, Math.PI), metal(0xc9d1d7, { metalness: .25, roughness: .55, side: T.DoubleSide }), COL.cyan, .35));
        g.position.y = 2.24; rocket.add(g); return g;
      });
      const exhaust = particles(320, COL.amber, .17), plume = glow(COL.amber, 1.4), sepFlash = glow(0xffffff, 1);
      const puffs = [-1, 1].map(s => { const p = glow(COL.cyan, .35); p.position.set(s * .36, 1.62, 0); rocket.add(p); return p; });
      rocket.add(exhaust, plume, sepFlash);
      const streaks = particles(140, COL.cyan, .05, .6); root.add(streaks);
      return {
        labels: [
          { text: "Stage 1 · solid motor", at: anchor(stages[0], .36, -1.6, 0), steps: [0] },
          { text: "Stage 2", at: anchor(stages[1], .33, -.1, 0), steps: [0, 1] },
          { text: "Stage 3", at: anchor(stages[2], .31, 1.1, 0), steps: [0, 1, 2] },
          { text: "Payload shroud", at: anchor(shroud[0], .2, .1, 0), steps: [0, 1, 2] },
          { text: "Post-boost vehicle", at: anchor(bus, .3, 0, 0), steps: [3] },
          { text: "Reentry vehicles", at: anchor(rvs[1], 0, .1, 0), steps: [3, 4] },
        ],
        update(step, t, time) {
          const sep = s => (step < s + 1 ? 0 : step === s + 1 ? ease(t) : 1);
          stages.forEach((g, i) => {
            const p = sep(i), d = i % 2 ? 1 : -1;
            g.visible = step <= i + 1; g.position.set(p * .5 * d, -p * 3.2 - p * p * 2, 0); g.rotation.z = -p * .9 * d;
          });
          const fire = step === 0 ? 0 : step === 1 ? (t > .28 ? 1 : -1) : step === 2 ? (t > .3 ? 2 : -1) : -1;
          rocket.rotation.z = step === 4 ? 0 : -.35 * ease(clamp((step + t) / 3));
          rocket.position.y = step === 0 ? lerp(-.6, 0, ease(t)) : 0;
          plume.visible = fire >= 0; exhaust.visible = fire >= 0 || step === 4;
          if (fire >= 0) {
            const ny = stages[fire].userData.nozzleY;
            plume.position.set(0, ny - .2, 0); plume.scale.setScalar(1.3 + Math.sin(time * 40) * .15);
            setPts(exhaust, (i, v) => { const ph = (time * 1.8 + rnd(i)) % 1, sp = .08 + ph * .55; v.set((rnd(i + 1) - .5) * sp, ny - ph * 3.2, (rnd(i + 2) - .5) * sp); });
          }
          streaks.visible = step < 4;
          setPts(streaks, (i, v) => v.set((rnd(i + 1) - .5) * 14, 7 - ((time * 7 * (.6 + rnd(i)) + rnd(i + 5) * 14) % 14), (rnd(i + 2) - .5) * 10 - 2));
          const sepY = [null, -.6, .7, 1.5][step];
          sepFlash.visible = sepY != null && t < .15;
          if (sepFlash.visible) { sepFlash.position.set(0, sepY, 0); sepFlash.scale.setScalar((1 - t / .15) * 2.5); }
          const sh = step < 2 ? 0 : step === 2 ? ease(seg(t, .35, 1)) : 1;
          shroud.forEach((g, k) => { const d = k ? -1 : 1; g.visible = step <= 2; g.position.set(d * sh * 1.4, 2.24 - sh * 1.2, 0); g.rotation.z = -d * sh * 1.1; });
          bus.visible = step < 4;
          puffs.forEach((p, k) => { p.visible = step === 3 && rnd(Math.floor(time * 10) + k * 7) > .45; });
          rvs.forEach((g, k) => {
            const h = g.userData.home, a = g.userData.a;
            g.rotation.set(0, 0, 0); g.userData.heat.visible = false;
            if (step < 3) g.position.copy(h);
            else if (step === 3) { const p = ease(seg(t, .15 + k * .22, .45 + k * .22)); g.position.set(h.x + Math.cos(a) * p * 1.2, h.y + p * .5, h.z + Math.sin(a) * p * 1.2); }
            else {
              g.rotation.set(Math.PI, 0, .35); g.position.set((k - 1) * 1.1, lerp(2.6, -1.2, ease(t)) + k * .35, 0);
              g.userData.heat.visible = true; g.userData.heat.scale.setScalar(.6 + seg(t, 0, .4) * .5 + Math.sin(time * 30 + k) * .08);
            }
          });
          if (step === 4) setPts(exhaust, (i, v) => {
            const g = rvs[i % 3], ph = (time * 1.4 + rnd(i)) % 1;
            v.set(g.position.x - ph * .55 + (rnd(i + 1) - .5) * .12 * ph, g.position.y + ph * 1.6, (rnd(i + 2) - .5) * .12 * ph);
          });
        },
      };
    },
  });

  /* ---------- 03 · Missile defense interceptor ---------- */
  SYSTEMS.push({
    id: "interceptor", name: "Missile Interceptor", cls: "Hit-to-kill missile defense",
    cam: [0, 3.4, 17.5], target: [-.5, 1.8, 0], rotate: false,
    steps: [
      { t: "Detect", d: "A ground-based radar searches the sky. Once it picks up a fast, high-arcing object, it locks on and starts building a track." },
      { t: "Track & predict", d: "Because a warhead in midcourse coasts on a predictable ballistic arc, fire-control computers can project where it will be and choose an intercept point." },
      { t: "Launch", d: "The interceptor launches toward where the threat will be, not where it is now. Its booster accelerates it toward the predicted intercept point." },
      { t: "Kill vehicle", d: "The booster drops away. A small kill vehicle uses its own seeker and short bursts from divert thrusters to correct its course in the final seconds." },
      { t: "Hit-to-kill", d: "There is no explosive warhead. The kill vehicle destroys the target by colliding with it at a combined speed of several kilometers per second, like hitting a bullet with a bullet." },
    ],
    build(root, env) {
      const P = V3(1.2, 3.4, 0), S = V3(4, -3, 1.2), R = V3(-3.5, -3, 2.2);
      const threatC = new T.QuadraticBezierCurve3(V3(-11, 5.2, -4), V3(-4.5, 7.2, -1.6), P);
      const fallC = new T.QuadraticBezierCurve3(P, V3(3.8, 1.6, .8), V3(5.6, -3, 1.4));
      const intC = new T.QuadraticBezierCurve3(S, V3(4.2, 1.8, .8), P);
      // radar
      const radar = new T.Group(); radar.position.copy(R); root.add(radar);
      radar.add(part(new T.BoxGeometry(1, .5, 1), metal(0x1d252e), COL.cyan, .5).translateY(.25));
      const dish = new T.Group(); dish.position.y = 1.0; radar.add(dish);
      const dg = new T.SphereGeometry(.7, 24, 10, 0, Math.PI * 2, 0, .9); dg.rotateX(-Math.PI / 2);
      dish.add(part(dg, metal(0x8fa2b0, { side: T.DoubleSide }), COL.cyan, .5));
      const bg = new T.ConeGeometry(1.3, 10, 28, 1, true); bg.rotateX(-Math.PI / 2); bg.translate(0, 0, 5);
      const beam = new T.Mesh(bg, new T.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: .07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      beam.position.y = 1; radar.add(beam);
      // threat
      const threat = new T.Group(); root.add(threat);
      const tg = new T.ConeGeometry(.13, .55, 16); tg.rotateX(Math.PI / 2);
      threat.add(part(tg, metal(0x3a3f45), COL.red, .7), glow(COL.red, .8));
      const track = curveLine(threatC, COL.cyan, .55);
      const predPts = threatC.getPoints(60).slice(30).concat(fallC.getPoints(60));
      const pred = new T.Line(new T.BufferGeometry().setFromPoints(predPts), new T.LineDashedMaterial({ color: COL.amber, dashSize: .25, gapSize: .18, transparent: true, opacity: .7 }));
      pred.computeLineDistances();
      const marker = new T.Group(); marker.position.copy(P);
      [.35, .55].forEach(r => { const m = ring(r, COL.amber, .9); m.rotation.x = Math.PI / 2; marker.add(m); });
      root.add(track, pred, marker);
      // silo + interceptor
      const silo = part(new T.BoxGeometry(.9, .25, .9), metal(0x1d252e), COL.cyan, .5); silo.position.copy(S).add(V3(0, .12, 0)); root.add(silo);
      const icpt = new T.Group(), inner = new T.Group(); inner.rotation.x = Math.PI / 2; icpt.add(inner); root.add(icpt);
      const booster = part(new T.CylinderGeometry(.11, .11, 1.0, 20), metal(0xc9d1d7, { metalness: .25, roughness: .55 }), COL.cyan, .35);
      const kv = new T.Group(); kv.position.y = .62;
      kv.add(part(new T.BoxGeometry(.2, .22, .2), metal(0x2a333d), COL.amber, .7));
      const nose = part(new T.ConeGeometry(.1, .26, 16), metal(0x2a333d), COL.amber, .5); nose.position.y = .24; kv.add(nose);
      const divert = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, z]) => { const g = glow(COL.cyan, .35); g.position.set(x * .18, 0, z * .18); kv.add(g); return g; });
      inner.add(booster, kv);
      const iTrail = particles(160, COL.amber, .14), tTrail = particles(90, COL.red, .1, .6), debris = particles(220, COL.amber, .1), boom = glow(0xfff1d6, 1);
      root.add(iTrail, tTrail, debris, boom);
      const look = new T.Vector3();
      return {
        labels: [
          { text: "Ground-based radar", at: anchor(radar, 0, 1.6, 0), steps: [0, 1] },
          { text: "Incoming warhead", at: threat, steps: [0, 1, 2] },
          { text: "Predicted intercept point", at: marker, steps: [1, 2] },
          { text: "Interceptor", at: icpt, steps: [2] },
          { text: "Kill vehicle · divert thrusters", at: kv, steps: [3] },
          { text: "Hit-to-kill", at: marker, steps: [4] },
        ],
        update(step, t, time) {
          const u = (step + t) / 5, tu = Math.min(1, u / .92), iu = Math.pow(seg(u, .4, .92), 1.5), hit = seg(u, .92, 1);
          const tp = threatC.getPoint(tu);
          threat.visible = hit === 0; threat.position.copy(tp); threat.lookAt(look.copy(tp).add(threatC.getTangent(tu)));
          const sweeping = step === 0 && t < .45;
          const aim = sweeping ? V3(tp.x + Math.sin(time * 2) * 4, tp.y + Math.cos(time * 1.3) * 1.5, tp.z) : tp;
          dish.lookAt(look.copy(aim)); beam.lookAt(look.copy(aim));
          beam.scale.z = aim.distanceTo(R) / 10; beam.material.opacity = sweeping ? .05 : .09;
          track.visible = !sweeping; track.geometry.setDrawRange(0, Math.floor(121 * tu));
          pred.visible = step >= 1 && hit < 1; pred.geometry.setDrawRange(0, Math.floor(predPts.length * (step === 1 ? ease(t) : 1)));
          marker.visible = step >= 1 && hit < .5; marker.quaternion.copy(env.camera.quaternion); marker.scale.setScalar(1 + Math.sin(time * 4) * .08);
          icpt.visible = iu > 0 && hit === 0;
          const ip = intC.getPoint(iu); icpt.position.copy(ip); icpt.lookAt(look.copy(ip).add(intC.getTangent(Math.max(iu, .001))));
          const bs = step < 3 ? 0 : step === 3 ? ease(seg(t, .25, .8)) : 1;
          booster.visible = bs < 1; booster.position.y = -bs * 1.4; booster.rotation.x = bs * .8;
          divert.forEach((g, k) => { g.visible = bs > .5 && hit === 0 && rnd(Math.floor(time * 12) + k * 5) > .55; });
          iTrail.visible = icpt.visible && bs < .3;
          if (iTrail.visible) setPts(iTrail, (i, v) => { const ph = (time * 2 + rnd(i)) % 1; v.copy(intC.getPoint(Math.max(0, iu - ph * .22))).add(V3((rnd(i + 1) - .5) * ph * .3, (rnd(i + 2) - .5) * ph * .3, 0)); });
          tTrail.visible = threat.visible && !sweeping;
          if (tTrail.visible) setPts(tTrail, (i, v) => { const ph = (time * 1.2 + rnd(i)) % 1; v.copy(threatC.getPoint(Math.max(0, tu - ph * .08))); });
          debris.visible = boom.visible = hit > 0;
          if (hit > 0) {
            setPts(debris, (i, v) => {
              const th = rnd(i) * Math.PI * 2, z = rnd(i + 9) * 2 - 1, s = Math.sqrt(1 - z * z), d = hit * 3.2 * (.3 + rnd(i + 4));
              v.set(P.x + Math.cos(th) * s * d + hit * 1.2, P.y + z * d - hit * hit * 1.5, P.z + Math.sin(th) * s * d);
            });
            boom.position.copy(P); boom.scale.setScalar(hit < .25 ? lerp(.5, 6, hit / .25) : 6 * (1 - seg(hit, .25, 1)));
          }
        },
      };
    },
  });

  /* ---------- 04 · Fighter jet ---------- */
  SYSTEMS.push({
    id: "jet", name: "Fighter Jet", cls: "5th-gen multirole aircraft",
    cam: [7.6, 3.0, 2.6], target: [0, 0, -.6],
    steps: [
      { t: "Lift", d: "The wing is shaped and angled so air moving over the top speeds up and its pressure drops. Higher pressure underneath pushes the wing up." },
      { t: "Turbofan", d: "A fan pulls air in and a compressor squeezes it. Fuel burns in the combustor, and the hot gas spins a turbine that powers the fan before blasting out the nozzle." },
      { t: "Afterburner", d: "Extra fuel is sprayed into the exhaust behind the turbine. Burning it adds large thrust for takeoff or combat, but at a steep fuel cost. Shock diamonds form in the supersonic plume." },
      { t: "Control surfaces", d: "Ailerons tilt in opposite directions to roll the jet. Stabilators move together to pitch the nose. A fly-by-wire computer coordinates them dozens of times per second." },
      { t: "Low observability", d: "Stealth comes mostly from shape. Aligned edges and angled facets scatter radar energy away from the transmitter, so very little returns to be detected." },
    ],
    build(root) {
      const jet = new T.Group(); root.add(jet);
      const skin = metal(0x2a333d, { transparent: true, metalness: .35, roughness: .5 }), E = .35;
      const prof = [[0, 3.3], [.1, 3.0], [.26, 2.4], [.4, 1.5], [.48, .6], [.5, -.6], [.5, -2.3], [.44, -3.0]].map(([r, y]) => new T.Vector2(r, y));
      const fg = new T.LatheGeometry(prof, 28); fg.rotateX(Math.PI / 2); fg.scale(1.3, .72, 1);
      jet.add(part(fg, skin, COL.cyan, E, 30));
      const glass = metal(0x0b3a4a, { metalness: .9, roughness: .1, emissive: 0x0a5a70, emissiveIntensity: .5, transparent: true, opacity: .9 });
      const canopy = new T.Mesh(new T.SphereGeometry(1, 24, 12), glass); canopy.scale.set(.26, .2, .75); canopy.position.set(0, .33, 1.7); jet.add(canopy);
      const wingGeo = s => { const g = flat([[.5, 1.0], [3.1, -1.3], [3.1, -1.75], [.5, -2.0]].map(([x, y]) => [x * s, y])); g.rotateX(Math.PI / 2); return g; };
      const pivot = (pts, s, z) => {
        const g = new T.Group(); g.position.set(0, -.05, z);
        const geo = flat(pts.map(([x, y]) => [x * s, y - z])); geo.rotateX(Math.PI / 2);
        g.add(part(geo, skin, COL.amber, .6)); jet.add(g); return g;
      };
      const ail = [], stab = [];
      [1, -1].forEach(s => {
        const w = part(wingGeo(s), skin, COL.cyan, E); w.position.y = -.05; jet.add(w);
        ail.push(pivot([[1.9, -1.85], [3.05, -1.77], [3.05, -1.98], [1.9, -2.08]], s, -1.9));
        stab.push(pivot([[.45, -2.15], [1.75, -2.75], [1.75, -3.05], [.45, -3.1]], s, -2.6));
        const tg = flat([[-1.95, 0], [-2.95, 1.35], [-3.25, 1.35], [-3.15, 0]]); tg.rotateY(-Math.PI / 2);
        const tail = part(tg, skin, COL.cyan, E); tail.position.set(s * .38, .22, 0); tail.rotation.z = -s * .35; jet.add(tail);
        const intake = part(new T.BoxGeometry(.34, .42, 1.3), skin, COL.cyan, E); intake.position.set(s * .64, -.08, .55); jet.add(intake);
      });
      const ng = new T.CylinderGeometry(.3, .36, .6, 24, 1, true); ng.rotateX(Math.PI / 2);
      const nozzle = part(ng, metal(0x161c22, { side: T.DoubleSide }), COL.cyan, .5); nozzle.position.z = -3.25; jet.add(nozzle);
      // engine internals (visible in cutaway)
      const eng = new T.Group(); jet.add(eng);
      const disc = (r, z, color, op = .55) => { const g = new T.CylinderGeometry(r, r, .04, 24); g.rotateX(Math.PI / 2); const m = part(g, metal(0x3a4652), color, op, 1); m.position.z = z; eng.add(m); return m; };
      const spinning = [disc(.34, 1.0, COL.cyan, .7)];
      [.7, .5, .3, .1, -.1, -.3].forEach((z, i) => spinning.push(disc(.3 - i * .014, z, COL.cyan)));
      const torus = new T.Mesh(new T.TorusGeometry(.22, .06, 12, 32), metal(0x5a3a10, { emissive: COL.amber, emissiveIntensity: 1.2 })); torus.position.z = -.62; eng.add(torus);
      spinning.push(disc(.26, -1.0, COL.amber), disc(.26, -1.2, COL.amber));
      const sg = new T.CylinderGeometry(.04, .04, 2.4, 8); sg.rotateX(Math.PI / 2); const shaft = new T.Mesh(sg, metal(0x8fa2b0)); shaft.position.z = -.1; eng.add(shaft);
      const cold = particles(160, COL.cyan, .08), hot = particles(160, COL.amber, .1);
      eng.add(cold, hot);
      // afterburner
      const ab = new T.Group(); ab.position.z = -3.55; jet.add(ab);
      const fl = (r, h, c, o) => { const g = new T.ConeGeometry(r, h, 20, 1, true); g.rotateX(-Math.PI / 2); g.translate(0, 0, -h / 2); return new T.Mesh(g, new T.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); };
      const flameO = fl(.3, 2.6, COL.amber, .45), flameI = fl(.17, 1.6, 0xfff1d6, .6); ab.add(flameO, flameI);
      const diamonds = [.5, 1.0, 1.5, 2.0].map((z, i) => { const g = glow(0xfff1d6, .55 - i * .1); g.position.z = -z; ab.add(g); return g; });
      // lift
      const flow = new T.LineSegments(new T.BufferGeometry(), lineMat(COL.cyan, .65));
      flow.geometry.setAttribute("position", new T.BufferAttribute(new Float32Array(360 * 6), 3)); flow.frustumCulled = false;
      const lift = [1, -1].map(s => { const a = new T.ArrowHelper(V3(0, 1, 0), V3(s * 1.7, .05, -.8), 1.3, COL.cyan, .25, .15); jet.add(a); return a; });
      jet.add(flow);
      // radar scatter
      const EM = V3(6.5, -.2, 5);
      const emitter = glow(COL.red, 1.2); emitter.position.copy(EM); root.add(emitter);
      const hits = [V3(.6, .1, 1.5), V3(1.2, 0, -.2), V3(2.2, -.05, -1.0), V3(.5, .3, -2.6), V3(.6, 0, .8), V3(2.8, -.05, -1.5)];
      const outs = [V3(.2, 1, -.6), V3(-.3, 1, -1), V3(.4, .8, -1), V3(-.2, 1, .3), V3(.1, 1, -.2), V3(.5, .6, -1)].map(v => v.normalize());
      const rays = new T.LineSegments(new T.BufferGeometry(), lineMat(COL.red, .75));
      rays.geometry.setAttribute("position", new T.BufferAttribute(new Float32Array(hits.length * 12), 3));
      rays.frustumCulled = false; root.add(rays);
      const setOpacity = o => { skin.opacity = o; skin.depthWrite = o > .9; glass.opacity = o * .9; };
      return {
        labels: [
          { text: "Low pressure · faster air", at: anchor(jet, 2.0, .55, -.5), steps: [0] },
          { text: "Lift", at: anchor(jet, 1.7, 1.45, -.8), steps: [0] },
          { text: "Fan", at: anchor(eng, 0, .36, 1.0), steps: [1] },
          { text: "Compressor", at: anchor(eng, 0, .3, .2), steps: [1] },
          { text: "Combustor", at: anchor(eng, 0, .3, -.62), steps: [1] },
          { text: "Turbine", at: anchor(eng, 0, .28, -1.1), steps: [1] },
          { text: "Afterburner · shock diamonds", at: anchor(ab, 0, .3, -1.2), steps: [2] },
          { text: "Aileron", at: anchor(ail[0], 2.5, 0, -.05), steps: [3] },
          { text: "Stabilator", at: anchor(stab[0], 1.3, 0, -.2), steps: [3] },
          { text: "Canted twin tails", at: anchor(jet, .7, 1.4, -2.9), steps: [3, 4] },
          { text: "Radar transmitter", at: emitter, steps: [4] },
          { text: "Energy scattered away", at: anchor(root, 1.4, 3.2, -2.2), steps: [4] },
        ],
        update(step, t, time) {
          jet.rotation.set(0, 0, 0); jet.position.y = Math.sin(time) * .05;
          setOpacity(step === 1 ? .12 : 1);
          eng.visible = step === 1; ab.visible = step === 2; flow.visible = step === 0;
          lift.forEach(a => { a.visible = step === 0; a.setLength(1.2 + Math.sin(time * 3) * .15, .25, .15); });
          emitter.visible = rays.visible = step === 4;
          ail.forEach(a => a.rotation.x = 0); stab.forEach(s => s.rotation.x = 0);
          if (step === 0) {
            // streak lines: upper-surface air (faster, bends over the wing) and lower-surface air
            const a = flow.geometry.attributes.position, yAt = (z, upper) => { const b = Math.exp(-Math.pow((z + .5) / 1.1, 2)); return upper ? .2 + .22 * b : -.28 - .05 * b; };
            for (let i = 0; i < 360; i++) {
              const lane = i % 12, k = Math.floor(i / 12), upper = k % 2 === 0, x = (lane < 6 ? 1 : -1) * (.9 + (lane % 6) * .4);
              const sp = upper ? 3.4 : 2.4, z = 4 - ((time * sp + k / 30 * 8 + rnd(lane) * 2) % 8), z2 = z + .1 * sp;
              a.setXYZ(i * 2, x, yAt(z, upper), z); a.setXYZ(i * 2 + 1, x, yAt(z2, upper), z2);
            }
            a.needsUpdate = true;
          }
          if (step === 1) {
            spinning.forEach(m => m.rotation.z = time * 9);
            setPts(cold, (i, v) => { const ph = (time * .9 + rnd(i)) % 1, a = rnd(i + 3) * 6.28, r = rnd(i + 5) * .26; v.set(Math.cos(a) * r, Math.sin(a) * r, 2.2 - ph * 2.8); });
            setPts(hot, (i, v) => { const ph = (time * 1.3 + rnd(i)) % 1, a = rnd(i + 3) * 6.28, r = rnd(i + 5) * .24; v.set(Math.cos(a) * r, Math.sin(a) * r, -.6 - ph * 3.2); });
          }
          if (step === 2) {
            const f = 1 + Math.sin(time * 45) * .06 + rnd(Math.floor(time * 30)) * .08;
            flameO.scale.set(1, 1, f); flameI.scale.set(1, 1, 2 - f);
            diamonds.forEach((d, i) => d.material.opacity = .6 + Math.sin(time * 30 + i) * .25);
          }
          if (step === 3) {
            const w = Math.sin(t * Math.PI * 2), p = Math.sin(t * Math.PI * 4);
            jet.rotation.z = w * .6; jet.rotation.x = -p * .12;
            ail[0].rotation.x = w * .5; ail[1].rotation.x = -w * .5;
            stab.forEach(s => s.rotation.x = p * .3);
          }
          if (step === 4) {
            const a = rays.geometry.attributes.position;
            hits.forEach((h, i) => {
              const ph = (t * 2 + i * .13) % 1, inP = seg(ph, 0, .5), outP = seg(ph, .5, 1);
              const head = V3().lerpVectors(EM, h, inP), tail = V3().lerpVectors(EM, h, Math.max(0, inP - .35));
              a.setXYZ(i * 4, tail.x, tail.y, tail.z); a.setXYZ(i * 4 + 1, head.x, head.y, head.z);
              const o0 = V3().copy(h).addScaledVector(outs[i], Math.max(0, outP - .3) * 4), o1 = V3().copy(h).addScaledVector(outs[i], outP * 4);
              a.setXYZ(i * 4 + 2, o0.x, o0.y, o0.z); a.setXYZ(i * 4 + 3, o1.x, o1.y, o1.z);
            });
            a.needsUpdate = true;
          }
        },
      };
    },
  });

  /* ---------- 05 · Drone ---------- */
  SYSTEMS.push({
    id: "drone", name: "Drone", cls: "Quadcopter UAS",
    cam: [3.4, 2.0, 4.4], target: [0, .1, .2],
    steps: [
      { t: "Hover", d: "Four rotors each push air down. When their combined thrust equals the drone's weight, it hovers. A flight controller adjusts motor speeds hundreds of times per second to stay stable." },
      { t: "Pitch & move", d: "Speeding up the rear rotors and slowing the front ones tips the drone forward. Part of the thrust now points backward, so the drone accelerates forward." },
      { t: "Yaw", d: "Two rotors spin clockwise and two counterclockwise, so their twisting forces cancel. Speed up one pair and the imbalance turns the whole drone in place." },
      { t: "Sense", d: "A stabilized gimbal carries electro-optical and infrared cameras. Onboard AI can detect and track objects in real time and send only what matters back to the operator." },
      { t: "Swarm", d: "Networked drones share position and sensor data over a mesh link. They can hold formations and split up tasks with little human input, a fast-growing area of defense autonomy." },
    ],
    build(root) {
      const mk = () => {
        const d = new T.Group();
        d.add(part(new T.BoxGeometry(.7, .2, 1.0), metal(0x27313b), COL.cyan, .45));
        const top = part(new T.BoxGeometry(.45, .12, .6), metal(0x1b222a), COL.cyan, .6); top.position.y = .16; d.add(top);
        const rotors = [];
        [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sz], k) => {
          const arm = part(new T.BoxGeometry(.1, .06, 1.05), metal(0x2f3a45), COL.cyan, .35);
          arm.position.set(sx * .38, 0, sz * .38); arm.rotation.y = Math.atan2(sx, sz); d.add(arm);
          const motor = part(new T.CylinderGeometry(.11, .12, .16, 20), metal(0x161c22), COL.cyan, .5); motor.position.set(sx * .68, .06, sz * .68); d.add(motor);
          const prop = new T.Group(); prop.position.set(sx * .68, .16, sz * .68);
          prop.add(new T.Mesh(new T.BoxGeometry(.9, .012, .07), metal(0x9fb3c2, { metalness: .2 })));
          const dg = new T.CircleGeometry(.47, 32); dg.rotateX(-Math.PI / 2);
          prop.add(new T.Mesh(dg, new T.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: .07, side: T.DoubleSide, depthWrite: false })));
          d.add(prop); rotors.push({ prop, sx, sz, cw: k % 2 === 0 });
        });
        const gimbal = part(new T.SphereGeometry(.12, 16, 12), metal(0x10151a), COL.cyan, .5); gimbal.position.set(0, -.17, .36); d.add(gimbal);
        return { d, rotors, gimbal, top };
      };
      const main = mk(); root.add(main.d);
      const arrows = main.rotors.map(r => { const a = new T.ArrowHelper(V3(0, 1, 0), V3(r.sx * .68, .22, r.sz * .68), 1, COL.cyan, .18, .1); main.d.add(a); return a; });
      const ground = particles(400, COL.cyan, .06, .5); root.add(ground);
      const cg = new T.ConeGeometry(1.3, 2.6, 28, 1, true); cg.translate(0, -1.3, 0);
      const cone = new T.Mesh(cg, new T.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: .07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      cone.add(new T.LineSegments(new T.EdgesGeometry(cg, 30), lineMat(COL.cyan, .3)));
      main.gimbal.add(cone);
      const boxes = [[-.9, 1.4], [1.1, 2.3], [.1, 3.3]].map(([x, z]) => {
        const g = new T.Group(); g.position.set(x, -2.2, z);
        const sq = new T.LineLoop(new T.BufferGeometry().setFromPoints([V3(-.3, 0, -.3), V3(.3, 0, -.3), V3(.3, 0, .3), V3(-.3, 0, .3)]), lineMat(COL.amber, .9));
        g.add(sq, glow(COL.amber, .5)); root.add(g); return g;
      });
      const swarm = Array.from({ length: 6 }, () => { const m = mk(); m.d.scale.setScalar(.55); root.add(m.d); return m; });
      const links = new T.LineSegments(new T.BufferGeometry(), lineMat(COL.cyan, .45));
      links.geometry.setAttribute("position", new T.BufferAttribute(new Float32Array(14 * 6), 3)); links.frustumCulled = false; root.add(links);
      return {
        labels: [
          { text: "Brushless motor + rotor", at: main.rotors[0].prop, steps: [0] },
          { text: "Flight controller", at: main.top, steps: [0] },
          { text: "Thrust = weight", at: anchor(main.d, -.68, 1.25, .68), steps: [0] },
          { text: "Rear rotors faster", at: anchor(main.d, 0, .5, -.8), steps: [1] },
          { text: "CW", at: main.rotors[0].prop, steps: [2] }, { text: "CCW", at: main.rotors[1].prop, steps: [2] },
          { text: "CW", at: main.rotors[2].prop, steps: [2] }, { text: "CCW", at: main.rotors[3].prop, steps: [2] },
          { text: "EO/IR gimbal", at: main.gimbal, steps: [3] },
          { text: "Vehicle detected", at: boxes[1], steps: [3] },
          { text: "Mesh network link", at: swarm[1].d, steps: [4] },
        ],
        update(step, t, time) {
          const d = main.d, speeds = [1, 1, 1, 1];
          d.position.set(0, Math.sin(time * 1.5) * .06, 0); d.rotation.set(0, 0, 0); d.scale.setScalar(1);
          if (step === 1) { main.rotors.forEach((r, k) => speeds[k] = r.sz > 0 ? .7 : 1.35); d.rotation.x = .28 * ease(seg(t, 0, .3)); }
          if (step === 2) { main.rotors.forEach((r, k) => speeds[k] = r.cw ? 1.35 : .7); d.rotation.y = -ease(t) * Math.PI * 1.2; }
          if (step === 3) d.rotation.x = .1;
          main.rotors.forEach((r, k) => { r.prop.rotation.y = time * 30 * speeds[k] * (r.cw ? -1 : 1); });
          arrows.forEach((a, k) => { a.visible = step < 3; a.setLength(.9 * speeds[k], .18, .1); });
          ground.visible = step === 1 || step === 3;
          const off = step === 1 ? (time * 2.5) % .7 : 0;
          setPts(ground, (i, v) => v.set((i % 20 - 9.5) * .7, -2.2, (Math.floor(i / 20) - 9.5) * .7 - off));
          cone.visible = step === 3; main.gimbal.rotation.x = .55 + Math.sin(time * .8) * .25;
          boxes.forEach((b, k) => { b.visible = step === 3 && t > .25 + k * .2; b.rotation.y = time * .5; });
          const sw = step === 4;
          swarm.forEach(m => m.d.visible = sw); links.visible = sw;
          if (sw) {
            const a = ease(seg(t, .05, .35)), b = ease(seg(t, .55, .85)), all = [...swarm.slice(0, 3), main, ...swarm.slice(3)];
            all.forEach((m, k) => {
              const lx = (k - 3) * .8, vx = (k - 3) * .7, vz = -Math.abs(k - 3) * .55, an = k / 7 * Math.PI * 2;
              m.d.position.set(lerp(lerp(lx, vx, a), Math.cos(an) * 1.7, b), .4 + Math.sin(time * 2 + k) * .08, lerp(lerp(0, vz, a), Math.sin(an) * 1.7, b));
              m.d.scale.setScalar(.45); m.d.rotation.set(0, 0, 0);
              m.rotors.forEach(r => r.prop.rotation.y = time * 30 * (r.cw ? -1 : 1));
            });
            const p = links.geometry.attributes.position;
            all.forEach((m, k) => { const n = all[(k + 1) % 7]; p.setXYZ(k * 2, m.d.position.x, m.d.position.y, m.d.position.z); p.setXYZ(k * 2 + 1, n.d.position.x, n.d.position.y, n.d.position.z); });
            p.needsUpdate = true; links.geometry.setDrawRange(0, 14);
            arrows.forEach(x => x.visible = false);
          }
        },
      };
    },
  });

  /* ---------- 06 · Satellite ---------- */
  SYSTEMS.push({
    id: "satellite", name: "Satellite", cls: "Comms / navigation spacecraft",
    cam: [5.2, 2.6, 6.8], target: [0, 0, 0],
    steps: [
      { t: "Bus & payload", d: "The bus is the spacecraft's body: power, propulsion, computers and thermal control. Star trackers fix its orientation. Everything launches folded inside a rocket fairing." },
      { t: "Deployment", d: "Once in space, the solar arrays unfold to power the spacecraft and the high-gain antenna swings into position to point at Earth." },
      { t: "Orbit", d: "In low Earth orbit a satellite travels at about 7.6 km/s, circling the planet every 90 minutes. It is constantly falling toward Earth but moving sideways fast enough to keep missing it." },
      { t: "Downlink", d: "As it passes overhead, the satellite beams imagery, communications or telemetry to a ground station, then stores data until the next pass." },
      { t: "Constellation", d: "GPS-style navigation uses many satellites on inclined orbits. A receiver that hears precisely timed signals from at least four of them can solve for its own position." },
    ],
    build(root) {
      const earth = new T.Group(); root.add(earth);
      earth.add(new T.Mesh(new T.SphereGeometry(2.2, 48, 32), new T.MeshStandardMaterial({ color: 0x0a1822, metalness: .2, roughness: .9, emissive: 0x04121b })));
      earth.add(new T.LineSegments(new T.EdgesGeometry(new T.SphereGeometry(2.21, 36, 18), 1), lineMat(COL.cyan, .16)));
      const city = particles(320, COL.cyan, .05, .7); earth.add(city, glow(COL.cyan, 6.6, .22));
      setPts(city, (i, v) => { const y = 1 - (i / 319) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; if (rnd(i) > .55) v.set(Math.cos(th) * r * 2.22, y * 2.22, Math.sin(th) * r * 2.22); });
      const TILT = .35, R = 3.7, A0 = -2.2;
      const orbitPos = a => V3(Math.cos(a) * R, 0, Math.sin(a) * R).applyAxisAngle(V3(1, 0, 0), TILT);
      const orbit = ring(R, COL.cyan, .35); orbit.rotation.x = TILT; root.add(orbit);
      // spacecraft
      const sat = new T.Group(), satIn = new T.Group(); sat.add(satIn); root.add(sat);
      const bus = part(new T.BoxGeometry(.8, .8, 1.0), metal(0xb08d3a, { metalness: .8, roughness: .35 }), COL.amber, .45); satIn.add(bus);
      [-.2, .2].forEach(x => { const st = part(new T.CylinderGeometry(.07, .07, .16, 12), metal(0x1a2129), COL.cyan, .5); st.position.set(x, .48, .3); satIn.add(st); });
      const panelMat = metal(0x0e2a4d, { metalness: .25, roughness: .55, emissive: 0x0a2040, emissiveIntensity: .5 });
      const panels = [];
      [1, -1].forEach(s => {
        const yoke = new T.Mesh(new T.CylinderGeometry(.03, .03, .45, 8), metal(0x8fa2b0)); yoke.rotation.z = Math.PI / 2; yoke.position.x = s * .62; satIn.add(yoke);
        for (let j = 0; j < 3; j++) { const p = part(new T.BoxGeometry(.9, .03, .7), panelMat, COL.cyan, .7); p.userData = { s, j }; satIn.add(p); panels.push(p); }
      });
      const dishP = new T.Group(); dishP.position.set(0, -.42, .2); satIn.add(dishP);
      const dg = new T.SphereGeometry(.5, 24, 10, 0, Math.PI * 2, 0, .75); dg.translate(0, -.5, 0);
      dishP.add(part(dg, metal(0xdfe6ea, { metalness: .3, roughness: .5, side: T.DoubleSide }), COL.cyan, .4));
      // ground station, downlink, constellation
      const station = new T.Group(); station.position.copy(orbitPos(A0 + 1.5 * 1.6)).setLength(2.24); root.add(station);
      station.add(glow(COL.amber, .7)); const sRing = ring(.25, COL.amber, .9); station.add(sRing); sRing.lookAt(0, 0, 0);
      const beam = new T.Line(new T.BufferGeometry().setFromPoints([V3(), V3()]), lineMat(COL.amber, .6)); root.add(beam);
      const pulses = [0, 1, 2, 3, 4].map(() => { const g = glow(COL.amber, .3); root.add(g); return g; });
      const fleet = [];
      for (let p = 0; p < 3; p++) for (let k = 0; k < 4; k++) {
        const m = new T.Group();
        m.add(part(new T.BoxGeometry(.12, .12, .16), metal(0xb08d3a), COL.amber, .5));
        const w = part(new T.BoxGeometry(.5, .01, .1), panelMat, COL.cyan, .6); m.add(w);
        m.userData = { p, k }; root.add(m); fleet.push(m);
      }
      const fixLines = new T.LineSegments(new T.BufferGeometry(), lineMat(COL.cyan, .7));
      fixLines.geometry.setAttribute("position", new T.BufferAttribute(new Float32Array(8 * 3), 3)); fixLines.frustumCulled = false; root.add(fixLines);
      const qI = new T.Quaternion(), qL = new T.Quaternion(), m4 = new T.Matrix4(), sp = new T.Vector3(), stp = new T.Vector3();
      const fleetPos = (m, time) => { const { p, k } = m.userData, a = time * .3 + k * Math.PI / 2 + p * .5; return V3(Math.cos(a) * R, 0, Math.sin(a) * R).applyAxisAngle(V3(1, 0, 0), .96).applyAxisAngle(V3(0, 1, 0), p * Math.PI * 2 / 3); };
      return {
        labels: [
          { text: "Bus · power, propulsion, avionics", at: anchor(bus, .4, -.25, .5), steps: [0] },
          { text: "Star trackers", at: anchor(satIn, .2, .56, .3), steps: [0] },
          { text: "Solar arrays · stowed", at: panels[3], steps: [0] },
          { text: "Solar arrays", at: panels[2], steps: [1] },
          { text: "High-gain antenna", at: dishP, steps: [1] },
          { text: "LEO · ~7.6 km/s", at: sat, steps: [2] },
          { text: "Ground station", at: station, steps: [3, 4] },
          { text: "4 signals → position fix", at: anchor(root, 0, 3.4, 0), steps: [4] },
        ],
        update(step, t, time) {
          const dep = step === 0 ? 0 : step === 1 ? t : 1;
          panels.forEach(p => {
            const { s, j } = p.userData, k = ease(seg(dep, j * .18, .45 + j * .18));
            p.position.set(s * lerp(.44 + j * .04, .92 + j * .92, k), 0, 0);
            p.rotation.z = lerp(Math.PI / 2, 0, k);
          });
          dishP.rotation.x = lerp(-Math.PI / 2, 0, ease(seg(dep, .5, 1)));
          const m = step < 2 ? 0 : step === 2 ? ease(seg(t, 0, .45)) : 1;
          const a = A0 + Math.max(0, step - 2 + t) * 1.6;
          earth.position.set(0, lerp(-9.5, 0, m), 0); earth.scale.setScalar(lerp(3.2, 1, m));
          orbit.visible = m > .6;
          sp.copy(orbitPos(a)); sat.position.lerpVectors(V3(0, .3, 0), sp, m); sat.scale.setScalar(lerp(1.4, .24, m));
          m4.lookAt(sat.position, V3(0, 0, 0), V3(0, 1, 0)); qL.setFromRotationMatrix(m4);
          sat.quaternion.copy(qI).slerp(qL, m); satIn.rotation.x = -Math.PI / 2 * m;
          if (m === 0) sat.rotation.y = time * .15;
          station.visible = step >= 3;
          const dl = step === 3;
          beam.visible = dl; pulses.forEach(p => p.visible = dl);
          if (dl) {
            station.getWorldPosition(stp);
            beam.geometry.attributes.position.setXYZ(0, sat.position.x, sat.position.y, sat.position.z);
            beam.geometry.attributes.position.setXYZ(1, stp.x, stp.y, stp.z); beam.geometry.attributes.position.needsUpdate = true;
            pulses.forEach((p, k) => p.position.lerpVectors(sat.position, stp, (time * .9 + k / 5) % 1));
            sRing.scale.setScalar(1 + ((time * 2) % 1) * 1.5);
          }
          const con = step === 4;
          fixLines.visible = con;
          fleet.forEach(f => { f.visible = con; if (con) { f.position.copy(fleetPos(f, time)); f.scale.setScalar(ease(seg(t, 0, .3))); f.lookAt(0, 0, 0); } });
          if (con) {
            station.getWorldPosition(stp);
            const n = stp.clone().normalize();
            const vis = fleet.map(f => ({ f, d: f.position.clone().sub(stp).normalize().dot(n) })).filter(x => x.d > 0).sort((x, y) => y.d - x.d).slice(0, 4);
            const p = fixLines.geometry.attributes.position;
            vis.forEach((x, k) => { p.setXYZ(k * 2, stp.x, stp.y, stp.z); p.setXYZ(k * 2 + 1, x.f.position.x, x.f.position.y, x.f.position.z); });
            p.needsUpdate = true; fixLines.geometry.setDrawRange(0, vis.length * 2 * (t > .3 ? 1 : 0));
          }
        },
      };
    },
  });

  /* ---------- 07 · AESA radar ---------- */
  SYSTEMS.push({
    id: "aesa", name: "AESA Radar", cls: "Active electronically scanned array",
    cam: [5.4, 4.2, 6.8], target: [0, 0, 1.2],
    steps: [
      { t: "Tiny radars", d: "An active electronically scanned array is a flat grid of transmit/receive modules. Each one is a miniature radar with its own amplifier and phase shifter." },
      { t: "Phase delay", d: "If every module transmits in step, the beam points straight ahead. Delay each module slightly more than its neighbor and the waves add up along a tilted front, sending the beam off at an angle." },
      { t: "Electronic steering", d: "Changing the delays moves the beam in microseconds without moving the antenna. A mechanical radar has to physically turn to look somewhere new." },
      { t: "Multi-target tracking", d: "By rapidly switching between beam directions, one array can track several targets, keep searching and even jam, all at the same time." },
    ],
    build(root) {
      const arr = new T.Group(); arr.position.z = -1.5; root.add(arr);
      const back = part(new T.BoxGeometry(3.4, 3.4, .2), metal(0x1a2129), COL.cyan, .4); back.position.z = -.12; arr.add(back);
      const N = 10, SP = .3, els = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const mat = metal(0x24303a, { emissive: COL.cyan, emissiveIntensity: 0 });
        const e = new T.Mesh(new T.BoxGeometry(.22, .22, .05), mat); e.position.set((i - 4.5) * SP, (j - 4.5) * SP, 0);
        e.userData = { i, j, x: (i - 4.5) * SP }; arr.add(e); els.push(e);
      }
      const LAM = .8, C = 1.4, rings = [];
      for (let i = 0; i < N; i++) for (let m = 0; m < 3; m++) { const r = ring(1, COL.cyan, .5, Math.PI, 48); r.userData = { x: (i - 4.5) * SP, m }; r.position.set((i - 4.5) * SP, 0, .05); arr.add(r); rings.push(r); }
      const lobeGeo = new T.ConeGeometry(.9, 7, 24, 1, true); lobeGeo.rotateX(-Math.PI / 2); lobeGeo.translate(0, 0, 3.5);
      const lobes = [0, 1, 2].map(() => {
        const g = new T.Group(); g.position.z = .05; arr.add(g);
        const mesh = new T.Mesh(lobeGeo, new T.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: .1, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
        const axis = new T.Line(new T.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(0, 0, 7)]), lineMat(COL.cyan, .6));
        g.add(mesh, axis); g.userData.mesh = mesh; return g;
      });
      const tgts = [0, 1, 2].map(() => { const g = part(new T.OctahedronGeometry(.16), metal(0x5a3a10, { emissive: COL.amber, emissiveIntensity: .8 }), COL.amber, .9); g.add(glow(COL.amber, .6)); root.add(g); return g; });
      return {
        labels: [
          { text: "T/R module", at: els[55], steps: [0] },
          { text: "Phase-shifted wavefront", at: anchor(lobes[0], 0, 0, 2.6), steps: [1] },
          { text: "Beam steers · no moving parts", at: anchor(lobes[0], 0, 0, 5), steps: [2] },
          { text: "Track 1", at: tgts[0], steps: [3] }, { text: "Track 2", at: tgts[1], steps: [3] }, { text: "Track 3", at: tgts[2], steps: [3] },
        ],
        update(step, t, time) {
          let th = 0;
          if (step === 1) th = lerp(0, .45, ease(seg(t, .1, .6)));
          if (step === 2) th = Math.sin(time * .9) * .8;
          const s = Math.sin(th);
          els.forEach(e => {
            const { i, j, x } = e.userData;
            e.material.emissiveIntensity = step === 0 ? .5 + .5 * Math.sin(time * 3 + rnd(i * 10 + j) * 20) : .3 + .7 * (.5 + .5 * Math.sin((time * C + x * s) / LAM * Math.PI * 2));
          });
          const showRings = step === 1 || step === 2;
          rings.forEach(r => {
            r.visible = showRings; if (!showRings) return;
            const rad = ((time * C + r.userData.x * s) % LAM + LAM) % LAM + r.userData.m * LAM;
            r.scale.setScalar(Math.max(.01, rad)); r.material.opacity = .55 * (1 - rad / (3 * LAM));
          });
          lobes.forEach((l, k) => { l.visible = step === 1 || step === 2 ? k === 0 : step === 3; });
          lobes[0].rotation.set(0, th, 0); lobes[0].userData.mesh.material.opacity = .1;
          tgts.forEach((g, k) => {
            g.visible = step === 3;
            const ph = -.65 + k * .65 + Math.sin(time * .5 + k * 2) * .15, d = 5.4, y = (k - 1) * .6;
            g.position.set(Math.sin(ph) * d, y, Math.cos(ph) * d - 1.5); g.rotation.y = time;
            if (step === 3) {
              lobes[k].rotation.set(-Math.atan2(y, d), ph, 0);
              lobes[k].userData.mesh.material.opacity = Math.floor(time * 8) % 3 === k ? .16 : .035;
            }
          });
        },
      };
    },
  });

  /* =========================================================
     LAB ENGINE
     ========================================================= */
  function disposeTree(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => m.dispose());
    });
  }
  function isShown(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }

  function mount(host, ids) {
    const LIST = ids ? ids.map(id => SYSTEMS.find(s => s.id === id)).filter(Boolean) : SYSTEMS;
    host.classList.toggle("single", LIST.length === 1);
    if (!T || !T.OrbitControls) {
      host.innerHTML = `<div class="lab-fallback">The 3D systems lab needs WebGL and could not load in this browser.</div>`;
      return { dispose() {} };
    }
    host.innerHTML = `
      <div class="lab-list" role="tablist" aria-label="Systems">${LIST.map((s, i) =>
        `<button type="button" role="tab" data-i="${i}"><span class="n">${pad(i + 1)}</span><b>${s.name}</b><small>${s.cls}</small></button>`).join("")}</div>
      <div class="lab-stage">
        <div class="lab-canvas"></div>
        <div class="lab-labels" aria-hidden="true"></div>
        <div class="hud hud-tl"><span class="lab-sys"></span><b class="lab-name"></b></div>
        <div class="hud hud-tr"><button type="button" class="chip lab-play"></button></div>
        <div class="hud hud-bl">◎ Drag to rotate</div>
        <div class="hud hud-br lab-clock"></div>
      </div>
      <div class="lab-info">
        <div class="lab-steps" role="tablist" aria-label="Steps"></div>
        <div class="lab-caption" aria-live="polite"><span class="eyebrow lab-stepno"></span><h3 class="lab-title"></h3><p class="lab-desc"></p></div>
      </div>`;
    const $ = s => host.querySelector(s);
    const stage = $(".lab-stage");
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { host.innerHTML = `<div class="lab-fallback">The 3D systems lab needs WebGL, which is unavailable in this browser.</div>`; return { dispose() {} }; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    $(".lab-canvas").appendChild(renderer.domElement);
    const scene = new T.Scene(); scene.fog = new T.Fog(0x05070a, 16, 40);
    const camera = new T.PerspectiveCamera(38, 1, .1, 200);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: true, enableZoom: false, enablePan: false, autoRotateSpeed: .45, minPolarAngle: .25, maxPolarAngle: Math.PI * .62 });
    scene.add(new T.HemisphereLight(0xbfe9ff, 0x0a0e13, .6));
    const key = new T.DirectionalLight(0xffffff, 1.0); key.position.set(5, 8, 6); scene.add(key);
    const rim = new T.PointLight(COL.cyan, .8, 30); rim.position.set(-6, 3, -5); scene.add(rim);
    const warm = new T.PointLight(COL.amber, .5, 30); warm.position.set(6, -2, 4); scene.add(warm);
    const grid = new T.GridHelper(60, 60, 0x1f4757, 0x0f2530); grid.position.y = -3; grid.material.transparent = true; grid.material.opacity = .5; scene.add(grid);

    const STEP_SEC = 6;
    let sys, ctx, root, step = 0, t = 0, playing = !reduceMotion, labelEls = [], stepBtns = [];
    const tabs = [...host.querySelectorAll(".lab-list button")];
    const playBtn = $(".lab-play");
    const setPlay = p => { playing = p; playBtn.textContent = p ? "❚❚ Pause" : "▶ Play"; playBtn.setAttribute("aria-pressed", String(p)); };

    function caption() {
      const s = sys.steps[step];
      $(".lab-stepno").textContent = `Step ${pad(step + 1)} / ${pad(sys.steps.length)}`;
      $(".lab-title").textContent = s.t;
      $(".lab-desc").textContent = s.d;
      stepBtns.forEach((b, k) => { b.classList.toggle("on", k === step); b.setAttribute("aria-selected", String(k === step)); });
    }
    function select(i) {
      if (root) { scene.remove(root); disposeTree(root); }
      sys = LIST[i]; root = new T.Group(); scene.add(root);
      ctx = sys.build(root, { camera });
      camera.position.set(...sys.cam); controls.target.set(...sys.target);
      controls.autoRotate = !reduceMotion && sys.rotate !== false; controls.update();
      step = 0; t = reduceMotion ? .6 : 0;
      tabs.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
      $(".lab-sys").textContent = `SYS ${pad(SYSTEMS.indexOf(sys) + 1)}/${pad(SYSTEMS.length)} // ${sys.cls}`;
      $(".lab-name").textContent = sys.name;
      $(".lab-steps").innerHTML = sys.steps.map((s, k) => `<button type="button" role="tab" data-k="${k}"><i></i><span class="n">${pad(k + 1)}</span><span class="tl">${s.t}</span></button>`).join("");
      stepBtns = [...$(".lab-steps").children];
      $(".lab-labels").innerHTML = ctx.labels.map(l => `<div class="lab-label"><i></i><span>${l.text}</span></div>`).join("");
      labelEls = [...$(".lab-labels").children];
      caption();
    }
    host.addEventListener("click", e => {
      const tab = e.target.closest(".lab-list button"); if (tab) return select(+tab.dataset.i);
      const sb = e.target.closest(".lab-steps button"); if (sb) { step = +sb.dataset.k; t = reduceMotion ? .6 : 0; caption(); return; }
      if (e.target.closest(".lab-play")) setPlay(!playing);
    });

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize); ro.observe(stage);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(stage);

    const v = new T.Vector3(); let raf, last = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!visible) return;
      const time = now / 1000;
      if (!reduceMotion) {
        t += dt / STEP_SEC;
        if (t >= 1) { if (playing) { t = 0; step = (step + 1) % sys.steps.length; caption(); } else t = 1; }
      }
      ctx.update(step, t, time);
      stepBtns.forEach((b, k) => b.style.setProperty("--p", k < step ? 1 : k === step ? t : 0));
      controls.update();
      renderer.render(scene, camera);
      const w = stage.clientWidth, h = stage.clientHeight;
      ctx.labels.forEach((l, k) => {
        let on = l.steps.includes(step) && isShown(l.at);
        if (on) { l.at.getWorldPosition(v); v.project(camera); on = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05; }
        labelEls[k].classList.toggle("on", on);
        if (on) labelEls[k].style.transform = `translate(${((v.x * .5 + .5) * w).toFixed(1)}px,${((-v.y * .5 + .5) * h).toFixed(1)}px)`;
      });
    }
    setPlay(playing); select(0); resize(); raf = requestAnimationFrame(frame);
    return {
      dispose() {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
        disposeTree(scene); renderer.dispose(); renderer.forceContextLoss();
      },
    };
  }

  /* =========================================================
     HERO GLOBE — dotted Earth with trajectories and orbits
     ========================================================= */
  function heroGlobe(canvas) {
    if (!T) return { dispose() {} };
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return { dispose() {} }; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, .1, 100);
    camera.position.set(0, .4, 10);
    const g = new T.Group(); g.rotation.z = .3; scene.add(g);
    const RG = 2.4, N = 2600;
    const dots = particles(N, 0x8fe6ff, .055, .8);
    setPts(dots, (i, v) => { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; v.set(Math.cos(th) * r * RG, y * RG, Math.sin(th) * r * RG); });
    g.add(dots, new T.Mesh(new T.SphereGeometry(RG * .985, 48, 32), new T.MeshBasicMaterial({ color: 0x05070a })));
    scene.add(glow(COL.cyan, 7.6, .16));
    [-.6, -.3, 0, .3, .6].forEach(y => { const r = ring(Math.sqrt(1 - y * y) * RG * 1.002, COL.cyan, .12); r.position.y = y * RG; g.add(r); });
    const ll = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return V3(Math.cos(a) * Math.cos(b) * RG, Math.sin(a) * RG, -Math.cos(a) * Math.sin(b) * RG); };
    const routes = [[38, -77, 51, 0], [38, -77, 25, 121], [51, 0, 50, 30], [35, 139, 37, 127], [25, 55, 33, 44], [-33, 151, 21, -158], [40, -100, 64, -150], [48, 2, 15, 0]];
    const arcs = routes.map(([a, b, c, d], k) => {
      const p0 = ll(a, b), p1 = ll(c, d), mid = p0.clone().add(p1).normalize().multiplyScalar(RG + p0.distanceTo(p1) * .45);
      const curve = new T.QuadraticBezierCurve3(p0, mid, p1);
      const line = curveLine(curve, k % 3 ? COL.cyan : COL.amber, .75, 80);
      const head = glow(k % 3 ? COL.cyan : COL.amber, .35);
      g.add(line, head); return { curve, line, head, off: rnd(k) };
    });
    const sats = [[3.2, .5, 0], [3.6, -.4, 1.2], [4.0, .9, 2.2]].map(([r, tilt, rot], k) => {
      const o = new T.Group(); o.rotation.set(tilt, rot, 0); scene.add(o);
      o.add(ring(r, COL.cyan, .18));
      const s = glow(k === 1 ? COL.amber : 0xffffff, .3); o.add(s); return { s, r, k };
    });
    let mx = 0, my = 0, raf, last = performance.now(), visible = true;
    const onMove = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
    addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => visible = e.isIntersecting); io.observe(canvas);
    function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!visible) return;
      const time = now / 1000;
      if (!reduceMotion) g.rotation.y += dt * .07;
      arcs.forEach(a => {
        const ph = reduceMotion ? 1 : ((time * .22 + a.off) % 1.4);
        const f = clamp(ph);
        a.line.geometry.setDrawRange(0, Math.floor(81 * f)); a.head.visible = ph < 1;
        a.head.position.copy(a.curve.getPoint(f)); a.line.material.opacity = ph > 1 ? .75 * (1 - (ph - 1) / .4) : .75;
      });
      sats.forEach(({ s, r, k }) => { const a = time * (.25 + k * .07) + k * 2; s.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); });
      camera.position.x += (mx * 1.2 - camera.position.x) * .04; camera.position.y += (.4 - my * .8 - camera.position.y) * .04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    resize(); raf = requestAnimationFrame(frame);
    return { dispose() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener("pointermove", onMove); disposeTree(scene); renderer.dispose(); renderer.forceContextLoss(); } };
  }

  window.Lab = { systems: SYSTEMS.map(s => ({ id: s.id, name: s.name, cls: s.cls })), mount, heroGlobe };
})();
