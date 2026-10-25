/*
 * 画面の画像を、サイトで配信できる場所（public/media）に用意し、画面の一覧のデータを作ります。
 * `npm run dev`・`npm run build` の前に自動で実行されます（package.json の predev・prebuild）。
 *
 * ・元の画像（01_public〜06_admin・_thumbs・一覧.pdf）は、そのままの場所に残します。
 *   public/media には「ハードリンク」を作ります（同じファイルをもう一つの名前で指すだけなので、容量は増えません）。
 *   ハードリンクを作れない環境（別のドライブなど）では、コピーします。
 * ・manifest.json（画面の説明・アドレス・大きさ）をもとに、src/data/shots.json を作ります。
 *   ファイルの大きさと縮小画像（_thumbs）の大きさは、ファイルから読み取ります。
 *
 * 画面を追加・差し替えたときは、画像を元のフォルダに置き、manifest.json に追記してから
 * `npm run prepare-media`（または dev・build）を実行してください。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "public", "media");
const DATA_FILE = path.join(ROOT, "src", "data", "shots.json");
const PDF_SOURCE = "一覧.pdf";
const PDF_TARGET = "the-sanctuary-screens.pdf";

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

let linked = 0;
let copied = 0;
let kept = 0;

/** source を target に用意する（同じ内容がすでにあれば何もしない） */
function place(source, target) {
  const from = fs.statSync(source);
  if (fs.existsSync(target)) {
    const to = fs.statSync(target);
    if (to.ino === from.ino && to.dev === from.dev) {
      kept += 1;
      return;
    }
    if (to.size === from.size && to.mtimeMs >= from.mtimeMs) {
      kept += 1;
      return;
    }
    fs.rmSync(target);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    fs.linkSync(source, target);
    linked += 1;
  } catch {
    fs.copyFileSync(source, target);
    copied += 1;
  }
}

/** 一覧にない古いファイルを public/media から取り除く */
function prune(dir, keep) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const full = path.join(entry.parentPath ?? entry.path, entry.name);
    if (!keep.has(full)) {
      fs.rmSync(full);
      removed += 1;
    }
  }
  return removed;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
  if (!Array.isArray(manifest)) throw new Error("manifest.json の形式が違います（配列ではありません）");

  const keep = new Set();
  const problems = [];
  const shots = [];

  for (const entry of manifest) {
    const match = FILE_PATTERN.exec(entry.file);
    if (!match) {
      problems.push(`ファイル名の形式が違います: ${entry.file}`);
      continue;
    }
    const [, folder, , , device, capture] = match;
    if (device !== entry.kind) problems.push(`端末の種類が合いません: ${entry.file}（manifest は ${entry.kind}）`);
    if ((capture === "full") !== entry.full) problems.push(`撮影の範囲が合いません: ${entry.file}`);

    const source = path.join(ROOT, entry.file);
    if (!fs.existsSync(source)) {
      problems.push(`画像がありません: ${entry.file}`);
      continue;
    }
    const size = pngSize(readHead(source, 32));
    if (size.width !== entry.width || size.height !== entry.height) {
      problems.push(`画像の大きさが manifest.json と違います: ${entry.file}（実際は ${size.width}×${size.height}）`);
    }

    const base = path.basename(entry.file, ".png");
    const thumbName = `${folder}__${base}.jpg`;
    const thumbSource = path.join(ROOT, "_thumbs", thumbName);
    if (!fs.existsSync(thumbSource)) {
      problems.push(`縮小画像がありません: _thumbs/${thumbName}`);
      continue;
    }
    const thumb = jpegSize(readHead(thumbSource));

    const shotTarget = path.join(MEDIA, "shots", entry.file);
    const thumbTarget = path.join(MEDIA, "thumbs", thumbName);
    place(source, shotTarget);
    place(thumbSource, thumbTarget);
    keep.add(shotTarget);
    keep.add(thumbTarget);

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

  const pdfSource = path.join(ROOT, PDF_SOURCE);
  if (fs.existsSync(pdfSource)) {
    const pdfTarget = path.join(MEDIA, PDF_TARGET);
    place(pdfSource, pdfTarget);
    keep.add(pdfTarget);
  } else {
    problems.push(`${PDF_SOURCE} がありません（一覧の PDF のダウンロードは表示されません）`);
  }

  const removed = prune(MEDIA, keep);

  if (problems.length > 0) {
    for (const p of problems) console.error(`[prepare-media] ${p}`);
    if (problems.some((p) => !p.includes(PDF_SOURCE))) process.exit(1);
  }

  // ファイル名の順（ページの番号 → 状態の名前 → 端末 → 撮影の範囲）に並べる。表示の順は src/lib/catalog.ts で決める
  shots.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  const json = `${JSON.stringify(
    {
      pdf: fs.existsSync(pdfSource) ? { file: PDF_TARGET, bytes: fs.statSync(pdfSource).size } : null,
      shots,
    },
    null,
    1,
  )}\n`;
  const previous = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, "utf8") : "";
  if (previous !== json) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, json);
  }

  console.log(
    `[prepare-media] 画面 ${shots.length} 枚：新しく用意 ${linked + copied}（リンク ${linked}・コピー ${copied}）・変更なし ${kept}・削除 ${removed}${
      previous !== json ? "・src/data/shots.json を更新" : ""
    }`,
  );
}

main();
