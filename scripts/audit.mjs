#!/usr/bin/env node
/**
 * ui-craft audit - static quality-floor checker for web UI source.
 *
 * Usage:
 *   node audit.mjs [path] [--json] [--quiet] [--strict]
 *
 * Zero dependencies. Node 18+.
 * Scans .css .scss .html .jsx .tsx .vue .svelte .astro
 *
 * Reports four severities:
 *   BLOCKING - quality-floor violation, must fix
 *   WARN     - very likely a defect, needs a reason to keep
 *   SLOP     - marker of the default LLM aesthetic; feeds the Slop Index
 *   INFO     - systemic signal (token sprawl)
 *
 * Output is a candidate list, not a findings list. Every hit still has to be
 * proven to reach a rendered surface before it is reported - references/evidence.md.
 *
 * Exit code = BLOCKING count (capped at 250), so it can gate CI.
 * With --strict, a Slop Index of 10 or more is added to the exit code.
 */

import fs from 'node:fs';
import path from 'node:path';

const EXTS = new Set(['.css', '.scss', '.sass', '.less', '.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.js', '.ts']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', 'vendor', '.output', '.svelte-kit', '__pycache__']);
const TOKEN_FILE = /(tokens|theme|variables|_vars|design-system|globals)\.(css|scss|less)$/i;

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const quiet = argv.includes('--quiet');
const strict = argv.includes('--strict'); // also gate CI on the Slop Index
const target = argv.find((a) => !a.startsWith('--')) || '.';

const findings = [];
const stats = {
  files: 0, colors: new Set(), spacings: new Map(), fonts: new Set(),
  shadows: new Set(), radii: new Set(), durations: new Set(), rawPx: 0, rawColor: 0,
  gaps: new Map(), gapDecls: 0, slopWeight: 0,
};

const add = (sev, rule, file, line, msg, hint, weight) => {
  findings.push({ sev, rule, file, line, msg, hint });
  if (sev === 'SLOP') stats.slopWeight += weight || 1;
};

/* ---------------------------------------------------------------- colors */

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', lime: '#00ff00', blue: '#0000ff',
  gray: '#808080', grey: '#808080', silver: '#c0c0c0', maroon: '#800000', olive: '#808000',
  green: '#008000', purple: '#800080', teal: '#008080', navy: '#000080', yellow: '#ffff00',
  fuchsia: '#ff00ff', aqua: '#00ffff', orange: '#ffa500',
};

function parseColor(input) {
  if (!input) return null;
  let s = String(input).trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];

  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3) return null;
    const num = (v, max) => (v.endsWith('%') ? (parseFloat(v) / 100) * max : parseFloat(v));
    const r = num(p[0], 255), g = num(p[1], 255), b = num(p[2], 255);
    if ([r, g, b].some(Number.isNaN)) return null;
    let a = 1;
    if (p[3] !== undefined) a = p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    return { r, g, b, a: Number.isNaN(a) ? 1 : a };
  }

  m = /^hsla?\(([^)]+)\)$/.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3) return null;
    const h = parseFloat(p[0]) / 360, sa = parseFloat(p[1]) / 100, l = parseFloat(p[2]) / 100;
    if ([h, sa, l].some(Number.isNaN)) return null;
    const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa;
    const p2 = 2 * l - q;
    const conv = (t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q - p2) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p2 + (q - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    let a = 1;
    if (p[3] !== undefined) a = p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    return {
      r: conv(h + 1 / 3) * 255, g: conv(h) * 255, b: conv(h - 1 / 3) * 255,
      a: Number.isNaN(a) ? 1 : a,
    };
  }
  return null; // oklch/lab/color() intentionally unresolved -> reported as "needs eyes"
}

const srgb = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (c) => 0.2126 * srgb(c.r) + 0.7152 * srgb(c.g) + 0.0722 * srgb(c.b);

