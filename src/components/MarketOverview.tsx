'use client';

import { useEffect, useState, useCallback } from 'react';

const INDICES = [
  { symbol: 'SPY',             label: 'S&P 500',  sub: 'US Équities',  flag: '🇺🇸' },
  { symbol: 'QQQ',             label: 'Nasdaq',   sub: 'US Tech',      flag: '📱'  },
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin',  sub: 'Crypto',       flag: '₿'   },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum', sub: 'Crypto',       flag: 'Ξ'   },
  { symbol: 'GLD',             label: 'Gold ETF', sub: 'Matières premières', flag: '🥇' },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function MarketOverview({
  onSelect, activeSymbol,
}: {
  onSelect: (symbol: string, label: string) => void;
  activeSymbol: string;
}) {
  const [quotes,  setQuotes]  = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12,
    }}
      className="indices-grid"
    >
      {INDICES.map(({ symbol, label, sub, flag }) => {
        const q      = quotes[symbol];
        const isUp   = q ? q.dp >= 0 : null;
        const color  = isUp === null ? 'rgba(235,235,245,0.6)' : isUp ? 'var(--green)' : 'var(--red)';
        const active = activeSymbol === symbol;

        return (
          <button
            key={symbol}
            onClick={() => onSelect(symbol, label)}
            style={{
              background:    active ? '#1c1c1e' : '#1c1c1e',
              border:        active ? '1px solid rgba(10,132,255,0.5)' : '1px solid transparent',
              borderRadius:  16,
              padding:       '20px 20px 18px',
              textAlign:     'left',
              cursor:        'pointer',
              transition:    'border-color 0.2s, transform 0.15s',
              transform:     active ? 'scale(1.01)' : 'scale(1)',
              outline:       'none',
              position:      'relative',
              overflow:      'hidden',
            }}
            onMouseEnter={e => {
              if (!active) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              if (!active) e.currentTarget.style.border = '1px solid transparent';
            }}
          >
            {/* Stripe colorée en haut si actif */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2, background: 'var(--blue)',
                borderRadius: '16px 16px 0 0',
              }} />
            )}

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{flag}</span>
              {!loading && q && (
                <span
                  className={`num ${isUp ? 'pill-up' : 'pill-down'}`}
                  style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px' }}
                >
                  {isUp ? '+' : ''}{q.dp.toFixed(2)}%
                </span>
              )}
            </div>

            <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 3, letterSpacing: '0.02em', fontWeight: 500 }}>
              {label}
            </p>

            {loading ? (
              <div style={{
                height: 22, width: '70%', borderRadius: 6,
                background: '#2c2c2e', animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ) : q ? (
              <>
                <p className="num" style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                  {fmt(q.c)}
                </p>
                <p className="num" style={{ fontSize: 13, marginTop: 2, color, fontWeight: 500 }}>
                  {isUp ? '+' : ''}{fmt(q.d)}
                </p>
              </>
            ) : (
              <p style={{ color: 'rgba(235,235,245,0.3)', fontSize: 15 }}>—</p>
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @media (max-width: 1024px) {
          .indices-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .indices-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
