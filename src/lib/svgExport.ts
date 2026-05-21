import type { Group } from '../types';
import type { ScaleType } from '../types';
import { colorById, gradientColorById, parseGradientNumber, scaleRange } from '../data/mapData';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIKIPEDIA_URL =
  'https://upload.wikimedia.org/wikipedia/commons/4/4d/BlankMap-World.svg';
const FALLBACK_URL = '/BlankMap-World.svg';
const FETCH_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// SVG loading with Wikipedia-first, bundled-fallback strategy
// ---------------------------------------------------------------------------

let _cache: string | null = null;
let _inFlight: Promise<string> | null = null;

/** Throws if the text is clearly not the expected base-map SVG. */
function validateSvg(text: string): void {
  if (
    !text.includes('<svg') ||
    !text.includes('</svg>') ||
    !text.includes('</style>') ||
    !text.includes('landxx') // base-map CSS class must be present
  ) {
    throw new Error('SVG failed validation — unexpected structure');
  }
}

/** Fetch a URL as text, aborting after FETCH_TIMEOUT_MS. */
async function fetchText(url: string, opts?: RequestInit): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Load the base world-map SVG.
 *
 * Tries Wikipedia first with `cache: 'no-cache'` so the browser always
 * revalidates with the origin server (gets the latest version without
 * re-downloading unchanged content). Falls back to the bundled
 * /BlankMap-World.svg on any failure (network error, timeout, bad status,
 * or failed validation).
 *
 * Result is module-cached so only one fetch fires per page load, even under
 * React 19 StrictMode double-invocation.
 */
export async function loadWorldSvg(): Promise<string> {
  if (_cache) return _cache;
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    // 1. Try Wikipedia for the latest version
    try {
      const text = await fetchText(WIKIPEDIA_URL, { cache: 'no-cache' });
      validateSvg(text);
      _cache = text;
      return text;
    } catch (err) {
      console.warn(
        '[wiki-map-maker] Wikipedia fetch failed, using bundled fallback:',
        err,
      );
    }

    // 2. Fall back to the validated bundled copy
    const text = await fetchText(FALLBACK_URL);
    validateSvg(text);
    _cache = text;
    return text;
  })();

  return _inFlight;
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

/** Parse an `oklch(L C H)` string into [L, C, H] floats. */
function parseOklch(s: string): [number, number, number] {
  const m = s.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  return m
    ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]
    : [0.5, 0, 0];
}

/** Linearly interpolate between two oklch colour strings, shortest-arc hue. */
function lerpOklch(a: string, b: string, t: number): string {
  const [l0, c0, h0] = parseOklch(a);
  const [l1, c1, h1] = parseOklch(b);
  let dH = h1 - h0;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  return (
    `oklch(${(l0 + (l1 - l0) * t).toFixed(4)} ` +
    `${(c0 + (c1 - c0) * t).toFixed(4)} ` +
    `${(h0 + dH * t).toFixed(2)})`
  );
}

// ---------------------------------------------------------------------------
// CSS / defs builders
// ---------------------------------------------------------------------------

interface MarkerCircle {
  cx: number;
  cy: number;
  r: number;
  className: string;
}

const MARKER_CLASSES = ['circlexx', 'subxx', 'noxx', 'unxx'] as const;

function readSvgAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`));
  return match?.[1] ?? null;
}

function collectMarkerCirclesByClass(svg: string): Map<string, MarkerCircle[]> {
  const circlesByClass = new Map<string, MarkerCircle[]>();
  const circleRe = /<circle\b[^>]*>/g;

  for (const match of svg.matchAll(circleRe)) {
    const tag = match[0];
    const className = readSvgAttr(tag, 'class') ?? '';
    const classes = className.split(/\s+/).filter(Boolean);
    if (!MARKER_CLASSES.some(markerClass => classes.includes(markerClass))) {
      continue;
    }

    const cx = Number(readSvgAttr(tag, 'cx'));
    const cy = Number(readSvgAttr(tag, 'cy'));
    const r = Number(readSvgAttr(tag, 'r'));
    if (![cx, cy, r].every(Number.isFinite)) continue;

    const circle = { cx, cy, r, className };
    for (const classToken of classes) {
      if (MARKER_CLASSES.includes(classToken as (typeof MARKER_CLASSES)[number])) {
        continue;
      }

      if (!circlesByClass.has(classToken)) circlesByClass.set(classToken, []);
      circlesByClass.get(classToken)!.push(circle);
    }
  }

  return circlesByClass;
}

function fmtSvgNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function buildPieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const startX = cx + r * Math.cos(startAngle);
  const startY = cy + r * Math.sin(startAngle);
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${fmtSvgNumber(cx)} ${fmtSvgNumber(cy)}`,
    `L ${fmtSvgNumber(startX)} ${fmtSvgNumber(startY)}`,
    `A ${fmtSvgNumber(r)} ${fmtSvgNumber(r)} 0 ${largeArc} 1 ${fmtSvgNumber(endX)} ${fmtSvgNumber(endY)}`,
    'Z',
  ].join(' ');
}

function markerStrokeWidth(className: string): string {
  return /\b(?:subxx|unxx)\b/.test(className) ? '0.3' : '0.5';
}

function buildMarkerPie(circle: MarkerCircle, colors: string[]): string {
  const step = (Math.PI * 2) / colors.length;
  const start = -Math.PI / 2;
  const slices = colors
    .map((color, i) => {
      const d = buildPieSlicePath(circle.cx, circle.cy, circle.r, start + i * step, start + (i + 1) * step);
      return `<path d="${d}" fill="${color}"/>`;
    })
    .join('');

  return (
    `<g class="wmm-marker-pie">` +
    slices +
    `<circle cx="${fmtSvgNumber(circle.cx)}" cy="${fmtSvgNumber(circle.cy)}" r="${fmtSvgNumber(circle.r)}" ` +
    `fill="none" stroke="#000000" stroke-width="${markerStrokeWidth(circle.className)}"/>` +
    `</g>`
  );
}

function buildMarkerPieOverlay(
  countryColors: Map<string, string[]>,
  markerCirclesByClass: Map<string, MarkerCircle[]>,
): string {
  const pies: string[] = [];

  for (const [id, colors] of countryColors) {
    if (colors.length < 2) continue;

    const markerCircles = markerCirclesByClass.get(id);
    if (!markerCircles) continue;

    for (const circle of markerCircles) {
      pies.push(buildMarkerPie(circle, colors));
    }
  }

  if (!pies.length) return '';
  return `<g class="wmm-marker-pies">\n${pies.join('\n')}\n</g>`;
}

/**
 * Build CSS rules, optional stripe-pattern `<defs>`, and optional pie overlays
 * for groups mode.
 *
 * - Countries in exactly one group → solid fill.
 * - Countries in multiple groups → diagonal stripe pattern, one band per
 *   group colour in group order.
 * - Small-country and small-territory circle markers in multiple groups → pie
 *   chart slices, one equal slice per group colour.
 *
 * `opacity: 1` is always set so that tiny places represented as hidden circle
 * markers become visible when assigned a colour.
 */
export function buildGroupResult(
  groups: Group[],
  baseSvg = '',
): { defs: string; css: string; markerOverlay: string } {
  // countryId → ordered list of fill colours (one entry per group membership)
  const countryColors = new Map<string, string[]>();
  for (const g of groups) {
    const color = colorById(g.colorId);
    for (const id of g.members) {
      if (!countryColors.has(id)) countryColors.set(id, []);
      countryColors.get(id)!.push(color);
    }
  }

  const patternDefs: string[] = [];
  const cssRules: string[] = [];
  const markerCirclesByClass = baseSvg ? collectMarkerCirclesByClass(baseSvg) : new Map<string, MarkerCircle[]>();

  for (const [id, colors] of countryColors) {
    if (colors.length === 1) {
      cssRules.push(`.${id} { fill: ${colors[0]}; opacity: 1; }`);
    } else {
      // Diagonal stripe pattern — one 10px band per colour
      const patternId = `wmm-stripe-${id}`;
      const bandW = 10;
      const total = bandW * colors.length;
      const rects = colors
        .map((c, i) => `<rect x="${i * bandW}" width="${bandW}" height="${total}" fill="${c}"/>`)
        .join('');
      patternDefs.push(
        `<pattern id="${patternId}" patternUnits="userSpaceOnUse" ` +
          `width="${total}" height="${total}" patternTransform="rotate(45 0 0)">` +
          rects +
          `</pattern>`,
      );
      cssRules.push(`.${id} { fill: url(#${patternId}); opacity: 1; }`);
      if (markerCirclesByClass.has(id)) {
        const markerSelectors = MARKER_CLASSES.map(markerClass => `circle.${id}.${markerClass}`).join(', ');
        cssRules.push(`${markerSelectors} { fill: none; opacity: 1; }`);
      }
    }
  }

  const defs =
    patternDefs.length > 0
      ? `<defs>\n${patternDefs.join('\n')}\n</defs>`
      : '';
  return {
    defs,
    css: cssRules.join('\n'),
    markerOverlay: buildMarkerPieOverlay(countryColors, markerCirclesByClass),
  };
}

