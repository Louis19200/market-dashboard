import { NextRequest, NextResponse } from 'next/server';
import { getYahooCandles } from '@/lib/finnhub';

// Mapping résolution → params Yahoo Finance
const RESOLUTION_MAP: Record<string, { interval: string; range: string }> = {
  W:  { interval: '1d',  range: '5d'  }, // 1 semaine
  D:  { interval: '1d',  range: '1mo' }, // 1 mois (défaut)
  '3D': { interval: '1d', range: '3mo'}, // 3 mois
  M:  { interval: '1wk', range: '1y'  }, // 1 an
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? '';
  const resolution = req.nextUrl.searchParams.get('resolution') ?? 'D';
  const days = req.nextUrl.searchParams.get('days') ?? '30';

  if (!symbol) return NextResponse.json({ error: 'No symbol' }, { status: 400 });

  // Détermine range selon le nb de jours envoyé par le front
  let interval = '1d';
  let range = '1mo';
  if      (Number(days) <= 7)   { interval = '1d';  range = '5d';  }
  else if (Number(days) <= 30)  { interval = '1d';  range = '1mo'; }
  else if (Number(days) <= 90)  { interval = '1d';  range = '3mo'; }
  else                          { interval = '1wk'; range = '1y';  }

  try {
    const raw = await getYahooCandles(symbol, interval, range);
    const result = raw?.chart?.result?.[0];

    if (!result) {
      console.warn('[candles] Yahoo: no result for', symbol);
      return NextResponse.json({ s: 'no_data' });
    }

    const timestamps: number[] = result.timestamp ?? [];
    const quote = result.indicators?.quote?.[0] ?? {};

    // Formate en même structure que Finnhub pour ne pas toucher au front
    return NextResponse.json({
      s: 'ok',
      t: timestamps,
      o: quote.open  ?? [],
      h: quote.high  ?? [],
      l: quote.low   ?? [],
      c: quote.close ?? [],
      v: quote.volume ?? [],
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('[candles] Yahoo error:', err);
    return NextResponse.json({ s: 'error', error: String(err) }, { status: 500 });
  }
}
