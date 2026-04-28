/* eslint-disable react/prop-types -- dispenser is API model shape */
import { useEffect, useId, useState } from "react"
import {
  getDispenserFillPercent,
  getDispenserFillRatioClamped,
  getTankTier,
} from "@/lib/dispenserLevel"

const TIER_COLORS = {
  low: { main: "#f43f5e", light: "#fda4af", dark: "#9f1239" },
  warn: { main: "#f59e0b", light: "#fcd34d", dark: "#b45309" },
  ok: { main: "#10b981", light: "#6ee7b7", dark: "#047857" },
}

/**
 * Tank geometry (SVG units inside a 160x260 viewBox).
 * - Body: a horizontal cylinder rendered as rect + top/bottom ellipses.
 * - Liquid is clipped to the inner usable area.
 */
const TANK = {
  cx: 80,
  rx: 46,
  topY: 32,
  bottomY: 222,
  ry: 12,
}

const INNER_TOP = TANK.topY
const INNER_BOTTOM = TANK.bottomY
const INNER_H = INNER_BOTTOM - INNER_TOP
const INNER_LEFT = TANK.cx - TANK.rx
const INNER_RIGHT = TANK.cx + TANK.rx
const INNER_W = INNER_RIGHT - INNER_LEFT

/**
 * Build a long, repeating wave path so we can scroll it horizontally
 * (translateX from 0 to -INNER_W) for a seamless loop.
 */
function buildWavePath({ amplitude = 4, period = 40, repeats = 3, height = 30 }) {
  const startX = INNER_LEFT - INNER_W
  const endX = INNER_RIGHT + INNER_W
  const totalSpan = endX - startX
  const cycles = Math.max(repeats, Math.ceil(totalSpan / period))
  let d = `M ${startX} 0`
  for (let i = 0; i < cycles; i += 1) {
    const x1 = startX + i * period + period / 2
    const x2 = startX + (i + 1) * period
    const peak = i % 2 === 0 ? -amplitude : amplitude
    d += ` Q ${x1} ${peak} ${x2} 0`
  }
  d += ` L ${endX} ${height} L ${startX} ${height} Z`
  return d
}

