/*
 * 絞り込みの条件（アドレスの「?」以降の項目）。
 *   device  … pc / sp
 *   capture … view / part / full
 *   section … 領域の id（すべての画面のページだけ）
 *   q       … 探す言葉
 *   shot    … 拡大表示している画面（画像の名前）
 * 決まった値以外が書かれていた場合は、その項目を無視します。
 */
import { CAPTURES, DEVICES, type Capture, type Device, type SectionId } from "@/lib/shots";

export type Filters = {
  device: Device | null;
  capture: Capture | null;
  section: SectionId | null;
  q: string;
};

/** 絞り込みの項目のうち、選んで絞り込むもの（言葉以外） */
export type Facet = "device" | "capture" | "section";

/** 探す言葉の長さの上限 */
export const MAX_QUERY_LENGTH = 100;

/** アドレスに書く項目の順（読みやすさのため。ほかの項目は、そのうしろに元の順で残す） */
const PARAM_ORDER = ["device", "capture", "section", "q", "shot"];

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

/** アドレスの「?」以降から条件を読む。sectionIds が null のときは、領域での絞り込みを使わない */
export function readFilters(params: URLSearchParams, sectionIds: readonly SectionId[] | null): Filters {
  return {
    device: pick(params.get("device"), DEVICES),
    capture: pick(params.get("capture"), CAPTURES),
    section: sectionIds ? pick(params.get("section"), sectionIds) : null,
    q: (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH),
  };
}

/** 選んでいる絞り込みの数（言葉を除く。スマートフォンの「絞り込み」ボタンに表示する） */
export function countActiveFacets(filters: Filters): number {
  return [filters.device, filters.capture, filters.section].filter(Boolean).length;
}

/** 項目を決まった順に並べ替えた、新しい URLSearchParams */
export function orderParams(params: URLSearchParams): URLSearchParams {
  const ordered = new URLSearchParams();
  for (const key of PARAM_ORDER) {
    const value = params.get(key);
    if (value !== null && value !== "") ordered.set(key, value);
  }
  for (const [key, value] of params) {
    if (!PARAM_ORDER.includes(key)) ordered.append(key, value);
  }
  return ordered;
}
