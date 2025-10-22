import type { Bar, Signal } from "./types";
import { ema, rsi, bollinger } from "./indicators";

export type StrategyFn = (ctx: {
  symbol: string; tf: string; bars: Bar[]; last?: Bar;
}) => Signal | undefined;

/** --- RSI Crossover: buy from oversold crossing up; sell from overbought crossing down --- */
export function rsiCrossover(len = 14, ob = 70, os = 30): StrategyFn {
  let prevRsi: number | undefined;
  return ({ symbol, tf, bars }) => {
    const closes = bars.map(b => b.close);
    const val = rsi(closes, len);
    const last = bars[bars.length - 1];
    if (val == null || prevRsi == null) { prevRsi = val; return; }
    let sig: Signal | undefined;
    if (prevRsi < os && val >= os) {
      // buy with tight SL/TP (ATR-less simple)
      const entry = last.close;
      sig = { at: last.time, symbol, tf, strategy: "RSI Crossover", side: "BUY",
        entry, stop: entry - 0.0030, target: entry + 0.0060 };
    } else if (prevRsi > ob && val <= ob) {
      const entry = last.close;
      sig = { at: last.time, symbol, tf, strategy: "RSI Crossover", side: "SELL",
        entry, stop: entry + 0.0030, target: entry - 0.0060 };
    }
    prevRsi = val;
    return sig;
  };
}

/** --- EMA Crossover: fast over slow -> buy; under -> sell --- */
export function emaCrossover(fast = 9, slow = 21): StrategyFn {
  let prevDiff: number | undefined;
  return ({ symbol, tf, bars }) => {
    const closes = bars.map(b => b.close);
    if (closes.length < slow + 2) return;
    // compute EMAs incrementally
    let eFast: number | undefined, eSlow: number | undefined;
    for (let i = 0; i < closes.length; i++) {
      eFast = ema(closes.slice(0, i + 1), fast, eFast);
      eSlow = ema(closes.slice(0, i + 1), slow, eSlow);
    }
    if (eFast == null || eSlow == null) return;
    const diff = eFast - eSlow;
    const last = bars[bars.length - 1];
    if (prevDiff == null) { prevDiff = diff; return; }

    let sig: Signal | undefined;
    if (prevDiff <= 0 && diff > 0) { // bullish cross
      const entry = last.close;
      sig = { at: last.time, symbol, tf, strategy: "EMA Crossover", side: "BUY",
        entry, stop: entry - 0.0030, target: entry + 0.0060 };
    } else if (prevDiff >= 0 && diff < 0) {
      const entry = last.close;
      sig = { at: last.time, symbol, tf, strategy: "EMA Crossover", side: "SELL",
        entry, stop: entry + 0.0030, target: entry - 0.0060 };
    }
    prevDiff = diff;
    return sig;
  };
}

/** --- Bollinger Bounce: touch outer band then revert --- */
export function bollingerBounce(len = 20, mult = 2): StrategyFn {
  return ({ symbol, tf, bars }) => {
    const closes = bars.map(b => b.close);
    const bands = bollinger(closes, len, mult);
    if (!bands) return;
    const last = bars[bars.length - 1];
    if (last.close >= bands.upper) {
      const entry = last.close;
      return { at: last.time, symbol, tf, strategy: "Bollinger Bounce", side: "SELL",
        entry, stop: entry + 0.0030, target: entry - 0.0060 };
    }
    if (last.close <= bands.lower) {
      const entry = last.close;
      return { at: last.time, symbol, tf, strategy: "Bollinger Bounce", side: "BUY",
        entry, stop: entry - 0.0030, target: entry + 0.0060 };
    }
  };
}

export const STRATEGY_CATALOG: Record<string, StrategyFn> = {
  rsi: rsiCrossover(),
  ema: emaCrossover(),
  bb: bollingerBounce(),
};
