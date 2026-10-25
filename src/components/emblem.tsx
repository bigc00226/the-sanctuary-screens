/* THE SANCTUARY のロゴの印と、神聖幾何学の飾り（本番のサイトと同じ図形） */
import styles from "./emblem.module.css";

/**
 * 円と星をかたどった大きな飾り（神聖幾何学のモチーフ）。
 * 図形は public/emblem.svg（すべてのページで同じファイルを使い回す）を CSS の mask で切り抜いて表示し、
 * 色は color（currentColor）に従います。大きさ・位置・色・透明度は className で指定してください
 * （高さを指定しない場合は、幅と同じ高さになります）。
 * public/emblem.svg の図形は、下の EmblemMark と同じく、円・六芒星・中心の点からできています。
 */
export function Emblem({ className }: { className?: string }) {
  return <span aria-hidden className={className ? `${styles.emblem} ${className}` : styles.emblem} />;
}

/** ロゴの横に置く小さな印 */
export function EmblemMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={1} className={className} aria-hidden>
      <circle cx="20" cy="20" r="18.5" strokeOpacity={0.6} />
      <polygon points="20,6 32.1,27 7.9,27" strokeOpacity={0.8} />
      <polygon points="20,34 7.9,13 32.1,13" strokeOpacity={0.8} />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
