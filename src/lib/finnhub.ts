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

export async function getCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
) {
  const res = await fetch(
    `${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${key()}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Candles error ${res.status}`);
  return res.json();
}

export async function searchSymbol(query: string) {
  const res = await fetch(
    `${BASE}/search?q=${encodeURIComponent(query)}&token=${key()}`
  );
  if (!res.ok) throw new Error(`Search error ${res.status}`);
  return res.json();
}
