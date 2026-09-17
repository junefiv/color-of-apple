import type { Locale } from "@/lib/copy";
import type { SpacePaletteId } from "@/lib/space-palettes";

const names: Record<SpacePaletteId, string> = {
  "generic-gradient": "Polar Ramp",
  "matching-gradient": "Companion Drift",
  spot: "Paper Marks",
  "twisted-spot": "Offset Trio",
  classy: "Ink & Wine",
  cube: "High Low",
  switch: "Lilac Flip",
  "small-switch": "Ice Pair",
  "skip-gradient": "Complement Steps",
  natural: "Clay Paper",
  matching: "Sage Pair",
  squash: "Warm Cool Split",
  "grey-friends": "Charcoal Pearl",
  dotting: "Coral Speck",
  "skip-shade": "Cyan Wash",
  threedom: "True Triad",
  highlight: "Flash Ink",
  neighbor: "Near Hues",
  discreet: "Quiet Range",
  dust: "Ochre Dust",
  collective: "Split Pulse",
  friend: "Soft Grove",
  pin: "Gold Pin",
  shades: "Rising Tints",
  "random-shades": "Seed Scatter",
};

export function paletteName(id: SpacePaletteId, _locale?: Locale) {
  return names[id];
}
