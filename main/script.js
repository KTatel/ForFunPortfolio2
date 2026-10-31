
// --- 1. WEB AUDIO SYNTHESIZER (Retro/Magical UI SFX) ---
let sfxEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq = 600, type = 'sine', duration = 0.12) {
  if (!sfxEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + duration);

  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

document.getElementById('sfx-toggle').addEventListener('click', () => {
  sfxEnabled = !sfxEnabled;
  document.getElementById('sfx-label').textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
  if (sfxEnabled) playTone(520, 'triangle', 0.15);
});

// --- 2. PARALLAX PORTAL & 3D CAMERA FLY-THROUGH ---
const portalScreen = document.getElementById('portal-screen');
const parallaxLayers = document.querySelectorAll('.parallax-layer');

window.addEventListener('mousemove', (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 25;
  const y = (window.innerHeight / 2 - e.clientY) / 25;

  parallaxLayers.forEach((layer) => {
    const depth = parseFloat(layer.getAttribute('data-depth') || 0.1);
    gsap.to(layer, {
      x: x * depth * 12,
      y: y * depth * 12,
      rotationY: -x * depth * 2,
      rotationX: y * depth * 2,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
});

document.getElementById('enter-btn').addEventListener('click', () => {
  playTone(440, 'sine', 0.15);
  setTimeout(() => playTone(660, 'triangle', 0.25), 120);

  const tl = gsap.timeline();
  tl.to('.portal-console', {
    scale: 3.2,
    opacity: 0,
    filter: 'blur(12px)',
    duration: 0.85,
    ease: 'power3.in'
  })
  .to(portalScreen, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      portalScreen.style.display = 'none';
      document.getElementById('hud-overlay').classList.remove('hud-hidden');
    }
  }, '-=0.2')
  .from('.active-zone', {
    scale: 0.7,
    rotationX: 18,
    opacity: 0,
    duration: 0.7,
    ease: 'back.out(1.5)'
  }, '-=0.1');
});

// --- 3. HUD TELEPORT DOCK (3D CAMERA ZONE SWITCHING) ---
const dockBtns = document.querySelectorAll('.dock-btn');
const zones = document.querySelectorAll('.world-zone');

dockBtns.forEach((btn) => {
  btn.addEventListener('mouseenter', () => playTone(740, 'sine', 0.06));

  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const currentZone = document.querySelector('.world-zone.active-zone');
    const nextZone = document.getElementById(targetId);

    if (currentZone === nextZone) return;
    playTone(580, 'triangle', 0.16);

    dockBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    gsap.to(currentZone, {
      scale: 0.82,
      rotationY: -15,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        currentZone.classList.remove('active-zone');
        nextZone.classList.add('active-zone');

        gsap.fromTo(
          nextZone,
          { scale: 1.15, rotationY: 15, opacity: 0 },
          { scale: 1, rotationY: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }
        );
      }
    });
  });
});

// --- 4. SPARKLE & SAKURA PARTICLE CURSOR ---
const canvas = document.getElementById('sparkle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const colors = ['#ff7eb3', '#ffe066', '#7bf1a8', '#d8b4f8', '#ffffff'];

window.addEventListener('mousemove', (e) => {
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5 - 0.5,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2
    });
  }
});

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04; // Subtle gravity
    p.alpha -= 0.022;
    p.rotation += 0.08;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    // Draw 4-point sparkle star
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      ctx.lineTo(Math.cos((j * Math.PI) / 2) * p.size, Math.sin((j * Math.PI) / 2) * p.size);
      ctx.lineTo(
        Math.cos(((j + 0.5) * Math.PI) / 2) * (p.size * 0.4),
        Math.sin(((j + 0.5) * Math.PI) / 2) * (p.size * 0.4)
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();
