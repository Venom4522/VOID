// ── MARQUEE ────────────────────────────────
const items = ['Product Renders', 'Archviz', 'Motion Design', '3D Animation', 'Blender', 'Cinema 4D', 'Houdini', 'Unreal Engine 5', 'Substance Painter', 'Brand Campaigns', 'Commercial Renders', 'Photorealism'];
const track = document.getElementById('marqueeTrack');
let html = '';
[...items, ...items].forEach(t => {
  html += `<span class="marquee-item"><span class="marquee-dot"></span>${t}</span>`;
});
track.innerHTML = html;

// ── PORTFOLIO RENDERS ──────────────────────
const grid = document.getElementById('portfolioGrid');

// Extracts YouTube video ID from any URL format or bare ID
function extractYouTubeId(input) {
  if (!input) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = input.trim().match(p);
    if (m) return m[1];
  }
  return input.trim();
}

function buildPortfolioItem(p, i) {
  const div = document.createElement('div');
  const isVert = p.aspect === 'vertical';
  const aspectClass = isVert ? ' pitem-vertical' : ' pitem-horizontal';
  div.className = 'pitem reveal' + aspectClass + (i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : '');

  const isVertical = isVert ? ' vertical' : '';
  div.innerHTML = `
    <div class="pitem-video-wrapper${isVertical}" id="videoWrapper${i}">
      <img class="video-thumbnail" src="${p.thumbnail}" alt="${p.title}">
      <div class="video-play-overlay" id="playOverlay${i}">
        <div class="play-circle" id="centerBtn${i}">
          <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      </div>
      <button class="video-fs-btn" id="fsBtn${i}" title="Fullscreen">⛶</button>
    </div>
    <div class="pitem-overlay">
      <div class="pitem-tag">${p.cat} · ${p.year}</div>
      <div class="pitem-title">${p.title}</div>
      <div class="pitem-meta">${p.meta || 'CGI Showreel · Watch on Site'}</div>
    </div>
  `;
  grid.appendChild(div);

  setTimeout(() => {
    const wrapper = document.getElementById('videoWrapper' + i);
    const centerBtn = document.getElementById('centerBtn' + i);
    const fsBtn = document.getElementById('fsBtn' + i);
    const overlay = document.getElementById('playOverlay' + i);
    const thumb = wrapper.querySelector('.video-thumbnail');
    let iframeWrap = null;
    let isPlaying = false;
    let hideTimer = null;

    function showControls() { wrapper.classList.remove('controls-hidden'); resetHideTimer(); }
    function hideControls() { if (isPlaying) wrapper.classList.add('controls-hidden'); }
    function resetHideTimer() { clearTimeout(hideTimer); if (isPlaying) hideTimer = setTimeout(hideControls, 5000); }

    function createIframe() {
      iframeWrap = document.createElement('div');
      iframeWrap.className = 'yt-iframe-wrap';
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + p.videoId + '?si=UOiL14FE1Dnih4QW&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&showinfo=0&disablekb=1';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframeWrap.appendChild(iframe);
      const blocker = document.createElement('div');
      blocker.className = 'yt-click-blocker';
      iframeWrap.appendChild(blocker);
      wrapper.insertBefore(iframeWrap, overlay);
    }

    function updatePlayIcon(playing) {
      centerBtn.innerHTML = playing
        ? '<svg class="pause-icon" viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18" fill="var(--accent)"/><rect x="15" y="3" width="4" height="18" fill="var(--accent)"/></svg>'
        : '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';
    }

    function play() {
      if (!iframeWrap) createIframe();
      wrapper.classList.add('playing');
      updatePlayIcon(true);
      isPlaying = true;
      resetHideTimer();
    }

    function pause() {
      if (iframeWrap) { iframeWrap.remove(); iframeWrap = null; }
      wrapper.classList.remove('playing', 'controls-hidden');
      updatePlayIcon(false);
      isPlaying = false;
      clearTimeout(hideTimer);
    }

    centerBtn.addEventListener('click', e => { e.stopPropagation(); isPlaying ? pause() : play(); });
    thumb.addEventListener('click', e => { e.stopPropagation(); play(); });
    wrapper.addEventListener('click', e => {
      if (!isPlaying) return;
      if (e.target === fsBtn || e.target === centerBtn || centerBtn.contains(e.target)) return;
      showControls();
    });
    fsBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (!iframeWrap) play();
      const el = wrapper;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });
  }, 100);
}

