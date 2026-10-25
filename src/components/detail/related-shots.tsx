import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShotCard } from "@/components/shots/shot-card";
import { DEVICE_LABEL, type Device, type Shot } from "@/lib/shots";
import styles from "./related-shots.module.css";

type Props = {
  /** 同じページのほかの状態（状態ごとに1枚） */
  shots: Shot[];
  /** 今の画面の端末（その端末の列を先に並べる） */
  device: Device;
  pageTitle: string;
  /** 領域のページの中の、このページの位置（例：/screens/public#p-01） */
  pageHref: string;
  /** このページの画面の数（すべての端末・範囲） */
  pageCount: number;
};

/** 「同じページのほかの画面」：同じページのほかの状態の画面のカード（状態ごとに1枚・PC とスマートフォンで分けて並べる） */
export function RelatedShots({ shots, device, pageTitle, pageHref, pageCount }: Props) {
  const order: Device[] = device === "sp" ? ["sp", "pc"] : ["pc", "sp"];
  const lanes = order
    .map((laneDevice) => ({ device: laneDevice, shots: shots.filter((shot) => shot.device === laneDevice) }))
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
