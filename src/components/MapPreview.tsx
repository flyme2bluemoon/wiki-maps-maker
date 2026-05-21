import { useMemo } from 'react';
import { colorById, gradientColorById, parseGradientNumber, scaleRange, fmtNum, worldTargetById } from '../data/mapData';
import { buildWorldMapSvg } from '../lib/svgExport';
import { Badge } from '@/components/ui/badge';
import type { MapMode, WorldMode, ScaleType, Group } from '../types';

interface Props {
  mode: MapMode;
  continentId: string;
  countryId: string;
  title: string;
  caption: string;
  groups: Group[];
  worldMode: WorldMode;
  gradientValues: Record<string, number | string>;
  scaleType: ScaleType;
  customMin: string;
  customMax: string;
  startColorId: string;
  endColorId: string;
  baseSvg: string | null;
  includeOverlay: boolean;
}

export function MapPreview({
  mode, continentId, countryId, title, caption, groups,
  worldMode, gradientValues, scaleType, customMin, customMax,
  startColorId, endColorId, baseSvg, includeOverlay,
}: Props) {
  const subjectLabel =
    mode === 'world' ? 'World' :
    mode === 'continent' ? continentId :
    countryId;

  const isGradient = mode === 'world' && worldMode === 'gradient';
  const targetLabel =
    mode === 'world' ? 'map items' :
    mode === 'country' ? 'regions' :
    'countries';

  const previewDataUrl = useMemo<string | null>(() => {
    if (mode !== 'world' || !baseSvg) return null;
    try {
      const svg = buildWorldMapSvg(baseSvg, {
        title, caption, groups, worldMode,
        gradientValues, scaleType, customMin, customMax,
        startColorId, endColorId, includeOverlay,
      });
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } catch { return null; }
  }, [baseSvg, mode, title, caption, groups, worldMode, gradientValues,
      scaleType, customMin, customMax, startColorId, endColorId, includeOverlay]);

  let gradientInfo: {
    entries: { id: string; v: number }[];
    range: [number, number];
    startColor: string;
    endColor: string;
  } | null = null;

  if (isGradient) {
    const entries = Object.entries(gradientValues)
      .map(([id, value]) => ({ id, v: parseGradientNumber(value) }))
      .filter((entry): entry is { id: string; v: number } => entry.v !== null);
    const vals = entries.map(e => e.v);
    const dataMin = vals.length ? Math.min(...vals) : 0;
    const dataMax = vals.length ? Math.max(...vals) : 0;
    gradientInfo = {
      entries, range: scaleRange(scaleType, dataMin, dataMax, customMin, customMax),
      startColor: gradientColorById(startColorId),
      endColor: gradientColorById(endColorId),
    };
  }

  return (
    <div className="w-full max-w-[820px] flex flex-col gap-4">
      {/* Header */}
      <header>
        <div className="flex gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <span>{mode === 'world' ? 'World map' : mode === 'continent' ? 'Continent map' : 'Country map'}</span>
          <span className="opacity-50">·</span>
          <span>{subjectLabel}</span>
        </div>
        <h2 className="font-serif text-[30px] font-semibold tracking-[-0.015em] leading-[1.1] mt-1.5">
          {title || subjectLabel}
        </h2>
        {caption && (
          <p className="font-serif text-[14.5px] leading-[1.5] text-ink-2 italic mt-2 max-w-[64ch]">{caption}</p>
        )}
      </header>

      {/* Frame */}
      <div className="preview-frame">
        {previewDataUrl ? (
          <img src={previewDataUrl} alt={title || 'World map preview'} className="preview-map-img" />
        ) : (
          <div className="preview-blank">
            {mode === 'world' && !baseSvg ? (
              <div className="font-serif text-[16px] text-ink-2 font-semibold">Loading map…</div>
            ) : (
              <>
                <BlankGlyph />
                <div className="font-serif text-[16px] text-ink-2 font-semibold">Map preview</div>
                <div className="text-[12.5px] max-w-[32ch] leading-[1.5]">
                  The SVG will be generated from your configuration.
                </div>
              </>
            )}
          </div>
        )}
        <div className="preview-frame-corners"><span /><span /><span /><span /></div>
      </div>

      {/* Legend */}
      {isGradient && gradientInfo ? (
        <GradientLegend info={gradientInfo} />
      ) : groups.length > 0 ? (
        <div className="bg-paper border border-line rounded-[8px] px-[18px] py-3.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 mb-2">Legend</div>
          <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
            {groups.map(g => (
              <li key={g.id} className="flex items-center gap-2.5 text-[13px]">
                <span className="w-3.5 h-3.5 rounded-[3px] border border-[oklch(0.2_0.01_240/0.18)] shrink-0"
                  style={{ background: colorById(g.colorId) }} />
                <span className="flex-1 font-medium">{g.name}</span>
                <span className="font-mono text-[10.5px] text-ink-3 tracking-[0.04em]">
                  {g.members.length} {targetLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-paper border border-line rounded-[8px] px-[18px] py-3.5 italic text-ink-3 text-[13px] text-center">
          No groups yet — create one in the configuration panel to colour the map.
        </div>
      )}
    </div>
  );
}

function BlankGlyph() {
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true" className="text-ink-3 mb-1">
      <defs>
        <pattern id="bgDots" patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="1.2" cy="1.2" r="0.7" fill="currentColor" opacity="0.18" />
        </pattern>
      </defs>
      <rect x="3" y="3" width="72" height="72" rx="6" fill="url(#bgDots)" stroke="currentColor"
        strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M14 36 Q22 22 32 28 T54 30 T68 38" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
      <path d="M10 50 Q22 44 36 50 T60 52 T70 48" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx="26" cy="32" r="1.4" fill="currentColor" opacity="0.6" />
      <circle cx="48" cy="40" r="1.4" fill="currentColor" opacity="0.6" />
      <circle cx="60" cy="50" r="1.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function GradientLegend({ info }: {
  info: { range: [number, number]; startColor: string; endColor: string; entries: { id: string; v: number }[] };
}) {
  const { range, startColor, endColor, entries } = info;
  return (
    <div className="bg-paper border border-line rounded-[8px] px-[18px] py-3.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 mb-2 flex items-center justify-between">
        <span>Gradient legend</span>
        <Badge variant="pill">{entries.length} {entries.length === 1 ? 'value' : 'values'}</Badge>
      </div>
      <div className="h-4 rounded-[4px] border border-line mb-1"
        style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }} />
      <div className="flex justify-between font-mono text-[10.5px] text-ink-3 tracking-[0.02em] mb-2.5">
        <span>{fmtNum(range[0])}</span>
        <span>{fmtNum((range[0] + range[1]) / 2)}</span>
        <span>{fmtNum(range[1])}</span>
      </div>
      {entries.length > 0 && (
        <div className="border-t border-dashed border-line pt-2 grid grid-cols-2 gap-x-[18px] gap-y-1">
          {entries.slice(0, 6).map(e => {
            const c = worldTargetById(e.id);
            return (
              <div key={e.id} className="flex justify-between gap-2 text-[12px]">
                <span className="text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">{c ? c.name : e.id}</span>
                <span className="font-mono text-[11.5px] text-ink font-medium">{fmtNum(e.v)}</span>
              </div>
            );
          })}
          {entries.length > 6 && (
            <div className="col-span-2 text-[11.5px] text-ink-3 italic mt-1">+ {entries.length - 6} more…</div>
          )}
        </div>
      )}
    </div>
  );
}
