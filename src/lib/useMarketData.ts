import { useEffect, useMemo, useState } from "react";
import { subscribe, getHistory, getLast, type Candle } from "./marketBus";

export function useMarketData(symbol: string, tf: string) {
  const id = useMemo(() => `${symbol}__${tf}`, [symbol, tf]);
  const [last, setLast] = useState<Candle | undefined>(() => getLast(symbol, tf));
  const [hist, setHist] = useState<Candle[]>(() => getHistory(symbol, tf));

  useEffect(() => {
    setHist(getHistory(symbol, tf));
    setLast(getLast(symbol, tf));
    const unsub = subscribe(symbol, tf, (bar) => {
      setLast(bar);
      setHist(getHistory(symbol, tf));
    });
    return () => unsub();
  }, [id, symbol, tf]);

  return { lastBar: last, lastPrice: last?.close, history: hist };
}
