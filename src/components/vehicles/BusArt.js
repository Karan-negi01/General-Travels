// Side-profile illustration of a vehicle, drawn per type. Stands in for photos
// until operators can upload them, and keeps every card on-brand.

const SHAPES = {
  "tempo-traveller": { length: 200, height: 76, windows: 5, axles: 2, nose: 26 },
  "luxury-van": { length: 196, height: 78, windows: 5, axles: 2, nose: 30 },
  "mini-bus": { length: 236, height: 82, windows: 6, axles: 2, nose: 10 },
  bus: { length: 272, height: 86, windows: 8, axles: 2, nose: 6 },
  "luxury-coach": { length: 284, height: 92, windows: 7, axles: 3, nose: 8 },
  "sleeper-coach": { length: 284, height: 96, windows: 8, axles: 3, nose: 8, sleeper: true },
};

export default function BusArt({ type, tone = "dark", className }) {
  const s = SHAPES[type] ?? SHAPES.bus;
  const W = 320;
  const ground = 120;
  const x0 = (W - s.length) / 2;
  const x1 = x0 + s.length;
  const top = ground - 12 - s.height;
  const bottom = ground - 12;
  const id = `ba-${type}-${tone}`;

  // Body: rounded rear, raked windscreen at the front (right).
  const body = `M ${x0 + 12} ${top} H ${x1 - s.nose - 10} Q ${x1 - s.nose + 4} ${top} ${x1 - 6} ${top + s.height * 0.45} L ${x1} ${bottom - 14} Q ${x1} ${bottom} ${x1 - 14} ${bottom} H ${x0 + 10} Q ${x0} ${bottom} ${x0} ${bottom - 12} V ${top + 12} Q ${x0} ${top} ${x0 + 12} ${top} Z`;

  const winTop = top + 12;
  const winH = s.sleeper ? 16 : s.height * 0.34;
  const winStart = x0 + 14;
  const winEnd = x1 - s.nose - 34;
  const gap = 5;
  const winW = (winEnd - winStart - gap * (s.windows - 1)) / s.windows;

  const wheelR = 15;
  const front = x1 - 48;
  const rear = x0 + 46;
  const wheels = s.axles === 3 ? [rear, rear + 36, front] : [rear, front];

  const palette =
    tone === "dark"
      ? { bg1: "#dbe8fe", bg2: "#c3d7fb", body1: "#ffffff", body2: "#e3eaf6", road: "rgb(37 99 235 / 0.28)" }
      : { bg1: "#f3f7ff", bg2: "#e1ebfd", body1: "#ffffff", body2: "#e3eaf6", road: "rgb(37 99 235 / 0.2)" };

  // The vehicle is always shown whole ("meet"); the background and road are
  // drawn far beyond the viewBox so any frame shape is filled edge to edge.
  return (
    <svg viewBox={`0 0 ${W} 150`} className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-bg`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="150">
          <stop offset="0" stopColor={palette.bg1} />
          <stop offset="1" stopColor={palette.bg2} />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.body1} />
          <stop offset="1" stopColor={palette.body2} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a5a99" />
          <stop offset="1" stopColor="#13254a" />
        </linearGradient>
      </defs>

      <rect x="-1000" y="-500" width="2320" height="1150" fill={palette.bg2} />
      <rect x="-1000" y="-500" width="2320" height="650" fill={`url(#${id}-bg)`} />
      <circle cx={W * 0.78} cy="34" r="48" fill="#ffffff" opacity={tone === "dark" ? 0.45 : 0.7} />
      <line x1="-1000" y1={ground + 4} x2="1320" y2={ground + 4} stroke={palette.road} strokeWidth="1" />
      <line x1="-1000" y1={ground + 16} x2="1320" y2={ground + 16} stroke={palette.road} strokeWidth="2" strokeLinecap="round" strokeDasharray="50 70" />
      <ellipse cx={W / 2} cy={ground + 2} rx={s.length / 2} ry="5" fill="#000" opacity="0.25" />

      <path d={body} fill={`url(#${id}-body)`} />
      {Array.from({ length: s.windows }, (_, i) => (
        <rect key={i} x={winStart + i * (winW + gap)} y={winTop} width={winW} height={winH} rx="3" fill={`url(#${id}-glass)`} />
      ))}
      {s.sleeper &&
        Array.from({ length: s.windows }, (_, i) => (
          <rect key={`l${i}`} x={winStart + i * (winW + gap)} y={winTop + winH + 6} width={winW} height={winH} rx="3" fill={`url(#${id}-glass)`} />
        ))}
      {/* Windscreen + door */}
      <path d={`M ${winEnd + 8} ${winTop} H ${x1 - s.nose - 8} Q ${x1 - s.nose + 2} ${winTop} ${x1 - 8} ${top + s.height * 0.5} H ${winEnd + 8} Z`} fill={`url(#${id}-glass)`} />
      <rect x={winEnd + 8} y={top + s.height * 0.56} width="18" height={s.height * 0.36} rx="2" fill="none" stroke="#0a1628" strokeOpacity="0.25" />
      {/* Gold livery */}
      <rect x={x0} y={bottom - 26} width={s.length - 4} height="3" fill="#2563eb" />
      <rect x={x0} y={bottom - 21} width={s.length - 8} height="1.2" fill="#2563eb" opacity="0.5" />
      <rect x={x1 - 8} y={bottom - 20} width="6" height="5" rx="1.5" fill="#f8e7b5" />

      {wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={bottom} r={wheelR + 3} fill={palette.bg2} />
          <circle cx={cx} cy={bottom} r={wheelR} fill="#050b18" />
          <circle cx={cx} cy={bottom} r="6" fill="#aab3c5" />
        </g>
      ))}
    </svg>
  );
}
