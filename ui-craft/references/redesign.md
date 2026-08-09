# Redesign Protocol

Improving an existing interface is a different job from creating one. The failure mode is not ugly
output — it is a rewrite that breaks working behavior, discards accumulated fixes, and cannot be
reviewed.

**Governing rule: change the smallest set of things that produces the largest perceived
improvement, and be able to explain every change.**

---

## Step 0 — Do not rewrite

Before touching anything:

- Read the existing code. Identify the styling system already in use (Tailwind, CSS Modules,
  styled-components, plain CSS, a component library). **Match it.** Introducing a second styling
  paradigm is a net negative regardless of how much better it is.
- Find existing tokens, theme files, or a `DESIGN.md`. If they exist, they are the constraint —
  extend, do not replace.
- Identify what is intentional. Odd-looking decisions are often load-bearing: a cramped row height
  because 50 rows must fit; a weird breakpoint because of a real device; an ugly warning banner
  because of a support escalation.
- Ask what must not change: brand colors, existing URLs, keyboard shortcuts, DOM hooks used by
  tests or analytics, class names other code depends on.

If the request is "make it prettier" and the codebase has no system at all, the first deliverable
is a token file, not a redesign.

---

## Step 1 — Diagnose in writing

Never start editing from a vague sense that it looks bad. Produce a diagnosis first — this is what
makes the work reviewable.

```
DIAGNOSIS
Mode:        <Persuade|Operate|Read|Experience> — and whether the current design matches it
Blocking:    <floor violations: contrast, focus, targets, keyboard>  [must fix]
Structural:  <hierarchy, spacing logic, layout shape>                [high impact]
Systemic:    <token chaos: N grays, M spacing values, K fonts>       [high impact]
Surface:     <color, radius, shadow, typography details>             [low risk]
Content:     <placeholder copy, unrealistic data, missing states>
Intentional: <things that look wrong but are not — leave alone>
```

Run `scripts/audit.mjs` to populate the Blocking and Systemic sections with numbers instead of
impressions.

---

## Step 2 — Order of operations

Strictly in this order. Each layer is cheap to verify before the next lands on top.

**1. Floor violations.** Contrast, focus, targets, keyboard, reduced-motion. Mechanical, low risk,
non-negotiable. Do these even if the user only asked for "prettier".

**2. Spacing.** The single highest ratio of perceived improvement to risk. Collapse the spacing
values to one scale, then re-encode grouping by proximity: tighten within groups, open between
groups. Nothing moves in the DOM; the page looks reorganized.

**3. Typography.** One scale, one ratio, body at 16px, line-height 1.5+, measure capped at 65-75ch,
tabular figures on numbers. Also nearly zero structural risk.

**4. Color consolidation.** Inventory every color in use, cluster near-duplicates, map to semantic
roles, reduce to one accent. Verify contrast after every substitution.

**5. Hierarchy.** Now make one element dominant per view and demote the competitors. This is the
first step that changes composition, so it comes after the safe layers.

**6. States and content.** Add the missing empty / error / loading / overflow states. Replace
placeholder copy with real copy. Frequently exposes layout bugs — which is the point.

**7. Signature.** Only now add the one memorable move. Applied to an unfixed foundation, it reads
as decoration on a mess.

**8. Motion.** Last. Never a substitute for any of the above.

If the budget runs out, stopping after step 3 still leaves the interface substantially better.
Stopping after step 7 with steps 1-2 skipped leaves it prettier and still broken.

---

## Step 3 — Change discipline

- **One layer per commit / per diff.** Do not mix a color migration with a layout change; neither
  can be reviewed or reverted independently.
- **Preserve the DOM where possible.** A CSS-only improvement is worth more than a marginally
  better result that rewrites the markup, because it cannot break behavior, tests, or analytics.
- **Never delete code not understood.** That defensive `overflow: hidden` probably fixed
  something. Find out before removing it.
- **Keep class names other systems depend on.** Test selectors, analytics hooks, third-party
  integrations.
- **Do not upgrade dependencies as part of a visual pass.**
- **Do not introduce a component library** unless explicitly asked. Adding one to "improve" three
  components is a migration disguised as a redesign.

---

## Step 4 — Report as a diff of reasons

Every change gets a reason tied to an effect. This is what separates a redesign from a reskin.

```
CHANGED
Floor:      contrast on --text-muted 3.1:1 -> 4.6:1 (#8a8a8a -> #6b6b6b)
            added :focus-visible to 7 interactive elements (was outline:none)
            card action targets 32px -> 44px via padding, visual size unchanged
Spacing:    collapsed 23 distinct spacing values to a 9-step 4px scale
            section gaps 24px -> 64px, intra-card gaps 16px -> 8px
            reason: grouping was invisible; the eye read one continuous stream
Type:       one 1.25 scale; body 14px -> 16px; measure capped at 68ch
            reason: mobile Safari was zooming on input focus; lines ran to 110ch
Color:      31 unique colors -> 9 semantic tokens, single accent
Hierarchy:  promoted the primary metric to 2-column span; demoted 3 sibling cards
States:     added empty and error states to the table (previously happy-path only)
Signature:  hard 1px rules replace all shadows; oversized section numerals

UNCHANGED (deliberately)
            row height 32px — density requirement, 50 rows must fit
            brand orange — locked by brand guidelines
            legacy .js-export-btn class — used by analytics

NEEDS EYES
            real-device touch check on the compact toolbar
            dark-mode screenshot review: the tinted borders are a judgment call
```

---

## Special cases

**"Make it look like <product>"** — extract mechanisms, not screenshots. Linear's quality comes
from a restricted palette, a strict 8px grid, tight 120ms transitions, and consistent 1px borders —
not from its specific purple. Name the three mechanisms being borrowed.

**"Just make it modern"** — undefined. Run Phase 1 direction locking and present the Design Read
for confirmation before writing code. Guessing here wastes the whole budget.

**"Fix the mobile view"** — usually not a styling problem: fixed widths, missing `min-width: 0` on
flex children, `100vh`, hover-only affordances, unreachable targets, and `overflow-x`. Diagnose
first at 320px.

**Third-party component library in the way** — theme it through its documented token/CSS-variable
API. Overriding its internals with `!important` and descendant selectors creates a maintenance
liability that outlives the visual gain. If the library genuinely cannot express the design, say so
explicitly rather than fighting it silently.

**Inherited design system, one screen to add** — set `VARIANCE 1`. The job is to be
indistinguishable from the existing work, not to be better than it. Consistency outranks local
quality improvements.
