/*
 * サーバー側（ページ）で、領域・ページのデータを、一覧に渡す見出しの情報（types.ts）に変換します。
 * catalog.ts は型だけを読み込むため、このファイルにはサーバー専用の処理は入りません。
 */
import type { Page, Section } from "@/lib/catalog";
import { sectionHref } from "@/lib/shots";
import type { PageMeta, SectionMeta } from "./types";

export function toSectionMeta(section: Section): SectionMeta {
  return {
    id: section.id,
    no: section.no,
    title: section.title,
    en: section.en,
    lead: section.lead,
    href: sectionHref(section.id),
  };
}

export function toPageMeta(page: Page): PageMeta {
  return { key: page.key, section: page.section, no: page.no, title: page.title, path: page.path };
}
