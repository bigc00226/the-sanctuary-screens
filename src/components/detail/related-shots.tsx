import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ShotCard } from "@/components/shot-card";
import { DEVICE_LABEL, type Device, type Shot } from "@/lib/shots";
import styles from "./related-shots.module.css";

type Props = {
  /** 同じページのほかの状態（状態ごとに1枚） */
  shots: Shot[];
  pageTitle: string;
  /** 領域のページの中の、このページの位置（例：/screens/public#p-01） */
  pageHref: string;
  /** このページの画面の数（すべての端末・範囲） */
  pageCount: number;
};

/** 「同じページのほかの画面」：同じページのほかの状態の画面のカード（状態ごとに1枚・PC とスマートフォンで分けて並べる） */
export function RelatedShots({ shots, pageTitle, pageHref, pageCount }: Props) {
  const lanes = (["pc", "sp"] as Device[])
    .map((device) => ({ device, shots: shots.filter((shot) => shot.device === device) }))
    .filter((lane) => lane.shots.length > 0);
  const labelled = lanes.length > 1;

  return (
    <section className={`container ${styles.section}`} aria-labelledby="shot-related">
      <SectionHeading
        id="shot-related"
        eyebrow="Same Page"
        title="同じページのほかの画面"
        lead={<p>「{pageTitle}」の、ほかの状態の画面を1枚ずつ並べています。</p>}
        action={
          <Link href={pageHref} className={styles.all}>
            {pageTitle}の画面をすべて見る（{pageCount}枚）
            <ArrowRight aria-hidden className={styles.allIcon} />
          </Link>
        }
      />
      <div className={styles.lanes}>
        {lanes.map((lane) => (
          <div key={lane.device} className={styles.lane}>
            {labelled && <h3 className={styles.laneLabel}>{DEVICE_LABEL[lane.device]}</h3>}
            <ul className={styles.grid} data-device={lane.device}>
              {lane.shots.map((shot) => (
                <li key={shot.slug} className={styles.cell}>
                  <ShotCard shot={shot} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
