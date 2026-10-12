export const LIBRARY_ITEMS = [
  ["fold-button", "스티커 필링 버튼", "Sticker Peeling Button"],
  ["slime-toggle", "슬라임 토글", "Slime Toggle"],
  ["glass-drop", "글래스 드롭 호버", "Glass Drop Hover"],
  ["image-reveal", "이미지 리빌", "Image Reveal"],
] as const;
export type LibraryItemId = typeof LIBRARY_ITEMS[number][0];

// Keep the browsing taxonomy independent from registered implementations.
export const COMPONENT_TYPES = [
  ["button", "Button"], ["icon-button", "Icon Button"],
  ["input", "Input"], ["textarea", "Textarea"], ["otp", "OTP"], ["label", "Label"],
  ["checkbox", "Checkbox"], ["radio", "Radio"], ["radio-group", "Radio Group"],
  ["switch", "Switch"], ["select", "Select"], ["segmented", "Segmented"], ["slider", "Slider"], ["range", "Range"],
  ["alert", "Alert"], ["badge", "Badge"], ["progress", "Progress"], ["skeleton", "Skeleton"], ["spinner", "Spinner"], ["toaster", "Toaster"],
  ["card", "Card"], ["chip", "Chip"], ["accordion", "Accordion"], ["collapsible", "Collapsible"], ["kbd", "Kbd"],
  ["breadcrumbs", "Breadcrumbs"], ["pagination", "Pagination"], ["tabs", "Tabs"], ["menu", "Menu"],
  ["dialog", "Dialog"], ["drawer", "Drawer"], ["popover", "Popover"], ["tooltip", "Tooltip"],
  ["divider", "Divider"], ["resizable", "Resizable"],
  ["text", "Text"],
] as const;
export type ComponentTypeId = typeof COMPONENT_TYPES[number][0];
export const LIBRARY_ITEM_TYPES: Record<LibraryItemId, ComponentTypeId> = { "fold-button": "button", "slime-toggle": "switch", "glass-drop": "text", "image-reveal": "card" };
export const COMPONENT_GROUPS = [
  { id: "all", label: "All", items: COMPONENT_TYPES.map(([id]) => id) },
  { id: "buttons", label: "Buttons", items: ["button", "icon-button"] },
  { id: "inputs", label: "Inputs", items: ["input", "textarea", "otp", "label"] },
  { id: "selection", label: "Selection", items: ["checkbox", "radio", "radio-group", "switch", "select", "segmented", "slider", "range"] },
  { id: "feedback", label: "Feedback", items: ["alert", "badge", "progress", "skeleton", "spinner", "toaster"] },
  { id: "content", label: "Content", items: ["card", "chip", "accordion", "collapsible", "kbd", "text"] },
  { id: "navigation", label: "Navigation", items: ["breadcrumbs", "pagination", "tabs", "menu"] },
  { id: "overlays", label: "Overlays", items: ["dialog", "drawer", "popover", "tooltip"] },
  { id: "layout", label: "Layout", items: ["divider", "resizable"] },
] as const satisfies readonly { id: string; label: string; items: readonly ComponentTypeId[] }[];
export type ComponentGroupId = typeof COMPONENT_GROUPS[number]["id"];
export function componentCount(types: readonly ComponentTypeId[]) {
  return LIBRARY_ITEMS.filter(([id]) => types.includes(LIBRARY_ITEM_TYPES[id])).length;
}
