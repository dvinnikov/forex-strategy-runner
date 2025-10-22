import type { Bar, Fill, Position, Side, Signal } from "./types";
import { emitFill } from "./logBus";

/** Simple in-memory trade executor with SL/TP checks on each bar. */
export class TradeExecutor {
  private positions: Map<string, Position> = new Map();
  private autotrade = false;

  setAutotrade(v: boolean) { this.autotrade = v; }
  isAutotrade() { return this.autotrade; }

  private key(symbol: string, tf: string, strategy: string) {
    return `${symbol}__${tf}__${strategy}`;
  }

  onSignal(sig: Signal) {
    if (!this.autotrade) return;
    const k = this.key(sig.symbol, sig.tf, sig.strategy);
    if (this.positions.has(k)) return; // one position per strategy
    this.positions.set(k, {
      strategy: sig.strategy,
      side: sig.side,
      entry: sig.entry,
      stop: sig.stop,
      target: sig.target,
      openedAt: sig.at
    });
  }

  onBar(symbol: string, tf: string, bar: Bar) {
    for (const [k, pos] of [...this.positions]) {
      if (!k.startsWith(`${symbol}__${tf}__`)) continue;
      let exit: number | undefined;
      let status: Fill["status"] | undefined;

      if (pos.side === "BUY") {
        if (bar.low <= pos.stop) { exit = pos.stop; status = "SL"; }
        else if (bar.high >= pos.target) { exit = pos.target; status = "TP"; }
      } else {
        if (bar.high >= pos.stop) { exit = pos.stop; status = "SL"; }
        else if (bar.low <= pos.target) { exit = pos.target; status = "TP"; }
      }

      if (exit != null && status) {
        const pnl = pos.side === "BUY" ? (exit - pos.entry) : (pos.entry - exit);
        const fill: Fill = {
          at: bar.time, symbol, tf, strategy: pos.strategy,
          side: pos.side, entry: pos.entry, exit, pnl, status
        };
        this.positions.delete(k);
        emitFill(fill);
      }
    }
  }

  closeAll(symbol: string, tf: string, bar: Bar) {
    for (const [k, pos] of [...this.positions]) {
      if (!k.startsWith(`${symbol}__${tf}__`)) continue;
      const exit = bar.close;
      const pnl = pos.side === "BUY" ? (exit - pos.entry) : (pos.entry - exit);
      emitFill({ at: bar.time, symbol, tf, strategy: pos.strategy, side: pos.side, entry: pos.entry, exit, pnl, status: "MANUAL" });
      this.positions.delete(k);
    }
  }
}
