import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toPageMeta, toSectionMeta } from "@/components/gallery/meta";
import { PageIndex } from "@/components/gallery/page-index";
import { toShotRows } from "@/components/gallery/rows";
import { SectionNav, type SectionNavItem } from "@/components/gallery/section-nav";
import { ShotBrowser } from "@/components/gallery/shot-browser";
import { StatChips } from "@/components/gallery/stat-chips";
import { PageIntro } from "@/components/page-intro";
import { site } from "@/data/site";
import { getSection, getSections, getShots, sectionNeighborsOf, type Section } from "@/lib/catalog";
import { sectionHref } from "@/lib/shots";

/** 6つの領域のページだけを、あらかじめ作っておく（それ以外のアドレスは「ページが見つかりません」） */
export const dynamicParams = false;

export function generateStaticParams() {
  return getSections().map((section) => ({ section: section.id }));
}

export async function generateMetadata(props: PageProps<"/screens/[section]">): Promise<Metadata> {
  const { section: id } = await props.params;
  const section = getSection(id);
  if (!section) notFound();

  const title = `${section.title}｜${site.name}`;
  const description = `${section.lead}${section.description}`;
  const image = {
    url: section.cover.src,
    width: section.cover.width,
    height: section.cover.height,
    alt: section.cover.caption,
  };
  return {
    title: section.title,
    description,
    alternates: { canonical: sectionHref(section.id) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "ja_JP",
      url: sectionHref(section.id),
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function toNavItem(section: Section): SectionNavItem {
  return {
    href: sectionHref(section.id),
    no: section.no,
    en: section.en,
    title: section.title,
    count: section.counts.total,
    pages: section.pages.length,
    cover: section.cover.thumb,
  };
}

export default async function SectionPage(props: PageProps<"/screens/[section]">) {
  const { section: id } = await props.params;
  const section = getSection(id);
  if (!section) notFound();

  const { prev, next } = sectionNeighborsOf(section.id);
  const shots = getShots().filter((shot) => shot.section === section.id);
  const sectionMeta = toSectionMeta(section);
  const pages = section.pages.map(toPageMeta);

  return (
    <>
      <PageIntro
        eyebrow={`${section.no} · ${section.en}`}
        title={section.title}
        crumbs={[{ label: "トップ", href: "/" }, { label: "すべての画面", href: "/screens" }, { label: section.title }]}
        lead={
          <>
            <p>{section.lead}</p>
            <p>{section.description}</p>
          </>
        }
      >
        <StatChips
          label="この領域の画面の数"
          items={[
            { value: section.counts.total, unit: "枚" },
            { value: section.pages.length, unit: "ページ" },
            { label: "PC", value: section.counts.pc, unit: "枚" },
            { label: "スマートフォン", value: section.counts.sp, unit: "枚" },
          ]}
        />
      </PageIntro>

      <PageIndex pages={section.pages.map((page) => ({ no: page.no, title: page.title, count: page.shots.length }))} />

      <ShotBrowser mode="section" rows={toShotRows(shots, pages, [sectionMeta])} sections={[sectionMeta]} pages={pages} />

      <SectionNav prev={prev ? toNavItem(prev) : null} next={next ? toNavItem(next) : null} />
    </>
  );
}
