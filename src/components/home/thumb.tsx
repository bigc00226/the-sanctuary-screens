import Image from "next/image";
import type { Shot } from "@/lib/shots";

type Props = {
  shot: Shot;
  /** 表示する幅（img の sizes）。表示の幅に合わせた WebP に変換して配信します */
  sizes: string;
  /** 画像だけのリンクでは、画面の説明を入れてください（説明の文字を並べて表示するときは空のまま） */
  alt?: string;
  /** 最初に見える位置の画像は、すぐに読み込む */
  eager?: boolean;
  /**
   * 読み込みの優先度（img の fetchpriority）。すぐに読み込む画像でも "low" にすると、
   * ページの先頭での先読み（preload）の対象にならず、大きな画像（LCP）の読み込みを妨げません
   */
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
};

/**
 * 一覧用の縮小画像（JPEG・PC は幅 720px、スマートフォンは幅 360px）。
 * トップページのカード・小さな見本に使います。大きく表示するときは ShotImage を使ってください。
 * 表示する幅に合わせた WebP に変換して配信します（静的なファイルとして書き出したときは、縮小画像のまま。元の画像は読み込みません）。
 */
export function Thumb({ shot, sizes, alt = "", eager = false, fetchPriority, className }: Props) {
  return (
    <Image
      src={shot.thumb.src}
      width={shot.thumb.width}
      height={shot.thumb.height}
      alt={alt}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
      decoding="async"
      className={className}
    />
  );
}
