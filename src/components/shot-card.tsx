import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { CAPTURE_LABEL, DEVICE_LABEL, type Shot } from "@/lib/shots";
import styles from "./shot-card.module.css";

type Props = {
  shot: Shot;
  /** 画面の説明の代わりに表示する文字（省略すると画面の説明） */
  title?: string;
  /**
   * 押したときに、ページを移動する代わりに呼ぶ（拡大表示に使う）。
   * ブラウザ側の部品（"use client"）の中で使うときだけ渡せます。Ctrl・⌘ を押しながら押したときは、通常どおり詳しいページを開きます。
   */
  onOpen?: (shot: Shot) => void;
  /** 最初に見える位置のカードは、縮小画像をすぐに読み込む */
  eager?: boolean;
  /** 画面の説明の上に、領域の名前などを小さく添える */
  kicker?: string;
  /** 小さいカード（関連する画面の一覧など）。説明は2行まで */
  size?: "md" | "sm";
  /** 縮小画像を表示する幅（img の sizes）。省略すると、カードの大きさと端末から決めます（一覧の並べ方に合わせた値） */
  sizes?: string;
  className?: string;
};

/** 一覧の並べ方（PC は1行に3枚・スマートフォンは1行に6〜7枚まで）に合わせた、縮小画像の表示の幅 */
const THUMB_SIZES = {
  md: {
    pc: "(min-width: 1240px) 380px, (min-width: 640px) 46vw, 92vw",
    sp: "(min-width: 1240px) 180px, (min-width: 640px) 24vw, 46vw",
  },
  sm: {
    pc: "(min-width: 1240px) 280px, (min-width: 640px) 32vw, 46vw",
    sp: "(min-width: 1240px) 140px, (min-width: 640px) 18vw, 30vw",
  },
} as const;

/**
 * 画面のカード（縮小画像・端末と範囲のラベル・説明）。押すと、その画面の詳しいページへ移動します。
 * 縮小画像（幅 720px・360px の JPEG）は、表示する幅に合わせた WebP に変換して配信します（静的なファイルとして書き出したときは、そのまま）。
 * 縮小画像の枠の形は、PC は 16:10、スマートフォンは 390:844 にそろえています（並べたときに高さがそろうように）。
 */
export function ShotCard({ shot, title, onOpen, eager = false, kicker, size = "md", sizes, className }: Props) {
  const handleClick = onOpen
    ? (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOpen(shot);
      }
    : undefined;

  return (
    <Link
      href={shot.href}
      onClick={handleClick}
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-device={shot.device}
      data-capture={shot.capture}
      data-size={size}
      data-shot={shot.slug}
      prefetch={false}
    >
      <span className={styles.frame}>
        <Image
          src={shot.thumb.src}
          width={shot.thumb.width}
          height={shot.thumb.height}
          alt=""
          sizes={sizes ?? THUMB_SIZES[size][shot.device]}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={styles.image}
        />
        {shot.capture === "full" && <span className={styles.fade} aria-hidden />}
      </span>
      <span className={styles.body}>
        <span className={styles.tags}>
          <span className="tag">{DEVICE_LABEL[shot.device]}</span>
          <span className="tag tag-solid">{CAPTURE_LABEL[shot.capture]}</span>
        </span>
        {kicker && <span className={styles.kicker}>{kicker}</span>}
        <span className={styles.caption}>{title ?? shot.caption}</span>
      </span>
    </Link>
  );
}
