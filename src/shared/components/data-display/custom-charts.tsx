/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable max-params */
/* eslint-disable react-hooks/refs */
/* eslint-disable curly */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointer,
  type ReactNode,
} from "react"

export const PALETTE = {
  blue: "#378ADD",
  orange: "#eb6834",
  aqua: "#1baf7a",
  yellow: "#eda100",
  magenta: "#e87ba4",
  green: "#008300",
  violet: "#6250d6",
  red: "#e34948",
  gray: "#888780",
  sky: "#6f9cf0",
  mint: "#12c98a",
}

/* Estilos. Todo vive bajo .uc-root, que define el tema claro/oscuro con data-theme. */

const CSS = `
.uc-root{background:var(--uc-page);padding:24px;border-radius:16px;color:var(--uc-text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;box-sizing:border-box}
.uc-root[data-theme="light"]{--uc-page:#e4e3dd;--uc-card:#ffffff;--uc-border:rgba(0,0,0,.10);--uc-border-strong:rgba(0,0,0,.28);--uc-text:#1a1a18;--uc-text-2:#5f5e5a;--uc-tip:#ffffff;--uc-btn:#ffffff;--uc-btn-hover:#f0efeb;--uc-btn-border:rgba(0,0,0,.25)}
.uc-root[data-theme="dark"]{--uc-page:#141413;--uc-card:#2a2a27;--uc-border:rgba(255,255,255,.10);--uc-border-strong:rgba(255,255,255,.30);--uc-text:#f0efec;--uc-text-2:#b4b2a9;--uc-tip:#3a3a36;--uc-btn:#33332f;--uc-btn-hover:#41413c;--uc-btn-border:rgba(255,255,255,.28)}
.uc-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.uc-h1{font-size:22px;font-weight:500;margin:0 0 4px;color:var(--uc-text)}
.uc-sub{font-size:14px;margin:0;color:var(--uc-text-2);line-height:1.5}
.uc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.uc-card{background:var(--uc-card);border:1px solid var(--uc-border);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
.uc-title{font-size:16px;font-weight:500;color:var(--uc-text);margin:0}
.uc-body{flex:1;display:flex;flex-direction:column;justify-content:center}
.uc-body>div{width:100%}
.uc-foot{display:flex;gap:8px;margin-top:auto}
.uc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--uc-btn);border:1px solid var(--uc-btn-border);border-radius:8px;padding:8px 10px;font-size:13px;line-height:1;color:var(--uc-text);cursor:pointer;font-family:inherit;transition:background 150ms ease,transform 100ms ease}
.uc-foot .uc-btn{flex:1 1 0;min-width:0}
.uc-btn:hover{background:var(--uc-btn-hover)}
.uc-btn:active{transform:scale(.96)}
.uc-btn:focus-visible{outline:2px solid var(--uc-border-strong);outline-offset:2px}
.uc-tip{position:absolute;pointer-events:none;background:var(--uc-tip);border:1px solid var(--uc-border-strong);border-radius:8px;padding:6px 10px;font-size:12px;color:var(--uc-text);white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.18);z-index:2}
.uc-tip .k{color:var(--uc-text-2);margin-right:4px}
.uc-tip .v{font-weight:500}
.uc-tip-row{display:flex;align-items:center;gap:6px;margin-top:3px}
.uc-tip-row i{width:8px;height:8px;border-radius:3px;display:inline-block}
.uc-tip-row .k{margin:0}
.uc-tip-row .v{margin-left:auto;padding-left:16px}
.uc-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--uc-text-2);margin-top:6px}
.uc-legend span{display:inline-flex;align-items:center;gap:4px}
.uc-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
.uc-navhead{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.uc-back{padding:8px 12px}
.uc-list{display:grid;gap:10px;max-width:680px;margin:0 auto;width:100%}
.uc-row{display:flex;align-items:center;gap:14px;width:100%;background:var(--uc-card);border:1px solid var(--uc-border);border-radius:14px;padding:14px 16px;cursor:pointer;color:var(--uc-text);text-align:left;font-family:inherit}
.uc-row:hover{background:var(--uc-btn-hover)}
.uc-row-icon{width:44px;height:44px;border-radius:50%;background:var(--uc-btn);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--uc-text)}
.uc-row-text{flex:1;min-width:0;display:grid;gap:3px}
.uc-row-title{font-size:15px;font-weight:500}
.uc-row-desc{font-size:13px;color:var(--uc-text-2);line-height:1.4}
.uc-row-meta{font-size:12px;color:var(--uc-text-2);white-space:nowrap}
.uc-row>svg{color:var(--uc-text-2);flex-shrink:0}
.uc-cardhead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.uc-toggle[aria-pressed="true"]{background:var(--uc-btn-hover)}
.uc-body>pre{width:100%}
.uc-code{margin:0;background:var(--uc-page);border:1px solid var(--uc-border);border-radius:10px;padding:10px;font-size:12px;line-height:1.5;overflow-x:auto;color:var(--uc-text);font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre}
@media (max-width:480px){.uc-root{padding:14px}.uc-grid{grid-template-columns:1fr}}
`

export function ChartStyles() {
  return <style>{CSS}</style>
}

export type Datum = { label: string; value: number; color: string }
type TipRow = { label: string; value: string; color: string }
type Tip = {
  title: string
  value?: string
  color?: string
  rows?: TipRow[]
} | null
type Pos = { x: number; y: number; w: number }
type Hover = {
  active: boolean
  dim: boolean
  onEnter: () => void
  onLeave: () => void
}
type Replay = { replayKey?: unknown; className?: string }

const TAU = Math.PI * 2
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b)
const polar = (
  r: number,
  a: number,
  cx: number,
  cy: number
): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
const prefersReduced = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
const prefersDark = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-color-scheme: dark)").matches

const labelStyle: CSSProperties = { fill: "var(--uc-text-2)", fontSize: 12 }
const titleStyle: CSSProperties = {
  fill: "var(--uc-text)",
  fontSize: 22,
  fontWeight: 500,
}
const anchorFor = (cos: number) =>
  cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle"
const hoverStyle = (active: boolean, dim: boolean): CSSProperties => ({
  opacity: dim && !active ? 0.4 : 1,
  transition:
    "opacity 200ms ease, transform 200ms ease, stroke-width 200ms ease, fill-opacity 200ms ease",
})
const svgBase: CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
}
const fmt = (n: number) =>
  Math.abs(n) >= 10 ? `${Math.round(n)}` : `${Math.round(n * 10) / 10}`

/* Entrada: se reproduce con replayKey. Valores: interpolan en tiempo real cuando cambian los datos. */

