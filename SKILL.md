---
name: ui-craft
description: This skill should be used when creating, improving, or reviewing any web interface (page, component, landing page, dashboard, or design system), and when the user asks to "make it look better", "beautify the UI", "polish", "redesign", "review this UI", "fix the spacing", "fix contrast/keyboard/a11y", "the animation feels janky", "it looks AI-generated", or says 界面美化 / UI 优化 / 做个页面 / 太丑了 / 有 AI 味 / 帮我改好看点 / 审查界面. It builds and reviews with a locked visual direction, a quantified quality floor, and an evidence-backed review that stops invented findings, and it treats the default LLM aesthetic as a hard failure mode — the bundled audit computes a Slop Index and the score refuses to pass a generated-looking interface even when the floor is clean. Covers visual direction locking, design tokens, typography, color, layout, motion performance, accessibility floor, and anti-AI-slop calibration.
license: MIT
agent_created: true
metadata:
  version: 2.2.0
  synthesized_from: 2343 SKILL.md files across 33 repositories, 141 high-signal UI skills read in full; plus a quantified study of 950 SaaS landing pages (saaslandingpage.com) and 60+ Persuade/Experience cases (reeoo.com)
---

# UI Craft

Interfaces fail in four ways: **no direction** (every element negotiated ad hoc), **no floor**
(contrast, focus, touch targets silently broken), **no taste** (the default LLM aesthetic), and
**no evidence** (confident review of problems that are not real). This skill closes all four.

## Non-negotiables

Read before writing a single line of CSS.

1. **Lock direction before code.** Emit the Design Read (Step 1). Never begin styling while the
   direction is still implicit.
2. **Tokens before pixels.** Every color, space, radius, duration is a token reference. A raw hex
   or a raw `px` outside `tokens.css` is a defect, not a shortcut.
3. **The floor is not negotiable.** Contrast 4.5:1, visible focus, 44px touch targets, honored
   `prefers-reduced-motion`. Failing these is a bug regardless of how the result looks.
4. **Verification is bounded.** Two passes, then stop and report. Never loop indefinitely
   "polishing".
5. **Default aesthetics are a failure mode, gated.** The bundled audit computes a **Slop Index**
   from default-look markers — gradient text, framework-default palettes, emoji-as-icon, three
   equal columns, invented stats, marketing filler, the three attractor clusters, and uniform
   spacing. A Slop Index of 10 or more means the interface was generated, not designed, and must
   not ship until de-slopped — even when the floor is flawless. `scripts/score.mjs` caps the score
   and overrides the band in that case. See `references/anti-slop.md` for the negative gate and
   `references/award-craft.md` for the positive language — learn the language, never the meme.
6. **Every claim carries evidence.** When reviewing existing code, a finding without a cited rule,
   a traced path, and one determined correction is not a finding. Prefer no finding to an
   unsupported one. See `references/evidence.md`.
7. **Never claim what cannot be seen.** Source is read, not pixels. Split every report
   into *Verified* and *Needs eyes*. Labeling a guess as verified destroys the whole report.

## Route

Pick one. Do not run the full workflow when a narrow route fits.

| Signal from the user | Route | Go to |
|---|---|---|
| "build / make / design a page, component, app" | **Create** | Workflow, all 3 phases |
| "make it better / prettier / polish / 美化 / 太丑" | **Refine** | `references/redesign.md`, then Phase 2-3 |
| "review / audit / check this UI" | **Audit** | `references/evidence.md` + `scripts/audit.mjs`. Read-only |
| "it feels AI-generated / generic / 有 AI 味" | **De-slop** | `references/anti-slop.md` |
| "animation is janky / add motion" | **Motion** | `references/motion.md` |
| "set up a design system / tokens / theme" | **System** | `references/tokens.md` |
| "fix contrast / keyboard / screen reader" | **A11y** | `references/floor.md` + `scripts/audit.mjs` |

**Audit and Refine are different operations.** Audit reports and stops; it does not edit product
source. "Review and fix" means run Audit, present at most three evidenced findings, then implement
only what the user selects. Presenting first costs one message and prevents rewriting code nobody
asked to be touched.

**Inherit before inventing.** On any existing codebase, read `DESIGN.md`, `tokens.css`, the
Tailwind/theme config, and two representative components before proposing anything. Matching an
established system beats importing a better one.

## Knobs

Read the request, set three values, state them in the Design Read, then obey them. When unstated,
use the default. Never silently drift.

```
VARIANCE   1..5   default 3   how far from convention the visual language may travel
MOTION     0..3   default 1   0 none | 1 functional | 2 expressive | 3 showcase
DENSITY    1..5   default 3   1 airy editorial | 3 product default | 5 data-dense terminal
```

