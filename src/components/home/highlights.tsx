import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import type { Shot } from "@/lib/shots";
import { Thumb } from "./thumb";
import styles from "./highlights.module.css";

export type HighlightItem = {
  /** 主な画面の中での番号（1〜） */
  no: number;
  title: string;
  chapter: { title: string; en: string };
  shot: Shot;
};

type Props = {
  items: HighlightItem[];
  /** 主な画面の数 */
  total: number;
  /** 章の数 */
  chapters: number;
};

/** 主な画面（章ごとに1枚ずつ）。押すと、主な画面のページのその画面の位置へ移動します */
export function HighlightsPreview({ items, total, chapters }: Props) {
  return (
    <section className={styles.section} aria-labelledby="highlights">
      <div className="container">
        <SectionHeading
          id="highlights"
          eyebrow="Highlights"
          title="主な画面"
          lead={
            <p>
              {`サロンを知るところから、ご入会、ご予約とお支払い、オンラインのセッション、ヒーラーと管理者の画面まで、主な流れを${total}枚でご紹介しています。`}
              {`ここでは、${chapters}つの章から1枚ずつ選びました。`}
            </p>
          }
          action={
            <Link href="/tour" className={`btn btn-outline btn-sm ${styles.action}`}>
              {total}枚をすべて見る
              <ArrowRight aria-hidden />
            </Link>
          }
        />

        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.no} className={styles.item}>
              <Link href={`/tour#h-${item.no}`} className={styles.card}>
                <span className={styles.frame}>
                  <Thumb shot={item.shot} sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw" className={styles.image} />
                </span>
                <span className={styles.body}>
                  <span className={styles.meta}>
                    <span className={styles.no} aria-hidden>
                      {String(item.no).padStart(2, "0")}
                    </span>
                    <span className={styles.chapter}>
                      <span className={styles.chapterEn} aria-hidden>
                        {item.chapter.en}
                      </span>
                      <span className={styles.chapterTitle}>{item.chapter.title}</span>
                    </span>
                  </span>
                  <span className={styles.title}>{item.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
