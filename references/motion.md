# Motion

The governing principle: **duration is a function of how often the user sees it.**

A page-load animation is seen once and can afford 600ms of character. A dropdown opens forty times
an hour and must be nearly instant. Judging animation by "does it look nice in isolation" is the
root cause of interfaces that feel sluggish after ten minutes of real use.

## Frequency table

| Frequency | Examples | Budget | Notes |
|---|---|---|---|
| Constant (per interaction) | hover, focus, press, checkbox, toggle | **≤ 120ms** | Should feel instantaneous. Often best with no easing curve worth naming. |
| Frequent (dozens/session) | dropdown, tooltip, tab switch, accordion, popover | **120-200ms** | `ease-out` on enter, faster or none on exit. |
| Occasional (a few/session) | modal, drawer, sheet, page transition, toast | **200-320ms** | Room for a considered curve. Exit ~30% faster than enter. |
| Rare (once/session) | onboarding, first-load hero, success celebration | **320-600ms** | Character is allowed here. This is the only place. |
| Continuous | loading spinner, progress, skeleton shimmer | steady, 1-1.5s loop | Must not compete for attention. Shimmer opacity delta ≤ 0.15. |

Corollary: **the more often something animates, the less animation it should have.** Most polish
comes from making frequent transitions shorter, not from adding new ones.

## Page type decides the motion budget

The `MOTION` knob (0–3) is a starting point; the *page type* within the mode fixes the ceiling. A
Persuade surface and an Experience surface with the same `MOTION 2` should not move the same way.
Mapping derived from the saaslandingpage.com / reeoo corpora (see `references/saas-landing.md`):

| Page type | Allowed vocabulary | Forbidden |
|---|---|---|
| Product / Landing (Persuade) | micro-interactions, hover/focus feedback, one-shot reveals | scroll takeover, immersive cursor, choreographed scroll cinema |
| Dashboard / Admin (Operate) | ≤150ms functional transitions only | entrance animation, scroll-linked motion |
| Portfolio / Brand (Experience) | scroll animation, immersive cursor, reveals | kinetic type on body or nav, motion that buries content |
| Documentation / Blog (Read) | near-zero; maybe a 100ms opacity fade | anything scroll-triggered |

The hard numbers: hover/focus ≤120ms; scroll reveals fire **once**, transform+opacity only, travel
≤24px; a looping product demo must be pausable and must stop when off-screen; **scroll-jacking is
banned on Persuade surfaces** — it breaks the reader's control of their own conversion path.

### Fake motion is not motion

A simulated "agent thinking", a typed-out reply with no real input behind it, a progress bar with no
real task — these are *invented content*, not animation, and they are slop (see
`references/anti-slop.md` Cluster D, `references/saas-landing.md` rule 6). Show real product state
instead. The audit cannot see these; flag them under *Needs eyes*.

## Easing

