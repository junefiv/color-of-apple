export function mountFold(button: HTMLButtonElement) {
  let frame = 0;
  let resetTimer = 0;
  let distance = 0;
  let hovering = false;
  let focused = false;
  let peeling = false;
  let width = 0;
  let height = 0;
  let font = 19.2;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const measure = () => {
    width = button.offsetWidth || 140;
    height = button.offsetHeight || 50;
    font = parseFloat(getComputedStyle(button).fontSize) || 19.2;
    button.style.setProperty('--fold-sheet-size', (width + height) + 'px');
  };
  const polygon = (points: number[][]) => 'polygon(' + (points.length ? points : [[0, 0], [0, 0], [0, 0]]).map(([x, y]) => x.toFixed(3) + 'px ' + y.toFixed(3) + 'px').join(',') + ')';
  const clipped = (keepFront: boolean) => {
    const corners = [[0, 0], [width, 0], [width, height], [0, height]];
    const result: number[][] = [];
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];
      const da = a[0] + a[1] - distance;
      const db = b[0] + b[1] - distance;
      const insideA = keepFront ? da >= 0 : da <= 0;
      const insideB = keepFront ? db >= 0 : db <= 0;
      if (insideA) result.push(a);
      if (insideA !== insideB) {
        const t = da / (da - db);
        result.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return result;
  };
  const draw = () => {
    button.style.setProperty('--fold-front', polygon(clipped(true)));
    button.style.setProperty('--fold-back', polygon(clipped(false).map(([x, y]) => [distance - y, distance - x])));
    button.style.setProperty('--fold-line', (distance / Math.SQRT2) + 'px');
  };
  const resting = () => hovering || focused ? font * 1.6 : 0;
  const settle = () => {
    if (peeling) return;
    cancelAnimationFrame(frame);
    const from = distance;
    const to = resting();
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduced() ? 1 : Math.min(1, (now - start) / 300);
      distance = from + (to - from) * (1 - Math.pow(1 - t, 3));
      draw();
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  const enter = () => { hovering = true; settle(); };
  const leave = () => { hovering = false; settle(); };
  const focus = () => { focused = button.matches(':focus-visible'); settle(); };
  const blur = () => { focused = false; settle(); };
  const click = () => {
    if (button.disabled || peeling || reduced()) return;
    cancelAnimationFrame(frame);
    measure();
    peeling = true;
    button.classList.add('is-peeling');
    const from = distance;
    const to = width + height;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = t * t * (3 - 2 * t);
      distance = from + (to - from) * eased;
      draw();
      const falling = Math.max(0, (t - 0.55) / 0.45);
      button.style.transform = 'translateY(' + (falling * falling * font * 3) + 'px)';
      button.style.opacity = String(1 - falling * falling);
      if (t < 1) frame = requestAnimationFrame(tick);
      else resetTimer = window.setTimeout(() => {
        // Restore the demo after the detached paper has disappeared.
        peeling = false;
        distance = resting();
        draw();
        button.classList.remove('is-peeling');
        button.style.removeProperty('transform');
        button.style.removeProperty('opacity');
      }, 450);
    };
    frame = requestAnimationFrame(tick);
  };
  measure(); draw();
  button.addEventListener('pointerenter', enter);
  button.addEventListener('pointerleave', leave);
  button.addEventListener('focus', focus);
  button.addEventListener('blur', blur);
  button.addEventListener('click', click);
  return () => {
    cancelAnimationFrame(frame); clearTimeout(resetTimer);
    button.removeEventListener('pointerenter', enter);
    button.removeEventListener('pointerleave', leave);
    button.removeEventListener('focus', focus);
    button.removeEventListener('blur', blur);
    button.removeEventListener('click', click);
    button.classList.remove('is-peeling');
    button.removeAttribute('style');
  };
}
