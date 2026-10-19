import { useMemo } from 'react';
import type { ProjectVisual as VisualKind } from '../../data/content';

/** Deterministic PRNG so every render is identical — no layout jitter. */
function seeded(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Props {
  variant: VisualKind;
  seed: number;
  index: string;
  label: string;
}

const W = 800;
const H = 500;

/**
 * Placeholder artwork.
 *
 * These are generated compositions rather than photographs so the site ships
 * with zero image requests, no broken frames, and no layout shift. Swap each
 * one for a real `<img>` / `<video>` when you have project imagery — the
 * wrapper already handles the cinematic reveal and hover treatment.
 */
export function ProjectVisual({ variant, seed, index, label }: Props) {
  const data = useMemo(() => build(variant, seed), [variant, seed]);

  return (
    <div className="pvis" data-variant={variant}>
      <div className="pvis__frame">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`pv-bar-${seed}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FF5C00" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`pv-fade-${seed}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`pv-glow-${seed}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* backdrop grid */}
          <g stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1">
            {data.gridX.map((x, i) => (
              <line key={`v${i}`} x1={x} y1="0" x2={x} y2={H} />
            ))}
            {data.gridY.map((y, i) => (
              <line key={`h${i}`} x1="0" y1={y} x2={W} y2={y} />
            ))}
          </g>

          {/* horizon */}
          <rect x="0" y={H - 1} width={W} height="2" fill="#FFFFFF" fillOpacity="0.14" />

          {variant === 'bars' && (
            <g>
              {data.bars.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={H - b.h}
                  width={b.w}
                  height={b.h}
                  fill={`url(#pv-bar-${seed})`}
                  className="pvis__bar"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              ))}
              <rect x="0" y={H * 0.66} width={W} height="1.5" fill="#FFFFFF" fillOpacity="0.28" />
              <rect x="0" y={H * 0.66} width={W * 0.46} height="1.5" fill="#FF5C00" />
            </g>
          )}

          {variant === 'grid' && (
            <g>
              {data.cells.map((c, i) => (
                <rect
                  key={i}
                  x={c.x}
                  y={c.y}
                  width={c.s}
                  height={c.s}
                  fill={c.on ? '#FF5C00' : '#FFFFFF'}
                  fillOpacity={c.on ? 0.85 : 0.06}
                  className="pvis__cell"
                  style={{ animationDelay: `${i * 30}ms` }}
                />
              ))}
              <path d={`M0 ${H} L ${W} 0`} stroke="#FF5C00" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx={W * 0.72} cy={H * 0.32} r="150" fill={`url(#pv-glow-${seed})`} />
            </g>
          )}

          {variant === 'orbit' && (
            <g transform={`translate(${W / 2} ${H / 2})`}>
              <circle r="176" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" />
              <circle
                r="176"
                fill="none"
                stroke="#FF5C00"
                strokeOpacity="0.8"
                strokeWidth="2"
                strokeDasharray="120 986"
                className="pvis__spin"
              />
              <circle
                r="126"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.18"
                strokeDasharray="4 16"
              />
              <circle
                r="92"
                fill="none"
                stroke="#FF5C00"
                strokeOpacity="0.45"
                strokeDasharray="40 540"
                className="pvis__spin-rev"
              />
              <circle r="46" fill="#FF5C00" fillOpacity="0.9" className="pvis__pulse" />
              <circle r="46" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" />
              <circle r="240" fill="none" stroke="#FFFFFF" strokeOpacity="0.06" strokeDasharray="2 22" />
            </g>
          )}

          {variant === 'wave' && (
            <g>
              {data.waves.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={i === 2 ? '#FF5C00' : '#FFFFFF'}
                  strokeOpacity={i === 2 ? 0.95 : 0.16 - i * 0.02}
                  strokeWidth={i === 2 ? 2.5 : 1.2}
                  className="pvis__wave"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
              <ellipse cx={W / 2} cy={H * 0.5} rx={W * 0.4} ry={H * 0.3} fill={`url(#pv-glow-${seed})`} opacity="0.7" />
            </g>
          )}

          <rect x="0" y="0" width={W} height={H} fill={`url(#pv-fade-${seed})`} />
        </svg>

        <span className="pvis__index t-mono">{index}</span>
        <span className="pvis__label t-mono">{label}</span>
        <span className="pvis__scan" aria-hidden="true" />
      </div>
    </div>
  );
}

interface Built {
  gridX: number[];
  gridY: number[];
  bars: { x: number; w: number; h: number }[];
  cells: { x: number; y: number; s: number; on: boolean }[];
  waves: string[];
}

function build(_variant: VisualKind, seed: number): Built {
  const rnd = seeded(seed * 977 + 13);
  const gridX: number[] = [];
  for (let x = 0; x <= W; x += W / 16) gridX.push(x);
  const gridY: number[] = [];
  for (let y = 0; y <= H; y += H / 10) gridY.push(y);

  const bars: Built['bars'] = [];
  const count = 26;
  const bw = (W / count) * 0.52;
  for (let i = 0; i < count; i += 1) {
    const h = 60 + rnd() * (H * 0.84);
    bars.push({ x: (i * W) / count + (W / count - bw) / 2, w: bw, h });
  }

  const cells: Built['cells'] = [];
  const cols = 18;
  const rows = 11;
  const size = W / cols;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const on = rnd() > 0.78;
      cells.push({ x: x * size + size * 0.14, y: y * size + size * 0.14, s: size * 0.72, on });
    }
  }

  const waves: string[] = [];
  for (let w = 0; w < 5; w += 1) {
    const base = H * (0.28 + w * 0.11);
    const amp = 34 + rnd() * 46;
    const phase = rnd() * Math.PI * 2;
    let d = `M 0 ${base}`;
    for (let x = 0; x <= W; x += W / 16) {
      const y = base + Math.sin((x / W) * Math.PI * 3 + phase) * amp * (1 - w * 0.1);
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    waves.push(d);
  }

  return { gridX, gridY, bars, cells, waves };
}