| Curve | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(.2, 0, 0, 1)` | Entrances. Default for ~80% of UI. Fast start, soft landing. |
| `ease-in` | `cubic-bezier(.4, 0, 1, 1)` | Exits, and only exits. Applied to an entrance it feels broken. |
| `ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` | Movement between two visible positions. |
| Spring | `cubic-bezier(.34, 1.56, .64, 1)` | Direct manipulation, drag release, playful confirmations. Overshoot must be small. |
| `linear` | — | Only for continuous rotation, progress, and color-only crossfades. |

Never use the browser default `ease` (`cubic-bezier(.25,.1,.25,1)`) deliberately — it is
symmetrical and reads as mushy. Never use `ease-in` for something appearing: the user perceives
lag before the motion begins.

Spring physics (Framer Motion / Motion One) beats bezier for anything the user drags, because
velocity carries over from the gesture. For everything else, bezier is cheaper and more
predictable.

### Winner curve library

A source-level study of Awwwards-winning sites found **not one** that wrote `ease` /
`ease-in-out` / `linear` as-is. They hand-tune beziers, almost all "fast-start, soft-landing"
with a zero end-derivative (the motion arrives and settles without a visible stop). Build from
these rather than the browser default:

| Curve | Value | Character |
|---|---|---|
| Expo-out | `cubic-bezier(.19, 1, .22, 1)` | Hard launch, long soft tail — the workhorse |
| Quart-out | `cubic-bezier(.77, 0, .175, 1)` | Sharper settle than expo |
| Custom A | `cubic-bezier(.86, 0, .07, 1)` | Near-symmetric, decisive |
| Custom B | `cubic-bezier(.18, .78, 0, 1)` | Snappy open, long close |
| Custom C | `cubic-bezier(.87, 0, .13, 1)` | Gentle open, firm close |
| Custom D | `cubic-bezier(.75, 0, .25, 1)` | Balanced; good for reveals |

Write **one** house curve per project and reuse it. A default `ease` is a slop tell (the
bundled audit flags it).

## Distance and duration

Duration scales with travel distance, sublinearly:

| Travel | Duration |
|---|---|
| < 40px (small state change) | 100-150ms |
| 40-200px (dropdown, popover) | 150-250ms |
| 200-600px (drawer, sheet) | 250-350ms |
| Full viewport | 300-450ms |

Never exceed 400ms for anything on the interaction critical path, regardless of distance. If a
full-screen transition needs to feel slower, move fewer pixels instead of extending time.

## What may be animated

Every animated property lands in one of three stages. Knowing which one is the whole skill:

| Stage | Properties | Cost per frame |
|---|---|---|
| **Composite** | `transform`, `opacity` | GPU only. Free at 60fps. |
| **Paint** | `color`, `background`, `border-color`, `box-shadow`, gradients, masks, `filter` | Repaints the layer. Acceptable on small, isolated elements. |
| **Layout** | `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`, flex/grid values | Recomputes geometry, then repaints, then composites. Never in a loop or on scroll. |

**Safe:** composite properties, always. **Conditional:** paint properties on small surfaces, for
one-shot effects. **Unsafe:** layout properties on anything the user will notice.

Three further traps that look safe and are not:

- **Do not animate a CSS custom property** that feeds `transform`, `opacity` or position. Registered
  properties interpolate on the main thread and forfeit compositing.
- **Never animate an inherited custom property.** Every descendant that reads it is invalidated on
  every frame. Scope animated variables to the element that uses them.
- **Do not mix two animation systems** that each measure or mutate layout on the same element
  (a GSAP tween plus a Motion `layout` prop, for example). They will fight over the same frame.

### Blur and filters

`filter: blur()` is paint-heavy and scales with the blurred area, not the blur radius.

- Keep animated blur ≤ 8px, one-shot, on a small surface.
- Never animate blur continuously, and never on a full-screen or large `backdrop-filter` surface.
- Reach for `opacity` and `translate` first. A crossfade usually reads the same and costs nothing.

Common substitutions:

| Instead of | Use |
|---|---|
| `height: 0 → auto` | `grid-template-rows: 0fr → 1fr`, or measure and animate `transform: scaleY` with a counter-scaled child, or `max-height` with a known bound |
| animated `box-shadow` | a pseudo-element with the shadow, animate its `opacity` |
| `left/top` movement | `transform: translate()` |
| `width` growth | `transform: scaleX()` plus a counter-scaled child for text |
| `background-position` sweep | `transform: translateX` on an overlay layer |

`will-change` promotes a layer but costs memory. Apply just before the animation, remove after.
Never leave `will-change: transform` on hundreds of elements.

## Reduced motion

Mandatory. Not a nice-to-have — vestibular disorders make parallax and large-scale movement
physically unpleasant.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The blanket rule is the safe floor. Better: keep short opacity fades (≤ 100ms) so state changes
remain legible, and remove only transforms, parallax, and auto-playing loops. State changes that
become instantaneous can be *harder* to follow, so preserve a minimal cue.

In JS, read the preference rather than assuming:

```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## Choreography

When several elements animate together:

- **Stagger** 20-50ms between siblings. Below 20ms it reads as simultaneous; above 60ms it reads
  as a queue and feels slow.
- Cap the total stagger sequence at ~300ms. For long lists, animate only the first ~6 items and
  let the rest appear.
- **Enter and exit are not mirrors.** Exit should be 20-40% faster; the user has already decided.
- **Origin matters.** A dropdown should scale from the trigger's edge (`transform-origin`), not
  from its own center. A sheet enters from the edge it lives on.
- One thing moves at a time in a functional flow. Simultaneous unrelated motion is noise.

## Scroll-triggered animation

Highest slop risk in the entire motion category.

- Prefer CSS **Scroll and View Timelines** (`animation-timeline: view()`) where supported — they run
  off the main thread and cannot jank. Fall back to `IntersectionObserver`.
- Never drive animation from `scrollY`, `scrollTop`, or a `scroll` event handler. Never poll scroll
  position inside `requestAnimationFrame`.
- Every `requestAnimationFrame` loop needs a stop condition. An rAF loop with no exit is a battery
  drain that survives navigation.
