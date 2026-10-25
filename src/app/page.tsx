import type { Metadata } from "next";
import { AreaList } from "@/components/home/areas";
import { ClosingBand } from "@/components/home/closing";
import { FeatureGrid } from "@/components/home/features";
import { HighlightsPreview, type HighlightItem } from "@/components/home/highlights";
import { HomeHero } from "@/components/home/hero";
import { NumbersBand } from "@/components/home/numbers";
import { Overview } from "@/components/home/overview";
import { TechPanel } from "@/components/home/tech";
import { FEATURES, TECH } from "@/data/features";
import { CHAPTERS, type ChapterId } from "@/data/highlights";
import { getHighlights, getPdf, getSections, getStats, requireShot } from "@/lib/catalog";
import styles from "./page.module.css";

// タイトルと説明は、サイト全体の設定（layout.tsx）のものを使う
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** 最初の帯の見本：PC のトップページと、手前に重ねるスマートフォンの通話中の画面 */
const HERO_PC = "01_top_pc_view";
const HERO_SP = "03_call_sp_view";

/**
 * 「主な画面」で、章ごとに選ぶ1枚（画像のファイル名）。
 * 最初の帯や「6つの領域」の代表の画面と、なるべく重ならないものを選んでいます（見つからないときは、その章の1枚目）。
 */
const PREVIEW: Record<ChapterId, string> = {
  join: "05_apply_pc_view",
  mypage: "01_mypage_pc_view",
  booking: "02_book-datetime_pc_view",
  session: "03_call-split_pc_view",
  healer: "06_healer-record_pc_view",
  admin: "04_sales_pc_view",
};

export default function HomePage() {
  const stats = getStats();
  const sections = getSections();
  const highlights = getHighlights();

  const preview: HighlightItem[] = CHAPTERS.flatMap((chapter) => {
    const inChapter = highlights.filter((h) => h.chapter === chapter.id);
    const pick = inChapter.find((h) => h.slug === PREVIEW[chapter.id]) ?? inChapter[0];
    return pick ? [{ no: pick.no, title: pick.title, chapter: { title: chapter.title, en: chapter.en }, shot: pick.shot }] : [];
  });

  return (
    <div className={styles.page}>
      <HomeHero pc={requireShot(HERO_PC)} sp={requireShot(HERO_SP)} total={stats.total} highlights={highlights.length} />
      <NumbersBand total={stats.total} sections={stats.sections} pages={stats.pages} pc={stats.pc} sp={stats.sp} />
      <Overview counts={Object.fromEntries(sections.map((s) => [s.id, s.counts.total]))} />
      <HighlightsPreview items={preview} total={highlights.length} chapters={CHAPTERS.length} />
      <AreaList
        areas={sections.map((s) => ({
          id: s.id,
          no: s.no,
          en: s.en,
          title: s.title,
          lead: s.lead,
          cover: s.cover,
          total: s.counts.total,
          pages: s.pages.length,
        }))}
        total={stats.total}
      />
      <FeatureGrid features={FEATURES.map((f) => ({ ...f, shots: f.shots.map((slug) => requireShot(slug)) }))} />
      <TechPanel items={TECH} />
      <ClosingBand total={stats.total} highlights={highlights.length} pdf={getPdf()} />
    </div>
  );
}
