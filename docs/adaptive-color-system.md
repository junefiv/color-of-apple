# Adaptive color system (engine 2.1)

The production entry points are `generatePalette` and `generateColorSystem`. The home previews, seven-strategy picker, result previews, token panel, and exports use this engine. Existing saved palette IDs resolve to one of the seven new strategies; they do not invoke the old preset recipes.

## Brand generation

1. Preserve the opaque input color and convert it to OKLCH.
2. Classify brightness (dark < .40, light > .72), chroma (muted < .08, vivid > .18), temperature, and eight hue zones.
3. Normalize strength as `clamp(C * lightnessWeight(L) / .28, 0, 1)`. The weight is .75 below .35, 1 through .70, and .80 above .70.
4. Generate 30 deterministic Secondary candidates. Hue-zone factors and strategy-specific chroma/lightness rules control the candidates. The baseline Secondary ratio is `.90 - .45 * strength`.
5. Score each candidate: harmony .30, role separation .25, chroma balance .20, lightness balance .15, retained gamut chroma .10. Harmony and balance terms use Gaussian distances.
6. Add chroma-weighted Accent headroom to the Secondary pre-score, then retain the top eight candidates without confirming a Secondary.
7. For each retained Secondary, search the entire hue circle at 6° intervals with three lightness and three chroma variants: 540 Accent candidates per Secondary, 4,320 pairs in total. Chroma-weighted circular means handle the 0°/360° seam and reduce the hue influence of almost-neutral colors. Provisional character comes from Primary and the candidate Secondary, avoiding circular dependence.
8. Score Accent strategy fit, occupied-hue separation, role contrast, chroma fit, lightness fit, brand fit, and retained gamut chroma. Near targets the opposite cluster; Soft favors gentle contrast; Tonal favors an 80–150° departure; Analog favors empty space; Split avoids the Secondary on adaptive split axes; Triadic uses the unoccupied axis; Neutralized favors clear contrast and usable chroma. All scores use gamut-fitted, quantized HEX colors.
9. Evaluate every pair with `SecondaryPreScore * .35 + AccentScore * .35 + ThreeColorBalance * .30`. Balance considers hue distribution, visual hierarchy, chroma hierarchy, lightness distribution, and role distinctness. Confirm Secondary and Accent together from the highest-scoring pair, without an iterative feedback loop.
10. Derive final Brand Character from Primary/Secondary/Accent with .50/.20/.30 weights. All downstream scales, semantic roles, actions and statuses use the final pair.

The strategies are Near Harmony, Soft Harmony, Tonal, Analog, Split Contrast, Triadic, and Neutralized. Candidate diagnostics, Accent score components, shortlisted pair winners, the selected pair, search counts, input analysis, and character are available in `tokens.system` and JSON exports. Generation uses no randomness.

## Primitives and semantic roles

Brand scales and Neutral use 50–950 with OKLCH lightness targets `.98, .95, .90, .84, .74, .64, .52, .42, .32, .23, .16`. The nearest lightness step preserves the exact brand base; it is not forced to 500. Chroma diminishes at the ends. Gamut fitting performs a bounded chroma search while preserving L/H.

Neutral receives a low chroma warm/cool bias from the complete brand, with white/black endpoints for compatibility. Semantic foundations use Neutral, then test actual quantized HEX contrast across canvas, subtle, default, raised and overlay surfaces. Corrections retain the original hue where possible. Disabled roles use almost achromatic colors.

Actions expose Default, Hover, Pressed, Selected, Focus and Disabled, including separate foregrounds for Hover and Pressed. Ordinary bases darken; bases below .35 lightness brighten. Brand contrast determines the state shift. Selected foregrounds are checked against their own selected background. Focus rings are checked against UI surfaces.

## Status

Status hue candidates stay within semantic boundaries: Success 138–155°, Warning 75–95°, Danger 20–30°, Info 230–260°. Brand harmony cannot move a status outside these ranges. Character modifies their chroma and lightness. Each status exposes Surface, Surface Strong, Border, Default, Text, Icon, Hover, Pressed, Disabled, and state foregrounds. Status Text is checked against both status surfaces.

## Integration and verification

`tokens.system` contains primitive scales, base anchors, actions, statuses, character, analysis and diagnostics. Flat palette fields remain compatibility aliases for previews. Semantic exports additionally contain `action`, `status`, `selected`, `focus`, and `disabled` roles. The token panel exposes these states alongside the original foundation tokens.

Regression tests cover classification, chroma adaptation, candidate selection, Secondary-dependent Accent placement, monotonic anchored scales, sRGB fitting, status hue boundaries, readable text/state/focus pairs in both modes, and component/CSS export wiring. Color-only checks do not establish complete WCAG compliance for a finished interface.
