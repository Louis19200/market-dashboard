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
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
        {/* Icône loupe */}
        <span style={{
          position:  'absolute',
          left:      12,
          color:     'rgba(235,235,245,0.4)',
          fontSize:  16,
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          {loading
            ? <span style={{
                display:'inline-block', width:14, height:14,
                border:'2px solid rgba(10,132,255,0.5)',
                borderTopColor: 'var(--blue)',
                borderRadius:'50%', animation:'spin 0.7s linear infinite',
                verticalAlign:'middle',
              }} />
            : '🔍'}
        </span>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Rechercher un ticker…"
          className="apple-input"
          style={{
            width: '100%',
            paddingLeft: 40,
            paddingRight: 16,
            paddingTop: 9,
            paddingBottom: 9,
            fontSize: 15,
          }}
        />
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position:  'absolute',
          top:       'calc(100% + 8px)',
          left:      0,
          right:     0,
          background:      'rgba(28,28,30,0.98)',
          backdropFilter:  'saturate(180%) blur(20px)',
          borderRadius:    14,
          overflow:        'hidden',
          zIndex:          100,
          border:          '1px solid rgba(255,255,255,0.1)',
          boxShadow:       '0 20px 50px rgba(0,0,0,0.8)',
        }}>
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onClick={() => handlePick(r)}
              style={{
                width:         '100%',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                padding:       '11px 16px',
                background:    'transparent',
                border:        'none',
                borderBottom:  i < results.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                cursor:        'pointer',
                textAlign:     'left',
                transition:    'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.16px' }}>
                  {r.displaySymbol}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)', marginTop: 1 }}>
                  {r.description}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500,
                padding: '3px 8px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 6,
                color: 'rgba(235,235,245,0.5)',
                flexShrink: 0, marginLeft: 12,
              }}>
                {r.type}
              </span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
