import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Emblem } from "./emblem";
import styles from "./page-intro.module.css";

type Props = {
  /** 見出しの上の英字（例：Public Pages） */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** 見出しの下の説明（段落ごとに分けて渡せます） */
  lead?: ReactNode;
  crumbs?: Crumb[];
  /** 説明の下に置くもの（数字・ボタンなど） */
  children?: ReactNode;
};

/** ページの最初の見出しの帯（すべての画面・領域・主な画面のページで共通） */
export function PageIntro({ eyebrow, title, lead, crumbs, children }: Props) {
  return (
    <header className={styles.intro}>
      <Emblem className={styles.emblem} />
      <div className={`container ${styles.inner}`}>
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {lead && <div className={styles.lead}>{lead}</div>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </header>
  );
}
