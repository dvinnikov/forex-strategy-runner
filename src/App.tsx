import "./styles.css";
import TVChart from "./features/chart/TVChart";
import StrategyList from "./features/strategies/StrategyList";
import PredictionCard from "./features/prediction/PredictionCard";
import SignalLog from "./features/log/SignalLog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMarketData } from "./lib/useMarketData";
import { SignalEngine } from "./engine/signalEngine";
import * as MarketBus from "./lib/marketBus";

export default function App() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [tf, setTf] = useState("H1");
  const { lastPrice } = useMarketData(symbol, tf);

  const [strategies, setStrategies] = useState(() => [
    { id: "rsi", name: "RSI Crossover", desc: "RSI crossing 30/70 with trend confirm", wr: 68, active: true },
    { id: "ema", name: "EMA Crossover", desc: "Fast/slow EMA crossover", wr: 61, active: true },
    { id: "bb",  name: "Bollinger Bounce", desc: "Mean reversion on bands", wr: 65, active: true },
  ]);

  // --- Engine instance ---
  const engineRef = useRef<SignalEngine | null>(null);
  useEffect(() => {
    const eng = new SignalEngine(symbol, tf);
    eng.setEnabled(strategies.filter(s => s.active).map(s => s.id));
    eng.start();
    engineRef.current = eng;
    return () => { eng.stop(); engineRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create once

  // switch context on symbol/tf change
  useEffect(() => {
    engineRef.current?.switchContext(symbol, tf);
    engineRef.current?.setEnabled(strategies.filter(s => s.active).map(s => s.id));
  }, [symbol, tf, strategies]);

  const onToggleStrategy = (id: string, next: boolean) => {
    setStrategies((arr) => arr.map((s) => (s.id === id ? { ...s, active: next } : s)));
    const eng = engineRef.current;
    if (eng) eng.setEnabled(strategies.map(s => s.id === id ? (next ? s.id : "") : (s.active ? s.id : "")).filter(Boolean) as string[]);
  };

  const [autotrade, setAutotrade] = useState(false);
  const toggleTrade = () => {
    const eng = engineRef.current;
    if (!eng) return;
    const next = !autotrade;
    eng.setAutotrade(next);
    setAutotrade(next);
  };

  // live prediction
  const prediction = useMemo(() => {
    const eng = engineRef.current;
    if (!eng) return { mood: "RANGE" as const, confidence: 0.5, target: undefined as number | undefined };
    const p = eng.getPrediction();
    const target = lastPrice ? (p.mood === "BULLISH" ? lastPrice * 1.003 : p.mood === "BEARISH" ? lastPrice * 0.997 : undefined) : undefined;
    return { ...p, target };
  }, [lastPrice]);

  return (
    <div className="app">
      <div className="sidebar">
        <StrategyList items={strategies} onToggle={onToggleStrategy} />
      </div>

      <div className="header panel">
        <div className="h1">Forex Strategy Runner</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="badge">
            <option>EURUSD</option><option>GBPUSD</option><option>USDJPY</option><option>USDCAD</option><option>USDCHF</option><option>AUDUSD</option>
          </select>
          <select value={tf} onChange={(e) => setTf(e.target.value)} className="badge">
            <option value="M1">M1</option><option value="M5">M5</option><option value="M15">M15</option>
            <option value="M30">M30</option><option value="H1">H1</option><option value="H4">H4</option><option value="D1">D1</option>
          </select>
          <div className="badge">{symbol}&nbsp; {lastPrice ? lastPrice.toFixed(5) : "--"}</div>
          <button className="btn" onClick={toggleTrade}>{autotrade ? "Stop" : "Start"} Trading</button>
        </div>
      </div>

      <div className="main">
        <div className="panel" style={{ padding: 0, height: 520 }}>
          <TVChart
            symbol={symbol}
            timeframe={tf}
            height={520}
            levels={[]} // levels now come from signals table; you can also render them here if you want
          />
        </div>

        <div className="row2">
          <PredictionCard mood={prediction.mood} confidence={prediction.confidence} target={prediction.target} />
          <div />
        </div>
      </div>

      <div className="footer">
        <SignalLog />
      </div>
    </div>
  );
}
