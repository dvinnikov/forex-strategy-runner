import type { Fill, Signal } from "./types";

type Listener<T> = (item: T) => void;

const sigListeners = new Set<Listener<Signal>>();
const fillListeners = new Set<Listener<Fill>>();

export function onSignal(fn: Listener<Signal>) { sigListeners.add(fn); return () => sigListeners.delete(fn); }
export function onFill(fn: Listener<Fill>) { fillListeners.add(fn); return () => fillListeners.delete(fn); }

export function emitSignal(s: Signal) { sigListeners.forEach(fn => { try { fn(s); } catch {} }); }
export function emitFill(f: Fill) { fillListeners.forEach(fn => { try { fn(f); } catch {} }); }
