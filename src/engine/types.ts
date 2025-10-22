export type Side = "BUY" | "SELL";

export type Bar = {
  time: number; open: number; high: number; low: number; close: number; volume?: number;
};

export type Signal = {
  at: number;                 // ms epoch
  symbol: string;
  tf: string;
  strategy: string;
  side: Side;
  entry: number;
  stop: number;
  target: number;
};

export type Fill = {
  at: number;
  symbol: string;
  tf: string;
  strategy: string;
  side: Side;
  entry: number;
  exit: number;
  pnl: number;
  status: "TP" | "SL" | "MANUAL";
};

export type Position = {
  strategy: string;
  side: Side;
  entry: number;
  stop: number;
  target: number;
  openedAt: number;
};
