/**
 * Fill ratio 0–100 (precise, for bar width and labels).
 */
export function getDispenserFillRatioClamped(capacity, currentLevel) {
  const c = Number(capacity) || 0
  const v = Number(currentLevel) || 0
  if (c <= 0) return 0
  return Math.max(0, Math.min(100, (v * 100) / c))
}

/**
 * Integer 0–100 for tier thresholds.
 */
export function getDispenserFillPercent(capacity, currentLevel) {
  return Math.round(getDispenserFillRatioClamped(capacity, currentLevel))
}

/** @param {number} pct 0–100 */
export function getTankTier(pct) {
  if (pct < 30) return "low"
  if (pct < 60) return "warn"
  return "ok"
}

/** Tailwind bg class for tank fill */
export function getTankFillClass(pct) {
  const t = getTankTier(pct)
  if (t === "low") return "bg-rose-500"
  if (t === "warn") return "bg-amber-500"
  return "bg-emerald-500"
}

/** Status pill classes */
export function getStatusPillClass(pct) {
  const t = getTankTier(pct)
  if (t === "low")
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
  if (t === "warn")
    return "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
  return "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
}

export function getStatusLabel(pct) {
  const t = getTankTier(pct)
  if (t === "low") return "Low"
  if (t === "warn") return "Caution"
  return "OK"
}
