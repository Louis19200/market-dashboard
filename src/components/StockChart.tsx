'use client';

import { useEffect, useRef, useState } from 'react';
import type { Candle } from '@/types';

const RESOLUTIONS = [
  { label: '1S', value: 'W', days: 7   },
  { label: '1M', value: 'D', days: 30  },
  { label: '3M', value: 'D', days: 90  },
  { label: '1A', value: 'W', days: 365 },
];

export default function StockChart({ symbol, label }: { symbol: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);
  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Init chart une seule fois — set chartReady quand c'est prêt
  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;

    import('lightweight-charts').then(({ createChart, CandlestickSeries }) => {
      if (!containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { color: '#111827' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: '#1f2937' },
          horzLines: { color: '#1f2937' },
        },
        crosshair: { mode: 1 },
        timeScale: { borderColor: '#374151', timeVisible: true },
        rightPriceScale: { borderColor: '#374151' },
        width: containerRef.current.clientWidth,
        height: 380,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      chartRef.current = chart;
      seriesRef.current = series;
      setChartReady(true); // ← déclenche le 2ème useEffect

      const obs = new ResizeObserver(() => {
        if (containerRef.current)
          chart.applyOptions({ width: containerRef.current.clientWidth });
      });
      obs.observe(containerRef.current);

      cleanup = () => {
        obs.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        setChartReady(false);
      };
    });

    return () => cleanup?.();
  }, []);

  // Fetch données — attend que chartReady soit true
  useEffect(() => {
    if (!chartReady || !seriesRef.current) return;
    setLoading(true);

    async function load() {
      try {
        const [qRes, cRes] = await Promise.all([
          fetch(`/api/quote?symbols=${encodeURIComponent(symbol)}`),
          fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&resolution=${resolution.value}`),
        ]);

        const qData = await qRes.json();
        if (Array.isArray(qData) && qData[0]) setQuote(qData[0]);

        const raw = await cRes.json();

        if (raw.s === 'ok' && seriesRef.current) {
          const cutoff = Math.floor(Date.now() / 1000) - resolution.days * 86400;
          const candles: Candle[] = raw.t
            .map((t: number, i: number) => ({
              time: t,
              open: raw.o[i],
              high: raw.h[i],
              low: raw.l[i],
              close: raw.c[i],
            }))
            .filter((c: Candle) => c.time >= cutoff)
            .sort((a: Candle, b: Candle) => a.time - b.time);

          seriesRef.current.setData(candles);
          chartRef.current?.timeScale().fitContent();
        } else if (raw.s !== 'ok') {
          console.warn('[StockChart] Finnhub returned:', raw.s, 'for', symbol);
        }
      } catch (err) {
        console.error('[StockChart] load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [chartReady, symbol, resolution]); // ← chartReady dans les deps

  const up = quote ? quote.dp >= 0 : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{symbol}</span>
            <span className="text-gray-400 text-sm">{label}</span>
          </div>
          {quote && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(quote.c)}
              </span>
              <span className={`text-sm font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
                {up ? '+' : ''}{quote.d?.toFixed(2)} ({up ? '+' : ''}{quote.dp?.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {RESOLUTIONS.map(r => (
            <button
              key={r.label}
              onClick={() => setResolution(r)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                resolution.label === r.label
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Container doit avoir une hauteur fixe pour que le chart s'affiche */}
      <div className="relative h-[380px]">
        {loading && (
          <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
