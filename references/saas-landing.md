# SaaS Landing & Persuade-Mode Craft

Source: a quantified study of 950 SaaS landing pages on saaslandingpage.com (27 cases read at
the detail level, plus site-wide font/palette/stack aggregations) and 60+ Persuade-intent cases
on reeoo.com (Linear, Stripe, Raycast, Attio, Cal.com, PostHog, Oxide, Resend, Fathom, Mintlify,
Porto Rocha, Moooi, and others). The two samples converge on one claim: **for conversion surfaces,
differentiation lives in information architecture and copy, not in decoration.** This file is the
positive language for `Mode: Persuade`. Read it alongside `references/award-craft.md`, which covers
`Mode: Experience` — the two must not be conflated.

## The category baseline (so the knob defaults are real, not guessed)

- **Palette median = 2 color values** (ground + one accent). Of 27 read cases, 17 used exactly 2;
  ≥4 colors appeared only with a defensible content reason (multi-product bento, a design tool
  selling color itself, a data-viz pastel spectrum).
- **Dark ground is a sub-category, not a default.** Only 4.1% of the 950 cases are dark, and they
  cluster almost entirely in developer tools / infrastructure / crypto. 95.9% of strong SaaS pages
  are light. "Near-black + neon" signals *an engineering audience*, not universal premium.
- **Motion is restrained.** GSAP appears in only 7.6% of cases. The Persuade baseline is native
  scroll + one-shot reveals, not scroll takeover. (Contrast `references/motion.md`: scroll takeover
  is an Experience-mode baseline, not a Persuade one.)