function useProgress(
  duration = 900,
  delay = 0,
  replayKey: unknown = 0
): number {
  const [p, setP] = useState(prefersReduced() ? 1 : 0)
  useEffect(() => {
    if (prefersReduced()) {
      setP(1)
      return
    }
    let raf = 0
    const start = performance.now() + delay
    setP(0)
    const step = (now: number) => {
      const t = clamp((now - start) / duration)
      setP(ease(t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [duration, delay, replayKey])
  return p
}

function useElapsed(replayKey: unknown, total: number): number {
  const [ms, setMs] = useState(prefersReduced() ? total : 0)
  useEffect(() => {
    if (prefersReduced()) {
      setMs(total)
      return
    }
    let raf = 0
    const start = performance.now()
    setMs(0)
    const step = (now: number) => {
      const e = now - start
      setMs(Math.min(e, total))
      if (e < total) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [replayKey, total])
  return ms
}

function useClock(): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (prefersReduced()) return
    let raf = 0
    const f = (now: number) => {
      setT(now)
      raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [])
  return t
}

function useTweened(target: number[], duration = 700): number[] {
  const [cur, setCur] = useState<number[]>(target)
  const from = useRef<number[]>(target)
  const key = target.join(",")
  useEffect(() => {
    if (prefersReduced()) {
      from.current = target
      setCur(target)
      return
    }
    const f0 = from.current
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = ease(clamp((now - start) / duration))
      const v = target.map((x, i) => (f0[i] ?? x) + (x - (f0[i] ?? x)) * t)
      from.current = v
      setCur(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return cur
}

function useTweenValue(target: number, duration = 700): number {
  return useTweened([target], duration)[0]
}

function useInteractive() {
  const box = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(false)
  const candRef = useRef<{ i: number | null; data: Tip } | null>(null)
  const [tip, setTip] = useState<Tip>(null)
  const [act, setAct] = useState<number | null>(null)
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0, w: 0 })
  const place = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect()
    if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width })
  }
  const track = (e: RPointer<HTMLDivElement>) => {
    if (!pinnedRef.current) place(e)
  }
  const enter = (i: number | null, data: Tip) => {
    candRef.current = { i, data }
    if (!pinnedRef.current) {
      setAct(i)
      setTip(data)
    }
  }
  const leave = () => {
    candRef.current = null
    if (!pinnedRef.current) {
      setAct(null)
      setTip(null)
    }
  }
  const press = (e: RPointer<HTMLDivElement>) => {
    const cand = candRef.current
    if (cand && cand.i !== null) {
      pinnedRef.current = true
      place(e)
      setAct(cand.i)
      setTip(cand.data)
    } else {
      pinnedRef.current = false
      setAct(null)
      setTip(null)
    }
  }
  useEffect(() => {
    const outside = (ev: PointerEvent) => {
      if (pinnedRef.current && !box.current?.contains(ev.target as Node)) {
        pinnedRef.current = false
        candRef.current = null
        setAct(null)
        setTip(null)
      }
    }
    document.addEventListener("pointerdown", outside)
    return () => document.removeEventListener("pointerdown", outside)
  }, [])
  return { box, tip, act, pos, track, enter, leave, press }
}
type Interactive = ReturnType<typeof useInteractive>

function toViewBox(
  e: RPointer<SVGSVGElement>,
  W: number,
  H: number
): [number, number] {
  const r = e.currentTarget.getBoundingClientRect()
  return [
    ((e.clientX - r.left) / r.width) * W,
    ((e.clientY - r.top) / r.height) * H,
  ]
}

function Tooltip({ tip, pos }: { tip: Tip; pos: Pos }) {
  if (!tip) return null
  const flip = pos.x > pos.w / 2
  return (
    <div
      className="uc-tip"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, 14px)`,
      }}
    >
      {tip.rows ? (
        <>
          <div className="k" style={{ marginBottom: 4 }}>
            {tip.title}
          </div>
          {tip.rows.map((r) => (
            <div key={r.label} className="uc-tip-row">
              <i style={{ background: r.color }} />
              <span className="k">{r.label}</span>
              <span className="v">{r.value}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          {tip.color && (
            <i
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 3,
                background: tip.color,
                marginRight: 6,
              }}
            />
          )}
          <span className="k">{tip.title}</span>
          <span className="v">{tip.value}</span>
        </>
      )}
    </div>
  )
}

function Box({
  t,
  className,
  children,
}: {
  t: Interactive
  className?: string
  children: ReactNode
}) {
  return (
    <div
      ref={t.box}
      className={className}
      style={{ position: "relative" }}
      onPointerMove={t.track}
      onPointerLeave={t.leave}
      onPointerDown={t.press}
    >
      {children}
      <Tooltip tip={t.tip} pos={t.pos} />
    </div>
  )
}

function Legend({
  items,
}: {
  items: { label: string; color: string; value?: number | string }[]
}) {
  return (
    <div className="uc-legend">
      {items.map((d) => (
        <span key={d.label}>
          <i style={{ background: d.color }} />
          {d.label}
          {d.value !== undefined ? ` ${d.value}` : ""}
        </span>
      ))}
    </div>
  )
}

function sectorPath(c: number, r1: number, r2: number, a0: number, a1: number) {
  const [x1, y1] = polar(r2, a0, c, c)
  const [x2, y2] = polar(r2, a1, c, c)
  const [x3, y3] = polar(r1, a1, c, c)
  const [x4, y4] = polar(r1, a0, c, c)
  return `M${x4} ${y4}L${x1} ${y1}A${r2} ${r2} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 0 0 ${x4} ${y4}Z`
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(r, a0, cx, cy)
  const [x1, y1] = polar(r, a1, cx, cy)
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`
}

/*
 * Sector anular con esquinas redondeadas. Cada esquina se limita al ancho del sector
 * para que el arco interior nunca se invierta: kO para las esquinas exteriores y kI
 * para las interiores, cada una con su propio límite angular.
 */
function roundSector(
  c: number,
  r1: number,
  r2: number,
  a0: number,
  a1: number,
  rc: number
) {
  const span = a1 - a0
  const kO = Math.max(0.5, Math.min(rc, (r2 - r1) / 2 - 0.5, span * r2 * 0.45))
  const kI = Math.max(
    0.5,
    Math.min(rc * 0.45, (r2 - r1) / 2 - 0.5, span * r1 * 0.2)
  )
  const P = (r: number, a: number) => polar(r, a, c, c).join(" ")
  return (
    `M${P(r1 + kI, a0)}` +
    `L${P(r2 - kO, a0)}` +
    `Q${P(r2, a0)} ${P(r2, a0 + kO / r2)}` +
    `A${r2} ${r2} 0 0 1 ${P(r2, a1 - kO / r2)}` +
    `Q${P(r2, a1)} ${P(r2 - kO, a1)}` +
    `L${P(r1 + kI, a1)}` +
    `Q${P(r1, a1)} ${P(r1, a1 - kI / r1)}` +
    `A${r1} ${r1} 0 0 0 ${P(r1, a0 + kI / r1)}` +
    `Q${P(r1, a0)} ${P(r1 + kI, a0)}Z`
  )
}

/* 1. Sectores: molde gris redondeado; el relleno de color crece con el valor */

function SectorPetal({
  c,
  r0,
  R,
  a0,
  a1,
  d,
  max,
  delay,
  replayKey,
  rc,
  active,
  dim,
  onEnter,
  onLeave,
}: {
  c: number
  r0: number
  R: number
  a0: number
  a1: number
  d: Datum
  max: number
  delay: number
  replayKey: unknown
  rc: number
} & Hover) {
  const p = useProgress(1000, delay, replayKey)
  const v = useTweenValue(d.value)
  const gap = 2.5 / R
  const s0 = a0 + gap
  const s1 = a1 - gap
  const outer = Math.max(r0 + (R - 8 - r0) * clamp(v / max) * p, r0 + 1)
  const shell = roundSector(c, r0, R, s0, s1, rc)
  const [lx, ly] = polar(r0 + (R - r0) * 0.5, (s0 + s1) / 2, c, c)
  return (
    <g
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        ...hoverStyle(active, dim),
        transform: active ? "scale(1.03)" : "scale(1)",
        transformOrigin: `${c}px ${c}px`,
      }}
    >
      <path d={shell} fill="var(--uc-border-strong)" fillOpacity={0.3} />
      <path d={roundSector(c, r0, outer, s0, s1, rc)} fill={d.color} />
      <path d={shell} fill="transparent" />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        style={{
          fill: "var(--uc-text)",
          paintOrder: "stroke",
          stroke: "var(--uc-card)",
          strokeWidth: 4,
          strokeLinejoin: "round",
        }}
      >
        <tspan x={lx} fontSize={20} fontWeight={500}>
          {Math.round(v)}
        </tspan>
        <tspan x={lx} dy={18} fontSize={13}>
          {d.label}
        </tspan>
      </text>
    </g>
  )
}

export function SectorChart({
  data,
  size = 360,
  max = 14,
  replayKey,
  className,
}: Replay & { data: Datum[]; size?: number; max?: number }) {
  const c = size / 2
  const R = c - 8
  const r0 = 48
  const rc = 20
  const sl = TAU / data.length
  const t = useInteractive()
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Gráfica de sectores"
        style={svgBase}
      >
        {data.map((d, i) => {
          const a0 = -Math.PI / 2 + i * sl
          return (
            <SectorPetal
              key={d.label}
              c={c}
              r0={r0}
              R={R}
              a0={a0}
              a1={a0 + sl}
              d={d}
              max={max}
              delay={i * 80}
              replayKey={replayKey}
              rc={rc}
              active={t.act === i}
              dim={t.act !== null}
              onEnter={() =>
                t.enter(i, {
                  title: d.label,
                  value: `${Math.round(d.value)}`,
                  color: d.color,
                })
              }
              onLeave={t.leave}
            />
          )
        })}
      </svg>
    </Box>
  )
}

/* 2. Barras radiales: fila completa o segmento individual */

export type RadialSeg = { label: string; value: number; color: string }
export type RadialCat = { label: string; segments: RadialSeg[] }

const SPAN = TAU * 0.75
const START = -Math.PI / 2
const RADIAL_C = 150
const ROW_BASE = 1000

function RadialRow({
  cat,
  vals,
  r,
  sw,
  gapPx,
  max,
  delay,
  replayKey,
  rowIdx,
  act,
  onSeg,
  onRow,
  onLeave,
}: {
  cat: RadialCat
  vals: number[]
  r: number
  sw: number
  gapPx: number
  max: number
  delay: number
  replayKey: unknown
  rowIdx: number
  act: number | null
  onSeg: (id: number, j: number) => void
  onRow: () => void
  onLeave: () => void
}) {
  const p = useProgress(1100, delay, replayKey)
  const pad = (sw / 2 + gapPx / 2) / r
  const rowOn = act === ROW_BASE + rowIdx
  let cum = 0
  const segs = cat.segments.map((s, j) => {
    const before = cum
    cum += vals[j] ?? 0
    return {
      s,
      j,
      a0: START + (before / max) * SPAN * p + pad,
      a1: START + (cum / max) * SPAN * p - pad,
    }
  })
  return (
    <g>
      <path
        d={arcPath(RADIAL_C, RADIAL_C, r, START + pad, START + SPAN - pad)}
        fill="none"
        stroke="var(--uc-border-strong)"
        strokeOpacity={0.25}
        strokeWidth={sw}
        strokeLinecap="round"
        onPointerEnter={onRow}
        onPointerLeave={onLeave}
      />
      {segs.map(({ s, j, a0, a1 }) => {
        const id = rowIdx * 10 + j
        const segAct = act === id || rowOn
        const dim = act !== null && !segAct
        if (a1 <= a0) return null
        return (
          <path
            key={s.label}
            d={arcPath(RADIAL_C, RADIAL_C, r, a0, a1)}
            fill="none"
            stroke={s.color}
            strokeWidth={segAct ? sw + 3 : sw}
            strokeLinecap="round"
            onPointerEnter={() => onSeg(id, j)}
            onPointerLeave={onLeave}
            style={hoverStyle(segAct, dim)}
          />
        )
      })}
    </g>
  )
}

export function RadialBarChart({
  categories,
  legend,
  max,
  sw = 14,
  gap = 8,
  replayKey,
  className,
}: Replay & {
  categories: RadialCat[]
  legend: { label: string; color: string }[]
  max: number
  sw?: number
  gap?: number
}) {
  const t = useInteractive()
  const size = 300
  const c = size / 2
  const outer = c - sw / 2 - 6
  const flat = categories.flatMap((cat) => cat.segments.map((s) => s.value))
  const tw = useTweened(flat)
  let off = 0
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Barras radiales"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {categories.map((cat, i) => {
          const vals = tw.slice(off, off + cat.segments.length)
          off += cat.segments.length
          const r = outer - i * (sw + gap)
          return (
            <g key={cat.label}>
              <RadialRow
                cat={cat}
                vals={vals}
                r={r}
                sw={sw}
                gapPx={3}
                max={max}
                delay={i * 140}
                replayKey={replayKey}
                rowIdx={i}
                act={t.act}
                onSeg={(id, j) => {
                  const s = cat.segments[j]
                  t.enter(id, {
                    title: `${cat.label}, ${s.label}`,
                    value: fmt(vals[j]),
                    color: s.color,
                  })
                }}
                onRow={() =>
                  t.enter(ROW_BASE + i, {
                    title: cat.label,
                    rows: cat.segments.map((s, j) => ({
                      label: s.label,
                      value: fmt(vals[j]),
                      color: s.color,
                    })),
                  })
                }
                onLeave={t.leave}
              />
              <text
                x={c - 10}
                y={c - r + 4}
                textAnchor="end"
                style={labelStyle}
              >
                {cat.label}
              </text>
            </g>
          )
        })}
      </svg>
      <Legend items={legend.map((l) => ({ label: l.label, color: l.color }))} />
    </Box>
  )
}

/* 3. Líquido: el texto cambia de color según esté sobre el agua o fuera */

export function LiquidChart({
  value,
  color = PALETTE.blue,
  size = 200,
  replayKey,
  className,
}: Replay & { value: number; color?: string; size?: number }) {
  const id = useId().replace(/:/g, "")
  const fill = useProgress(1600, 0, replayKey)
  const lv = useTweenValue(value)
  const clock = useClock()
  const t = useInteractive()
  const c = size / 2
  const level = clamp(lv / 100) * fill
  const y = size * 0.95 - level * size * 0.9
  const ph = clock / 500
  const wave = (yy: number, p: number) => {
    let d = `M0 ${yy}`
    for (let x = 0; x <= size; x += 4)
      d += `L${x} ${(yy + 5 * Math.sin(x * 0.05 + p)).toFixed(1)}`
    return d + `L${size} ${size}L0 ${size}Z`
  }
  const waterPath = wave(y, ph)
  const label = `${Math.round(lv * fill)}%`
  const textProps = {
    x: c,
    y: c + 8,
    textAnchor: "middle" as const,
    fontSize: 26,
    fontWeight: 500,
  }
  const active = t.act === 0
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Nivel de líquido en ${Math.round(lv)}%`}
        onPointerEnter={() =>
          t.enter(0, { title: "Nivel", value: `${Math.round(lv)}%`, color })
        }
        onPointerLeave={t.leave}
        style={{
          ...svgBase,
          transform: active ? "scale(1.04)" : "scale(1)",
          transformOrigin: "center",
          transition: "transform 200ms ease",
        }}
      >
        <defs>
          <clipPath id={id}>
            <circle cx={c} cy={c} r={c - 6} />
          </clipPath>
          <mask
            id={`${id}-w`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={size}
            height={size}
          >
            <rect width={size} height={size} fill="#000" />
            <path d={waterPath} fill="#fff" />
          </mask>
          <mask
            id={`${id}-a`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={size}
            height={size}
          >
            <rect width={size} height={size} fill="#fff" />
            <path d={waterPath} fill="#000" />
          </mask>
        </defs>
        <circle
          cx={c}
          cy={c}
          r={c - 6}
          fill="none"
          stroke={color}
          strokeWidth={3}
        />
        <g clipPath={`url(#${id})`}>
          <rect width={size} height={size} fill={color} fillOpacity={0.08} />
          <path d={wave(y + 4, ph + 2)} fill={color} fillOpacity={0.5} />
          <path d={waterPath} fill={color} />
        </g>
        <text {...textProps} style={{ fill: "#ffffff" }} mask={`url(#${id}-w)`}>
          {label}
        </text>
        <text
          {...textProps}
          style={{ fill: "var(--uc-text)" }}
          mask={`url(#${id}-a)`}
        >
          {label}
        </text>
      </svg>
    </Box>
  )
}

