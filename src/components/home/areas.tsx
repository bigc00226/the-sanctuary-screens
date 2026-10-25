import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { sectionHref, type SectionId, type Shot } from "@/lib/shots";
import { Thumb } from "./thumb";
import styles from "./areas.module.css";

export type AreaItem = {
  id: SectionId;
  no: string;
  en: string;
  title: string;
  lead: string;
  /** 一覧の代表の画面 */
  cover: Shot;
  /** 画面の数 */
  total: number;
  /** ページの数 */
  pages: number;
};

type Props = {
  areas: AreaItem[];
  /** すべての画面の数 */
  total: number;
};

/** 6つの領域（押すと、その領域のページへ移動します） */
export function AreaList({ areas, total }: Props) {
  return (
    <section className={styles.section} aria-labelledby="areas">
      <div className="container">
        <SectionHeading
          id="areas"
          eyebrow="Areas"
          title={`${areas.length}つの領域`}
          lead={
            <p>
              {`公開ページから管理画面まで、画面を${areas.length}つの領域に分けて収録しています。`}
              {"領域を選ぶと、その領域の画面をページごとにご覧いただけます。"}
            </p>
          }
          action={
            <Link href="/screens" className="btn btn-outline btn-sm">
              すべての画面（{total}枚）
              <ArrowRight aria-hidden />
            </Link>
          }
        />

        <ul className={styles.grid}>
          {areas.map((area) => (
            <li key={area.id} className={styles.item}>
              <Link href={sectionHref(area.id)} className={styles.card}>
                <span className={styles.frame}>
                  <Thumb shot={area.cover} className={styles.image} />
                </span>
                <span className={styles.body}>
                  <span className={styles.label}>
                    <span className={`gold-text ${styles.no}`}>{area.no}</span>
                    <span className={styles.en} aria-hidden>
                      {area.en}
                    </span>
                  </span>
                  <span className={styles.title}>{area.title}</span>
                  <span className={styles.lead}>{area.lead}</span>
                  <span className={styles.foot}>
                    <span className={styles.counts}>
                      {area.total}枚・{area.pages}ページ
                    </span>
                    <ArrowRight aria-hidden className={styles.arrow} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
