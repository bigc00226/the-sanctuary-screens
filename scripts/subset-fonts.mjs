/*
 * 日本語の文字のファイル（しっぽり明朝 B1・Zen 角ゴシック New）を、サイトで使う文字だけに絞って作ります。
 *   src/fonts/zen-kaku-gothic-new-400.woff2 など（src/app/layout.tsx で読み込みます）
 *   src/fonts/subset-chars.txt（絞り込んだ文字の一覧。足りない文字がないかの確認に使います）
 *
 * 日本語の文字のファイルは、そのままだと1つ数 MB あり、Google Fonts の形（文字の範囲ごとに百数十個に分けたもの）でも
 * 各ページで約 200KB の CSS を先に読み込む必要がありました。使う文字だけ（約 1,000 文字）に絞ると、1つ約 100〜200KB になり、
 * CSS もほとんどいらなくなります。
 *
 * 文章を変えて新しい漢字が増えたときは、作り直してください（`npm run build` のときにお知らせが出ます。
 * 作り直さなくても、その文字はパソコン・スマートフォンにある文字の種類で表示されます）。
 *
 * 実行のしかた（Python の fontTools を使います）：
 *   pip install fonttools brotli
 *   npm run fonts
 * 別の Python を使う場合は、環境変数 PYTHON に指定します（例：PYTHON=/path/to/venv/bin/python npm run fonts）。
 * 元の文字のファイルは、Google Fonts のリポジトリ（SIL Open Font License）から、初回だけダウンロードします。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectChars } from "./font-chars.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "fonts");
const CACHE_DIR = path.join(os.tmpdir(), "sanctuary-font-sources");
const PYTHON = process.env.PYTHON || "python3";
const REPO = "https://raw.githubusercontent.com/google/fonts/main/ofl";

/** 作る文字のファイル（使っている太さだけ） */
const FONTS = [
  { family: "zenkakugothicnew", file: "ZenKakuGothicNew-Regular.ttf", out: "zen-kaku-gothic-new-400.woff2" },
  { family: "zenkakugothicnew", file: "ZenKakuGothicNew-Medium.ttf", out: "zen-kaku-gothic-new-500.woff2" },
  { family: "zenkakugothicnew", file: "ZenKakuGothicNew-Bold.ttf", out: "zen-kaku-gothic-new-700.woff2" },
  { family: "shipporiminchob1", file: "ShipporiMinchoB1-SemiBold.ttf", out: "shippori-mincho-b1-600.woff2" },
];
const LICENSES = [
  { family: "zenkakugothicnew", out: "OFL-zen-kaku-gothic-new.txt" },
  { family: "shipporiminchob1", out: "OFL-shippori-mincho-b1.txt" },
];

async function download(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return;
  console.log(`[fonts] ダウンロード：${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ダウンロードできませんでした（${res.status}）：${url}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  try {
    execFileSync(PYTHON, ["-c", "import fontTools.subset, brotli"], { stdio: "ignore" });
  } catch {
    console.error(
      [
        `[fonts] Python の fontTools と brotli が見つかりません（${PYTHON}）。次のように入れてから、もう一度実行してください。`,
        "  pip install fonttools brotli",
        "  npm run fonts",
      ].join("\n"),
    );
    process.exit(1);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const chars = collectChars(ROOT);
  const charsFile = path.join(OUT_DIR, "subset-chars.txt");
  fs.writeFileSync(charsFile, `${chars}\n`);
  console.log(`[fonts] 使う文字：${[...chars].length} 文字`);

  for (const font of FONTS) {
    const source = path.join(CACHE_DIR, font.file);
    await download(`${REPO}/${font.family}/${font.file}`, source);
    const out = path.join(OUT_DIR, font.out);
    execFileSync(
      PYTHON,
      [
        "-m",
        "fontTools.subset",
        source,
        `--text-file=${charsFile}`,
        "--flavor=woff2",
        "--no-hinting",
        `--output-file=${out}`,
      ],
      { stdio: "inherit" },
    );
    console.log(`[fonts] ${font.out}（${Math.round(fs.statSync(out).size / 1000)}KB）`);
  }

  for (const license of LICENSES) {
    const file = path.join(CACHE_DIR, `${license.family}-OFL.txt`);
    await download(`${REPO}/${license.family}/OFL.txt`, file);
    fs.copyFileSync(file, path.join(OUT_DIR, license.out));
  }
  console.log("[fonts] できました。src/fonts/ の変更を確認してください。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
