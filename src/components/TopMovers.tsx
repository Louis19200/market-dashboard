'use client';

import { useEffect, useState, useCallback } from 'react';

const POOL = [
  { symbol: 'AAPL',  label: 'Apple'     },
  { symbol: 'MSFT',  label: 'Microsoft' },
  { symbol: 'NVDA',  label: 'Nvidia'    },
  { symbol: 'TSLA',  label: 'Tesla'     },
  { symbol: 'META',  label: 'Meta'      },
  { symbol: 'GOOGL', label: 'Alphabet'  },
  { symbol: 'AMZN',  label: 'Amazon'    },
  { symbol: 'AMD',   label: 'AMD'       },
  { symbol: 'NFLX',  label: 'Netflix'   },
  { symbol: 'COIN',  label: 'Coinbase'  },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function TopMovers({
  onSelect,
}: {
  onSelect: (symbol: string, label: string) => void;
}) {
  const [quotes,  setQuotes]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<'gainers'|'losers'>('gainers');

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = POOL.map(p => p.symbol).join(',');
      const res  = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuotes(data.map(q => ({
          ...q,
          label: POOL.find(p => p.symbol === q.symbol)?.label ?? q.symbol,
        })));
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

  const sorted = [...quotes]
    .sort((a, b) => tab === 'gainers' ? b.dp - a.dp : a.dp - b.dp)
    .slice(0, 5);

  return (
    <div className="glass rounded-2xl p-4 flex flex-col">

      {/* Header + onglets */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white text-sm">🔥 Top Movers</h2>
        <div
          className="flex gap-1 rounded-xl p-0.5"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}
        >
          {(['gainers','losers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t
                  ? (t === 'gainers' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)')
                  : 'transparent',
                color: tab === t
                  ? (t === 'gainers' ? '#34d399' : '#f87171')
                  : 'rgba(148,163,184,0.5)',
              }}
            >
              {t === 'gainers' ? '▲ Hausse' : '▼ Baisse'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-0.5">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl animate-pulse"
                style={{ background:'rgba(255,255,255,0.03)' }}
              />
            ))
          : sorted.map(q => {
              const isUp  = q.dp >= 0;
              const color = isUp ? '#34d399' : '#f87171';
              return (
                <button
                  key={q.symbol}
                  onClick={() => onSelect(q.symbol, q.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background:`${color}12`, color, border:`1px solid ${color}25` }}
                    >
                      {q.symbol.slice(0,2)}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {q.symbol}
                      </p>
                      <p className="text-xs muted">{q.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white num">{fmt(q.c)}</p>
                    <p
                      className="text-xs font-bold num"
                      style={{ color }}
                    >
                      {isUp ? '+' : ''}{q.dp.toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            })
        }
      </div>
    </div>
  );
}
