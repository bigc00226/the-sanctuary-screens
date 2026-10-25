import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/** 静的なファイルとして書き出す（STATIC_EXPORT=1）ときも使えるように、ビルドのときに作っておく */
export const dynamic = "force-static";

/**
 * robots.txt（検索エンジンへの案内）。
 * 載せるかどうかは src/data/site.ts の `indexable` で切り替えます（はじめは載せない設定です）。
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
