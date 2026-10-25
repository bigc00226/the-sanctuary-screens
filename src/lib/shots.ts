/*
 * 画面（スクリーンショット）の型・表示の名前・書式。
 * ブラウザ側の部品（"use client"）からも使うため、データ本体（src/lib/catalog.ts）はここで読み込まない。
 */
import type { SectionId } from "@/data/sections";

export type { SectionId };

/** 撮影した端末 */
export type Device = "pc" | "sp";

/**
 * 撮影の範囲
 * ・view：開いたときに見える範囲（PC は 1440×900、スマートフォンは 390×844 の画面）
 * ・part：画面の中の一部分（ご案内の枠・開いた章など）
 * ・full：ページの上から下まで
 */
export type Capture = "view" | "part" | "full";

export type Shot = {
  /** 画像のファイル名（拡張子なし）。すべての画面で重なりません。例：05_apply-errors_pc_full */
  slug: string;
  section: SectionId;
  /** ページの番号（ファイル名の先頭の2桁） */
  pageNo: string;
  /** 領域とページの番号。例：public/05 */
  pageKey: string;
  /** 状態の名前（ファイル名から番号・端末・範囲を除いたもの）。例：apply-errors */
  state: string;
  /** 領域・番号・状態。同じ画面を別の端末・範囲で撮ったものは、同じ値になります。例：public/05_apply-errors */
  stateKey: string;
  /** 画面の説明 */
  caption: string;
  /** システムでのアドレス（表示用。ID などは伏せています） */
  path: string;
  device: Device;
  capture: Capture;
  /** 画像の幅と高さ（px） */
  width: number;
  height: number;
  /** 画像のファイルの大きさ（バイト） */
  bytes: number;
  /** 撮影したときの画面の倍率（1・2・3）。width ÷ scale が、画面での実際の幅（CSS の px）です */
  scale: number;
  /** 元の画像（PNG） */
  src: string;
  /** 一覧で使う縮小画像（JPEG）。cropped は、縦に長い画面の上の部分だけを切り出したもの */
  thumb: { src: string; width: number; height: number; cropped: boolean };
  /** この画面の詳しいページ */
  href: string;
  /** すべての画面の中での順番（0から） */
  order: number;
};

export const DEVICE_LABEL: Record<Device, string> = {
  pc: "PC",
  sp: "スマートフォン",
};

export const CAPTURE_LABEL: Record<Capture, string> = {
  view: "最初の画面",
  part: "画面の一部",
  full: "ページ全体",
};

/** 撮影の範囲の補足（フィルターの説明・詳しいページで使う） */
export const CAPTURE_HINT: Record<Capture, string> = {
  view: "ページを開いたときに見える範囲",
  part: "画面の中の一部分を切り出したもの",
  full: "ページの上から下までの全体",
};

export const DEVICES: Device[] = ["pc", "sp"];
export const CAPTURES: Capture[] = ["view", "part", "full"];

/** 画面での実際の幅（CSS の px）。画像を、撮影したときの大きさより大きく表示しないために使う */
export function cssWidthOf(shot: Pick<Shot, "width" | "scale">): number {
  return Math.round(shot.width / shot.scale);
}

/** 画面での実際の高さ（CSS の px） */
export function cssHeightOf(shot: Pick<Shot, "height" | "scale">): number {
  return Math.round(shot.height / shot.scale);
}

/** ファイルの大きさを「1.2MB」「35KB」の形に */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1000))}KB`;
}

/** 「2880×1800px」の形に */
export function formatSize(width: number, height: number): string {
  return `${width.toLocaleString("ja-JP")}×${height.toLocaleString("ja-JP")}px`;
}

/** 端末と範囲を「PC・最初の画面」の形に */
export function variantLabel(shot: Pick<Shot, "device" | "capture">): string {
  return `${DEVICE_LABEL[shot.device]}・${CAPTURE_LABEL[shot.capture]}`;
}

/** 画面の詳しいページのアドレス */
export function shotHref(section: SectionId, slug: string): string {
  return `/screens/${section}/${slug}`;
}

/** 領域のページのアドレス */
export function sectionHref(section: SectionId): string {
  return `/screens/${section}`;
}
