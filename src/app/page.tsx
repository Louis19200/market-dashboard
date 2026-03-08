'use client';

import { useState } from 'react';
import MarketOverview from '@/components/MarketOverview';
import SearchBar from '@/components/SearchBar';
import StockChart from '@/components/StockChart';
import TopMovers from '@/components/TopMovers';

export default function HomePage() {
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeLabel, setActiveLabel] = useState('Apple Inc.');

  function handleSelect(symbol: string, label: string) {
    setActiveSymbol(symbol);
    setActiveLabel(label);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-bold">M</div>
          <span className="font-semibold tracking-tight">MarketDash</span>
        </div>
        <SearchBar onSelect={handleSelect} />
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Indices principaux */}
        <MarketOverview onSelect={handleSelect} />

        {/* Graphique + Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockChart symbol={activeSymbol} label={activeLabel} />
          </div>
          <TopMovers onSelect={handleSelect} />
        </div>
      </div>
    </main>
  );
}