Mapping rules:

- Internal tool, admin, dashboard, "clean", "simple" -> `VARIANCE 2, MOTION 1, DENSITY 4`
- **B2B SaaS landing, developer tool, pricing, signup** -> `VARIANCE 3, MOTION 1, DENSITY 3`
  (the Persuade corpus is more restrained and denser than generic marketing; see
  `references/saas-landing.md`)
- Consumer launch, brand site, portfolio, "wow", "惊艳" -> `VARIANCE 4, MOTION 2, DENSITY 2`
- Brand-defining, award submission, "make it art" -> `VARIANCE 5, MOTION 3, DENSITY 2`
- Docs, blog, long-form reading -> `VARIANCE 2, MOTION 0, DENSITY 2`
- Existing product, add one screen -> `VARIANCE 1` and inherit tokens from the codebase

`VARIANCE 5` still obeys the floor. Boldness is not an accessibility exemption.

---

# Workflow

## Phase 1 — Lock

Never skip. This is the difference between a designed interface and an assembled one.

### 1a. Read the surface

Answer five questions in one line each. Guess when the user did not say; state the guess.

| Dimension | Question | Consequence if wrong |
|---|---|---|
| **Job** | What single action or understanding must this surface produce? | Layout has no hierarchy |
| **Mode** | Persuade / Operate / Read / Experience? | Wrong density, wrong motion budget |
| **Audience** | Who, on what device, in what state of attention? | Wrong type scale and tap sizes |
| **Emotion** | Three adjectives the user should feel. Not "modern", not "clean". | Generic output |
| **Constraint** | Existing stack, brand, tokens, dark mode, i18n, perf budget? | Rework |

Mode definitions live in `references/modes.md`. The mode sets defaults that must not be fought:

- **Persuade** (landing, pricing): one dominant focal point per viewport, generous whitespace,
  motion allowed to be expressive, copy is the design. The differentiation is structural — see
  `references/saas-landing.md` for the Persuade IA skeleton and the product-as-hero Signature.
- **Operate** (dashboard, admin, forms): scan speed over beauty, dense grid, motion ≤ 150ms and
  functional only, state coverage is mandatory.
- **Read** (docs, article, blog): measure 60-75ch, type scale ratio ≤ 1.25, near-zero motion,
  no card grids around prose.
- **Experience** (portfolio, brand, showcase): the composition is the message, asymmetry allowed,
  motion is content, still needs a keyboard path.

### 1b. Choose the direction

Pick **one** anchor with an explicit visual reference, not an adjective. "Modern and clean" is not
a direction; "Linear's near-black surfaces with a single acid accent" is.

Requirements for the anchor:

- Name a concrete reference — a product, a print tradition, a material, a decade.
- Name **one Signature move** the interface will be remembered by: an oversized numeral, a hard
  1px rule system, a duotone photographic treatment, a single saturated accent used exactly three
  times, a monospace metadata layer. One. Not three.
- Verify the anchor is **not** one of the three default LLM clusters. If it is, pick again:
  1. cream/beige background + large serif display + muted earth accents
  2. near-black + one acid/neon accent + tight sans + subtle glow
  3. broadsheet editorial: hairline rules + centered masthead + all-caps eyebrow labels

  These are not bad designs. They are *overfit* designs — see `references/anti-slop.md` for why
  and for the reference-broadening procedure.

### 1c. Emit the Design Read

Output this block verbatim before writing code. It is the contract for the rest of the session,
and it is what makes a later "no, more X" cheap instead of a rewrite.

```
DESIGN READ
Job:        <one sentence>
Mode:       <Persuade|Operate|Read|Experience>
Page Type:  <Landing|Product|Portfolio|Brand|Dashboard|Docs>  (Mode × Page Type selects the language)
Audience:   <who, device, attention state>
Emotion:    <adj>, <adj>, <adj>
Anchor:     <concrete reference> — <why it fits the job>
Signature:  <the one memorable move>
Sections:   <3-5 distinct section shapes, one per line>  (no two may share a skeleton)
Knobs:      VARIANCE <n> · MOTION <n> · DENSITY <n>
Palette:    <bg> / <surface> / <text> / <accent>  (60/30/10)
Type:       <display family> + <text family>, scale ratio <n>
Rejected:   <the default direction deliberately not taken>
```

If a `DESIGN.md` already exists in the project, read it and inherit instead of re-deriving.
If none exists and the work will span sessions, write one from `assets/DESIGN.md.tmpl`.

