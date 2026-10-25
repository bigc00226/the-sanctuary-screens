import type { Metadata, Viewport } from "next";
// 全体の CSS は、ほかの部品の CSS より先に読み込む（部品の CSS で、全体の決まりを上書きできるように）
import "./globals.css";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/data/site";
import { HIGHLIGHTS } from "@/data/highlights";
import { getPdf, getSections, getStats } from "@/lib/catalog";

/*
 * 文字の種類は、THE SANCTUARY の画面と同じものを使います（ライセンス：SIL Open Font License・src/fonts/OFL-*.txt）。
 * 日本語の文字のファイルは、サイトで使う文字だけに絞ったものです（scripts/subset-fonts.mjs・`npm run fonts` で作り直せます）。
 * 見出し（しっぽり明朝 B1）は、すべてのページの最初の見出しで使うため、先読み（preload）します。
 */
const zen = localFont({
  src: [
    { path: "../fonts/zen-kaku-gothic-new-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/zen-kaku-gothic-new-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/zen-kaku-gothic-new-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-zen",
  // 本文は、最初に表示した文字の種類のまま入れ替えない（読み込みが遅い回線で、表示のあとに文章が組み直されないように）。
  // 読み込みが間に合わなかったページでは端末の文字で表示し、次のページからは保存したこの文字で表示します
  display: "optional",
  preload: false,
  // 代わりの文字（読み込むまでの間）は、英字も日本語も端末の日本語の文字で表示する（--font-sans の続き）。
  // Arial を代わりに使うと、1行の中で英字と日本語の文字の種類が混ざり、行の高さが変わってしまう（読み込んだときに画面がずれる）ため
  adjustFontFallback: false,
});
const shippori = localFont({
  src: [{ path: "../fonts/shippori-mincho-b1-600.woff2", weight: "600", style: "normal" }],
  variable: "--font-shippori",
  display: "swap",
  // 本文と同じ理由で、代わりの文字は端末の明朝体にする（--font-serif の続き）
  adjustFontFallback: false,
});

/* 英字の見出し用（Cormorant Garamond・ラテン文字のみ）。ライセンス：SIL Open Font License（src/fonts/OFL-cormorant-garamond.txt） */
const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin.woff2", weight: "300 700", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  // 英字の見出しは小さな文字が中心のため、先読みはしない（代わりの文字の大きさは adjustFontFallback で合わせている）
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}｜${site.productTagline}`, template: `%s｜${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "ja_JP", title: site.name, description: site.description },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f5efe6" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const sections = getSections().map((s) => ({ id: s.id, no: s.no, title: s.title, en: s.en, count: s.counts.total }));
  const stats = getStats();
  const highlights = HIGHLIGHTS.length;
  return (
    <html lang="ja" className={`${zen.variable} ${shippori.variable} ${cormorant.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          本文へ移動
        </a>
        <SiteHeader sections={sections} total={stats.total} highlights={highlights} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter sections={sections} total={stats.total} highlights={highlights} pdf={getPdf()} />
      </body>
    </html>
  );
}
