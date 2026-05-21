import { useMemo } from 'react';
import {
  WORLD_MAP_TARGETS, SUBDIVISIONS, GROUP_COLORS,
  byContinent, countryById, continentById,
} from '../data/mapData';
import { GroupCard } from './GroupCard';
import { GradientConfig } from './GradientConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
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
    title, setTitle, caption, setCaption,
    groups, setGroups, onExportSvg,
    includeOverlay, setIncludeOverlay,
    worldMode, setWorldMode,
    gradientValues, setGradientValues,
    scaleType, setScaleType,
    customMin, setCustomMin, customMax, setCustomMax,
    startColorId, setStartColorId, endColorId, setEndColorId,
  } = props;

  const targets = useMemo(() => {
    if (mode === 'world') {
      return WORLD_MAP_TARGETS.map(target => ({
        id: target.id, label: target.name,
        sub: target.group,
        aliases: target.aliases,
        searchText: target.searchText,
      }));
    } else if (mode === 'continent') {
      return byContinent(continentId).map(c => ({ id: c.id, label: c.name, sub: 'Country' }));
    }
    const sd = SUBDIVISIONS[countryId];
    if (!sd) return [];
    return sd.regions.map(r => ({ id: r, label: r, sub: 'Region' }));
  }, [mode, continentId, countryId]);

  const targetNoun =
    mode === 'world' ? 'map items' :
    mode === 'country' ? 'regions' :
    'countries';
  const targetNounSingular =
    mode === 'world' ? 'map item' :
    mode === 'country' ? 'region' :
    'country';

  function nextColorId() {
    const used = new Set(groups.map(g => g.colorId));
    const free = GROUP_COLORS.find(c => !used.has(c.id));
    return (free ?? GROUP_COLORS[groups.length % GROUP_COLORS.length]).id;
  }
  function addGroup() {
    const g: Group = {
      id: 'g-' + Math.random().toString(36).slice(2, 8),
      name: `Group ${groups.length + 1}`,
      colorId: nextColorId(),
      members: [],
    };
    setGroups([...groups, g]);
  }
  function updateGroup(id: string, patch: Partial<Group>) {
    setGroups(groups.map(g => g.id === id ? { ...g, ...patch } : g));
  }
  function deleteGroup(id: string) { setGroups(groups.filter(g => g.id !== id)); }
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
      {/* Sticky header */}
      <div className="px-6 pt-5 pb-4 border-b border-line sticky top-0 bg-paper z-[2]">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Configuration</div>
        <h2 className="font-serif text-[22px] font-semibold mt-1 tracking-[-0.01em]">{modeTitle}</h2>
      </div>

      {/* Document */}
      <Section title="Document" num="01">
        <Field label="Title">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Map title"
          />
        </Field>
        <Field label="Caption (optional)">
          <Textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={2}
            placeholder="Caption embedded as <desc> in the SVG"
          />
        </Field>
        {mode === 'world' && (
          <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <Switch
              checked={includeOverlay}
              onCheckedChange={setIncludeOverlay}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
              Include title &amp; legend overlay
            </span>
          </label>
        )}
      </Section>

      {/* Mode switch (world only) */}
      {mode === 'world' && (
        <div className="px-6 py-3.5 border-b border-line">
          <div className="flex gap-1 p-[3px] bg-canvas border border-line rounded-[9px]">
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-[7px] rounded-[6px] text-[12.5px] font-medium transition-all",
                worldMode === 'groups'
                  ? "bg-paper text-ink [box-shadow:0_1px_2px_oklch(0.2_0.02_240_/_0.10)]"
                  : "text-ink-3 hover:text-ink"
              )}
              onClick={() => setWorldMode('groups')}
            >
              <span className={cn("text-[13px]", worldMode === 'groups' ? "opacity-100" : "opacity-70")}>⬡</span>
              <span>Groups</span>
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-[7px] rounded-[6px] text-[12.5px] font-medium transition-all",
                worldMode === 'gradient'
                  ? "bg-paper text-ink [box-shadow:0_1px_2px_oklch(0.2_0.02_240_/_0.10)]"
                  : "text-ink-3 hover:text-ink"
              )}
              onClick={() => setWorldMode('gradient')}
            >
              <span className={cn("text-[13px]", worldMode === 'gradient' ? "opacity-100" : "opacity-70")}>▦</span>
              <span>Gradient</span>
            </button>
          </div>
        </div>
      )}

      {/* Groups or Gradient */}
      {isGradient ? (
        <Section title="Gradient" num="02">
          <GradientConfig
            values={gradientValues} setValues={setGradientValues}
            scaleType={scaleType} setScaleType={setScaleType}
            customMin={customMin} setCustomMin={setCustomMin}
            customMax={customMax} setCustomMax={setCustomMax}
            startColorId={startColorId} setStartColorId={setStartColorId}
            endColorId={endColorId} setEndColorId={setEndColorId}
          />
        </Section>
      ) : (
        <Section title="Groups" num="02">
          {groups.length === 0 ? (
            <div className="border border-dashed border-line-2 rounded-[12px] px-5 py-6 text-center flex flex-col items-center gap-2.5 bg-gradient-to-b from-panel to-canvas">
              <div className="text-[28px] leading-none text-ink-3 mb-0.5">⬡</div>
              <div className="font-serif text-[15px] font-semibold">No groups yet</div>
              <Button variant="default" onClick={addGroup}>+ Create your first group</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map(g => (
                <GroupCard
                  key={g.id} group={g} targets={targets}
                  targetNoun={targetNoun} targetNounSingular={targetNounSingular}
                  onRename={name => updateGroup(g.id, { name })}
                  onSetColor={colorId => updateGroup(g.id, { colorId })}
                  onDelete={() => deleteGroup(g.id)}
                  onAddMember={id => addMember(g.id, id)}
                  onRemoveMember={id => removeMember(g.id, id)}
                />
              ))}
              <Button variant="ghost" className="w-full" onClick={addGroup}>+ Add group</Button>
            </div>
          )}
        </Section>
      )}

      {/* Export */}
      <Section title="Export" num="03">
        <Button variant="default" className="w-full" onClick={onExportSvg}>
          <span className="text-[14px] leading-none">↓</span>
          <span>Download SVG</span>
        </Button>
      </Section>
    </aside>
  );
}

function Section({ title, num, children }: { title: string; num: string; children: React.ReactNode }) {
  return (
    <section className="px-6 pt-[18px] pb-[22px] border-b border-line last:border-b-0">
      <header className="flex items-center gap-2.5 mb-3.5">
        <span className="font-mono text-[10px] text-ink-3 tracking-[0.06em]">{num}</span>
        <h3 className="font-serif text-[14px] font-semibold tracking-[-0.005em]">{title}</h3>
        <Separator className="flex-1" />
      </header>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">{label}</span>
      {children}
    </label>
  );
}
