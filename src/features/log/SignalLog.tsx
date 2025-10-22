type Row = {
  time: string;
  strategy: string;
  side: "BUY" | "SELL";
  entry: number;
  stop: number;
  target: number;
  status: "ACTIVE" | "CLOSED";
  result?: string;
  pnl?: number;
};

type Props = {
  rows: Row[];
  total?: { pnl: number; winRate?: number; count: number };
};

export default function SignalLog({ rows, total }: Props) {
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h1">Signal Logs</div>
        <div className="small">
          Total P&amp;L: ${total?.pnl?.toFixed(2) ?? "0.00"} &nbsp;|&nbsp; Win Rate:{" "}
          {total?.winRate != null ? `${Math.round(total.winRate * 100)}%` : "NaN%"} &nbsp;|&nbsp; Signals:{" "}
          {total?.count ?? rows.length}
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
              <td>
                <span className="badge" style={{ borderColor: r.side === "BUY" ? "#10b981aa" : "#ef4444aa" }}>
                  {r.side}
                </span>
              </td>
              <td>{r.entry.toFixed(5)}</td>
              <td>{r.stop.toFixed(5)}</td>
              <td>{r.target.toFixed(5)}</td>
              <td>{r.status}</td>
              <td>{r.result ?? "-"}</td>
              <td>{r.pnl != null ? r.pnl.toFixed(2) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
