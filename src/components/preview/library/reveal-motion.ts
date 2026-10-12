export function mountReveal(root: HTMLElement) {
  const fits = ["cover", "contain", "fill", "none", "scale-down"];
  const raw = root.getAttribute("data-fit") || "fill";
  const fit = fits.indexOf(raw) === -1 ? "fill" : raw;
  const paint = (x: number, y: number, w: number, h: number) => {
    root.style.setProperty("--fit-x", String(x));
    root.style.setProperty("--fit-y", String(y));
    root.style.setProperty("--fit-w", String(w));
    root.style.setProperty("--fit-h", String(h));
    root.setAttribute("data-ready", "");
  };
  if (fit === "fill") {
    paint(0, 0, 1, 1);
    return () => undefined;
  }
  const src = root.getAttribute("data-image") || "";
  let observer: ResizeObserver | null = null;
  let alive = true;
  const image = new Image();
  const apply = () => {
    if (!alive) return;
    const nw = image.naturalWidth || 1;
    const nh = image.naturalHeight || 1;
    const gw = root.clientWidth || 1;
    const gh = root.clientHeight || 1;
    const cover = Math.max(gw / nw, gh / nh);
    const contain = Math.min(gw / nw, gh / nh);
    const scale = fit === "cover" ? cover : fit === "contain" ? contain : fit === "none" ? 1 : Math.min(1, contain);
    const w = (nw * scale) / gw;
    const h = (nh * scale) / gh;
    paint((1 - w) / 2, (1 - h) / 2, w, h);
  };
  image.onload = () => {
    apply();
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(apply);
      observer.observe(root);
    }
  };
  image.onerror = () => paint(0, 0, 1, 1);
  image.src = src;
  return () => {
    alive = false;
    if (observer) observer.disconnect();
  };
}
