import { Monitor, Smartphone } from "lucide-react";
import styles from "./numbers.module.css";

type Props = {
  total: number;
  sections: number;
  pages: number;
  pc: number;
  sp: number;
};

const format = (n: number) => n.toLocaleString("ja-JP");

/** 収録している画面の数（最初の帯の下に重ねて表示） */
export function NumbersBand({ total, sections, pages, pc, sp }: Props) {
  return (
    <section className={styles.band} aria-labelledby="home-numbers">
      <h2 id="home-numbers" className="visually-hidden">
        収録している画面の数
      </h2>
      <div className="container">
        <ul className={styles.card}>
          <li className={`${styles.item} ${styles.total}`}>
            <span className={`gold-text ${styles.value}`}>{format(total)}</span>
            <span className={styles.label}>枚の画面</span>
          </li>
          <li className={`${styles.item} ${styles.sections}`}>
            <span className={`gold-text ${styles.value}`}>{format(sections)}</span>
            <span className={styles.label}>つの領域</span>
          </li>
          <li className={`${styles.item} ${styles.pages}`}>
            <span className={`gold-text ${styles.value}`}>{format(pages)}</span>
            <span className={styles.label}>ページ</span>
          </li>
          <li className={`${styles.item} ${styles.devices}`}>
            <span className={styles.device}>
              <Monitor aria-hidden className={styles.icon} />
              <span className={styles.deviceLabel}>PC</span>
              <span className={`gold-text ${styles.deviceValue}`}>{format(pc)}</span>
              <span className={styles.unit}>枚</span>
            </span>
            <span className={styles.device}>
              <Smartphone aria-hidden className={styles.icon} />
              <span className={styles.deviceLabel}>スマートフォン</span>
              <span className={`gold-text ${styles.deviceValue}`}>{format(sp)}</span>
              <span className={styles.unit}>枚</span>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
