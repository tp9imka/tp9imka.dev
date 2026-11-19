const CLIMB_STEPS = 90;
const DROP_STEPS = 30;
const HOLD_STEPS = 40;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? 0 : ms));
const fmt = (gb: number) => (gb >= 1 ? `${gb.toFixed(1)}GB` : `${Math.round(gb * 1000)}MB`);

export function initLeak(root: HTMLElement): void {
  const cv = root.querySelector('canvas') as HTMLCanvasElement;
  const x = cv.getContext('2d');
  const num = root.querySelector('[data-num]') as HTMLElement, lat = root.querySelector('[data-lat]') as HTMLElement, bat = root.querySelector('[data-bat]') as HTMLElement;
  const lede = root.querySelector('[data-lede]') as HTMLElement, replay = root.querySelector('[data-replay]') as HTMLButtonElement, weak = root.querySelector('[data-weak]') as HTMLElement;
  const falls = Array.from(root.querySelectorAll<HTMLElement>('[data-f]'));
  let pts: number[] = [];
  const css = (v: string) => getComputedStyle(root).getPropertyValue(v).trim();

  function draw(color: string): void {
    if (!x) return;
    const W = cv.width, H = cv.height;
    x.clearRect(0, 0, W, H); x.strokeStyle = color; x.lineWidth = 4; x.beginPath();
    pts.forEach((v, i) => { const px = i / (CLIMB_STEPS + DROP_STEPS + HOLD_STEPS) * W, py = H - 20 - v / 3.2 * (H - 40); if (i) x.lineTo(px, py); else x.moveTo(px, py); });
    x.stroke();
  }
  async function play(): Promise<void> {
    replay.hidden = true; pts = []; num.classList.remove('fixed'); weak.classList.remove('snap'); falls.forEach((e) => e.classList.remove('fall'));
    lede.textContent = 'One listener that was never removed held 3.0 GB.'; lat.textContent = '10s'; bat.textContent = '104mA';
    for (let i = 0; i < CLIMB_STEPS; i++) { const v = 0.3 + 2.7 * (i / (CLIMB_STEPS - 1)) + Math.sin(i * 0.6) * 0.06; pts.push(v); num.textContent = fmt(v); draw(css('--red')); await sleep(45); }
    await sleep(400);
    weak.classList.add('snap'); lede.textContent = 'The fix: dispose the listener. The chain breaks, the screen is collected.';
    await sleep(300); falls.forEach((e, k) => setTimeout(() => e.classList.add('fall'), k * 90));
    num.classList.add('fixed');
    for (let j = 0; j <= DROP_STEPS; j++) {
      const k = j / DROP_STEPS, w = 3.0 - 2.8 * (1 - Math.pow(1 - k, 3)); pts.push(w); num.textContent = fmt(w);
      lat.textContent = k < 1 ? `${(10 - 9.8 * k).toFixed(1)}s` : '200ms'; bat.textContent = `${Math.round(104 - 86 * k)}mA`; draw(css('--green')); await sleep(40);
    }
    for (let h = 0; h < HOLD_STEPS; h++) { pts.push(0.2 + Math.sin(h) * 0.01); draw(css('--green')); await sleep(40); }
    replay.hidden = false;
  }
  replay.addEventListener('click', () => void play());
  if (reduce) { num.textContent = '200MB'; num.classList.add('fixed'); lat.textContent = '200ms'; bat.textContent = '18mA'; return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); void play(); } }, { threshold: 0.4 });
  io.observe(root);
}
