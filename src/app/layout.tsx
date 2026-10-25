import type { Metadata, Viewport } from "next";
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/data/site";
import { HIGHLIGHTS } from "@/data/highlights";
import { getPdf, getSections, getStats } from "@/lib/catalog";
import "./globals.css";

/*
 * 文字の種類は、THE SANCTUARY の画面と同じものを使います。
 * 日本語の文字は先読み（preload）しません。文字の範囲ごとに百数十個のファイルに分かれているため、
 * 先読みすると全ページで多くのファイルを読み込んでしまいます（先読みしなくても、使う範囲のファイルだけが読み込まれます）。
 */
const zen = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], preload: false, variable: "--font-zen", display: "swap" });
const shippori = Shippori_Mincho_B1({ weight: ["500", "600", "700"], preload: false, variable: "--font-shippori", display: "swap" });

/* 英字の見出し用（Cormorant Garamond・ラテン文字のみ）。ライセンス：SIL Open Font License（fonts/OFL-cormorant-garamond.txt） */
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
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
