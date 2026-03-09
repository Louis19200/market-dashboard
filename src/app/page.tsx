'use client';

import { useState } from 'react';
import MarketOverview from '@/components/MarketOverview';
import SearchBar      from '@/components/SearchBar';
import StockChart     from '@/components/StockChart';
import TopMovers      from '@/components/TopMovers';

export default function HomePage() {
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeLabel,  setActiveLabel]  = useState('Apple Inc.');

  function handleSelect(symbol: string, label: string) {
    setActiveSymbol(symbol);
    setActiveLabel(label);
  }

  return (
    <div className="min-h-screen">

      {/* Halos décoratifs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'#7c3aed', filter:'blur(130px)', opacity:0.09, top:'-10%', left:'5%' }} />
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'#f472b6', filter:'blur(120px)', opacity:0.07, bottom:'-5%', right:'5%' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'#67e8f9', filter:'blur(100px)', opacity:0.05, top:'40%', left:'45%' }} />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between gap-4"
        style={{
          background: 'rgba(13,11,30,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
            style={{ background: 'linear-gradient(135deg,#818cf8,#f472b6)' }}
          >
            ✦
          </div>
          <span className="font-black text-white tracking-tight hidden sm:block">MarketPulse</span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">Live</span>
          </div>
        </div>

        {/* SearchBar centrée dans le header */}
        <div className="flex-1 max-w-sm">
          <SearchBar onSelect={handleSelect} />
        </div>

        {/* Actif sélectionné */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="text-xs muted">Actif :</span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.25)', color:'#818cf8' }}
          >
            {activeSymbol}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 py-6 space-y-5">

        <div>
          <h1 className="text-3xl font-black grad-text">Market Dashboard</h1>
          <p className="text-xs muted mt-1">Données temps réel · Finnhub · Yahoo Finance</p>
        </div>

        {/* Indices */}
        <MarketOverview onSelect={handleSelect} />

        {/* Chart + Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <StockChart symbol={activeSymbol} label={activeLabel} />
          </div>
          <TopMovers onSelect={handleSelect} />
        </div>

      </main>
    </div>
  );
}
