import type { NextConfig } from "next";

/*
 * `STATIC_EXPORT=1 npm run build` で、サーバーのいらない静的なファイル（out/）として書き出せます。
 * その場合は画像の変換（WebP への変換・大きさの調整）を行わず、元の画像をそのまま配信します。
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(staticExport ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: staticExport,
    // 画面の画像は文字が多いため、大きく表示するときは画質 90 で変換する（一覧の縮小画像は変換しない）
    qualities: [75, 90],
    // 変換した画像を保存しておく時間（31日）。画面の画像はほとんど差し替えないため長めにして、変換の回数を減らす
    // （同じ名前のまま画像を差し替えたときは、.next/cache/images を削除してください）
    minimumCacheTTL: 2678400,
  },
  ...(staticExport
    ? {}
    : {
        async headers() {
          return [
            {
              // 画面の画像・縮小画像・PDF（差し替えることはほとんどないため、ブラウザに1日保存してもらう）
              source: "/media/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
            },
          ];
        },
      }),
};

export default nextConfig;