/* 4. Radar */

export function RadarChart({
  axes,
  values,
  max = 100,
  size = 360,
  color = PALETTE.orange,
  replayKey,
  className,
}: Replay & {
  axes: string[]
  values: number[]
  max?: number
  size?: number
  color?: string
}) {
  const c = size / 2
  const R = c - 84
  const n = axes.length
  const tweened = useTweened(values.map((v) => clamp(v / max)))
  const play = useProgress(900, 0, replayKey)
  const shown = tweened.map((v) => v * play)
  const t = useInteractive()
  const ang = (i: number) => -Math.PI / 2 + (i * TAU) / n
  const ring = (k: number) =>
    axes.map((_, i) => polar(R * k, ang(i), c, c).join(",")).join(" ")
  const poly = shown
    .map((v, i) => polar(R * v, ang(i), c, c).join(","))
    .join(" ")
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Gráfica de radar"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon
            key={k}
            points={ring(k)}
            fill="none"
            strokeWidth={0.5}
            style={{ stroke: "var(--uc-border-strong)" }}
          />
        ))}
        {axes.map((a, i) => {
          const [x, y] = polar(R, ang(i), c, c)
          const [lx, ly] = polar(R + 14, ang(i), c, c)
          return (
            <g key={a}>
              <line
                x1={c}
                y1={c}
                x2={x}
                y2={y}
                strokeWidth={0.5}
                style={{ stroke: "var(--uc-border-strong)" }}
              />
              <text
                x={lx}
                y={ly + 4}
                textAnchor={anchorFor(Math.cos(ang(i)))}
                style={labelStyle}
              >
                {a}
              </text>
            </g>
          )
        })}
        <polygon
          points={poly}
          fill={color}
          fillOpacity={0.25}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {shown.map((v, i) => {
          const [x, y] = polar(R * v, ang(i), c, c)
          return (
            <circle
              key={axes[i]}
              cx={x}
              cy={y}
              r={t.act === i ? 7 : 4}
              fill={color}
              style={{ transition: "r 200ms ease" }}
            />
          )
        })}
        {axes.map((a, i) => (
          <path
            key={`hit-${a}`}
            d={sectorPath(
              c,
              0,
              R + 10,
              ang(i) - Math.PI / n,
              ang(i) + Math.PI / n
            )}
            fill={color}
            fillOpacity={t.act === i ? 0.12 : 0}
            style={{ transition: "fill-opacity 200ms ease" }}
            onPointerEnter={() =>
              t.enter(i, { title: a, value: `${values[i]}`, color })
            }
            onPointerLeave={t.leave}
          />
        ))}
      </svg>
    </Box>
  )
}

/* 5. Cuadrícula: celdas que se llenan proporcionalmente al valor */

export function WaffleChart({
  filled,
  total = 100,
  cols = 10,
  color = PALETTE.aqua,
  size = 280,
  replayKey,
  className,
}: Replay & {
  filled: number
  total?: number
  cols?: number
  color?: string
  size?: number
}) {
  const elapsed = useElapsed(replayKey, 1500)
  const f = useTweenValue(filled)
  const t = useInteractive()
  const step = size / cols
  const s = step * 0.78
  const off = (step - s) / 2
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${Math.round(f)} de ${total} completados`}
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {Array.from({ length: total }, (_, i) => {
          const fillAmt = clamp(f - i)
          const active = t.act === i
          const appear = clamp((elapsed - i * 12) / 250)
          const x = (i % cols) * step + off
          const y = Math.floor(i / cols) * step + off
          return (
            <g
              key={i}
              onPointerEnter={() =>
                t.enter(i, {
                  title: `Celda ${i + 1}`,
                  value: fillAmt >= 0.5 ? "completada" : "pendiente",
                  color: fillAmt >= 0.5 ? color : undefined,
                })
              }
              onPointerLeave={t.leave}
              style={{
                opacity: appear,
                transform: active ? "scale(1.15)" : "scale(1)",
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "transform 150ms ease",
              }}
            >
              <rect
                x={x}
                y={y}
                width={s}
                height={s}
                rx={4}
                fill={PALETTE.gray}
                fillOpacity={0.2}
              />
              <rect
                x={x}
                y={y}
                width={s}
                height={s}
                rx={4}
                fill={color}
                fillOpacity={fillAmt}
              />
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

/* 6. Ridgeline */

export type Ridge = { label: string; color: string; values: number[] }

export function ridgeValues(seed: number, n = 101, step = 0.12): number[] {
  return Array.from({ length: n }, (_, i) => {
    const x = i * step
    return (
      clamp(0.5 + 0.5 * Math.sin(x * 3 + seed * 0.9)) *
      (0.55 + 0.45 * Math.cos(x * 1.7 + seed * 1.7))
    )
  })
}

function RidgeRow({
  base,
  x0,
  w,
  r,
  delay,
  replayKey,
  active,
  dim,
}: {
  base: number
  x0: number
  w: number
  r: Ridge
  delay: number
  replayKey: unknown
  active: boolean
  dim: boolean
}) {
  const p = useProgress(1000, delay, replayKey)
  const vals = useTweened(r.values)
  const n = vals.length
  let d = `M${x0} ${base}`
  vals.forEach((v, i) => {
    d += `L${(x0 + (i / (n - 1)) * w).toFixed(1)} ${(base - v * 46 * p).toFixed(1)}`
  })
  d += `L${x0 + w} ${base}Z`
  return (
    <g style={hoverStyle(active, dim)}>
      <path
        d={d}
        fill={r.color}
        fillOpacity={active ? 0.6 : 0.3}
        stroke={r.color}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinejoin="round"
        style={{
          transition: "fill-opacity 200ms ease, stroke-width 200ms ease",
        }}
      />
      <text x={x0 - 8} y={base - 2} textAnchor="end" style={labelStyle}>
        {r.label}
      </text>
    </g>
  )
}

export function RidgelineChart({
  rows,
  width = 360,
  height = 240,
  replayKey,
  className,
}: Replay & { rows: Ridge[]; width?: number; height?: number }) {
  const x0 = 60
  const w = width - x0 - 20
  const t = useInteractive()
  const onMove = (e: RPointer<SVGSVGElement>) => {
    const [vx, vy] = toViewBox(e, width, height)
    if (vx < x0 || vx > x0 + w) return t.leave()
    const row = clamp(Math.round((vy - 60) / 40), 0, rows.length - 1)
    const vals = rows[row].values
    const idx = Math.round(((vx - x0) / w) * (vals.length - 1))
    if (Math.abs(vy - (60 + row * 40)) > 46) return t.leave()
    t.enter(row, {
      title: rows[row].label,
      value: `${Math.round(vals[idx] * 100)}`,
      color: rows[row].color,
    })
  }
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfica ridgeline"
        style={svgBase}
        onPointerMove={onMove}
        onPointerLeave={t.leave}
      >
        {rows.map((r, k) => (
          <RidgeRow
            key={r.label}
            base={60 + k * 40}
            x0={x0}
            w={w}
            r={r}
            delay={k * 120}
            replayKey={replayKey}
            active={t.act === k}
            dim={t.act !== null}
          />
        ))}
      </svg>
    </Box>
  )
}

/* 7. Rosa polar: escala fija para que los cambios de datos no provoquen saltos */

function Wedge({
  c,
  r0,
  R,
  a0,
  a1,
  color,
  delay,
  replayKey,
  active,
  dim,
  onEnter,
  onLeave,
}: {
  c: number
  r0: number
  R: number
  a0: number
  a1: number
  color: string
  delay: number
  replayKey: unknown
} & Hover) {
  const p = useProgress(900, delay, replayKey)
  return (
    <g
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        ...hoverStyle(active, dim),
        transform: active ? "scale(1.06)" : "scale(1)",
        transformOrigin: `${c}px ${c}px`,
      }}
    >
      <path d={sectorPath(c, r0, R, a0, a1)} fill="transparent" />
      <path
        d={sectorPath(c, r0, r0 + (R - r0) * p, a0, a1)}
        fill={color}
        fillOpacity={0.9}
      />
    </g>
  )
}

export function RoseChart({
  data,
  size = 360,
  max = 100,
  replayKey,
  className,
}: Replay & { data: Datum[]; size?: number; max?: number }) {
  const c = size / 2
  const Rmax = c - 84
  const r0 = 22
  const sl = TAU / data.length
  const tw = useTweened(data.map((d) => d.value))
  const radiusFor = (v: number) => r0 + (Rmax - r0) * Math.sqrt(clamp(v / max))
  const t = useInteractive()
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Rosa polar"
        style={svgBase}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <circle
            key={f}
            cx={c}
            cy={c}
            r={radiusFor(max * f)}
            fill="none"
            strokeDasharray="2 3"
            strokeWidth={0.5}
            style={{ stroke: "var(--uc-border-strong)" }}
          />
        ))}
        {data.map((d, i) => {
          const a0 = -Math.PI / 2 + i * sl + 0.03
          const mid = a0 + sl / 2 - 0.03
          const [lx, ly] = polar(Rmax + 14, mid, c, c)
          return (
            <g key={d.label}>
              <Wedge
                c={c}
                r0={r0}
                R={radiusFor(tw[i])}
                a0={a0}
                a1={a0 + sl - 0.06}
                color={d.color}
                delay={i * 90}
                replayKey={replayKey}
                active={t.act === i}
                dim={t.act !== null}
                onEnter={() =>
                  t.enter(i, {
                    title: d.label,
                    value: fmt(tw[i]),
                    color: d.color,
                  })
                }
                onLeave={t.leave}
              />
              <text
                x={lx}
                y={ly + 4}
                textAnchor={anchorFor(Math.cos(mid))}
                style={labelStyle}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

/* 8. Medidor redondeado */

export type Zone = { to: number; color: string; label: string }

export function GaugeChart({
  value,
  max = 100,
  zones,
  color = PALETTE.green,
  replayKey,
  className,
}: Replay & { value: number; max?: number; zones: Zone[]; color?: string }) {
  const p = useProgress(1400, 0, replayKey)
  const gv = useTweenValue(value)
  const t = useInteractive()
  const W = 260,
    H = 170,
    cx = 130,
    cy = 140,
    r = 108,
    sw = 16
  const pad = (sw / 2 + 3) / r
  const frac = clamp(gv / max)
  const onMove = (e: RPointer<SVGSVGElement>) => {
    const [vx, vy] = toViewBox(e, W, H)
    const dx = vx - cx,
      dy = vy - cy
    let th = Math.atan2(dy, dx)
    if (th < 0) th += TAU
    if (Math.abs(Math.hypot(dx, dy) - r) > 20 || th < Math.PI) return t.leave()
    const v = Math.round(clamp((th - Math.PI) / Math.PI) * max)
    const zi = Math.max(
      zones.findIndex((z) => v <= z.to),
      0
    )
    t.enter(zi, {
      title: zones[zi].label,
      value: `${v} de ${max}`,
      color: zones[zi].color,
    })
  }
  let prev = 0
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Medidor en ${Math.round(gv)} de ${max}`}
        style={svgBase}
        onPointerMove={onMove}
        onPointerLeave={t.leave}
      >
        {zones.map((z, i) => {
          const a0 = Math.PI + (prev / max) * Math.PI + pad
          const a1 = Math.PI + (z.to / max) * Math.PI - pad
          prev = z.to
          const active = t.act === i
          return (
            <path
              key={z.to}
              d={arcPath(cx, cy, r, a0, a1)}
              fill="none"
              stroke={z.color}
              strokeWidth={active ? sw + 4 : sw}
              strokeOpacity={active ? 0.7 : 0.28}
              strokeLinecap="round"
              style={{
                transition:
                  "stroke-width 200ms ease, stroke-opacity 200ms ease",
              }}
            />
          )
        })}
        <path
          d={arcPath(
            cx,
            cy,
            r,
            Math.PI,
            Math.PI + Math.max(frac * p * Math.PI, 0.001)
          )}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          style={{ ...titleStyle, fontSize: 36 }}
        >
          {Math.round(gv * p)}
        </text>
      </svg>
    </Box>
  )
}

