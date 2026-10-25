import { ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./breadcrumbs.module.css";

export type Crumb = { label: string; href?: string };

/** 現在の位置（例：トップ › すべての画面 › 公開ページ）。最後の項目が今のページです */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="現在の位置" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={styles.item}>
              {item.href && !last ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={styles.current}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className={styles.separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
