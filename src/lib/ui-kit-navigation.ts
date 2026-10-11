export const UI_KIT_NAVIGATION_EVENT = "coa:ui-kit-navigation";

export function readUiKitLocation() {
  const match = /^#ui-kit(?:\/([^/]+))?$/.exec(window.location.hash);
  return { active: Boolean(match), component: match?.[1] ?? null };
}

export function uiKitUrl(component?: string) {
  const url = new URL(window.location.href);
  url.hash = component ? `ui-kit/${component}` : "ui-kit";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function navigateUiKit(component?: string, replace = false) {
  const url = uiKitUrl(component);
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === url) return;
  const state = { ...window.history.state, coaUiKitParent: component ? uiKitUrl() : null };
  if (replace) window.history.replaceState(state, "", url);
  else window.history.pushState(state, "", url);
  window.dispatchEvent(new Event(UI_KIT_NAVIGATION_EVENT));
}

export function leaveUiKit() {
  if (!readUiKitLocation().active) return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.pushState({ ...window.history.state, coaUiKitParent: null }, "", `${url.pathname}${url.search}`);
}