## Phase 2 — Build

Order is load-bearing. Building content before tokens produces a codebase where "make the accent
warmer" is a 40-file diff.

### 2a. Tokens first

Create or extend `tokens.css` before any component. Minimum viable system — details, naming tests
and scale math in `references/tokens.md`:

```css
:root {
  /* Color — 60/30/10. Semantic names only. */
  --bg: ...;            /* 60% — the dominant surface */
  --surface: ...;       /* 30% — cards, panels, raised areas */
  --text: ...;          /* meets 4.5:1 on --bg */
  --text-muted: ...;    /* meets 4.5:1 on --bg, never below */
  --border: ...;        /* meets 3:1 on --bg when it conveys structure */
  --accent: ...;        /* 10% — used 2-4 times per viewport, never more */
  --accent-fg: ...;     /* meets 4.5:1 on --accent */

  /* Space — one scale, 4px base. No arbitrary values. */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* Type — one ratio, computed not guessed. */
  --text-xs: 12px; --text-sm: 14px; --text-base: 16px;
  --text-lg: 20px; --text-xl: 25px; --text-2xl: 31px; --text-3xl: 39px;
  --leading-tight: 1.1; --leading-snug: 1.35; --leading-normal: 1.6;

  /* Radius, elevation, motion */
  --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --r-full: 999px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / .06);
  --shadow-2: 0 4px 12px rgb(0 0 0 / .08);
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms;
  --ease-out: cubic-bezier(.2, 0, 0, 1);
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
}
```

**The naming test.** If a token name describes appearance (`--blue-500`, `--big-gap`) rather than
role (`--accent`, `--s-5`), theming will break. Primitive scales may exist, but components consume
semantic aliases only.

**The count test.** Font families ≤ 2. Accent colors = 1 (plus semantic status colors). Shadow
levels ≤ 3. Radius values ≤ 3. Exceeding these is almost always indecision, not richness.

### 2b. Structure before surface

1. Grid and rhythm — establish max-width, gutters, and vertical rhythm before any component.
2. Hierarchy — one dominant element per viewport. Rank everything else 2nd/3rd/ambient. If two
   elements compete, demote one; do not enlarge both.
3. Semantic HTML — `<button>` for actions, `<a>` for navigation, one `<h1>`, headings in order,
   `<label>` bound to every input, landmarks (`main`/`nav`/`header`).
4. Only then: color, shadow, radius, decoration.

### 2c. State coverage

Every interactive element ships all of: **default, hover, focus-visible, active, disabled,
loading, error**. Every data surface ships all of: **loading (skeleton, not spinner-only),
empty (with the next action), error (with recovery), partial, full, overflow**.

Missing empty and error states is the single most common defect in AI-generated UI. Enumerate them
explicitly; do not assume the happy path.

### 2d. Content is design

Never ship "Lorem ipsum", "Card Title", "Feature One". Write plausible domain copy — real product
names, realistic numbers, realistic name lengths. Then stress it: the longest realistic string, an
empty string, a 4-digit number, a CJK string. Layouts that only survive their placeholder content
are not finished.

## Phase 3 — Verify

**Bounded: at most two passes.** Pass 1 fixes floor violations. Pass 2 fixes craft. Then stop and
report what remains. Endless polishing loops burn budget and regress working code.

### Pass 1 — Floor (blocking, binary)

Run the audit script, then confirm by hand what static analysis cannot see. Zero dependencies,
Node 18+. Use the skill's own path, not a project-relative one:

```bash
node <skill-dir>/scripts/audit.mjs <project-src-dir>          # findings, exit code = BLOCKING count
node <skill-dir>/scripts/audit.mjs <dir> --quiet              # BLOCKING only
node <skill-dir>/scripts/audit.mjs <dir> --strict             # also fail (exit >0) when Slop Index >= 10
node <skill-dir>/scripts/score.mjs <dir>                      # scored breakdown, Slop Index gate applied
```

The audit computes real WCAG ratios from token values, then runs 50+ static rules across four
severities — BLOCKING (the floor), WARN (likely defects), SLOP (default-look markers that feed the
Slop Index), and INFO (token sprawl) — plus 6 token-sprawl signals: removed focus outlines, positive
tabindex, `aria-hidden` on focusable elements, blocked paste, flash rate above 3Hz, tables without
header cells, layout-property and custom-property transitions, arbitrary `z-index`, `h-screen`, two
primitive or two motion libraries in one file, `requestAnimationFrame` without a cancel path,
bottom-anchored fixed elements without safe-area insets, destructive actions without confirmation,
lists without empty states, fetches without error paths, missing reduced-motion handling, unlabeled
inputs, the four attractor clusters (incl. Cluster D — AI Startup SaaS), uniform spacing, and token sprawl.

