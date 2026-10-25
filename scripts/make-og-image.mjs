/*
 * SNS で共有したときに表示される画像（1200×630）を作ります。
 *   src/app/opengraph-image.png・src/app/twitter-image.png（と、それぞれの説明の .alt.txt）
 *
 * 画像は、画面の撮影データ（01_public など）とサイトの文字（Cormorant Garamond・しっぽり明朝・Zen 角ゴシック）を使って
 * ブラウザ（Chrome）で組み立て、撮影して作ります。サイトの表示には使わない、作り直すときだけの道具です。
 *
 * 実行のしかた（playwright-core はサイトに必要ないため、package.json には入れていません）：
 *   npm i --no-save playwright-core@1.58
 *   node scripts/make-og-image.mjs
 * Chrome は、環境変数 CHROME_PATH、なければ一般的な場所（Linux・Mac・Windows）から探します。
 * 見つからない場合は `npx playwright-core install chromium` で、Playwright の Chromium を入れてください。
 * 別の場所の playwright-core を使う場合は、環境変数 PLAYWRIGHT_CORE にその場所を指定します。
 * 日本語の文字は Google Fonts から読み込むため、インターネットにつながった状態で実行してください。
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "app");
const WIDTH = 1200;
const HEIGHT = 630;

const ALT = "THE SANCTUARY 画面一覧：完全会員制のオンラインヒーリングサロンの Web システムの画面（422枚・PC とスマートフォン）";

/** 画面の画像（public/media/shots の PNG） */
const SHOTS = {
  front: "public/media/shots/01_public/01_top_pc_view.png",
  back: "public/media/shots/06_admin/04_sales_pc_view.png",
  phone: "public/media/shots/04_session/03_call_sp_view.png",
};

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require(process.env.PLAYWRIGHT_CORE || "playwright-core");
  } catch {
    console.error(
      [
        "[make-og-image] playwright-core が見つかりません。次のように入れてから、もう一度実行してください。",
        "  npm i --no-save playwright-core@1.58",
        "  node scripts/make-og-image.mjs",
      ].join("\n"),
    );
    process.exit(1);
  }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

/* ---------- ロゴの図形（public/emblem.svg・src/components/ui/emblem.tsx と同じ形） ---------- */

const C = 200;
const r2 = (n) => Math.round(n * 100) / 100;
const at = (radius, deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: r2(C + radius * Math.cos(a)), y: r2(C + radius * Math.sin(a)) };
};
const triangle = (radius, offset) =>
  [0, 120, 240]
    .map((d) => at(radius, d + offset))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

