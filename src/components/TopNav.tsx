import { useState } from 'react';
import { CONTINENTS, COUNTRIES, byContinent, continentById, countryById, SUBDIVISIONS } from '../data/mapData';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { MapMode } from '../types';

interface Props {
  mode: MapMode;
  setMode: (m: MapMode) => void;
  continentId: string;
  setContinentId: (id: string) => void;
  countryId: string;
  setCountryId: (id: string) => void;
  onExportSvg: () => void;
}

export function TopNav({ mode, setMode, continentId, setContinentId, countryId, setCountryId, onExportSvg }: Props) {
  const [openMenu, setOpenMenu] = useState<'continent' | 'country' | null>(null);

  function pickContinent(id: string) {
    setContinentId(id);
    setMode('continent');
    setOpenMenu(null);
  }

  function pickCountry(id: string) {
    setCountryId(id);
    setMode('country');
    setOpenMenu(null);
  }

  const continent = continentById(continentId);
  const country = countryById(countryId);

  return (
    <header className="flex items-center gap-6 px-5 bg-paper border-b border-line relative z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 min-w-[260px]">
        <BrandMark />
        <div className="flex flex-col justify-center h-full">
          <div className="font-serif text-[20px] font-semibold tracking-[-0.01em] leading-none">
            Wiki Map Maker
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {/* World tab */}
        <button
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] font-medium text-[13.5px] transition-[background,color]",
            mode === 'world'
              ? "bg-ink text-paper"
              : "text-ink-2 hover:bg-canvas hover:text-ink"
          )}
          onClick={() => { setMode('world'); setOpenMenu(null); }}
        >
          <span className={cn("text-[14px]", mode === 'world' ? "opacity-100" : "opacity-70")}>◐</span>
          <span>World</span>
        </button>

        {/* Continent dropdown */}
        <Popover
          open={openMenu === 'continent'}
          onOpenChange={open => setOpenMenu(open ? 'continent' : null)}
        >
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-medium text-[13.5px] transition-[background,color]",
                mode === 'continent'
                  ? "bg-ink text-paper"
                  : "text-ink-2 hover:bg-canvas hover:text-ink"
              )}
            >
              <span className={cn("text-[14px]", mode === 'continent' ? "opacity-100" : "opacity-70")}>◰</span>
              <span>Continent</span>
              {mode === 'continent' && continent && (
                <span className={cn(
                  "font-mono text-[11px] pl-2 ml-0.5 tracking-[0.02em]",
                  "border-l border-[oklch(0.50_0_0/1)] text-[oklch(0.85_0.01_80)]"
                )}>
                  {continent.name}
                </span>
              )}
              <Chev open={openMenu === 'continent'} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="min-w-[320px] p-2 [box-shadow:var(--shadow-dropdown)]">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 px-2.5 pt-2 pb-1.5">
              Select continent
            </div>
            <ul className="list-none p-0 m-0">
              {CONTINENTS.map(c => (
                <li key={c.id}>
                  <button
                    className={cn(
                      "w-full grid grid-cols-[32px_1fr_auto] gap-2.5 items-center px-2.5 py-[9px] rounded-[8px] text-left",
                      continentId === c.id && mode === 'continent'
                        ? "bg-accent-soft text-ink"
                        : "hover:bg-canvas"
                    )}
                    onClick={() => pickContinent(c.id)}
                  >
                    <span className={cn(
                      "font-mono text-[10.5px] tracking-[0.05em]",
                      continentId === c.id && mode === 'continent' ? "text-accent" : "text-ink-3"
                    )}>{c.id}</span>
                    <span className="font-medium text-[13.5px]">{c.name}</span>
                    <span className="font-mono text-[10.5px] text-ink-3">{byContinent(c.id).length} countries</span>
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        {/* Country dropdown */}
        <Popover
          open={openMenu === 'country'}
          onOpenChange={open => setOpenMenu(open ? 'country' : null)}
        >
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-medium text-[13.5px] transition-[background,color]",
                mode === 'country'
                  ? "bg-ink text-paper"
                  : "text-ink-2 hover:bg-canvas hover:text-ink"
              )}
            >
              <span className={cn("text-[14px]", mode === 'country' ? "opacity-100" : "opacity-70")}>◧</span>
              <span>Country</span>
              {mode === 'country' && country && (
                <span className={cn(
                  "font-mono text-[11px] pl-2 ml-0.5 tracking-[0.02em]",
                  "border-l border-[oklch(0.50_0_0/1)] text-[oklch(0.85_0.01_80)]"
                )}>
                  {country.name}
                </span>
              )}
              <Chev open={openMenu === 'country'} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="min-w-[320px] p-2 [box-shadow:var(--shadow-dropdown)]">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 px-2.5 pt-2 pb-1.5">
              Select country
            </div>
            <ul className="list-none p-0 m-0">
              {COUNTRIES.map(c => (
                <li key={c.id}>
                  <button
                    className={cn(
                      "w-full grid grid-cols-[32px_1fr_auto] gap-2.5 items-center px-2.5 py-[9px] rounded-[8px] text-left",
                      countryId === c.id && mode === 'country'
                        ? "bg-accent-soft text-ink"
                        : "hover:bg-canvas"
                    )}
                    onClick={() => pickCountry(c.id)}
                  >
                    <span className={cn(
                      "font-mono text-[10.5px] tracking-[0.05em]",
                      countryId === c.id && mode === 'country' ? "text-accent" : "text-ink-3"
                    )}>{c.code}</span>
                    <span className="font-medium text-[13.5px]">{c.name}</span>
                    <span className="font-mono text-[10.5px] text-ink-3">
                      {(SUBDIVISIONS[c.id]?.regions ?? []).length} regions
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Help" title="Help">?</Button>
        <Button variant="default" onClick={onExportSvg}>
          <span className="text-[14px] leading-none">↓</span>
          <span>Download SVG</span>
        </Button>
      </div>
    </header>
  );
}

function Chev({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
    >
      <path d="M1.5 3.5 L5 7 L8.5 3.5" stroke="currentColor" strokeWidth="1.4" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className="text-ink shrink-0" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="5" fill="currentColor" opacity="0.06" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="6" y="6" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="14" y="6" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="22" y="6" width="4" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="6" y="14" width="4" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="12" y="14" width="8" height="6" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="22" y="14" width="4" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="6" y="22" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="16" y="22" width="6" height="4" rx="1.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
