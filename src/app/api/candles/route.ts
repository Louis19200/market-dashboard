import { NextRequest, NextResponse } from 'next/server';
import { getCandles } from '@/lib/finnhub';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? '';
  const resolution = req.nextUrl.searchParams.get('resolution') ?? 'D';
  if (!symbol) return NextResponse.json({ error: 'No symbol' }, { status: 400 });

  const to = Math.floor(Date.now() / 1000);
  // 1 an de données
  const from = to - 365 * 24 * 60 * 60;

  try {
    const data = await getCandles(symbol, resolution, from, to);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('[candles]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
