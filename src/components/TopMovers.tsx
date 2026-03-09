'use client';

import { useEffect, useState, useCallback } from 'react';

const POOL = [
  { symbol:'AAPL',  label:'Apple'     },
  { symbol:'MSFT',  label:'Microsoft' },
  { symbol:'NVDA',  label:'Nvidia'    },
  { symbol:'TSLA',  label:'Tesla'     },
  { symbol:'META',  label:'Meta'      },
  { symbol:'GOOGL', label:'Alphabet'  },
  { symbol:'AMZN',  label:'Amazon'    },
  { symbol:'AMD',   label:'AMD'       },
  { symbol:'NFLX',  label:'Netflix'   },
  { symbol:'COIN',  label:'Coinbase'  },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(v);

export default function TopMovers({ onSelect }: { onSelect: (s: string, l: string) => void }) {
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
    <div style={{
      background:    '#1c1c1e',
      borderRadius:  20,
      overflow:      'hidden',
      transition:    'box-shadow 0.25s',
    }}>

      {/* Header */}
      <div style={{
        padding:         '20px 20px 12px',
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        borderBottom:    '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ fontSize:17, fontWeight:600, color:'#fff', letterSpacing:'-0.022em' }}>
          Movers
        </p>

        {/* Segmented control iOS */}
        <div style={{ display:'flex', gap:2, background:'#2c2c2e', borderRadius:8, padding:3 }}>
          {(['gainers','losers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:      '5px 12px',
                borderRadius:  6,
                border:        'none',
                fontSize:      12,
                fontWeight:    600,
                fontFamily:    'inherit',
                cursor:        'pointer',
                transition:    'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                background:    tab === t ? '#3a3a3c' : 'transparent',
                color:         tab === t
                  ? (t === 'gainers' ? 'var(--green)' : 'var(--red)')
                  : 'rgba(235,235,245,0.35)',
                boxShadow:     tab === t ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                transform:     tab === t ? 'scale(1)' : 'scale(0.98)',
              }}
            >
              {t === 'gainers' ? '▲ Hausse' : '▼ Baisse'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding:'4px 0 8px' }}>
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} style={{
                margin:'4px 14px', height:52, borderRadius:10,
                background:'#2c2c2e', animation:'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.07}s`,
              }} />
            ))
          : sorted.map((q, i) => {
              const isUp  = q.dp >= 0;
              const color = isUp ? 'var(--green)' : 'var(--red)';
              return (
                <button
                  key={q.symbol}
                  onClick={() => onSelect(q.symbol, q.label)}
                  className="row-hover"
                  style={{
                    width:         '100%',
                    display:       'flex',
                    alignItems:    'center',
                    justifyContent:'space-between',
                    padding:       '11px 20px',
                    background:    'transparent',
                    border:        'none',
                    borderTop:     i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor:        'pointer',
                    textAlign:     'left',
                    fontFamily:    'inherit',
                    transition:    'background 0.15s',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:36, height:36, borderRadius:10,
                      background:'#2c2c2e',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700,
                      color:'rgba(235,235,245,0.6)',
                      flexShrink:0,
                      transition:'background 0.15s, color 0.15s',
                    }}>
                      {q.symbol.slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontSize:15, fontWeight:600, color:'#fff', letterSpacing:'-0.16px' }}>
                        {q.symbol}
                      </p>
                      <p style={{ fontSize:13, color:'rgba(235,235,245,0.38)', marginTop:1 }}>
                        {q.label}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign:'right' }}>
                    <p className="num" style={{ fontSize:15, fontWeight:500, color:'#fff', letterSpacing:'-0.16px' }}>
                      {fmt(q.c)}
                    </p>
                    <p className="num" style={{ fontSize:13, fontWeight:600, color, marginTop:1 }}>
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