/**
 * Build CSS rules for gradient mode — one rule per country, colour
 * interpolated between startColor and endColor in oklch space.
 * `opacity: 1` ensures hidden circle markers become visible.
 */
export function buildGradientCss(
  entries: { id: string; v: number }[],
  range: [number, number],
  startColor: string,
  endColor: string,
): string {
  if (!entries.length) return '';
  const [lo, hi] = range;
  const span = hi - lo || 1;
  return entries
    .map(({ id, v }) => {
      const t = Math.max(0, Math.min(1, (v - lo) / span));
      return `.${id} { fill: ${lerpOklch(startColor, endColor, t)}; opacity: 1; }`;
    })
    .join('\n');
}

/** Inject CSS rules into the SVG's existing `<style>` block. */
function injectStyleRules(svg: string, css: string): string {
  if (!css) return svg;
  const idx = svg.indexOf('</style>');
  if (idx === -1) {
    // Fallback: no style block — prepend one after the opening <svg> tag
    return svg.replace(/<svg([^>]*)>/, `<svg$1>\n<style>\n/* wiki-map-maker */\n${css}\n</style>`);
  }
  return (
    svg.slice(0, idx) +
    '\n/* wiki-map-maker: country fills */\n' +
    css +
    '\n' +
    svg.slice(idx)
  );
}

// ---------------------------------------------------------------------------
// XML helper
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Overlay builders (title / caption / legend)
// ---------------------------------------------------------------------------

/** SVG text overlay for title and caption, in 2754×1398 coordinate space. */
function buildTitleOverlay(title: string, caption: string): string {
  if (!title && !caption) return '';
  const titleEl = title
    ? `<text font-family="'Source Serif 4', Georgia, serif" font-size="64" font-weight="600" fill="#1a1a1a">${esc(title)}</text>`
    : '';
  const captionEl = caption
    ? `<text y="${title ? 80 : 0}" font-family="'Source Serif 4', Georgia, serif" font-size="32" font-style="italic" fill="#555">${esc(caption)}</text>`
    : '';
  return `<g transform="translate(60, 70)">${titleEl}${captionEl}</g>`;
}

/** SVG legend for groups mode — coloured rectangles + labels, bottom-left. */
function buildGroupsLegend(groups: Group[]): string {
  const visible = groups.filter(g => g.members.length > 0);
  if (!visible.length) return '';
  const ITEM_H = 52;
  const BOTTOM_PAD = 40;
  const startY = 1398 - BOTTOM_PAD - visible.length * ITEM_H;
  const items = visible
    .map(
      (g, i) =>
        `<g transform="translate(0,${i * ITEM_H})">` +
        `<rect width="32" height="32" rx="4" fill="${colorById(g.colorId)}"/>` +
        `<text x="46" y="23" font-size="28" fill="#222">${esc(g.name)} (${g.members.length})</text>` +
        `</g>`,
    )
    .join('\n');
  return (
    `<g transform="translate(60,${startY})" ` +
    `font-family="Inter, system-ui, sans-serif">\n${items}\n</g>`
  );
}

