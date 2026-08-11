# ui-craft

A **skill** for building, refining, and
auditing web interfaces **without the default "AI look."**

It locks a visual direction, enforces a quantified quality floor (WCAG contrast, focus, motion,
states), and — most importantly — treats the generic LLM aesthetic as a **hard failure mode**
through a measurable **Slop Index**.

> Built to answer one brief: *make it look designed, not generated.*

---

## Why this exists

Most AI-generated UI collapses into one of four overfit looks — cream + serif, near-black +
neon, broadsheet hairlines, and the 2026 "AI Startup SaaS" dark+neon+AI-era trap — and ships the
same tells: gradient text, three equal cards, emoji icons, invented stats, Inter-everything.
`ui-craft` catches those mechanically and **refuses to pass a generated-looking interface even when
the accessibility floor is already clean.**

## What's inside

| Path | Purpose |
|---|---|
| `SKILL.md` | The skill definition — triggers, workflow, iron rules, and the anti-slop gate |
| `references/` | 10 deep-dive docs: `evidence`, `tokens`, `floor`, `motion`, `modes`, `anti-slop`, `award-craft` (Experience language), `saas-landing` (Persuade language), `redesign`, `gotchas` |
| `scripts/audit.mjs` | Zero-dependency static auditor; computes real WCAG ratios and the Slop Index |
| `scripts/score.mjs` | Numeric craft score with a breakdown, Slop gate applied |
| `assets/` | `DESIGN.md.tmpl`, `tokens.css.tmpl` starters |

## Install

1. Copy this folder into your user skills directory:
   - **macOS / Linux:** `~/skills/ui-craft/`
   - **Windows:** `%USERPROFILE%\skills\ui-craft\`
2. Or import `ui-craft.zip` from the skill manager.

The skill then triggers automatically on UI requests, or call it explicitly with
`@skill:ui-craft`.

### Standalone (no agent required)

The two scripts run on **any** frontend codebase with Node 18+:

```bash
node scripts/audit.mjs path/to/src            # findings; exit code = BLOCKING count
node scripts/audit.mjs path/to/src --strict   # also fail CI when Slop Index >= 10
node scripts/score.mjs path/to/src            # scored breakdown, Slop gate applied
```

## The Slop Index (the anti-AI-slop gate)

`audit.mjs` sums weighted default-look markers — gradient text, framework-default palettes,
emoji-as-icon, three equal columns, invented stats, marketing filler, the four attractor
clusters (incl. AI Startup SaaS), and uniform spacing — then normalises by project size into one number:

| Slop Index | Meaning |
|---|---|
| 0–4 | designed |
| 5–9 | drifting toward the default |
| 10–19 | reads as generated |
| 20+ | is the default |

A Slop Index of **10 or more blocks shipping** regardless of the floor score:

- `score.mjs` caps the total and overrides the verdict.
- `audit.mjs --strict` returns a non-zero exit code, so it can **gate CI**.

## Workflow

1. **Lock** — emit the *Design Read* (job, mode, audience, emotion, anchor, signature, palette, type).
2. **Build** — tokens first, structure before surface, full state coverage, real copy.
3. **Verify** — Pass 1 fixes floor violations. Bounded: two passes, then report honestly.

See `SKILL.md` for the full protocol and `references/` for each topic.

## Provenance

Synthesised from a survey of **33 open-source UI skill repositories** (2,343 `SKILL.md` files
read, 141 high-signal skills analysed in full), plus a quantified study of **950 SaaS landing
pages** (saaslandingpage.com) and **60+ Persuade/Experience cases** (reeoo.com). Notable influences:

| Source | Contribution |
|---|---|
| `anthropics/skills` — `frontend-design` | Three-cluster anti-calibration |
| `vercel-labs/web-interface-guidelines` | MUST / SHOULD / NEVER + quantified thresholds |
| `pbakaus/impeccable` | Verify-vs-refuse, bounded verification |
| `emilkowalski/skill` | Motion frequency table |
| `leonxlnx/taste-skill` | Three-knob parameterisation, Design Read |
| `tw93/waza` | Mode routing, symptom→gotcha table, Chinese triggers |
| `dammyjay93/interface-design` | Token naming test, 60/30/10, count ceilings |
| `conardli/garden-skills` | Five knobs, style-school library |
| `saaslandingpage.com` (950 cases) | Persuade-mode baseline: 2-color palette median, 4.1% dark, product-as-hero, layered proof |
| `reeoo.com` (60+ cases) | Experience/Persuade split; Cluster D (AI Startup SaaS); structural > visual differentiation |

## License

[MIT](LICENSE) — free for personal and commercial use.

---

## 中文说明

`ui-craft` 是一个用于网页 UI 设计 / 美化 / 审查的技能。它的核心卖点不是"更漂亮"，而是
**绝对不能有 AI 味**：内置的反 AI 味门控（Slop Index）会把渐变标题、框架默认配色、emoji 图标、
三等宽卡片、虚构数据、四大默认聚类（含 AI Startup SaaS）、均匀间距等"生成腔"加权求和成一个数，≥10 就判定为"生成味"，
评分会被压低、评语被覆盖，`--strict` 模式下直接让 CI 失败。

- **安装**：把整个 `ui-craft/` 文件夹复制到 `~/skills/ui-craft/`（Windows 为
  `%USERPROFILE%\skills\ui-craft\`），或在技能管理器里导入 `ui-craft.zip`。
- **使用**：对话里 `@skill:ui-craft`，或直接说"美化界面 / 审查 UI / 有 AI 味"等；也可以单独跑
  `scripts/audit.mjs` 与 `scripts/score.mjs`。
- **协议**：MIT。
