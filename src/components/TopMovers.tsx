'use client';

import { useEffect, useState, useCallback } from 'react';

// Pool de titres populaires — on calcule les movers en live
const POOL = [
  { symbol: 'AAPL',  label: 'Apple'    },
  { symbol: 'MSFT',  label: 'Microsoft'},
  { symbol: 'NVDA',  label: 'Nvidia'   },
  { symbol: 'TSLA',  label: 'Tesla'    },
  { symbol: 'META',  label: 'Meta'     },
  { symbol: 'GOOGL', label: 'Alphabet' },
  { symbol: 'AMZN',  label: 'Amazon'   },
  { symbol: 'AMD',   label: 'AMD'      },
  { symbol: 'NFLX',  label: 'Netflix'  },
  { symbol: 'COIN',  label: 'Coinbase' },
];

export default function TopMovers({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers');

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = POOL.map(p => p.symbol).join(',');
      const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const enriched = data.map(q => ({
          ...q,
          label: POOL.find(p => p.symbol === q.symbol)?.label ?? q.symbol,
        }));
        setQuotes(enriched);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, 60_000);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  const sorted = [...quotes].sort((a, b) =>
    tab === 'gainers' ? b.dp - a.dp : a.dp - b.dp
  ).slice(0, 5);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-0">
        <h2 className="font-semibold mb-3">Top Movers</h2>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5 w-fit">
          {(['gainers', 'losers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'gainers' ? '▲ Hausse' : '▼ Baisse'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 mt-2 space-y-1">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
            ))
          : sorted.map(q => (
              <button
                key={q.symbol}
                onClick={() => onSelect(q.symbol, q.label)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{q.symbol}</p>
                  <p className="text-xs text-gray-400">{q.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(q.c)}
                  </p>
                  <p className={`text-xs font-medium ${q.dp >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {q.dp >= 0 ? '+' : ''}{q.dp.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
