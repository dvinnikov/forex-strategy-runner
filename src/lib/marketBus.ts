export type Candle = {
  time: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type Listener = (bar: Candle) => void;
const HISTORY_MAX = 3000;
const key = (s: string, tf: string) => `${s}__${tf}`;

const history = new Map<string, Candle[]>();
const lastBar = new Map<string, Candle>();
const listeners = new Map<string, Set<Listener>>();

export function seedHistory(symbol: string, tf: string, bars: Candle[]) {
  if (!bars?.length) return;
  const k = key(symbol, tf);
  const sorted = [...bars].sort((a, b) => a.time - b.time);
  const trimmed = sorted.slice(-HISTORY_MAX);
  history.set(k, trimmed);
  lastBar.set(k, trimmed[trimmed.length - 1]);
}

export function emitRealtime(symbol: string, tf: string, bar: Candle) {
  const k = key(symbol, tf);
  const arr = history.get(k) ?? [];
  const n = arr.length;
  if (n === 0 || bar.time > arr[n - 1].time) arr.push(bar);
  else if (bar.time === arr[n - 1].time) arr[n - 1] = bar;
  if (arr.length > HISTORY_MAX) arr.splice(0, arr.length - HISTORY_MAX);
  history.set(k, arr);
  lastBar.set(k, bar);

  const subs = listeners.get(k);
  if (subs) subs.forEach((fn) => { try { fn(bar); } catch {} });
}

export function subscribe(symbol: string, tf: string, fn: Listener) {
  const k = key(symbol, tf);
  let set = listeners.get(k);
  if (!set) { set = new Set(); listeners.set(k, set); }
  set.add(fn);
  const lb = lastBar.get(k);
  if (lb) { try { fn(lb); } catch {} }
  return () => {
    const s = listeners.get(k);
    if (!s) return;
    s.delete(fn);
    if (s.size === 0) listeners.delete(k);
  };
}

export const getLast = (s: string, tf: string) => lastBar.get(key(s, tf));
export const getHistory = (s: string, tf: string) => history.get(key(s, tf)) ?? [];
export const getLastPrice = (s: string, tf: string) => getLast(s, tf)?.close;
