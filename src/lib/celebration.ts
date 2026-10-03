/**
 * Celebration Engine for Family Challenge
 * High-performance, zero-dependency canvas confetti and Web Audio chime.
 * Completely immune to iframe/worker OffscreenCanvas getBoundingClientRect errors.
 */

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

let activeCanvas: HTMLCanvasElement | null = null;
let animationFrameId: number | null = null;
let particles: ConfettiParticle[] = [];

const LUXURY_PALETTE = [
  '#0284c7', // Sky Blue
  '#38bdf8', // Light Sky
  '#0ea5e9', // Vivid Blue
  '#f59e0b', // Amber Gold
  '#fbbf24', // Warm Gold
  '#10b981', // Emerald
  '#ffffff', // Sparkle White
];

function getOrCreateCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;

  if (!activeCanvas || !document.body.contains(activeCanvas)) {
    activeCanvas = document.createElement('canvas');
    activeCanvas.id = 'family-celebration-canvas';
    activeCanvas.style.position = 'fixed';
    activeCanvas.style.top = '0px';
    activeCanvas.style.left = '0px';
    activeCanvas.style.width = '100vw';
    activeCanvas.style.height = '100vh';
    activeCanvas.style.pointerEvents = 'none';
    activeCanvas.style.zIndex = '999999';
    activeCanvas.width = window.innerWidth;
    activeCanvas.height = window.innerHeight;
    document.body.appendChild(activeCanvas);
  } else {
    activeCanvas.width = window.innerWidth;
    activeCanvas.height = window.innerHeight;
  }

  return activeCanvas;
}

function spawnParticles(count: number, originX: number, originY: number) {
  const canvas = getOrCreateCanvas();
  if (!canvas) return;

  const w = canvas.width;
  const h = canvas.height;
  const startX = w * originX;
  const startY = h * originY;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI) - Math.PI; // upwards spread
    const speed = Math.random() * 14 + 8;
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];

    particles.push({
      x: startX + (Math.random() * 40 - 20),
      y: startY + (Math.random() * 20 - 10),
      vx: Math.cos(angle) * speed + (Math.random() * 6 - 3),
      vy: Math.sin(angle) * speed - 4,
      size: Math.random() * 8 + 6,
      color: LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() * 12 - 6),
      opacity: 1,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  if (!animationFrameId) {
    runAnimationLoop();
  }
}

function runAnimationLoop() {
  const canvas = getOrCreateCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function frame() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.99; // air resistance
      p.rotation += p.vRotation;
      p.opacity -= 0.007; // gentle fade

      // Render
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          ctx.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size);
          ctx.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      }

      ctx.restore();

      // Remove dead particles
      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameId = null;
      if (activeCanvas && activeCanvas.parentNode) {
        activeCanvas.parentNode.removeChild(activeCanvas);
        activeCanvas = null;
      }
    }
  }

  animationFrameId = requestAnimationFrame(frame);
}

export function triggerCelebration(_points?: number) {
  // 1. Confetti burst from center and sides
  try {
    spawnParticles(80, 0.5, 0.6);

    setTimeout(() => {
      spawnParticles(40, 0.15, 0.7);
      spawnParticles(40, 0.85, 0.7);
    }, 250);
  } catch (err) {
    console.debug('Confetti burst skipped:', err);
  }

  // 2. Play soft, elegant synthesizer chime using Web Audio
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.45);
      });
    }
  } catch (e) {
    // audio context muted or unallowed before user gesture
    console.debug('Audio chime skipped:', e);
  }
}
