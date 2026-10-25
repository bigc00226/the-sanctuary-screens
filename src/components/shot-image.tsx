import Image from "next/image";
import type { CSSProperties } from "react";
import { cssWidthOf, type Shot } from "@/lib/shots";

/** WebP に変換できる画像の高さの上限（これより縦に長い画像は、元の PNG のまま配信する） */
const MAX_OPTIMIZED_HEIGHT = 16000;

type Props = {
  shot: Shot;
  /**
   * 表示する幅（img の sizes）。例：「(min-width: 1200px) 960px, 100vw」
   * 実際に表示する幅に近いほど、ちょうどよい大きさの画像が読み込まれます。
   */
  sizes: string;
  /** ページを開いてすぐに見える大きな画像（LCP）は true */
  preload?: boolean;
  /**
   * 読み込みを始める時（preload を使わないとき）。最初に見える位置にあるのに先読みしたくない画像
   * （縦に非常に長いページ全体など）は "eager" にします。省略すると、見える位置に近づいてから読み込みます
   */
  loading?: "eager" | "lazy";
  /** 読み込みの優先度（img の fetchpriority） */
  fetchPriority?: "high" | "low" | "auto";
  /**
   * natural：撮影したときの画面の幅（PC 1440px・スマートフォン 390px）より大きくしない
   * fill：枠の幅いっぱいに表示する
   */
  fit?: "natural" | "fill";
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * 画面の画像（大きく表示するとき）。縮小画像を下に敷いておき、読み込みが終わるまでの間も形が分かるようにします。
 * 一覧のカードでは ShotCard を使ってください（縮小画像だけを読み込みます）。
 */
export function ShotImage({ shot, sizes, preload = false, loading, fetchPriority, fit = "natural", alt, className, style }: Props) {
  return (
    <Image
      src={shot.src}
      width={shot.width}
      height={shot.height}
      alt={alt ?? shot.caption}
      sizes={sizes}
      quality={90}
      preload={preload}
      loading={preload ? undefined : loading}
      fetchPriority={fetchPriority}
      unoptimized={shot.height > MAX_OPTIMIZED_HEIGHT}
      className={className}
      style={{
        width: "100%",
        height: "auto",
        maxWidth: fit === "natural" ? cssWidthOf(shot) : undefined,
        backgroundColor: "var(--canvas-2)",
        backgroundImage: `url(${shot.thumb.src})`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        ...style,
      }}
    />
  );
}