// Load portfolio from portfolio.json, fall back gracefully
fetch('portfolio.json')
  .then(r => r.json())
  .then(projects => {
    projects.forEach((p, i) => buildPortfolioItem(p, i));
    // Re-observe any newly added .reveal elements
    document.querySelectorAll('.pitem.reveal:not(.visible)').forEach(el => observer.observe(el));
  })
  .catch(() => {
    grid.innerHTML = '<p style="color:var(--muted);padding:2rem">Could not load portfolio data.</p>';
  });

function drawPortfolioItem(id, p) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  // Background gradient
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
  bg.addColorStop(0, p.palette[1]);
  bg.addColorStop(1, p.palette[0]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Noise/grain
  for (let i = 0; i < 3000; i++) {
    const nx = Math.random() * w, ny = Math.random() * h;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.015})`;
    ctx.fillRect(nx, ny, 1, 1);
  }

  const cx = w / 2, cy = h / 2;

  if (p.shape === 'bottle') drawBottle(ctx, cx, cy, w, h, p.palette);
  else if (p.shape === 'headphone') drawHeadphone(ctx, cx, cy, w, h, p.palette);
  else if (p.shape === 'arch') drawArch(ctx, cx, cy, w, h, p.palette);
  else if (p.shape === 'speaker') drawSpeaker(ctx, cx, cy, w, h, p.palette);
  else if (p.shape === 'watch') drawWatch(ctx, cx, cy, w, h, p.palette);
  else if (p.shape === 'motion') drawMotion(ctx, cx, cy, w, h, p.palette);

  // Vignette
  const vig = ctx.createRadialGradient(cx, cy, h * 0.3, cx, cy, h);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function drawBottle(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h) * 0.55;
  // Glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.9);
  g.addColorStop(0, p[2] + '44'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.fill();
  // Bottle body
  ctx.save();
  const grad = ctx.createLinearGradient(cx - s * 0.18, 0, cx + s * 0.18, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0.05)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.25)');
  grad.addColorStop(0.7, p[2] + '80');
  grad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy - s * 0.52);
  ctx.bezierCurveTo(cx - s * 0.12, cy - s * 0.62, cx - s * 0.22, cy - s * 0.68, cx - s * 0.22, cy - s * 0.72);
  ctx.lineTo(cx + s * 0.22, cy - s * 0.72);
  ctx.bezierCurveTo(cx + s * 0.22, cy - s * 0.68, cx + s * 0.12, cy - s * 0.62, cx + s * 0.12, cy - s * 0.52);
  ctx.bezierCurveTo(cx + s * 0.28, cy - s * 0.4, cx + s * 0.28, cy + s * 0.5, cx + s * 0.18, cy + s * 0.55);
  ctx.bezierCurveTo(cx + s * 0.1, cy + s * 0.58, cx - s * 0.1, cy + s * 0.58, cx - s * 0.18, cy + s * 0.55);
  ctx.bezierCurveTo(cx - s * 0.28, cy + s * 0.5, cx - s * 0.28, cy - s * 0.4, cx - s * 0.12, cy - s * 0.52);
  ctx.closePath();
  ctx.fill();
  // Highlight
  const hl = ctx.createLinearGradient(cx - s * 0.2, 0, cx, 0);
  hl.addColorStop(0, 'rgba(255,255,255,0.4)'); hl.addColorStop(1, 'transparent');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.22, cy - s * 0.7);
  ctx.lineTo(cx - s * 0.05, cy - s * 0.48);
  ctx.bezierCurveTo(cx - s * 0.18, cy - s * 0.1, cx - s * 0.22, cy + s * 0.2, cx - s * 0.25, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.5);
  ctx.bezierCurveTo(cx - s * 0.2, cy + s * 0.2, cx - s * 0.15, cy - s * 0.1, cx - s * 0.02, cy - s * 0.46);
  ctx.lineTo(cx, cy - s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Label
  ctx.fillStyle = p[3] + 'cc';
  ctx.font = `${s * 0.08}px 'Syne', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ECLIPSE', cx, cy + s * 0.08);
  ctx.font = `${s * 0.04}px 'DM Mono', monospace`;
  ctx.fillStyle = p[3] + '88';
  ctx.fillText('EAU DE PARFUM', cx, cy + s * 0.16);
}