- Pause looping and scroll-linked animation when the element leaves the viewport
  (`IntersectionObserver` → `animation.pause()`). Off-screen motion costs the same as on-screen.
- Animate **once**. Re-triggering on scroll-up is nauseating.
- Threshold ~0.15, and start slightly before the element is fully visible.
- Total distance ≤ 24px, duration ≤ 400ms. Large fly-ins from off-screen are the signature of a
  template.
- Never gate content on animation: text must be readable if JS fails. Set the final state as the
  default and let JS add the "animate from" class.
- Never hijack the scroll wheel. Scroll-jacking breaks keyboard, trackpad momentum, and
  accessibility all at once.

## Loading and perceived performance

- 0-100ms: no indicator. Showing one makes it feel *slower*.
- 100ms-1s: inline indicator, no layout shift. Skeleton preferred over spinner because it
  communicates shape.
- 1-10s: progress with meaningful text ("Uploading 3 of 12"), never a bare percentage that lies.
- 10s+: allow the user to leave and be notified.

Skeletons should match the real content's geometry. Generic gray bars that do not match what
arrives cause a visible jolt, which is worse than a spinner.

Optimistic updates beat every animation trick: applying the change immediately and reconciling
later removes the wait entirely. Always provide rollback with a clear message.

## Boundaries when fixing someone else's motion

- **Do not migrate animation libraries.** If the project uses GSAP, fix it in GSAP. Swapping to
  Motion added from preference is a rewrite disguised as a fix, and a half-migrated codebase is
  worse than the original problem.
- **Do not partially convert an API.** Within one component, one style.
- **Downgrade the technique before removing the motion.** A janky 600ms parallax becomes a 200ms
  opacity fade, not nothing. Deleting motion the designer intended is not a performance fix.
- **State the constraint behind any non-default choice.** "300ms because the sheet travels the full
  viewport" is reviewable. "300ms felt right" is not.

## Reveals, not fade-up

A bare `translateY(20px)` + `opacity` entrance is the signature of a template. The Awwwards
winners use one committed reveal technique per project:

- **Rounded clip-path wipe** — `inset(0% 100% 0% 0% round .25em)` → `inset(0% round .25em)`.
  The `round` keeps corners crisp through the wipe; a plain rectangle wipe reads cheaper.
- **Blur focus** — `filter: blur(10px)` → `0`, staggered 50/100/150ms across siblings. Reads as
  the element "coming into focus" rather than "appearing".
- **Mask scale** — a logo- or shape-shaped `mask` opens (mask-size grows) to reveal video/content.
- **Word-mask push** — each word slides up from behind a clip (SplitText-style), one after another.

Pick one. A fade-up is acceptable only for low-stakes, frequent UI (a tooltip); never for a
hero or a section entrance.

## Scroll takeover is infrastructure *(Experience mode only)*

On scroll-driven sites, smooth scroll (Lenis or equivalent) plus scroll-linked values is the
expected baseline, not a flourish. Winners bind motion to scroll *progress* (a `--scroll`
custom property or ScrollTrigger), not to a fixed timeline. Pair it with the Scroll and View
Timeline guidance in the section above, and always provide a `prefers-reduced-motion` path.

**Scope caveat:** this is an Experience-mode baseline. On a Persuade / Operate surface, scroll
takeover is banned — it costs conversion and breaks keyboard/trackpad control (see "Page type
decides the motion budget" above). Do not import it into a SaaS landing page just because an
award site used it.

## Context cursors

A custom cursor is a *per-region* design object, not a site-wide switch. Winners ship multiple:
Produx has 3 (site / showreel / project), Serotoninn has 6 (one per section), No Art a `cursor-bubble`.
When adding one, decide what each zone needs differently — a project tile wants a "view" label,
a video wants a play state, body text wants none. Never leave a global custom cursor with no
zone logic; on touch / `pointer: coarse` it must fall back to the native cursor.

## Review checklist

- [ ] Every animation classified by frequency; duration within budget
- [ ] `ease-out` for entrances, `ease-in` for exits, no default `ease`
- [ ] Only `transform` and `opacity` animated
- [ ] `prefers-reduced-motion` handled, and tested by toggling it
- [ ] Exit faster than enter
- [ ] Stagger 20-50ms, total ≤ 300ms
- [ ] Scroll animations fire once, ≤ 24px travel, content readable without JS
- [ ] No `will-change` left permanently applied
- [ ] Tested at 6x CPU throttle — still smooth
- [ ] Used the interface for two minutes straight; nothing became annoying
