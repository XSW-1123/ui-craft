# Quality Floor

Every rule is testable. If a rule cannot be checked, it does not belong here.

- **MUST** — violating it is a bug. Blocks shipping. No aesthetic argument overrides it.
- **SHOULD** — violating it needs a stated reason in the report.
- **NEVER** — no valid exception found in practice.

---

## 1. Contrast and color

**MUST** body text ≥ 4.5:1 against its actual rendered background (not the token's nominal
background — check what is really behind it, including images and gradients).
**MUST** large text ≥ 3:1. Large = ≥ 24px regular, or ≥ 19px bold.
**MUST** ≥ 3:1 for any non-text element that conveys information: icons, chart series, input
borders, focus rings, toggle states, required-field markers.
**MUST** convey state by more than color alone. Error = color + icon + text. Chart series = color
+ pattern or direct label.
**MUST** re-verify contrast in dark mode independently. Inverting a light palette does not preserve
ratios.
**SHOULD** keep placeholder text ≥ 4.5:1 or stop using placeholders as labels.
**SHOULD** keep disabled controls ≥ 3:1 — "disabled" is not "invisible".
**NEVER** put text on a photograph without a scrim, an overlay, or a solid backing plate.
**NEVER** use pure `#000000` text on pure `#FFFFFF` for long-form reading; ~`#1a1a1a` on ~`#fafafa`
reduces halation.

Chinese market convention: rising = red, falling = green. Inverting this in a finance UI is a
correctness bug, not a style choice.

## 2. Focus and keyboard

