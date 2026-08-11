# Award-Craft

Source: a source-level study of current Awwwards-winning sites (2026) — Produx Design,
No Art, Alethia, Serotoninn, 20 Years / nk.studio, Vero New-York, NOTHIN', White Desert,
Belgrade Arbor, The Eight — cross-checked against 2026 design-trend writing.

## Language, not memes (read this first)

Awwwards is the densest sample of *human* design on the web. But its visual **tics**, once
templated, become exactly the slop this skill blocks. So this file extracts **language
(principles)** only. It deliberately ships no copy-paste recipes.

Every principle below, used as "apply the ready-made recipe", flips into a red flag:

- ✗ "Use acid green `#cfff6a` for the accent." → recipe.
- ✓ "Pick one high-saturation color bound to brand semantics; area ≤ 5%." → principle.
- ✗ "Add a bento grid." → recipe.
- ✓ "Let content density shape the layout; never reach for a grid first." → principle.
- ✗ "Use `cubic-bezier(.19,1,.22,1)`." → recipe.
- ✓ "Hand-write one ease-out curve with a zero end-derivative; never the default `ease`." → principle.

One line: **learn why it is good, not what it looks like.**

## Mode matters: this language is Experience-grade

The ten languages below were distilled from **award / portfolio / brand** sites — `Mode:
Experience`. They are the right default for those intentions. They are **not** the right default for
`Mode: Persuade` (SaaS landing, pricing, signup). The Persuade corpus (saaslandingpage.com, 950
cases; reeoo Persuade cases) shows a different, quieter craft: differentiation lives in information
architecture and copy, not in cursor systems and scroll takeover. Evidence:

- **Scroll takeover** (language #6) appears in only **7.6%** of studied SaaS pages. On a Persuade
  surface it costs conversion; treat it as Experience-only.
- **Context cursors per zone** (language #4) are an Experience signature. On a SaaS page they are
  decoration that competes with the CTA.
- **Reveals replace fade-up** (language #8) is fine, but the Persuade baseline is one-shot,
  low-distance, content-readable-without-JS — not choreographed scroll cinema.

The Persuade-positive language (product-as-hero, numbering systems, legible pricing, layered
social proof, voice as Signature) lives in `references/saas-landing.md`. Read both files; pick by
`Mode`, never by vibe.

## Ten design languages distilled from the winners

### 1. Self-hosted custom type + a monospace sub-voice
9 of 10 sites use a commercial licensed display face (At Aero, Neue Haas Grotesk, Thunder,
Geist, PP Neue Montreal, PP Editorial Old, Cardinal Classic, Louize, Edicted) — and **every**
site pairs it with a monospace that carries numbering, labels, metadata, data.
Mono is the invisible marker of "considered". Example: Alethia uses Geist + Geist Mono +
Fragment Mono; Serotoninn uses Thunder (9 weights) + PP Fraktion Mono.
Do not run the whole UI on one sans. Give metadata a mono voice.

### 2. Narrow palette + a sliver of high-saturation accent
Most winners use 1–3 colors. The formula: one off-white or near-black ground + exactly one
high-saturation accent at **≤ 5% of the area**. Produx `#cfff6a` acid, No Art `#00deff`,
Alethia `#c6f19d`, Serotoninn `#ed3833`, nk.studio `#00ffc2`, The Eight `#ff7a2a`.
The accent earns its punch by scarcity. Spread it everywhere and it emphasizes nothing.

### 3. Off-white / off-black, never pure
Grounds are tinted, not `#fff`/`#000`: `#f3f0ed` (Vero), `#fdfbef` (Arbor), `#f3eee0` (The
Eight), `#0a0a0a` (White Desert), `#0e0e0e` (Produx), `#070b0a` (nk.studio). A 2–4% hue
shift reads as "a material was chosen", not "a default was accepted". (See the cluster note
in `references/anti-slop.md`: tinted ground + a real intent + a Signature is *legitimate*;
untinted cream with no intent is slop.)

### 4. Context cursors, per zone — not one global cursor *(Experience-only)*
Produx ships 3 followers (site / showreel / project); Serotoninn ships 6, one per section;
No Art has a `cursor-bubble`; NOTHIN' has dual cursors. The cursor is a *per-region* design
object, not a site-wide switch. When you add a custom cursor, ask what each zone needs
differently. **On Persuade surfaces this is decoration that competes with the CTA — skip it
(see `references/saas-landing.md`).**

### 5. Zero default easing
Not one winner uses `ease` / `ease-in-out` / `linear` as written. They hand-tune beziers,
almost all "fast-start, soft-landing" with a zero end-derivative:
`(.19,1,.22,1)`, `(.77,0,.175,1)`, `(.86,0,.07,1)`, `(.18,.78,0,1)`, `(.87,0,.13,1)`,
`(.75,0,.25,1)`. Write your own curve; never accept the browser default `ease`.

### 6. Scroll takeover is infrastructure *(Experience-only)*
4 of 5 studied sites run Lenis (smooth scroll); motion is bound to scroll *progress*, not a
timeline. nk.studio and Produx drive reveals from scroll position. If the project animates on
scroll, smooth scroll + scroll-linked values is the expected baseline, not a flourish.
**Caveat: on Persuade surfaces scroll takeover is out of scope — it costs conversion. The Persuade
baseline is native scroll + one-shot reveals (`references/saas-landing.md`, `references/motion.md`).**

### 7. Fluid scale reverse-engineered from the comp
Type sizes are computed from a 1440 (or similar) reference, not a 4/8pt system. Produx is
fully `vw`; Serotoninn carries `.6944444444vw` (10-decimal) — the fingerprint of a Figma
pixel reverse-calc. Use `clamp()` for display sizes and a hand-built step scale, not a
generic spacing ramp, for hero/section type.

### 8. Reveals replace fade-up
Entrances are never a bare `translateY(20px)` + `opacity`. Winners use:
- clip-path wipe with rounded corners (`inset(0% 100% 0% 0% round .25em)` → `round .25em`)
- blur focus (`filter: blur(10px)` → `0`, staggered 50/100/150ms)
- mask scale (a logo-shaped mask opens to reveal video)
- word-mask push (each word slides up from behind a clip, SplitText-style)
Pick one and commit. A fade-up is the template signature; a wipe/blur/mask is a decision.

### 9. Framework is a shell; the interaction layer is bespoke
Webflow + a hand-written Vite/Three bundle (NOTHIN'), Next.js + self-authored OGL WebGL
(Vero), Nuxt + pure CSS (The Eight). The winning sites treat the framework as a delivery
vehicle and write the motion themselves. Do not assume "the framework handles it."

### 10. Real content, always
No Art shows real labels/artists/events; NOTHIN' prints the real designer/developer/cinematographer
names in the console; nk.studio is a 20-year genuine archive. There is no "Lorem ipsum",
no "Feature One", no invented "10,000+ users". Real content is what makes the layout
specific — and specificity is the only thing that defeats slop.

## Cross-site anti-patterns (echoes `references/anti-slop.md`)
No bento grid. No three equal cards. No gradient text. No Inter + default mono. No autoplay
that pins the scroll. No dopamine multi-hue blob. These are the exact tells the bundled audit
flags — winning sites avoid them by *intent*, not by luck.

## When to show restraint (the 2026 direction that actually signals "high-end")
The credible trend writing converges: the premium move in 2026 is **restraint** — editorial
typography, print-grade whitespace rhythm, motion used as *punctuation* not *wallpaper*,
and a performance budget enforced from day one. Out: aggressive parallax stacks, scroll-pinned
autoplay, "we have AI" as a brand statement. In: one strong concept, generous negative space,
and motion that earns its frame.

## Red flags: turning award language into slop
- Dopamine multi-hue gradient (purple → pink → orange blob behind the hero)
- Acid/neon accent with no semantic binding (near-black ground + any high-sat color, unexplained)
- Bento grid applied by reflex
- Kinetic type abused (per-letter animation on body copy or nav)
- Default easing `ease` / `ease-in-out` / `linear`
- "We have AI" stated as a brand value

## Relationship to `references/anti-slop.md`
`award-craft.md` supplies the positive language; `anti-slop.md` supplies the negative gate.
They are two sides of one check: tinted ground + real intent + a singular Signature = pass;
untinted cream + no intent = slop. Read both before locking direction.

## Persuade-grade language (the other half)

For `Mode: Persuade` the differentiation is structural, not decorative. Distilled from
saaslandingpage.com (950 cases) and reeoo Persuade cases. Full detail in `references/saas-landing.md`.

- **The product at work is the hero.** DOM-replicate a real, running interface (Linear's live issue
  stream, Cal.com's booking widget) rather than screenshotting it. Lossless, responsive, animatable.
- **A numbering system is a Signature.** `1.0 Intake → 5.0 Monitor`, figure notes `FIG 0.2`. It
  requires the content to actually be ordered — which is exactly what template output lacks.
- **Voice is a zero-cost Signature.** PostHog titles a section `Social proof` and writes `Yes they
  actually use us`. Tone cannot be templated.
- **Copy is the design; nouns are the tell.** Stance/outcome sentences (`Making Nike the running
  brand once again`) beat noun headings (`Features` / `Why Us`). Generic noun navigation is a slop
  tell (see `references/anti-slop.md`).
- **Social proof is layered and legible.** Number (with unit + window + subject) → metric-backed
  story → named, linked quote. Anonymous avatar walls and `10,000+ users` are filler.
- **Zero-accent hierarchy** (Retool, Tempo) is the strictest test of whether hierarchy is real:
  strip color, let size/weight/whitespace/hairlines carry it all.

One line for this half: **on a conversion surface, the Signature is usually a sentence or a
structure, not a visual effect.**