function drawHeadphone(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h) * 0.38;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 1.2);
  g.addColorStop(0, p[2] + '33'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * 1.4, 0, Math.PI * 2); ctx.fill();
  // Band arc
  ctx.strokeStyle = p[2]; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
  ctx.shadowColor = p[2]; ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.1, s * 0.8, Math.PI, 0);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Ear cups
  [[cx - s * 0.8, cy + s * 0.2], [cx + s * 0.8, cy + s * 0.2]].forEach(([ex, ey]) => {
    const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, s * 0.38);
    eg.addColorStop(0, p[1]); eg.addColorStop(1, p[0]);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.ellipse(ex, ey, s * 0.32, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = p[2] + '88'; ctx.lineWidth = 1;
    ctx.stroke();
    // Inner ring
    ctx.strokeStyle = p[2]; ctx.lineWidth = s * 0.04;
    ctx.beginPath(); ctx.arc(ex, ey, s * 0.2, 0, Math.PI * 2); ctx.stroke();
  });
}

function drawArch(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h);
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, p[2] + '22'); sky.addColorStop(1, 'transparent');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.7);
  // Grid floor
  ctx.strokeStyle = p[2] + '22'; ctx.lineWidth = 0.5;
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * w;
    ctx.beginPath(); ctx.moveTo(x, h * 0.65); ctx.lineTo(cx, h * 0.55); ctx.stroke();
  }
  for (let j = 0; j < 6; j++) {
    const t = j / 5;
    const y = h * 0.55 + t * (h * 0.45);
    ctx.beginPath(); ctx.moveTo(cx - t * (cx), y); ctx.lineTo(cx + t * (w - cx), y); ctx.stroke();
  }
  // Building
  const bw = w * 0.22, bh = h * 0.68;
  const bx = cx - bw / 2, by = h - bh - h * 0.02;
  const bg2 = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  bg2.addColorStop(0, p[0]); bg2.addColorStop(0.4, p[1]); bg2.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = bg2; ctx.fillRect(bx, by, bw, bh);
  // Windows
  ctx.fillStyle = p[2] + '88';
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 4; c++) {
      const wx = bx + (c + 0.5) * (bw / 4) - 4, wy = by + 20 + r * 22;
      ctx.fillRect(wx, wy, 7, 10);
    }
  }
  // Glow
  const glw = ctx.createRadialGradient(cx, by, 0, cx, by, w * 0.3);
  glw.addColorStop(0, p[2] + '55'); glw.addColorStop(1, 'transparent');
  ctx.fillStyle = glw; ctx.beginPath(); ctx.arc(cx, by, w * 0.3, 0, Math.PI * 2); ctx.fill();
}

function drawSpeaker(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h) * 0.45;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s);
  g.addColorStop(0, p[3] + '22'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * 1.2, 0, Math.PI * 2); ctx.fill();
  // Cabinet
  const rg = ctx.createLinearGradient(cx - s * 0.4, 0, cx + s * 0.4, 0);
  rg.addColorStop(0, '#1a1a1a'); rg.addColorStop(0.5, '#2a2a2a'); rg.addColorStop(1, '#111');
  roundRect(ctx, cx - s * 0.4, cy - s * 0.55, s * 0.8, s * 1.1, s * 0.05, rg);
  // Woofer
  for (let r = 4; r >= 0; r--) {
    const cr = s * 0.1 + r * s * 0.035;
    ctx.strokeStyle = r === 4 ? p[3] + '66' : '#333';
    ctx.lineWidth = r === 4 ? 2 : 1;
    ctx.beginPath(); ctx.arc(cx, cy + s * 0.05, cr, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(cx, cy + s * 0.05, s * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p[3];
  ctx.beginPath(); ctx.arc(cx, cy + s * 0.05, s * 0.025, 0, Math.PI * 2); ctx.fill();
  // Tweeter
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.32, s * 0.06, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = p[3] + '55';
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.32, s * 0.04, 0, Math.PI * 2); ctx.fill();
}

function roundRect(ctx, x, y, rw, rh, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + rw - r, y);
  ctx.arcTo(x + rw, y, x + rw, y + r, r);
  ctx.lineTo(x + rw, y + rh - r);
  ctx.arcTo(x + rw, y + rh, x + rw - r, y + rh, r);
  ctx.lineTo(x + r, y + rh);
  ctx.arcTo(x, y + rh, x, y + rh - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function drawWatch(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h) * 0.35;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 1.3);
  g.addColorStop(0, p[2] + '44'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * 1.4, 0, Math.PI * 2); ctx.fill();
  // Strap
  ctx.fillStyle = p[1];
  ctx.fillRect(cx - s * 0.18, cy - s * 1.3, s * 0.36, s * 0.6);
  ctx.fillRect(cx - s * 0.18, cy + s * 0.7, s * 0.36, s * 0.6);
  // Case
  const cg = ctx.createRadialGradient(cx - s * 0.15, cy - s * 0.15, 0, cx, cy, s * 0.85);
  cg.addColorStop(0, p[2] + 'cc'); cg.addColorStop(0.5, p[1]); cg.addColorStop(1, p[0]);
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, s * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = p[2] + '88'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.72, 0, Math.PI * 2); ctx.stroke();
  // Dial
  ctx.fillStyle = p[0] + 'cc'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.6, 0, Math.PI * 2); ctx.fill();
  // Hour marks
  ctx.strokeStyle = p[2]; ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r1 = s * 0.5, r2 = s * (i % 3 === 0 ? 0.42 : 0.46);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
  // Hands
  ctx.strokeStyle = p[2]; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(-0.8) * s * 0.35, cy + Math.sin(-0.8) * s * 0.35); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(0.5) * s * 0.44, cy + Math.sin(0.5) * s * 0.44); ctx.stroke();
  ctx.fillStyle = p[3]; ctx.beginPath(); ctx.arc(cx, cy, s * 0.04, 0, Math.PI * 2); ctx.fill();
}

