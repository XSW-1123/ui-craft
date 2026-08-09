# Surface Modes

Most bad interface decisions come from applying one mode's rules to another mode's surface:
marketing whitespace on a data table, dashboard density on a landing hero, product-UI motion in a
brand showcase.

Identify the mode in Phase 1. It sets defaults not to be fought without a reason.

---

## Persuade

Landing pages, pricing, product marketing, campaign pages, app store pages.

**Job:** move a stranger from "what is this" to one specific action.

| Parameter | Setting |
|---|---|
| Density | 2 — generous. Whitespace is the argument. |
| Motion | 2 — expressive allowed, still bounded by the frequency table |
| Hierarchy | Exactly one focal point per viewport |
| Type scale | 1.333 or 1.5. Display sizes are real display sizes (48-96px+) |
| Content width | 1100-1280px container; text blocks still capped at 65ch |

Rules:
- Copy **is** the design. Weak copy cannot be rescued by layout. Write the headline before the
  layout; if the headline is a placeholder, the design is a placeholder.
- One primary CTA, repeated verbatim. Not three competing buttons.
- Above the fold: what it is, who it is for, one action. Nothing else has to fit.
- Section shapes must vary. Five consecutive "title + subtitle + 3 cards" blocks is the template
  smell.
- Social proof needs specificity: a real number, a real name, a real logo. Vague credibility reads
  as no credibility.
- The fold is not sacred, but the first 600px determines whether the rest is read.

Failure modes: feature-list-as-page with no narrative; hero that says nothing concrete; every
section the same shape; decorative gradient blobs standing in for content.

---

## Operate

Dashboards, admin panels, settings, internal tools, editors, data tables, forms.

**Job:** let a returning user complete a known task with minimum friction.

| Parameter | Setting |
|---|---|
| Density | 4 — scan speed beats beauty. Rows 32-44px. |
| Motion | 1 — functional only, ≤ 150ms. Zero decorative animation. |
| Hierarchy | Consistent and predictable, not dramatic |
| Type scale | 1.2. Body 14-16px; labels 12-13px. |
| Content width | Full width. Fixed-width dashboards waste the user's monitor. |

Rules:
- Optimize for the 100th use, not the first. Delight fades; friction compounds.
- Keyboard first: shortcuts for frequent actions, tab order that matches the task, Enter submits.
- Every table: sortable where it makes sense, sticky header, tabular figures, right-aligned
  numbers, consistent decimal precision, and a visible row count.
- State coverage is not optional here. Empty, loading, error, partial, and permission-denied are
  daily occurrences, not edge cases.
- Destructive actions: separated spatially, confirmed, and undoable.
- Show data density honestly — do not paginate 12 rows into 3 pages for visual comfort.
- Persist user preferences: column widths, filters, sort order, collapsed sections.

Failure modes: marketing spacing applied to a table (3 rows per screen); animated transitions on
every filter change; hiding the primary action behind a hover; a "beautiful" dashboard that
requires four clicks for the daily task.

---

## Read

Documentation, articles, blogs, changelogs, knowledge bases, long-form reports.

**Job:** deliver text with the least possible resistance.

| Parameter | Setting |
|---|---|
| Density | 2 |
| Motion | 0 — none. Movement while reading is hostile. |
| Hierarchy | Typographic only. Size, weight, space. |
| Type scale | 1.2-1.25. Body 17-19px on desktop is often better than 16. |
| Content width | 60-75ch, hard cap |

Rules:
- Line-height 1.6-1.75 for body. Paragraph spacing ≥ 0.75em, no first-line indent on the web.
- One column. Multi-column body text on a scrolling screen forces vertical ping-ponging.
- Headings need clear rank and generous space above (roughly 2x the space below) so they attach to
  the section they open.
- Code blocks: monospace, horizontally scrollable rather than wrapped, with a copy button and
  visible language.
- Never wrap prose in cards. Cards fragment reading flow.
- Sticky elements must be small. A 96px sticky header eats a third of a phone screen.
- Anchor links on headings, and `scroll-margin-top` matching the sticky header height.
- Reading progress and TOC help; auto-scrolling TOC highlight is fine, TOC that jumps is not.

Failure modes: 1400px-wide text; card grids around articles; fade-in-on-scroll paragraphs; a font
chosen for personality at 15px.

---

## Experience

Portfolios, brand sites, showcases, interactive stories, launch pages, award submissions.

**Job:** produce a feeling and be remembered.

| Parameter | Setting |
|---|---|
| Density | 2 — composition needs air |
| Motion | 2-3 — motion is content here |
| Hierarchy | Deliberately unconventional, but still legible |
| Type scale | 1.5+. Extremes are the point. |
| Content width | Whatever the composition requires, including full bleed |

Rules:
- Asymmetry, overlap, and scale contrast are tools, not accidents. Use them intentionally, not
  everywhere.
- The floor still applies. Contrast, keyboard access, and reduced-motion are not stylistic
  choices. An unusable portfolio is a bad portfolio.
- Performance is part of the impression: a 12MB hero video that stalls destroys the effect it was
  meant to create.
- Give a way out. A user who wants information should be able to reach it without watching the
  whole experience.
- Reduced motion needs a designed static alternative, not a broken layout.
- One idea executed completely beats five ideas gestured at.

Failure modes: motion for its own sake; 8s of intro before content; unreadable text over video;
scroll-jacking; "creative" navigation nobody can operate.

---

## Mixed surfaces

Real products mix modes. Handle transitions explicitly rather than averaging them:

- **Marketing site with an app screenshot** — Persuade for the page, but the screenshot must show
  a real Operate-mode UI. Fake dashboards with 3 huge cards immediately read as fake.
- **App with an onboarding flow** — Onboarding is Persuade, the product is Operate. Distinct
  densities, shared tokens.
- **Docs inside a product** — Read mode content, Operate mode chrome. Do not let the app's dense
  spacing leak into the prose column.
- **Dashboard with an empty first-run state** — the empty state is Persuade: explain and invite.
  Once data exists, it is Operate.

Never average two modes into a compromise. Pick the mode per region and switch cleanly at the
boundary — a visible boundary is better than a muddy gradient between two densities.
