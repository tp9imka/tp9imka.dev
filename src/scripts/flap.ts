// One-time split-flap reveal of the Wall of no. Rows are server-rendered; this only animates them.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-=>';
const FLIP_STEPS = 7;
const STEP_MS = 45;
const ROW_STAGGER_MS = 110;

function flip(el: HTMLElement, delay: number): void {
  const final = el.dataset.text ?? el.textContent ?? '';
  window.setTimeout(() => {
    let step = 0;
    const tick = () => {
      step++;
      el.textContent = step >= FLIP_STEPS
        ? final
        : final.replace(/[A-Z0-9]/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
      if (step < FLIP_STEPS) window.setTimeout(tick, STEP_MS);
    };
    tick();
  }, delay);
}

export function initWall(): void {
  const wall = document.getElementById('wall');
  if (!wall || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    wall.querySelectorAll<HTMLElement>('[data-flap]').forEach((cell, i) => {
      const row = Number(cell.dataset.row ?? 0);
      flip(cell, row * ROW_STAGGER_MS + (i % 3) * 30);
    });
  }, { threshold: 0.25 });
  io.observe(wall);
}
