export function playSlime(thumb: HTMLElement, on: boolean, animate: boolean) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduced) {
    thumb.style.animation = "none";
    return;
  }
  const raw = Number.parseFloat(getComputedStyle(thumb).getPropertyValue("--slime-ms"));
  const duration = raw >= 100 && raw <= 900 ? raw : 500;
  thumb.style.animation = "none";
  void thumb.offsetWidth;
  thumb.style.animation = (on ? "coa-slime-on" : "coa-slime-off") + " " + duration + "ms linear forwards";
  const done = () => {
    thumb.style.animation = "none";
    thumb.removeEventListener("animationend", done);
  };
  thumb.addEventListener("animationend", done);
}

export function mountSlime(button: HTMLButtonElement) {
  const thumb = button.querySelector("span");
  if (!thumb) return;
  button.addEventListener("click", () => {
    if (button.disabled) return;
    const on = button.getAttribute("aria-checked") !== "true";
    button.setAttribute("aria-checked", String(on));
    playSlime(thumb, on, true);
  });
}
