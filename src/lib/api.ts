import { httpUrl, wsUrl } from "./env";

// Basic candle type your backend returns (seconds epoch)
export type ServerCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export async function getCandles(
  symbol: string,
  timeframe: string,
  limit = 1000
): Promise<{ candles: ServerCandle[] }> {
  const u = new URL(httpUrl("/api/candles"));
  u.searchParams.set("symbol", symbol);
  u.searchParams.set("timeframe", timeframe);
  u.searchParams.set("limit", String(limit));
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`candles ${r.status}`);
  return r.json();
}

export { wsUrl };
export type { ServerCandle as Candle };
export type StrategyLevel = {
  strategy: string;
  side: "BUY" | "SELL";
  entry: number;
  stop: number;
  target: number;
};
