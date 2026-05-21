import { useMemo } from 'react';
import {
  UN_COUNTRIES,
  SUBDIVISIONS,
  GROUP_COLORS,
  byContinent,
  countryById,
  continentById,
  colorById,
} from '../data/mapData';
import { GroupCard } from './GroupCard';
import { GradientConfig } from './GradientConfig';
import type { MapMode, WorldMode, ScaleType, Group } from '../types';

interface Props {
  mode: MapMode;
  continentId: string;
  countryId: string;
  title: string;
  setTitle: (v: string) => void;
  caption: string;
  setCaption: (v: string) => void;
  groups: Group[];
  setGroups: (fn: Group[] | ((prev: Group[]) => Group[])) => void;
  onExportSvg: () => void;
  includeOverlay: boolean;
  setIncludeOverlay: (v: boolean) => void;
  worldMode: WorldMode;
  setWorldMode: (v: WorldMode) => void;
  gradientValues: Record<string, number | string>;
  setGradientValues: (v: Record<string, number | string>) => void;
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

export function ConfigPanel(props: Props) {
  const {
    mode, continentId, countryId,
    title, setTitle,
    caption, setCaption,
    groups, setGroups,
    onExportSvg,
    includeOverlay, setIncludeOverlay,
    worldMode, setWorldMode,
    gradientValues, setGradientValues,
    scaleType, setScaleType,
    customMin, setCustomMin,
    customMax, setCustomMax,
    startColorId, setStartColorId,
    endColorId, setEndColorId,
  } = props;

  const targets = useMemo(() => {
    if (mode === 'world') {
      return UN_COUNTRIES.map(c => ({
        id: c.id,
        label: c.name,
        sub: continentById(c.continent)?.name ?? '—',
      }));
    } else if (mode === 'continent') {
      return byContinent(continentId).map(c => ({ id: c.id, label: c.name, sub: 'Country' }));
    }
    const sd = SUBDIVISIONS[countryId];
    if (!sd) return [];
    return sd.regions.map(r => ({ id: r, label: r, sub: 'Region' }));
  }, [mode, continentId, countryId]);

  const targetNoun = mode === 'country' ? 'regions' : 'countries';
  const targetNounSingular = mode === 'country' ? 'region' : 'country';

  function nextColorId() {
    const used = new Set(groups.map(g => g.colorId));
    const free = GROUP_COLORS.find(c => !used.has(c.id));
    return (free ?? GROUP_COLORS[groups.length % GROUP_COLORS.length]).id;
  }

  function addGroup() {
    const n = groups.length + 1;
    const g: Group = {
      id: 'g-' + Math.random().toString(36).slice(2, 8),
      name: `Group ${n}`,
      colorId: nextColorId(),
      members: [],
    };
    setGroups([...groups, g]);
  }

  function updateGroup(id: string, patch: Partial<Group>) {
    setGroups(groups.map(g => g.id === id ? { ...g, ...patch } : g));
  }

  function deleteGroup(id: string) {
    setGroups(groups.filter(g => g.id !== id));
  }

  function addMember(groupId: string, memberId: string) {
    const g = groups.find(x => x.id === groupId);
    if (!g || g.members.includes(memberId)) return;
    updateGroup(groupId, { members: [...g.members, memberId] });
  }

  function removeMember(groupId: string, memberId: string) {
    const g = groups.find(x => x.id === groupId);
    if (!g) return;
    updateGroup(groupId, { members: g.members.filter(m => m !== memberId) });
  }

  const modeTitle =
    mode === 'world' ? 'World map' :
    mode === 'continent' ? `${continentById(continentId)?.name ?? ''} map` :
    `${countryById(countryId)?.name ?? ''} map`;

  const isGradient = mode === 'world' && worldMode === 'gradient';

  return (
    <aside className="config-panel">
      <div className="config-header">
        <div className="config-eyebrow">Configuration</div>
        <h2 className="config-h2">{modeTitle}</h2>
      </div>

      <Section title="Document" num="01">
        <Field label="Title">
          <input
            className="ip-text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Map title"
          />
        </Field>
        <Field label="Caption (optional)">
          <textarea
            className="ip-text ip-textarea"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={2}
            placeholder="Caption embedded as <desc> in the SVG"
          />
        </Field>
      </Section>

      {mode === 'world' && (
        <div className="cfg-section-mode">
          <div className="mode-switch">
            <button
              className={`mode-tab ${worldMode === 'groups' ? 'is-active' : ''}`}
              onClick={() => setWorldMode('groups')}
            >
              <span className="mode-tab-glyph">⬡</span>
              <span>Groups</span>
            </button>
            <button
              className={`mode-tab ${worldMode === 'gradient' ? 'is-active' : ''}`}
              onClick={() => setWorldMode('gradient')}
            >
              <span className="mode-tab-glyph">▦</span>
              <span>Gradient</span>
            </button>
          </div>
        </div>
      )}

      {isGradient ? (
        <Section title="Gradient" num="02">
          <GradientConfig
            values={gradientValues}
            setValues={setGradientValues}
            scaleType={scaleType}
            setScaleType={setScaleType}
            customMin={customMin} setCustomMin={setCustomMin}
            customMax={customMax} setCustomMax={setCustomMax}
            startColorId={startColorId} setStartColorId={setStartColorId}
            endColorId={endColorId} setEndColorId={setEndColorId}
          />
        </Section>
      ) : (
        <Section title="Groups" num="02">
          {groups.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">⬡</div>
              <div className="empty-title">No groups yet</div>
              <div className="empty-sub">
                Groups let you colour {targetNoun} together — e.g. EU member states, OECD, BRICS.
                A {targetNounSingular} can belong to more than one group.
              </div>
              <button className="btn btn-primary" onClick={addGroup}>
                + Create your first group
              </button>
            </div>
          ) : (
            <div className="group-list">
              {groups.map(g => (
                <GroupCard
                  key={g.id}
                  group={g}
                  targets={targets}
                  targetNoun={targetNoun}
                  targetNounSingular={targetNounSingular}
                  onRename={name => updateGroup(g.id, { name })}
                  onSetColor={colorId => updateGroup(g.id, { colorId })}
                  onDelete={() => deleteGroup(g.id)}
                  onAddMember={id => addMember(g.id, id)}
                  onRemoveMember={id => removeMember(g.id, id)}
                />
              ))}
              <button className="btn btn-block btn-ghost" onClick={addGroup}>
                + Add group
              </button>
            </div>
          )}
        </Section>
      )}

      <Section title="Export" num="03">
        {mode === 'world' && (
          <label className="field field-inline">
            <input
              type="checkbox"
              checked={includeOverlay}
              onChange={e => setIncludeOverlay(e.target.checked)}
            />
            <span className="field-label">Include title &amp; legend overlay</span>
          </label>
        )}
        <button className="btn btn-primary btn-block" onClick={onExportSvg}>
          <span className="btn-icon">↓</span>
          <span>Download SVG</span>
        </button>
      </Section>
    </aside>
  );
}

function Section({ title, num, children }: {
  title: string;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cfg-section">
      <header className="cfg-section-head">
        <span className="cfg-num">{num}</span>
        <h3 className="cfg-title">{title}</h3>
        <span className="cfg-rule" />
      </header>
      <div className="cfg-body">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
