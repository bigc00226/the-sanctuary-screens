/*
 * 一覧に渡す画面の情報を、ブラウザに送る量が少ない形（ShotRow：1枚＝1つの配列）にまとめる・元に戻す。
 * まとめる処理はサーバー側（ページ）で、戻す処理はブラウザ側（ShotBrowser）で使います。
 *
 * 一覧と拡大表示で使わない項目は送りません。戻したときは、次の値になります。
 *   bytes … 0（ファイルの大きさ）
 *   order … この一覧の中での順番（すべての画面のページでは、すべての画面の中での順番と同じ）
 */
import { CAPTURES, DEVICES, shotHref, type Capture, type Device, type Shot } from "@/lib/shots";
import type { PageMeta, SectionMeta, ShotRow } from "./types";

/** 端末と範囲の組み合わせ（ShotRow の variant は、この中の位置） */
const VARIANTS: Array<{ device: Device; capture: Capture }> = DEVICES.flatMap((device) =>
  CAPTURES.map((capture) => ({ device, capture })),
);

/** 決まった形の画像の URL（src/lib/catalog.ts と同じ形） */
function mediaOf(folder: string, slug: string) {
  return { src: `/media/shots/${folder}/${slug}.png`, thumb: `/media/thumbs/${folder}__${slug}.jpg` };
}

/** 画像の名前（例：05_apply-errors_pc_full）から、状態の名前（apply-errors）を取り出す */
function stateOf(slug: string, pageNo: string): string {
  return slug.slice(pageNo.length + 1).replace(/_(?:pc|sp)_(?:view|full)$/, "");
}

/** 画面を、一覧に渡す形にまとめる（サーバー側） */
export function toShotRows(shots: Shot[], pages: PageMeta[], sections: SectionMeta[]): ShotRow[] {
  const pageIndex = new Map(pages.map((page, i) => [page.key, i]));
  const folders = new Map(sections.map((section) => [section.id as string, section.folder]));
  return shots.map((shot) => {
    const page = pageIndex.get(shot.pageKey);
    if (page === undefined) throw new Error(`一覧に渡すページがありません: ${shot.pageKey}`);
    const variant = VARIANTS.findIndex((v) => v.device === shot.device && v.capture === shot.capture);
    const media = mediaOf(folders.get(shot.section) ?? "", shot.slug);
    const src = shot.src === media.src ? null : shot.src;
    const thumbSrc = shot.thumb.src === media.thumb ? null : shot.thumb.src;
    const row: ShotRow = [
      shot.slug,
      page,
      shot.caption,
      shot.path,
      variant,
      shot.width,
      shot.height,
      shot.scale,
      shot.thumb.width,
      shot.thumb.height,
    ];
    // URL が決まった形と違う画面だけ、URL をそのまま渡す
    if (src !== null || thumbSrc !== null) row.push(src, thumbSrc);
    return row;
  });
}

/** 一覧に渡された形から、画面（Shot）に戻す（ブラウザ側） */
export function fromShotRows(rows: ShotRow[], pages: PageMeta[], sections: SectionMeta[]): Shot[] {
  const folders = new Map(sections.map((section) => [section.id as string, section.folder]));
  return rows.map((row, order) => {
    const [slug, pageAt, caption, path, variant, width, height, scale, thumbWidth, thumbHeight, src, thumbSrc] = row;
    const page = pages[pageAt];
    const { device, capture } = VARIANTS[variant];
    const media = mediaOf(folders.get(page.section) ?? "", slug);
    const state = stateOf(slug, page.no);
    return {
      slug,
      section: page.section,
      pageNo: page.no,
      pageKey: page.key,
      state,
      stateKey: `${page.key}_${state}`,
      caption,
      path,
      device,
      capture,
      width,
      height,
      bytes: 0,
      scale,
      src: src ?? media.src,
      thumb: {
        src: thumbSrc ?? media.thumb,
        width: thumbWidth,
        height: thumbHeight,
        // 縦に長い画面の上の部分だけを切り出した縮小画像かどうか（src/lib/catalog.ts と同じ判定）
        cropped: thumbHeight / thumbWidth < height / width - 0.02,
      },
      href: shotHref(page.section, slug),
      order,
    };
  });
}
