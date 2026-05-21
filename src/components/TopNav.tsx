import { useState, useRef, useEffect } from 'react';
import { CONTINENTS, COUNTRIES, byContinent, continentById, countryById, SUBDIVISIONS } from '../data/mapData';
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
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

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
    <header className="topnav">
      <div className="brand">
        <BrandMark />
        <div className="brand-text">
          <div className="brand-name">Wiki Map Maker</div>
        </div>
      </div>

      <nav className="tabs" ref={menuRef}>
        <button
          className={`tab ${mode === 'world' ? 'is-active' : ''}`}
          onClick={() => { setMode('world'); setOpenMenu(null); }}
        >
          <span className="tab-glyph">◐</span>
          <span className="tab-text">World</span>
        </button>

        <div className="tab-dd">
          <button
            className={`tab tab-with-dd ${mode === 'continent' ? 'is-active' : ''}`}
            onClick={() => setOpenMenu(openMenu === 'continent' ? null : 'continent')}
          >
            <span className="tab-glyph">◰</span>
            <span className="tab-text">Continent</span>
            {mode === 'continent' && continent && (
              <span className="tab-current">{continent.name}</span>
            )}
            <Chev open={openMenu === 'continent'} />
          </button>
          {openMenu === 'continent' && (
            <div className="dd-menu">
              <div className="dd-head">Select continent</div>
              <ul>
                {CONTINENTS.map(c => (
                  <li key={c.id}>
                    <button
                      className={`dd-item ${continentId === c.id && mode === 'continent' ? 'is-active' : ''}`}
                      onClick={() => pickContinent(c.id)}
                    >
                      <span className="dd-code">{c.id}</span>
                      <span className="dd-name">{c.name}</span>
                      <span className="dd-count">{byContinent(c.id).length} countries</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tab-dd">
          <button
            className={`tab tab-with-dd ${mode === 'country' ? 'is-active' : ''}`}
            onClick={() => setOpenMenu(openMenu === 'country' ? null : 'country')}
          >
            <span className="tab-glyph">◧</span>
            <span className="tab-text">Country</span>
            {mode === 'country' && country && (
              <span className="tab-current">{country.name}</span>
            )}
            <Chev open={openMenu === 'country'} />
          </button>
          {openMenu === 'country' && (
            <div className="dd-menu">
              <div className="dd-head">Select country</div>
              <ul>
                {COUNTRIES.map(c => (
                  <li key={c.id}>
                    <button
                      className={`dd-item ${countryId === c.id && mode === 'country' ? 'is-active' : ''}`}
                      onClick={() => pickCountry(c.id)}
                    >
                      <span className="dd-code">{c.code}</span>
                      <span className="dd-name">{c.name}</span>
                      <span className="dd-count">
                        {(SUBDIVISIONS[c.id]?.regions ?? []).length} regions
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="topnav-right">
        <button className="icon-btn" aria-label="Help" title="Help">?</button>
        <button className="btn btn-primary nav-cta" onClick={onExportSvg}>
          <span className="btn-icon">↓</span>
          <span>Download SVG</span>
        </button>
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
      <path
        d="M1.5 3.5 L5 7 L8.5 3.5"
        stroke="currentColor" strokeWidth="1.4" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className="brand-mark" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
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
