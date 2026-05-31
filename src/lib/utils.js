import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const  formatCurrency = (value) => {
  return Intl.NumberFormat('ja-JP' ).format(
    value,
  )
}

/** KPI fields aligned with analytics charts (regression only on these). */
const PROJECTED_METRIC_FIELDS = [
  "totalSalesAmount",
  "totalSalesKg",
  "profit",
  "totalProfit",
  "totalExcessKg",
  "ExcessKgProfit",
]

const NON_NEGATIVE_PROJECTED_FIELDS = new Set(PROJECTED_METRIC_FIELDS)

/**
 * Monotonic sort key for backend `group` labels (weekly, monthly, quarterly, yearly).
 * @param {unknown} group
 * @returns {number}
 */
export function parseGroupSortKey(group) {
  if (typeof group !== "string") return Number.NaN
  const q = group.match(/^Q([1-4])\s(\d{4})$/)
  if (q) {
    const quarter = parseInt(q[1], 10)
    const year = parseInt(q[2], 10)
    return year * 4 + quarter
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(group)) {
    const t = new Date(`${group}T12:00:00`).getTime()
    return Number.isFinite(t) ? t : Number.NaN
  }
  if (/^\d{4}-\d{2}$/.test(group)) {
    const t = new Date(`${group}-01T12:00:00`).getTime()
    return Number.isFinite(t) ? t : Number.NaN
  }
  if (/^\d{4}$/.test(group)) {
    const t = new Date(`${group}-01-01T12:00:00`).getTime()
    return Number.isFinite(t) ? t : Number.NaN
  }
  const t = new Date(group).getTime()
  return Number.isFinite(t) ? t : Number.NaN
}

function medianOf(values) {
  const finite = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  if (finite.length === 0) return null
  const mid = Math.floor(finite.length / 2)
  return finite.length % 2 === 1
    ? finite[mid]
    : (finite[mid - 1] + finite[mid]) / 2
}

function tailMedianForecast(yValues, k = 4) {
  const tail = yValues.slice(-Math.min(k, yValues.length))
  return medianOf(tail)
}

/**
 * @param {string} lastGroup
 * @param {string} [timeframe]
 * @returns {string}
 */