function contrast(fg, bg) {
  // flatten alpha onto bg
  const f = fg.a < 1
    ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }
    : fg;
  const l1 = lum(f), l2 = lum(bg);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/* ------------------------------------------------------------ file walk */

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.') {
      if (SKIP_DIRS.has(e.name)) continue;
    }
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out);
    } else if (EXTS.has(path.extname(e.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

/* -------------------------------------------------------------- rules */

const LINE_RULES = [
  {
    id: 'focus-removed', sev: 'BLOCKING',
    re: /outline\s*:\s*(none|0)\b/i,
    msg: 'outline removed',
    hint: 'Provide a :focus-visible replacement with >=3:1 contrast in the same rule.',
  },
  {
    id: 'tabindex-positive', sev: 'BLOCKING',
    re: /tabindex\s*=\s*["'{]?\s*[1-9]/i,
    msg: 'positive tabindex',
    hint: 'Use 0 or -1. Positive values break focus order.',
  },
  {
    id: 'div-onclick', sev: 'BLOCKING',
    re: /<(div|span)\b[^>]*\son(Click|click)\s*=/,
    msg: 'click handler on a non-interactive element',
    hint: 'Use <button> for actions, <a href> for navigation.',
  },
  {
    id: 'img-no-alt', sev: 'BLOCKING',
    re: /<img\b(?![^>]*\balt\s*=)[^>]*>/i,
    msg: 'img without alt',
    hint: 'Meaningful alt, or alt="" if decorative.',
  },
  {
    id: 'autoplay-audio', sev: 'BLOCKING',
    re: /<(audio|video)\b[^>]*\bautoplay\b(?![^>]*\bmuted\b)/i,
    msg: 'unmuted autoplay media',
    hint: 'Never autoplay audio. Video must be muted with a visible pause control.',
  },
  {
    id: 'animate-layout-prop', sev: 'WARN',
    re: /transition\s*:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding|box-shadow)\b/i,
    msg: 'transition on a layout/paint property',
    hint: 'Animate transform and opacity only. See references/motion.md.',
  },
  {
    id: 'animate-all', sev: 'WARN',
    re: /transition\s*:\s*all\b/i,
    msg: 'transition: all',
    hint: 'Enumerate properties. "all" animates layout props by accident.',
  },
  {
    id: 'vh-fullscreen', sev: 'WARN',
    re: /(height|min-height)\s*:\s*100vh\b/i,
    msg: '100vh',
    hint: 'Use 100dvh; 100vh overflows under mobile browser chrome.',
  },
  {
    id: 'line-height-1', sev: 'WARN',
    re: /line-height\s*:\s*1(\s*;|\s*}|\s*$)/,
    msg: 'line-height: 1',
    hint: 'Wrapping text needs >=1.5 body / <=1.25 display.',
  },
  {
    id: 'small-input-font', sev: 'WARN',
    re: /font-size\s*:\s*(1[0-5]|[1-9])px/i,
    msg: 'font-size below 16px',
    hint: 'Body/inputs below 16px trigger iOS zoom and hurt readability.',
  },
  {
    id: 'important', sev: 'WARN',
    re: /!important/,
    msg: '!important',
    hint: 'Usually a specificity problem. Acceptable only in reduced-motion resets.',
    allow: (line) => /prefers-reduced-motion/i.test(line),
  },
  {
    id: 'placeholder-copy', sev: 'WARN',
    re: /lorem ipsum|Card Title|Feature One|Your Title Here|placeholder text/i,
    msg: 'placeholder copy',
    hint: 'Write real domain copy; placeholder content hides layout bugs.',
  },
  {
    id: 'will-change-static', sev: 'INFO',
    re: /will-change\s*:/i,
    msg: 'will-change',
    hint: 'Apply just before animating and remove after; permanent promotion costs memory.',
  },
  {
    id: 'paste-blocked', sev: 'BLOCKING',
    re: /on(?:Paste|paste|Copy|copy|Cut|cut)\s*=[^>]*(?:preventDefault|return\s+false)/,
    msg: 'paste/copy is blocked',
    hint: 'Never block paste. Password managers, translation tools and assistive tech depend on it.',
  },
  {
    id: 'aria-hidden-interactive', sev: 'BLOCKING',
    re: /<[a-zA-Z][^>]*aria-hidden\s*=\s*["'{]?\s*\{?true[^>]*\b(?:href|onClick)\b[^>]*>|<[a-zA-Z][^>]*\b(?:href|onClick)\b[^>]*aria-hidden\s*=\s*["'{]?\s*\{?true[^>]*>/,
    msg: 'focusable element hidden from assistive tech',
    hint: 'aria-hidden on something focusable creates a ghost stop. Remove one or the other.',
  },
  {
    id: 'flash-rate', sev: 'BLOCKING',
    re: /animation\s*:[^;]*\binfinite\b/i,
    allow: (line) => !/\b(?:[1-9]\d?|[12]\d{2}|3[0-2]\d)ms\b|\b0?\.(?:[0-2]\d*|3(?:[0-2]\d*)?)s\b/.test(line),
    msg: 'infinite animation cycling faster than 3 times per second',
    hint: 'WCAG 2.3.1. Slow the cycle below 333ms per flash or make it finite.',
  },
  {
    id: 'zindex-arbitrary', sev: 'WARN',
    re: /z-index\s*:\s*(?!0\b|10\b|20\b|30\b|40\b|50\b|auto\b|var\()-?\d+|\bz-\[\d+\]/i,
    msg: 'z-index outside the fixed scale',
    hint: 'base 0 / dropdown 10 / sticky 20 / overlay 30 / modal 40 / toast 50. Arbitrary values start an arms race.',
  },
  {
    id: 'tw-h-screen', sev: 'WARN',
    re: /\b(?:h|min-h|max-h)-screen\b/,
    msg: 'h-screen',
    hint: 'Use h-dvh / min-h-dvh; h-screen overflows under mobile browser chrome.',
  },
  {
    id: 'animate-custom-property', sev: 'WARN',
    re: /transition(?:-property)?\s*:\s*[^;]*--[\w-]+/i,
    msg: 'transition on a CSS custom property',
    hint: 'Custom properties do not interpolate unless registered with @property. Animate the concrete property.',
  },
  {
    id: 'animate-filter', sev: 'WARN',
    re: /transition\s*:\s*[^;]*\b(?:filter|backdrop-filter)\b/i,
    msg: 'transition on filter / backdrop-filter',
    hint: 'Blur is paint-bound and re-rasterises every frame. Cross-fade opacity instead.',
  },
  {
    id: 'autocomplete-off', sev: 'WARN',
    re: /autocomplete\s*=\s*["'{]?\s*["']?off\b/i,
    msg: 'autocomplete disabled',
    hint: 'Breaks password managers and autofill. Use a specific token (one-time-code, new-password) instead of off.',
  },
  {
    id: 'scroll-event-motion', sev: 'WARN',
    re: /addEventListener\(\s*['"]scroll['"]|onScroll\s*=/,
    msg: 'behaviour driven from a scroll event',
    hint: 'Prefer CSS Scroll/View Timelines or IntersectionObserver. Scroll handlers run on the main thread.',
  },
  {
    id: 'blur-heavy', sev: 'INFO',
    re: /blur\(\s*(?:9|\d{2,})(?:\.\d+)?px/i,
    msg: 'blur radius above 8px',
    hint: 'Cost scales with radius and area. Never animate a blur this large.',
  },
];

/* ----------------------------------------------------------- slop rules */
/*
 * Markers of the default LLM aesthetic. Any one of these can be a deliberate
 * choice; what matters is the Slop Index (their sum, weighted). Above the
 * threshold the interface was not designed, it was defaulted into.
 * Rationale for each marker: references/anti-slop.md.
 */

const SLOP_LINE_RULES = [
  {
    id: 'gradient-text', w: 3,
    re: /bg-clip-text|-webkit-background-clip\s*:\s*text/i,
    msg: 'gradient text on a headline',
    hint: 'Solid headline color. Move any gradient to a background or graphic element.',
  },
  {
    id: 'ai-palette', w: 3,
    re: /\b(?:from|via|to)-(?:purple|violet|indigo|fuchsia)-\d{2,3}\b/i,
    msg: 'purple / indigo / violet gradient',
    hint: 'The strongest single generated-look marker in the corpus. Choose a palette the brief justifies.',
  },
  {
    id: 'default-palette', w: 2,
    re: /\b(?:bg|text|border|ring|from|to)-(?:blue|indigo|violet|purple|fuchsia|pink|cyan|teal|emerald)-(?:400|500|600)\b/,
    msg: 'framework default palette used directly',
    hint: 'A raw utility color means no token, and these specific ramps are the most-generated ones. Map to --accent.',
  },
  {
    id: 'emoji-as-icon', w: 3,
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u,
    msg: 'emoji used as interface iconography',
    hint: 'Platform-dependent rendering, read verbatim by screen readers, and the loudest slop tell. Use a real icon set.',
  },
  {
    id: 'three-equal-cards', w: 3,
    re: /grid-cols-3\b|repeat\(3,\s*(?:1fr|minmax\(0,\s*1fr\))\)/,
    msg: 'three equal columns',
    hint: 'The most-represented layout in existence. Weight one item dominant, or use a list or a table.',
  },
  {
    id: 'glassmorphism', w: 2,
    re: /backdrop-(?:blur|filter)|backdrop-filter\s*:/i,
    msg: 'backdrop blur',
    hint: 'Reserve translucency for genuinely overlapping layers, not as a surface style.',
  },
  {
    id: 'soft-everything', w: 2,
    re: /\brounded-(?:2xl|3xl|full)\b[^"'`]*\bshadow-(?:xl|2xl)\b|\bshadow-(?:xl|2xl)\b[^"'`]*\brounded-(?:2xl|3xl)\b/,
    msg: 'large radius plus large shadow on the same element',
    hint: 'The pillow look. Pick one softening device, not both.',
  },
  {
    id: 'marketing-filler', w: 4,
    re: /\b(?:transform your|supercharge|unlock the (?:power|potential)|take your \w+ to the next level|revolutioni[sz]e|game[- ]chang|cutting[- ]edge|seamlessly integrat|effortlessly|elevate your|powered by (?:AI|artificial))/i,
    msg: 'generated marketing voice',
    hint: 'Copy is design. Write the concrete, product-true sentence a real person would defend.',
  },
  {
    id: 'invented-stats', w: 4,
    re: /\b(?:10,?000|50,?000|100,?000|1[,.]?0?M)\+?\s*(?:users|customers|companies|teams|developers|downloads)\b|\b99\.9%\s*uptime\b/i,
    msg: 'round invented statistic',
    hint: 'Never fabricate social proof. Use real numbers or remove the claim entirely.',
  },
  {
    id: 'inter-default', w: 1,
    re: /font-family\s*:[^;]*\b(?:Inter|Geist)\b|["'](?:Inter|Geist)["']/,
    msg: 'Inter / Geist',
    hint: 'Excellent faces, and the two most-suggested defaults. Acceptable only as a stated decision.',
  },
  {
    id: 'centered-everything', w: 1,
    re: /\btext-center\b[^"'`]*\bmx-auto\b|\bmx-auto\b[^"'`]*\btext-center\b/,
    msg: 'centered block with auto margins',
    hint: 'Safe default. Left-align running text; center only short, deliberate blocks.',
  },
  {
    id: 'hero-blob', w: 2,
    re: /(?:blur-3xl|blur\(\s*(?:6|7|8|9)\d px)[^"'`]*(?:rounded-full|border-radius\s*:\s*(?:50%|999))|absolute[^"'`]*-z-10[^"'`]*blur-3xl/i,
    msg: 'blurred gradient blob behind the hero',
    hint: 'Filler for empty space. Use real content, a product shot, or deliberate emptiness.',
  },
];

const SLOP_FILE_RULES = [
  {
    id: 'section-rhythm', w: 3,
    test: (t) => (t.match(/\btext-center\b/g) || []).length >= 5,
    msg: 'centered heading rhythm repeated five or more times',
    hint: 'Title-subtitle-grid, five times down the page. Vary section shape: full-bleed, split, list, quote, table.',
  },
  {
    id: 'effect-stacking', w: 2,
    test: (t) => {
      const classAttrs = t.match(/class(?:Name)?\s*=\s*["'`]([^"'`]{20,})["'`]/g) || [];
      return classAttrs.some((c) =>
        [/\bshadow-/, /\bbg-gradient/, /\bbackdrop-blur/, /\bborder\b/, /\brounded-(?:2xl|3xl|full)/, /\bring-/]
          .filter((r) => r.test(c)).length >= 4);
    },
    msg: 'four or more decorative effects stacked on one element',
    hint: 'Effect accumulation. One device at a time, each with a stated purpose.',
  },
  {
    id: 'icon-heading-blurb', w: 2,
    test: (t) => (t.match(/<(?:svg|Icon|[A-Z]\w*Icon)\b[\s\S]{0,220}?<h[2-4]\b[\s\S]{0,220}?<p\b/g) || []).length >= 3,
    msg: 'icon + heading + one-paragraph block repeated three or more times',
    hint: 'The canonical generated feature grid. Break the repetition or change the unit.',
  },
];

const FILE_RULES = [
  {
    id: 'no-reduced-motion', sev: 'BLOCKING',
    test: (t, f) => /@keyframes|transition\s*:|animate-|framer-motion|motion\./.test(t)
      && !/prefers-reduced-motion/.test(t)
      && /\.(css|scss|less)$/i.test(f),
    msg: 'animations present but prefers-reduced-motion is never handled',
    hint: 'Add a @media (prefers-reduced-motion: reduce) block. See references/motion.md.',
  },
  {
    id: 'multiple-h1', sev: 'WARN',
    test: (t) => (t.match(/<h1[\s>]/gi) || []).length > 1,
    msg: 'more than one <h1>',
    hint: 'Exactly one h1 per document.',
  },
  {
    id: 'input-no-label', sev: 'WARN',
    test: (t) => {
      const inputs = (t.match(/<input\b(?![^>]*type\s*=\s*["'](hidden|submit|button)["'])/gi) || []).length;
      const labels = (t.match(/<label\b/gi) || []).length + (t.match(/aria-label(?:ledby)?\s*=/gi) || []).length;
      return inputs > 0 && labels < inputs;
    },
    msg: 'inputs outnumber labels / aria-labels',
    hint: 'Every input needs a bound <label>. Placeholder is not a label.',
  },
  {
    id: 'font-display', sev: 'WARN',
    test: (t) => /@font-face/.test(t) && !/font-display/.test(t),
    msg: '@font-face without font-display',
    hint: 'font-display: swap plus a metrics-adjusted fallback.',
  },
  {
    id: 'img-no-dims', sev: 'WARN',
    test: (t) => {
      const imgs = t.match(/<img\b[^>]*>/gi) || [];
      return imgs.some((i) => !/\b(width|height|aspect-ratio)\b/i.test(i)) && imgs.length > 0;
    },
    msg: 'img without intrinsic dimensions',
    hint: 'Set width/height or aspect-ratio to keep CLS < 0.1.',
  },
  {
    id: 'table-no-header', sev: 'BLOCKING',
    test: (t) => /<table[\s>]/i.test(t) && !/<th[\s>]/i.test(t),
    msg: 'data table without header cells',
    hint: '<th> with scope="col"/"row". Without it every cell is orphaned in a screen reader.',
  },
  {
    id: 'th-no-scope', sev: 'WARN',
    test: (t) => /<th[\s>]/i.test(t) && !/<th\b[^>]*\bscope\s*=/i.test(t),
    msg: '<th> without scope',
    hint: 'scope="col" / scope="row" so cells resolve to the right header.',
  },
  {
    id: 'table-unnamed', sev: 'WARN',
    test: (t) => /<table[\s>]/i.test(t) && !/<caption[\s>]/i.test(t) && !/<table\b[^>]*aria-label/i.test(t),
    msg: 'table without caption or accessible name',
    hint: 'Name the table; the tables list is a primary navigation surface.',
  },
  {
    id: 'mixed-primitives', sev: 'WARN',
    test: (t) => [/@radix-ui\//, /@base[-_]ui/, /react-aria/, /@headlessui\//, /@mui\/material/]
      .filter((r) => r.test(t)).length > 1,
    msg: 'two headless primitive systems in one file',
    hint: 'Pick one. Two focus traps and two portal roots fight each other.',
  },
  {
    id: 'dual-motion-libs', sev: 'WARN',
    test: (t) => [/framer-motion|motion\/react/, /\bgsap\b/, /animejs|anime\.js/, /react-spring/]
      .filter((r) => r.test(t)).length > 1,
    msg: 'two animation systems in one file',
    hint: 'One motion system per surface. Two schedulers means two sources of jank.',
  },
  {
    id: 'js-motion-no-reduced', sev: 'WARN',
    test: (t, f) => /(framer-motion|motion\/react|\bgsap\b|animejs)/.test(t)
      && !/(useReducedMotion|prefers-reduced-motion|shouldReduceMotion)/.test(t)
      && /\.(jsx|tsx|vue|svelte|astro|js|ts)$/i.test(f),
    msg: 'JS animation library without a reduced-motion guard',
    hint: 'Gate it with useReducedMotion() / matchMedia. If the guard is centralised, say where.',
  },
  {
    id: 'raf-no-cancel', sev: 'WARN',
    test: (t) => /requestAnimationFrame\s*\(/.test(t) && !/cancelAnimationFrame\s*\(/.test(t),
    msg: 'requestAnimationFrame loop with no cancel path',
    hint: 'Every rAF loop needs a stop condition and cleanup on unmount.',
  },
  {
    id: 'fixed-no-safe-area', sev: 'WARN',
    test: (t) => /(position\s*:\s*fixed|\bfixed\b)/.test(t)
      && /(bottom\s*:\s*0|\bbottom-0\b|\binset-x-0\b)/.test(t)
      && !/safe-area-inset/.test(t),
    msg: 'bottom-anchored fixed element without a safe-area inset',
    hint: 'padding-bottom: env(safe-area-inset-bottom), or it sits under the home indicator.',
  },
  {
    id: 'destructive-no-confirm', sev: 'WARN',
    test: (t) => /\b(handleDelete|onDelete|deleteItem|removeItem|destroyItem|permanently)\b/i.test(t)
      && !/(AlertDialog|confirm\(|ConfirmDialog|areYouSure|undo)/i.test(t),
    msg: 'destructive action with no confirmation or undo',
    hint: 'Irreversible actions need a typed confirm or an undo window. See references/floor.md.',
  },
  {
    id: 'list-no-empty-state', sev: 'WARN',
    test: (t) => /\.map\s*\(/.test(t)
      && /<\/?[A-Za-z]/.test(t)
      && !/(length\s*===?\s*0|length\s*\?|!\w+[?.]*\.length|isEmpty|EmptyState|no results|nothing (here|yet))/i.test(t),
    msg: 'rendered list with no empty state',
    hint: 'Empty, loading, error and partial are states, not edge cases.',
  },
  {
    id: 'fetch-no-error-state', sev: 'WARN',
    test: (t) => /(fetch\s*\(|useQuery\s*\(|useSWR\s*\(|axios\.)/.test(t)
      && !/(catch|isError|onError|error\s*[,}):])/.test(t),
    msg: 'data fetching with no failure path',
    hint: 'Every fetch needs a visible error state with a retry affordance.',
  },
];

/* ------------------------------------------------------------- scanning */

function scanFile(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  stats.files++;
  const rel = path.relative(process.cwd(), file) || file;
  const isTokenFile = TOKEN_FILE.test(path.basename(file));
  const lines = text.split(/\r?\n/);

  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
    for (const r of LINE_RULES) {
      if (r.allow && r.allow(line)) continue;
      if (r.re.test(line)) add(r.sev, r.id, rel, i + 1, r.msg, r.hint);
    }
    for (const r of SLOP_LINE_RULES) {
      if (r.re.test(line)) add('SLOP', r.id, rel, i + 1, r.msg, r.hint, r.w);
    }

    // spacing vocabulary — one value repeated everywhere means no proximity encoding
    const cssGap = /\b(?:gap|row-gap|column-gap|margin(?:-(?:top|bottom|block|inline))?|padding(?:-(?:top|bottom|block|inline))?)\s*:\s*([^;}]+)/i.exec(line);
    if (cssGap) {
      const v = cssGap[1].trim().split(/\s+/)[0];
      if (/^\d/.test(v) || v.startsWith('var(')) {
        stats.gapDecls++;
        stats.gaps.set(v, (stats.gaps.get(v) || 0) + 1);
      }
    }
    for (const m of line.matchAll(/\b(?:gap|space-[xy]|p[xytb]?|m[xytb]?)-(\d{1,2}|px)\b/g)) {
      stats.gapDecls++;
      stats.gaps.set(m[1], (stats.gaps.get(m[1]) || 0) + 1);
    }
    // raw values outside the token file
    if (!isTokenFile) {
      const hexes = line.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      for (const h of hexes) {
        if (parseColor(h)) { stats.rawColor++; stats.colors.add(h.toLowerCase()); }
      }
      const pxs = line.match(/(?<![\w-])(\d{1,4})px/g) || [];
      for (const p of pxs) {
        const n = parseInt(p, 10);
        if (n === 0 || n === 1 || n === 2) continue; // hairlines and resets are fine
        stats.rawPx++;
        stats.spacings.set(p, (stats.spacings.get(p) || 0) + 1);
      }
    } else {
      const hexes = line.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      hexes.forEach((h) => stats.colors.add(h.toLowerCase()));
    }
    const ff = /font-family\s*:\s*([^;}]+)/i.exec(line);
    if (ff) ff[1].split(',').forEach((f) => stats.fonts.add(f.trim().replace(/["']/g, '').toLowerCase()));
    const sh = /box-shadow\s*:\s*([^;}]+)/i.exec(line);
    if (sh && !/none/i.test(sh[1])) stats.shadows.add(sh[1].trim());
    const rd = /border-radius\s*:\s*([^;}]+)/i.exec(line);
    if (rd) stats.radii.add(rd[1].trim());
    const du = /(\d+)ms|(\d?\.?\d+)s\b/.exec(line);
    if (du && /transition|animation/i.test(line)) stats.durations.add(du[0]);
  });

  for (const r of FILE_RULES) {
    try { if (r.test(text, file)) add(r.sev, r.id, rel, 0, r.msg, r.hint); } catch { /* noop */ }
  }
  for (const r of SLOP_FILE_RULES) {
    try { if (r.test(text, file)) add('SLOP', r.id, rel, 0, r.msg, r.hint, r.w); } catch { /* noop */ }
  }
  return text;
}

/* --------------------------------------------------- contrast on tokens */

function collectVars(texts) {
  const map = new Map();
  for (const t of texts) {
    const re = /(--[\w-]+)\s*:\s*([^;}\n]+)/g;
    let m;
    while ((m = re.exec(t))) map.set(m[1], m[2].trim());
  }
  return map;
}

function resolveVar(value, map, depth = 0) {
  if (depth > 6 || !value) return value;
  const m = /^var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)$/.exec(value.trim());
  if (!m) return value;
  const next = map.get(m[1]) ?? m[2];
  return resolveVar(next, map, depth + 1);
}

const PAIRS = [
  ['--text', '--bg', 4.5, 'body text on background'],
  ['--text-muted', '--bg', 4.5, 'muted text on background'],
  ['--text-secondary', '--bg', 4.5, 'secondary text on background'],
  ['--text', '--surface', 4.5, 'body text on surface'],
  ['--text-muted', '--surface', 4.5, 'muted text on surface'],
  ['--accent-fg', '--accent', 4.5, 'accent foreground on accent'],
  ['--accent', '--bg', 3.0, 'accent on background'],
  ['--border', '--bg', 3.0, 'structural border on background'],
  ['--foreground', '--background', 4.5, 'foreground on background'],
  ['--muted-foreground', '--background', 4.5, 'muted foreground on background'],
  ['--primary-foreground', '--primary', 4.5, 'primary foreground on primary'],
];

function checkTokenContrast(map) {
  let checked = 0, unresolved = 0;
  for (const [fgN, bgN, min, label] of PAIRS) {
    if (!map.has(fgN) || !map.has(bgN)) continue;
    const fgRaw = resolveVar(map.get(fgN), map);
    const bgRaw = resolveVar(map.get(bgN), map);
    const fg = parseColor(fgRaw), bg = parseColor(bgRaw);
    if (!fg || !bg) { unresolved++; continue; }
    checked++;
    const ratio = contrast(fg, bg);
    if (ratio < min) {
      add('BLOCKING', 'contrast', 'tokens', 0,
        `${label}: ${ratio.toFixed(2)}:1 (need ${min}:1) [${fgN}=${fgRaw} on ${bgN}=${bgRaw}]`,
        'Darken/lighten the foreground token, or change the surface. Do not lower the requirement.');
    }
  }
  return { checked, unresolved };
}

/* -------------------------------------------------- attractor clusters */
/*
 * The three looks LLM-generated interfaces collapse into. Detected from resolved
 * token values, because the palette is where the default shows first.
 * A hit is not a verdict — it is a demand that the Design Read defend the choice.
 */

function detectClusters(map) {
  const val = (n) => parseColor(resolveVar(map.get(n), map));
  const bg = val('--bg') || val('--background');
  const accent = val('--accent') || val('--primary');
  if (!bg) return;

  const sat = (c) => {
    const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
    return mx === 0 ? 0 : (mx - mn) / mx;
  };
  const hueOf = (c) => {
    const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b), d = mx - mn;
    if (d === 0) return 0;
    let h;
    if (mx === c.r) h = ((c.g - c.b) / d) % 6;
    else if (mx === c.g) h = (c.b - c.r) / d + 2;
    else h = (c.r - c.g) / d + 4;
    h *= 60;
    return h < 0 ? h + 360 : h;
  };
  const fonts = [...stats.fonts].join(' ');

  // A — warm editorial minimal: cream/beige ground, serif display
  if (bg.r > 240 && bg.g > 232 && bg.b > 218 && bg.r - bg.b >= 8) {
    add('SLOP', 'cluster-warm-editorial', 'tokens', 0,
      'cream/beige ground — attractor cluster A',
      /serif|playfair|lora|fraunces|cormorant/i.test(fonts)
        ? 'Cream ground plus a serif display is the most-generated look there is. Defend it in the Design Read or change it.'
        : 'Cream ground is cluster A. Keep it only if the Design Read names why this brief needs warmth.', 3);
  }

  // B — dark tech: near-black ground, one cool-hue high-saturation accent.
  // Narrowed to hue 150-330 (cyan->blue->violet->magenta) so warm dark themes
  // (terracotta, rust, amber) are not penalised for being dark + coloured.
  if (lum(bg) < 0.02 && accent) {
    const s = sat(accent), h = hueOf(accent);
    if (s > 0.5 && h >= 150 && h <= 330) {
      add('SLOP', 'cluster-dark-tech', 'tokens', 0,
        'near-black ground plus one acid accent — attractor cluster B',
        'Cluster B. Requires a Signature move that no other dark product would have.', 3);
    }
  }

  // C — broadsheet: off-white ground, hairline rules, no elevation
  if (lum(bg) > 0.85 && stats.shadows.size === 0 && stats.radii.size <= 1 && stats.files >= 3) {
    add('SLOP', 'cluster-broadsheet', 'tokens', 0,
      'off-white ground, hairline rules, zero elevation — attractor cluster C',
      'Cluster C. Legitimate for reading surfaces; slop when it is simply the safe default.', 2);
  }
}

/* ------------------------------------------------------------- reporting */

const files = fs.existsSync(target) && fs.statSync(target).isDirectory()
  ? walk(target)
  : [target];

if (!files.length) {
  console.error(`ui-craft audit: no scannable files under "${target}"`);
  process.exit(0);
}

const texts = [];
for (const f of files) { const t = scanFile(f); if (t) texts.push(t); }
const vars = collectVars(texts);
const cinfo = checkTokenContrast(vars);

// systemic signals
const uniqColors = stats.colors.size;
const uniqSpacings = stats.spacings.size;
const realFonts = [...stats.fonts].filter((f) => f && !/^(sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-monospace|ui-serif|-apple-system|blinkmacsystemfont|segoe ui|roboto|helvetica neue|helvetica|arial|noto sans|apple color emoji|segoe ui emoji|cursive|fantasy|inherit|var\(.*)$/i.test(f));

if (uniqColors > 20) add('INFO', 'color-sprawl', 'project', 0, `${uniqColors} unique colors`, 'Cluster near-duplicates into <=12 semantic tokens. See references/tokens.md.');
if (uniqSpacings > 14) add('INFO', 'space-sprawl', 'project', 0, `${uniqSpacings} distinct px values`, 'Collapse to one 4px-based 9-step scale.');
if (realFonts.length > 2) add('INFO', 'font-sprawl', 'project', 0, `${realFonts.length} font families: ${realFonts.slice(0, 6).join(', ')}`, 'Ceiling is 2. A weight range beats a third family.');
if (stats.shadows.size > 4) add('INFO', 'shadow-sprawl', 'project', 0, `${stats.shadows.size} distinct shadows`, 'Three elevation levels is the ceiling.');
if (stats.radii.size > 5) add('INFO', 'radius-sprawl', 'project', 0, `${stats.radii.size} distinct radii`, 'Three values: small, medium, pill.');
if (stats.rawColor > 0 && vars.size > 0) add('INFO', 'raw-values', 'project', 0, `${stats.rawColor} raw colors and ${stats.rawPx} raw px outside the token file`, 'Every raw value is either a defect or a missing token.');

detectClusters(vars);

// Uniform spacing: the structural tell. One value everywhere means grouping was never encoded.
if (stats.gapDecls >= 20) {
  const top = [...stats.gaps.entries()].sort((a, b) => b[1] - a[1]);
  const share = top[0][1] / stats.gapDecls;
  if (stats.gaps.size <= 2 || share > 0.7) {
    add('SLOP', 'uniform-spacing', 'project', 0,
      `${Math.round(share * 100)}% of ${stats.gapDecls} spacing declarations use "${top[0][0]}" (${stats.gaps.size} distinct values)`,
      'Spacing is how grouping is communicated. Tighten within a group, open between groups.', 4);
  }
}

const order = { BLOCKING: 0, WARN: 1, SLOP: 2, INFO: 3 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.file.localeCompare(b.file) || a.line - b.line);

const counts = findings.reduce((acc, f) => (acc[f.sev] = (acc[f.sev] || 0) + 1, acc), {});

/*
 * Slop Index — weighted sum of default-aesthetic markers, normalised per 10 files
 * so a large codebase is not penalised for its size.
 *   0-4    designed
 *   5-9    drifting toward the default
 *   10-19  reads as generated
 *   20+    is the default
 */
const slopIndex = Math.round(stats.slopWeight / Math.max(1, stats.files / 10));
const slopBand =
  slopIndex <= 4 ? 'designed' :
  slopIndex <= 9 ? 'drifting toward the default' :
  slopIndex <= 19 ? 'reads as generated' : 'is the default';

if (asJson) {
  console.log(JSON.stringify({
    summary: {
      files: stats.files,
      blocking: counts.BLOCKING || 0, warn: counts.WARN || 0,
      slop: counts.SLOP || 0, info: counts.INFO || 0,
      slopIndex, slopBand,
      uniqueColors: uniqColors, uniqueSpacings: uniqSpacings, fonts: realFonts,
      contrastPairsChecked: cinfo.checked, contrastPairsUnresolved: cinfo.unresolved,
    },
    findings,
  }, null, 2));
} else {
  const B = '\u001b[1m', D = '\u001b[2m', R = '\u001b[0m';
  const tag = {
    BLOCKING: '\u001b[41m\u001b[97m BLOCK \u001b[0m',
    WARN: '\u001b[43m\u001b[30m WARN  \u001b[0m',
    SLOP: '\u001b[45m\u001b[97m SLOP  \u001b[0m',
    INFO: '\u001b[46m\u001b[30m INFO  \u001b[0m',
  };
  console.log(`\n${B}ui-craft audit${R} ${D}${stats.files} files${R}\n`);

  let last = '';
  const shown = quiet ? findings.filter((f) => f.sev === 'BLOCKING') : findings;
  const seen = new Map();
  for (const f of shown) {
    const key = `${f.sev}|${f.rule}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    if (seen.get(key) > 5) continue; // cap noise per rule
    if (f.sev !== last) { console.log(''); last = f.sev; }
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    console.log(`${tag[f.sev]} ${B}${f.rule}${R} ${D}${loc}${R}`);
    console.log(`        ${f.msg}`);
    if (f.hint) console.log(`        ${D}-> ${f.hint}${R}`);
  }
  for (const [key, n] of seen) if (n > 5) console.log(`${D}        ... ${n - 5} more ${key.split('|')[1]}${R}`);

  console.log(`\n${B}Summary${R}`);
  console.log(`  BLOCKING ${counts.BLOCKING || 0}   WARN ${counts.WARN || 0}   SLOP ${counts.SLOP || 0}   INFO ${counts.INFO || 0}`);
  console.log(`  ${B}Slop Index ${slopIndex}${R} - ${slopBand} ${D}(0-4 designed | 5-9 drifting | 10-19 generated | 20+ default)${R}`);
  console.log(`  tokens: ${vars.size} vars | colors ${uniqColors} | px values ${uniqSpacings} | fonts ${realFonts.length} | shadows ${stats.shadows.size} | radii ${stats.radii.size}`);
  console.log(`  contrast pairs: ${cinfo.checked} checked, ${cinfo.unresolved} unresolved (oklch/lab need manual check)`);
  console.log(`\n${D}Not verifiable statically - check by hand:${R}`);
  console.log(`${D}  real contrast over images/gradients | focus order feel | SR announcements${R}`);
  console.log(`${D}  touch ergonomics on device | perceived motion comfort | does the Signature read${R}`);
  console.log(`${D}A low Slop Index means no mechanical tells were found. It does not mean the`);
  console.log(`interface has a point of view - only the Signature test decides that.${R}`);
  console.log(`${D}Findings above are candidates. Prove each one reaches a rendered surface`);
  console.log(`before reporting it - references/evidence.md.${R}\n`);
}

const gate = (counts.BLOCKING || 0) + (strict && slopIndex >= 10 ? slopIndex : 0);
process.exit(Math.min(gate, 250));