const Tank = ({ dispenser }) => {
  const ratio = getDispenserFillRatioClamped(dispenser.capacity, dispenser.current_level)
  const labelPct = getDispenserFillPercent(dispenser.capacity, dispenser.current_level)
  const tier = getTankTier(labelPct)
  const colors = TIER_COLORS[tier]
  const cap = Number(dispenser.capacity) || 0
  const level = Number(dispenser.current_level) || 0
  const uid = useId().replace(/:/g, "")
  const [fillPct, setFillPct] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setFillPct(ratio))
    return () => cancelAnimationFrame(id)
  }, [ratio])

  const liquidH = (fillPct / 100) * INNER_H
  const liquidY = INNER_BOTTOM - liquidH

  const ariaLabel = `Tank ${labelPct} percent full (${level.toFixed(2)} of ${cap.toFixed(2)} kilograms)`

  const tickPercents = [100, 75, 50, 25, 0]
  const tickKg = (p) => (cap * p) / 100

  const waveDA = buildWavePath({ amplitude: 4, period: 38, repeats: 6, height: 40 })
  const waveDB = buildWavePath({ amplitude: 5, period: 46, repeats: 6, height: 40 })

  return (
    <div className="tank-svg-root relative mx-auto w-full max-w-[8.5rem]">
      <style>{`
        .tank-svg-root .tank-wave-a-${uid} {
          animation: tankWaveSlide-${uid} 4.2s linear infinite;
        }
        .tank-svg-root .tank-wave-b-${uid} {
          animation: tankWaveSlideRev-${uid} 5.6s linear infinite;
          opacity: 0.7;
        }
        @keyframes tankWaveSlide-${uid} {
          from { transform: translateX(0); }
          to   { transform: translateX(${INNER_W}px); }
        }
        @keyframes tankWaveSlideRev-${uid} {
          from { transform: translateX(0); }
          to   { transform: translateX(${-INNER_W}px); }
        }
        .tank-svg-root .tank-bubble-${uid} {
          animation: tankBubble-${uid} 4.5s ease-in infinite;
          transform-origin: center;
          opacity: 0;
        }
        .tank-svg-root .tank-bubble-${uid}.tb2 { animation-delay: 1.4s; animation-duration: 5.2s; }
        .tank-svg-root .tank-bubble-${uid}.tb3 { animation-delay: 2.6s; animation-duration: 6s; }
        @keyframes tankBubble-${uid} {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          15%  { opacity: 0.85; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-${INNER_H * 0.85}px) scale(1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tank-svg-root .tank-wave-a-${uid},
          .tank-svg-root .tank-wave-b-${uid},
          .tank-svg-root .tank-bubble-${uid} {
            animation: none !important;
          }
          .tank-svg-root .tank-liquid-rect {
            transition: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 160 260"
        className="h-56 w-full drop-shadow-md"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={`liquidGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.light} />
            <stop offset="55%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.dark} />
          </linearGradient>
          <linearGradient id={`bodyGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.55" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#f1f5f9" stopOpacity="0.55" />
            <stop offset="85%" stopColor="#94a3b8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`glassGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="18%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="32%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`rimGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`baseGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <clipPath id={`liquidClip-${uid}`}>
            <path
              d={`M ${INNER_LEFT} ${INNER_TOP}
                  L ${INNER_RIGHT} ${INNER_TOP}
                  L ${INNER_RIGHT} ${INNER_BOTTOM}
                  A ${TANK.rx} ${TANK.ry} 0 0 1 ${INNER_LEFT} ${INNER_BOTTOM}
                  Z`}
            />
          </clipPath>

          <clipPath id={`bodyClip-${uid}`}>
            <path
              d={`M ${INNER_LEFT} ${INNER_TOP}
                  A ${TANK.rx} ${TANK.ry} 0 0 1 ${INNER_RIGHT} ${INNER_TOP}
                  L ${INNER_RIGHT} ${INNER_BOTTOM}
                  A ${TANK.rx} ${TANK.ry} 0 0 1 ${INNER_LEFT} ${INNER_BOTTOM}
                  Z`}
            />
          </clipPath>

          <filter id={`tankShadow-${uid}`} x="-30%" y="-10%" width="160%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Bottom shadow base */}
        <ellipse
          cx={TANK.cx}
          cy={INNER_BOTTOM + 22}
          rx={TANK.rx + 6}
          ry="6"
          fill="#0f172a"
          opacity="0.08"
        />

        {/* Cylinder back wall */}
        <g filter={`url(#tankShadow-${uid})`}>
          <rect
            x={INNER_LEFT}
            y={INNER_TOP}
            width={INNER_W}
            height={INNER_H}
            fill="#e2e8f0"
          />
          <ellipse cx={TANK.cx} cy={INNER_BOTTOM} rx={TANK.rx} ry={TANK.ry} fill="#cbd5e1" />
        </g>

        {/* Liquid + waves + bubbles, clipped to the inner tank */}
        <g clipPath={`url(#liquidClip-${uid})`}>
          <rect
            className="tank-liquid-rect"
            x={INNER_LEFT}
            y={liquidY}
            width={INNER_W}
            height={Math.max(liquidH, 0.5)}
            fill={`url(#liquidGrad-${uid})`}
            style={{
              transition:
                "y 0.7s cubic-bezier(0.22, 1, 0.36, 1), height 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Wave layer A */}
          {liquidH > 2 && (
            <g transform={`translate(0 ${liquidY})`}>
              <g className={`tank-wave-a-${uid}`}>
                <path d={waveDA} fill={colors.light} opacity="0.85">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from={`0 0`}
                    to={`${INNER_W} 0`}
                    dur="4.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>
          )}

          {/* Wave layer B (lighter, reverse) */}
          {liquidH > 2 && (
            <g transform={`translate(0 ${liquidY + 1})`}>
              <g className={`tank-wave-b-${uid}`}>
                <path d={waveDB} fill="#ffffff" opacity="0.45">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from={`0 0`}
                    to={`${-INNER_W} 0`}
                    dur="5.6s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>
          )}

          {/* Bubbles */}
          {liquidH > 30 && (
            <g>
              <circle
                className={`tank-bubble-${uid}`}
                cx={TANK.cx - 18}
                cy={INNER_BOTTOM - 6}
                r="2.2"
                fill="#ffffff"
                fillOpacity="0.85"
              />
              <circle
                className={`tank-bubble-${uid} tb2`}
                cx={TANK.cx + 8}
                cy={INNER_BOTTOM - 4}
                r="1.6"
                fill="#ffffff"
                fillOpacity="0.85"
              />
              <circle
                className={`tank-bubble-${uid} tb3`}
                cx={TANK.cx + 22}
                cy={INNER_BOTTOM - 8}
                r="1.2"
                fill="#ffffff"
                fillOpacity="0.85"
              />
            </g>
          )}
        </g>

        {/* Glass shading overlay (highlight + edge shadow) */}
        <g clipPath={`url(#bodyClip-${uid})`}>
          <rect
            x={INNER_LEFT}
            y={INNER_TOP}
            width={INNER_W}
            height={INNER_H}
            fill={`url(#bodyGrad-${uid})`}
            opacity="0.55"
          />
          <rect
            x={INNER_LEFT}
            y={INNER_TOP}
            width={INNER_W}
            height={INNER_H}
            fill={`url(#glassGrad-${uid})`}
          />
          <rect
            x={INNER_LEFT + 6}
            y={INNER_TOP + 4}
            width="6"
            height={INNER_H - 8}
            rx="3"
            fill="#ffffff"
            opacity="0.35"
          />
        </g>

        {/* Cylinder outline */}
        <path
          d={`M ${INNER_LEFT} ${INNER_TOP}
              L ${INNER_LEFT} ${INNER_BOTTOM}
              A ${TANK.rx} ${TANK.ry} 0 0 0 ${INNER_RIGHT} ${INNER_BOTTOM}
              L ${INNER_RIGHT} ${INNER_TOP}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.4"
        />

        {/* Top rim (open top look) */}
        <ellipse
          cx={TANK.cx}
          cy={INNER_TOP}
          rx={TANK.rx}
          ry={TANK.ry}
          fill={`url(#rimGrad-${uid})`}
          stroke="#94a3b8"
          strokeWidth="1.4"
        />
        <ellipse
          cx={TANK.cx}
          cy={INNER_TOP}
          rx={TANK.rx - 4}
          ry={TANK.ry - 3}
          fill="#0f172a"
          fillOpacity="0.16"
        />
        <ellipse
          cx={TANK.cx}
          cy={INNER_TOP - 1}
          rx={TANK.rx - 8}
          ry={TANK.ry - 5}
          fill="#ffffff"
          fillOpacity="0.7"
        />

        {/* Base ring */}
        <rect
          x={INNER_LEFT - 6}
          y={INNER_BOTTOM + 6}
          width={INNER_W + 12}
          height="8"
          rx="3"
          fill={`url(#baseGrad-${uid})`}
        />
        <rect
          x={INNER_LEFT - 4}
          y={INNER_BOTTOM + 14}
          width={INNER_W + 8}
          height="4"
          rx="2"
          fill="#475569"
        />

        {/* Right-side ticks */}
        <g
          fontSize="8"
          fontFamily="system-ui, sans-serif"
          className="tabular-nums"
        >
          {tickPercents.map((p) => {
            const y = INNER_BOTTOM - (p / 100) * INNER_H
            return (
              <g key={p}>
                <line
                  x1={INNER_RIGHT + 4}
                  y1={y}
                  x2={INNER_RIGHT + 12}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth="1.1"
                />
                <text x={INNER_RIGHT + 15} y={y + 3} fill="#475569">
                  {cap > 0 ? tickKg(p).toFixed(0) : "0"}
                </text>
              </g>
            )
          })}
        </g>

        {/* Center readout */}
        <rect
          x={TANK.cx - 26}
          y="116"
          width="52"
          height="40"
          rx="8"
          fill="#ffffff"
          fillOpacity="0.94"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <text
          x={TANK.cx}
          y="136"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="#0f172a"
          className="tabular-nums"
          fontFamily="system-ui, sans-serif"
        >
          {labelPct}%
        </text>
        <text
          x={TANK.cx}
          y="150"
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
          className="tabular-nums"
          fontFamily="system-ui, sans-serif"
        >
          {level.toFixed(1)} kg
        </text>
      </svg>
    </div>
  )
}

export default Tank
