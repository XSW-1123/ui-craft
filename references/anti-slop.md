# Anti-Slop

"AI slop" is not ugliness. Most of it is competent. The problem is that it is **overfit**: the same
small region of design space returned regardless of the brief, because that region is dense in the
training data and safe under averaging.

The tell is not a specific style. The tell is **the absence of a decision that only this brief
could have produced.**

---

## The Slop Index (enforced)

`scripts/audit.mjs` turns these tells into a single number. Each surface tell and cluster carries a
weight; the audit sums them and normalises by project size (per 10 files) into the **Slop Index**:

- **0-4** — designed
- **5-9** — drifting toward the default
- **10-19** — reads as generated
- **20+** — is the default

A Slop Index of 10 or more is treated as a shipping blocker regardless of the floor score. The audit
exposes it (`--strict` fails CI at ≥10); `scripts/score.mjs` caps the total and overrides the band
at the same threshold. The tells below are the inputs to that number — fix them to lower the index.

## The three attractor clusters

Left alone, LLM-generated interfaces collapse into one of three looks. All three are legitimate
designs that have been flattened into defaults by repetition.

**Cluster A — Warm editorial minimal**
Cream or beige background (`#faf8f5`, `#f5f1eb`), large serif display face, muted terracotta or
sage accent, generous whitespace, small-caps eyebrows.

**Cluster B — Dark tech**
Near-black background (`#0a0a0a`), one acid accent (lime, cyan, violet), tight geometric sans,
subtle glow, gradient borders, grid backdrop.

**Cluster C — Broadsheet**
Off-white, hairline rules everywhere, centered masthead, all-caps tracked labels, dense
multi-column, one oversized numeral.

**Cluster D — AI Startup SaaS (2026 attractor, Persuade-mode)**
Near-black ground, single-screen hero-focused, modular Corporate-SaaS sections, one glowing gradient
divider, an abstract 3D / fluid element, and a "Designed for the AI era" class of copy. Evidence: on
reeoo this exact tag-set (`AI Startup` + `Dark Mode` + `Corporate SaaS` + `Hero-focused` + `Black`)
recurs across Respan, Factory, River, and Framer's 2026 rebuild — a *new* attractor, harder to catch
than Cluster B because it hides inside a plausible product page. Detection: dark ground **plus** any
two of {`ai-palette` gradient, `hero-blob`, "powered by AI / agentic / AI era" marketing voice,
`three-equal-cards` as the primary argument}. The escape is the same as for B — a Signature only
this brief could produce, plus real product copy instead of the "AI era" incantation.

Detection: if the Design Read anchor could be replaced by one of these three names without changing
the output, the direction was never chosen — it was defaulted into.

This does not mean these looks are banned. It means using one must be a **decision defended by the
brief**, and it must carry a Signature move that no other project would have.

The trickiest case is the ground color. The tinted off-white that reads as Cluster A is *also*
what every Awwwards winner uses (`#f3f0ed`, `#fdfbef`, `#f3eee0`) — the difference is intent.
A tinted ground **named by the brief** and paired with a Signature is design; an untinted cream
with no stated reason is default. Do not auto-flag a tinted ground — flag the *absence of a
decision behind it*. The positive language these clusters are flattened from lives in
`references/award-craft.md`.

---

## Surface-level tells

Individually forgivable. Three or more together and the interface reads as machine-made.

