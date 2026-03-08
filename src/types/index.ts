export interface Quote {
  symbol: string;
  label: string;
  c: number;   // current price
  d: number;   // change
  dp: number;  // change percent
  h: number;   // high
  l: number;   // low
  pc: number;  // previous close
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}
