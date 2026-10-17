(() => {
  'use strict';

  const canvas = document.getElementById('pide');
  const ctx = canvas.getContext('2d');

  // thicken: extra stroke (× font size) for thin script faces
  // tracking: letter spacing (× font size); 0 keeps script letters joined
  // grain: how big a seed may be relative to the stroke width of the face
  const CLASSIC_FONTS = [
    { id: 'baloo', name: 'Baloo 2', css: (s) => `800 ${s}px "Baloo 2"`, thicken: 0.03, tracking: 0.04, grain: 1 },
    { id: 'titan', name: 'Titan One', css: (s) => `400 ${s}px "Titan One"`, thicken: 0.02, tracking: 0.04, grain: 1.05 },
    { id: 'lobster', name: 'Lobster', css: (s) => `400 ${s}px Lobster`, thicken: 0.02, tracking: 0.02, grain: 0.85 },
    { id: 'pacifico', name: 'Pacifico', css: (s) => `400 ${s}px Pacifico`, thicken: 0.025, tracking: 0, grain: 0.8 },
    { id: 'dancing', name: 'Dancing Script', css: (s) => `700 ${s}px "Dancing Script"`, thicken: 0.04, tracking: 0, grain: 0.75 },
  ];

  const CYBER_FONTS = [
    { id: 'oxanium', name: 'Oxanium', css: (s) => `800 ${s}px Oxanium`, thicken: 0.02, tracking: 0.04, grain: 1 },
    { id: 'exo2', name: 'Exo 2', css: (s) => `900 ${s}px "Exo 2"`, thicken: 0.02, tracking: 0.03, grain: 1 },
    { id: 'audiowide', name: 'Audiowide', css: (s) => `400 ${s}px Audiowide`, thicken: 0.025, tracking: 0.04, grain: 0.95 },
    { id: 'chakra', name: 'Chakra Petch', css: (s) => `700 ${s}px "Chakra Petch"`, thicken: 0.02, tracking: 0.03, grain: 1 },
    { id: 'rajdhani', name: 'Rajdhani', css: (s) => `700 ${s}px Rajdhani`, thicken: 0.02, tracking: 0.03, grain: 1 },
    { id: 'russo', name: 'Russo One', css: (s) => `400 ${s}px "Russo One"`, thicken: 0.015, tracking: 0.04, grain: 1.1 },
  ];

  const ALL_FONTS = [...CLASSIC_FONTS, ...CYBER_FONTS];

  // Canvas size, photo, and the flat inner area (fractions of the bread's half-size)
  const SHAPES = {
    oval: { w: 1200, h: 900, src: 'img/oval.webp', inner: { kind: 'ellipse', rx: 0.83, ry: 0.74, cy: 0 } },
    yuvarlak: { w: 1200, h: 900, src: 'img/yuvarlak.webp', inner: { kind: 'ellipse', rx: 0.83, ry: 0.69, cy: 0 } },
    uzun: { w: 1400, h: 600, src: 'img/uzun.webp', inner: { kind: 'stadium', rx: 0.86, ry: 0.63, cy: -0.04 } },
    'uzun-duz': { w: 1400, h: 600, src: 'img/uzun-duz.webp', inner: { kind: 'stadium', rx: 0.86, ry: 0.63, cy: -0.04 } },
  };

  let W = 1200, H = 900;

  // ---------- helpers ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newCanvas() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  }

  const images = {};
  function loadImage(shape) {
    if (!images[shape]) {
      images[shape] = new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = SHAPES[shape].src;
      });
    }
    return images[shape];
  }

  // ---------- bread base ----------
  let baseCache = { key: '', data: null };

  async function getBase(shape, theme = 'classic') {
    const cacheKey = `${shape}:${theme}`;
    if (baseCache.key === cacheKey) return baseCache.data;
    const img = await loadImage(shape);
    const cfg = SHAPES[shape];
    const c = newCanvas();
    const g = c.getContext('2d');
    const scale = Math.min((W * 0.92) / img.width, (H * 0.86) / img.height);
    const bw = img.width * scale, bh = img.height * scale;
    const bx = (W - bw) / 2, by = (H - bh) / 2 - H * 0.01;

    if (theme === 'cyberpunk') {
      // Futuristic Cyberpide Underglow Auras (cyan + magenta)
      g.save();
      g.shadowColor = 'rgba(0, 240, 255, 0.75)';
      g.shadowBlur = 65;
      g.shadowOffsetY = 12;
      g.drawImage(img, bx, by, bw, bh);
      g.restore();

      g.save();
      g.shadowColor = 'rgba(255, 0, 127, 0.55)';
      g.shadowBlur = 32;
      g.drawImage(img, bx, by, bw, bh);
      g.restore();

      // Futuristic color grading
      g.save();
      g.filter = 'contrast(1.18) brightness(0.95) saturate(1.22) hue-rotate(-12deg)';
      g.drawImage(img, bx, by, bw, bh);
      g.restore();

      // Holographic cyber grid & energy traces on the bread silhouette
      g.save();
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(0, 240, 255, 0.04)';
      g.fillRect(bx, by, bw, bh);

      g.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      g.lineWidth = 1.2;
      const step = 48;
      for (let x = bx; x < bx + bw; x += step) {
        g.beginPath();
        g.moveTo(x, by);
        g.lineTo(x, by + bh);
        g.stroke();
      }
      for (let y = by; y < by + bh; y += step) {
        g.beginPath();
        g.moveTo(bx, y);
        g.lineTo(bx + bw, y);
        g.stroke();
      }

      g.strokeStyle = 'rgba(255, 0, 127, 0.16)';
      g.lineWidth = 1.8;
      g.beginPath();
      g.arc(bx + bw / 2, by + bh / 2, Math.min(bw, bh) * 0.34, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    } else {
      g.save();
      g.shadowColor = 'rgba(0,0,0,.55)';
      g.shadowBlur = 50;
      g.shadowOffsetY = 22;
      g.drawImage(img, bx, by, bw, bh);
      g.restore();
    }

    // Bread silhouette (for sesame placement)
    const m = newCanvas().getContext('2d', { willReadFrequently: true });
    m.drawImage(img, bx, by, bw, bh);
    const alpha = m.getImageData(0, 0, W, H).data;

    const bread = { x: bx, y: by, w: bw, h: bh, cx: bx + bw / 2, cy: by + bh / 2 };
    const ir = cfg.inner;
    const inner = {
      kind: ir.kind,
      cx: bread.cx,
      cy: bread.cy + ir.cy * bh / 2,
      rx: ir.rx * bw / 2,
      ry: ir.ry * bh / 2,
    };
    const data = { canvas: c, alpha, bread, inner };
    baseCache = { key: cacheKey, data };
    return data;
  }

  // Dense outline of the inner area, used for the seed border
  function innerPolygon(inner, inset) {
    const rx = inner.rx * inset, ry = inner.ry * inset;
    const pts = [];
    if (inner.kind === 'ellipse') {
      for (let i = 0; i < 1500; i++) {
        const t = (i / 1500) * Math.PI * 2;
        pts.push([inner.cx + Math.cos(t) * rx, inner.cy + Math.sin(t) * ry]);
      }
    } else {
      const half = rx - ry;
      for (let i = 0; i < 400; i++) pts.push([inner.cx - half + (2 * half * i) / 400, inner.cy - ry]);
      for (let i = 0; i < 300; i++) {
        const t = -Math.PI / 2 + (Math.PI * i) / 300;
        pts.push([inner.cx + half + Math.cos(t) * ry, inner.cy + Math.sin(t) * ry]);
      }
      for (let i = 0; i < 400; i++) pts.push([inner.cx + half - (2 * half * i) / 400, inner.cy + ry]);
      for (let i = 0; i < 300; i++) {
        const t = Math.PI / 2 + (Math.PI * i) / 300;
        pts.push([inner.cx - half + Math.cos(t) * ry, inner.cy + Math.sin(t) * ry]);
      }
    }
    return pts;
  }

  // ---------- seed drawing ----------
  function makeNigellaShapes(rnd, n) {
    const shapes = [];
    for (let k = 0; k < n; k++) {
      const j = () => (rnd() - 0.5) * 0.25;
      const pts = [
        [1 + j(), 0 + j()],
        [-0.35 + j(), 0.62 + j()],
        [-0.85 + j(), 0.1 + j()],
        [-0.5 + j(), -0.6 + j()],
      ].map(([x, y]) => [x, y * 0.85]);
      const body = new Path2D();
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const m0 = mid(pts[3], pts[0]);
      body.moveTo(m0[0], m0[1]);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const m = mid(p, pts[(i + 1) % pts.length]);
        body.quadraticCurveTo(p[0], p[1], m[0], m[1]);
      }
      body.closePath();
      const facet = new Path2D();
      facet.moveTo(pts[0][0] * 0.8, pts[0][1] * 0.8);
      facet.lineTo(pts[3][0] * 0.7, pts[3][1] * 0.7);
      facet.lineTo(-0.1, -0.05);
      facet.closePath();
      shapes.push({ body, facet });
    }
    return shapes;
  }

  const nigellaShapes = makeNigellaShapes(mulberry32(9), 14);

  const sesameBody = (() => {
    const p = new Path2D();
    p.moveTo(1, 0);
    p.bezierCurveTo(0.7, 0.62, -0.7, 0.6, -1, 0.05);
    p.bezierCurveTo(-0.8, -0.55, 0.6, -0.62, 1, 0);
    p.closePath();
    return p;
  })();

  const NEON_PALETTES = [
    { body: '#00f5ff', glow: 'rgba(0, 245, 255, 0.95)', core: '#e6ffff', stroke: 'rgba(255,255,255,0.85)' },
    { body: '#ff007f', glow: 'rgba(255, 0, 127, 0.95)', core: '#ffe6f3', stroke: 'rgba(255,255,255,0.85)' },
    { body: '#ffe600', glow: 'rgba(255, 230, 0, 0.95)', core: '#fffde6', stroke: 'rgba(255,255,255,0.85)' },
    { body: '#b026ff', glow: 'rgba(176, 38, 255, 0.95)', core: '#f7e6ff', stroke: 'rgba(255,255,255,0.85)' },
    { body: '#00ff66', glow: 'rgba(0, 255, 102, 0.95)', core: '#e6ffe8', stroke: 'rgba(255,255,255,0.85)' },
  ];

  function drawNigella(g, seed, extraScale = 1, theme = 'classic') {
    const { x, y, size, rot, v } = seed;
    const sc = size * extraScale;
    const cos = Math.cos(rot) * sc, sin = Math.sin(rot) * sc;
    const sh = nigellaShapes[v];

    if (theme === 'cyberpunk') {
      g.setTransform(cos, sin, -sin, cos, x, y);
      g.shadowColor = 'rgba(0, 245, 255, 0.85)';
      g.shadowBlur = 7 * extraScale;
      g.fillStyle = '#060a15';
      g.fill(sh.body);
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(0, 245, 255, 0.8)';
      g.fill(sh.facet);
      g.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      g.setTransform(cos, sin, -sin, cos, x + size * 0.22, y + size * 0.32);
      g.fillStyle = 'rgba(70,30,5,.35)';
      g.fill(sh.body);
      g.setTransform(cos, sin, -sin, cos, x, y);
      g.fillStyle = '#120e0c';
      g.fill(sh.body);
      g.fillStyle = 'rgba(120,112,105,.28)';
      g.fill(sh.facet);
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function drawSesame(g, s, theme = 'classic', glowFactor = 1) {
    const cos = Math.cos(s.rot) * s.size, sin = Math.sin(s.rot) * s.size;
    if (theme === 'cyberpunk') {
      const pal = s.palette || NEON_PALETTES[0];
      const gf = Math.max(0.3, glowFactor);
      g.setTransform(cos, sin, -sin, cos, s.x, s.y);
      g.shadowColor = pal.glow;
      g.shadowBlur = 12 * gf;
      g.fillStyle = pal.body;
      g.fill(sesameBody);
      g.shadowBlur = 0;
      g.lineWidth = 0.08;
      g.strokeStyle = pal.stroke;
      g.stroke(sesameBody);
      g.fillStyle = pal.core;
      g.beginPath();
      g.ellipse(0.15, -0.18, 0.45 * gf, 0.14 * gf, -0.1, 0, Math.PI * 2);
      g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      g.setTransform(cos, sin, -sin, cos, s.x + s.size * 0.2, s.y + s.size * 0.3);
      g.fillStyle = 'rgba(80,32,6,.28)';
      g.fill(sesameBody);
      g.setTransform(cos, sin, -sin, cos, s.x, s.y);
      g.fillStyle = s.tone;
      g.fill(sesameBody);
      g.lineWidth = 0.09;
      g.strokeStyle = 'rgba(140,95,40,.55)';
      g.stroke(sesameBody);
      g.fillStyle = 'rgba(255,255,240,.45)';
      g.beginPath();
      g.ellipse(0.15, -0.18, 0.45, 0.13, -0.1, 0, Math.PI * 2);
      g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  // ---------- text layout ----------
  function setFont(g, font, size) {
    g.font = font.css(size);
    if ('letterSpacing' in g) g.letterSpacing = `${(font.tracking * size).toFixed(1)}px`;
  }

  function layoutText(text, font, inner, sizePct) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const m = newCanvas().getContext('2d');
    const probe = 200;
    setFont(m, font, probe);
    // Fit using the real ink bounds so tall script ascenders/descenders stay on the bread
    let maxW = 0, asc = 0, desc = 0;
    for (const l of lines) {
      const t = m.measureText(l);
      maxW = Math.max(maxW, t.width + probe * font.thicken);
      asc = Math.max(asc, t.actualBoundingBoxAscent || probe * 0.75);
      desc = Math.max(desc, t.actualBoundingBoxDescent || probe * 0.2);
    }
    const pad = probe * font.thicken / 2;
    const lineBox = asc + desc + pad * 2;
    const gap = probe * 0.12;
    const totalProbe = lines.length * lineBox + (lines.length - 1) * gap;
    const ellipse = inner.kind === 'ellipse';
    const boxW = inner.rx * 2 * (ellipse ? 0.86 : 0.92);
    const boxH = inner.ry * 2 * (ellipse ? 0.72 : 0.86);
    const fit = Math.min(boxW / maxW, boxH / totalProbe);
    const k = fit * (sizePct / 100);
    const size = probe * k;
    const top = inner.cy - (totalProbe * k) / 2;
    const ys = lines.map((_, i) => top + (i * (lineBox + gap) + pad + asc) * k);
    return { lines, size, ys, cx: inner.cx };
  }

  function textMask(layout, font) {
    const c = newCanvas();
    const g = c.getContext('2d', { willReadFrequently: true });
    setFont(g, font, layout.size);
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#fff';
    g.strokeStyle = '#fff';
    g.lineJoin = 'round';
    g.lineWidth = layout.size * font.thicken;
    layout.lines.forEach((l, i) => {
      g.fillText(l, layout.cx, layout.ys[i]);
      if (font.thicken) g.strokeText(l, layout.cx, layout.ys[i]);
    });
    const d = g.getImageData(0, 0, W, H).data;
    const a = new Uint8Array(W * H);
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0, p = 3; i < a.length; i++, p += 4) {
      if (d[p] > 127) {
        a[i] = 1;
        const x = i % W, y = (i / W) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    return { a, box: x1 >= x0 ? [x0, y0, x1, y1] : null };
  }

  // ---------- seed placement ----------
  function placeSeeds(mask, size, spacing, rnd, outlineOnly) {
    const { a, box } = mask;
    if (!box) return [];
    const ins = (x, y) => {
      x = Math.round(x); y = Math.round(y);
      return x >= 0 && y >= 0 && x < W && y < H && a[y * W + x] === 1;
    };
    const DIRS = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      DIRS.push([Math.cos(t), Math.sin(t)]);
    }
    const rIn = size * 0.3, rOut = size * 0.75;
    const [x0, y0, x1, y1] = box;

    const edge = [], fill = [], thin = [];
    const step = Math.max(1.2, size * 0.3);
    for (let y = y0; y <= y1; y += step) {
      for (let x = x0; x <= x1; x += step) {
        const px = x + (rnd() - 0.5) * step;
        const py = y + (rnd() - 0.5) * step;
        if (!ins(px, py)) continue;
        let nx = 0, ny = 0, outs = 0, nearOut = false;
        for (const [dx, dy] of DIRS) {
          if (!ins(px + dx * rOut, py + dy * rOut)) { nx += dx; ny += dy; outs++; }
          if (!ins(px + dx * rIn, py + dy * rIn)) nearOut = true;
        }
        if (outs) {
          const rot = Math.atan2(ny, nx) + Math.PI / 2 + (rnd() - 0.5) * 0.3;
          (nearOut ? thin : edge).push([px, py, rot]);
        } else if (!outlineOnly) {
          fill.push([px, py, rnd() * Math.PI * 2]);
        }
      }
    }

    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = (rnd() * (i + 1)) | 0;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const cell = spacing;
    const gw = Math.ceil(W / cell) + 2;
    const grid = new Map();
    const out = [];
    const sp2 = spacing * spacing;
    const tryAdd = (x, y, rot) => {
      const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        for (let xx = gx - 1; xx <= gx + 1; xx++) {
          const b = grid.get(yy * gw + xx);
          if (!b) continue;
          for (const p of b) {
            const dx = p[0] - x, dy = p[1] - y;
            if (dx * dx + dy * dy < sp2) return;
          }
        }
      }
      const key = gy * gw + gx;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push([x, y]);
      out.push([x, y, rot]);
    };
    for (const [x, y, r] of shuffle(edge)) tryAdd(x, y, r);
    for (const [x, y, r] of shuffle(fill)) tryAdd(x, y, r);
    for (const [x, y, r] of shuffle(thin)) tryAdd(x, y, r);
    return out;
  }

  function borderSeeds(inner, size, spacing, rnd) {
    const pts = innerPolygon(inner, 0.97);
    const out = [];
    let acc = spacing;
    for (let i = 1; i <= pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i % pts.length];
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      acc += Math.hypot(dx, dy);
      if (acc >= spacing) {
        acc = 0;
        out.push([p0[0], p0[1], Math.atan2(dy, dx) + (rnd() - 0.5) * 0.4]);
      }
    }
    return out;
  }

  function scatterSesame(base, rnd, avoid, size, theme = 'classic') {
    const { bread, alpha } = base;
    const solid = (x, y) => {
      x |= 0; y |= 0;
      return x >= 0 && y >= 0 && x < W && y < H && alpha[(y * W + x) * 4 + 3] > 250;
    };
    const count = Math.round((bread.w * bread.h * 0.8) / 2200);
    const tones = ['#f2dfae', '#ecd29a', '#f6e6bd', '#e3c27f'];
    const out = [];
    const m = size * 2;
    let tries = 0;
    while (out.length < count && tries < count * 25) {
      tries++;
      const x = bread.x + rnd() * bread.w;
      const y = bread.y + rnd() * bread.h;
      if (!solid(x, y) || !solid(x + m, y) || !solid(x - m, y) || !solid(x, y + m) || !solid(x, y - m)) continue;
      if (avoid(x, y)) continue;
      const palette = NEON_PALETTES[(rnd() * NEON_PALETTES.length) | 0];
      out.push({
        x,
        y,
        size: size * (0.85 + rnd() * 0.3),
        rot: rnd() * Math.PI * 2,
        tone: tones[(rnd() * tones.length) | 0],
        palette,
        pulseSpeed: 1.5 + rnd() * 2.5,
        phase: rnd() * Math.PI * 2,
      });
    }
    return out;
  }

  // ---------- state & UI ----------
  const els = {
    text: document.getElementById('text'),
    fonts: document.getElementById('fonts'),
    density: document.getElementById('density'),
    seedSize: document.getElementById('seedSize'),
    textSize: document.getElementById('textSize'),
    outline: document.getElementById('outline'),
    border: document.getElementById('border'),
    sesame: document.getElementById('sesame'),
    animate: document.getElementById('animate'),
    reroll: document.getElementById('reroll'),
    download: document.getElementById('download'),
    share: document.getElementById('share'),
    toast: document.getElementById('toast'),
  };

  function currentTheme() {
    const el = document.querySelector('input[name="theme"]:checked');
    return el ? el.value : 'classic';
  }

  function setTheme(theme, updateChips = true) {
    const valid = theme === 'cyberpunk' ? 'cyberpunk' : 'classic';
    const radio = document.querySelector(`input[name="theme"][value="${valid}"]`);
    if (radio) radio.checked = true;
    document.documentElement.setAttribute('data-theme', valid);
    state.font = valid === 'cyberpunk' ? state.cyberFont : state.classicFont;
    if (updateChips) renderFontChips();
  }

  // ---------- language ----------
  const I18N = {
    tr: {
      title: 'Pide Mesaj',
      stage: 'Pide',
      canvas: 'Üzerinde çörek otuyla yazı yazılmış pide',
      theme: 'Tema', themeClassic: 'Klasik', themeCyber: 'Cyberpide 2077',
      text: 'Yazı', font: 'Yazı tipi', bread: 'Pide',
      oval: 'Oval', round: 'Yuvarlak', ridged: 'Tırnak pide', long: 'Uzun düz',
      density: 'Tane sıklığı', seedSize: 'Tane boyutu', textSize: 'Yazı boyutu',
      outline: 'Sadece kenar çizgisi', border: 'Kenara çörek otu çerçeve',
      sesame: 'Susam serp', animate: 'Serpme animasyonu',
      reroll: 'Yeniden serp', download: 'PNG indir', share: 'Paylaş',
      copied: 'Bağlantı kopyalandı.', copyFail: 'Bağlantıyı adres çubuğundan kopyalayabilirsin.',
      defaultText: 'Hoşgeldiniz', file: 'mesaj',
    },
    en: {
      title: 'Pide Message',
      stage: 'Pide',
      canvas: 'Turkish pide bread with writing made of nigella seeds',
      theme: 'Theme', themeClassic: 'Classic', themeCyber: 'Cyberpide 2077',
      text: 'Text', font: 'Font', bread: 'Bread',
      oval: 'Oval', round: 'Round', ridged: 'Ridged', long: 'Long flat',
      density: 'Seed density', seedSize: 'Seed size', textSize: 'Text size',
      outline: 'Outline only', border: 'Seed border',
      sesame: 'Sprinkle sesame', animate: 'Sprinkle animation',
      reroll: 'Re-sprinkle', download: 'Download PNG', share: 'Share',
      copied: 'Link copied.', copyFail: 'Copy the link from the address bar.',
      defaultText: 'Welcome', file: 'message',
    },
  };

  function detectLang() {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && I18N[saved]) return saved;
    } catch (_) {}
    return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  }

  let lang = 'tr';
  const t = (k) => I18N[lang][k];

  function setLang(next, { keepText = false } = {}) {
    const prev = lang;
    lang = I18N[next] ? next : 'tr';
    document.documentElement.lang = lang;
    document.title = `${t('title')} · ${lang === 'tr' ? 'Pide Message' : 'Pide Mesaj'}`;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'));
    if (!keepText && els.text.value === I18N[prev].defaultText) els.text.value = t('defaultText');
    try { localStorage.setItem('lang', lang); } catch (_) {}
  }

  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    setLang(b.dataset.lang);
    schedule(0);
  }));

  const state = {
    font: CLASSIC_FONTS[0],
    classicFont: CLASSIC_FONTS[0],
    cyberFont: CYBER_FONTS[0],
    scatterSeed: 1234,
  };

  function renderFontChips() {
    els.fonts.innerHTML = '';
    const isCyber = currentTheme() === 'cyberpunk';
    const fonts = isCyber ? CYBER_FONTS : CLASSIC_FONTS;
    const active = isCyber ? state.cyberFont : state.classicFont;
    state.font = active;

    fonts.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = isCyber ? 'CYBER' : 'Pide';
      b.title = f.name;
      b.style.font = f.css(isCyber ? 16 : 20);
      b.setAttribute('aria-label', f.name);
      b.setAttribute('aria-pressed', f.id === active.id ? 'true' : 'false');
      b.addEventListener('click', () => {
        state.font = f;
        if (currentTheme() === 'cyberpunk') {
          state.cyberFont = f;
        } else {
          state.classicFont = f;
        }
        els.fonts.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        schedule(0);
      });
      els.fonts.appendChild(b);
    });
  }

  function currentShape() {
    return document.querySelector('input[name="shape"]:checked').value;
  }

  function readOpts() {
    return {
      text: els.text.value,
      theme: currentTheme(),
      shape: currentShape(),
      density: +els.density.value / 100,
      seedScale: 0.7 + (+els.seedSize.value / 100) * 0.7,
      textSize: +els.textSize.value,
      outline: els.outline.checked,
      border: els.border.checked,
      sesame: els.sesame.checked,
    };
  }

  function setCanvasSize(shape) {
    const cfg = SHAPES[shape];
    if (W === cfg.w && H === cfg.h && canvas.width === W) return;
    W = cfg.w;
    H = cfg.h;
    canvas.width = W;
    canvas.height = H;
    baseCache = { key: '', data: null };
  }

  let rafId = 0;
  let cyberLoopId = 0;
  let renderToken = 0;

  function stopAnimations() {
    cancelAnimationFrame(rafId);
    cancelAnimationFrame(cyberLoopId);
  }

  function startCyberLoop(staticLayer, sesames) {
    cancelAnimationFrame(cyberLoopId);
    const frame = (now) => {
      const t = now * 0.001;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(staticLayer, 0, 0);
      for (let i = 0; i < sesames.length; i++) {
        const s = sesames[i];
        // Traveling cyber wave + individual pulse
        const wave = Math.sin(t * 1.8 - (s.x * 0.003 + s.y * 0.002));
        const pulse = Math.sin(t * s.pulseSpeed + s.phase);
        const glow = 0.65 + 0.35 * pulse + Math.max(0, wave * wave * wave) * 0.65;
        drawSesame(ctx, s, 'cyberpunk', glow);
      }
      cyberLoopId = requestAnimationFrame(frame);
    };
    cyberLoopId = requestAnimationFrame(frame);
  }

  async function render(animate, isExport = false) {
    const token = ++renderToken;
    const opts = readOpts();
    try { await document.fonts.load(state.font.css(100), opts.text || 'a'); } catch (_) {}
    setCanvasSize(opts.shape);
    const base = await getBase(opts.shape, opts.theme);
    if (token !== renderToken) return;

    const rnd = mulberry32(state.scatterSeed);
    const font = state.font;
    const layout = layoutText(opts.text, font, base.inner, opts.textSize);

    // Seed size follows the letter size so strokes stay a few seeds wide
    const refSize = base.bread.w / 150;
    const size = layout
      ? Math.max(3.5, Math.min(12, layout.size * 0.032 * font.grain * opts.seedScale))
      : refSize * opts.seedScale;
    const L = size * 2;
    const spacing = L * (0.85 - 0.45 * opts.density);

    const textPts = layout ? placeSeeds(textMask(layout, font), size, spacing, rnd, opts.outline) : [];
    const bSize = refSize * opts.seedScale;
    const borderPts = opts.border ? borderSeeds(base.inner, bSize, bSize * 2 * 0.95, rnd) : [];

    const all = [];
    const jitter = (s) => s * (0.85 + rnd() * 0.3);
    const v = () => (rnd() * nigellaShapes.length) | 0;
    for (const [x, y, rot] of textPts) {
      let line = 0, best = Infinity;
      layout.ys.forEach((ly, i) => { const d = Math.abs(ly - y); if (d < best) { best = d; line = i; } });
      all.push({ x, y, rot, size: jitter(size), v: v(), order: line * W * 2 + x + rnd() * 30 });
    }
    borderPts.forEach(([x, y, rot], i) => {
      all.push({ x, y, rot, size: jitter(bSize), v: v(), order: 1e7 + i });
    });
    all.sort((a, b) => a.order - b.order);

    // Calculate sesame positions (keeping clear of writing)
    let sesames = [];
    if (opts.sesame) {
      const cell = Math.max(24, L * 2);
      const occ = new Set();
      for (const p of all) occ.add(Math.floor(p.y / cell) * 10000 + Math.floor(p.x / cell));
      const avoid = (x, y) => {
        const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
        for (let yy = gy - 1; yy <= gy + 1; yy++)
          for (let xx = gx - 1; xx <= gx + 1; xx++)
            if (occ.has(yy * 10000 + xx)) return true;
        return false;
      };
      sesames = scatterSesame(base, rnd, avoid, refSize * 0.75, opts.theme);
    }

    // Background layer
    const layer = newCanvas();
    const lg = layer.getContext('2d');
    lg.drawImage(base.canvas, 0, 0);

    // For classic theme, sesame seeds are baked directly into the background layer
    if (opts.theme === 'classic') {
      for (const s of sesames) drawSesame(lg, s, 'classic');
    }

    stopAnimations();

    // Export mode or static rendering
    if (!animate || !all.length) {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(layer, 0, 0);
      for (const s of all) drawNigella(ctx, s, 1, opts.theme);

      if (opts.theme === 'cyberpunk') {
        if (isExport) {
          // Draw static peak-glow neon sesames for export
          for (const s of sesames) drawSesame(ctx, s, 'cyberpunk', 1.0);
        } else {
          // Build static layer and launch live neon animation loop
          const staticLayer = newCanvas();
          const slg = staticLayer.getContext('2d');
          slg.drawImage(layer, 0, 0);
          for (const s of all) drawNigella(slg, s, 1, 'cyberpunk');
          startCyberLoop(staticLayer, sesames);
        }
      }
      return;
    }

    // Sprinkling fall animation
    const total = Math.min(3200, Math.max(1100, all.length * 1.2));
    const fall = 380;
    all.forEach((s, i) => { s.delay = (i / all.length) * total + rnd() * 90; });
    let settled = 0;
    const start = performance.now();

    const frame = (now) => {
      const t = now - start;
      while (settled < all.length && t - all[settled].delay >= fall) {
        drawNigella(lg, all[settled], 1, opts.theme);
        settled++;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(layer, 0, 0);

      // In cyberpunk mode, show neon sesames during sprinkling
      if (opts.theme === 'cyberpunk') {
        for (const s of sesames) drawSesame(ctx, s, 'cyberpunk', 0.85);
      }

      for (let i = settled; i < all.length; i++) {
        const s = all[i];
        const p = (t - s.delay) / fall;
        if (p <= 0) break;
        const e = 1 - Math.pow(1 - p, 3);
        ctx.globalAlpha = Math.min(1, p * 2.5);
        drawNigella(ctx, { ...s, y: s.y - (1 - e) * 60, rot: s.rot - (1 - e) * 2 }, 1 + (1 - e) * 0.9, opts.theme);
        ctx.globalAlpha = 1;
      }

      if (settled < all.length) {
        rafId = requestAnimationFrame(frame);
      } else if (opts.theme === 'cyberpunk') {
        // Once sprinkling settles, switch to continuous neon animation loop!
        const staticLayer = newCanvas();
        const slg = staticLayer.getContext('2d');
        slg.drawImage(layer, 0, 0);
        startCyberLoop(staticLayer, sesames);
      }
    };
    rafId = requestAnimationFrame(frame);
  }

  let timer = 0;
  function schedule(delay = 220) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      render(els.animate.checked);
      saveHash();
    }, delay);
  }

  // ---------- URL share state ----------
  const SLIDERS = { d: 'density', z: 'seedSize', t: 'textSize' };
  const TOGGLES = { o: 'outline', b: 'border', s: 'sesame' };
  const DEFAULT_SEED = state.scatterSeed;

  function saveHash() {
    const p = new URLSearchParams();
    p.set('y', els.text.value);
    p.set('f', state.font.id);
    p.set('p', currentShape());
    p.set('l', lang);
    if (currentTheme() === 'cyberpunk') p.set('m', 'cyber');
    for (const [k, id] of Object.entries(SLIDERS)) {
      if (els[id].value !== els[id].defaultValue) p.set(k, els[id].value);
    }
    for (const [k, id] of Object.entries(TOGGLES)) {
      if (els[id].checked !== els[id].defaultChecked) p.set(k, els[id].checked ? '1' : '0');
    }
    if (state.scatterSeed !== DEFAULT_SEED) p.set('r', String(state.scatterSeed));
    history.replaceState(null, '', '#' + p.toString());
  }

  function loadHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    setLang(I18N[p.get('l')] ? p.get('l') : detectLang());
    if (p.has('y')) els.text.value = p.get('y').slice(0, 60);
    const m = p.get('m');
    const isCyber = m === 'cyber' || m === 'cyberpunk';

    const fontId = p.get('f');
    const f = ALL_FONTS.find((x) => x.id === fontId);
    if (f) {
      if (CYBER_FONTS.some((cf) => cf.id === f.id)) {
        state.cyberFont = f;
      } else {
        state.classicFont = f;
      }
      state.font = f;
    }

    setTheme(isCyber ? 'cyberpunk' : 'classic', false);
    renderFontChips();
    const sh = document.querySelector(`input[name="shape"][value="${CSS.escape(p.get('p') || '')}"]`);
    if (sh) sh.checked = true;
    for (const [k, id] of Object.entries(SLIDERS)) {
      els[id].value = p.has(k) && Number.isFinite(+p.get(k)) ? p.get(k) : els[id].defaultValue;
    }
    for (const [k, id] of Object.entries(TOGGLES)) {
      els[id].checked = p.has(k) ? p.get(k) === '1' : els[id].defaultChecked;
    }
    const r = parseInt(p.get('r'), 10);
    if (Number.isFinite(r)) state.scatterSeed = r;
  }

  // ---------- export ----------
  async function exportBlob() {
    stopAnimations();
    await render(false, true);
    return new Promise((res) => {
      const out = newCanvas();
      const g = out.getContext('2d');
      const theme = currentTheme();
      if (theme === 'cyberpunk') {
        const grad = g.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#060814');
        grad.addColorStop(1, '#110a26');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        const rg = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H) * 0.5);
        rg.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        rg.addColorStop(0.5, 'rgba(255, 0, 127, 0.08)');
        rg.addColorStop(1, 'transparent');
        g.fillStyle = rg;
        g.fillRect(0, 0, W, H);
      } else {
        const grad = g.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#3a291d');
        grad.addColorStop(1, '#22170f');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
      }
      g.drawImage(canvas, 0, 0);
      out.toBlob(res, 'image/png');
    });
  }

  function fileName() {
    const slug = els.text.value.trim().toLocaleLowerCase('tr').replace(/\s+/g, '-').replace(/[^a-z0-9çğıöşü-]/g, '').slice(0, 30);
    const prefix = currentTheme() === 'cyberpunk' ? 'cyberpide' : 'pide';
    return `${prefix}-${slug || t('file')}.png`;
  }

  function toast(msg) {
    els.toast.textContent = msg;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (els.toast.textContent = ''), 2600);
  }

  els.download.addEventListener('click', async () => {
    const blob = await exportBlob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    if (currentTheme() === 'cyberpunk') schedule(0);
  });

  els.share.addEventListener('click', async () => {
    saveHash();
    const url = location.href;
    try {
      const blob = await exportBlob();
      const file = new File([blob], fileName(), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: t('title'), text: url });
        if (currentTheme() === 'cyberpunk') schedule(0);
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: t('title'), url });
        if (currentTheme() === 'cyberpunk') schedule(0);
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t('copied'));
    } catch (_) {
      toast(t('copyFail'));
    }
    if (currentTheme() === 'cyberpunk') schedule(0);
  });

  els.reroll.addEventListener('click', () => {
    state.scatterSeed = (Math.random() * 1e9) | 0;
    schedule(0);
  });

  document.getElementById('themes').addEventListener('change', (e) => {
    setTheme(e.target.value);
    baseCache = { key: '', data: null };
    schedule(0);
  });

  els.text.addEventListener('input', () => schedule());
  for (const el of [els.density, els.seedSize, els.textSize]) el.addEventListener('input', () => schedule(120));
  for (const el of [els.outline, els.border, els.sesame]) el.addEventListener('change', () => schedule(0));
  document.getElementById('shapes').addEventListener('change', () => schedule(0));

  loadHash();
  render(els.animate.checked);
})();
