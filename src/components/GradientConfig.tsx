import { useState, useEffect, useRef } from 'react';
import {
  UN_COUNTRIES,
  GRADIENT_ENDPOINTS,
  GRADIENT_PRESETS,
  continentById,
  gradientColorById,
  scaleRange,
  fmtNum,
} from '../data/mapData';
import type { ScaleType } from '../types';

interface Props {
  values: Record<string, number | string>;
  setValues: (v: Record<string, number | string>) => void;
  scaleType: ScaleType;
  setScaleType: (v: ScaleType) => void;
  customMin: string;
  setCustomMin: (v: string) => void;
  customMax: string;
  setCustomMax: (v: string) => void;
  startColorId: string;
  setStartColorId: (v: string) => void;
  endColorId: string;
  setEndColorId: (v: string) => void;
}

export function GradientConfig({
  values, setValues,
  scaleType, setScaleType,
  customMin, setCustomMin,
  customMax, setCustomMax,
  startColorId, setStartColorId,
  endColorId, setEndColorId,
}: Props) {
  const ids = Object.keys(values);
  const numericValues = ids
    .map(id => values[id])
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  const dataMin = numericValues.length ? Math.min(...numericValues) : 0;
  const dataMax = numericValues.length ? Math.max(...numericValues) : 0;

  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPicking(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function addCountry(id: string) {
    if (values[id] !== undefined) return;
    setValues({ ...values, [id]: 0 });
    setSearch('');
    setPicking(false);
  }

  function updateValue(id: string, raw: string) {
    if (raw === '' || raw === '-' || raw === '.') {
      setValues({ ...values, [id]: raw });
      return;
    }
    const n = Number(raw);
    setValues({ ...values, [id]: Number.isNaN(n) ? raw : n });
  }

  function removeCountry(id: string) {
    const next = { ...values };
    delete next[id];
    setValues(next);
  }

  const taken = new Set(ids);
  const available = UN_COUNTRIES.filter(
    c => !taken.has(c.id) && c.name.toLowerCase().includes(search.toLowerCase())
  );
  const groupedAvailable = available.reduce<Record<string, typeof UN_COUNTRIES>>((acc, c) => {
    const k = continentById(c.continent)?.name ?? '—';
    (acc[k] = acc[k] ?? []).push(c);
    return acc;
  }, {});

  const range = scaleRange(scaleType, dataMin, dataMax, customMin, customMax);
  const startColor = gradientColorById(startColorId);
  const endColor = gradientColorById(endColorId);

  return (
    <div className="gradient-config">
      {/* Data points */}
      <div className="gc-block">
        <div className="gc-block-head">
          <span className="gc-block-title">Data points</span>
          <span className="gc-block-count">{ids.length}</span>
          <span className="gc-rule" />
        </div>

        {picking && (
          <div className="gc-picker" ref={pickerRef}>
            <input
              className="ip-text ip-search"
              placeholder="Search countries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="add-scroll">
              {available.length === 0 ? (
                <div className="empty">
                  {taken.size === UN_COUNTRIES.length ? 'Every country has a value' : 'No matches'}
                </div>
              ) : (
                Object.keys(groupedAvailable).map(g => (
                  <div key={g} className="add-group">
                    <div className="add-group-head">{g}</div>
                    {groupedAvailable[g].map(c => (
                      <button key={c.id} className="add-item" onClick={() => addCountry(c.id)}>
                        <span className="add-item-label">{c.name}</span>
                        <span className="add-item-sub">{c.id}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {ids.length === 0 ? (
          <div className="gc-empty">
            <div className="gc-empty-title">No data yet</div>
            <div className="gc-empty-sub">
              Add a country and a numeric value. Decimals are fine. Countries without values won't be coloured.
            </div>
            <button className="btn btn-primary" onClick={() => setPicking(true)}>
              + Add your first data point
            </button>
          </div>
        ) : (
          <>
            <ul className="dp-list">
              {ids.map(id => {
                const country = UN_COUNTRIES.find(c => c.id === id) ?? { name: id, id };
                const v = values[id];
                return (
                  <li className="dp-row" key={id}>
                    <span className="dp-code">{id}</span>
                    <span className="dp-name" title={country.name}>{country.name}</span>
                    <input
                      className="dp-input"
                      type="text"
                      inputMode="decimal"
                      value={v === undefined ? '' : String(v)}
                      onChange={e => updateValue(id, e.target.value)}
                      placeholder="0"
                    />
                    <button
                      className="icon-btn icon-btn-sm dp-x"
                      onClick={() => removeCountry(id)}
                      aria-label={`Remove ${country.name}`}
                    >×</button>
                  </li>
                );
              })}
            </ul>
            <button
              className="btn btn-block btn-ghost"
              onClick={() => setPicking(true)}
              disabled={available.length === 0 && !search}
            >
              + Add country
            </button>
          </>
        )}
      </div>

      {/* Scale */}
      <div className="gc-block">
        <div className="gc-block-head">
          <span className="gc-block-title">Scale</span>
          <span className="gc-rule" />
        </div>
        <div className="scale-options">
          <ScaleOption
            checked={scaleType === 'data'}
            onClick={() => setScaleType('data')}
            label="From data"
            sub={numericValues.length === 0
              ? 'Add at least one value to use this'
              : `min ${fmtNum(dataMin)} → max ${fmtNum(dataMax)}`}
          />
          <ScaleOption
            checked={scaleType === '0-100'}
            onClick={() => setScaleType('0-100')}
            label="0 – 100"
            sub="Fixed percentage range"
          />
          <ScaleOption
            checked={scaleType === 'custom'}
            onClick={() => setScaleType('custom')}
            label="Custom"
            sub="Pick the min and max"
          >
            {scaleType === 'custom' && (
              <div className="custom-scale">
                <label className="custom-scale-field">
                  <span>Min</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="ip-text"
                    value={customMin}
                    onChange={e => setCustomMin(e.target.value)}
                  />
                </label>
                <span className="custom-arrow">→</span>
                <label className="custom-scale-field">
                  <span>Max</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="ip-text"
                    value={customMax}
                    onChange={e => setCustomMax(e.target.value)}
                  />
                </label>
              </div>
            )}
          </ScaleOption>
        </div>
      </div>

      {/* Colours */}
      <div className="gc-block">
        <div className="gc-block-head">
          <span className="gc-block-title">Colours</span>
          <span className="gc-rule" />
        </div>

        <div className="gradient-preview">
          <div
            className="gradient-bar"
            style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }}
          />
          <div className="gradient-bar-ticks">
            <span>{fmtNum(range[0])}</span>
            <span>{fmtNum((range[0] + range[1]) / 2)}</span>
            <span>{fmtNum(range[1])}</span>
          </div>
        </div>

        <div className="gradient-endpoints">
          <EndpointPicker label="Start" colorId={startColorId} onChange={setStartColorId} />
          <span className="gradient-arrow">→</span>
          <EndpointPicker label="End" colorId={endColorId} onChange={setEndColorId} />
        </div>

        <div className="gradient-presets">
          <span className="gradient-presets-label">Presets</span>
          <div className="preset-row">
            {GRADIENT_PRESETS.map(p => {
              const s = gradientColorById(p.start);
              const e = gradientColorById(p.end);
              const active = startColorId === p.start && endColorId === p.end;
              return (
                <button
                  key={p.id}
                  className={`preset-card ${active ? 'is-active' : ''}`}
                  onClick={() => { setStartColorId(p.start); setEndColorId(p.end); }}
                  title={p.name}
                >
                  <span className="preset-bar" style={{ background: `linear-gradient(to right, ${s}, ${e})` }} />
                  <span className="preset-name">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaleOption({
  checked, onClick, label, sub, children,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`scale-option ${checked ? 'is-checked' : ''}`}>
      <button className="scale-radio" onClick={onClick} role="radio" aria-checked={checked}>
        <span className="radio-mark"><span /></span>
        <span className="radio-text">
          <span className="radio-label">{label}</span>
          <span className="radio-sub">{sub}</span>
        </span>
      </button>
      {children}
    </div>
  );
}

function EndpointPicker({ label, colorId, onChange }: {
  label: string;
  colorId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const color = gradientColorById(colorId);
  return (
    <div className="endpoint" ref={ref}>
      <span className="endpoint-label">{label}</span>
      <button
        className="endpoint-btn"
        onClick={() => setOpen(v => !v)}
        style={{ background: color }}
        aria-label={`${label} colour`}
      />
      {open && (
        <div className="color-popover endpoint-popover">
          <div className="color-popover-head">{label} colour</div>
          <div className="color-grid color-grid-wide">
            {GRADIENT_ENDPOINTS.map(c => (
              <button
                key={c.id}
                className={`color-swatch ${colorId === c.id ? 'is-active' : ''}`}
                style={{ background: c.value }}
                onClick={() => { onChange(c.id); setOpen(false); }}
                aria-label={c.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
