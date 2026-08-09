#!/usr/bin/env node
/**
 * ui-craft score - turns an audit into a craft score with a breakdown.
 *
 * Usage:
 *   node score.mjs [path] [--json]
 *
 * Wraps audit.mjs (--json) so the rules live in exactly one place.
 * The score is a diagnostic, not a grade. Use the breakdown, not the number.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const target = argv.find((a) => !a.startsWith('--')) || '.';

let data;
try {
  const out = execFileSync(process.execPath, [path.join(here, 'audit.mjs'), target, '--json'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  data = JSON.parse(out);
} catch (e) {
  // audit exits non-zero when BLOCKING findings exist; stdout is still valid
  const out = e.stdout && e.stdout.toString();
  if (!out) { console.error('ui-craft score: audit failed\n' + (e.message || e)); process.exit(1); }
  data = JSON.parse(out);
}

const f = data.findings;
const s = data.summary;
const countRule = (...ids) => f.filter((x) => ids.includes(x.rule)).length;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ---------------------------------------------------------- dimensions */

// 1. Floor (35) - accessibility and correctness. Steepest penalty: these are bugs.
const blocking = s.blocking;
const floor = clamp(35 - blocking * 5, 0, 35);

// 2. System (20) - token convergence. Measures whether decisions were made once.
const colorPen = clamp((s.uniqueColors - 12) * 0.6, 0, 8);
const spacePen = clamp((s.uniqueSpacings - 9) * 0.5, 0, 6);
const fontPen = clamp((s.fonts.length - 2) * 2, 0, 3);
const sprawlPen = countRule('shadow-sprawl', 'radius-sprawl') * 1.5;
const system = clamp(20 - colorPen - spacePen - fontPen - sprawlPen, 0, 20);

// 3. Craft (20) - the WARN band: typography, layout, state discipline.
const craftWarns = f.filter((x) => x.sev === 'WARN').length;
const craft = clamp(20 - craftWarns * 2, 0, 20);

// 4. Originality (15) - distance from the default LLM aesthetic.
// Reuse the Slop Index audit.mjs already computed (weighted sum of default
// markers, normalised per 10 files) rather than re-counting a stale rule subset.
// This keeps the score and the audit on exactly one rule set.
const slopIndex = s.slopIndex || 0;
const originality = clamp(15 - slopIndex, 0, 15);

// 5. Content (10) - real copy, real states.
const contentPen = countRule('placeholder-copy') * 5;
const content = clamp(10 - contentPen, 0, 10);

const total = Math.round(floor + system + craft + originality + content);

/*
 * Slop gate. The Slop Index is the single most important number for the
 * core requirement that AI-default looks never ship. A technically perfect
 * interface can still be 100% generated; that must not read as "solid".
 * When the index reaches the "generated"/"default" bands it caps the score
 * and overrides the band, so the verdict is honest regardless of the other
 * dimensions. (The Originality dimension still shows the same number; this
 * is the extra penalty that prevents a slop UI from hiding behind it.)
 */
let slopCap = 0, slopVerdict = '';
if (slopIndex >= 20) {
  slopCap = 35; slopVerdict = 'Default. This is generated, not designed - rewrite the surface before any polish.';
} else if (slopIndex >= 10) {
  slopCap = 55; slopVerdict = 'Generated. The system may be sound but the surface reads as the default - run the Signature and redesign protocols.';
}
const cappedTotal = slopCap ? Math.min(total, slopCap) : total;

const band =
  slopVerdict ? slopVerdict :
  cappedTotal >= 90 ? 'Shippable. Remaining items are judgment calls.' :
  cappedTotal >= 75 ? 'Solid. Fix the blocking items and it ships.' :
  cappedTotal >= 55 ? 'Functional but unsystematic. Run the redesign protocol steps 1-4.' :
  cappedTotal >= 35 ? 'Structural problems. Tokens and floor before any visual work.' :
                      'No system present. Start from Phase 1 direction locking.';

/* ------------------------------------------------------------- output */

const dims = [
  ['Floor      ', floor, 35, blocking ? `${blocking} blocking violation(s)` : 'clean'],
  ['System     ', system, 20, `${s.uniqueColors} colors, ${s.uniqueSpacings} px values, ${s.fonts.length} fonts`],
  ['Craft      ', craft, 20, `${craftWarns} warning(s)`],
  ['Originality', originality, 15, slopIndex ? `Slop Index ${slopIndex} - ${s.slopBand}` : 'no default-cluster markers'],
  ['Content    ', content, 10, contentPen ? 'placeholder copy present' : 'no placeholder copy found'],
];

if (asJson) {
  console.log(JSON.stringify({
    total, cappedTotal, slopIndex, slopBand: s.slopBand, band,
    dimensions: Object.fromEntries(dims.map(([n, v, m, note]) => [n.trim(), { score: +v.toFixed(1), max: m, note }])),
    summary: s,
  }, null, 2));
} else {
  const B = '\u001b[1m', D = '\u001b[2m', R = '\u001b[0m';
  const bar = (v, m) => {
    const w = 24, n = Math.round((v / m) * w);
    return '\u2588'.repeat(n) + D + '\u2591'.repeat(w - n) + R;
  };
  console.log(`\n${B}ui-craft score${R}  ${D}${s.files} files${R}\n`);
  for (const [name, v, m, note] of dims) {
    console.log(`  ${name} ${bar(v, m)} ${String(Math.round(v)).padStart(2)}/${m}  ${D}${note}${R}`);
  }
  if (slopCap) {
    console.log(`\n  ${B}TOTAL      ${total}/100${R}  ${D}capped to ${cappedTotal} by Slop Index ${slopIndex}${R}`);
  } else {
    console.log(`\n  ${B}TOTAL      ${total}/100${R}`);
  }
  console.log(`  ${band}\n`);
  console.log(`${D}  A score is a diagnostic, not a verdict. Taste is not measurable;`);
  console.log(`  systematic sloppiness is. Read the breakdown, run audit.mjs for detail.${R}\n`);
}

process.exit(0);
