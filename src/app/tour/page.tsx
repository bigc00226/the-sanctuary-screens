import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ChapterNav } from "@/components/tour/chapter-nav";
import { TourChapter } from "@/components/tour/tour-chapter";
import { TourItem, type TourItemData } from "@/components/tour/tour-item";
import { TourMore } from "@/components/tour/tour-more";
import { CHAPTERS, type ChapterId } from "@/data/highlights";
import { site } from "@/data/site";
import { getHighlights, getPage, getSection, getSections, getStats } from "@/lib/catalog";
import { sectionHref, type Shot } from "@/lib/shots";
import styles from "./page.module.css";

const stats = getStats();
const highlights = getHighlights();

const TITLE = "主な画面";
const DESCRIPTION = `${site.productTagline}「${site.product}」の Web システムの主な画面を、${highlights.length}枚でご紹介します。サロンを知るところから、ご入会、ご予約とお支払い、オンラインのセッション、ヒーラーと管理者の画面まで、${CHAPTERS.length}つの章に分けて、画面ごとにできることを説明しています。`;

/**
 * 共有したときに表示する画像（1枚目の画面：トップページの最初の画面。領域のページの代表の画面と同じ扱い）。
 * ここで openGraph を書くと、サイト全体の共有の設定（app/opengraph-image の画像を含む）はすべて置き換わるため、画像も必ず指定する
 */
const cover = highlights.at(0)?.shot;
if (!cover) throw new Error("主な画面がありません（src/data/highlights.ts の HIGHLIGHTS）");
const shareImage = { url: cover.src, width: cover.width, height: cover.height, alt: cover.caption };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tour" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "ja_JP",
    url: "/tour",
    title: `${TITLE}｜${site.name}`,
    description: DESCRIPTION,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE}｜${site.name}`,
    description: DESCRIPTION,
    images: [{ url: shareImage.url, alt: shareImage.alt }],
  },
};

/** 章の説明（その章の画面を、どなたが使うか） */
const CHAPTER_LEADS: Record<ChapterId, string> = {
  join: "どなたでもご覧いただける公開ページから、入会のお申し込みまでの画面です。",
  mypage: "ログインした会員様の画面です。",
  booking: "メニューを選んでからご予約が確定するまでの画面と、キャンセルの画面です。",
  session: "ブラウザだけで使える、ビデオ通話の画面です。",
  healer: "セッションを担当するヒーラーの画面です。",
  admin: "サロンを運営する管理者の画面です。",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 主な画面は、ブラウザの窓の枠に入れて大きく表示するため、PC の「最初の画面」に限ります
 * （ページ全体や画面の一部・スマートフォンの画面を選ぶと、枠に合わずに縦に長く表示されてしまうため）
 */
function checkShot(no: number, shot: Shot): Shot {
  if (shot.device !== "pc" || shot.capture !== "view") {
    throw new Error(`主な画面には、PC の最初の画面を選んでください（src/data/highlights.ts の ${no}枚目: ${shot.slug}）`);
  }
  return shot;
}

/** 同じページのほかの画面へのリンク（ほかの画面がないページは、その領域のページへ） */
function moreLinkOf(shot: Shot): TourItemData["more"] {
  const page = getPage(shot.pageKey);
  const section = getSection(shot.section);
  if (!page || !section) throw new Error(`ページが見つかりません: ${shot.pageKey}`);
  const others = page.shots.length - 1;
  if (others > 0) {
    return { label: `「${page.title}」のほかの画面（${others}枚）`, href: `${sectionHref(section.id)}#p-${page.no}` };
  }
  return { label: `「${section.title}」のほかの画面（${section.counts.total - 1}枚）`, href: sectionHref(section.id) };
}

export default function TourPage() {
  // 画面のない章は表示しない（章の番号は、表示する章だけで数える）
  const chapters = CHAPTERS.map((chapter) => ({
    ...chapter,
    lead: CHAPTER_LEADS[chapter.id],
    items: highlights
      .filter((h) => h.chapter === chapter.id)
      .map(
        (h): TourItemData => ({
          no: h.no,
          title: h.title,
          description: h.description,
          shot: checkShot(h.no, h.shot),
          more: moreLinkOf(h.shot),
        }),
      ),
  }))
    .filter((chapter) => chapter.items.length > 0)
    .map((chapter, i) => ({ ...chapter, no: pad(i + 1) }));

  const areas = getSections().map((section) => ({
    id: section.id,
    no: section.no,
    title: section.title,
    count: section.counts.total,
    href: sectionHref(section.id),
  }));

  return (
    <>
      <PageIntro
        eyebrow="Highlights"
        title={TITLE}
        crumbs={[{ label: "トップ", href: "/" }, { label: TITLE }]}
        lead={
          <>
            <p className={styles.leadText}>
              {`サロンを知るところから、ご入会、ご予約とお支払い、オンラインのセッション、ヒーラーと管理者の画面まで、主な流れを${highlights.length}枚でご紹介します。`}
            </p>
            <p className={styles.leadText}>画像を押すと、その画面のくわしいページが開きます。</p>
          </>
        }
      >
        <Link href="/screens" className="btn btn-outline btn-sm">
          すべての画面（{stats.total}枚）
          <ArrowRight aria-hidden />
        </Link>
      </PageIntro>

      {/* 章の一覧の帯は、最後の章が終わるまで上部に固定する */}
      <div className={styles.tour}>
        <ChapterNav items={chapters.map((chapter) => ({ id: chapter.id, no: chapter.no, title: chapter.title, count: chapter.items.length }))} />
        {chapters.map((chapter, i) => (
          <TourChapter
            key={chapter.id}
            id={chapter.id}
            no={chapter.no}
            en={chapter.en}
            title={chapter.title}
            lead={chapter.lead}
            count={chapter.items.length}
            band={i % 2 === 1}
          >
            {chapter.items.map((item) => (
              <TourItem
                key={item.no}
                item={item}
                side={item.no % 2 === 1 ? "left" : "right"}
                preload={item.no === 1}
                reveal={item.no !== 1}
              />
            ))}
          </TourChapter>
        ))}
      </div>

      <TourMore total={stats.total} highlights={highlights.length} areas={areas} />
    </>
  );
}