| Tell | Why it happens | Replacement |
|---|---|---|
| Three equal cards in a row, each with icon + heading + 2 lines | The most-represented layout in existence | Unequal weights: one dominant, two supporting; or a list; or a table. **A single 3-col grid used as a *secondary* info band far down the page is legitimate — it becomes slop only when it is the *primary* argument structure** (see `references/saas-landing.md` rule 8). |
| Gradient text on the headline | Trend-frequency artifact | Solid color; put any gradient in the background or a graphic element |
| Emoji as bullet points or feature icons | Cheap iconography | A real icon set, or numerals, or nothing |
| Glassmorphism on everything | Copied stylistic tic | Reserve translucency for genuinely overlapping layers |
| Rainbow/multi-hue gradient blobs behind the hero | Filler for empty space | Real content, a product shot, or deliberate emptiness |
| "Transform your workflow with AI-powered..." | Placeholder marketing voice | Concrete, specific, product-true copy |
| Perfectly uniform 24px gaps everywhere | No hierarchy decision made | Proximity-encoded spacing |
| Every card has the same shadow, radius, and border | No elevation model | 3 elevation levels used meaningfully |
| Icon + label for every action, always | Symmetry reflex | Icon-only where universal, label-only where clearer |
| Centered everything | Safe default | Left-align running text; center only short, deliberate blocks |
| Section-title + subtitle + grid, five times down the page | Template rhythm | Vary section shape: full-bleed, split, list, quote, table |
| Abstract 3D sphere / fluid blob as the hero visual | "Has a 3D budget but no content" | A real product state, a real work, or deliberate emptiness. Every genuine 3D case in the corpus has a *subject* (Teapot, a corn, a watch) |
| Fake agent / typing / "thinking…" animation | Performs capability instead of showing it | Show real product state (Linear's live issue stream, Zed's real lint errors), never a simulated conversation |
| Noun navigation and noun headings (`Features` / `Why Us` / `Benefits` / `Our Team`) | Safe, content-independent labels | Stance or outcome sentences (Porto Rocha: `Making Nike the running brand once again`) |
| Anonymous testimonials: avatar walls, "— CTO, TechCorp" with no link and no real name | Borrowed credibility | Named, role-tagged, linked quotes; a number with unit + window + subject |
| Inter / Geist for absolutely everything | Most-suggested font | Pick a face with a reason; see below |
| Lorem ipsum, "Feature One", "Card Title" | Content deferred | Write real domain copy in the first pass |
| `text-shadow` + heavy `box-shadow` + gradient + blur stacked | Effect accumulation | One effect at a time, with a purpose |

## Award-study red flags

From the same Awwwards source study that produced `references/award-craft.md` — these are the
winners' *tics* copied without the winners' intent. They convert award language into slop:

| Tell | Why it happens | Replacement |
|---|---|---|
| Dopamine multi-hue gradient (purple→pink→orange blob behind hero) | Filler for empty space, dressed up | Real content, a product shot, or deliberate emptiness |
| Acid/neon accent with no semantic binding (near-black ground + any high-sat color) | Copied Cluster B without the brief | One accent chosen by brand meaning, used ≤ 5% of area |
| Bento grid applied by reflex | Apple/Notion grids templated | Let content density shape the layout |
| Kinetic type abused (per-letter animation on body copy or nav) | "Motion = premium" misunderstanding | Reserve kinetic type for the hero; never body or nav |
| Default easing `ease` / `ease-in-out` / `linear` | Took the browser default | Hand-write one house curve (see `references/motion.md`) |
| "We have AI" stated as a brand value | Trend-chasing | A specific capability, never the adjective |

These are *slop* only when used without the decision a real brief would force. The same technique
with a stated reason is fine.

Note on fonts: across the corpus surveyed, Inter appears constantly — and roughly half of those
appearances are in *prohibition* lists, not recommendations. Inter is an excellent UI face. Using
it as the unexamined default is the problem, not the typeface.

---

## Structural tells

Deeper, and worse. Surface tells are cosmetic; these mean no design happened.

1. **Everything is equally important.** No dominant element, no rank-2, no ambient layer. Every
   heading is 24px semibold, every card equally weighted. A viewer's eye has nowhere to land.
2. **The layout is content-independent.** The same grid would hold a pricing page, a blog index,
   and a settings screen. Real layouts are shaped by their content.
3. **No negative space with intent.** Whitespace exists as leftover padding, never as composition.
4. **Density does not match the job.** Airy marketing spacing on a data table. Compressed rows on
   a hero.
5. **No Signature.** Nothing about it would be recognized again out of context.
6. **Only the happy path exists.** No empty, no error, no loading, no overflow.
7. **Copy is filler.** Design decisions were made against text that will be replaced, so the
   layout will break on contact with reality.
