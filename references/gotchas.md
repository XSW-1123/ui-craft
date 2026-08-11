# Gotchas

Failures that are hard to name when hit. Organized by the symptom actually observed.

---

## Layout

**"Everything looks flat / nothing groups."**
Uniform spacing. Fix by proximity encoding: 4-8px inside a group, 24-48px between groups, 64px+
between sections.

**Flex child overflows its container / text refuses to truncate.**
Flex items default to `min-width: auto`. Set `min-width: 0` (or `min-height: 0` in a column) on the
child. This single line fixes the majority of "my ellipsis does not work" reports.

**Grid blowout from long unbroken strings.**
`grid-template-columns: 1fr` means `minmax(auto, 1fr)`, and `auto` respects content. Use
`minmax(0, 1fr)`. Add `overflow-wrap: anywhere` for user-generated content.

**`100vh` is taller than the visible area on mobile.**
Browser chrome. Use `100dvh` (and `svh`/`lvh` where the distinction matters).

**Sticky element does not stick.**
An ancestor has `overflow: hidden|auto|scroll`, or the sticky element has no positioned boundary,
or its parent has no height. Also: `position: sticky` inside a `display: contents` parent fails.

**Anchor links land under the sticky header.**
`scroll-margin-top: <header height>` on the targets, or `scroll-padding-top` on the scroll
container.

**Margins collapse unexpectedly.**
Adjacent vertical margins merge; a parent's margin escapes when there is no border/padding/BFC.
Prefer `gap` in flex/grid, or a single-direction margin convention.

**Absolutely positioned element escapes its intended box.**
No positioned ancestor. Add `position: relative` to the intended container. Note that `transform`,
`filter`, `perspective`, `contain`, and `will-change` also create containing blocks for `fixed`
descendants — a `position: fixed` modal inside a transformed parent will be trapped.

**Nested scroll areas fight each other.**
`overscroll-behavior: contain` on the inner scroller.

**Content jumps when a scrollbar appears.**
`scrollbar-gutter: stable` on the scroll container.

---

## Typography

**Text looks slightly misaligned even though the numbers are correct.**
Optical vs mathematical alignment. Glyph side bearings, punctuation, and icon bounding boxes need
1-2px nudges. Trust the eye over the inspector.

**Baselines do not line up across two columns.**
Different font sizes with different line-heights. Align on a shared rhythm unit, or align the boxes
rather than the baselines and accept it.

**Headings look detached from their sections.**
Space above a heading should be roughly 2x the space below it. Equal spacing makes headings float
between sections.

**Font swaps cause a visible jump.**
Missing `font-display: swap` plus unmatched fallback metrics. Use `size-adjust`,
`ascent-override`, and `descent-override` on an `@font-face` fallback declaration.

**Numbers jitter while updating.**
Proportional figures. `font-variant-numeric: tabular-nums`.

**All-caps text is hard to read.**
Needs positive letter-spacing (+0.04 to +0.08em) and should stay short. Never all-caps a sentence.

**Large display text looks loose.**
Letter-spacing must go negative as size grows: -0.01em at 32px, -0.02em to -0.03em at 64px+.

**CJK text looks cramped or oddly spaced.**
Latin line-height values are too tight for CJK — use 1.7-1.8 for body. Do not apply
`letter-spacing` intended for Latin. Set a proper CJK font stack; the browser default fallback is
often a poor face. `text-wrap: balance` behaves differently without spaces — verify.

---

## Color and theming

**Dark mode looks muddy.**
Pure `#000` background plus pure `#fff` text plus unchanged shadows. Use `#0a0a0b`-ish and
`#e8e8ea`-ish, and express elevation with surface lightness and hairline borders instead of
shadows.

**Brand color fails contrast on a button.**
Do not lower the contrast requirement. Either darken the brand color for that use, or invert
(brand as text on a neutral background), or add a dark border/backing. Keep the original brand
value as a decorative token.

**Shadows look dirty.**
Pure black at high opacity over a non-neutral background. Tint the shadow toward the background
hue and keep opacity ≤ 12%.

**Mechanically darkened brand color looks wrong.**
Lightness-only math ignores hue shift and chroma falloff. Use OKLCH and bend the hue slightly as
lightness drops.

**Semi-transparent overlay reads differently across pages.**
It composites with whatever is behind it. For anything carrying text, use a solid token or add a
solid backing plate.

**`color-scheme` not set.**
Native form controls, scrollbars, and the caret stay light in dark mode. Set
`color-scheme: dark` on the root.

---

## Interaction

**Focus ring invisible on some surfaces.**
Single-color ring. Use two tones: `outline: 2px solid var(--accent); outline-offset: 2px;` plus a
contrasting `box-shadow: 0 0 0 4px var(--bg)`.

