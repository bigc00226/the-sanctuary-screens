/*
 * 画面の一覧のデータ（サーバー側だけで使う）。
 * 元のデータは src/data/shots.json（scripts/build-catalog.mjs が src/data/manifest.json と public/media の画像から作る）です。
 * ブラウザ側の部品には、ここで作った Shot を props で渡してください（一覧の全体をブラウザに送らないため）。
 */
import "server-only";
import { HIGHLIGHTS } from "@/data/highlights";
import { PAGES } from "@/data/pages";
import { SECTIONS, type SectionData, type SectionId } from "@/data/sections";
import data from "@/data/shots.json";
import { shotHref, type Capture, type Device, type Shot } from "./shots";

export type Page = {
  /** 例：public/05 */
  key: string;
  section: SectionId;
  no: string;
  title: string;
  /** システムでのアドレス（表示用） */
  path: string;
  shots: Shot[];
  /** 状態の数（同じ画面を別の端末・範囲で撮ったものは1つと数える） */
  stateCount: number;
};

export type Counts = {
  total: number;
  pc: number;
  sp: number;
  view: number;
  part: number;
  full: number;
};

export type Section = Omit<SectionData, "cover"> & {
  pages: Page[];
  counts: Counts;
  /** 一覧の代表の画面（src/data/sections.ts の cover） */
  cover: Shot;
};

type RawShot = (typeof data.shots)[number];

const FILE_PATTERN = /^(\d\d_[a-z]+)\/(\d\d)_(.+)_(pc|sp)_(view|full)\.png$/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** 開いたときに見える範囲の大きさ（これ以外の大きさの「最初の画面」は、画面の一部を切り出したもの） */
const VIEWPORTS: Record<Device, Array<[number, number]>> = {
  pc: [
    [2880, 1800],
    [1440, 900],
  ],
  sp: [
    [1170, 2532],
    [390, 844],
  ],
};

function captureOf(device: Device, full: boolean, width: number, height: number): Capture {
  if (full) return "full";
  return VIEWPORTS[device].some(([w, h]) => w === width && h === height) ? "view" : "part";
}

/** 撮影したときの画面の倍率（PC は 1440px・スマートフォンは 390px の幅の画面で撮影） */
function scaleOf(device: Device, capture: Capture, width: number): number {
  if (device === "pc") return capture === "full" ? (width >= 2880 ? 2 : 1) : 2;
  if (capture === "full") return width >= 780 ? 2 : 1;
  return 3;
}

/**
 * システムでのアドレスを、表示用に整える。
 * ・ID（UUID）は [id] に、招待のリンクの token は伏せる
 * ・検索の言葉など、%XX の形の文字は読める形に戻す
 * ・Stripe の決済画面（/c/pay/…）は、ページの設定（pages.ts の path）で置き換える
 */
function displayPath(url: string): string {
  const [beforeHash, hash] = url.split("#");
  const [pathname, query] = beforeHash.split("?");
  let out = pathname.replace(UUID, "[id]");
  if (query) {
    const params = query.split("&").map((pair) => {
      const [key, value = ""] = pair.split("=");
      if (key === "token") return `${key}=…`;
      let decoded = value;
      try {
        decoded = decodeURIComponent(value);
      } catch {
        // そのまま表示する
      }
      return `${key}=${decoded.replace(UUID, "[id]")}`;
    });
    out += `?${params.join("&")}`;
  }
  if (hash) out += `#${hash.replace(UUID, "[id]")}`;
  return out;
}

const sectionIndex = new Map<SectionId, number>(SECTIONS.map((s, i) => [s.id, i]));
const sectionByFolder = new Map<string, SectionData>(SECTIONS.map((s) => [s.folder, s]));

function build(): Shot[] {
  const shots = data.shots.map((raw: RawShot) => {
    const match = FILE_PATTERN.exec(raw.file);
    if (!match) throw new Error(`画像のファイル名の形式が違います: ${raw.file}`);
    const [, folder, pageNo, state, device] = match as unknown as [string, string, string, string, Device];
    const section = sectionByFolder.get(folder);
    if (!section) throw new Error(`領域が見つかりません: ${folder}`);
    const page = PAGES[section.id][pageNo];
    if (!page) throw new Error(`ページの名前がありません（src/data/pages.ts）: ${section.id}/${pageNo}`);

    const capture = captureOf(device, raw.full, raw.width, raw.height);
    const slug = raw.file.slice(folder.length + 1, -".png".length);
    const thumbCropped = raw.thumb.height / raw.thumb.width < raw.height / raw.width - 0.02;

    const shot: Shot = {
      slug,
      section: section.id,
      pageNo,
      pageKey: `${section.id}/${pageNo}`,
      state,
      stateKey: `${section.id}/${pageNo}_${state}`,
      caption: raw.caption,
      path: page.path ?? displayPath(raw.url),
      device,
      capture,
      width: raw.width,
      height: raw.height,
      bytes: raw.bytes,
      scale: scaleOf(device, capture, raw.width),
      src: `/media/shots/${raw.file}`,
      thumb: { src: `/media/thumbs/${folder}/${slug}.jpg`, width: raw.thumb.width, height: raw.thumb.height, cropped: thumbCropped },
      href: shotHref(section.id, slug),
      order: 0,
    };
    return shot;
  });

  // 並び順：領域 → ページの番号 → 状態の名前（基本の状態が先）→ PC・スマートフォン → 最初の画面・ページ全体
  const deviceRank: Record<Device, number> = { pc: 0, sp: 1 };
  const captureRank: Record<Capture, number> = { view: 0, part: 0, full: 1 };
  shots.sort(
    (a, b) =>
      sectionIndex.get(a.section)! - sectionIndex.get(b.section)! ||
      a.pageNo.localeCompare(b.pageNo) ||
      (a.state < b.state ? -1 : a.state > b.state ? 1 : 0) ||
      deviceRank[a.device] - deviceRank[b.device] ||
      captureRank[a.capture] - captureRank[b.capture],
  );
  shots.forEach((shot, i) => {
    shot.order = i;
  });
  return shots;
}

