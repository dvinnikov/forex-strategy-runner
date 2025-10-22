import { useEffect, useState } from "react";
import type { Side } from "../../engine/types";
import { onFill, onSignal } from "../../engine/logBus";

type Row = {
  time: string;
  strategy: string;
  side: Side;
  entry: number;
  stop: number;
  target: number;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  result?: string;
  pnl?: number;
};

type Props = { };

export default function SignalLog(_: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [tot, setTot] = useState({ pnl: 0, wins: 0, count: 0 });

  useEffect(() => {
    const u1 = onSignal((s) => {
      setRows((r) => [
        {
          time: new Date(s.at).toLocaleTimeString(),
          strategy: s.strategy,
          side: s.side,
          entry: s.entry,
          stop: s.stop,
          target: s.target,
          status: "ACTIVE",
        },
        ...r,
      ]);
    });
    const u2 = onFill((f) => {
      setRows((r) => {
        const i = r.findIndex(x => x.strategy === f.strategy && x.status === "ACTIVE");
        if (i >= 0) {
          const copy = [...r];
          copy[i] = {
            ...copy[i],
            status: "CLOSED",
            result: f.status,
            pnl: f.pnl,
          };
          return copy;
        }
        return r;
      });
      setTot((t) => {
        const wins = t.wins + (f.pnl > 0 ? 1 : 0);
        const count = t.count + 1;
        return { pnl: t.pnl + f.pnl, wins, count };
      });
    });
    return () => { u1(); u2(); };
  }, []);

  const winRate = tot.count ? tot.wins / tot.count : 0;

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h1">Signal Logs</div>
        <div className="small">
          Total P&amp;L: ${tot.pnl.toFixed(2)} &nbsp;|&nbsp; Win Rate: {Math.round(winRate * 100)}% &nbsp;|&nbsp; Signals: {tot.count}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th><th>Strategy</th><th>Side</th><th>Entry</th>
            <th>Stop</th><th>Target</th><th>Status</th><th>Result</th><th>P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="small">{r.time}</td>
              <td>{r.strategy}</td>
              <td><span className="badge" style={{ borderColor: r.side === "BUY" ? "#10b981aa" : "#ef4444aa" }}>{r.side}</span></td>
              <td>{r.entry.toFixed(5)}</td>
              <td>{r.stop.toFixed(5)}</td>
              <td>{r.target.toFixed(5)}</td>
              <td>{r.status}</td>
              <td>{r.result ?? "-"}</td>
              <td>{r.pnl != null ? r.pnl.toFixed(5) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
