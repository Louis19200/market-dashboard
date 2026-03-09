'use client';

import { useEffect, useState, useCallback } from 'react';

const INDICES = [
  { symbol: 'SPY',             label: 'S&P 500',  flag: '🇺🇸' },
  { symbol: 'QQQ',             label: 'Nasdaq',   flag: '💻'  },
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin',  flag: '₿'   },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum', flag: 'Ξ'   },
  { symbol: 'GLD',             label: 'Gold ETF', flag: '🥇'  },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function MarketOverview({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [quotes,  setQuotes]  = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = INDICES.map(i => i.symbol).join(',');
      const res  = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
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
        const q       = quotes[symbol];
        const isUp    = q ? q.dp >= 0 : null;
        const color   = isUp === null ? '#94a3b8' : isUp ? '#34d399' : '#f87171';
        const isActive = active === symbol;

        return (
          <button
            key={symbol}
            onClick={() => { setActive(symbol); onSelect(symbol, label); }}
            className="glass glass-hover text-left p-4 rounded-2xl relative overflow-hidden"
            style={isActive ? {
              borderColor: 'rgba(129,140,248,0.45)',
              boxShadow:   '0 0 35px rgba(129,140,248,0.12)',
              background:  'rgba(129,140,248,0.08)',
              transform:   'translateY(-2px)',
            } : {}}
          >
            {/* Glow déco */}
            <div style={{
              position:'absolute', top:-20, right:-20, width:70, height:70,
              borderRadius:'50%', background: color,
              filter:'blur(25px)', opacity: isActive ? 0.18 : 0.08,
              pointerEvents:'none', transition:'opacity 0.3s',
            }} />

            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{flag}</span>
              {!loading && q && (
                <span
                  className="text-xs font-bold num px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${color}15`,
                    color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {isUp ? '▲' : '▼'} {Math.abs(q.dp).toFixed(2)}%
                </span>
              )}
            </div>

            <p className="text-xs mb-0.5" style={{ color:'rgba(148,163,184,0.7)' }}>{label}</p>

            {loading ? (
              <div className="h-5 w-20 rounded-lg animate-pulse" style={{ background:'rgba(255,255,255,0.06)' }} />
            ) : q ? (
              <>
                <p className="font-bold text-white num">{fmt(q.c)}</p>
                <p className="text-xs num mt-0.5" style={{ color }}>
                  {isUp ? '+' : ''}{q.d.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="muted text-sm">—</p>
            )}

            {/* Barre active */}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background:'linear-gradient(90deg,#818cf8,#f472b6)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
