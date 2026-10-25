import Image from "next/image";
import type { Shot } from "@/lib/shots";

type Props = {
  shot: Shot;
  /** 画像だけのリンクでは、画面の説明を入れてください（説明の文字を並べて表示するときは空のまま） */
  alt?: string;
  /** 最初に見える位置の画像は、すぐに読み込む */
  eager?: boolean;
  className?: string;
};

/**
 * 一覧用の縮小画像（JPEG・PC は幅 720px、スマートフォンは幅 360px）。
 * トップページのカード・小さな見本に使います。大きく表示するときは ShotImage を使ってください。
 * 縮小画像は変換せずにそのまま配信するため、静的なファイルとして書き出したときも軽いままです。
 */
export function Thumb({ shot, alt = "", eager = false, className }: Props) {
  return (
    <Image
      src={shot.thumb.src}
      width={shot.thumb.width}
      height={shot.thumb.height}
      alt={alt}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
