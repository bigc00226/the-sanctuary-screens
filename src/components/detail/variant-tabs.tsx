import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { CAPTURE_LABEL, DEVICE_LABEL, type Shot } from "@/lib/shots";
import styles from "./variant-tabs.module.css";

type Props = {
  /** 今の画面 */
  current: Shot;
  /** 同じ画面を別の端末・範囲で撮ったもの（今の画面を含む・表示の順） */
  variants: Shot[];
};

/**
 * 同じ画面の、ほかの端末・範囲の撮影への切り替え（PC・最初の画面／スマートフォン・ページ全体 など）。
 * 押すと、その撮影の詳しいページへ移動します。今のページの位置（スクロール）はそのままにします。
 */
export function VariantTabs({ current, variants }: Props) {
  return (
    <nav aria-label="同じ画面のほかの撮影" className={styles.nav}>
      <p className={styles.label} aria-hidden>
        同じ画面のほかの撮影
      </p>
      <ul className={styles.list} data-count={variants.length}>
        {variants.map((variant) => {
          const Icon = variant.device === "pc" ? Monitor : Smartphone;
          const isCurrent = variant.slug === current.slug;
          return (
            <li key={variant.slug} className={styles.item}>
              <Link href={variant.href} scroll={false} className={styles.link} aria-current={isCurrent ? "page" : undefined}>
                <Icon aria-hidden className={styles.icon} />
                <span className={styles.text}>
                  <span className={styles.device}>{DEVICE_LABEL[variant.device]}</span>
                  <span className={styles.separator}>・</span>
                  <span className={styles.capture}>{CAPTURE_LABEL[variant.capture]}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
