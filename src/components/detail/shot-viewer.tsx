import { ArrowDown, ArrowUp, Maximize2, MoveVertical } from "lucide-react";
import type { CSSProperties } from "react";
import { DeviceFrame, addressOf } from "@/components/device-frame";
import { Emblem } from "@/components/emblem";
import { ShotImage } from "@/components/shot-image";
import { cssHeightOf, cssWidthOf, type Shot } from "@/lib/shots";
import styles from "./shot-viewer.module.css";

/**
 * 画像と説明の並べ方
 * ・split：画像の横に説明（幅 1024px 以上）。スマートフォンの画面と、幅の狭い画面の一部
 * ・stacked：画像の下に説明。PC の最初の画面・ページ全体と、幅の広い画面の一部（横に並べると文字が小さくなりすぎるため）
 */
export type DetailLayout = "split" | "stacked";

/** これより幅の狭い PC の「画面の一部」は、説明と横に並べる */
const SPLIT_MAX_WIDTH = 1000;

export function layoutOf(shot: Pick<Shot, "device" | "capture" | "width" | "scale">): DetailLayout {
  if (shot.device === "sp") return "split";
  if (shot.capture === "part" && cssWidthOf(shot) < SPLIT_MAX_WIDTH) return "split";
  return "stacked";
}

/** 画像の幅の上限：説明を画像の下に置くとき（.container-wide の幅。PC の画面の本来の幅と同じ） */
const WIDE = 1440;
/** 画像の幅の上限：説明を横に並べるもの（幅 1024px 未満では1列。.container の幅） */
const CONTAINER = 1200;
/** 横に並べたときの、画像の列の幅（台の余白を除く・幅 1280px 以上の画面のとき） */
const SPLIT_COLUMN = 700;
/** 左右の余白（--gutter の最大値 × 2） */
const GUTTERS = 80;

/** 画像を表示する幅（img の sizes）。実際の表示の幅に近いほど、ちょうどよい大きさの画像が読み込まれます */
function sizesOf(shot: Shot, layout: DetailLayout): string {
  if (shot.capture === "view" && shot.device === "sp") return "(min-width: 440px) 380px, 92vw";
  const natural = Math.min(cssWidthOf(shot), layout === "split" ? CONTAINER : WIDE);
  // 画面の幅が「画像の幅 + 左右の余白」より広いときは、画像の本来の幅（それ以上は大きくしない）
  const single = `(min-width: ${natural + GUTTERS}px) ${natural}px, 100vw`;
  return layout === "split" ? `(min-width: 1024px) ${Math.min(natural, SPLIT_COLUMN)}px, ${single}` : single;
}

type Props = {
  shot: Shot;
  layout: DetailLayout;
  /** ページの上（見出しの帯）の id。ページ全体の画像の下に「このページの上へ戻る」を置きます */
  topId: string;
};

/**
 * 画面の画像を大きく表示します。
 * ・最初の画面：PC はブラウザの窓、スマートフォンは本体の形の枠に入れる
 * ・画面の一部：枠線と影を付けて、本来の幅（それ以上は大きくしない）で中央に
 * ・ページ全体：上から下まで、ページの流れの中にそのまま表示する
 * 画像を押すと、元の画像（PNG）を新しいタブで開きます。
 */
export function ShotViewer({ shot, layout, topId }: Props) {
  const sizes = sizesOf(shot, layout);
  const vars = { "--shot-w": `${cssWidthOf(shot)}px` } as CSSProperties;
  const full = shot.capture === "full";
  const img = (
    <ShotImage shot={shot} sizes={sizes} preload={!full} loading={full ? "eager" : undefined} fit={shot.capture === "view" ? "fill" : "natural"} />
  );

  const image = (
    <a href={shot.src} target="_blank" rel="noopener" className={styles.zoom}>
      {full ? (
        /*
         * ページ全体は縦に非常に長いもの（最大 2.8 万 px・2.9MB）があるため、<head> での先読み（preload）はせず、
         * ページを開いたらすぐに読み込むだけにします。React は、読み込みを遅らせない画像を自動で先読みしますが、
         * <picture> の中の画像は先読みしないため、<picture> で包んでいます
         */
        <picture className={styles.picture}>{img}</picture>
      ) : (
        img
      )}
      <span className="visually-hidden">（元の画像を新しいタブで開く）</span>
      <span className={styles.zoomHint} aria-hidden>
        <Maximize2 className={styles.zoomIcon} />
        元の画像を開く
      </span>
    </a>
  );

  if (shot.capture === "view") {
    return (
      <div className={styles.viewer} data-layout={layout} data-kind={`${shot.device}-view`}>
        {shot.device === "pc" ? (
          <DeviceFrame device="pc" address={addressOf(shot.path)} elevated className={styles.browser}>
            {image}
          </DeviceFrame>
        ) : (
          <>
            <Emblem className={styles.halo} />
            <DeviceFrame device="sp" elevated className={styles.phone}>
              {image}
            </DeviceFrame>
          </>
        )}
      </div>
    );
  }

  if (shot.capture === "part") {
    return (
      <div className={styles.viewer} data-layout={layout} data-kind="part" style={vars}>
        <div className={styles.partFrame} data-device={shot.device}>
          {image}
        </div>
      </div>
    );
  }

  const endId = `${topId}-end`;
  return (
    <div className={styles.viewer} data-layout={layout} data-kind="full" style={vars}>
      <div className={styles.fullNote} data-device={shot.device}>
        <p className={styles.fullText}>
          <MoveVertical aria-hidden className={styles.fullIcon} />
          <span>
            ページ全体（高さ <span className={styles.number}>{cssHeightOf(shot).toLocaleString("ja-JP")}</span>px 相当）を、上から下まで表示しています。
          </span>
        </p>
        <a href={`#${endId}`} className={styles.skip}>
          画像の下へ
          <ArrowDown aria-hidden className={styles.skipIcon} />
        </a>
      </div>
      <div className={styles.fullFrame} data-device={shot.device}>
        {image}
      </div>
      <div id={endId} className={styles.fullEnd}>
        <a href={`#${topId}`} className={`btn btn-ghost btn-sm ${styles.toTop}`}>
          <ArrowUp aria-hidden />
          このページの上へ戻る
        </a>
      </div>
    </div>
  );
}