**Clicking a label toggles the wrong control.**
Duplicate `id`s, or `for` pointing at a missing id. Also happens with nested interactive elements —
a `<button>` inside an `<a>` is invalid.

**Modal scrolls the page behind it.**
Lock body scroll while open (and compensate for scrollbar width to prevent a jump), trap focus,
close on `Esc`, restore focus to the trigger.

**Dropdown clipped by a parent.**
`overflow: hidden` on an ancestor. Portal it to `body`, or use the Popover API / `<dialog>`, or
CSS anchor positioning where supported.

**Hover state stays stuck on touch devices.**
Touch fires a synthetic hover. Guard with `@media (hover: hover)`.

**Buttons feel unresponsive.**
No feedback within 100ms. Add an `:active` transform or background change; do not wait for the
network.

**Double submits.**
Disable on submit *and* guard server-side. Never rely on the UI alone.

**Drag conflicts with scroll on mobile.**
Set `touch-action` explicitly (`pan-y` for a horizontal drag surface).

**Autofill styling breaks the design.**
`:-webkit-autofill` needs `box-shadow: inset 0 0 0 1000px var(--bg)` plus
`-webkit-text-fill-color`; `background-color` alone will not override it.

---

## Motion

**Animation stutters.**
Animating layout or paint properties. Only `transform` and `opacity`. Check DevTools Performance
for purple (layout) and green (paint) bars.

**Height transition does not animate.**
`height: auto` is not interpolable. Use `grid-template-rows: 0fr -> 1fr` with an
`overflow: hidden` child, or animate a measured pixel height, or `max-height` with a known bound.

**Entrance feels laggy.**
`ease-in` on an entrance. Use `ease-out`.

**Exit feels slow.**
Exit at the same duration as enter. Make it 20-40% faster.

**Scroll animations re-trigger and nauseate.**
Unobserve after the first fire.

**Everything animates at once and reads as chaos.**
Add a 20-50ms stagger, cap the total at ~300ms, and only animate the first ~6 items of a list.

---

## Responsive and i18n

**Layout breaks in German or Chinese.**
Fixed widths sized to English. Test every label at 2x length and at half length. Avoid
`text-overflow: ellipsis` as a layout strategy.

**RTL layout is mirrored wrong.**
Physical properties. Use logical properties: `margin-inline-start`, `padding-block`,
`inset-inline-end`, `text-align: start`.

**Mobile Safari zooms when an input is focused.**
Input font-size below 16px. Never go below 16px on form controls.

**Breakpoints do not match the content.**
Breakpoints chosen from device names rather than from where the layout actually breaks. Resize
continuously and add a breakpoint where it fails. Prefer container queries for components.

**Table unusable on mobile.**
Do not shrink it. Switch to a card list, or make it horizontally scrollable with a sticky first
column and a visible scroll affordance.

---

## Framework-specific

**Tailwind: arbitrary values everywhere (`p-[13px]`).**
The system has been abandoned. Extend the theme config instead; arbitrary values should be rare
enough to notice in review.

**Tailwind: conditional classes silently dropped.**
Class names must appear as complete literal strings for the scanner. `text-${color}-500` will not
be generated. Use a full-class lookup map.

**React: layout thrash from reading in render.**
Reading `getBoundingClientRect` during render forces sync layout. Use
`useLayoutEffect`/`ResizeObserver`, and batch reads before writes.

**React: animation lost on unmount.**
The element is gone before it can animate out. Use a presence wrapper (`AnimatePresence` or
equivalent) that defers removal.

**Next.js: hydration mismatch on theme.**
Server renders light, client prefers dark. Inject a blocking inline script that sets the theme
attribute before paint, or accept a `suppressHydrationWarning` on `<html>`.

**Next.js: CLS on the LCP image.**
Missing `sizes`/`priority`. Set `priority` and `fetchpriority="high"` on the hero image and give it
explicit dimensions.

**CSS-in-JS: styles flash then correct.**
Missing SSR style extraction.

**Shadow DOM / web components: global tokens do not apply.**
CSS custom properties do inherit through shadow boundaries — but classes and element selectors do
not. Expose a documented custom-property API on the component.

---

## Process

**"I fixed it" but nothing changed visually.**
A more specific selector wins, or the file is not imported, or the build cache is stale, or an
inline style overrides. Check computed styles, not the source.

**Endless polishing.**
No stopping rule. Two passes, then report. Additional passes have negative expected value: they
regress working code as often as they improve it.

**The user rejects the whole direction after 90% of the work.**
The Design Read was skipped. A 30-second confirmation before coding prevents the entire rewrite.

**Aesthetic changes silently break behavior.**
Restructuring the DOM during a visual pass. Prefer CSS-only changes; when the DOM must change,
isolate it in its own step.
