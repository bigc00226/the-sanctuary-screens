import Image from "next/image";
import { cssWidthOf, type Shot } from "@/lib/shots";

/** WebP に変換できる画像の高さの上限（src/components/shot-image.tsx と同じ値） */
const MAX_OPTIMIZED_HEIGHT = 16000;

type Props = {
  shot: Shot;
  /** 表示する幅（img の sizes） */
  sizes: string;
};

/**
 * ページ全体の画像。表示は ShotImage と同じで、読み込み方だけが違います。
 * ページを開いたときに見える位置にあるため、すぐに読み込みます（loading="eager"）。
 * ただし、縦に非常に長い（最大 2.8 万 px）ため、<head> での先読み（preload）はしません。
 * （ShotImage に読み込み方の指定がないため、ここで同じ形の画像を作っています）
 */
export function FullShotImage({ shot, sizes }: Props) {
  return (
    <Image
      src={shot.src}
      width={shot.width}
      height={shot.height}
      alt={shot.caption}
      sizes={sizes}
      quality={90}
      loading="eager"
      unoptimized={shot.height > MAX_OPTIMIZED_HEIGHT}
      style={{
        width: "100%",
        height: "auto",
        maxWidth: cssWidthOf(shot),
        backgroundColor: "var(--canvas-2)",
        backgroundImage: `url(${shot.thumb.src})`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
      }}
    />
  );
}
