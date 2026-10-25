import type { SectionId } from "@/lib/shots";

/*
 * 一覧（ShotBrowser）に渡す、まとまりの見出しの情報。
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
 * all：すべての画面（領域 → ページ → 端末の順にまとめる。領域でも絞り込める）
 * section：1つの領域の画面（ページ → 端末の順にまとめる）
 */
export type BrowserMode = "all" | "section";
