'use client';

import { useState, useEffect, useRef } from 'react';
import type { SearchResult } from '@/types';

export default function SearchBar({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }

    setLoading(true);
    debounce.current = setTimeout(async () => {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
      setLoading(false);
    }, 350);
  }, [query]);

  function handlePick(r: SearchResult) {
    onSelect(r.symbol, r.description);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
          style={{ color:'rgba(148,163,184,0.4)' }}
        >
          {loading
            ? <span className="inline-block w-3.5 h-3.5 border-2 rounded-full animate-spin align-middle"
                style={{ borderColor:'#818cf8', borderTopColor:'transparent' }} />
            : '🔍'}
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher un ticker…"
          className="glass-input w-full pl-9 pr-4 py-2 text-sm"
        />
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(13,11,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129,140,248,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => handlePick(r)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
              style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="text-left">
                <p className="font-bold text-white text-xs">{r.displaySymbol}</p>
                <p className="text-xs muted truncate max-w-48">{r.description}</p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0"
                style={{
                  background: 'rgba(129,140,248,0.1)',
                  color: '#818cf8',
                  border: '1px solid rgba(129,140,248,0.2)',
                }}
              >
                {r.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