function drawMotion(ctx, cx, cy, w, h, p) {
  const s = Math.min(w, h) * 0.5;
  // Concentric rings
  for (let i = 5; i >= 0; i--) {
    const r = s * (0.2 + i * 0.15);
    const alpha = 0.05 + (5 - i) * 0.04;
    ctx.strokeStyle = p[2] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }
  // Particles
  const time = Date.now() / 1000;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + time * 0.5;
    const r = s * (0.3 + Math.sin(i * 1.3) * 0.25);
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    ctx.fillStyle = i % 3 === 0 ? p[2] : p[3] + '88';
    ctx.beginPath(); ctx.arc(px, py, 2 + Math.sin(i) * 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // Core
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.2);
  cg.addColorStop(0, p[3]); cg.addColorStop(0.5, p[2] + '99'); cg.addColorStop(1, 'transparent');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, s * 0.2, 0, Math.PI * 2); ctx.fill();
  // Monogram
  ctx.fillStyle = p[0];
  ctx.font = `bold ${s * 0.18}px 'Syne', sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('FX', cx, cy);
}

// About canvas
(function () {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  function resize() {
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  const cx = w / 2, cy = h / 2;
  // BG
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0c0c10'); bg.addColorStop(1, '#050507');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // Grid
  ctx.strokeStyle = 'rgba(200,255,0,0.06)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // Abstract face silhouette
  const fg = ctx.createRadialGradient(cx, cy - h * 0.05, 0, cx, cy, h * 0.45);
  fg.addColorStop(0, 'rgba(200,255,0,0.08)'); fg.addColorStop(0.5, 'rgba(0,212,255,0.05)'); fg.addColorStop(1, 'transparent');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy - h * 0.05, h * 0.38, 0, Math.PI * 2); ctx.fill();
  // Void mask
  ctx.strokeStyle = 'rgba(200,255,0,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.05, h * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // Eyes
  ctx.fillStyle = '#c8ff00';
  ctx.beginPath(); ctx.arc(cx - h * 0.08, cy - h * 0.1, h * 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + h * 0.08, cy - h * 0.1, h * 0.025, 0, Math.PI * 2); ctx.fill();
  // Label
  ctx.fillStyle = 'rgba(200,255,0,0.5)';
  ctx.font = `${h * 0.04}px 'DM Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('[ identity: classified ]', cx, cy + h * 0.38);
  ctx.font = `${h * 0.03}px 'DM Mono', monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText('3D Visual Artist · Est. 2018', cx, cy + h * 0.44);
})();

// ── SCROLL REVEAL ──────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── FORM ───────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const formData = new FormData(contactForm);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
      .then(res => {
        if (res.ok) {
          btn.style.display = 'none';
          document.getElementById('formNote').style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(err => {
        btn.textContent = 'Send Message → Let\'s Create';
        btn.disabled = false;
        alert('Something went wrong. Please try again or email directly.');
        console.error(err);
      });
  });
}

// ── PARALLAX ───────────────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.hero-orb').forEach((o, i) => {
    o.style.transform = `translateY(${y * (0.1 + i * 0.05)}px)`;
  });
});