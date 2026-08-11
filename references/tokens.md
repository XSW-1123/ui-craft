# Design Tokens

A token system is not a variables file. It is a decision-compression device: every value in the UI
traces back to a small set of deliberate choices, so changing a choice changes the UI.

## The three tests

Apply to every token before it exists.

**1. Naming test — role, not appearance.**
`--blue-500` describes what it looks like. `--accent` describes what it does. Components consume
role tokens only. A primitive ramp may exist underneath, but a component that references
`--blue-500` cannot be themed.

```css
/* primitives — the palette, never used directly in components */
--blue-50: #eff6ff;  --blue-500: #3b82f6;  --blue-900: #1e3a8a;

/* semantic — what components actually use */
--accent: var(--blue-500);
--accent-hover: var(--blue-600);
--accent-fg: #ffffff;
```

If a token cannot be named by role, its purpose is undecided. Do not create it.

**2. Count test — decisions, not options.**

| Token family | Ceiling | Why |
|---|---|---|
| Font families | 2-3 | A display + a body, plus a monospace sub-voice for metadata |
| Accent colors | 1 | Plus semantic status (success/warn/error/info) |
| Shadow levels | 3 | Resting, raised, overlay |
| Radius values | 3 | Small, medium, pill |
| Type sizes | 7-9 | More means the scale is not doing its job |
| Space steps | 9 | A 4px-based geometric-ish scale covers everything |
| Motion durations | 3 | Fast, base, slow |

Exceeding a ceiling is a signal to consolidate, not to extend.

### The monospace sub-voice

Winning interfaces (Awwwards study) almost never run on a single sans. They pair the display/
body face with a **monospace that carries numbering, labels, metadata, and data** — nav indices,
timestamps, stat units, code, captions. Mono reads as "considered" because it is the typographic
signature of systems thinking.

```css
--font-display: "...";   /* headings, hero */
--font-sans:    "...";   /* running text, UI */
--font-mono:    "...";   /* labels, indices, data, metadata — 12-13px, uppercase, tracked */
```

A third family is justified *only* when it does a distinct job (e.g. a serif for pull-quotes).
If a third face appears just because two felt few, it is indecision, not design.

**Mono is a contract, not a suggestion.** Give the monospace a *bound* role in the token file so it
cannot drift into body or headings — it carries numbering, labels, metadata, data units, timestamps,
code, captions only. A mono sub-voice with a real job is the cheapest "this is a system" signal:

```css
--font-mono: "...";  /* ROLE-LOCKED: indices, labels, data, status, timestamps.
                        Never body, never headings, never the hero. 12-13px, uppercase, tracked. */
```

On Persuade surfaces this is also where real product data lives (IDs, metrics, timezones) — see
`references/saas-landing.md` rules 4, 6, 9.

**3. Traceability test.**
Grep the codebase for `#`, and for `px` outside the token file. Every hit is either a defect or a
token that should exist. `scripts/audit.mjs` does this automatically.

---

## Color

### 60/30/10

- **60%** — the dominant surface (`--bg`). Usually near-white or near-black, **tinted**, never
  saturated and never pure `#fff`/`#000`.
- **30%** — secondary surfaces, cards, panels, borders (`--surface`, `--border`).
- **10%** — the accent (`--accent`). Appears **2 to 4 times per viewport**. If it is everywhere,
  it emphasizes nothing.

A common failure: three "accent" colors used equally. That is not a palette, it is noise. Pick one
and let the others be semantic-only (green means success, red means error — nothing else).

### Tinted ground, not neutral

The ground should carry a 2–4% hue shift so it reads as a *material chosen*, not a default
accepted. Winning palettes: `#f3f0ed` (warm grey-beige), `#fdfbef` (vanilla), `#f3eee0` (cream),
`#0a0a0a` / `#0e0e0e` / `#070b0a` (warm/cool near-black). A tinted ground paired with a real
intent and a Signature is legitimate (see `references/anti-slop.md`); an untinted cream with no
intent is a slop cluster.

### Accent area discipline