/** SVG legend for gradient mode — colour bar + tick labels, bottom-left. */
function buildGradientLegend(
  range: [number, number],
  gradientDefId: string,
): string {
  const [lo, hi] = range;
  const BAR_X = 60, BAR_Y = 1330, BAR_W = 500, BAR_H = 28;
  return (
    `<g font-family="Inter, system-ui, sans-serif">` +
    `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="4" ` +
    `fill="url(#${gradientDefId})" stroke="#ccc" stroke-width="1"/>` +
    `<text x="${BAR_X}" y="${BAR_Y + BAR_H + 28}" font-size="26" fill="#333">${esc(String(lo))}</text>` +
    `<text x="${BAR_X + BAR_W}" y="${BAR_Y + BAR_H + 28}" font-size="26" fill="#333" text-anchor="end">${esc(String(hi))}</text>` +
    `</g>`
  );
}

// ---------------------------------------------------------------------------
// Main composer
// ---------------------------------------------------------------------------

export interface BuildOpts {
  title: string;
  caption: string;
  groups: Group[];
  worldMode: 'groups' | 'gradient';
  gradientValues: Record<string, number | string>;
  scaleType: ScaleType;
  customMin: string;
  customMax: string;
  startColorId: string;
  endColorId: string;
  includeOverlay: boolean;
}

/**
 * Take the base Wikipedia SVG and produce a fully styled export SVG:
 * - Country CSS fills injected into the `<style>` block
 * - Stripe `<pattern>` defs injected for multi-group countries
 * - Optional title / caption / legend overlays appended before `</svg>`
 */
export function buildWorldMapSvg(baseSvg: string, opts: BuildOpts): string {
  const {
    title, caption, groups, worldMode,
    gradientValues, scaleType, customMin, customMax,
    startColorId, endColorId, includeOverlay,
  } = opts;

  let css: string;
  let extraDefs = '';
  let legendOverlay = '';

  if (worldMode === 'gradient') {
    const entries = Object.entries(gradientValues)
      .map(([id, value]) => ({ id, v: parseGradientNumber(value) }))
      .filter((entry): entry is { id: string; v: number } => entry.v !== null);
    const vals = entries.map(e => e.v);
    const dataMin = vals.length ? Math.min(...vals) : 0;
    const dataMax = vals.length ? Math.max(...vals) : 0;
    const range = scaleRange(scaleType, dataMin, dataMax, customMin, customMax);
    const startColor = gradientColorById(startColorId);
    const endColor = gradientColorById(endColorId);
    css = buildGradientCss(entries, range, startColor, endColor);

    if (includeOverlay) {
      const gradDefId = 'wmm-export-grad';
      extraDefs =
        `<defs>` +
        `<linearGradient id="${gradDefId}" x1="0" y1="0" x2="1" y2="0">` +
        `<stop offset="0" stop-color="${startColor}"/>` +
        `<stop offset="1" stop-color="${endColor}"/>` +
        `</linearGradient>` +
        `</defs>`;
      legendOverlay = buildGradientLegend(range, gradDefId);
    }
  } else {
    const { defs, css: groupCss, markerOverlay } = buildGroupResult(groups, baseSvg);
    css = groupCss;
    extraDefs = [defs, markerOverlay].filter(Boolean).join('\n');
    if (includeOverlay) {
      legendOverlay = buildGroupsLegend(groups);
    }
  }

  // Inject CSS fill rules into the <style> block
  let svg = injectStyleRules(baseSvg, css);

  // Collect everything to append before </svg>
  const appendParts: string[] = [];

  if (extraDefs) appendParts.push(extraDefs);

  if (includeOverlay) {
    const titleOverlay = buildTitleOverlay(title, caption);
    const overlayBody = [titleOverlay, legendOverlay].filter(Boolean).join('\n');
    if (overlayBody) {
      appendParts.push(
        '<!-- wiki-map-maker: overlays -->',
        overlayBody,
        '<!-- /wiki-map-maker: overlays -->',
      );
    }
  }

  if (appendParts.length > 0) {
    svg = svg.replace(/<\/svg>\s*$/, appendParts.join('\n') + '\n</svg>');
  }

  return svg;
}
