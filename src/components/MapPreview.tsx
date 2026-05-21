import { useMemo } from 'react';
import { colorById, gradientColorById, scaleRange, fmtNum, unCountryById } from '../data/mapData';
import { buildWorldMapSvg } from '../lib/svgExport';
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
  const subject =
    mode === 'world' ? 'World' :
    mode === 'continent' ? continentId :
    countryId;

  const subjectLabel =
    mode === 'world' ? 'World' :
    mode === 'continent' ? continentId :
    countryId;

  const isGradient = mode === 'world' && worldMode === 'gradient';
  const targetLabel = mode === 'country' ? 'regions' : 'countries';

  // Build a data URL for the live map preview — mirrors the export toggle
  // so what you see in the preview matches what you download.
  const previewDataUrl = useMemo<string | null>(() => {
    if (mode !== 'world' || !baseSvg) return null;
    try {
      const svg = buildWorldMapSvg(baseSvg, {
        title, caption, groups, worldMode,
        gradientValues, scaleType, customMin, customMax,
        startColorId, endColorId,
        includeOverlay,
      });
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } catch {
      return null;
    }
  }, [baseSvg, mode, title, caption, groups, worldMode, gradientValues,
      scaleType, customMin, customMax, startColorId, endColorId, includeOverlay]);
  const totalMembers = groups.reduce((n, g) => n + g.members.length, 0);

  let gradientInfo: {
    entries: { id: string; v: number }[];
    range: [number, number];
    startColor: string;
    endColor: string;
    scaleType: ScaleType;
  } | null = null;

  if (isGradient) {
    const entries = Object.entries(gradientValues)
      .map(([id, v]) => ({ id, v: Number(v) }))
      .filter(({ v }) => Number.isFinite(v));
    const vals = entries.map(e => e.v);
    const dataMin = vals.length ? Math.min(...vals) : 0;
    const dataMax = vals.length ? Math.max(...vals) : 0;
    const range = scaleRange(scaleType, dataMin, dataMax, customMin, customMax);
    gradientInfo = {
      entries,
      range,
      startColor: gradientColorById(startColorId),
      endColor: gradientColorById(endColorId),
      scaleType,
    };
  }

  return (
    <div className="preview-doc">
      <header className="preview-doc-head">
        <div className="preview-eyebrow">
          <span>{mode === 'world' ? 'World map' : mode === 'continent' ? 'Continent map' : 'Country map'}</span>
          <span className="dot">·</span>
          <span>{subjectLabel}</span>
        </div>
        <h2 className="preview-doc-title">{title || subjectLabel}</h2>
        {caption && <p className="preview-doc-caption">{caption}</p>}
      </header>

      <div className="preview-frame">
        {/* Background layer — map image or placeholder */}
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={title || 'World map preview'}
            className="preview-map-img"
          />
        ) : (
          <div className="preview-blank">
            {mode === 'world' && !baseSvg ? (
              <div className="preview-blank-title">Loading map…</div>
            ) : (
              <>
                <BlankGlyph />
                <div className="preview-blank-title">Map preview</div>
                <div className="preview-blank-sub">
                  The SVG will be generated from your configuration.
                </div>
              </>
            )}
          </div>
        )}

        {/* Foreground layers — rendered after img so they paint on top */}
        <div className="preview-frame-corners">
          <span /><span /><span /><span />
        </div>

        <div className="preview-meta">
          <div className="meta-row">
            <span className="meta-key">Subject</span>
            <span className="meta-val">{subjectLabel}</span>
          </div>
          {isGradient && gradientInfo ? (
            <>
              <div className="meta-row">
                <span className="meta-key">Data points</span>
                <span className="meta-val">{gradientInfo.entries.length}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Scale</span>
                <span className="meta-val">{scaleTypeLabel(scaleType)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="meta-row">
                <span className="meta-key">Groups</span>
                <span className="meta-val">{groups.length}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">{targetLabel.charAt(0).toUpperCase() + targetLabel.slice(1)}</span>
                <span className="meta-val">{totalMembers} assigned</span>
              </div>
            </>
          )}
          <div className="meta-row">
            <span className="meta-key">Format</span>
            <span className="meta-val">SVG · vector</span>
          </div>
        </div>
      </div>

      {isGradient && gradientInfo ? (
        <GradientLegend info={gradientInfo} />
      ) : groups.length > 0 ? (
        <div className="preview-legend">
          <div className="preview-legend-head">Legend</div>
          <ul className="legend-list">
            {groups.map(g => (
              <li key={g.id} className="legend-item">
                <span className="legend-chip" style={{ background: colorById(g.colorId) }} />
                <span className="legend-name">{g.name}</span>
                <span className="legend-count">{g.members.length} {targetLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="preview-legend preview-legend-empty">
          No groups yet — create one in the configuration panel to colour the map.
        </div>
      )}
    </div>
  );
}

function BlankGlyph() {
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true" className="blank-glyph">
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

function scaleTypeLabel(t: ScaleType): string {
  if (t === '0-100') return '0 – 100';
  if (t === 'custom') return 'Custom';
  return 'From data';
}

function GradientLegend({ info }: {
  info: {
    range: [number, number];
    startColor: string;
    endColor: string;
    entries: { id: string; v: number }[];
  };
}) {
  const { range, startColor, endColor, entries } = info;
  return (
    <div className="preview-legend gradient-legend">
      <div className="preview-legend-head">
        <span>Gradient legend</span>
        <span className="legend-count-pill">
          {entries.length} {entries.length === 1 ? 'value' : 'values'}
        </span>
      </div>
      <div
        className="legend-gradient-bar"
        style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }}
      />
      <div className="legend-gradient-ticks">
        <span>{fmtNum(range[0])}</span>
        <span>{fmtNum((range[0] + range[1]) / 2)}</span>
        <span>{fmtNum(range[1])}</span>
      </div>
      {entries.length > 0 && (
        <div className="legend-data-preview">
          {entries.slice(0, 6).map(e => {
            const c = unCountryById(e.id);
            return (
              <div key={e.id} className="legend-data-row">
                <span className="legend-data-name">{c ? c.name : e.id}</span>
                <span className="legend-data-val">{fmtNum(e.v)}</span>
              </div>
            );
          })}
          {entries.length > 6 && (
            <div className="legend-data-more">+ {entries.length - 6} more…</div>
          )}
        </div>
      )}
    </div>
  );
}
