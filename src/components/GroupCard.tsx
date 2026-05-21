import { useState, useRef, useEffect } from 'react';
import { GROUP_COLORS, colorById } from '../data/mapData';
import type { Group } from '../types';

interface Target {
  id: string;
  label: string;
  sub: string;
}

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
  const [colorOpen, setColorOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftName(group.name); }, [group.name]);
  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingName]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!cardRef.current?.contains(e.target as Node)) {
        setColorOpen(false);
        setAddOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function commitName() {
    const n = draftName.trim();
    if (n && n !== group.name) onRename(n);
    setEditingName(false);
  }

  const memberSet = new Set(group.members);
  const available = targets.filter(
    t => !memberSet.has(t.id) && t.label.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = available.reduce<Record<string, Target[]>>((acc, t) => {
    (acc[t.sub] = acc[t.sub] ?? []).push(t);
    return acc;
  }, {});
  const groupOrder = Object.keys(grouped);

  return (
    <div className="group-card" ref={cardRef}>
      <div className="group-card-bar" style={{ background: colorById(group.colorId) }} />

      <div className="group-card-head">
        <div className="group-color-wrap">
          <button
            className="group-color"
            style={{ background: colorById(group.colorId) }}
            onClick={() => setColorOpen(v => !v)}
            aria-label="Change color"
          />
          {colorOpen && (
            <div className="color-popover">
              <div className="color-popover-head">Group colour</div>
              <div className="color-grid">
                {GROUP_COLORS.map(c => (
                  <button
                    key={c.id}
                    className={`color-swatch ${group.colorId === c.id ? 'is-active' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => { onSetColor(c.id); setColorOpen(false); }}
                    aria-label={c.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {editingName ? (
          <input
            ref={inputRef}
            className="group-name-input"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setDraftName(group.name); setEditingName(false); }
            }}
          />
        ) : (
          <button className="group-name" onClick={() => setEditingName(true)} title="Click to rename">
            {group.name}
          </button>
        )}

        <span className="group-count">{group.members.length}</span>

        <button className="icon-btn icon-btn-sm" aria-label="Delete group" onClick={onDelete} title="Delete group">
          <TrashIcon />
        </button>
      </div>

      <div className="group-members">
        {group.members.length === 0 ? (
          <div className="group-empty">No {targetNoun} in this group</div>
        ) : (
          <ul className="chip-list">
            {group.members.map(mid => {
              const t = targets.find(x => x.id === mid);
              return (
                <li key={mid} className="chip">
                  <span className="chip-dot" style={{ background: colorById(group.colorId) }} />
                  <span className="chip-label">{t ? t.label : mid}</span>
                  <button
                    className="chip-x"
                    onClick={() => onRemoveMember(mid)}
                    aria-label={`Remove ${t ? t.label : mid}`}
                  >×</button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="group-add">
          <button className="btn btn-ghost btn-sm" onClick={() => setAddOpen(v => !v)}>
            + Add {targetNounSingular}
          </button>
          {addOpen && (
            <div className="add-popover">
              <input
                className="ip-text ip-search"
                placeholder={`Search ${targetNoun}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <div className="add-scroll">
                {available.length === 0 ? (
                  <div className="empty">
                    {targets.length === memberSet.size ? `All ${targetNoun} added` : 'No matches'}
                  </div>
                ) : groupOrder.length > 1 ? (
                  groupOrder.map(g => (
                    <div key={g} className="add-group">
                      <div className="add-group-head">{g}</div>
                      {grouped[g].map(t => (
                        <button
                          key={t.id}
                          className="add-item"
                          onClick={() => { onAddMember(t.id); setSearch(''); }}
                        >
                          <span className="add-item-label">{t.label}</span>
                          <span className="add-item-sub">{t.id}</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  available.map(t => (
                    <button
                      key={t.id}
                      className="add-item"
                      onClick={() => { onAddMember(t.id); setSearch(''); }}
                    >
                      <span className="add-item-label">{t.label}</span>
                      <span className="add-item-sub">{t.sub}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.5 8a1.5 1.5 0 001.5 1.4h3a1.5 1.5 0 001.5-1.4l.5-8"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
