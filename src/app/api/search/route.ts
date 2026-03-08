import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol } from '@/lib/finnhub';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json([]);

  try {
    const data = await searchSymbol(q);
    const results = (data.result ?? [])
      .filter((r: any) => r.type === 'Common Stock' || r.type === 'ETP')
      .slice(0, 8);
    return NextResponse.json(results);
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json([], { status: 500 });
  }
}