**MUST** every interactive element has a visible `:focus-visible` style with ≥ 3:1 contrast against
both the component and its surroundings.
**MUST** focus order matches visual order. `tabindex` > 0 is forbidden.
**MUST** every mouse-reachable action is keyboard-reachable. Custom controls need real roles,
`aria-*` state, and arrow-key handling where the pattern expects it.
**MUST** modals, drawers and menus: trap focus while open, close on `Esc`, restore focus to the
trigger on close, mark the background `inert` or `aria-hidden`.
**MUST** provide a skip link when the header contains more than ~5 focusable elements.
**MUST** build keyboard and focus behavior on an accessible primitive (Radix, Base UI, React Aria,
or the project's existing one). Hand-rolled dialogs, menus, comboboxes and tooltips are wrong by
default — the failure modes are subtle and only surface for the users who depend on them.
**MUST NOT** mix two primitive systems inside one interaction surface; their focus and portal
models conflict.
**SHOULD** use a two-tone focus ring so it survives both light and dark surfaces:
`outline: 2px solid var(--accent); outline-offset: 2px;` plus a contrasting `box-shadow` ring.
**NEVER** `outline: none` without an equivalent replacement in the same rule.
**NEVER** open a menu on hover with no click/keyboard equivalent.
**NEVER** block paste in an `input` or `textarea`. It breaks password managers and every
assistive workflow, and it prevents nothing.

## 3. Targets and pointer

**MUST** ≥ 44x44px effective target on `(pointer: coarse)`. Padding counts; visual size need not
grow — expand the hit area with padding or a pseudo-element.
**MUST** ≥ 24x24px on desktop, with ≥ 8px separation between adjacent targets.
**MUST** visible feedback within 100ms of any press.
**SHOULD** keep destructive actions ≥ 24px away from their neighbors, or behind confirmation.
**NEVER** rely on hover to reveal a primary action.
**NEVER** disable a submit button without saying why the form is invalid.

## 4. Typography

**MUST** base body size ≥ 16px on mobile (below this, iOS Safari zooms on input focus).
**MUST** body `line-height` ≥ 1.5; headings 1.05-1.25.
**MUST** measure 45-75 characters for paragraphs. `max-width: 65ch` is the safe default.
**MUST** `font-display: swap` on every webfont, with a metrics-adjusted fallback
(`size-adjust`, `ascent-override`) to prevent shift.
**SHOULD** limit to 2 families. A weight range within one family is usually better than a second
family.
**SHOULD** use a single computed scale. Common ratios: 1.2 (dense product), 1.25 (default),
1.333 (editorial), 1.5 (poster). Round to whole pixels.
**SHOULD** apply `text-wrap: balance` to headings and `text-wrap: pretty` to body.
**SHOULD** use tabular figures (`font-variant-numeric: tabular-nums`) for any column of numbers,
timers, or values that update in place.
**SHOULD** tighten letter-spacing on large display text (-0.01em to -0.03em) and loosen it on
all-caps labels (+0.04em to +0.08em).
**NEVER** justify text on the web without hyphenation.
**NEVER** use `line-height: 1` on text that can wrap.
**NEVER** center more than ~3 lines of running text.
**NEVER** set body copy in a display or condensed face.

## 5. Layout and spacing

**MUST** derive all spacing from one scale (4px or 8px base). Arbitrary values like `13px` or
`gap: 17px` are defects.
**MUST** encode grouping by proximity: within-group 4-12px, between-group 24-48px, between-section
64-120px. Uniform spacing = no hierarchy.
**MUST** survive 200% zoom and 320px viewport width with no horizontal scroll.
**MUST** reserve space for async content (`aspect-ratio`, explicit dimensions, skeletons) so CLS
stays < 0.1.
**MUST** draw every `z-index` from a fixed, named scale. Four or five layers is enough:
`base 0 · dropdown 10 · sticky 20 · overlay 30 · modal 40 · toast 50`. An arbitrary `z-index: 9999`
is a defect that guarantees a future conflict.
**MUST** respect `env(safe-area-inset-*)` on anything fixed to a viewport edge. Without it, bottom
bars sit under the home indicator on modern phones.
**SHOULD** align to a visible or implied grid; optical alignment overrides mathematical alignment
when they disagree.
**SHOULD** prefer whitespace, then a background shift, then a border, in that order, for separation.
**SHOULD** cap content width — full-bleed body text at 1920px is unreadable.
**SHOULD** verify at 320 / 768 / 1024 / 1440px. Most breakage lives at 320 and at the first
breakpoint above the design width.
**NEVER** use fixed heights on containers holding user-generated text.
**NEVER** use `100vh` for full-screen mobile layouts; use `100dvh`.
**NEVER** nest more than 2 levels of elevated surfaces (card in card in card).

## 6. Interaction states

**MUST** implement every one of: default, hover, focus-visible, active, disabled, loading, error.
**MUST** implement every data state: loading, empty, error, partial, full, overflow.
**MUST** make empty states useful: say what goes here and give the action that fills it.
**MUST** make error states recoverable: what failed, why, what to do next. Never a bare
"Something went wrong".
**MUST** keep layout stable across states — a spinner replacing a label must not change the button
width.
**MUST** gate destructive or irreversible actions behind an `AlertDialog`-class confirmation that
names what will be lost — not a generic "Are you sure?".
**MUST** surface errors next to the action that caused them. A toast in the corner for a failed
inline edit will be missed.
**SHOULD** use optimistic UI for actions that succeed > 95% of the time, with rollback.
**SHOULD** show skeletons that match the real content's shape, not generic gray bars.
**NEVER** block the whole screen for a local operation.
**NEVER** let a destructive action be undoable only by page refresh.
**NEVER** flash content more than three times per second — it is a seizure risk, not a style.

## 7. Forms

**MUST** bind a `<label>` to every input. Placeholder is not a label.
**MUST** set correct `type`, `inputmode`, `autocomplete`, and `name`.
**MUST** show errors as text adjacent to the field, associated via `aria-describedby`, with
`aria-invalid`.
**MUST** validate on blur and on submit — not on every keystroke for format-sensitive fields.
**MUST** keep the submit button enabled; on invalid submit, focus the first error.
**SHOULD** preserve entered data across errors and navigation.
**SHOULD** size inputs to their expected content (a 4-digit year field should not be 400px wide).
**NEVER** clear a form on error.
**NEVER** use `maxlength` as the only enforcement of a format rule.

## 8. Motion

Summarized here; the full frequency table and easing guidance are in `motion.md`.

**MUST** honor `prefers-reduced-motion: reduce` — remove transforms and parallax, keep opacity
fades under 100ms or remove them.
**MUST** animate only `transform` and `opacity` for anything that runs at 60fps.
**MUST** keep functional UI transitions in 120-250ms.
**SHOULD** use `ease-out` for entrances, `ease-in` for exits, spring only for direct manipulation.
**NEVER** animate `width`, `height`, `top`, `left`, `margin`, or `box-shadow` in a loop or on
scroll.
**NEVER** animate anything the user sees more than ~20 times per session for longer than 150ms.
**NEVER** hijack scroll or block input during a decorative animation.

## 9. Images and media

**MUST** meaningful `alt`; decorative images `alt=""`.
**MUST** intrinsic `width`/`height` or `aspect-ratio` on every image.
**MUST** `loading="lazy"` below the fold, eager + `fetchpriority="high"` for the LCP image.
**SHOULD** serve modern formats with fallbacks; cap hero images at ~200KB.
**NEVER** autoplay audio. Autoplay video only muted, with a visible pause control.

## 10. Semantics and structure

**MUST** exactly one `<h1>`; heading levels never skip.
**MUST** `<button>` for actions, `<a href>` for navigation. A `div` with `onClick` is a defect.
**MUST** landmark structure: `header`, `nav`, `main`, `footer`; `main` appears once.
**MUST** set `<html lang>`; set `dir` when RTL is in scope.
**MUST** unique, descriptive `<title>` per view.
**MUST** give data tables real `<th>` cells with `scope="col"` / `scope="row"`, and a `<caption>`
or `aria-label`. A grid of `<div>`s is not a table to a screen reader.
**SHOULD** use `<dialog>`, `<details>`, `<progress>` before building custom equivalents.
**NEVER** use ARIA to patch a wrong element when the right element exists.
**NEVER** convey structure with CSS alone (visual grouping without semantic grouping).

## 11. Performance budget

**MUST** LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-tier mobile device.
**MUST** no layout thrash in scroll handlers; read then write, or use IntersectionObserver.
**SHOULD** ship < 200KB of JS (gzipped) for a content page.
**SHOULD** subset fonts; ≤ 2 files for the critical path.
**NEVER** load an icon font when SVG works.
**NEVER** ship an animation library for three transitions.

---

## Verify vs Refuse

Not every check can be done from source. Split them honestly.

**Verifiable from code** — run these, report pass/fail:
contrast ratios from token values, focus styles present, semantic elements, label bindings,
alt attributes, target sizes from CSS, spacing-scale adherence, animated properties, reduced-motion
handling, heading order, font-display.

**Not verifiable from code** — say so, and tell the user exactly what to check:
real rendered contrast over images and gradients, actual focus-order feel, screen reader
announcement quality, perceived motion comfort, font rendering across platforms, whether the
Signature move actually reads as intentional, real-device touch ergonomics.

Claiming "verified" for the second category destroys trust. The correct output is:

```
Verified:   <list, with values>
Needs eyes: <list, with the specific thing to look at and why>
```
