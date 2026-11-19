// [data-copy] buttons copy their value; if the clipboard is refused, select the text instead.
export function initCopyButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = 'Copied';
      } catch {
        const target = document.getElementById(btn.dataset.copyTarget ?? '');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
        btn.textContent = 'Selected';
      }
      window.setTimeout(() => { btn.textContent = label; }, 1600);
    });
  });
}