Two things it cannot do. It cannot see rendered output — treat its silence as "no static defect",
not "verified". And its output is a **candidate list**, not a findings list: every hit still has to
pass the three proof gates in `references/evidence.md` before reporting it.

| Check | Threshold |
|---|---|
| Body text contrast | ≥ 4.5:1 |
| Large text (≥24px, or ≥19px bold) | ≥ 3:1 |
| UI borders / icons conveying meaning | ≥ 3:1 |
| Focus indicator | visible, ≥ 3:1 against adjacent, never `outline: none` without a replacement |
| Touch targets | ≥ 44x44px (pointer: coarse), ≥ 24x24px desktop |
| Keyboard | every action reachable and operable, focus order = visual order, no traps |
| `prefers-reduced-motion` | honored by every transform/opacity animation |
| Zoom to 200% | no horizontal scroll, no clipped content |
| Forms | every input has a bound label; errors are text, not color alone |
| Images | meaningful `alt`, decorative `alt=""` |
| Layout stability | media has width/height or aspect-ratio; CLS < 0.1 |

Any failure here is a bug. Fix it. Do not trade it against aesthetics.

### Pass 2 — Craft (judgment)

Read `references/floor.md` for the full MUST/SHOULD/NEVER list. The high-yield subset:

- Optical alignment beats mathematical alignment — icons and glyphs may need 1px nudges.
- Spacing is proximity-encoded: related items closer than unrelated. Uniform gaps mean no hierarchy.
- Text measure 45-75ch. Wider is unreadable, narrower is choppy.
- Body line-height ≥ 1.5, display line-height ≤ 1.25. Never `line-height: 1` on wrapping text.
- Numbers in tables: tabular figures, right-aligned, consistent precision.
- Borders are the last resort for separation — try space, then background shift, then a border.
- Buttons: exactly one primary per view.
- Touch/click feedback within 100ms, always.
- Every hover state has a non-hover equivalent (touch devices exist).

### Pass 3 — do not run

Report instead:

```
SHIPPED
Fixed:      <floor violations resolved>
Craft:      <craft items resolved>
Remaining:  <known gaps, with why they were deferred>
Verify by:  <the 1-2 things a human should check manually>
```

---

## Gotchas

Real failures, not theory. Full list in `references/gotchas.md`.

| Symptom | Cause | Fix |
|---|---|---|
| Everything looks flat and unrelated | uniform spacing everywhere | proximity-encode: 4-8px within a group, 24-48px between groups |
| "Looks AI-generated" | 3-equal-cards grid, gradient text, emoji bullets, glassmorphism | `references/anti-slop.md` |
| Dark mode looks muddy | pure `#000` + pure `#fff` + unchanged shadows | `#0a0a0b`-ish bg, `#e8e8ea`-ish text, replace shadows with borders/tint |
| Animation stutters | animating `width`/`height`/`top`/`left`/`box-shadow` | only `transform` and `opacity`; `will-change` sparingly |
| Focus ring invisible on dark | single-color ring | two-tone ring: `outline` + `outline-offset` with contrasting box-shadow |
| Layout breaks in Chinese/German | fixed widths, `text-overflow` used as a design | `min-width: 0`, `flex-wrap`, test with 2x-length strings |
| Sticky header covers anchors | no scroll padding | `scroll-margin-top` on targets or `scroll-padding-top` on the scroller |
| Modal scrolls the page behind it | no scroll lock | lock body scroll, trap focus, restore focus on close, `Esc` closes |
| Hover-only affordance | designed on desktop | ensure touch parity; never hide primary actions behind hover |
| `100vh` cut off on mobile | browser chrome | use `100dvh` |
| Fonts flash or shift | no `font-display`, no fallback metrics | `font-display: swap` + `size-adjust` fallback |
| Shadows look dirty | pure black at high opacity | tint the shadow toward the background hue, keep opacity ≤ 12% |

---

## Rationalizations

Quality is not usually abandoned in one decision. It is traded away one reasonable-sounding excuse
at a time. When the thought on the left forms, answer with the right column.

