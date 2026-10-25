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
  className?: string;
};

/**
 * 画面のカード（縮小画像・端末と範囲のラベル・説明）。押すと、その画面の詳しいページへ移動します。
 * 縮小画像の枠の形は、PC は 16:10、スマートフォンは 390:844 にそろえています（並べたときに高さがそろうように）。
 */
export function ShotCard({ shot, title, onOpen, eager = false, kicker, size = "md", className }: Props) {
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
          unoptimized
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
