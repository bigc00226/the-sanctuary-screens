import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Emblem } from "@/components/emblem";
import styles from "./tour-more.module.css";

export type TourArea = {
  id: string;
  /** 領域の番号（01〜06） */
  no: string;
  title: string;
  /** 領域の画面の数 */
  count: number;
  href: string;
};

type Props = {
  /** すべての画面の数 */
  total: number;
  /** 主な画面の数 */
  highlights: number;
  areas: TourArea[];
};

/** 主な画面のあとの案内（すべての画面・6つの領域へ） */
export function TourMore({ total, highlights, areas }: Props) {
  return (
    <section className={styles.section} aria-labelledby="tour-more-title">
      <div className="container">
        <div className={styles.panel}>
          <Emblem className={styles.emblem} />
          <p className={`eyebrow ${styles.eyebrow}`}>All Screens</p>
          <h2 id="tour-more-title" className={styles.title}>
            <span className={styles.phrase}>ほかの{total - highlights}枚の画面も、</span>
            <span className={styles.phrase}>ご覧いただけます</span>
          </h2>
          <p className={styles.lead}>
            <span className={styles.sentence}>入力エラーの表示や、会員様の状態ごとのマイページなども、PC とスマートフォンで収録しています。</span>
            <span className={styles.sentence}>領域・端末・範囲で絞り込んだり、言葉で探したりできます。</span>
          </p>
          <Link href="/screens" className={`btn btn-gold btn-lg ${styles.button}`}>
            すべての画面（{total}枚）を見る
            <ArrowRight aria-hidden />
          </Link>

          <div className={styles.areas}>
            <h3 className={styles.areasTitle}>領域ごとに見る</h3>
            <ul className={styles.areaList}>
              {areas.map((area) => (
                <li key={area.id}>
                  <Link href={area.href} className={styles.area}>
                    <span className={styles.areaNo} aria-hidden>
                      {area.no}
                    </span>
                    <span className={styles.areaTitle}>{area.title}</span>
                    <span className={styles.areaCount}>{area.count}枚</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
