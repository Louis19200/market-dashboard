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
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Background orbes animées */}
      <div className="page-bg">
        <div className="orb-3" />
      </div>

      {/* Navbar */}
      <header style={{
        position:        'sticky',
        top:             0,
        zIndex:          50,
        background:      'rgba(0,0,0,0.72)',
        backdropFilter:  'saturate(180%) blur(24px)',
        WebkitBackdropFilter: 'saturate(180%) blur(24px)',
        borderBottom:    '1px solid rgba(255,255,255,0.07)',
        padding:         '0 28px',
        height:          56,
        display:         'flex',
        alignItems:      'center',
        gap:             20,
      }}>
        {/* Nom seul, sans logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{
            fontSize: 17, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.3px',
          }}>
            MarketPulse
          </span>
          {/* Live dot */}
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 8px var(--green)',
              animation: 'live-pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize:12, color:'var(--green)', fontWeight:500, letterSpacing:'0.02em' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Search centrée */}
        <div style={{ flex:1, maxWidth:420, margin:'0 auto' }}>
          <SearchBar onSelect={handleSelect} />
        </div>

        {/* Actif courant */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, color:'rgba(235,235,245,0.4)' }}>Actif</span>
          <span style={{
            fontSize:13, fontWeight:600, color:'#fff',
            background:'rgba(255,255,255,0.08)',
            padding:'4px 10px', borderRadius:8,
            letterSpacing:'-0.1px',
          }}>
            {activeSymbol}
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={{
        position:  'relative',
        zIndex:    1,
        maxWidth:  1440,
        margin:    '0 auto',
        padding:   '40px 28px 80px',
        display:   'flex',
        flexDirection: 'column',
        gap:       36,
      }}>

        {/* Titre */}
        <div className="animate-fade-up">
          <h1 className="text-large-title" style={{ color:'#fff' }}>Marchés</h1>
          <p style={{ fontSize:15, color:'rgba(235,235,245,0.45)', marginTop:5, letterSpacing:'-0.16px' }}>
            Données temps réel · Finnhub · Yahoo Finance
          </p>
        </div>

        {/* Indices */}
        <div className="animate-fade-up delay-1">
          <MarketOverview onSelect={handleSelect} activeSymbol={activeSymbol} />
        </div>

        {/* Chart + Movers */}
        <div
          className="animate-fade-up delay-2"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <StockChart symbol={activeSymbol} label={activeLabel} />
          <TopMovers onSelect={handleSelect} />
        </div>

      </main>

      <style>{`
        @keyframes live-pulse {
          0%,100% { opacity:1; box-shadow:0 0 8px var(--green); }
          50%      { opacity:0.6; box-shadow:0 0 4px var(--green); }
        }
        @media (max-width: 900px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
