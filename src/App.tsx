import "./styles.css";
import TVChart from "./features/chart/TVChart";
import StrategyList from "./features/strategies/StrategyList";
import PredictionCard from "./features/prediction/PredictionCard";
import SignalLog from "./features/log/SignalLog";
import { useMemo, useState } from "react";
import { useMarketData } from "./lib/useMarketData";

export default function App() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [tf, setTf] = useState("H1");

  const { lastPrice } = useMarketData(symbol, tf);

  const [strategies, setStrategies] = useState(() => [
    { id: "rsi", name: "RSI Crossover", desc: "RSI crossing 30/70 with trend confirm", wr: 68, active: true },
    { id: "macd", name: "MACD Divergence", desc: "Divergences between price and MACD", wr: 72, active: true },
    { id: "bb", name: "Bollinger Bounce", desc: "Mean reversion using Bollinger touches", wr: 65, active: true },
    { id: "ema", name: "EMA Crossover", desc: "Fast/slow EMA crossover", wr: 61, active: true },
    { id: "sr", name: "Support/Resistance", desc: "Bounces at key levels", wr: 70, active: true },
    { id: "break", name: "Breakout Strategy", desc: "Range breakouts with volume", wr: 66, active: true },
    { id: "fib", name: "Fibonacci Retracement", desc: "Entries at retrace levels", wr: 64, active: true },
    { id: "pa", name: "Price Action", desc: "Candlestick formations", wr: 69, active: true }
  ]);

  const onToggleStrategy = (id: string, next: boolean) => {
    setStrategies((arr) => arr.map((s) => (s.id === id ? { ...s, active: next } : s)));
    // here you can POST to backend to start/stop strategies server-side
  };

  // placeholder prediction (you can wire to backend analytics)
  const prediction = useMemo(() => ({
    mood: "BULLISH" as const,
    confidence: 0.72,
    target: lastPrice ? lastPrice * 0.993 : undefined
  }), [lastPrice]);

  const signalRows = useMemo(() => ([
    {
      time: new Date().toLocaleTimeString(),
      strategy: "Bollinger Bounce",
      side: "SELL" as const,
      entry: lastPrice ?? 1.08091,
      stop: (lastPrice ?? 1.08091) + 0.003,
      target: (lastPrice ?? 1.08091) - 0.006,
      status: "ACTIVE" as const
    }
  ]), [lastPrice]);

  return (
    <div className="app">
      <div className="sidebar">
        <StrategyList items={strategies} onToggle={onToggleStrategy} />
      </div>

      <div className="header panel">
        <div className="h1">Forex Strategy Runner</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="badge"
          >
            <option>EURUSD</option>
            <option>GBPUSD</option>
            <option>USDJPY</option>
            <option>USDCAD</option>
            <option>USDCHF</option>
            <option>AUDUSD</option>
          </select>
          <select
            value={tf}
            onChange={(e) => setTf(e.target.value)}
            className="badge"
          >
            <option value="M1">M1</option>
            <option value="M5">M5</option>
            <option value="M15">M15</option>
            <option value="M30">M30</option>
            <option value="H1">H1</option>
            <option value="H4">H4</option>
            <option value="D1">D1</option>
          </select>
          <div className="badge">
            {symbol}&nbsp; {lastPrice ? lastPrice.toFixed(5) : "--"}
          </div>
          <button className="btn">Stop</button>
        </div>
      </div>

      <div className="main">
        <div className="panel" style={{ padding: 0, height: 520 }}>
          <TVChart
            symbol={symbol}
            timeframe={tf}
            height={520}
            levels={[
              { strategy: "Bollinger Bounce", side: "SELL", entry: (lastPrice ?? 1.08), stop: (lastPrice ?? 1.08) + 0.003, target: (lastPrice ?? 1.08) - 0.006 }
            ]}
          />
        </div>

        <div className="row2">
          <PredictionCard
            mood={prediction.mood}
            confidence={prediction.confidence}
            target={prediction.target}
          />
          <div></div>
        </div>
      </div>

      <div className="footer">
        <SignalLog rows={signalRows} total={{ pnl: 0, count: signalRows.length }} />
      </div>
    </div>
  );
}
