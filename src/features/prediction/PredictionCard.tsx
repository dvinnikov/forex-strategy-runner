type Props = {
  mood: "BULLISH" | "BEARISH" | "RANGE";
  confidence: number; // 0..1
  target?: number;
};

export default function PredictionCard({ mood, confidence, target }: Props) {
  const chip = mood === "BULLISH" ? "chip" : "badge";
  const title =
    mood === "BULLISH" ? "BULLISH" : mood === "BEARISH" ? "BEARISH" : "RANGE";
  return (
    <div className="panel pred">
      <div className="h1">Market Prediction</div>
      <span className={chip}>{title}</span>
      <div className="kv">
        <div className="small">Next 1–4 hours</div>
        <div className="badge">{Math.round(confidence * 100)}% Confidence</div>
        <div className="small">Target Price</div>
        <div>{target ? target.toFixed(5) : "-"}</div>
      </div>
    </div>
  );
}
