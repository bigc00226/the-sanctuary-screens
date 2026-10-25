import { ArrowRight, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { toPageMeta, toSectionMeta } from "@/components/gallery/meta";
import { ShotBrowser } from "@/components/gallery/shot-browser";
import { StatChips } from "@/components/gallery/stat-chips";
import { PageIntro } from "@/components/page-intro";
import { HIGHLIGHTS } from "@/data/highlights";
import { site } from "@/data/site";
import { getPages, getPdf, getSections, getShots, getStats } from "@/lib/catalog";
import { formatBytes } from "@/lib/shots";
import styles from "./page.module.css";

const stats = getStats();

export const metadata: Metadata = {
  title: "すべての画面",
  description: `${site.productTagline}「${site.product}」の Web システムの画面、${stats.total}枚の一覧です。公開ページ・マイページ・ご予約・セッションのお部屋・ヒーラー画面・管理画面の${stats.sections}つの領域を、PC とスマートフォンで収録しています。領域・端末・範囲で絞り込んだり、言葉で探したりできます。`,
  alternates: { canonical: "/screens" },
};

export default function ScreensPage() {
  const sections = getSections();
  const pdf = getPdf();

  return (
    <>
      <PageIntro
        eyebrow="All Screens"
        title="すべての画面"
        crumbs={[{ label: "トップ", href: "/" }, { label: "すべての画面" }]}
        lead={
          <>
            <p>
              {site.product} の Web システムの画面を、{stats.total}枚すべて収録しています。公開ページから管理画面までの
              {stats.sections}つの領域を、PC とスマートフォンで撮影しました。開いたときに見える「最初の画面」、一部分を切り出した「画面の一部」、上から下までの「ページ全体」があります。
            </p>
            <p>
              領域・端末・範囲で絞り込めるほか、言葉でも探せます（ひらがな・カタカナのどちらでも探せます）。画像を押すと大きく表示し、← → キー（スマートフォンでは左右へのスワイプ）で前後の画面へ移動できます。
            </p>
          </>
        }
      >
        <StatChips
          label="収録している画面の数"
          items={[
            { value: stats.total, unit: "枚" },
            { value: stats.sections, unit: "つの領域" },
            { value: stats.pages, unit: "ページ" },
            { label: "PC", value: stats.pc, unit: "枚" },
            { label: "スマートフォン", value: stats.sp, unit: "枚" },
          ]}
        />
        <div className={styles.actions}>
          {pdf && (
            <a href={pdf.href} download={pdf.downloadName} type="application/pdf" className="btn btn-outline btn-sm">
              <FileDown aria-hidden />
              一覧の PDF（{formatBytes(pdf.bytes)}）
            </a>
          )}
          <Link href="/tour" className={`btn btn-ghost btn-sm ${styles.tourLink}`}>
            主な画面（{HIGHLIGHTS.length}枚）から見る
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </PageIntro>

      <ShotBrowser mode="all" shots={getShots()} sections={sections.map(toSectionMeta)} pages={getPages().map(toPageMeta)} />
    </>
  );
}
