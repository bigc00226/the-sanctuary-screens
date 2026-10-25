import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getSections, getShots } from "@/lib/catalog";

/** 静的なファイルとして書き出す（STATIC_EXPORT=1）ときも使えるように、ビルドのときに作っておく */
export const dynamic = "force-static";

/** 画面を撮影した日（ページの内容が変わった日として伝えます） */
const LAST_MODIFIED = new Date("2026-10-19");

/**
 * サイトマップ（すべてのページのアドレス）。
 * 静的なファイルとして書き出す（STATIC_EXPORT=1）ときは、アドレスの最後に「/」が付く形になるため、それに合わせます。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const slash = process.env.STATIC_EXPORT === "1" ? "/" : "";
  const url = (path: string) => (path === "/" ? `${base}/` : `${base}${path}${slash}`);

  return [
    { url: url("/"), lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 1 },
    { url: url("/tour"), lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/screens"), lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    ...getSections().map((section) => ({
      url: url(`/screens/${section.id}`),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getShots().map((shot) => ({
      url: url(shot.href),
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