function countsOf(shots: Shot[]): Counts {
  return {
    total: shots.length,
    pc: shots.filter((s) => s.device === "pc").length,
    sp: shots.filter((s) => s.device === "sp").length,
    view: shots.filter((s) => s.capture === "view").length,
    part: shots.filter((s) => s.capture === "part").length,
    full: shots.filter((s) => s.capture === "full").length,
  };
}

const SHOTS: Shot[] = build();
const BY_SLUG = new Map(SHOTS.map((s) => [s.slug, s]));

const PAGE_LIST: Page[] = (() => {
  const pages = new Map<string, Page>();
  for (const shot of SHOTS) {
    let page = pages.get(shot.pageKey);
    if (!page) {
      const meta = PAGES[shot.section][shot.pageNo];
      page = { key: shot.pageKey, section: shot.section, no: shot.pageNo, title: meta.title, path: meta.path ?? "", shots: [], stateCount: 0 };
      pages.set(shot.pageKey, page);
    }
    page.shots.push(shot);
  }
  for (const page of pages.values()) {
    page.stateCount = new Set(page.shots.map((s) => s.stateKey)).size;
    if (!page.path) {
      // アドレスの「?」より前の部分を、重ならないように並べる
      page.path = [...new Set(page.shots.map((s) => s.path.split("?")[0].split("#")[0]))].join("・");
    }
  }
  return [...pages.values()];
})();

const SECTION_LIST: Section[] = SECTIONS.map((meta) => {
  const pages = PAGE_LIST.filter((p) => p.section === meta.id);
  const shots = SHOTS.filter((s) => s.section === meta.id);
  const cover = BY_SLUG.get(meta.cover);
  if (!cover || cover.section !== meta.id || cover.device !== "pc" || cover.capture !== "view") {
    throw new Error(`領域の代表の画面（src/data/sections.ts の cover）は、その領域の PC の「最初の画面」にしてください: ${meta.id} → ${meta.cover}`);
  }
  return { ...meta, pages, counts: countsOf(shots), cover };
});

/** すべての画面（表示の順） */
export function getShots(): Shot[] {
  return SHOTS;
}

export function getShot(slug: string): Shot | undefined {
  return BY_SLUG.get(slug);
}

/** 画面を取り出す（見つからない場合はエラー。データの中で指定した画面に使う） */
export function requireShot(slug: string): Shot {
  const shot = BY_SLUG.get(slug);
  if (!shot) throw new Error(`画面が見つかりません: ${slug}`);
  return shot;
}

export function getSections(): Section[] {
  return SECTION_LIST;
}

export function getSection(id: string): Section | undefined {
  return SECTION_LIST.find((s) => s.id === id);
}

export function getPages(section?: SectionId): Page[] {
  return section ? PAGE_LIST.filter((p) => p.section === section) : PAGE_LIST;
}

export function getPage(key: string): Page | undefined {
  return PAGE_LIST.find((p) => p.key === key);
}

/** 同じ画面を別の端末・範囲で撮ったもの（その画面を含む・表示の順） */
export function variantsOf(shot: Shot): Shot[] {
  return SHOTS.filter((s) => s.stateKey === shot.stateKey);
}

/**
 * 同じページのほかの状態（状態ごとに1枚。できるだけ同じ端末・範囲のものを選ぶ）
 */
export function otherStatesOf(shot: Shot): Shot[] {
  const page = getPage(shot.pageKey);
  if (!page) return [];
  const byState = new Map<string, Shot[]>();
  for (const s of page.shots) {
    if (s.stateKey === shot.stateKey) continue;
    byState.set(s.stateKey, [...(byState.get(s.stateKey) ?? []), s]);
  }
  return [...byState.values()].map(
    (group) =>
      group.find((s) => s.device === shot.device && s.capture === shot.capture) ??
      group.find((s) => s.device === shot.device) ??
      group[0],
  );
}

/** 表示の順で前後の画面 */
export function neighborsOf(shot: Shot): { prev: Shot | null; next: Shot | null } {
  return { prev: SHOTS[shot.order - 1] ?? null, next: SHOTS[shot.order + 1] ?? null };
}

/** 前後の領域 */
export function sectionNeighborsOf(id: SectionId): { prev: Section | null; next: Section | null } {
  const i = SECTION_LIST.findIndex((s) => s.id === id);
  return { prev: SECTION_LIST[i - 1] ?? null, next: SECTION_LIST[i + 1] ?? null };
}

/** 主な画面（18枚） */
export function getHighlights() {
  return HIGHLIGHTS.map((h, i) => ({ ...h, no: i + 1, shot: requireShot(h.slug) }));
}

/** 全体の数 */
export function getStats() {
  return {
    ...countsOf(SHOTS),
    sections: SECTION_LIST.length,
    pages: PAGE_LIST.length,
    states: new Set(SHOTS.map((s) => s.stateKey)).size,
  };
}

/** 画面の一覧の PDF（public/media/the-sanctuary-screens.pdf） */
export function getPdf(): { href: string; bytes: number; downloadName: string } | null {
  return data.pdf ? { href: `/media/${data.pdf.file}`, bytes: data.pdf.bytes, downloadName: "THE SANCTUARY 画面一覧.pdf" } : null;
}
