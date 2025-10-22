type Props = { mood: "BULLISH" | "BEARISH" | "RANGE"; confidence: number; target?: number };

export default function PredictionCard({ mood, confidence, target }: Props) {
  const moodColor = mood === "BULLISH" ? "#10b981" : mood === "BEARISH" ? "#ef4444" : "#9ca3af";
  return (
    <div className="panel pred">
      <div className="h1">Market Prediction</div>
      <span className="badge" style={{ borderColor: moodColor, color: moodColor }}>
        {mood}
      </span>
      <div className="kv">
        <div className="small">Horizon</div>
        <div>Next 1–4 hours</div>
        <div className="small">Confidence</div>
        <div className="badge">{Math.round(confidence * 100)}%</div>
        <div className="small">Target Price</div>
        <div>{target ? target.toFixed(5) : "-"}</div>
      </div>
    </div>
  );
}
