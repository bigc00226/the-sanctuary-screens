import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/detail/detail-header";
import { InfoPanel } from "@/components/detail/info-panel";
import { KeyNav } from "@/components/detail/key-nav";
import { RelatedShots } from "@/components/detail/related-shots";
import { ShotPager } from "@/components/detail/shot-pager";
import { ShotViewer, layoutOf } from "@/components/detail/shot-viewer";
import { site } from "@/data/site";
import { getPage, getSection, getShot, getShots, neighborsOf, otherStatesOf, variantsOf } from "@/lib/catalog";
import { sectionHref, variantLabel, type Shot } from "@/lib/shots";
import styles from "./page.module.css";

type Props = PageProps<"/screens/[section]/[shot]">;

/** 見出しの帯の id（ページ全体の画像の下の「このページの上へ戻る」の行き先） */
const TOP_ID = "shot-top";

/** すべての画面（422枚）のページを、あらかじめ作っておく */
export function generateStaticParams() {
  return getShots().map((shot) => ({ section: shot.section, shot: shot.slug }));
}

/** 上で作ったもの以外のアドレスは「ページが見つかりません」にする */
export const dynamicParams = false;

/** アドレスの領域と画像の名前から、画面・領域・ページを取り出す（ない場合・領域が違う場合は「見つかりません」） */
async function resolve(params: Props["params"]) {
  const { section: sectionId, shot: slug } = await params;
  const shot = getShot(slug);
  if (!shot || shot.section !== sectionId) notFound();
  const section = getSection(shot.section);
  const page = getPage(shot.pageKey);
  if (!section || !page) notFound();
  return { shot, section, page };
}

/** 共有したときに表示する画像（ページ全体は縦に長すぎるため、上の部分の縮小画像） */
function shareImageOf(shot: Shot) {
  return shot.capture === "full"
    ? { url: shot.thumb.src, width: shot.thumb.width, height: shot.thumb.height, alt: shot.caption }
    : { url: shot.src, width: shot.width, height: shot.height, alt: shot.caption };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { shot, section, page } = await resolve(props.params);
  const description = `${section.title}・${page.title}の画面（${variantLabel(shot)}）。${shot.caption}`;
  const image = shareImageOf(shot);
  return {
    title: shot.caption,
    description,
    alternates: { canonical: shot.href },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "ja_JP",
      url: shot.href,
      title: `${shot.caption}｜${site.name}`,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${shot.caption}｜${site.name}`,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

export default async function ShotPage(props: Props) {
  const { shot, section, page } = await resolve(props.params);
  const layout = layoutOf(shot);
  const pageHref = `${sectionHref(section.id)}#p-${shot.pageNo}`;
  const variants = variantsOf(shot);
  const others = otherStatesOf(shot);
  const { prev, next } = neighborsOf(shot);
  // 前後の画面が別の領域のときだけ、その領域の名前を添える
  const neighbor = (other: Shot | null) =>
    other ? { shot: other, sectionTitle: other.section === shot.section ? undefined : getSection(other.section)?.title } : null;

  return (
    <>
      <article aria-labelledby="shot-title">
        <DetailHeader id={TOP_ID} shot={shot} section={section} pageTitle={page.title} pageHref={pageHref} variants={variants} />
        {layout === "split" ? (
          <div className={`container ${styles.split}`}>
            <ShotViewer shot={shot} layout={layout} topId={TOP_ID} />
            <div className={styles.aside}>
              <InfoPanel shot={shot} section={section} page={page} pageHref={pageHref} layout={layout} />
            </div>
          </div>
        ) : (
          <>
            {/* PC の画面は幅 1,440px で撮影しているため、広い画面では本来の大きさまで広げる（サイトの上部と同じ幅） */}
            <div className={`container-wide ${styles.figure}`}>
              <ShotViewer shot={shot} layout={layout} topId={TOP_ID} />
            </div>
            <div className={`container ${styles.below}`}>
              <InfoPanel shot={shot} section={section} page={page} pageHref={pageHref} layout={layout} />
            </div>
          </>
        )}
      </article>

      {others.length > 0 && <RelatedShots shots={others} pageTitle={page.title} pageHref={pageHref} pageCount={page.shots.length} />}

      <ShotPager prev={neighbor(prev)} next={neighbor(next)} order={shot.order} total={getShots().length} />
      <KeyNav prev={prev?.href} next={next?.href} />
    </>
  );
}
