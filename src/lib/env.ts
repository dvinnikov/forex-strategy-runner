export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
export const WS_URL =
  import.meta.env.VITE_WS_URL?.replace(/\/$/, "") || "ws://127.0.0.1:8000";

// Build a ws url from a path like "/stream/candles?symbol=EURUSD&timeframe=H1"
export const wsUrl = (path: string) => {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${WS_URL}${path}`;
};

// Build http url from a path like "/api/candles"
export const httpUrl = (path: string) => {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_URL}${path}`;
};
