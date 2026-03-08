'use client';

import { useEffect, useState, useCallback } from 'react';

const INDICES = [
  { symbol: 'SPY',             label: 'S&P 500',  flag: '🇺🇸' },
  { symbol: 'QQQ',             label: 'Nasdaq',   flag: '🇺🇸' },
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin',  flag: '₿'  },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum', flag: 'Ξ'  },
  { symbol: 'GLD',             label: 'Gold ETF', flag: '🥇' },
];

const fmt = (v: number, decimals = 2) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

export default function MarketOverview({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = INDICES.map(i => i.symbol).join(',');
      const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, any> = {};
        data.forEach(q => { map[q.symbol] = q; });
        setQuotes(map);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, 30_000);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {INDICES.map(({ symbol, label, flag }) => {
        const q = quotes[symbol];
        const up = q ? q.dp >= 0 : null;

        return (
          <button
            key={symbol}
            onClick={() => onSelect(symbol, label)}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{flag}</span>
              {!loading && q && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${up ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(q.dp).toFixed(2)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            {loading ? (
              <div className="h-5 w-20 bg-gray-800 rounded animate-pulse" />
            ) : q ? (
              <p className="font-semibold">{fmt(q.c)}</p>
            ) : (
              <p className="text-gray-600 text-sm">—</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
