/*
 * 画面の一覧のデータ（src/data/shots.json）を作ります。
 * `npm run dev`・`npm run build` の前に自動で実行されます（package.json の predev・prebuild）。
 *
 * ・画面の説明（アドレス・端末・大きさ）は src/data/manifest.json、画像は public/media/shots、
 *   縮小画像は public/media/thumbs、一覧の PDF は public/media/the-sanctuary-screens.pdf にあります。
 * ・ファイルの大きさと縮小画像の大きさは、ファイルから読み取ります。
 * ・画像がない、画像の大きさが manifest.json と違う、縮小画像がない、といった場合は、内容を表示して止まります。
 * ・manifest.json に書かれていない画像があるときと、日本語の文字のファイル（src/fonts）に入っていない文字が
 *   文章に増えたときは、お知らせします。
 *
 * 画面を追加・差し替えたときは、画像と縮小画像を置き、manifest.json に追記してから
 * `npm run catalog`（または dev・build）を実行してください。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectChars } from "./font-chars.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "src", "data", "manifest.json");
const SHOTS_DIR = path.join(ROOT, "public", "media", "shots");
const THUMBS_DIR = path.join(ROOT, "public", "media", "thumbs");
const PDF_FILE = "the-sanctuary-screens.pdf";
const PDF_PATH = path.join(ROOT, "public", "media", PDF_FILE);
const DATA_FILE = path.join(ROOT, "src", "data", "shots.json");
const FONT_CHARS = path.join(ROOT, "src", "fonts", "subset-chars.txt");

const FILE_PATTERN = /^(\d\d_[a-z]+)\/(\d\d)_(.+)_(pc|sp)_(view|full)\.png$/;

/** PNG の幅と高さ（IHDR） */
function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("PNG ではありません");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** JPEG の幅と高さ（SOF のマーカー） */
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("JPEG ではありません");
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = buf.readUInt16BE(i + 2);
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  throw new Error("JPEG の大きさを読み取れません");
}

/** 先頭の数 KB だけを読む（画像全体は読まない） */
function readHead(file, bytes = 64 * 1024) {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(bytes);
    const read = fs.readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
}

/** public/media/shots にある画像（manifest.json の file と同じ形：01_public/01_top_pc_view.png） */
function listShotFiles() {
  if (!fs.existsSync(SHOTS_DIR)) return [];
  return fs
    .readdirSync(SHOTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      fs
        .readdirSync(path.join(SHOTS_DIR, d.name))
        .filter((name) => name.endsWith(".png"))
        .map((name) => `${d.name}/${name}`),
    );
}

function buildCatalog() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (!Array.isArray(manifest)) throw new Error("src/data/manifest.json の形式が違います（配列ではありません）");

  const problems = [];
  const shots = [];

  for (const entry of manifest) {
    const match = FILE_PATTERN.exec(entry.file);
    if (!match) {
      problems.push(`ファイル名の形式が違います: ${entry.file}`);
      continue;
    }
    const [, , , , device, capture] = match;
    if (device !== entry.kind) problems.push(`端末の種類が合いません: ${entry.file}（manifest.json は ${entry.kind}）`);
    if ((capture === "full") !== entry.full) problems.push(`撮影の範囲が合いません: ${entry.file}`);

    const source = path.join(SHOTS_DIR, entry.file);
    if (!fs.existsSync(source)) {
      problems.push(`画像がありません: public/media/shots/${entry.file}`);
      continue;
    }
    const size = pngSize(readHead(source, 32));
    if (size.width !== entry.width || size.height !== entry.height) {
      problems.push(`画像の大きさが manifest.json と違います: ${entry.file}（実際は ${size.width}×${size.height}）`);
    }

    const thumbFile = `${entry.file.slice(0, -".png".length)}.jpg`;
    const thumbSource = path.join(THUMBS_DIR, thumbFile);
    if (!fs.existsSync(thumbSource)) {
      problems.push(`縮小画像がありません: public/media/thumbs/${thumbFile}`);
      continue;
    }
    const thumb = jpegSize(readHead(thumbSource));

    shots.push({
      file: entry.file,
      caption: entry.caption,
      url: entry.url,
      device,
      full: capture === "full",
      width: size.width,
      height: size.height,
      bytes: fs.statSync(source).size,
      thumb: { width: thumb.width, height: thumb.height },
    });
  }

  if (problems.length > 0) {
    for (const p of problems) console.error(`[catalog] ${p}`);
    process.exit(1);
  }

  const listed = new Set(manifest.map((entry) => entry.file));
  const unlisted = listShotFiles().filter((file) => !listed.has(file));
  if (unlisted.length > 0) {
    console.warn(
      `[catalog] manifest.json に書かれていない画像が ${unlisted.length} 枚あります（サイトには表示されません）：${unlisted.slice(0, 5).join("、")}${
        unlisted.length > 5 ? "…" : ""
      }`,
    );
  }

  // ファイル名の順（ページの番号 → 状態の名前 → 端末 → 撮影の範囲）に並べる。表示の順は src/lib/catalog.ts で決める
  shots.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  const pdf = fs.existsSync(PDF_PATH) ? { file: PDF_FILE, bytes: fs.statSync(PDF_PATH).size } : null;
  if (!pdf) console.warn(`[catalog] public/media/${PDF_FILE} がありません（一覧の PDF のダウンロードは表示されません）`);

  const json = `${JSON.stringify({ pdf, shots }, null, 1)}\n`;
  const previous = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, "utf8") : "";
  if (previous !== json) fs.writeFileSync(DATA_FILE, json);
  console.log(`[catalog] 画面 ${shots.length} 枚${previous !== json ? "（src/data/shots.json を更新しました）" : ""}`);
}

/**
 * 日本語の文字のファイル（src/fonts）に入っていない文字が、文章に増えていないかを確かめる。
 * 増えていても表示はできる（その文字だけ、端末にある文字の種類で表示される）ため、お知らせだけにする。
 */
function checkFontChars() {
  if (!fs.existsSync(FONT_CHARS)) return;
  const included = new Set(fs.readFileSync(FONT_CHARS, "utf8"));
  const missing = [...collectChars(ROOT)].filter((ch) => !included.has(ch));
  if (missing.length > 0) {
    console.warn(
      `[catalog] 日本語の文字のファイルに入っていない文字が ${missing.length} 文字あります（${missing.slice(0, 20).join("")}${
        missing.length > 20 ? "…" : ""
      }）。\`npm run fonts\` で作り直してください（作り直すまでは、端末にある文字の種類で表示されます）。`,
    );
  }
}

buildCatalog();
checkFontChars();
