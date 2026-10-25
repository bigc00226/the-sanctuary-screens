/*
 * サイトで使う文字の一覧（日本語の文字のファイルを、使う文字だけに絞るため）。
 * scripts/subset-fonts.mjs（文字のファイルを作る）と scripts/prepare-media.mjs（足りない文字がないか確かめる）で使います。
 *
 * ・サイトの文章（src の .ts・.tsx・.json・.css）と、画面の説明（manifest.json）に出てくる文字
 * ・あとから文章を少し変えても困らないように、ひらがな・カタカナ・英数字・記号はすべて
 */
import fs from "node:fs";
import path from "node:path";

/** 文字を集めるファイル（プロジェクトのフォルダからの場所） */
const SOURCE_DIR = "src";
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".json", ".css"]);
const EXTRA_FILES = ["manifest.json"];

/** いつも入れておく文字の範囲 */
const RANGES = [
  [0x20, 0x7e], // 英数字・記号
  [0xff01, 0xff5e], // 全角の英数字・記号
  [0x3000, 0x303f], // 、。「」〜 など
  [0x3041, 0x3096], // ひらがな
  [0x309b, 0x309e],
  [0x30a1, 0x30fa], // カタカナ
  [0x30fc, 0x30fe],
  [0x2010, 0x2027], // ダッシュ・引用符・…
  [0x2190, 0x2193], // 矢印
];
const EXTRA_CHARS = "¥×÷±°©®™※○●◎△▲▽▼□■◇◆☆★♪〒々〆ヶ・";

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/** 使う文字を、文字コードの順に並べた文字列で返す */
export function collectChars(root) {
  const chars = new Set();
  const files = [...walk(path.join(root, SOURCE_DIR), []), ...EXTRA_FILES.map((f) => path.join(root, f))];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const ch of fs.readFileSync(file, "utf8")) chars.add(ch);
  }
  for (const [from, to] of RANGES) for (let c = from; c <= to; c += 1) chars.add(String.fromCodePoint(c));
  for (const ch of EXTRA_CHARS) chars.add(ch);
  // 改行・制御文字・サロゲートの片方などは除く
  const printable = [...chars].filter((ch) => /^[\p{L}\p{N}\p{P}\p{S}\p{Zs}]$/u.test(ch));
  return printable.sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
}
