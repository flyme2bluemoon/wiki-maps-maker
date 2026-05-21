import { useState, useEffect, useRef } from 'react';
import {
  WORLD_MAP_TARGETS, GRADIENT_ENDPOINTS, GRADIENT_PRESETS,
  gradientColorById, parseGradientNumber, scaleRange, fmtNum,
  filterAndSortMapTargets,
} from '../data/mapData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ScaleType } from '../types';

interface Props {
  values: Record<string, number | string>;
  setValues: (v: Record<string, number | string>) => void;
  scaleType: ScaleType;
  setScaleType: (v: ScaleType) => void;
  customMin: string; setCustomMin: (v: string) => void;
  customMax: string; setCustomMax: (v: string) => void;
  startColorId: string; setStartColorId: (v: string) => void;
  endColorId: string; setEndColorId: (v: string) => void;
}

export function GradientConfig({
  values, setValues, scaleType, setScaleType,
  customMin, setCustomMin, customMax, setCustomMax,
  startColorId, setStartColorId, endColorId, setEndColorId,
}: Props) {
  const ids = Object.keys(values);
  const numericValues = ids
    .map(id => values[id])
    .map(parseGradientNumber)
    .filter((v): v is number => v !== null);
  const dataMin = numericValues.length ? Math.min(...numericValues) : 0;
  const dataMax = numericValues.length ? Math.max(...numericValues) : 0;

  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPicking(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function addTarget(id: string) {
    if (values[id] !== undefined) return;
    setValues({ ...values, [id]: 0 });
    setSearch(''); setPicking(false);
  }
  function updateValue(id: string, raw: string) {
    if (/^-?(?:\d+\.?\d*|\.\d*)?$/.test(raw)) {
      setValues({ ...values, [id]: raw });
    }
  }
  function removeTarget(id: string) {
    const next = { ...values }; delete next[id]; setValues(next);
  }

  const taken = new Set(ids);
  const available = filterAndSortMapTargets(WORLD_MAP_TARGETS, search, target => taken.has(target.id));
  const groupedAvailable = available.reduce<Record<string, typeof WORLD_MAP_TARGETS>>((acc, c) => {
    const k = c.group;
    (acc[k] = acc[k] ?? []).push(c);
    return acc;
  }, {});

  const range = scaleRange(scaleType, dataMin, dataMax, customMin, customMax);
  const startColor = gradientColorById(startColorId);
  const endColor = gradientColorById(endColorId);

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Data points */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Data points</span>
          <Badge variant="pill">{ids.length}</Badge>
          <span className="flex-1 h-px bg-line" />
        </div>

        {picking && (
          <div className="border border-line rounded-[10px] p-2 bg-paper [box-shadow:0_4px_12px_-6px_oklch(0.2_0.02_240_/_0.12)]" ref={pickerRef}>
            <Input
              className="mb-1.5 text-[12.5px]"
              placeholder="Search map items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-line-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent">
              {available.length === 0 ? (
                <div className="py-[18px] px-2 text-center text-[12px] text-ink-3">
                  {taken.size === WORLD_MAP_TARGETS.length ? 'Every map item has a value' : 'No matches'}
                </div>
              ) : Object.keys(groupedAvailable).map(g => (
                <div key={g}>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3 px-2 pt-2 pb-1 sticky top-0 bg-paper">{g}</div>
                  {groupedAvailable[g].map(c => (
                    <button key={c.id}
                      className="w-full flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-[6px] text-left hover:bg-canvas transition-colors"
                      onClick={() => addTarget(c.id)}
                    >
                      <span className="text-[13px] font-medium">{c.name}</span>
                      <span className="font-mono text-[10px] text-ink-3">{c.id}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {ids.length === 0 ? (
          <div className="border border-dashed border-line-2 rounded-[10px] px-4 py-[18px] flex flex-col gap-1.5 items-center text-center bg-gradient-to-b from-panel to-canvas">
            <div className="font-serif font-semibold text-[14px]">No data yet</div>
            <div className="text-[12px] text-ink-3 leading-[1.5] max-w-[32ch] mb-1">
              Add a map item and a numeric value. Items without values won't be coloured.
            </div>
            <Button variant="default" onClick={() => setPicking(true)}>+ Add your first data point</Button>
          </div>
        ) : (
          <>
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
              {ids.map(id => {
                const target = WORLD_MAP_TARGETS.find(c => c.id === id) ?? { name: id, id };
                return (
                  <li key={id} className="grid grid-cols-[32px_1fr_96px_26px] items-center gap-2 px-2 py-1.5 pl-2 rounded-[8px] bg-paper border border-line hover:border-line-2 transition-colors">
                    <span className="font-mono text-[10.5px] text-ink-3 tracking-[0.05em]">{id}</span>
                    <span className="text-[13px] font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={target.name}>{target.name}</span>
                    <input
                      className="w-full px-2.5 py-1.5 rounded-[6px] border border-line bg-canvas font-mono text-[12.5px] text-right outline-none transition-[border-color,background-color] focus:border-accent focus:bg-paper"
                      type="text"
                      inputMode="decimal"
                      value={values[id] === undefined ? '' : String(values[id])}
                      onChange={e => updateValue(id, e.target.value)}
                      placeholder="0"
                    />
                    <button
                      className="flex items-center justify-center w-full h-full text-[14px] text-ink-3 hover:text-ink transition-colors"
                      onClick={() => removeTarget(id)}
                      aria-label={`Remove ${target.name}`}
                    >×</button>
                  </li>
                );
              })}
            </ul>
            <Button variant="ghost" className="w-full" onClick={() => setPicking(true)}
              disabled={available.length === 0 && !search}>
              + Add map item
            </Button>
          </>
        )}
      </div>

      {/* Scale */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Scale</span>
          <span className="flex-1 h-px bg-line" />
        </div>
        <div className="flex flex-col gap-1.5">
          <ScaleOption checked={scaleType === 'data'} onClick={() => setScaleType('data')}
            label="From data"
            sub={numericValues.length === 0
              ? 'Add at least one value to use this'
              : `min ${fmtNum(dataMin)} → max ${fmtNum(dataMax)}`}
          />
          <ScaleOption checked={scaleType === '0-100'} onClick={() => setScaleType('0-100')}
            label="0 – 100" sub="Fixed percentage range" />
          <ScaleOption checked={scaleType === 'custom'} onClick={() => setScaleType('custom')}
            label="Custom" sub="Pick the min and max">
            {scaleType === 'custom' && (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5 items-end mt-2.5 pt-2.5 border-t border-dashed border-line">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Min</span>
                  <Input type="text" inputMode="decimal" value={customMin} onChange={e => setCustomMin(e.target.value)} />
                </label>
                <span className="text-ink-3 pb-2 text-[14px]">→</span>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Max</span>
                  <Input type="text" inputMode="decimal" value={customMax} onChange={e => setCustomMax(e.target.value)} />
                </label>
              </div>
            )}
          </ScaleOption>
        </div>
      </div>

      {/* Colours */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Colours</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        {/* Gradient bar preview */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 rounded-[4px] border border-line"
            style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }} />
          <div className="flex justify-between font-mono text-[10.5px] text-ink-3 tracking-[0.02em]">
            <span>{fmtNum(range[0])}</span>
            <span>{fmtNum((range[0] + range[1]) / 2)}</span>
            <span>{fmtNum(range[1])}</span>
          </div>
        </div>

        {/* Endpoint pickers */}
        <div className="flex items-center gap-3 p-3 bg-canvas rounded-[10px]">
          <EndpointPicker label="Start" colorId={startColorId} onChange={setStartColorId} />
          <span className="text-ink-3 text-[14px] shrink-0">→</span>
          <EndpointPicker label="End" colorId={endColorId} onChange={setEndColorId} />
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">Presets</span>
          <div className="grid grid-cols-2 gap-1.5">
            {GRADIENT_PRESETS.map(p => {
              const s = gradientColorById(p.start);
              const e = gradientColorById(p.end);
              const active = startColorId === p.start && endColorId === p.end;
              return (
                <button key={p.id}
                  className={cn(
                    "flex flex-col gap-1.5 p-1.5 border rounded-[8px] bg-paper text-left transition-all",
                    active
                      ? "border-ink [box-shadow:0_0_0_2px_oklch(0.20_0.01_240_/_0.12)]"
                      : "border-line hover:border-line-2"
                  )}
                  onClick={() => { setStartColorId(p.start); setEndColorId(p.end); }}
                  title={p.name}
                >
                  <span className="block h-3.5 rounded-[3px] border border-[oklch(0.2_0.01_240/0.12)]"
                    style={{ background: `linear-gradient(to right, ${s}, ${e})` }} />
                  <span className="text-[11.5px] text-ink-2">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaleOption({ checked, onClick, label, sub, children }: {
  checked: boolean; onClick: () => void; label: string; sub: string; children?: React.ReactNode;
}) {
  return (
    <div className={cn(
      "border rounded-[10px] px-3 py-2.5 bg-paper transition-[border-color]",
      checked ? "border-ink [box-shadow:0_0_0_2px_oklch(0.20_0.01_240_/_0.06)]" : "border-line"
    )}>
      <button className="w-full flex items-start gap-2.5 text-left" onClick={onClick} role="radio" aria-checked={checked}>
        <span className={cn(
          "w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-px transition-colors",
          checked ? "border-ink" : "border-line-2"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full bg-ink transition-transform",
            checked ? "scale-100" : "scale-0"
          )} />
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-[13px] font-medium">{label}</span>
          <span className="text-[11.5px] text-ink-3 font-mono tracking-[0.02em]">{sub}</span>
        </span>
      </button>
      {children}
    </div>
  );
}

function EndpointPicker({ label, colorId, onChange }: {
  label: string; colorId: string; onChange: (id: string) => void;
}) {
  const color = gradientColorById(colorId);
  return (
    <div className="flex-1 flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 shrink-0">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex-1 h-7 rounded-[6px] border border-[oklch(0.2_0.01_240/0.18)] hover:scale-[1.02] transition-transform"
            style={{ background: color }}
            aria-label={`${label} colour`}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[200px] p-2.5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3 mb-2">{label} colour</div>
          <div className="grid grid-cols-6 gap-1.5">
            {GRADIENT_ENDPOINTS.map(c => (
              <button key={c.id}
                className={cn(
                  "aspect-square rounded-[6px] border border-[oklch(0.2_0.01_240/0.18)] hover:scale-110 transition-transform",
                  colorId === c.id && "[box-shadow:0_0_0_2px_var(--paper),_0_0_0_3px_var(--ink)]"
                )}
                style={{ background: c.value }}
                onClick={() => onChange(c.id)}
                aria-label={c.id}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