- **Fonts:** Inter is the single most-used face (21%) but is a *default signal* when unexamined.
  Strong cases either license a display face (Söhne, GT Walsheim, Suisse Int'l, Clarkson) or pair a
  workhorse sans with a contrasting display or a mono sub-voice.

## Twelve craft rules for Persuade surfaces

### 1. Palette = ground + text + one accent. The 4th color must be *claimed*, not *wanted*
A complete system is `--bg` + `--text` + one `--accent`. A 4th hue is allowed only when content
demands it (a status color, a data-viz series), never to "look richer". See `references/tokens.md`.

### 2. Accent binds to one semantic action, appears 2–4 times per viewport, ≤ 5% of area
Attio's only blue sits on the primary CTA and key data points. Raycast's coral is on the logo and
the download button. When a 2nd hue is "needed", first try demoting it to another lightness of the
first (rule 3) before reaching for a new hue.

### 3. When a 2nd hue seems required, try a monochrome ladder first
One hue, three lightnesses, three roles: Optimizely `08251a` (ground) → `227d47` (surface) →
`abff44` (accent); Oxide `030013` → `03001d` → `0300b0`. This is the cleanest escape from the
"dark + neon" trap and is missing from most token systems. See `references/tokens.md`.

### 4. One display voice, one text voice, optionally one mono sub-voice
Two families only when the 2nd *does a different job*: a serif display over a sans text
(Mintlify, Branch, Wispr), or a mono carrying numbers/labels/timestamps (Fathom, Content
Architecture). Mono is the cheapest "this is a system" signal — give it a real job, never the body.

### 5. Hero = one value prop + one mechanism line + 1 primary CTA + 1 low-commitment secondary
Attio: `Welcome to agentic revenue.` / `the CRM that builds pipeline, advances deals, grows
accounts around the clock` + **Start for free** (primary) / Talk to sales (secondary). Never two
equal-weight primary buttons. The secondary always takes the low-commitment path (docs / demo /
sales), catching the visitor not yet ready to sign up.

### 6. The product at work is the hero visual — DOM-replicate it, do not screenshot it
Linear's hero is a live issue stream with real state progression (`2min ago` → `just now`) and real
IDs (`ENG-2703`). Cal.com renders an interactive booking widget (timezone, durations). Oxide renders
a real instance table (`prod-db-primary · 8 vCPU · 32 GiB · running 4mo`). DOM replicas give three
free wins: lossless clarity, responsive reflow, and animatability. This is the strongest
differentiation lever in the category and the hardest for a template to fake. **Recommended
Signature for Persuade work.**

### 7. Social proof is layered: number → metric-backed story → named quote
Stripe: `US$1.9tn processed in 2025` / `99.999% uptime` → Hertz (`160 countries`, `11k+ stores`)
→ named customer quotes. Every number carries **unit + time window + subject**. `US$1.9tn in
payments volume processed in 2025` is evidence; `10,000+ users` is filler (and the audit flags it).

### 8. Section shape must change down the page — never "title + subtitle + grid" × 5
Linear's five feature sections are five different shapes: kanban list → gantt roadmap → agent
terminal flow → split code diff → chart + weekly-report card. Oxide uses a two-column comparison
table + a numbered spec list + a 3D hardware browser. Vary the skeleton; do not refill one skeleton
with new content. (The bundled audit flags `section-sameness` when ≥3 sections share the same
h2 + 3-col grid skeleton.)

### 9. A numbering system is the cheapest design signal — and it resists slop
Linear `1.0 Intake → 2.0 Plan → 3.0 Build → 4.0 Diffs → 5.0 Monitor`, sub-items `1.1/1.2/1.3`,
figure notes `FIG 0.2`. Oxide `Fig. 1 / 2 / 3` + hardware parts `1/2/3`. Numbering requires the
content to actually be ordered and countable — which is exactly what template output lacks. Strong
Persuade Signature candidate.

### 10. The CTA repeats at the end of every argument block, with constant wording
Clay repeats `Start free trial` six-plus times across the page, each linking to the identical
destination. The CTA is not a one-time footer event; every time a reader finishes an argument, give
them an exit. Constant wording or it dilutes into several different promises.

### 11. Pricing language is legible math, not three cards + a "recommended" badge
PostHog prints unit prices on the homepage (`$0.00005/event`, `$0.005/recording`) with a free tier
and `98% of our customers use PostHog for free`. Cal.com states `Teams $16/user/month` inside the
FAQ. Attio / Linear / Tempo omit price entirely and show only `Start for free`. Decide which — but
never hide the number behind a "Contact sales" wall when the product is self-serve.

### 12. The closer mirrors the hero: restate the value prop + one CTA
Attio `Agentic revenue runs on Attio.`; Raycast `Take the short way.` + download. The footer is the
densest screen and does information architecture, not visual design (Raycast's footer is a six-group
sitemap + newsletter + compliance). Get the grouping right; decorate nothing.

## The landing-page skeleton (Persuade IA order)

Use as a checklist in Phase 2b when the mode is Persuade. Deviation is allowed; *unexamined*
deviation is not.

```
hero  (value prop + mechanism + 1 primary CTA + 1 secondary)
  → logo wall / trusted-by (named, linked — not anonymous avatars)
  → 3–5 argument sections, EACH A DIFFERENT SHAPE, each ending in a repeated CTA
  → layered social proof (number → story → named quote)
  → pricing OR a free-entry path
  → closer (hero restated + single CTA)
  → multi-column footer (sitemap, not decoration)
```

## Five differentiation techniques worth stealing

- **Product-as-shadow (Linear):** let the product run on the page. Real states, real IDs, real
  density. Confidence is conveyed by *daring to show detail*, not by adjectives.
- **Comparison as typography (Oxide):** separate two contrast blocks with a texture of repeated
  `#` glyphs, not a 1px rule or a card border. A divider can be texture.
- **Voice as Signature (PostHog):** name a section `Social proof` and write `Yes they actually use
  us`. Tone is a zero-cost differentiator a template cannot copy.
- **Zero-accent hierarchy (Retool, Tempo):** strip color entirely; let size, weight, whitespace and
  hairlines carry all hierarchy. The strictest test of whether hierarchy is real.
- **Live metric as first motion (Mintlify):** if the core claim is a number, make that number the
  first thing that moves on the page.

## Red flags specific to Persuade surfaces

- Three equal cards used as the *primary* argument structure (acceptable only as a secondary info
  band far down the page).
- A statistic with no unit, no time window, and no subject.
- Two co-equal primary buttons in the hero.
- A hero "product shot" that is a static screenshot or a stock illustration instead of a working
  replica.
- Every section sharing the same `h2 + subtitle + grid` skeleton.
- Dark + neon chosen as a default "premium" move with no engineering-audience brief.
- Anonymous testimonials: avatar walls or "— CTO, TechCorp" with no link and no real name.
- Noun navigation and noun headings (`Features` / `Why Us` / `Benefits`) instead of stance or
  outcome sentences (Porto Rocha's `Making Nike the running brand once again`).
- A "We have AI" value statement with no specific capability behind it.

## Relationship to the rest of the skill

- `references/award-craft.md` — Experience/brand language. Do **not** import its scroll-takeover,
  context-cursor, or clip-path-reveal defaults into a Persuade page; they cost conversion.
- `references/anti-slop.md` — the negative gate. Cluster D (AI Startup SaaS) is the 2026 Persuade
  trap; the noun-navigation and stat-provenance tells live there.
- `references/motion.md` — Persuade motion budget: micro-interactions + one-shot reveals only;
  scroll takeover and immersive cursor are out of scope here.
