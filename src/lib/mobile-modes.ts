// One vocabulary for how a section changes on a phone, so every component's settings read the same.
// Stored option values stay per component (older layouts keep loading); only the wording is shared.
export const MOBILE_LABEL = "모바일에서";
export const mobileMode = {
  stack: "1열로 쌓기",
  two: "2열로 줄이기",
  swipe: "옆으로 밀어 넘기기",
  accordion: "접었다 펼치기",
  cards: "줄마다 카드로",
  sheet: "아래에서 올라오는 시트",
  keep: "PC와 같게",
} as const;