/* 9. Mapa de calor */

export function HeatmapChart({
  rows,
  cols,
  values,
  color = PALETTE.blue,
  replayKey,
  className,
}: Replay & {
  rows: string[]
  cols: string[]
  values: number[][]
  color?: string
}) {
  const elapsed = useElapsed(replayKey, 900)
  const flat = useTweened(values.flat())
  const t = useInteractive()
  const cell = 26,
    gap = 4,
    lx = 56,
    ty = 22
  const W = lx + cols.length * (cell + gap)
  const H = ty + rows.length * (cell + gap)
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Mapa de calor"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {cols.map((c, j) => (
          <text
            key={c}
            x={lx + j * (cell + gap) + cell / 2}
            y={ty - 8}
            textAnchor="middle"
            style={labelStyle}
          >
            {c}
          </text>
        ))}
        {rows.map((r, i) => (
          <g key={r}>
            <text
              x={lx - 8}
              y={ty + i * (cell + gap) + cell / 2 + 4}
              textAnchor="end"
              style={labelStyle}
            >
              {r}
            </text>
            {cols.map((cl, j) => {
              const idx = i * cols.length + j
              const v = clamp(flat[idx] ?? 0)
              const active = t.act === idx
              const appear = clamp((elapsed - (i + j) * 35) / 300)
              return (
                <rect
                  key={cl}
                  x={lx + j * (cell + gap)}
                  y={ty + i * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={4}
                  fill={color}
                  fillOpacity={0.08 + 0.92 * v}
                  stroke={active ? "var(--uc-text)" : "none"}
                  strokeWidth={1.5}
                  onPointerEnter={() =>
                    t.enter(idx, {
                      title: `${r}, ${cl}`,
                      value: `${Math.round(v * 100)}%`,
                      color,
                    })
                  }
                  onPointerLeave={t.leave}
                  style={{
                    opacity: appear,
                    transform: active ? "scale(1.12)" : "scale(1)",
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transition: "transform 150ms ease",
                  }}
                />
              )
            })}
          </g>
        ))}
      </svg>
    </Box>
  )
}

/* 10. Dona segmentada redondeada, con separación reducida */

function Seg({
  c,
  r,
  sw,
  start,
  len,
  gap,
  color,
  delay,
  replayKey,
  active,
  dim,
  onEnter,
  onLeave,
}: {
  c: number
  r: number
  sw: number
  start: number
  len: number
  gap: number
  color: string
  delay: number
  replayKey: unknown
} & Hover) {
  const p = useProgress(1000, delay, replayKey)
  const C = TAU * r
  const dash = Math.max(len * p - gap - sw, 0)
  const inset = gap / 2 + sw / 2
  return (
    <circle
      cx={c}
      cy={c}
      r={r}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeDasharray={`${dash} ${C}`}
      strokeDashoffset={-(start + inset)}
      transform={`rotate(-90 ${c} ${c})`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        ...hoverStyle(active, dim),
        strokeWidth: active ? sw + 4 : sw,
        opacity: dash > 0 ? (dim && !active ? 0.4 : 1) : 0,
      }}
    />
  )
}

export function DonutChart({
  data,
  size = 220,
  thickness = 16,
  gap = 4,
  center,
  replayKey,
  className,
}: Replay & {
  data: Datum[]
  size?: number
  thickness?: number
  gap?: number
  center?: ReactNode
}) {
  const c = size / 2
  const r = c - thickness / 2 - 8
  const C = TAU * r
  const tw = useTweened(data.map((d) => d.value))
  const total = tw.reduce((s, v) => s + v, 0) || 1
  const targetTotal = data.reduce((s, d) => s + d.value, 0) || 1
  const t = useInteractive()
  let cum = 0
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Dona segmentada"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {data.map((d, i) => {
          const start = (cum / total) * C
          const len = (tw[i] / total) * C
          cum += tw[i]
          return (
            <Seg
              key={d.label}
              c={c}
              r={r}
              sw={thickness}
              start={start}
              len={len}
              gap={gap}
              color={d.color}
              delay={i * 120}
              replayKey={replayKey}
              active={t.act === i}
              dim={t.act !== null}
              onEnter={() =>
                t.enter(i, {
                  title: d.label,
                  value: `${Math.round((tw[i] / total) * 100)}%`,
                  color: d.color,
                })
              }
              onLeave={t.leave}
            />
          )
        })}
        <text x={c} y={c + 6} textAnchor="middle" style={titleStyle}>
          {center ?? Math.round(total)}
        </text>
      </svg>
      <Legend
        items={data.map((d) => ({
          label: d.label,
          color: d.color,
          value: `${Math.round((d.value / targetTotal) * 100)}%`,
        }))}
      />
    </Box>
  )
}

/* 11. Barras verticales apiladas con tapa. El tooltip muestra ambos valores. */

export type BarDatum = { label: string; value: number; extra?: number }

