/* THE SANCTUARY のロゴの印と、神聖幾何学の飾り（本番のサイトと同じ図形） */
const C = 200;
const r2 = (n: number) => Math.round(n * 100) / 100;
const at = (radius: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: r2(C + radius * Math.cos(a)), y: r2(C + radius * Math.sin(a)) };
};
const triangle = (radius: number, offset: number) =>
  [0, 120, 240]
    .map((d) => at(radius, d + offset))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

const RAYS = Array.from({ length: 36 }, (_, i) => ({ from: at(150, i * 10), to: at(i % 3 === 0 ? 178 : 166, i * 10) }));
const PETALS = Array.from({ length: 6 }, (_, i) => at(58, i * 60));
const STARS = Array.from({ length: 8 }, (_, i) => at(150, i * 45 + 22.5));

/** 円と星をかたどった装飾（神聖幾何学のモチーフ） */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth={0.8} className={className} aria-hidden>
      <circle cx={C} cy={C} r={196} strokeOpacity={0.35} />
      <circle cx={C} cy={C} r={188} strokeOpacity={0.18} />
      {RAYS.map((r, i) => (
        <line key={i} x1={r.from.x} y1={r.from.y} x2={r.to.x} y2={r.to.y} strokeOpacity={0.35} />
      ))}
      <circle cx={C} cy={C} r={150} strokeOpacity={0.5} />
      <polygon points={triangle(128, -90)} strokeOpacity={0.45} />
      <polygon points={triangle(128, 90)} strokeOpacity={0.45} />
      <circle cx={C} cy={C} r={118} strokeOpacity={0.28} />
      {PETALS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={58} strokeOpacity={0.3} />
      ))}
      <circle cx={C} cy={C} r={58} strokeOpacity={0.55} />
      <circle cx={C} cy={C} r={20} strokeOpacity={0.6} />
      {STARS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.2} fill="currentColor" stroke="none" fillOpacity={0.8} />
      ))}
      <circle cx={C} cy={C} r={3.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** ロゴの横に置く小さな印 */
export function EmblemMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={1} className={className} aria-hidden>
      <circle cx="20" cy="20" r="18.5" strokeOpacity={0.6} />
      <polygon points="20,6 32.1,27 7.9,27" strokeOpacity={0.8} />
      <polygon points="20,34 7.9,13 32.1,13" strokeOpacity={0.8} />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
