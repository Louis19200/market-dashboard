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
    <div style={{ minHeight: '100vh', background: '#000' }}>

      {/* Navigation bar — style macOS/iOS */}
      <header style={{
        position:     'sticky',
        top:          0,
        zIndex:       50,
        background:   'rgba(0,0,0,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding:      '0 24px',
        height:       56,
        display:      'flex',
        alignItems:   'center',
        gap:          20,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="white">
            <path d="M14.9 11.8c0-2.8 2.3-4.1 2.4-4.2-1.3-1.9-3.4-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1s-2.3-1-3.8-1c-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.6 1.4 11.4 1 1.4 2.1 2.9 3.5 2.9 1.4-.1 2-0.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.4-2.8.5-.8 1-1.7 1.2-2.4-2.7-1-4.4-3.7-4.4-5.5z"/>
            <path d="M12.3 3.4c.8-1 1.3-2.3 1.2-3.7-1.2.1-2.6.8-3.4 1.8-.7.8-1.4 2.2-1.2 3.5 1.3.1 2.6-.7 3.4-1.6z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.3px' }}>MarketPulse</span>
        </div>

        {/* Barre de recherche centrée */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 auto' }}>
          <SearchBar onSelect={handleSelect} />
        </div>

        {/* Actif actif */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 6px var(--green)',
          }} />
          <span style={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', fontWeight: 500 }}>
            {activeSymbol}
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Titre */}
        <div>
          <h1 className="text-large-title" style={{ color: '#fff' }}>Marchés</h1>
          <p style={{ fontSize: 15, color: 'rgba(235,235,245,0.5)', marginTop: 4, letterSpacing: '-0.16px' }}>
            Données temps réel · Finnhub · Yahoo Finance
          </p>
        </div>

        {/* Indices */}
        <MarketOverview onSelect={handleSelect} activeSymbol={activeSymbol} />

        {/* Chart + Movers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 16,
          alignItems: 'start',
        }}
          className="responsive-grid"
        >
          <StockChart symbol={activeSymbol} label={activeLabel} />
          <TopMovers onSelect={handleSelect} />
        </div>

      </main>

      <style>{`
        @media (max-width: 900px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