8. **A statistic with no provenance.** A number with no unit, no time window, and no subject
   (`10,000+ users`) is filler, not evidence. Real proof reads `US$1.9tn processed in 2025` /
   `99.999% uptime` / `160 countries`. The audit flags the round-invented form; the principle covers
   the subtler case too. See `references/saas-landing.md` rule 7.
9. **Navigation and headings are nouns, never stances.** `Features` / `Why Choose Us` / `Benefits`
   are content-independent labels — the same page would fit any product. Real IA uses outcome or
   position sentences. This is the single most reliable tell that no information architecture
   happened (reeoo corpus).

---

## Reference-broadening procedure

Run this when the direction feels generic, before writing any code. Cost: about two minutes of
thinking. Payoff: the difference between forgettable and specific.

**Step 1 — Name the default.** Write down the design *about* to be made. One sentence.
Explicitly mark it `Rejected:` in the Design Read.

**Step 2 — Leave the screen.** Source the anchor from outside web UI:

- Print: Swiss editorial, Japanese magazine layout, Penguin book covers, brutalist zines,
  1970s technical manuals, Chinese classical text layout (竖排, 天头地脚), railway timetables
- Environment: airport wayfinding, hospital signage, dashboard instrumentation, subway maps,
  museum labels, seed packets, hardware faceplates
- Material: risograph, letterpress, blueprint, enamel sign, CRT phosphor, thermal receipt paper,
  woodblock print
- Era: Memphis, Bauhaus, 90s CD-ROM, early Macintosh, Y2K chrome, Soviet constructivist poster

**Step 3 — Extract one mechanism, not the whole look.** The anchor is a source of *rules*, not a
skin. From a railway timetable: rigid column alignment, tabular figures, hairline rules only where
data changes category, zero decoration. That is a mechanism. "Make it look like a train schedule"
is cosplay.

**Step 4 — Define the Signature.** Exactly one move, stated concretely:
- A single oversized numeral anchoring each section
- All metadata in monospace at 12px, uppercase, one color
- Hard 1px rules and zero shadows, anywhere
- Every image duotoned to bg + accent
- One saturated accent used exactly three times per page and nowhere else
- Asymmetric 1/3 : 2/3 split held across every section, never centered

**Step 5 — Falsification.** Ask: could this exact output have been generated from a completely
different brief? If yes, the Signature is not doing work. Go back to Step 4.

---

## Fast de-slop pass

When handed an existing generic interface and asked to make it feel intentional, in order of
impact per unit of effort:

1. **Break the uniform grid.** Make one item dominant — 2x span, or a different treatment. Instant
   hierarchy.
2. **Fix spacing to encode grouping.** Tighten within groups to 8px, open between groups to 48px.
   Costs nothing, changes everything.
3. **Cut the palette to one accent.** Remove secondary accents; keep semantic colors only. Then use
   the accent 3 times, not 30.
4. **Replace placeholder copy with real copy.** Frequently forces layout changes that are
   themselves improvements.
5. **Add the Signature move.** One. Applied consistently.
6. **Delete one effect layer.** Remove gradients, or shadows, or borders — whichever is doing the
   least. Interfaces almost always improve.
7. **Set the type scale properly.** One ratio, real jumps between levels, body stays 16px.
8. **Give sections different shapes.** Break the title-subtitle-grid loop at least twice.

Report each change with its reason. "Increased section spacing 24→64px so the eye groups content
by section rather than reading one continuous stream" teaches; "improved spacing" does not.

---

## Calibration questions

Before shipping, answer honestly:

- If I removed the logo and the copy, would anyone recognize this project? — Signature test
- Which single element is the most important on this screen, and would a stranger point at the
  same one? — Hierarchy test
- Which decision here could only have come from *this* brief? — Specificity test
- What did I deliberately not do? — Discipline test
- Where does the eye go 1st, 2nd, 3rd — and is that the order the job requires? — Sequence test

If any answer is vague, the design is not finished. If all five are sharp, ship it.
