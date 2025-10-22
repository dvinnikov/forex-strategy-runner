# Forex Strategy Runner (Vite + React + TradingView)

A lightweight React app that renders a TradingView chart (public `tv.js` widget) and drives **real-time** price/strategy UI from **your own backend** (MT5 → FastAPI).  
The chart uses a **custom datafeed** to pull candles and live bars from your server, and the exact same data is mirrored to the rest of the UI via a tiny in-memory bus.

---

## Features

- ⚡ Vite + React + TypeScript
- 📈 TradingView widget with custom datafeed (your server provides data)
- 🔌 Real-time updates via WebSocket (`/stream/candles`)
- 🧠 Shared market bus so **all UI** reads the same live data as the chart
- 🧩 Strategy list, prediction card, and signal log (UI scaffolding ready to wire)

---

## Prerequisites

- **Node.js 18+** (check with `node -v`)
- A running **FastAPI backend** that provides:
  - `GET /api/candles?symbol=EURUSD&timeframe=H1&limit=1000` → `{ "candles": [{ time, open, high, low, close, volume? }, ...] }`  
    - `time` is **seconds** epoch (the frontend multiplies by `1000` to ms)
  - `WS /stream/candles?symbol=EURUSD&timeframe=H1` → messages like `{ "bar": { time, open, high, low, close } }`
- (Optional) Corporate proxy configured for npm if needed.

> **Note:** TradingView’s `tv.js` **does not** give you their proprietary data. You must supply data (we do via your backend), which is the correct/allowed way.

---

## Project setup

### 1) Clone & install

```bash
# from your working directory
npm i
# if the React plugin isn’t present, add it explicitly:
npm i -D @vitejs/plugin-react @types/node
