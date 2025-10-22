import type { Bar } from "./types";

export function sma(values: number[], length: number) {
  if (values.length < length) return undefined;
  const slice = values.slice(-length);
  const s = slice.reduce((a, b) => a + b, 0);
  return s / length;
}

export function ema(values: number[], length: number, prev?: number) {
  if (values.length < length) return undefined;
  const k = 2 / (length + 1);
  if (prev == null) {
    // seed with SMA
    const seed = sma(values.slice(0, length), length)!;
    let e = seed;
    for (let i = length; i < values.length; i++) e = values[i] * k + e * (1 - k);
    return e;
  }
  return values[values.length - 1] * k + prev * (1 - k);
}

export function rsi(closes: number[], length: number) {
  if (closes.length < length + 1) return undefined;
  let gains = 0, losses = 0;
  for (let i = closes.length - length; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = losses === 0 ? 100 : gains / (losses || 1e-12);
  const val = 100 - 100 / (1 + rs);
  return Math.max(0, Math.min(100, val));
}

export function bollinger(closes: number[], length: number, mult = 2) {
  if (closes.length < length) return undefined;
  const mid = sma(closes, length)!;
  const slice = closes.slice(-length);
  const variance = slice.reduce((a, v) => a + (v - mid) ** 2, 0) / length;
  const stdev = Math.sqrt(variance);
  return { mid, upper: mid + mult * stdev, lower: mid - mult * stdev };
}
