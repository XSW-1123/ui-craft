# Evidence Protocol

Applies to every **Audit**, **Refine**, and **De-slop** route. Not to **Create** — there is nothing
to prove when nothing exists yet.

The failure mode this prevents: an agent asked to "review this UI" returns twenty confident
findings, half of which are invented, restated, or unfixable. That output is worse than silence,
because the user must now verify each one by hand.

**The governing rule: prefer no finding to an unsupported one.**

---

## 1. Candidates are not findings

Any observation starts as a **candidate**. Search hits, repetition, "this looks off", a value that
differs from a neighbor — all candidates. A candidate becomes a finding only after passing all
three proofs below, in order. Fail any one, discard it. Do not weaken a proof to save a candidate
that reads as off.

### Proof 1 — Contract

Cite the binding rule this violates. One of:

- an explicit line in `DESIGN.md`, the project style guide, or repository guidance
- a named token, variant, or primitive the code should have used and did not
- a **MUST** or **NEVER** from `floor.md` (these are binding by default)
- a direct self-contradiction inside the same user task (two labels for one action; a control
  that is disabled on one path and enabled on another)

Not a contract: "prefer", "generally", "best practice", a name that sounds similar, the absence of
something, repetition, or personal taste. If the only support is "I would have done it differently",
there is no contract.

### Proof 2 — Reach

Prove the cited rule and the offending code both reach the surface under audit. Trace it:
route → layout → composition → component → resolved token → rendered style.

A connection must be established by rendering, imports, props, resolved config, CSS inheritance, or
a generated artifact the surface loads. Shared naming, sibling directories, and conceptual
similarity establish nothing. Exclude other apps, previews, generated registries, legacy
directories, and unused variants unless they are on the traced path.

### Proof 3 — Correction

State the **one** change the evidence requires. Name the exact token, variant, or primitive to use.

Discard the candidate if:

- the evidence permits more than one valid correction
- the correct value cannot be determined from evidence
- fixing it requires inventing product intent ("the CTA should probably be green")
- another surviving finding has the same root cause

---

## 2. Falsify before reporting

Re-open every cited source and actively try to break the finding. Delete it when:

- the problem does not exactly match the cited line
- the rule does not govern that property on that surface
- counterevidence shows the difference is deliberate (a documented exception, a variant that exists
  for this case, a comment explaining it)
- it duplicates another finding's root cause

Only survivors enter the report. Expect to delete more than survive; that is the protocol working,
not failing.

---

## 3. Grade on two axes, never one

Severity and confidence measure different things and must not be collapsed into a single "priority"
number. A finding can be critical-but-unconfirmed, or certain-but-cosmetic. The user needs both to
decide.

**Evidence basis**

| Mark | Meaning |
|---|---|
| ● verified | Deterministic, computed or quoted. A contrast ratio from token values. A missing `label`. |
| ◐ flagged | Evidence captured, judgment required. Hierarchy feels wrong; spacing reads as ungrouped. |
| ○ human-required | Needs a rendered page, a real device, or assistive technology. Hand it off; do not simulate it. |

**Severity**

| Level | Meaning |
|---|---|
| critical | Blocks a core task. Keyboard cannot reach submit. Text is unreadable. |
| serious | Major barrier or clear defect, task still completable. |
| moderate | Friction or visible inconsistency. |
| minor | Polish. |

Never present ◐ or ○ as ●. Overstating confidence is the fastest way to make an audit worthless.

---

## 4. Three findings maximum

Order survivors by severity, then reach (how many surfaces), then correction cost. **Report the top
three. Discard the rest without mentioning them.**

This is not a formatting preference. A twenty-item list gets skimmed and abandoned; three ranked
items get fixed. If more than three survive, the extras will still be there next audit.

Then name exactly one as **Fix first** — highest leverage, strongest evidence. Never combine two
findings into one recommendation.

---

## 5. Report shape

```markdown
## Audited
Surface:   <the one surface traced>
Governed by: <DESIGN.md | tokens.css | floor.md | none found>
Method:    <static read | static + rendered | rendered only>

## Findings
| # | Problem | Evidence | Correction | Basis | Severity |
|---|---|---|---|---|---|

## Fix first
<one finding, and the reason it outranks the others>

## Needs eyes
<checks that could not be settled from source, with the specific thing to look at>
```

Delete any row missing a column. If nothing survives, write exactly:

```
No supported findings. Checked: <what was traced>. Not checkable from source: <what needs a human>.
```

That is a complete, correct, valuable answer. Do not pad it with observations that failed the gate.

---

## 6. Boundaries

**Audit is read-only.** Do not edit product source during an audit. Do not install dependencies,
run formatters, or touch the working tree. Report, then ask which findings to implement.

If the user says "review and fix", that is two operations: run the audit, present the three
findings, then implement the selected ones. Presenting the plan first costs one message and
prevents rewriting code the user did not want touched.

**No proxies.** If a check requires a rendered page or a screen reader and neither is available, say so
under *Needs eyes*. Do not infer a rendered result from source and label it verified.

**Undetermined is a valid verdict.** Per-criterion outcomes are `pass`, `fail`, or `undetermined`.
Forcing every check into pass/fail manufactures false confidence.

---

## 7. The no-op pass

Before returning any document or report, delete every sentence that does not change a decision.

Delete on sight: "be thorough", "keep it polished", "use good judgment", "consider the user
experience", "ensure consistency", and any restatement of a table in prose.

Test each sentence: *if the reader deleted this, would they do anything differently?* If no, it is
noise. This applies to `DESIGN.md`, audit reports, and this skill's own output.
