# UI Library: Jelly-compatible settings

The single component catalog contains 35 standalone components based on
the Jelly UI v1.1 showcase supplied on 2026-10-12, excluding Theme. Product blocks and components
exclusive to daisyUI are excluded from this catalog. Legacy demos remain internal.

## Sources

- https://jelly-ui.com/
- https://jelly-ui.com/docs/content/data.js

## Implementation

`src/components/preview/library/catalog.ts` defines the visible catalog.
`settings.ts` defines each component's controls, sample values and bounds.
`ConfiguredComponent` renders reusable previews from those options.
`ComponentPlayground` owns the settings and reset behavior for each component.
The catalog shows interactive preview cards. Opening a card reveals a larger
preview and component-specific settings; returning preserves its configuration.
The detail action is separate from input/toggle interactions within the preview.
Top-level filters are All, Buttons, Inputs, Selection, Feedback, Content,
Navigation, Overlays and Layout. Selecting a group reveals All plus its component
type tabs. Search intersects with both filters; changing group resets only the
type selection, and returning from a detail view preserves the selected filters.
Catalog/detail locations use `#ui-kit` and `#ui-kit/<component>` while preserving
existing query parameters. Browser back/forward and refreshing a detail URL restore
the corresponding view. The in-app back button reuses the browser history entry;
direct links without a catalog history entry replace the hash with the catalog URL.
Changing the palette keeps the component configuration. Catalog-wide Default,
Cushion and Ink concepts are removed. Existing effects are scoped to individual
components and can evolve independently without changing unrelated previews.

The 35 entries include Radio Group. Option, Segment, Tab Panel and Menu Item are
children of their parent controls and are not counted separately.

Variants use the current palette's Primary, Secondary, Accent and Neutral primitive scales:
50, 100, 200, 300, 400, 500, 600, 700, 800 and 900, defaulting to Primary 500.
Foreground colors are selected for contrast against each individual shade.
All boolean settings reuse the same medium KitSwitch as the Notifications preview,
without inheriting a catalog-wide visual concept.

Settings match the showcase, including sample values (Range 20/75, Progress 60,
Pagination 12 pages / page 3). These are not all the underlying API defaults.
Additional controls expose settings from the official API for components whose
showcase has no controls, such as Skeleton shape, Spinner type and Card squish.

Base UI handles range-slider, select, tabs, accordion, dialog, menu, popover and
tooltip semantics. Overlay portals stay within the library scope so palette and
style tokens are inherited. Resizable supports pointer capture and keyboard
separators on one or both axes. OTP supports configurable length, paste, sequential
entry and backspace.

This is a React implementation with the existing Cushion/Ink visual treatments,
not a bundle of the Jelly custom elements or its soft-body physics engine.
It does not introduce a new published npm package or code-download feature.