function nextPeriodDisplayLabel(lastGroup, timeframe) {
  const tf = String(timeframe || "weekly").toLowerCase()
  if (typeof lastGroup !== "string") return ""

  const q = lastGroup.match(/^Q([1-4])\s(\d{4})$/)
  if (q || tf === "quarterly") {
    if (!q) return lastGroup
    let nq = parseInt(q[1], 10) + 1
    let ny = parseInt(q[2], 10)
    if (nq > 4) {
      nq = 1
      ny += 1
    }
    return `Q${nq} ${ny}`
  }

  if (tf === "monthly" && /^\d{4}-\d{2}$/.test(lastGroup)) {
    const [ys, ms] = lastGroup.split("-")
    let month = parseInt(ms, 10) + 1
    let year = parseInt(ys, 10)
    if (month > 12) {
      month = 1
      year += 1
    }
    return `${year}-${String(month).padStart(2, "0")}`
  }

  if (tf === "yearly" && /^\d{4}$/.test(lastGroup)) {
    return String(parseInt(lastGroup, 10) + 1)
  }

  const key = parseGroupSortKey(lastGroup)
  if (!Number.isFinite(key)) return lastGroup
  const d = new Date(key)
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

/**
 * Weighted least squares line y ≈ intercept + slope * x, with x = 0..m-1.
 * @param {number[]} x
 * @param {number[]} y
 * @param {number[]} w
 * @param {number} xPredict
 * @returns {{ slope: number, intercept: number, yHat: number } | null}
 */
function weightedLinearRegression(x, y, w, xPredict) {
  const n = x.length
  if (n < 2 || n !== y.length || n !== w.length) return null

  let Sw = 0
  let Sxw = 0
  let Syw = 0
  let Sxxw = 0
  let Sxyw = 0

  for (let i = 0; i < n; i += 1) {
    const wi = w[i]
    if (!Number.isFinite(wi) || wi <= 0) continue
    const xi = x[i]
    const yi = y[i]
    if (!Number.isFinite(xi) || !Number.isFinite(yi)) continue
    Sw += wi
    Sxw += wi * xi
    Syw += wi * yi
    Sxxw += wi * xi * xi
    Sxyw += wi * xi * yi
  }

  if (Sw < 1e-12) return null

  const denom = Sw * Sxxw - Sxw * Sxw
  if (Math.abs(denom) < 1e-12) return null

  const slope = (Sw * Sxyw - Sxw * Syw) / denom
  const intercept = (Syw - slope * Sxw) / Sw
  const yHat = slope * xPredict + intercept

  if (!Number.isFinite(slope) || !Number.isFinite(intercept) || !Number.isFinite(yHat)) {
    return null
  }

  return { slope, intercept, yHat }
}

/**
 * Ordinal-period projection: sort by `group`, optional weighted trend on indices 0..m-1,
 * forecast at index m (one step after last training bucket).
 *
 * @param {Array<Record<string, unknown>>} data - training rows only (e.g. all but last chart row)
 * @param {{ timeframe?: string, periodsToUse?: number }} [options]
 * @returns {{ date: string, projections: Record<string, number | null> } | null}
 */
export function projectedValues(data, options = {}) {
  if (!data || data.length < 2) return null

  const { timeframe = "weekly", periodsToUse = 12 } = options

  const sorted = [...data].sort(
    (a, b) => parseGroupSortKey(a.group) - parseGroupSortKey(b.group),
  )
  const recentData = sorted.slice(-periodsToUse)
  const m = recentData.length
  if (m < 2) return null

  const lastGroup = recentData[m - 1]?.group
  const dateLabel = nextPeriodDisplayLabel(
    typeof lastGroup === "string" ? lastGroup : "",
    timeframe,
  )

  const x = Array.from({ length: m }, (_, i) => i)
  const weights = Array.from({ length: m }, (_, i) =>
    m > 1 ? 1 + i / (m - 1) : 1,
  )
  const xPredict = m

  const results = {}

  for (const field of PROJECTED_METRIC_FIELDS) {
    const yValues = recentData.map((row) => {
      const v = row[field]
      if (typeof v === "number") return v
      const n = Number(v)
      return Number.isFinite(n) ? n : Number.NaN
    })

    if (yValues.some((v) => !Number.isFinite(v))) {
      results[field] = null
      continue
    }

    const meanY = yValues.reduce((acc, v) => acc + v, 0) / m
    const varY =
      yValues.reduce((acc, v) => acc + (v - meanY) ** 2, 0) / Math.max(m, 1)
    const fallback = tailMedianForecast(yValues, 4)

    if (varY < 1e-12) {
      let flat = meanY
      if (NON_NEGATIVE_PROJECTED_FIELDS.has(field) && flat < 0) flat = 0
      results[field] = parseFloat(flat.toFixed(2))
      continue
    }

    const reg = weightedLinearRegression(x, yValues, weights, xPredict)
    let projectedY = reg?.yHat

    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)
    const range = maxY - minY + 1e-6
    const slopeTooLarge = reg && Math.abs(reg.slope) > 25 * range

    if (projectedY == null || !Number.isFinite(projectedY) || slopeTooLarge) {
      projectedY = fallback
    }

    if (projectedY == null || !Number.isFinite(projectedY)) {
      results[field] = null
      continue
    }

    if (NON_NEGATIVE_PROJECTED_FIELDS.has(field) && projectedY < 0) {
      projectedY = 0
    }

    results[field] = parseFloat(projectedY.toFixed(2))
  }

  return {
    date: dateLabel,
    projections: results,
  }
}
