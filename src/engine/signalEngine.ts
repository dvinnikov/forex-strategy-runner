import type { Bar, Signal } from "./types";
import { STRATEGY_CATALOG, type StrategyFn } from "./strategies";
import { onFill, emitSignal } from "./logBus";
import * as MarketBus from "../lib/marketBus";
import { subscribe } from "../lib/marketBus";
import { TradeExecutor } from "./tradeExecutor";

/** Orchestrates strategies on every new bar for (symbol, tf). */
export class SignalEngine {
  private symbol: string;
  private tf: string;
  private enabled: Set<string> = new Set();
  private fns: Map<string, StrategyFn> = new Map();
  private unsub?: () => void;
  private executor = new TradeExecutor();
  // Prediction state
  private votes: number[] = []; // +1 bull, -1 bear (bounded window)
  private VOTE_MAX = 50;

  constructor(symbol: string, tf: string) {
    this.symbol = symbol;
    this.tf = tf;
    // preload known strategies
    Object.entries(STRATEGY_CATALOG).forEach(([id, fn]) => this.fns.set(id, fn));
    onFill(() => {}); // keep instance alive; consumer subscribes where needed
  }

  setAutotrade(v: boolean) { this.executor.setAutotrade(v); }
  isAutotrade() { return this.executor.isAutotrade(); }

  setEnabled(ids: string[]) {
    this.enabled = new Set(ids);
  }

  start() {
    this.stop();
    this.unsub = subscribe(this.symbol, this.tf, (bar) => this.onBar(bar as Bar));
  }

  stop() {
    if (this.unsub) { this.unsub(); this.unsub = undefined; }
  }

  switchContext(symbol: string, tf: string) {
    this.stop();
    this.symbol = symbol; this.tf = tf;
    this.start();
  }

  private onBar(bar: Bar) {
    // feed executor for SL/TP
    this.executor.onBar(this.symbol, this.tf, bar);

    const history = MarketBus.getHistory(this.symbol, this.tf) as Bar[];
    for (const id of this.enabled) {
      const fn = this.fns.get(id);
      if (!fn) continue;
      const sig = fn({ symbol: this.symbol, tf: this.tf, bars: history, last: bar });
      if (sig) {
        emitSignal(sig);
        this.executor.onSignal(sig);
        // vote for prediction
        this.votes.push(sig.side === "BUY" ? 1 : -1);
        if (this.votes.length > this.VOTE_MAX) this.votes.shift();
      }
    }
  }

  /** Simple probability from recent votes. */
  getPrediction(): { mood: "BULLISH" | "BEARISH" | "RANGE"; confidence: number; target?: number } {
    if (this.votes.length === 0) return { mood: "RANGE", confidence: 0.5 };
    const sum = this.votes.reduce((a, b) => a + b, 0);
    const p = Math.abs(sum) / this.votes.length; // 0..1
    const mood = sum > 0 ? "BULLISH" : sum < 0 ? "BEARISH" : "RANGE";
    return { mood, confidence: Math.max(0.5, p) };
  }

  closeAll(bar: Bar) {
    this.executor.closeAll(this.symbol, this.tf, bar);
  }
}
