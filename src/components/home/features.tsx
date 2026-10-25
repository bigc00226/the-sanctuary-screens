import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import type { FeatureIcon } from "@/data/features";
import type { Capture, Shot } from "@/lib/shots";
import { FEATURE_ICONS } from "./icons";
import { Thumb } from "./thumb";
import styles from "./features.module.css";

export type FeatureItem = {
  id: string;
  icon: FeatureIcon;
  title: string;
  body: string;
  /** その機能が分かる画面（2〜3枚） */
  shots: Shot[];
};

/**
 * 画面の例の並べ方
 * ・lineup：スマートフォンの画面を含むとき。縦長の画面を、高さをそろえて横に並べる
 * ・mosaic：PC の画面が3枚のとき。1枚目を大きく、残りの2枚を右に重ねる
 * ・pair / single：2枚・1枚のとき
 */
type Layout = "lineup" | "mosaic" | "pair" | "single";

function layoutOf(shots: Shot[]): Layout {
  if (shots.some((s) => s.device === "sp")) return "lineup";
  if (shots.length >= 3) return "mosaic";
  return shots.length === 2 ? "pair" : "single";
}

/** 大きく見せる1枚目には、開いたときに見える範囲（最初の画面）を選ぶ */
const CAPTURE_RANK: Record<Capture, number> = { view: 0, part: 1, full: 2 };

/** できること（機能と、その画面の例） */
export function FeatureGrid({ features }: { features: FeatureItem[] }) {
  return (
    <section className={styles.section} aria-labelledby="features">
      <div className="container">
        <SectionHeading
          id="features"
          eyebrow="Features"
          title="できること"
          lead={
            <p>
              {"主な機能を、画面の例とあわせてご紹介します。"}
              {"画面の例を押すと、その画面のくわしいページが開きます。"}
            </p>
          }
        />

        <ul className={styles.grid}>
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon];
            const layout = layoutOf(feature.shots);
            const shots = (
              layout === "mosaic" ? [...feature.shots].sort((a, b) => CAPTURE_RANK[a.capture] - CAPTURE_RANK[b.capture]) : feature.shots
            ).slice(0, 3);
            return (
              <li key={feature.id} className={styles.feature}>
                <div className={styles.text}>
                  <div className={styles.heading}>
                    <span className={styles.icon} aria-hidden>
                      <Icon />
                    </span>
                    <h3 className={styles.title}>{feature.title}</h3>
                  </div>
                  <p className={styles.body}>{feature.body}</p>
                </div>
                <div className={styles.tray}>
                  <ul className={styles.tiles} data-layout={layout} aria-label={`${feature.title}の画面の例`}>
                    {shots.map((shot) => (
                      <li key={shot.slug} className={styles.tile} data-device={shot.device} data-capture={shot.capture}>
                        <Link href={shot.href} prefetch={false} className={styles.tileLink}>
                          <Thumb shot={shot} alt={shot.caption} className={styles.tileImage} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
