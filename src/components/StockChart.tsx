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
  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [quote,      setQuote]      = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  // Init chart une seule fois
  useEffect(() => {
    if (!containerRef.current) return;

    import('lightweight-charts').then(({ createChart, CandlestickSeries, ColorType }) => {
      if (!containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'rgba(148,163,184,0.65)',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: { mode: 1 },
        timeScale:       { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', scaleMargins: { top: 0.1, bottom: 0.1 } },
        width:  containerRef.current.clientWidth,
        height: 360,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor:        '#34d399',
        downColor:      '#f87171',
        borderVisible:  false,
        wickUpColor:    '#34d399',
        wickDownColor:  '#f87171',
      });

      chartRef.current  = chart;
      seriesRef.current = series;

      const obs = new ResizeObserver(() => {
        if (containerRef.current)
          chart.applyOptions({ width: containerRef.current.clientWidth });
      });
      obs.observe(containerRef.current);

      return () => { obs.disconnect(); chart.remove(); };
    });
  }, []);

  // Fetch data quand symbol/résolution change
  useEffect(() => {
    if (!seriesRef.current) return;
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
          const cutoff  = Math.floor(Date.now() / 1000) - resolution.days * 86400;
          const candles: Candle[] = raw.t
            .map((t: number, i: number) => ({
              time: t, open: raw.o[i], high: raw.h[i],
              low: raw.l[i], close: raw.c[i], volume: raw.v[i],
            }))
            .filter((c: Candle) => c.time >= cutoff)
            .sort((a: Candle, b: Candle) => a.time - b.time);

          seriesRef.current.setData(candles);
          chartRef.current?.timeScale().fitContent();
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [symbol, resolution]);

  const isUp  = quote ? quote.dp >= 0 : null;
  const color = isUp === null ? '#94a3b8' : isUp ? '#34d399' : '#f87171';

  return (
    <div className="glass rounded-2xl overflow-hidden relative">
      {/* Glow déco */}
      <div style={{
        position:'absolute', top:-50, right:-50, width:250, height:250,
        borderRadius:'50%', background: color,
        filter:'blur(80px)', opacity:0.06, pointerEvents:'none',
      }} />

      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between flex-wrap gap-3"
        style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-black text-white">{symbol}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full muted"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}
            >
              {label}
            </span>
          </div>

          {quote && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-2xl font-black text-white num">{fmt(quote.c)}</span>
              <span
                className="text-sm font-bold num px-2.5 py-1 rounded-full"
                style={{ background:`${color}15`, color, border:`1px solid ${color}30` }}
              >
                {isUp ? '▲ +' : '▼ '}{quote.d.toFixed(2)} ({isUp ? '+' : ''}{quote.dp.toFixed(2)}%)
              </span>
            </div>
          )}

          {quote && (
            <div className="flex gap-4 mt-1">
              {[
                { label:'H', val: fmt(quote.h)  },
                { label:'B', val: fmt(quote.l)  },
                { label:'Préc.', val: fmt(quote.pc) },
              ].map(({ label: l, val }) => (
                <div key={l} className="flex items-center gap-1">
                  <span className="text-xs muted">{l}</span>
                  <span className="text-xs text-slate-300 num">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sélecteur période */}
        <div
          className="flex gap-1 rounded-xl p-0.5"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}
        >
          {RESOLUTIONS.map(r => (
            <button
              key={r.label}
              onClick={() => setResolution(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: resolution.label === r.label ? 'rgba(244,114,182,0.15)' : 'transparent',
                color:      resolution.label === r.label ? '#f472b6' : 'rgba(148,163,184,0.5)',
                border:     resolution.label === r.label ? '1px solid rgba(244,114,182,0.25)' : '1px solid transparent',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative px-1 pb-1">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 rounded-b-2xl"
            style={{ background:'rgba(13,11,30,0.6)', backdropFilter:'blur(4px)' }}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor:'#818cf8', borderTopColor:'transparent' }}
            />
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}