The accent earns impact through scarcity. Keep it at **≤ 5% of the viewport area** — a word, a
rule, a single button, a data point. Choose it by brand semantics (a warning brand → red; a calm
brand → sage), never by "what looks cool". An accent used 30 times is no longer an accent.

### The monochrome ladder (often beats a 2nd hue)

When a second color "seems needed", try one hue at three lightnesses first. The ladder carries
ground / surface / accent as the *same* color at different values, so the system reads as one
decision, not a palette:

- ground `oklch(0.18 0.06 250)` → surface `oklch(0.30 0.07 250)` → accent `oklch(0.78 0.15 250)`
- Real cases: Optimizely `08251a`/`227d47`/`abff44`; Oxide `030013`/`03001d`/`0300b0`.

This is the cleanest escape from the "dark + neon" trap (Cluster B / Cluster D in
`references/anti-slop.md`) and is the recommended path when the brief asks for a calm, technical,
or restrained feel.

### Intent × color

Color saturation is a statement about *intent*, not taste.

- **Persuade / Operate** surfaces: the ground is a single-hue near-white or near-black (tinted, per
  above). `multicolored` is not a baseline here — if the brief wants multiple hues, the Design Read
  `Anchor` must name the brand semantics that justify it.
- **Experience / Brand**: multi-color is legitimate *when brand expression is itself the content*
  (a fashion house, a 3D studio), and must still be bound to brand meaning.

A quantified baseline: across 950 studied SaaS landing pages the palette median was **2 color
values** (ground + one accent) and only **4.1%** used a dark ground — dark is a developer-tool
sub-category, not a universal premium move. See `references/saas-landing.md`.

### Reverse-engineered fluid scale

Display and section type should be computed from a fixed reference width (e.g. 1440px), not a
generic 4/8pt ramp — winners carry values like `.6944444444vw`, the fingerprint of a Figma-pixel
reverse-calc. Use `clamp()` for hero/section sizes and a hand-built step scale; reserve the
geometric spacing ramp for UI chrome, not for headline typography.

### Building a ramp

Do not generate steps by naive lightness math. Perceptual uniformity matters:

- Prefer OKLCH: hold chroma and hue, vary lightness. `oklch(0.72 0.14 250)`.
- Shift hue slightly as lightness drops (darker shades bend toward blue/purple) — this is why
  mechanically darkened brand colors look muddy.
- Reduce chroma at the extremes; maximum-chroma near-white or near-black reads as neon dirt.
- Validate each step against its intended foreground before adopting it.

Practical minimum ramp: 50 / 100 / 200 / 300 / 500 / 600 / 700 / 900. Skip unused steps.

### Dark mode is a separate design

Not an inversion.

| Concern | Light | Dark |
|---|---|---|
| Background | `#fafafa`-ish, not pure white | `#0a0a0b`-ish, not pure black |
| Text | `#18181b`-ish | `#e8e8ea`-ish, not pure white |
| Elevation | shadows | lighter surface tint + 1px border; shadows barely read |
| Accent | brand value | usually needs +8-15% lightness and -10% chroma |
| Images | as-is | consider `filter: brightness(.9)` for pure-white-heavy assets |
| Borders | `rgb(0 0 0 / .08)` | `rgb(255 255 255 / .08)` |

Re-run contrast checks for the dark theme independently. Roughly a third of the time, at least one
pair fails after a naive inversion.

Structure it as a token override, not a parallel stylesheet:

```css
:root { color-scheme: light; --bg: #fafafa; --text: #18181b; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; --bg: #0a0a0b; --text: #e8e8ea; }
}
[data-theme="dark"] { color-scheme: dark; --bg: #0a0a0b; --text: #e8e8ea; }
```

---

## Typography scale

Pick one ratio, compute, round to integers, stop.

| Ratio | Name | Use |
|---|---|---|
| 1.125 | Major second | Very dense dashboards |
| 1.2 | Minor third | Product UI, default for Operate |
| 1.25 | Major third | General default |
| 1.333 | Perfect fourth | Editorial, marketing |
| 1.5 | Perfect fifth | Posters, hero-dominant landing |

From a 16px base at ratio 1.25: 16 → 20 → 25 → 31 → 39 → 49 → 61.
Downward: 16 / 1.25 = 12.8 → 13, and 16 / 1.25² = 10.2 → useful only for micro-labels.

