export function mountGlass(root: HTMLElement) {
  const drop = root.querySelector<HTMLElement>("[data-drop]");
  const lens = root.querySelector<HTMLElement>("[data-lens]");
  if (!drop || !lens) return;
  let frame = 0;
  let running = false;
  let hot = false;
  let absorbing = false;
  let presence = 0;
  let heading = 0;
  let absorbFromX = 0;
  let absorbFromY = 0;
  let absorbStart = 0;
  const pointer = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const read = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  };
  const blob = (stretch: number, vx: number, vy: number) => {
    const time = reduced() ? 0 : performance.now() / 1000;
    const wave = stretch * Math.sin(time * 8);
    const wave2 = stretch * Math.cos(time * 5.4);
    const clamp = (value: number) => Math.max(30, Math.min(72, value));
    const edge = (xWeight: number, yWeight: number, wobble: number) => clamp(50 + vx * xWeight + vy * yWeight + wobble).toFixed(2);
    return edge(-16, -12, wave * 9) + "% " + edge(18, -10, wave2 * -8) + "% " + edge(12, 16, wave * 7) + "% " + edge(-14, 14, wave2 * -9) + "% / " + edge(6, 12, wave2 * 6) + "% " + edge(-8, 4, wave * 5) + "% " + edge(8, -6, wave2 * -5) + "% " + edge(-4, -12, wave * 4) + "%";
  };
  const finishAbsorb = () => {
    absorbing = false;
    presence = 0;
    root.classList.remove("is-absorbing");
    drop.style.opacity = "0";
    if (root.matches(":hover")) {
      hot = true;
      root.classList.add("is-hot");
      current.x = pointer.x;
      current.y = pointer.y;
    } else {
      hot = false;
      root.classList.remove("is-hot");
    }
  };
  const render = () => {
    const box = root.getBoundingClientRect();
    let absorb = 0;
    if (absorbing) {
      absorb = Math.min(1, (performance.now() - absorbStart) / (reduced() ? 1 : 520));
      if (absorb >= 1) {
        finishAbsorb();
        return;
      }
      current.x = absorbFromX;
      current.y = absorbFromY;
    } else {
      const dx = pointer.x - current.x;
      const dy = pointer.y - current.y;
      const dist = Math.hypot(dx, dy);
      current.x += dx * (reduced() ? 1 : 0.2);
      current.y += dy * (reduced() ? 1 : 0.2);
      if (dist > 0.8) heading = Math.atan2(dy, dx);
    }
    const dx = pointer.x - current.x;
    const dy = pointer.y - current.y;
    const dist = Math.hypot(dx, dy);
    const stretch = absorbing || reduced() ? 0 : Math.min(dist / 34, 1);
    if (!absorbing) {
      const aim = hot ? 1 : 0;
      presence += (aim - presence) * (reduced() ? 1 : 0.16);
      if (Math.abs(aim - presence) < 0.004) presence = aim;
    } else presence = absorb > 0.72 ? 1 - (absorb - 0.72) / 0.28 : 1;
    const shown = 0.7 + Math.max(0, presence) * 0.3;
    const size = drop.offsetWidth || 120;
    const ease = absorb * absorb * (3 - 2 * absorb);
    const shrink = 1 - ease;
    const sx = absorbing ? shrink : (1 + stretch * 0.46) * shown;
    const sy = absorbing ? shrink : (1 - stretch * 0.16) * shown;
    const lead = absorbing ? 0 : dist * 0.22;
    const spin = absorbing ? 0 : heading;
    drop.style.opacity = String(Math.max(0, presence));
    drop.style.borderRadius = absorbing || stretch < 0.04 ? "50%" : blob(stretch, dx / (dist || 1), dy / (dist || 1));
    drop.style.transform = "translate3d(" + (current.x - size / 2).toFixed(2) + "px, " + (current.y - size / 2).toFixed(2) + "px, 0) rotate(" + spin.toFixed(3) + "rad) scale(" + sx.toFixed(3) + ", " + sy.toFixed(3) + ") rotate(" + (-spin).toFixed(3) + "rad)";
    lens.style.width = box.width + "px";
    lens.style.height = box.height + "px";
    lens.style.transformOrigin = current.x.toFixed(2) + "px " + current.y.toFixed(2) + "px";
    lens.style.transform = "translate(" + (size / 2 - current.x + lead * Math.cos(heading)).toFixed(2) + "px, " + (size / 2 - current.y + lead * Math.sin(heading)).toFixed(2) + "px) scale(1.16)";
  };
  const loop = () => {
    if (!root.isConnected) {
      running = false;
      return;
    }
    render();
    if (hot || absorbing || presence > 0.01) frame = requestAnimationFrame(loop);
    else running = false;
  };
  const start = () => {
    render();
    if (running) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };
  const beginAbsorb = () => {
    if (absorbing || root.matches(":disabled")) return;
    if (!hot) {
      hot = true;
      root.classList.add("is-hot");
    }
    absorbing = true;
    absorbFromX = current.x;
    absorbFromY = current.y;
    absorbStart = performance.now();
    root.classList.add("is-absorbing");
    start();
  };
  const enter = (event: PointerEvent) => {
    read(event);
    if (!hot) {
      current.x = pointer.x;
      current.y = pointer.y;
    }
    hot = true;
    root.classList.add("is-hot");
    if (!absorbing) start();
  };
  const move = (event: PointerEvent) => {
    read(event);
    if (hot && !absorbing) start();
  };
  const leave = () => {
    root.classList.remove("is-pressed");
    if (absorbing) return;
    hot = false;
    root.classList.remove("is-hot");
    start();
  };
  const down = (event: PointerEvent) => {
    read(event);
    current.x = pointer.x;
    current.y = pointer.y;
    root.classList.add("is-pressed");
    beginAbsorb();
  };
  const up = () => root.classList.remove("is-pressed");
  root.addEventListener("pointerenter", enter);
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerleave", leave);
  root.addEventListener("pointercancel", leave);
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointerup", up);
  root.addEventListener("click", beginAbsorb);
  return () => {
    cancelAnimationFrame(frame);
    running = false;
    root.removeEventListener("pointerenter", enter);
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", leave);
    root.removeEventListener("pointercancel", leave);
    root.removeEventListener("pointerdown", down);
    root.removeEventListener("pointerup", up);
    root.removeEventListener("click", beginAbsorb);
    root.classList.remove("is-hot", "is-pressed", "is-absorbing");
  };
}
