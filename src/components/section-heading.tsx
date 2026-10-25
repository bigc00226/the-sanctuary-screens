import type { ReactNode } from "react";
import styles from "./section-heading.module.css";

type Props = {
  /** 見出しの上の英字（例：Features） */
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** 見出しの右側（PC）・下（スマートフォン）に置くもの（「すべて見る」のリンクなど） */
  action?: ReactNode;
  align?: "start" | "center";
  /** 見出しの id（目次・ページ内のリンクから移動するため） */
  id?: string;
  as?: "h2" | "h3";
  /** 黒の背景の上で使う */
  tone?: "light" | "dark";
};

/** ページの中の各章の見出し（英字の小見出し・見出し・説明） */
export function SectionHeading({ eyebrow, title, lead, action, align = "start", id, as: Tag = "h2", tone = "light" }: Props) {
  return (
    <div className={styles.heading} data-align={align} data-tone={tone}>
      <div className={styles.text}>
        {eyebrow && <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
        <Tag id={id} className={styles.title}>
          {title}
        </Tag>
        {lead && <div className={styles.lead}>{lead}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
