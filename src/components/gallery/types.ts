import type { SectionId } from "@/lib/shots";

/*
 * 一覧（ShotBrowser）に渡す、まとまりの見出しの情報と、画面の情報。
 * ブラウザに送る量を減らすため、画面（Shot）とは別に、見出しに使う項目だけを渡します。
 */

/** 領域（6つ） */
export type SectionMeta = {
  id: SectionId;
  no: string;
  title: string;
  en: string;
  lead: string;
  /** 領域のページのアドレス */
  href: string;
  /** 元の画像のフォルダ（例：01_public）。画像の URL を組み立てるために使う */
  folder: string;
};

/** ページ（領域の中の番号ごとのまとまり） */
export type PageMeta = {
  /** 例：public/05 */
  key: string;
  section: SectionId;
  no: string;
  title: string;
  /** システムでのアドレス（表示用） */
  path: string;
};

/**
 * 一覧に渡す画面の情報（1枚を1つの配列にしたもの。作る・戻す処理は rows.ts）。
 * 422枚分の Shot をそのまま渡すと、ページの HTML が約28万バイト増えるため、一覧と拡大表示で使う項目だけを、
 * 決まった順に並べて渡します。画像の URL は、領域のフォルダと画像の名前から組み立てます。
 */
export type ShotRow = [
  slug: string,
  /** pages の中の位置 */
  page: number,
  caption: string,
  path: string,
  /** 端末と範囲（rows.ts の VARIANTS の中の位置） */
  variant: number,
  width: number,
  height: number,
  scale: number,
  thumbWidth: number,
  thumbHeight: number,
  /** 決まった形と違うときだけ：元の画像・縮小画像の URL（同じときは null・省略） */
  src?: string | null,
  thumbSrc?: string | null,
];

/**
 * all：すべての画面（領域 → ページ → 端末の順にまとめる。領域でも絞り込める）
 * section：1つの領域の画面（ページ → 端末の順にまとめる）
 */
export type BrowserMode = "all" | "section";
