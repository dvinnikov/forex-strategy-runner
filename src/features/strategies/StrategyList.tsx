type Item = {
  id: string;
  name: string;
  desc: string;
  wr: number; // win-rate percent
  active: boolean;
};

type Props = {
  items: Item[];
  onToggle: (id: string, next: boolean) => void;
};

export default function StrategyList({ items, onToggle }: Props) {
  return (
    <div className="panel">
      <div className="h1">Trading Strategies</div>
      <div className="small" style={{ marginTop: 4, marginBottom: 10 }}>
        Select strategies to run
      </div>
      <div className="list">
        {items.map((s) => (
          <label key={s.id} className="strategy">
            <input
              type="checkbox"
              checked={s.active}
              onChange={(e) => onToggle(s.id, e.target.checked)}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div className="small">{s.desc}</div>
            </div>
            <div className="badge">{s.wr}% WR</div>
          </label>
        ))}
      </div>
    </div>
  );
}
