import { ChevronDown } from "lucide-react";
import styles from "./page-index.module.css";

export type PageIndexItem = { no: string; title: string; count: number };

/**
 * 領域のページの一覧（目次）。押すと、そのページの画面の位置へ移動します。
 * PC では常に開いた状態で、数列に並べます。スマートフォンでは閉じた状態にして、押すと開きます。
 */
export function PageIndex({ pages }: { pages: PageIndexItem[] }) {
  const headingId = "page-index-title";
  return (
    <nav className={styles.index} aria-labelledby={headingId}>
      <div className="container">
        <h2 id={headingId} className={styles.heading}>
          ページの一覧{" "}
          <span className={styles.headingCount}>{pages.length}ページ</span>
        </h2>
        <details className={styles.details}>
          <summary className={styles.summary}>
            <span className={styles.summaryText}>
              ページの一覧{" "}
              <span className={styles.headingCount}>{pages.length}ページ</span>
            </span>
            <ChevronDown aria-hidden className={styles.chevron} />
          </summary>
          <ol className={styles.list}>
            {pages.map((page) => (
              <li key={page.no} className={styles.item}>
                <a href={`#p-${page.no}`} className={styles.link}>
                  <span className={styles.no}>{page.no}</span>
                  <span className={styles.title}>{page.title}</span>
                  <span className={styles.count}>{page.count}枚</span>
                </a>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </nav>
  );
}
