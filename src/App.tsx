import { useState, useMemo, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { ConfigPanel } from './components/ConfigPanel';
import { MapPreview } from './components/MapPreview';
import { continentById, countryById, colorById, gradientColorById, parseGradientNumber, scaleRange } from './data/mapData';
import { loadWorldSvg, buildWorldMapSvg } from './lib/svgExport';
import type { MapMode, WorldMode, ScaleType, Group, DocState } from './types';

export default function App() {
  const [baseSvg, setBaseSvg] = useState<string | null>(null);
  const [includeOverlay, setIncludeOverlay] = useState(false);

  useEffect(() => {
    loadWorldSvg().then(setBaseSvg).catch(console.error);
  }, []);

  const [mode, setMode] = useState<MapMode>('world');
  const [continentId, setContinentId] = useState('EU');
  const [countryId, setCountryId] = useState('us');

  const scope = useMemo(() => {
    if (mode === 'world') return 'world';
    if (mode === 'continent') return `continent:${continentId}`;
    return `country:${countryId}`;
  }, [mode, continentId, countryId]);

  const [docByScope, setDocByScope] = useState<Record<string, DocState>>({});
  const doc = docByScope[scope] ?? {};

  function setDoc(patch: Partial<DocState>) {
    setDocByScope(prev => ({ ...prev, [scope]: { ...(prev[scope] ?? {}), ...patch } }));
  }

  const defaultTitle =
    mode === 'world' ? 'World' :
    mode === 'continent' ? (continentById(continentId)?.name ?? 'Continent') :
    (countryById(countryId)?.name ?? 'Country');

  const title = doc.title ?? defaultTitle;
  const caption = doc.caption ?? '';
  const groups: Group[] = doc.groups ?? [];
  const worldMode: WorldMode = doc.worldMode ?? 'groups';
  const gradientValues: Record<string, number | string> = doc.gradientValues ?? {};
  const scaleType: ScaleType = doc.scaleType ?? 'data';
  const customMin = doc.customMin ?? '0';
  const customMax = doc.customMax ?? '100';
  const startColorId = doc.startColorId ?? 'cream';
  const endColorId = doc.endColorId ?? 'blue';

  function setTitle(v: string) { setDoc({ title: v }); }
  function setCaption(v: string) { setDoc({ caption: v }); }
  function setGroups(next: Group[] | ((prev: Group[]) => Group[])) {
    setDoc({ groups: typeof next === 'function' ? next(groups) : next });
  }
  function setWorldMode(v: WorldMode) { setDoc({ worldMode: v }); }
  function setGradientValues(v: Record<string, number | string>) { setDoc({ gradientValues: v }); }
  function setScaleType(v: ScaleType) { setDoc({ scaleType: v }); }
  function setCustomMin(v: string) { setDoc({ customMin: v }); }
  function setCustomMax(v: string) { setDoc({ customMax: v }); }
  function setStartColorId(v: string) { setDoc({ startColorId: v }); }
  function setEndColorId(v: string) { setDoc({ endColorId: v }); }

  function onExportSvg() {
    const svg =
      mode === 'world' && baseSvg
        ? buildWorldMapSvg(baseSvg, {
            title, caption, groups, worldMode,
            gradientValues, scaleType, customMin, customMax,
            startColorId, endColorId, includeOverlay,
          })
        : buildSvg({
            mode, continentId, countryId, title, caption, groups,
            worldMode, gradientValues, scaleType, customMin, customMax,
            startColorId, endColorId,
          });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (title || defaultTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'map';
    a.href = url;
    a.download = `${slug}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const crumbs =
    mode === 'world' ? ['Preview', 'World'] :
    mode === 'continent' ? ['Preview', continentById(continentId)?.name ?? '—'] :
    ['Preview', countryById(countryId)?.name ?? '—'];

  return (
    <div className="app">
      <TopNav
        mode={mode} setMode={setMode}
        continentId={continentId} setContinentId={setContinentId}
        countryId={countryId} setCountryId={setCountryId}
        onExportSvg={onExportSvg}
      />

      <div className="workspace">
        <ConfigPanel
          mode={mode}
          continentId={continentId}
          countryId={countryId}
          title={title} setTitle={setTitle}
          caption={caption} setCaption={setCaption}
          groups={groups} setGroups={setGroups}
          onExportSvg={onExportSvg}
          worldMode={worldMode} setWorldMode={setWorldMode}
          gradientValues={gradientValues} setGradientValues={setGradientValues}
          scaleType={scaleType} setScaleType={setScaleType}
          customMin={customMin} setCustomMin={setCustomMin}
          customMax={customMax} setCustomMax={setCustomMax}
          startColorId={startColorId} setStartColorId={setStartColorId}
          endColorId={endColorId} setEndColorId={setEndColorId}
          includeOverlay={includeOverlay} setIncludeOverlay={setIncludeOverlay}
        />

        <main className="bg-canvas flex flex-col min-w-0 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-line bg-paper shrink-0">
            <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i > 0 && <span className="text-line-2">/</span>}
                  <span className={i === crumbs.length - 1 ? 'text-ink font-medium' : ''}>{c}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-start justify-center p-8 min-h-0">
            <MapPreview
              mode={mode}
              continentId={continentId}
              countryId={countryId}
              title={title}
              caption={caption}
              groups={groups}
              worldMode={worldMode}
              gradientValues={gradientValues}
              scaleType={scaleType}
              customMin={customMin} customMax={customMax}
              startColorId={startColorId} endColorId={endColorId}
              baseSvg={baseSvg}
              includeOverlay={includeOverlay}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function buildSvg(opts: {
  mode: MapMode; continentId: string; countryId: string;
  title: string; caption: string; groups: Group[];
  worldMode: WorldMode; gradientValues: Record<string, number | string>;
  scaleType: ScaleType; customMin: string; customMax: string;
  startColorId: string; endColorId: string;
}): string {
  const {
    mode, continentId, countryId, title, caption, groups,
    worldMode, gradientValues, scaleType, customMin, customMax,
    startColorId, endColorId,
  } = opts;
  const W = 800, H = 500;
  const esc = (s: string) => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const subject =
    mode === 'world' ? 'World' :
    mode === 'continent' ? (continentById(continentId)?.name ?? '') :
    (countryById(countryId)?.name ?? '');

  const isGradient = mode === 'world' && worldMode === 'gradient';
  let legendG: string;
  let metadataInner: string;
  let defsBlock = '';

  if (isGradient) {
    const entries = Object.entries(gradientValues)
      .map(([id, value]) => ({ id, v: parseGradientNumber(value) }))
      .filter((entry): entry is { id: string; v: number } => entry.v !== null);
    const vals = entries.map(e => e.v);
    const dataMin = vals.length ? Math.min(...vals) : 0;
    const dataMax = vals.length ? Math.max(...vals) : 0;
    const range = scaleRange(scaleType, dataMin, dataMax, customMin, customMax);
    const sColor = gradientColorById(startColorId);
    const eColor = gradientColorById(endColorId);
    const barX = 40, barY = H - 56, barW = 220, barH = 12;
    defsBlock = `\n  <defs>\n    <linearGradient id="wmm-grad" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${sColor}"/>\n      <stop offset="1" stop-color="${eColor}"/>\n    </linearGradient>\n  </defs>`;
    legendG = `\n  <g font-family="Inter, system-ui, sans-serif">\n    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="2" fill="url(#wmm-grad)" stroke="#ddd"/>\n    <text x="${barX}" y="${barY + barH + 14}" font-size="11" fill="#333">${range[0]}</text>\n    <text x="${barX + barW}" y="${barY + barH + 14}" font-size="11" fill="#333" text-anchor="end">${range[1]}</text>\n  </g>`;
    metadataInner = entries.map(e => `<wmm:value id="${esc(e.id)}" v="${e.v}"/>`).join('');
  } else {
    legendG = groups.length === 0 ? '' : `\n  <g transform="translate(40, ${H - 40 - groups.length * 22})">\n    ${groups.map((g, i) => `<g transform="translate(0, ${i * 22})"><rect width="14" height="14" rx="2" fill="${colorById(g.colorId)}"/><text x="22" y="11" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#222">${esc(g.name)} (${g.members.length})</text></g>`).join('\n    ')}\n  </g>`;
    metadataInner = groups.map(g =>
      `<wmm:group id="${esc(g.id)}" name="${esc(g.name)}" color="${esc(colorById(g.colorId))}">${g.members.map(m => `<wmm:member id="${esc(m)}"/>`).join('')}</wmm:group>`
    ).join('\n    ');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <title>${esc(title || subject)}</title>
  <desc>${esc(caption || `${subject} map`)}</desc>${defsBlock}
  <metadata xmlns:wmm="https://wiki-map-maker.local/schema">
    <wmm:doc mode="${esc(mode)}" subject="${esc(subject)}" worldMode="${esc(worldMode)}"/>
    ${metadataInner}
  </metadata>
  <rect width="${W}" height="${H}" fill="#fafaf7"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#d9d9d2" stroke-width="1"/>
  <g transform="translate(40, 56)">
    <text font-family="'Source Serif 4', Georgia, serif" font-size="28" font-weight="600" fill="#1a1a1a">${esc(title || subject)}</text>
    ${caption ? `<text y="22" font-family="'Source Serif 4', Georgia, serif" font-size="13" font-style="italic" fill="#555">${esc(caption)}</text>` : ''}
  </g>
  <g transform="translate(${W / 2}, ${H / 2})" font-family="Inter, system-ui, sans-serif" text-anchor="middle">
    <text y="14" font-size="18" font-weight="600" fill="#444">${esc(subject)} map — renderer pending</text>
    <text y="38" font-size="12" fill="#888">${groups.length} group${groups.length === 1 ? '' : 's'} configured</text>
  </g>
  ${legendG}
</svg>`;
}
