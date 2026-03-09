'use client';

import { useEffect, useRef, useState } from 'react';
import type { Candle } from '@/types';

const RESOLUTIONS = [
  { label: '1S', value: 'W',  days: 7   },
  { label: '1M', value: 'D',  days: 30  },
  { label: '3M', value: 'D',  days: 90  },
  { label: '1A', value: 'W',  days: 365 },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function StockChart({ symbol, label }: { symbol: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);
  const obsRef       = useRef<ResizeObserver | null>(null);

  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [quote,      setQuote]      = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [chartReady, setChartReady] = useState(false);

  // Init chart
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import('lightweight-charts').then(({ createChart, CandlestickSeries, ColorType }) => {
      if (cancelled || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1c1c1e' },
          textColor:  'rgba(235,235,245,0.4)',
          fontSize:   12,
          fontFamily: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif",
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: 'rgba(235,235,245,0.2)', labelBackgroundColor: '#3a3a3c' },
          horzLine: { color: 'rgba(235,235,245,0.2)', labelBackgroundColor: '#3a3a3c' },
        },
        timeScale:       { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', scaleMargins: { top: 0.08, bottom: 0.08 } },
        width:  containerRef.current.clientWidth,
        height: 400,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor:       '#30d158',
        downColor:     '#ff453a',
        borderVisible: false,
        wickUpColor:   '#30d158',
        wickDownColor: '#ff453a',
      });

      chartRef.current  = chart;
      seriesRef.current = series;

      obsRef.current = new ResizeObserver(() => {
        if (containerRef.current)
          chart.applyOptions({ width: containerRef.current.clientWidth });
      });
      obsRef.current.observe(containerRef.current);

      setChartReady(true);
    });

    return () => {
      cancelled = true;
      obsRef.current?.disconnect();
      chartRef.current?.remove();
      chartRef.current  = null;
      seriesRef.current = null;
      setChartReady(false);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    if (!chartReady || !seriesRef.current) return;
    setLoading(true);

    async function load() {
      try {
        const qRes  = await fetch(`/api/quote?symbols=${encodeURIComponent(symbol)}`);
        const qData = await qRes.json();
        if (Array.isArray(qData) && qData[0]) setQuote(qData[0]);

        const cRes = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&resolution=${resolution.value}`
        );
        const raw = await cRes.json();

        if (raw.s === 'ok' && seriesRef.current) {
          const cutoff = Math.floor(Date.now() / 1000) - resolution.days * 86400;
          const candles: Candle[] = (raw.t as number[])
            .map((t, i) => ({
              time: t, open: raw.o[i], high: raw.h[i],
              low: raw.l[i], close: raw.c[i], volume: raw.v[i],
            }))
            .filter(c => c.time >= cutoff)
            .sort((a, b) => a.time - b.time);

          seriesRef.current.setData(candles);
          chartRef.current?.timeScale().fitContent();
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [symbol, resolution, chartReady]);

  const isUp  = quote ? quote.dp >= 0 : null;
  const color = isUp === null ? 'rgba(235,235,245,0.6)' : isUp ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ background: '#1c1c1e', borderRadius: 20, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '24px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          {/* Symbole + nom */}
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
              {symbol}
            </span>
            <span style={{ fontSize: 15, color: 'rgba(235,235,245,0.45)', fontWeight: 400 }}>
              {label}
            </span>
          </div>

          {/* Prix + variation */}
          {quote ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <span className="num" style={{
                fontSize: 36, fontWeight: 700,
                letterSpacing: '-0.5px', color: '#fff', lineHeight: 1,
              }}>
                {fmt(quote.c)}
              </span>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <span className="num" style={{ fontSize: 15, fontWeight: 600, color }}>
                  {isUp ? '+' : ''}{fmt(quote.d)}
                </span>
                <span
                  className={`num ${isUp ? 'pill-up' : 'pill-down'}`}
                  style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px', textAlign:'center' }}
                >
                  {isUp ? '+' : ''}{quote.dp.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              height: 36, width: 160, background: '#2c2c2e', borderRadius: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )}

          {/* H / B / Préc */}
          {quote && (
            <div style={{ display:'flex', gap:20, marginTop:10 }}>
              {[
                { label:'Haut',   val: fmt(quote.h)  },
                { label:'Bas',    val: fmt(quote.l)   },
                { label:'Préc.',  val: fmt(quote.pc)  },
              ].map(({ label: l, val }) => (
                <div key={l}>
                  <span style={{ fontSize:12, color:'rgba(235,235,245,0.4)', marginRight:4 }}>{l}</span>
                  <span className="num" style={{ fontSize:13, color:'rgba(235,235,245,0.75)', fontWeight:500 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sélecteur période — style iOS segmented control */}
        <div style={{
          display: 'flex',
          gap: 2,
          background: '#2c2c2e',
          borderRadius: 10,
          padding: 3,
        }}>
          {RESOLUTIONS.map(r => (
            <button
              key={r.label}
              onClick={() => setResolution(r)}
              style={{
                padding:       '6px 14px',
                borderRadius:  8,
                border:        'none',
                fontSize:      13,
                fontWeight:    600,
                fontFamily:    'inherit',
                cursor:        'pointer',
                transition:    'background 0.2s, color 0.2s',
                letterSpacing: '-0.08px',
                background:    resolution.label === r.label ? '#3a3a3c' : 'transparent',
                color:         resolution.label === r.label ? '#fff' : 'rgba(235,235,245,0.45)',
                boxShadow:     resolution.label === r.label ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position:'relative' }}>
        {loading && (
          <div style={{
            position:'absolute', inset:0, display:'flex',
            alignItems:'center', justifyContent:'center', zIndex:10,
            background: 'rgba(28,28,30,0.7)', backdropFilter:'blur(4px)',
          }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              border:'2px solid rgba(10,132,255,0.3)',
              borderTopColor: 'var(--blue)',
              animation:'spin 0.7s linear infinite',
            }} />
          </div>
        )}
        <div ref={containerRef} style={{ width:'100%' }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
