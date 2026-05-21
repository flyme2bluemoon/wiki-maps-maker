import { useState, useRef, useEffect } from 'react';
import { GROUP_COLORS, colorById, filterAndSortMapTargets } from '../data/mapData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Group } from '../types';

interface Target { id: string; label: string; sub: string; aliases?: string[]; searchText?: string; }

interface Props {
  group: Group;
  targets: Target[];
  targetNoun: string;
  targetNounSingular: string;
  onRename: (name: string) => void;
  onSetColor: (colorId: string) => void;
  onDelete: () => void;
  onAddMember: (id: string) => void;
  onRemoveMember: (id: string) => void;
}

export function GroupCard({
  group, targets, targetNoun, targetNounSingular,
  onRename, onSetColor, onDelete, onAddMember, onRemoveMember,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftName(group.name); }, [group.name]);
  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingName]);

  function commitName() {
    const n = draftName.trim();
    if (n && n !== group.name) onRename(n);
    setEditingName(false);
  }

  const memberSet = new Set(group.members);
  const available = filterAndSortMapTargets(targets, search, t => memberSet.has(t.id));
  const grouped = available.reduce<Record<string, Target[]>>((acc, t) => {
    (acc[t.sub] = acc[t.sub] ?? []).push(t);
    return acc;
  }, {});
  const groupOrder = Object.keys(grouped);

  return (
    <div className="relative bg-paper border border-line rounded-[12px] transition-[border-color] hover:border-line-2">
      {/* Color bar */}
      <div
        className="absolute top-0 left-0 w-[3px] bottom-0 rounded-l-[12px] opacity-85"
        style={{ background: colorById(group.colorId) }}
      />

      {/* Card header */}
      <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-2.5 pl-3.5 border-b border-line">
        {/* Color swatch + popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-5 h-5 rounded-[6px] border border-[oklch(0.2_0.01_240/0.18)] [box-shadow:inset_0_0_0_2px_var(--paper)] hover:scale-[1.08] transition-transform shrink-0"
              style={{ background: colorById(group.colorId) }}
              aria-label="Change color"
            />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[168px] p-2.5">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3 mb-2">
              Group colour
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {GROUP_COLORS.map(c => (
                <button
                  key={c.id}
                  className={cn(
                    "aspect-square rounded-[6px] border border-[oklch(0.2_0.01_240/0.18)] hover:scale-110 transition-transform",
                    group.colorId === c.id && "[box-shadow:0_0_0_2px_var(--paper),_0_0_0_3px_var(--ink)]"
                  )}
                  style={{ background: c.value }}
                  onClick={() => onSetColor(c.id)}
                  aria-label={c.id}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Name (editable) */}
        {editingName ? (
          <input
            ref={inputRef}
            className="flex-1 font-serif text-[15px] font-semibold px-1.5 py-1 rounded-[6px] border border-accent bg-paper outline-none min-w-0"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setDraftName(group.name); setEditingName(false); }
            }}
          />
        ) : (
          <button
            className="flex-1 text-left font-serif text-[15px] font-semibold tracking-[-0.005em] px-1.5 py-1 rounded-[6px] hover:bg-canvas transition-colors min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
            onClick={() => setEditingName(true)}
            title="Click to rename"
          >
            {group.name}
          </button>
        )}

        <Badge variant="secondary">{group.members.length}</Badge>

        <Button variant="ghost" size="icon-sm" aria-label="Delete group" onClick={onDelete} title="Delete group">
          <TrashIcon />
        </Button>
      </div>

      {/* Members */}
      <div className="px-3.5 pt-2.5 pb-3">
        {group.members.length === 0 ? (
          <div className="text-[12px] text-ink-3 italic py-1 mb-2">No {targetNoun} in this group</div>
        ) : (
          <ul className="list-none p-0 m-0 mb-2 flex flex-wrap gap-1">
            {group.members.map(mid => {
              const t = targets.find(x => x.id === mid);
              return (
                <li key={mid} className="inline-flex items-center gap-[5px] py-[3px] pl-[7px] pr-1 rounded-full bg-canvas border border-line text-[11.5px] text-ink-2 max-w-full">
                  <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: colorById(group.colorId) }} />
                  <span className="max-w-[16ch] overflow-hidden text-ellipsis whitespace-nowrap">{t ? t.label : mid}</span>
                  <button
                    className="w-4 h-4 rounded-full text-ink-3 flex items-center justify-center text-[14px] leading-none hover:bg-line-2 hover:text-ink transition-colors"
                    onClick={() => onRemoveMember(mid)}
                    aria-label={`Remove ${t ? t.label : mid}`}
                  >×</button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add member popover */}
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">+ Add {targetNounSingular}</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-2">
            <Input
              className="mb-1.5 text-[12.5px]"
              placeholder={`Search ${targetNoun}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-line-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent">
              {available.length === 0 ? (
                <div className="py-[18px] px-2 text-center text-[12px] text-ink-3">
                  {targets.length === memberSet.size ? `All ${targetNoun} added` : 'No matches'}
                </div>
              ) : groupOrder.length > 1 ? (
                groupOrder.map((g, i) => (
                  <div key={g} className={i > 0 ? "mt-1" : ""}>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3 px-2 pt-2 pb-1 sticky top-0 bg-paper">
                      {g}
                    </div>
                    {grouped[g].map(t => (
                      <button
                        key={t.id}
                        className="w-full flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-[6px] text-left hover:bg-canvas transition-colors"
                        onClick={() => { onAddMember(t.id); setSearch(''); }}
                      >
                        <span className="text-[13px] font-medium">{t.label}</span>
                        <span className="font-mono text-[10px] text-ink-3">{t.id}</span>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                available.map(t => (
                  <button
                    key={t.id}
                    className="w-full flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-[6px] text-left hover:bg-canvas transition-colors"
                    onClick={() => { onAddMember(t.id); setSearch(''); }}
                  >
                    <span className="text-[13px] font-medium">{t.label}</span>
                    <span className="font-mono text-[10px] text-ink-3">{t.sub}</span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.5 8a1.5 1.5 0 001.5 1.4h3a1.5 1.5 0 001.5-1.4l.5-8"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