function emblemSvg() {
  const rays = Array.from({ length: 36 }, (_, i) => {
    const from = at(150, i * 10);
    const to = at(i % 3 === 0 ? 178 : 166, i * 10);
    return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke-opacity="0.35"/>`;
  }).join("");
  const petals = Array.from({ length: 6 }, (_, i) => at(58, i * 60))
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="58" stroke-opacity="0.3"/>`)
    .join("");
  const stars = Array.from({ length: 8 }, (_, i) => at(150, i * 45 + 22.5))
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="2.2" fill="currentColor" stroke="none" fill-opacity="0.8"/>`)
    .join("");
  return `<svg viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="0.8">
    <circle cx="${C}" cy="${C}" r="196" stroke-opacity="0.35"/><circle cx="${C}" cy="${C}" r="188" stroke-opacity="0.18"/>
    ${rays}
    <circle cx="${C}" cy="${C}" r="150" stroke-opacity="0.5"/>
    <polygon points="${triangle(128, -90)}" stroke-opacity="0.45"/><polygon points="${triangle(128, 90)}" stroke-opacity="0.45"/>
    <circle cx="${C}" cy="${C}" r="118" stroke-opacity="0.28"/>
    ${petals}
    <circle cx="${C}" cy="${C}" r="58" stroke-opacity="0.55"/><circle cx="${C}" cy="${C}" r="20" stroke-opacity="0.6"/>
    ${stars}
    <circle cx="${C}" cy="${C}" r="3.5" fill="currentColor" stroke="none"/>
  </svg>`;
}

const MARK = `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">
  <circle cx="20" cy="20" r="18.5" stroke-opacity="0.6"/>
  <polygon points="20,6 32.1,27 7.9,27" stroke-opacity="0.85"/><polygon points="20,34 7.9,13 32.1,13" stroke-opacity="0.85"/>
  <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none"/>
</svg>`;

function html() {
  const file = (p) => pathToFileURL(path.join(ROOT, p)).href;
  const shots = Object.fromEntries(Object.entries(SHOTS).map(([k, v]) => [k, file(v)]));
  for (const p of Object.values(SHOTS)) {
    if (!fs.existsSync(path.join(ROOT, p))) throw new Error(`画像が見つかりません: ${p}`);
  }
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600&family=Zen+Kaku+Gothic+New:wght@500&display=block">
<style>
  @font-face {
    font-family: "Cormorant";
    src: url("${file("src/fonts/cormorant-garamond-latin.woff2")}") format("woff2");
    font-weight: 300 700;
    font-style: normal;
  }
  @font-face {
    font-family: "Cormorant";
    src: url("${file("src/fonts/cormorant-garamond-latin-italic.woff2")}") format("woff2");
    font-weight: 300 700;
    font-style: italic;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    position: relative;
    background:
      radial-gradient(60% 80% at 82% 38%, rgb(212 177 115 / 0.22) 0%, rgb(212 177 115 / 0) 70%),
      radial-gradient(50% 60% at 8% 100%, rgb(212 177 115 / 0.10) 0%, rgb(212 177 115 / 0) 70%),
      #1f1a15;
    color: #f3eadc;
    font-family: "Zen Kaku Gothic New", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .border { position: absolute; inset: 16px; border: 1px solid rgb(227 204 156 / 0.26); }
  .emblem { position: absolute; left: 670px; top: -95px; width: 820px; height: 820px; color: #e3cc9c; opacity: 0.13; }
  .emblem svg, .mark svg { width: 100%; height: 100%; display: block; }

  .text { position: absolute; left: 76px; top: 0; bottom: 0; width: 520px; display: flex; flex-direction: column; justify-content: center; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
  .mark { width: 46px; height: 46px; color: #e3cc9c; }
  .eyebrow { font-family: "Cormorant"; font-weight: 600; font-size: 15px; letter-spacing: 0.34em; text-transform: uppercase; color: #e3cc9c; }
  .wordmark {
    margin: 0;
    font-family: "Cormorant"; font-weight: 600; font-size: 52px; line-height: 1; letter-spacing: 0.14em;
    background: linear-gradient(120deg, #f1ddb3 0%, #d4b173 50%, #b8925a 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    white-space: nowrap;
  }
  .rule { width: 72px; height: 1px; margin: 26px 0 24px; background: linear-gradient(90deg, #d4b173, rgb(212 177 115 / 0)); }
  .ja { margin: 0; font-family: "Shippori Mincho B1"; font-weight: 600; font-size: 28px; line-height: 1.5; letter-spacing: 0.1em; color: #f3eadc; }
  .sub { margin: 6px 0 0; font-family: "Shippori Mincho B1"; font-weight: 600; font-size: 22px; letter-spacing: 0.16em; color: #e3cc9c; }
  .stats { display: flex; align-items: baseline; gap: 26px; margin-top: 34px; }
  .stat { display: flex; align-items: baseline; gap: 6px; white-space: nowrap; }
  .num { font-family: "Cormorant"; font-weight: 600; font-size: 40px; line-height: 1; font-variant-numeric: lining-nums; color: #e3cc9c; }
  .label { font-size: 15px; letter-spacing: 0.1em; color: #cdbfa9; }
  .dot { width: 4px; height: 4px; border-radius: 50%; background: rgb(227 204 156 / 0.5); transform: translateY(-8px); }

  .browser { position: absolute; overflow: hidden; border-radius: 9px; background: #fcf9f4; box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.65), 0 0 0 1px rgb(255 255 255 / 0.06); }
  .bar { height: 24px; display: flex; align-items: center; gap: 6px; padding: 0 11px; background: linear-gradient(#fbf8f3, #efe6d8); border-bottom: 1px solid #e7dccb; }
  .bar i { width: 8px; height: 8px; border-radius: 50%; background: #d9cbb6; display: block; }
  .bar i:nth-child(1) { background: #d8a48f; } .bar i:nth-child(2) { background: #dcc08a; }
  .bar span { margin-left: 18px; flex: 1; height: 13px; border-radius: 99px; background: rgb(255 255 255 / 0.8); font-size: 8px; line-height: 13px; text-align: center; color: #7a6755; font-family: sans-serif; }
  .browser img { display: block; width: 100%; height: auto; }
  .back { left: 800px; top: 60px; width: 366px; opacity: 0.55; filter: saturate(0.85); }
  .front { left: 668px; top: 146px; width: 486px; }
  .phone { position: absolute; left: 1018px; top: 268px; width: 150px; padding: 7px; border-radius: 28px; background: linear-gradient(145deg, #3a3027, #14110d); box-shadow: 0 30px 60px -18px rgb(0 0 0 / 0.75), inset 0 0 0 1px rgb(255 255 255 / 0.1); }
  .phone div { overflow: hidden; border-radius: 22px; }
  .phone img { display: block; width: 100%; height: auto; }
</style>
</head>
<body>
  <div class="emblem">${emblemSvg()}</div>
  <div class="border"></div>

  <div class="browser back"><div class="bar"><i></i><i></i><i></i><span>the-sanctuary.jp/admin/sales</span></div><img src="${shots.back}" alt=""></div>
  <div class="browser front"><div class="bar"><i></i><i></i><i></i><span>the-sanctuary.jp</span></div><img src="${shots.front}" alt=""></div>
  <div class="phone"><div><img src="${shots.phone}" alt=""></div></div>

  <div class="text">
    <div class="brand"><div class="mark">${MARK}</div><div class="eyebrow">Private Healing &amp; Wellness</div></div>
    <h1 class="wordmark">THE SANCTUARY</h1>
    <div class="rule"></div>
    <p class="ja">完全会員制のオンライン<br>ヒーリングサロンの Web システム</p>
    <p class="sub">画面一覧</p>
    <div class="stats">
      <div class="stat"><span class="num">422</span><span class="label">枚の画面</span></div>
      <div class="dot"></div>
      <div class="stat"><span class="num">6</span><span class="label">つの領域</span></div>
      <div class="dot"></div>
      <div class="stat"><span class="label">PC とスマートフォン</span></div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const { chromium } = loadPlaywright();
  const executablePath = findChrome();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sanctuary-og-"));
  const htmlFile = path.join(dir, "og.html");
  fs.writeFileSync(htmlFile, html());

  const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
    // 日本語の文字のファイル（文字の範囲ごとに分かれている）を、使う文字の分だけ読み込み終わるまで待つ
    await page.evaluate(async () => {
      const text = document.body.innerText;
      await Promise.all([
        document.fonts.load('600 28px "Shippori Mincho B1"', text),
        document.fonts.load('500 15px "Zen Kaku Gothic New"', text),
        document.fonts.load('600 60px "Cormorant"', "THE SANCTUARY 422 6"),
      ]);
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
    });
    const missing = await page.evaluate(() =>
      ['600 28px "Shippori Mincho B1"', '500 15px "Zen Kaku Gothic New"', '600 60px "Cormorant"'].filter((f) => !document.fonts.check(f, "画面一覧THE")),
    );
    if (missing.length) console.warn(`[make-og-image] 読み込めなかった文字: ${missing.join(", ")}（ほかの文字で代わりに表示しています）`);

    const og = path.join(OUT_DIR, "opengraph-image.png");
    await page.screenshot({ path: og, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    fs.copyFileSync(og, path.join(OUT_DIR, "twitter-image.png"));
    fs.writeFileSync(path.join(OUT_DIR, "opengraph-image.alt.txt"), `${ALT}\n`);
    fs.writeFileSync(path.join(OUT_DIR, "twitter-image.alt.txt"), `${ALT}\n`);
    const kb = Math.round(fs.statSync(og).size / 1000);
    console.log(`[make-og-image] src/app/opengraph-image.png・twitter-image.png を作りました（${WIDTH}×${HEIGHT}・${kb}KB）`);
  } finally {
    await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