Rules:
- Body stays at the base. Never scale body text up for "impact".
- Big jumps read as hierarchy; adjacent steps read as accident. Skip a step between a heading and
  its body.
- Line-height falls as size rises: 1.6 body → 1.35 subhead → 1.1 display.
- Weight and size are two separate hierarchy axes. Using both at every level flattens the scale;
  use one primarily.

### Fluid type

```css
--text-3xl: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
```

Clamp only display sizes. Fluid body text between 15px and 17px is churn with no benefit. Always
set a floor at 16px for anything readable.

---

## Space

One scale, 4px base, mildly geometric so large gaps stay distinguishable:

```
4  8  12  16  24  32  48  64  96  128
```

Assignment by relationship, not by taste:

| Relationship | Gap |
|---|---|
| Icon to its label | 4-8px |
| Label to its input | 4-8px |
| Items inside one card | 8-16px |
| Between cards | 16-24px |
| Between subsections | 32-48px |
| Between page sections | 64-128px |

The diagnostic: if a stranger cannot tell which elements belong together from spacing alone,
the spacing carries no information.

Vertical rhythm: pick a base unit (8px) and keep block margins as multiples. Prefer a single
directional margin convention (all margin-bottom, or use `gap` in a flex/grid column) to avoid
collapse surprises.

---

## Elevation

Three levels. Each is a *combination*, not just a shadow.

```css
--shadow-1: 0 1px 2px rgb(0 0 0 / .06), 0 1px 1px rgb(0 0 0 / .04);
--shadow-2: 0 4px 12px rgb(0 0 0 / .08), 0 1px 3px rgb(0 0 0 / .06);
--shadow-3: 0 16px 48px rgb(0 0 0 / .12), 0 4px 12px rgb(0 0 0 / .08);
```

- Tint shadows toward the background hue instead of using pure black. Pure black over a warm
  background reads as dirt.
- Layer two shadows: a tight one for the contact edge, a diffuse one for the ambient cast.
- Keep total opacity ≤ 12% for resting elements.
- In dark mode, express elevation with surface lightness and a hairline border; shadows are nearly
  invisible.

---

## Motion tokens

```css
--dur-fast: 120ms;   /* hover, focus, small state flips */
--dur-base: 200ms;   /* dropdowns, tooltips, tab changes */
--dur-slow: 320ms;   /* modals, drawers, page-level transitions */

--ease-out:    cubic-bezier(.2, 0, 0, 1);      /* entrances — default */
--ease-in:     cubic-bezier(.4, 0, 1, 1);      /* exits */
--ease-in-out: cubic-bezier(.4, 0, .2, 1);     /* movement between two on-screen states */
--ease-spring: cubic-bezier(.34, 1.56, .64, 1);/* direct manipulation only */
```

Larger travel distance needs proportionally more time, but never exceed 400ms for functional UI.

---

## Component contract

A component reads tokens; it does not define values.

```css
.btn {
  padding: var(--s-3) var(--s-5);
  border-radius: var(--r-md);
  font-size: var(--text-sm);
  transition: background var(--dur-fast) var(--ease-out);
}
.btn--primary { background: var(--accent); color: var(--accent-fg); }
.btn--primary:hover { background: var(--accent-hover); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

Component-level tokens are acceptable when they alias semantic tokens:

```css
.card { --card-pad: var(--s-5); padding: var(--card-pad); }
```

They are not acceptable when they introduce new raw values.

---

## Migrating an existing codebase

1. Inventory: extract every unique color, spacing, radius and duration currently in use.
2. Cluster: values within ~10% of each other are the same decision expressed sloppily. Collapse
   them.
3. Name by role, based on where each cluster is actually used.
4. Replace mechanically, one family at a time (color, then space, then radius, then motion).
   Never mix families in one pass.
5. Add a lint rule or run `scripts/audit.mjs` in CI so raw values cannot come back.

Expect the inventory to be shocking: 40+ grays and 60+ spacing values is normal in a codebase that
grew without a system. Collapsing to 9 and 9 is the whole point.
