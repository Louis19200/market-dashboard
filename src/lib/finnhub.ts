const BASE = 'https://finnhub.io/api/v1';
const key = () => process.env.FINNHUB_API_KEY ?? '';

export async function getQuote(symbol: string) {
  const res = await fetch(
    `${BASE}/quote?symbol=${symbol}&token=${key()}`,
    { next: { revalidate: 30 } }
  );
  if (!res.ok) throw new Error(`Quote error ${res.status}`);
  return res.json();
}

export async function searchSymbol(query: string) {
  const res = await fetch(
    `${BASE}/search?q=${encodeURIComponent(query)}&token=${key()}`
  );
  if (!res.ok) throw new Error(`Search error ${res.status}`);
  return res.json();
}

// ✅ Yahoo Finance à la place de Finnhub pour les candles
export async function getYahooCandles(symbol: string, interval: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MarketDash/1.0)',
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`);
  return res.json();
}
