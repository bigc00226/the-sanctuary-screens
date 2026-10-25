import type { ReactNode } from "react";
import styles from "./tour-chapter.module.css";

type Props = {
  /** 章の id（ページの中の位置は #c-{id}） */
  id: string;
  /** 章の番号（01〜） */
  no: string;
  /** 英字の小見出し（例：Discover） */
  en: string;
  title: string;
  /** 章の説明（1文） */
  lead: string;
  /** 章の画面の数 */
  count: number;
  /** 少し濃いベージュの帯にする（章ごとに交互に） */
  band?: boolean;
  children: ReactNode;
};

/** 主な画面の章（見出しと、その章の画面） */
export function TourChapter({ id, no, en, title, lead, count, band = false, children }: Props) {
  const headingId = `c-${id}-title`;
  return (
    <section id={`c-${id}`} className={styles.chapter} data-band={band || undefined} aria-labelledby={headingId}>
      <div className="container">
        <header className={styles.head}>
          <p className={`eyebrow ${styles.eyebrow}`}>
            <span>Chapter {no}</span>
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span>{en}</span>
          </p>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>{lead}</p>
          <p className={styles.count}>
            <span className={styles.countValue}>{count}</span>枚
          </p>
        </header>
        <div className={styles.items}>{children}</div>
      </div>
    </section>
  );
}
