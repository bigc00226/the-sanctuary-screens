import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { variantLabel, type Shot } from "@/lib/shots";
import styles from "./shot-pager.module.css";

type Neighbor = {
  shot: Shot;
  /** 領域が変わるときだけ、その領域の名前 */
  sectionTitle?: string;
};

type Props = {
  prev: Neighbor | null;
  next: Neighbor | null;
  /** すべての画面の中での順番（0から） */
  order: number;
  total: number;
};

type Direction = "prev" | "next";

/* 端の画面の文は「1枚目」と書く（「最初の画面」は、開いたときに見える範囲の撮影を表す言葉のため） */
const DIRECTION = {
  prev: { label: "前の画面", key: "ArrowLeft", end: "1枚目の画面です", sectionLabel: "前の領域" },
  next: { label: "次の画面", key: "ArrowRight", end: "最後の画面です", sectionLabel: "次の領域" },
} as const;

function NeighborCard({ dir, neighbor }: { dir: Direction; neighbor: Neighbor }) {
  const { shot, sectionTitle } = neighbor;
  const text = DIRECTION[dir];
  const Arrow = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={shot.href}
      rel={dir}
      aria-keyshortcuts={text.key}
      className={styles.card}
      data-dir={dir}
      data-device={shot.device}
      data-capture={shot.capture}
    >
      <span className={styles.thumb}>
        <Image
          src={shot.thumb.src}
          width={shot.thumb.width}
          height={shot.thumb.height}
          alt=""
          sizes="120px"
          loading="lazy"
          decoding="async"
          className={styles.thumbImage}
        />
      </span>
      <span className={styles.text}>
        <span className={styles.dir}>
          <Arrow aria-hidden className={styles.arrow} />
          {text.label}
        </span>
        <span className={styles.caption}>{shot.caption}</span>
        <span className={styles.meta}>
          {sectionTitle && (
            <span className={styles.section}>
              {text.sectionLabel}：{sectionTitle}
            </span>
          )}
          <span>{variantLabel(shot)}</span>
        </span>
      </span>
    </Link>
  );
}

/** 最初・最後の画面では、前後の画面の代わりに、すべての画面の一覧へのリンクを置く */
function CatalogCard({ dir, total }: { dir: Direction; total: number }) {
  return (
    <Link href="/screens" className={styles.card} data-dir={dir} data-end>
      <span className={styles.endMark}>
        <LayoutGrid aria-hidden />
      </span>
      <span className={styles.text}>
        <span className={styles.dir}>{DIRECTION[dir].end}</span>
        <span className={styles.caption}>すべての画面（{total}枚）の一覧へ</span>
      </span>
    </Link>
  );
}

/** 前後の画面（表示の順）。← → キーでも移動できます（KeyNav） */
export function ShotPager({ prev, next, order, total }: Props) {
  return (
    <nav className={`container ${styles.pager}`} aria-labelledby="shot-pager">
      <div className={styles.head}>
        <h2 id="shot-pager" className={styles.title}>
          前後の画面
        </h2>
        <p className={styles.position}>
          {total}枚のうち <span className={styles.count}>{order + 1}</span>枚目
        </p>
        <p className={styles.hint}>
          <kbd className={styles.key}>←</kbd>
          <kbd className={styles.key}>→</kbd>
          キーでも前後の画面へ移動できます
        </p>
      </div>
      <div className={styles.grid}>
        {prev ? <NeighborCard dir="prev" neighbor={prev} /> : <CatalogCard dir="prev" total={total} />}
        {next ? <NeighborCard dir="next" neighbor={next} /> : <CatalogCard dir="next" total={total} />}
      </div>
    </nav>
  );
}