function BarCol({
  x,
  bw,
  bottom,
  plotH,
  maxV,
  value,
  extra,
  delay,
  replayKey,
  active,
  dim,
  baseColor,
  capColor,
  onEnter,
  onLeave,
}: {
  x: number
  bw: number
  bottom: number
  plotH: number
  maxV: number
  value: number
  extra: number
  delay: number
  replayKey: unknown
  baseColor: string
  capColor: string
  active: boolean
  dim: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const p = useProgress(900, delay, replayKey)
  const hBase = (value / maxV) * plotH * p
  const hCap = (extra / maxV) * plotH * p
  const gapPx = hCap > 0 ? 4 : 0
  const rx = Math.min(bw / 2, 10)
  return (
    <g
      style={hoverStyle(active, dim)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <rect
        x={x}
        y={bottom - plotH}
        width={bw}
        height={plotH}
        fill="transparent"
      />
      <rect
        x={x}
        y={bottom - hBase}
        width={bw}
        height={Math.max(hBase, 0)}
        rx={rx}
        fill={baseColor}
      />
      {hCap > 0 && (
        <rect
          x={x}
          y={bottom - hBase - gapPx - hCap}
          width={bw}
          height={hCap}
          rx={rx}
          fill={capColor}
        />
      )}
    </g>
  )
}

export function BarChart({
  data,
  unit = "",
  seriesLabels = ["Base", "Tapa"],
  baseColor = PALETTE.sky,
  capColor = PALETTE.mint,
  replayKey,
  className,
}: Replay & {
  data: BarDatum[]
  unit?: string
  seriesLabels?: [string, string]
  baseColor?: string
  capColor?: string
}) {
  const t = useInteractive()
  const W = 320,
    H = 220,
    top = 16,
    bottom = 186,
    plotH = bottom - top
  const flat = useTweened(data.flatMap((d) => [d.value, d.extra ?? 0]))
  const maxV =
    Math.max(
      1,
      ...data.map((_, i) => (flat[i * 2] ?? 0) + (flat[i * 2 + 1] ?? 0))
    ) * 1.08
  const colW = (W - 24) / data.length
  const bw = Math.min(colW * 0.5, 24)
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Gráfica de barras"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {data.map((d, i) => {
          const x0 = 12 + i * colW
          const v = flat[i * 2] ?? 0
          const e = flat[i * 2 + 1] ?? 0
          return (
            <g key={d.label}>
              <BarCol
                x={x0 + (colW - bw) / 2}
                bw={bw}
                bottom={bottom}
                plotH={plotH}
                maxV={maxV}
                value={v}
                extra={e}
                delay={i * 70}
                replayKey={replayKey}
                baseColor={baseColor}
                capColor={capColor}
                active={t.act === i}
                dim={t.act !== null}
                onEnter={() =>
                  t.enter(i, {
                    title: d.label,
                    rows: [
                      {
                        label: seriesLabels[0],
                        value: `${fmt(v)}${unit}`,
                        color: baseColor,
                      },
                      ...(e > 0
                        ? [
                            {
                              label: seriesLabels[1],
                              value: `${fmt(e)}${unit}`,
                              color: capColor,
                            },
                          ]
                        : []),
                    ],
                  })
                }
                onLeave={t.leave}
              />
              <text
                x={x0 + colW / 2}
                y={206}
                textAnchor="middle"
                style={labelStyle}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

/* 12. Barra de progreso segmentada con filas */

export type ProgressItem = { label: string; value: number; color: string }

function ProgressRow({
  label,
  color,
  value,
  max,
  W,
  y,
  unit,
  delay,
  replayKey,
  active,
  dim,
  onEnter,
  onLeave,
}: {
  label: string
  color: string
  value: number
  max: number
  W: number
  y: number
  unit: string
  delay: number
  replayKey: unknown
  active: boolean
  dim: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const p = useProgress(900, delay, replayKey)
  return (
    <g
      style={hoverStyle(active, dim)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <rect x={0} y={y - 14} width={W} height={34} fill="transparent" />
      <text x={0} y={y} style={{ fill: "var(--uc-text)", fontSize: 13 }}>
        {label}
      </text>
      <text
        x={W}
        y={y}
        textAnchor="end"
        style={{ fill: "var(--uc-text-2)", fontSize: 13 }}
      >
        {fmt(value)}
        {unit}
      </text>
      <rect
        x={0}
        y={y + 8}
        width={W}
        height={8}
        rx={4}
        fill="var(--uc-border-strong)"
        fillOpacity={0.25}
      />
      <rect
        x={0}
        y={y + 8}
        width={Math.max((value / max) * W * p, 0)}
        height={8}
        rx={4}
        fill={color}
      />
    </g>
  )
}

export function ProgressChart({
  items,
  unit = "",
  replayKey,
  className,
}: Replay & { items: ProgressItem[]; unit?: string }) {
  const t = useInteractive()
  const W = 320
  const tw = useTweened(items.map((i) => i.value))
  const total = tw.reduce((s, v) => s + v, 0) || 1
  const maxTw = Math.max(1, ...tw)
  const bar = useProgress(1000, 0, replayKey)
  const rowsY0 = 52
  const H = rowsY0 + items.length * 40
  let cum = 0
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Progreso por categoría"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {items.map((it, i) => {
          const x = (cum / total) * W * bar
          const w = (tw[i] / total) * W * bar
          cum += tw[i]
          const active = t.act === i
          const gapX = 3
          return (
            <rect
              key={it.label}
              x={x + (i === 0 ? 0 : gapX / 2)}
              y={active ? 4 : 8}
              width={Math.max(w - gapX, 0)}
              height={active ? 18 : 14}
              rx={7}
              fill={it.color}
              onPointerEnter={() =>
                t.enter(i, {
                  title: it.label,
                  value: `${fmt(tw[i])}${unit}`,
                  color: it.color,
                })
              }
              onPointerLeave={t.leave}
              style={{ transition: "y 200ms ease, height 200ms ease" }}
            />
          )
        })}
        {items.map((it, i) => (
          <ProgressRow
            key={it.label}
            label={it.label}
            color={it.color}
            value={tw[i]}
            max={maxTw}
            W={W}
            y={rowsY0 + i * 40}
            unit={unit}
            delay={180 + i * 120}
            replayKey={replayKey}
            active={t.act === 100 + i}
            dim={t.act !== null && t.act !== 100 + i}
            onEnter={() =>
              t.enter(100 + i, {
                title: it.label,
                value: `${fmt(tw[i])}${unit}`,
                color: it.color,
              })
            }
            onLeave={t.leave}
          />
        ))}
      </svg>
    </Box>
  )
}

/* Barras horizontales y múltiples */

function BarHorizontalChart({
  data,
  unit = "",
  seriesLabels = ["Base", "Tapa"],
  baseColor = PALETTE.sky,
  capColor = PALETTE.mint,
  replayKey,
  className,
}: Replay & {
  data: BarDatum[]
  unit?: string
  seriesLabels?: [string, string]
  baseColor?: string
  capColor?: string
}) {
  const t = useInteractive()
  const W = 320,
    rowH = 36,
    labelW = 74,
    x0 = labelW + 8,
    x1 = W - 6,
    bh = 16
  const H = data.length * rowH + 4
  const flat = useTweened(data.flatMap((d) => [d.value, d.extra ?? 0]))
  const sums = data.map((_, i) => (flat[i * 2] ?? 0) + (flat[i * 2 + 1] ?? 0))
  const maxV = Math.max(1, ...sums) * 1.08
  const scale = (x1 - x0) / maxV
  const p = useProgress(900, 0, replayKey)
  const dim = t.act !== null
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Barras horizontales"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {data.map((d, i) => {
          const y = i * rowH
          const v = flat[i * 2] ?? 0
          const e = flat[i * 2 + 1] ?? 0
          const wB = Math.max(v * scale * p, 0)
          const wC = Math.max(e * scale * p, 0)
          const cy = y + (rowH - bh) / 2
          const rows: TipRow[] = [
            {
              label: seriesLabels[0],
              value: `${fmt(v)}${unit}`,
              color: baseColor,
            },
          ]
          if (d.extra !== undefined)
            rows.push({
              label: seriesLabels[1],
              value: `${fmt(e)}${unit}`,
              color: capColor,
            })
          return (
            <g
              key={d.label}
              style={hoverStyle(t.act === i, dim)}
              onPointerEnter={() => t.enter(i, { title: d.label, rows })}
              onPointerLeave={t.leave}
            >
              <rect x={0} y={y} width={W} height={rowH} fill="transparent" />
              <text
                x={labelW}
                y={y + rowH / 2 + 4}
                textAnchor="end"
                style={labelStyle}
              >
                {d.label}
              </text>
              <rect
                x={x0}
                y={cy}
                width={wB}
                height={bh}
                rx={7}
                fill={baseColor}
              />
              {d.extra !== undefined && (
                <rect
                  x={x0 + wB + 3}
                  y={cy}
                  width={wC}
                  height={bh}
                  rx={7}
                  fill={capColor}
                />
              )}
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

function BarGroupedChart({
  data,
  unit = "",
  seriesLabels = ["Base", "Tapa"],
  baseColor = PALETTE.sky,
  capColor = PALETTE.mint,
  replayKey,
  className,
}: Replay & {
  data: BarDatum[]
  unit?: string
  seriesLabels?: [string, string]
  baseColor?: string
  capColor?: string
}) {
  const t = useInteractive()
  const W = 320,
    H = 220,
    top = 16,
    bottom = 186,
    plotH = bottom - top
  const hasTwo = data.some((d) => d.extra !== undefined)
  const flat = useTweened(data.flatMap((d) => [d.value, d.extra ?? 0]))
  const maxV = Math.max(1, ...flat) * 1.08
  const p = useProgress(900, 0, replayKey)
  const colW = (W - 24) / data.length
  const groupW = colW * 0.72
  const nBars = hasTwo ? 2 : 1
  const bw = Math.min((groupW - (nBars - 1) * 3) / nBars, 22)
  const dim = t.act !== null
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Barras múltiples"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {data.map((d, i) => {
          const colX = 12 + i * colW
          const gx = colX + colW / 2 - (bw * nBars + (nBars - 1) * 3) / 2
          const v = flat[i * 2] ?? 0
          const e = flat[i * 2 + 1] ?? 0
          const hV = Math.max((v / maxV) * plotH * p, 0)
          const hE = Math.max((e / maxV) * plotH * p, 0)
          const rows: TipRow[] = [
            {
              label: seriesLabels[0],
              value: `${fmt(v)}${unit}`,
              color: baseColor,
            },
          ]
          if (hasTwo)
            rows.push({
              label: seriesLabels[1],
              value: `${fmt(e)}${unit}`,
              color: capColor,
            })
          const rx = Math.min(bw / 2, 8)
          return (
            <g
              key={d.label}
              style={hoverStyle(t.act === i, dim)}
              onPointerEnter={() => t.enter(i, { title: d.label, rows })}
              onPointerLeave={t.leave}
            >
              <rect
                x={colX}
                y={top}
                width={colW}
                height={plotH}
                fill="transparent"
              />
              <rect
                x={gx}
                y={bottom - hV}
                width={bw}
                height={hV}
                rx={rx}
                fill={baseColor}
              />
              {hasTwo && (
                <rect
                  x={gx + bw + 3}
                  y={bottom - hE}
                  width={bw}
                  height={hE}
                  rx={rx}
                  fill={capColor}
                />
              )}
              <text
                x={colX + colW / 2}
                y={206}
                textAnchor="middle"
                style={labelStyle}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </Box>
  )
}

/* Cuadrícula radial: un anillo de progreso por categoría */

export type GridItem = {
  label: string
  value: number
  max: number
  color: string
}

function RadialGridCell({
  cx,
  cy,
  r,
  sw,
  x,
  y,
  w,
  h,
  item,
  value,
  delay,
  replayKey,
  active,
  dim,
  onEnter,
  onLeave,
}: {
  cx: number
  cy: number
  r: number
  sw: number
  x: number
  y: number
  w: number
  h: number
  item: GridItem
  value: number
  delay: number
  replayKey: unknown
} & Hover) {
  const p = useProgress(1000, delay, replayKey)
  const frac = clamp(value / item.max) * p
  const end = -Math.PI / 2 + Math.min(frac, 0.999) * TAU
  return (
    <g
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={hoverStyle(active, dim)}
    >
      <rect x={x} y={y} width={w} height={h} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth={sw}
        strokeOpacity={0.2}
        style={{ stroke: "var(--uc-border-strong)" }}
      />
      {frac > 0.001 && (
        <path
          d={arcPath(cx, cy, r, -Math.PI / 2, end)}
          fill="none"
          stroke={item.color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        style={{ fill: "var(--uc-text)", fontSize: 18, fontWeight: 500 }}
      >
        {Math.round(value * p)}
      </text>
      <text x={cx} y={cy + 74} textAnchor="middle" style={labelStyle}>
        {item.label}
      </text>
    </g>
  )
}

function RadialGridChart({
  items,
  cols = 3,
  replayKey,
  className,
}: Replay & { items: GridItem[]; cols?: number }) {
  const t = useInteractive()
  const tw = useTweened(items.map((it) => it.value))
  const cell = 120,
    cellH = 150,
    r = 46,
    sw = 12
  const rows = Math.ceil(items.length / cols)
  const W = cols * cell,
    H = rows * cellH
  const dim = t.act !== null
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Cuadrícula radial"
        style={svgBase}
        onPointerLeave={t.leave}
      >
        {items.map((it, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = col * cell
          const y = row * cellH
          return (
            <RadialGridCell
              key={it.label}
              cx={x + cell / 2}
              cy={y + 56}
              r={r}
              sw={sw}
              x={x}
              y={y}
              w={cell}
              h={cellH}
              item={it}
              value={tw[i]}
              delay={i * 90}
              replayKey={replayKey}
              active={t.act === i}
              dim={dim}
              onEnter={() =>
                t.enter(i, {
                  title: it.label,
                  value: `${fmt(tw[i])} de ${it.max}`,
                  color: it.color,
                })
              }
              onLeave={t.leave}
            />
          )
        })}
      </svg>
    </Box>
  )
}

/* Áreas y líneas: series con trazo suave. La escala sale de los valores interpolados. */

export type Serie = { label: string; color: string; values: number[] }
type AreaProps = Replay & {
  labels: string[]
  series: Serie[]
  stacked?: boolean
  unit?: string
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return ""
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    d += `Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`
  }
  const last = pts[pts.length - 1]
  return `${d}L${last[0]} ${last[1]}`
}

function AreaLineChart({
  labels,
  series,
  stacked = false,
  unit = "",
  kind,
  replayKey,
  className,
}: AreaProps & { kind: "area" | "line" }) {
  const t = useInteractive()
  const W = 320,
    H = 210,
    x0 = 14,
    x1 = W - 14,
    top = 14,
    bottom = 180
  const n = labels.length
  const flat = useTweened(series.flatMap((s) => s.values))
  const tw = series.map((_, si) => flat.slice(si * n, si * n + n))
  const bases = series.map((_, si) =>
    tw[si].map((_, i) =>
      stacked ? tw.slice(0, si).reduce((s, arr) => s + (arr[i] ?? 0), 0) : 0
    )
  )
  const tops = series.map((_, si) => tw[si].map((v, i) => bases[si][i] + v))
  const maxV = Math.max(1, ...tops.flat()) * 1.1
  const xAt = (i: number) =>
    n > 1 ? x0 + (i / (n - 1)) * (x1 - x0) : (x0 + x1) / 2
  const yAt = (v: number) => bottom - (v / maxV) * (bottom - top)
  const p = useProgress(1100, 0, replayKey)
  const clipId = useId().replace(/:/g, "")
  const colW = n > 1 ? (x1 - x0) / (n - 1) : x1 - x0
  const hit = t.act
  return (
    <Box t={t} className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={kind === "area" ? "Gráfica de área" : "Gráfica de líneas"}
        style={svgBase}
        onPointerLeave={t.leave}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={W * p} height={H} />
          </clipPath>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={x0}
            x2={x1}
            y1={yAt((maxV / 1.1) * f)}
            y2={yAt((maxV / 1.1) * f)}
            style={{ stroke: "var(--uc-border)" }}
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          {series.map((s, si) => {
            const topPts = labels.map(
              (_, i) => [xAt(i), yAt(tops[si][i])] as [number, number]
            )
            const botPts = labels
              .map((_, i) => [xAt(i), yAt(bases[si][i])] as [number, number])
              .reverse()
            const line = smoothPath(topPts)
            return (
              <g key={s.label}>
                {kind === "area" && (
                  <path
                    d={`${line}${botPts.map((q) => `L${q[0]} ${q[1]}`).join("")}Z`}
                    fill={s.color}
                    fillOpacity={0.28}
                  />
                )}
                <path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {kind === "line" &&
                  topPts.map((q, i) => (
                    <circle
                      key={i}
                      cx={q[0]}
                      cy={q[1]}
                      r={hit === i ? 5.5 : 3.5}
                      fill={s.color}
                      stroke="var(--uc-card)"
                      strokeWidth={1.5}
                      style={{ transition: "r 150ms ease" }}
                    />
                  ))}
              </g>
            )
          })}
        </g>
        {hit !== null && hit < n && (
          <line
            x1={xAt(hit)}
            x2={xAt(hit)}
            y1={top}
            y2={bottom}
            strokeDasharray="3 3"
            style={{ stroke: "var(--uc-border-strong)" }}
          />
        )}
        {labels.map((l, i) => (
          <g key={`${l}-${i}`}>
            <rect
              x={xAt(i) - colW / 2}
              y={0}
              width={colW}
              height={H}
              fill="transparent"
              onPointerEnter={() =>
                t.enter(i, {
                  title: l,
                  rows: series.map((s, si) => ({
                    label: s.label,
                    value: `${fmt(tw[si][i])}${unit}`,
                    color: s.color,
                  })),
                })
              }
              onPointerLeave={t.leave}
            />
            <text x={xAt(i)} y={H - 6} textAnchor="middle" style={labelStyle}>
              {l}
            </text>
          </g>
        ))}
      </svg>
    </Box>
  )
}

export function AreaChart(props: AreaProps) {
  return <AreaLineChart {...props} kind="area" />
}

export function LineChart(props: AreaProps) {
  return <AreaLineChart {...props} kind="line" />
}

/* Íconos, navegación y tarjeta */

function GroupIcon({ id }: { id: string }) {
  const shapes: Record<string, ReactNode> = {
    area: (
      <path
        d="M3 17L8 11L13 14L21 6V20H3Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
    ),
    line: <path d="M3 17L8 11L13 14L21 6" />,
    bar: <path d="M5 20V12M10 20V6M15 20V10M20 20V14" />,
    donut: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3A9 9 0 0 1 20.5 15" />
      </>
    ),
    polar: (
      <path d="M12 12L12 3A9 9 0 0 1 20 8ZM12 12L20 8A9 9 0 0 1 16 19.5ZM12 12L16 19.5A9 9 0 0 1 3.5 13Z" />
    ),
    radar: (
      <>
        <polygon points="12,3 20,9 17,19 7,19 4,9" />
        <polygon points="12,7 16,10 14.5,15 9.5,15 8,10" />
      </>
    ),
    radial: (
      <>
        <path d="M4 16A8 8 0 0 1 20 16" />
        <path d="M8 16A4 4 0 0 1 16 16" />
      </>
    ),
    progress: <path d="M3 12H21M3 12H14" />,
    heatmap: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    ridge: <path d="M3 18C7 8 10 16 14 10S19 14 21 12" />,
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[id]}
    </svg>
  )
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function ReplayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  )
}

const snippet = (component: string, props: Record<string, any>) => {
  const attrs = Object.entries(props)
    .map(([k, val]) =>
      typeof val === "string"
        ? `  ${k}="${val}"`
        : `  ${k}={${JSON.stringify(val)}}`
    )
    .join("\n")
  return `import { ${component} } from "@/components/charts";\n\n<${component}${attrs ? "\n" + attrs + "\n" : " "}/>`
}

type Variant = {
  title: string
  component: string
  props: (v: number) => Record<string, any>
  view: (p: Record<string, any>, k: number) => ReactNode
}
type Group = {
  id: string
  title: string
  description: string
  variants: Variant[]
}

// eslint-disable-next-line react/display-name
const viewOf = (C: any) => (p: Record<string, any>, k: number) => (
  <C {...p} replayKey={k} />
)

function ChartCard({ variant }: { variant: Variant }) {
  const [k, setK] = useState(0)
  const [v, setV] = useState(0)
  const [showCode, setShowCode] = useState(false)
  const p = variant.props(v)
  return (
    <section className="uc-card">
      <header className="uc-cardhead">
        <h3 className="uc-title">{variant.title}</h3>
        <button
          type="button"
          className="uc-btn uc-toggle"
          aria-pressed={showCode}
          onClick={() => setShowCode((s) => !s)}
        >
          {showCode ? "Ocultar código" : "Código"}
        </button>
      </header>
      <div className="uc-body">
        {variant.view(p, k)}
        {showCode && (
          <pre className="uc-code">{snippet(variant.component, p)}</pre>
        )}
      </div>
      <footer className="uc-foot">
        <button
          type="button"
          className="uc-btn"
          onClick={() => setK((x) => x + 1)}
          aria-label={`Repetir ${variant.title}`}
        >
          <ReplayIcon />
          Repetir
        </button>
        <button
          type="button"
          className="uc-btn"
          onClick={() => setV((x) => x + 1)}
          aria-label={`Cambiar datos de ${variant.title}`}
        >
          <ShuffleIcon />
          Cambiar datos
        </button>
      </footer>
    </section>
  )
}

/* Datos de ejemplo. Cada variante genera sus props a partir de v (0 = datos base). */

const rnd = (s: number) => {
  const x = Math.sin(s) * 43758.5453
  return x - Math.floor(x)
}
const vary = (base: number, seed: number, v: number) =>
  v === 0 ? base : Math.round(20 + rnd(v * 12.9898 + seed * 78.233) * 75)
const scaleVary = (base: number, seed: number, v: number) =>
  v === 0 ? base : base * (0.6 + rnd(v * 12.9898 + seed * 78.233) * 0.8)
const jit = (base: number, seed: number, v: number) =>
  Math.max(1, Math.round(scaleVary(base, seed, v)))
const jitArr = (base: number[], seed: number, v: number) =>
  base.map((b, i) => jit(b, seed + i, v))
const withVal = (items: Datum[], v: number): Datum[] =>
  items.map((d, i) => ({ ...d, value: jit(d.value, i, v) }))
const dec = (n: number) => +n.toFixed(2)
const wafFill = (v: number) =>
  v === 0 ? 14 : Math.round(3 + rnd(v * 12.9898 + 3) * 21)

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
const BAR_VALUE = [420, 210, 540, 330, 250, 600, 360]
const BAR_EXTRA = [140, 100, 190, 110, 130, 200, 120]
const MONTH_VALUE = [320, 280, 410, 360, 450, 390]
const EMO8: Datum[] = [
  { label: "Happiness", value: 12, color: PALETTE.orange },
  { label: "Awe", value: 10, color: PALETTE.red },
  { label: "Admiration", value: 5, color: PALETTE.violet },
  { label: "Surprise", value: 12, color: PALETTE.blue },
  { label: "Sadness", value: 6, color: PALETTE.aqua },
  { label: "Fear", value: 4, color: PALETTE.yellow },
  { label: "Anger", value: 2, color: PALETTE.magenta },
  { label: "Anticipation", value: 5, color: PALETTE.green },
]
const EMO6: Datum[] = [
  { label: "Alegría", value: 10, color: PALETTE.orange },
  { label: "Confianza", value: 8, color: PALETTE.aqua },
  { label: "Miedo", value: 4, color: PALETTE.violet },
  { label: "Sorpresa", value: 9, color: PALETTE.blue },
  { label: "Tristeza", value: 6, color: PALETTE.yellow },
  { label: "Enojo", value: 3, color: PALETTE.red },
]
const DONUT: Datum[] = [
  { label: "Trabajo", value: 45, color: PALETTE.blue },
  { label: "Ocio", value: 25, color: PALETTE.aqua },
  { label: "Sueño", value: 20, color: PALETTE.violet },
  { label: "Otros", value: 10, color: PALETTE.yellow },
]
const PROG4: ProgressItem[] = [
  { label: "Video", value: 2.4, color: PALETTE.red },
  { label: "Redes sociales", value: 1.2, color: PALETTE.violet },
  { label: "Audio", value: 0.8, color: PALETTE.aqua },
  { label: "Mensajería", value: 0.6, color: PALETTE.blue },
]
const PROG3: ProgressItem[] = [
  { label: "Ventas", value: 3.2, color: PALETTE.blue },
  { label: "Soporte", value: 1.6, color: PALETTE.aqua },
  { label: "Otros", value: 0.9, color: PALETTE.yellow },
]
const ZONES3: Zone[] = [
  { to: 40, color: PALETTE.red, label: "Zona baja" },
  { to: 70, color: PALETTE.yellow, label: "Zona media" },
  { to: 100, color: PALETTE.aqua, label: "Zona alta" },
]
const RAD_BASE = [
  { label: "Supermarket", segs: [120, 70, 30] },
  { label: "Combini", segs: [160, 110, 60] },
  { label: "Online", segs: [200, 150, 90] },
  { label: "Marché", segs: [60, 130, 40] },
]
const RAD_COLORS = ["#e9c2a2", "#f0735a", "#f2e05a"]
const RAD_LEGEND = [
  { label: "Vegetables", color: RAD_COLORS[0] },
  { label: "Fruits", color: RAD_COLORS[1] },
  { label: "Meat", color: RAD_COLORS[2] },
]
const radialCats = (v: number) =>
  RAD_BASE.map((c, i) => ({
    label: c.label,
    segments: c.segs.map((s, j) => ({
      label: RAD_LEGEND[j].label,
      value: jit(s, i * 3 + j, v),
      color: RAD_COLORS[j],
    })),
  }))
const radialSimple = (v: number) =>
  [
    { label: "Supermarket", value: 120 },
    { label: "Combini", value: 160 },
    { label: "Online", value: 200 },
  ].map((c, i) => ({
    label: c.label,
    segments: [
      { label: "Ventas", value: jit(c.value, 40 + i, v), color: PALETTE.aqua },
    ],
  }))
const COLS12 = Array.from({ length: 12 }, (_, i) => `${i + 1}`)
const ROWS7 = ["L", "M", "X", "J", "V", "S", "D"]
const heat7 = (v: number) =>
  ROWS7.map((_, r) =>
    COLS12.map((_, c) => dec(Math.abs(Math.sin(r * 7 + c * 3 + v * 1.7))))
  )
const ROWS4 = ["A", "B", "C", "D"]
const COLS6 = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const heat4 = (v: number) =>
  ROWS4.map((_, r) =>
    COLS6.map((_, c) => dec(Math.abs(Math.cos(r * 5 + c * 2 + v * 1.3))))
  )
const RIDGE_COLORS = [
  PALETTE.blue,
  PALETTE.aqua,
  PALETTE.yellow,
  PALETTE.orange,
  PALETTE.violet,
]
const ridgeRows = (v: number, labels: string[]) =>
  labels.map((label, i) => ({
    label,
    color: RIDGE_COLORS[i % RIDGE_COLORS.length],
    values: ridgeValues(i + v * 0.5, 41, 0.3).map(dec),
  }))

const HOURS12 = [
  "0h",
  "2h",
  "4h",
  "6h",
  "8h",
  "10h",
  "12h",
  "14h",
  "16h",
  "18h",
  "20h",
  "22h",
]
const SEMANAS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"]
const ANIOS = ["2024", "2025", "2026"]
const MESES12 = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]
const genMat = (rows: string[], cols: string[], v: number, seed: number) =>
  rows.map((_, r) =>
    cols.map((_, c) => dec(Math.abs(Math.sin(r * 7 + c * 3 + seed + v * 1.7))))
  )
const CATS = ["Video", "Redes", "Audio", "Mensajería", "Juegos"]
const CAT_VALUE = [240, 120, 80, 60, 150]
const CAT_EXTRA = [60, 40, 30, 20, 50]
const GRID_BASE = [
  { label: "Supermarket", base: 120, color: PALETTE.orange },
  { label: "Combini", base: 160, color: PALETTE.aqua },
  { label: "Online", base: 200, color: PALETTE.violet },
  { label: "Marché", base: 90, color: PALETTE.blue },
  { label: "Tienda", base: 140, color: PALETTE.red },
  { label: "Mayoreo", base: 170, color: PALETTE.yellow },
]

const PAL8 = [
  PALETTE.orange,
  PALETTE.red,
  PALETTE.violet,
  PALETTE.blue,
  PALETTE.aqua,
  PALETTE.yellow,
  PALETTE.magenta,
  PALETTE.green,
]
const DAY_HOURS = [6, 9, 12, 16, 22, 30, 24, 18, 14, 10, 8, 5]
const CHANNEL_MONTHS = [
  { label: "Web", base: [120, 130, 150, 140, 165, 180] },
  { label: "App", base: [80, 95, 100, 120, 130, 150] },
  { label: "Tienda", base: [40, 45, 52, 60, 58, 70] },
]
const WEEK_NOW = [40, 55, 48, 70, 62, 80, 66]
const WEEK_PREV = [35, 50, 52, 58, 60, 66, 58]
const YEARS3_MONTHS = [
  {
    label: "2024",
    base: [150, 160, 170, 165, 180, 190, 200, 210, 205, 220, 240, 260],
    color: PALETTE.gray,
  },
  {
    label: "2025",
    base: [170, 175, 190, 200, 210, 220, 230, 240, 250, 255, 270, 290],
    color: PALETTE.blue,
  },
  {
    label: "2026",
    base: [200, 210, 225, 240, 250, 265, 280, 290, 300, 310, 325, 340],
    color: PALETTE.aqua,
  },
]
const CHANNELS5 = [
  { label: "Web", value: 120, color: PALETTE.blue },
  { label: "App", value: 90, color: PALETTE.aqua },
  { label: "Tienda", value: 60, color: PALETTE.orange },
  { label: "Redes", value: 40, color: PALETTE.violet },
  { label: "Email", value: 25, color: PALETTE.yellow },
]
const DAY_SECTORS = [5, 8, 6, 9, 11, 4, 7]
const MONTH_SECTORS = [4, 6, 8, 10, 12, 9, 7, 5, 8, 11, 6, 4]
const SKILLS4 = ["Diseño", "Código", "Datos", "Comunicación"]
const TEAM5 = ["Ventas", "Soporte", "Producto", "Marketing", "Ops"]
const GOALS5 = [
  { label: "Ventas", value: 72, color: PALETTE.blue },
  { label: "Retención", value: 55, color: PALETTE.aqua },
  { label: "Leads", value: 88, color: PALETTE.violet },
  { label: "Contenido", value: 40, color: PALETTE.orange },
  { label: "NPS", value: 64, color: PALETTE.yellow },
]

const MONTHS12_DATA = (v: number): Datum[] =>
  MESES12.map((label, i) => ({
    label,
    value: jit(MONTH_SECTORS[i], i, v),
    color: PAL8[i % PAL8.length],
  }))

const GROUPS: Group[] = [
  {
    id: "area",
    title: "Área",
    description: "Series con relleno bajo la curva, simples o apiladas.",
    variants: [
      {
        title: "Área simple",
        component: "AreaChart",
        view: viewOf(AreaChart),
        props: (v) => ({
          labels: DAYS,
          series: [
            {
              label: "Pasos",
              color: PALETTE.aqua,
              values: jitArr([40, 55, 48, 70, 62, 80, 66], 0, v),
            },
          ],
        }),
      },
      {
        title: "Áreas apiladas",
        component: "AreaChart",
        view: viewOf(AreaChart),
        props: (v) => ({
          labels: DAYS,
          stacked: true,
          series: [
            {
              label: "Audio",
              color: PALETTE.violet,
              values: jitArr([20, 25, 18, 30, 28, 35, 22], 10, v),
            },
            {
              label: "Video",
              color: PALETTE.blue,
              values: jitArr([30, 28, 40, 35, 42, 50, 38], 20, v),
            },
            {
              label: "Lectura",
              color: PALETTE.aqua,
              values: jitArr([12, 15, 10, 18, 14, 20, 16], 30, v),
            },
          ],
        }),
      },
      {
        title: "Área mensual",
        component: "AreaChart",
        view: viewOf(AreaChart),
        props: (v) => ({
          labels: MONTHS,
          series: [
            {
              label: "Ingresos",
              color: PALETTE.violet,
              values: jitArr(MONTH_VALUE, 40, v),
            },
          ],
        }),
      },
      {
        title: "Área diaria (12 h)",
        component: "AreaChart",
        view: viewOf(AreaChart),
        props: (v) => ({
          labels: HOURS12,
          series: [
            {
              label: "Sesiones",
              color: PALETTE.orange,
              values: jitArr(DAY_HOURS, 50, v),
            },
          ],
        }),
      },
      {
        title: "Área por canal (apilada)",
        component: "AreaChart",
        view: viewOf(AreaChart),
        props: (v) => ({
          labels: MONTHS,
          stacked: true,
          series: CHANNEL_MONTHS.map((c, i) => ({
            label: c.label,
            color: PAL8[i],
            values: jitArr(c.base, 60 + i * 7, v),
          })),
        }),
      },
    ],
  },
  {
    id: "line",
    title: "Línea",
    description:
      "Trazos suaves con puntos y lectura de todas las series al pasar el cursor.",
    variants: [
      {
        title: "Línea simple",
        component: "LineChart",
        view: viewOf(LineChart),
        props: (v) => ({
          labels: MONTHS,
          series: [
            {
              label: "Ventas",
              color: PALETTE.blue,
              values: jitArr(MONTH_VALUE, 0, v),
            },
          ],
        }),
      },
      {
        title: "Varias líneas",
        component: "LineChart",
        view: viewOf(LineChart),
        props: (v) => ({
          labels: MONTHS,
          series: [
            {
              label: "Online",
              color: PALETTE.orange,
              values: jitArr([210, 240, 300, 280, 330, 360], 5, v),
            },
            {
              label: "Tienda",
              color: PALETTE.aqua,
              values: jitArr([150, 160, 170, 190, 180, 210], 15, v),
            },
            {
              label: "App",
              color: PALETTE.violet,
              values: jitArr([90, 120, 160, 150, 200, 240], 25, v),
            },
          ],
        }),
      },
      {
        title: "Semana vs semana anterior",
        component: "LineChart",
        view: viewOf(LineChart),
        props: (v) => ({
          labels: DAYS,
          series: [
            {
              label: "Esta semana",
              color: PALETTE.aqua,
              values: jitArr(WEEK_NOW, 70, v),
            },
            {
              label: "Semana anterior",
              color: PALETTE.gray,
              values: jitArr(WEEK_PREV, 80, v),
            },
          ],
        }),
      },
      {
        title: "Tendencia anual (3 años)",
        component: "LineChart",
        view: viewOf(LineChart),
        props: (v) => ({
          labels: MESES12,
          series: YEARS3_MONTHS.map((y, i) => ({
            label: y.label,
            color: y.color,
            values: jitArr(y.base, 90 + i * 11, v),
          })),
        }),
      },
    ],
  },
  {
    id: "bar",
    title: "Barras",
    description:
      "Verticales u horizontales, simples, apiladas con tapa o múltiples lado a lado.",
    variants: [
      {
        title: "Apiladas con tapa",
        component: "BarChart",
        view: viewOf(BarChart),
        props: (v) => ({
          unit: "h",
          seriesLabels: ["Running", "Swimming"],
          data: DAYS.map((label, i) => ({
            label,
            value: jit(BAR_VALUE[i], i, v),
            extra: jit(BAR_EXTRA[i], i + 9, v),
          })),
        }),
      },
      {
        title: "Múltiples",
        component: "BarGroupedChart",
        view: viewOf(BarGroupedChart),
        props: (v) => ({
          unit: "h",
          seriesLabels: ["Running", "Swimming"],
          data: DAYS.map((label, i) => ({
            label,
            value: jit(BAR_VALUE[i], i, v),
            extra: jit(BAR_EXTRA[i], i + 9, v),
          })),
        }),
      },
      {
        title: "Múltiples simples",
        component: "BarGroupedChart",
        view: viewOf(BarGroupedChart),
        props: (v) => ({
          seriesLabels: ["Ventas", "Extra"],
          baseColor: PALETTE.sky,
          data: MONTHS.map((label, i) => ({
            label,
            value: jit(MONTH_VALUE[i], i, v),
          })),
        }),
      },
      {
        title: "Horizontales",
        component: "BarHorizontalChart",
        view: viewOf(BarHorizontalChart),
        props: (v) => ({
          unit: "h",
          baseColor: PALETTE.blue,
          data: CATS.map((label, i) => ({
            label,
            value: jit(CAT_VALUE[i], i, v),
          })),
        }),
      },
      {
        title: "Horizontales apiladas",
        component: "BarHorizontalChart",
        view: viewOf(BarHorizontalChart),
        props: (v) => ({
          unit: "h",
          seriesLabels: ["Running", "Swimming"],
          data: CATS.map((label, i) => ({
            label,
            value: jit(CAT_VALUE[i], i, v),
            extra: jit(CAT_EXTRA[i], i + 9, v),
          })),
        }),
      },
      {
        title: "Simples",
        component: "BarChart",
        view: viewOf(BarChart),
        props: (v) => ({
          seriesLabels: ["Ventas", "Extra"],
          baseColor: PALETTE.sky,
          data: MONTHS.map((label, i) => ({
            label,
            value: jit(MONTH_VALUE[i], i, v),
          })),
        }),
      },
    ],
  },
  {
    id: "donut",
    title: "Dona",
    description: "Anillos segmentados con extremos redondeados.",
    variants: [
      {
        title: "Dona segmentada",
        component: "DonutChart",
        view: viewOf(DonutChart),
        props: (v) => ({ data: withVal(DONUT, v) }),
      },
      {
        title: "Dona gruesa",
        component: "DonutChart",
        view: viewOf(DonutChart),
        props: (v) => ({
          data: withVal(DONUT.slice(0, 3), v),
          thickness: 26,
          gap: 6,
        }),
      },
      {
        title: "Progreso de meta",
        component: "DonutChart",
        view: viewOf(DonutChart),
        props: (v) => {
          const done = Math.min(95, Math.max(5, jit(68, 0, v)))
          return {
            data: [
              { label: "Completado", value: done, color: PALETTE.aqua },
              { label: "Pendiente", value: 100 - done, color: PALETTE.gray },
            ],
            center: `${done}%`,
          }
        },
      },
      {
        title: "Canales de venta",
        component: "DonutChart",
        view: viewOf(DonutChart),
        props: (v) => ({ data: withVal(CHANNELS5, v), thickness: 14, gap: 6 }),
      },
    ],
  },
  {
    id: "polar",
    title: "Rosa y sectores",
    description:
      "Sectores polares: igual ángulo por categoría, radio según el valor.",
    variants: [
      {
        title: "Sectores (8)",
        component: "SectorChart",
        view: viewOf(SectorChart),
        props: (v) => ({ data: withVal(EMO8, v), max: 14 }),
      },
      {
        title: "Sectores (6)",
        component: "SectorChart",
        view: viewOf(SectorChart),
        props: (v) => ({ data: withVal(EMO6, v), max: 12 }),
      },
      {
        title: "Rosa polar (6)",
        component: "RoseChart",
        view: viewOf(RoseChart),
        props: (v) => ({ data: withVal(EMO6, v), max: 12 }),
      },
      {
        title: "Rosa polar (8)",
        component: "RoseChart",
        view: viewOf(RoseChart),
        props: (v) => ({ data: withVal(EMO8, v), max: 14 }),
      },
      {
        title: "Sectores por día",
        component: "SectorChart",
        view: viewOf(SectorChart),
        props: (v) => ({
          data: DAYS.map((label, i) => ({
            label,
            value: jit(DAY_SECTORS[i], i, v),
            color: PAL8[i],
          })),
          max: 12,
        }),
      },
      {
        title: "Sectores por mes",
        component: "SectorChart",
        view: viewOf(SectorChart),
        props: (v) => ({ data: MONTHS12_DATA(v), max: 14 }),
      },
    ],
  },
  {
    id: "radar",
    title: "Radar",
    description:
      "Polígonos que se deforman al cambiar los valores de cada eje.",
    variants: [
      {
        title: "Pentágono",
        component: "RadarChart",
        view: viewOf(RadarChart),
        props: (v) => ({
          axes: ["Fuerza", "Velocidad", "Resistencia", "Técnica", "Equilibrio"],
          values: jitArr([80, 60, 90, 50, 70], 0, v),
        }),
      },
      {
        title: "Hexágono",
        component: "RadarChart",
        view: viewOf(RadarChart),
        props: (v) => ({
          axes: [
            "Ataque",
            "Defensa",
            "Velocidad",
            "Técnica",
            "Resistencia",
            "Equilibrio",
          ],
          values: jitArr([70, 85, 60, 90, 55, 75], 0, v),
        }),
      },
      {
        title: "Habilidades (4 ejes)",
        component: "RadarChart",
        view: viewOf(RadarChart),
        props: (v) => ({
          axes: SKILLS4,
          values: jitArr([70, 85, 60, 75], 0, v),
        }),
      },
      {
        title: "Evaluación de equipo (5)",
        component: "RadarChart",
        view: viewOf(RadarChart),
        props: (v) => ({
          axes: TEAM5,
          values: jitArr([80, 65, 90, 55, 72], 0, v),
          color: PALETTE.violet,
        }),
      },
    ],
  },
  {
    id: "radial",
    title: "Radial y medidor",
    description:
      "Arcos concéntricos, cuadrículas de anillos y medidores por zonas.",
    variants: [
      {
        title: "Barras radiales",
        component: "RadialBarChart",
        view: viewOf(RadialBarChart),
        props: (v) => ({
          categories: radialCats(v),
          legend: RAD_LEGEND,
          max: 600,
        }),
      },
      {
        title: "Barras radiales simples",
        component: "RadialBarChart",
        view: viewOf(RadialBarChart),
        props: (v) => ({
          categories: radialSimple(v),
          legend: [{ label: "Ventas", color: PALETTE.aqua }],
          max: 300,
        }),
      },
      {
        title: "Grid",
        component: "RadialGridChart",
        view: viewOf(RadialGridChart),
        props: (v) => ({
          items: GRID_BASE.map((it, i) => ({
            label: it.label,
            value: jit(it.base, i, v),
            max: 200,
            color: it.color,
          })),
          cols: 3,
        }),
      },
      {
        title: "Medidor por zonas",
        component: "GaugeChart",
        view: viewOf(GaugeChart),
        props: (v) => ({ value: jit(72, 0, v), max: 100, zones: ZONES3 }),
      },
      {
        title: "Medidor de una zona",
        component: "GaugeChart",
        view: viewOf(GaugeChart),
        props: (v) => ({
          value: jit(64, 1, v),
          max: 100,
          zones: [{ to: 100, color: PALETTE.blue, label: "Progreso" }],
        }),
      },
    ],
  },
  {
    id: "progress",
    title: "Progreso",
    description: "Barras de progreso, líquidos y cuadrículas que se llenan.",
    variants: [
      {
        title: "Progreso segmentado",
        component: "ProgressChart",
        view: viewOf(ProgressChart),
        props: (v) => ({
          items: PROG4.map((d, i) => ({
            ...d,
            value: dec(scaleVary(d.value, i + 4, v)),
          })),
          unit: "h",
        }),
      },
      {
        title: "Progreso por categorías",
        component: "ProgressChart",
        view: viewOf(ProgressChart),
        props: (v) => ({
          items: PROG3.map((d, i) => ({
            ...d,
            value: dec(scaleVary(d.value, i + 7, v)),
          })),
          unit: "M",
        }),
      },
      {
        title: "Líquido",
        component: "LiquidChart",
        view: viewOf(LiquidChart),
        props: (v) => ({ value: vary(68, 0, v) }),
      },
      {
        title: "Líquido aqua",
        component: "LiquidChart",
        view: viewOf(LiquidChart),
        props: (v) => ({ value: vary(45, 3, v), color: PALETTE.aqua }),
      },
      {
        title: "Cuadrícula 10×10",
        component: "WaffleChart",
        view: viewOf(WaffleChart),
        props: (v) => ({ filled: vary(63, 0, v), total: 100, cols: 10 }),
      },
      {
        title: "Cuadrícula 5×5",
        component: "WaffleChart",
        view: viewOf(WaffleChart),
        props: (v) => ({
          filled: wafFill(v),
          total: 25,
          cols: 5,
          color: PALETTE.violet,
        }),
      },
      {
        title: "Objetivos del mes",
        component: "ProgressChart",
        view: viewOf(ProgressChart),
        props: (v) => ({
          items: GOALS5.map((d, i) => ({
            ...d,
            value: dec(scaleVary(d.value, i + 11, v)),
          })),
          unit: "%",
        }),
      },
    ],
  },
  {
    id: "heatmap",
    title: "Mapa de calor",
    description: "Matrices de intensidad para días, semanas, meses o años.",
    variants: [
      {
        title: "Días × horas",
        component: "HeatmapChart",
        view: viewOf(HeatmapChart),
        props: (v) => ({
          rows: ROWS7,
          cols: HOURS12,
          values: genMat(ROWS7, HOURS12, v, 0),
        }),
      },
      {
        title: "Días de la semana",
        component: "HeatmapChart",
        view: viewOf(HeatmapChart),
        props: (v) => ({
          rows: ["Semana"],
          cols: DAYS,
          values: genMat(["Semana"], DAYS, v, 2),
          color: PALETTE.aqua,
        }),
      },
      {
        title: "Semanas del mes",
        component: "HeatmapChart",
        view: viewOf(HeatmapChart),
        props: (v) => ({
          rows: SEMANAS,
          cols: DAYS,
          values: genMat(SEMANAS, DAYS, v, 4),
          color: PALETTE.orange,
        }),
      },
      {
        title: "Meses de varios años",
        component: "HeatmapChart",
        view: viewOf(HeatmapChart),
        props: (v) => ({
          rows: ANIOS,
          cols: MESES12,
          values: genMat(ANIOS, MESES12, v, 6),
          color: PALETTE.violet,
        }),
      },
    ],
  },
  {
    id: "ridge",
    title: "Ridgeline",
    description:
      "Crestas superpuestas para comparar distribuciones entre categorías.",
    variants: [
      {
        title: "Ridgeline 5 filas",
        component: "RidgelineChart",
        view: viewOf(RidgelineChart),
        props: (v) => ({
          rows: ridgeRows(v, ["Lun", "Mar", "Mié", "Jue", "Vie"]),
        }),
      },
      {
        title: "Ridgeline 3 filas",
        component: "RidgelineChart",
        view: viewOf(RidgelineChart),
        props: (v) => ({ rows: ridgeRows(v, ["Q1", "Q2", "Q3"]) }),
      },
      {
        title: "Distribución semanal (7)",
        component: "RidgelineChart",
        view: viewOf(RidgelineChart),
        props: (v) => ({ rows: ridgeRows(v, DAYS), height: 360 }),
      },
      {
        title: "Distribución por año (3)",
        component: "RidgelineChart",
        view: viewOf(RidgelineChart),
        props: (v) => ({ rows: ridgeRows(v, ANIOS) }),
      },
    ],
  },
]

function GroupIconWrap({ id }: { id: string }) {
  return <GroupIcon id={id} />
}

export default function ChartGallery() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    prefersDark() ? "dark" : "light"
  )
  const [groupId, setGroupId] = useState<string | null>(null)
  const group = GROUPS.find((g) => g.id === groupId) ?? null

  return (
    <div className="uc-root" data-theme={theme}>
      <ChartStyles />
      <header className="uc-hero">
        {group ? (
          <div className="uc-navhead">
            <button
              type="button"
              className="uc-btn uc-back"
              onClick={() => setGroupId(null)}
              aria-label="Volver a los grupos"
            >
              <BackIcon />
              Volver
            </button>
            <div>
              <h1 className="uc-h1">{group.title}</h1>
              <p className="uc-sub">{group.description}</p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="uc-h1">Gráficas</h1>
            <p className="uc-sub">
              Elige un tipo de gráfica para ver sus variantes.
            </p>
          </div>
        )}
        <button
          type="button"
          className="uc-btn"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          aria-label="Cambiar tema claro y oscuro"
        >
          {theme === "light" ? "Modo oscuro" : "Modo claro"}
        </button>
      </header>
      {group ? (
        <div className="uc-grid">
          {group.variants.map((variant) => (
            <ChartCard key={variant.title} variant={variant} />
          ))}
        </div>
      ) : (
        <div className="uc-list">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="uc-row"
              onClick={() => setGroupId(g.id)}
            >
              <span className="uc-row-icon">
                <GroupIconWrap id={g.id} />
              </span>
              <span className="uc-row-text">
                <span className="uc-row-title">{g.title}</span>
                <span className="uc-row-desc">{g.description}</span>
              </span>
              <span className="uc-row-meta">{g.variants.length} variantes</span>
              <ChevronIcon />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
