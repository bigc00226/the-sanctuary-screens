import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Shot } from "@/lib/shots";
import styles from "./section-nav.module.css";

export type SectionNavItem = {
  href: string;
  no: string;
  en: string;
  title: string;
  count: number;
  pages: number;
  /** 領域の代表の画面の縮小画像 */
  cover: Shot["thumb"];
};

/** 領域のページの下部：前後の領域へのリンクと、すべての画面へ戻るリンク */
export function SectionNav({ prev, next }: { prev: SectionNavItem | null; next: SectionNavItem | null }) {
  return (
    <nav className={styles.nav} aria-label="前後の領域">
      <div className="container">
        {/* 最初・最後の領域では、片方のカードだけを中央に置く */}
        <div className={styles.grid} data-single={!prev || !next || undefined}>
          {prev && <SectionCard item={prev} direction="prev" />}
          {next && <SectionCard item={next} direction="next" />}
        </div>
        <p className={styles.back}>
          <Link href="/screens" className="btn btn-outline">
            <LayoutGrid aria-hidden />
            すべての画面へ戻る
          </Link>
        </p>
      </div>
    </nav>
  );
}

function SectionCard({ item, direction }: { item: SectionNavItem; direction: "prev" | "next" }) {
  return (
    <Link href={item.href} className={styles.card} data-direction={direction}>
      <span className={styles.thumb}>
        {/*
          表示は最大 240px のため、一覧のカードと同じ縮小画像（幅 720px の JPEG）から作る（表示の幅に合わせた WebP に変換）。
          ShotImage は元の画像から作るため、静的なファイルとして書き出したときは、元の PNG（約1MB）を読み込んでしまいます
        */}
        <Image src={item.cover.src} width={item.cover.width} height={item.cover.height} alt="" sizes="240px" />
      </span>
      <span className={styles.text}>
        <span className={styles.direction}>
          {direction === "prev" ? (
            <>
              <ArrowLeft aria-hidden />
              前の領域
            </>
          ) : (
            <>
              次の領域
              <ArrowRight aria-hidden />
            </>
          )}
        </span>
        <span className={styles.eyebrow}>
          {item.no} · {item.en}
        </span>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.count}>
          {item.count}枚・{item.pages}ページ
        </span>
      </span>
    </Link>
  );
}
