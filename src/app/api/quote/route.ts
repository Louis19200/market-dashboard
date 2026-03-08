import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/finnhub';

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get('symbols')?.split(',') ?? [];
  if (!symbols.length) return NextResponse.json([]);

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const data = await getQuote(symbol.trim());
        return { symbol: symbol.trim(), ...data };
      })
    );
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15' },
    });
  } catch (err) {
    console.error('[quote]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
