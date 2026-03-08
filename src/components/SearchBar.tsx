'use client';

import { useState, useEffect, useRef } from 'react';
import type { SearchResult } from '@/types';

export default function SearchBar({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(null);
  const ref = useRef<HTMLDivElement>(null);

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

    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    }, 350);
  }, [query]);

  function handleSelect(r: SearchResult) {
    onSelect(r.symbol, r.description);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-64">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="🔍  Rechercher un ticker…"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-2xl z-50">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-700 text-left transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{r.symbol}</p>
                <p className="text-xs text-gray-400 truncate max-w-[160px]">{r.description}</p>
              </div>
              <span className="text-xs text-gray-500">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