| The thought | The reality |
|---|---|
| "It's just a prototype / demo." | Prototypes ship. The foundation skipped is the foundation nobody adds later. |
| "I'll make it accessible in a follow-up pass." | There is no follow-up pass. Retrofitting focus, labels and semantics costs several times more than writing them once. |
| "The design isn't final, so styling can wait." | Unstyled UI reads as broken, not as pending. Use the token defaults. |
| "Contrast is slightly low but it looks better." | 4.5:1 is a threshold, not a preference. Change the color, not the rule. |
| "The user only asked to make it prettier." | Shipping a prettier interface that a keyboard cannot operate is a regression. |
| "One arbitrary pixel value won't hurt." | It is never one. It is the first, and it removes the meaning of the scale. |
| "I'll add the empty and error states if there's time." | The happy path is the easy half. Missing states are the single most common defect in generated UI. |
| "This spacing/color looks off, I'll flag it anyway." | Without a cited rule and a traced path it is taste, not a finding. See `references/evidence.md`. |
| "More findings makes the audit look thorough." | Twenty findings get skimmed. Three get fixed. |
| "I can't see the render, but it's probably fine." | Then it goes under *Needs eyes*, not under *Verified*. |
| "The library's default is good enough." | Defaults are what every other generated interface also shipped. That is the definition of slop. |

## Red flags

Stop and reconsider when these appear in the output:

- A component over ~200 lines, or one that both fetches data and renders presentation
- Inline styles or arbitrary values (`p-[13px]`, `#4f46e5`) anywhere outside the token file
- Any `z-index` not drawn from a fixed scale
- A hand-built dropdown, dialog, combobox or tooltip when the project already has a primitive
- Two primitive systems (e.g. Radix and Base UI) inside one interaction surface
- `Lorem ipsum`, "Card Title", "Feature One", or a stat like "10,000+ users" invented
- Three visually identical cards in a row
- A hover-only affordance
- An audit report with no *Needs eyes* section
- Dopamine multi-hue gradient, bento grid by reflex, or "we have AI" as a brand value
- Default easing `ease` / `ease-in-out` / `linear` written as-is
- A tinted ground with no stated reason (legitimate only when the brief names it)

---

## Reference map

Load only what the current route needs.

| File | Read when |
|---|---|
| `references/evidence.md` | **any review of existing code** — proof gate, grading, report shape |
| `references/modes.md` | choosing or arguing about density, hierarchy, motion budget |
| `references/tokens.md` | building a token system, type scale math, color ramps, dark mode |
| `references/floor.md` | full MUST/SHOULD/NEVER rule set with thresholds |
| `references/motion.md` | any animation work: frequency table, easing, performance |
| `references/anti-slop.md` | output feels generic; reference-broadening procedure |
| `references/award-craft.md` | learning from award-winning sites; the positive design language |
| `references/saas-landing.md` | Persuade-mode craft (SaaS landing, pricing); the structural language |
| `references/redesign.md` | improving an existing UI without a rewrite |
| `references/gotchas.md` | something is subtly wrong and cannot be named |
| `scripts/audit.mjs` | Phase 3 Pass 1, or an explicit audit request |
| `scripts/score.mjs` | want a numeric craft score with a breakdown |
| `assets/DESIGN.md.tmpl` | work spans sessions and the direction must persist |
| `assets/tokens.css.tmpl` | starting a token file from zero |

## Self-check before responding

Creating or refining:

- [ ] Design Read emitted before any code
- [ ] Knobs stated and obeyed
- [ ] `Mode × Page Type` selected the language (Persuade ≠ Experience; see `references/saas-landing.md`)
- [ ] Existing `DESIGN.md` / tokens inherited rather than replaced
- [ ] Zero raw hex / raw px outside the token file; every `z-index` from the scale
- [ ] One dominant element per viewport, one primary button per view
- [ ] All interactive states and all data states present
- [ ] Real content, stress-tested for length (longest string, empty, CJK)
- [ ] Audit script run, floor violations = 0, Slop Index below 10 (designed or drifting, not generated)
- [ ] Not one of the four default clusters (incl. Cluster D — AI Startup SaaS); Signature move is present and singular
- [ ] Section shapes vary — `Sections:` lists 3-5 distinct skeletons, none repeated
- [ ] Persuade copy is a stance/outcome, not noun labels; every stat has unit + window + subject
- [ ] Learned from award / SaaS work (language, not memes); no dopamine gradient, no reflex bento, no default ease
- [ ] `score.mjs` band is not overridden by the Slop gate
- [ ] Stopped after two passes and reported honestly

Reviewing:

- [ ] Every finding passed Contract + Reach + Correction, then survived falsification
- [ ] At most three findings, one named as Fix first
- [ ] Each graded on both axes (● / ◐ / ○ and critical…minor)
- [ ] Product source untouched
- [ ] *Needs eyes* section present and specific
- [ ] No sentence left that does not change a decision
