import styles from "./stat-chips.module.css";

export type Stat = {
  /** 数の前に添える言葉（例：PC） */
  label?: string;
  value: number;
  /** 数のうしろの単位（例：枚・ページ） */
  unit: string;
};

/** ページの最初の帯に並べる数（例：85枚・13ページ・PC 43枚） */
export function StatChips({ items, label }: { items: Stat[]; label: string }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((item) => (
        <li key={`${item.label ?? ""}${item.unit}`} className={styles.chip}>
          {item.label && <span className={styles.label}>{item.label}</span>}
          <span className={styles.value}>{item.value.toLocaleString("ja-JP")}</span>
          <span className={styles.unit}>{item.unit}</span>
        </li>
      ))}
    </ul>
  );
}
