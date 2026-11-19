const POINTER = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M1 1 L1 19 L6 14.5 L9.5 22 L12.5 20.8 L9 13.5 L16 13.5 Z" fill="var(--c-fill)" stroke="var(--bg)" stroke-width="1.5" stroke-linejoin="round"/></svg>';

export class Cursor {
  readonly el: HTMLDivElement;
  private lbl: HTMLSpanElement;

  constructor(private stage: HTMLElement, private name: string, colorVar: string, labelInk = 'var(--bg)') {
    this.el = document.createElement('div');
    this.el.className = 'cur';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.style.setProperty('--c-fill', `var(${colorVar})`);
    this.el.innerHTML = `${POINTER}<span class="cur-lbl"></span>`;
    this.lbl = this.el.querySelector('.cur-lbl') as HTMLSpanElement;
    this.lbl.style.background = `var(${colorVar})`;
    this.lbl.style.color = labelInk;
    stage.appendChild(this.el);
    this.label('');
  }

  label(text: string): void {
    this.lbl.textContent = text ? `${this.name} · ${text}` : this.name;
  }

  place(x: number, y: number): void {
    this.el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  moveTo(target: Element, text?: string, fx = 0.6, fy = 0.6): void {
    const s = this.stage.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    this.place(r.left - s.left + r.width * fx, r.top - s.top + r.height * fy);
    if (text !== undefined) this.label(text);
  }

  press(): void {
    this.el.classList.add('press');
    window.setTimeout(() => this.el.classList.remove('press'), 180);
  }
}
