import { ShotCard } from "@/components/shot-card";
import { getShots } from "@/lib/catalog";

export default function Home() {
  const shots = getShots().slice(0, 8);
  return (
    <div className="container" style={{ paddingBlock: 48, display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
      {shots.map((s) => (
        <ShotCard key={s.slug} shot={s} />
      ))}
    </div>
  );
}
