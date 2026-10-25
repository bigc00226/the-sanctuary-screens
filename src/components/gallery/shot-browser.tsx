"use client";

import { ArrowRight, Monitor, RotateCcw, SearchX, Smartphone } from "lucide-react";
import Link from "next/link";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ShotCard } from "@/components/shot-card";
import { DEVICE_LABEL, type Device, type Shot } from "@/lib/shots";
import { FilterBar, type FacetCounts } from "./filter-bar";
import { countActiveFacets, orderParams, readFilters, type Facet, type Filters } from "./filters";
import { Lightbox } from "./lightbox";
import { fromShotRows } from "./rows";
import { buildHaystack, matchesTerms, parseQuery } from "./search";
import type { BrowserMode, PageMeta, SectionMeta, ShotRow } from "./types";
import { currentParams, isViewerEntry, useLocationSearch, writeSearch } from "./use-url-state";
import styles from "./shot-browser.module.css";

type Props = {
  mode: BrowserMode;
  /** 表示の順（領域 → ページ → 状態 → 端末 → 範囲）に並んだ画面（送る量を減らした形。rows.ts の toShotRows で作る） */
  rows: ShotRow[];
  /** 見出しに使う領域（mode が section のときは、その領域だけ） */
  sections: SectionMeta[];
  /** 見出しに使うページ */
  pages: PageMeta[];
};

type PageGroup = { page: PageMeta; pc: Shot[]; sp: Shot[] };
type SectionGroup = { section: SectionMeta; pages: PageGroup[]; count: number };

/** 縮小画像をすぐに読み込むカードの数（最初に見える位置のもの） */
const EAGER_CARDS = 6;
/** 言葉を入力してから、一覧とアドレスに反映するまでの時間（ms） */
const QUERY_DELAY = 250;
/** 絞り込みの条件の項目（アドレスの「?」以降） */
const FILTER_KEYS = ["device", "capture", "section", "q"] as const;

/** カードは、画面のデータと押したときの処理が変わらない限り描き直さない（422枚を絞り込むときの負担を減らす） */
const Card = memo(ShotCard);

/** 表示する画面を、領域 → ページ → 端末（PC・スマートフォン）にまとめる（画面はすでに表示の順に並んでいる） */
function groupShots(shots: Shot[], sectionById: ReadonlyMap<string, SectionMeta>, pageByKey: ReadonlyMap<string, PageMeta>) {
  const groups: SectionGroup[] = [];
  let section: SectionGroup | null = null;
  let page: PageGroup | null = null;
  for (const shot of shots) {
    const sectionMeta = sectionById.get(shot.section);
    const pageMeta = pageByKey.get(shot.pageKey);
    if (!sectionMeta || !pageMeta) continue;
    if (!section || section.section.id !== shot.section) {
      section = { section: sectionMeta, pages: [], count: 0 };
      groups.push(section);
      page = null;
    }
    if (!page || page.page.key !== shot.pageKey) {
      page = { page: pageMeta, pc: [], sp: [] };
      section.pages.push(page);
    }
    page[shot.device].push(shot);
    section.count += 1;
  }
  return groups;
}

/** まとめた順（画面に並んでいる順）の一覧。拡大表示の前後の移動に使う */
function flatten(groups: SectionGroup[]): Shot[] {
  return groups.flatMap((g) => g.pages.flatMap((p) => [...p.pc, ...p.sp]));
}

type Entry = { shot: Shot; haystack: string };

/** アドレスの「?」以降のうち、絞り込みの条件の部分だけ（比べられるように文字にする） */
function conditionsOf(params: URLSearchParams): string {
  const only = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value !== null) only.set(key, value);
  }
  return only.toString();
}

/** 条件に合う画面と、選択肢ごとの数（ほかの条件はそのままで、その選択肢を選んだときの数） */
function applyFilters(entries: Entry[], filters: Filters) {
  const terms = parseQuery(filters.q);
  const counts: FacetCounts = { device: { "": 0 }, capture: { "": 0 }, section: { "": 0 } };
  const add = (facet: Facet, key: string) => {
    counts[facet][""] += 1;
    counts[facet][key] = (counts[facet][key] ?? 0) + 1;
  };
  const visible: Shot[] = [];
  for (const { shot, haystack } of entries) {
    const d = !filters.device || shot.device === filters.device;
    const c = !filters.capture || shot.capture === filters.capture;
    const s = !filters.section || shot.section === filters.section;
    const q = terms.length === 0 || matchesTerms(haystack, terms);
    if (c && s && q) add("device", shot.device);
    if (d && s && q) add("capture", shot.capture);
    if (d && c && q) add("section", shot.section);
    if (d && c && s && q) visible.push(shot);
  }
  return { visible, counts, terms };
}

/**
 * 画面の一覧（絞り込み・言葉で探す・拡大表示）。
 * 条件と拡大表示している画面はアドレスに保存するため、そのまま共有したり、ブラウザの「戻る」で元に戻したりできます。
 */
export function ShotBrowser({ mode, rows, sections, pages }: Props) {
  const shots = useMemo(() => fromShotRows(rows, pages, sections), [rows, pages, sections]);
  const search = useLocationSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  // 絞り込みの条件だけを取り出す（拡大表示の画面が変わっても、一覧は描き直さない）
  const conditions = conditionsOf(params);
  // 一覧（多くのカード）は、少し遅れて描き直す。押した条件のボタンはすぐに切り替わり、一覧はそのあとで入れ替わります
  const listConditions = useDeferredValue(conditions);
  const pending = listConditions !== conditions;

  const sectionById = useMemo(() => new Map(sections.map((s) => [s.id as string, s])), [sections]);
  const pageByKey = useMemo(() => new Map(pages.map((p) => [p.key, p])), [pages]);
  const bySlug = useMemo(() => new Map(shots.map((s) => [s.slug, s])), [shots]);
  const sectionIds = useMemo(() => (mode === "all" ? sections.map((s) => s.id) : null), [mode, sections]);

  // 探される文字（画面の説明・ページの名前・領域の名前・アドレス・画像の名前）は、最初に1回だけ作る
  const entries: Entry[] = useMemo(
    () =>
      shots.map((shot) => ({
        shot,
        haystack: buildHaystack([
          shot.caption,
          pageByKey.get(shot.pageKey)?.title,
          sectionById.get(shot.section)?.title,
          shot.path,
          shot.slug,
        ]),
      })),
    [shots, pageByKey, sectionById],
  );

  /** 帯のボタンと拡大表示に使う条件（すぐに切り替える） */
  const filters = useMemo(() => readFilters(new URLSearchParams(conditions), sectionIds), [conditions, sectionIds]);
  /** 一覧に使う条件（少し遅れて切り替える） */
  const listFilters = useMemo(() => readFilters(new URLSearchParams(listConditions), sectionIds), [listConditions, sectionIds]);

  // 絞り込み自体は軽いため、拡大表示の前後の移動には、いまの条件の結果をそのまま使う（描き直しが重いのは一覧のカード）
  const now = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const list = useMemo(() => applyFilters(entries, listFilters), [entries, listFilters]);
  const { visible, terms } = list;

  const groups = useMemo(() => groupShots(visible, sectionById, pageByKey), [visible, sectionById, pageByKey]);
  const eager = useMemo(() => new Set(flatten(groups).slice(0, EAGER_CARDS).map((s) => s.slug)), [groups]);
  const ordered = useMemo(() => flatten(groupShots(now.visible, sectionById, pageByKey)), [now, sectionById, pageByKey]);
  const allOrdered = useMemo(() => flatten(groupShots(shots, sectionById, pageByKey)), [shots, sectionById, pageByKey]);

  const activeFacets = countActiveFacets(filters);
  const barHasFilter = activeFacets > 0 || now.terms.length > 0;
  const listHasFilter = countActiveFacets(listFilters) > 0 || terms.length > 0;

  // 拡大表示：表示中の一覧にあればその中で、絞り込みで外れている画面（共有されたアドレスなど）なら、すべての画面の中で前後に移動する。
  // すべての画面の中で移動し始めたら、閉じるまではそのまま（一覧にある画面に来ても、途中で数え方を変えない）
  const [wideSlug, setWideSlug] = useState<string | null>(null);
  const viewerSlug = params.get("shot");
  const viewer = useMemo(() => {
    const shot = viewerSlug ? bySlug.get(viewerSlug) : undefined;
    if (!shot) return null;
    const index = viewerSlug === wideSlug ? -1 : ordered.indexOf(shot);
    if (index >= 0) return { list: ordered, index, wide: false };
    return { list: allOrdered, index: allOrdered.indexOf(shot), wide: true };
  }, [viewerSlug, wideSlug, bySlug, ordered, allOrdered]);
  const openSlug = viewer ? viewer.list[viewer.index].slug : null;
  const viewerWide = viewer?.wide ?? false;

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  /** 条件を変えたとき、一覧の途中まで下にスクロールしていたら、結果の先頭を表示する */
  const revealResults = useCallback(() => {
    const results = resultsRef.current;
    const bar = barRef.current;
    if (!results || !bar) return;
    const gap = results.getBoundingClientRect().top - bar.getBoundingClientRect().bottom;
    if (gap < 0) window.scrollBy({ top: gap, behavior: "auto" });
  }, []);

  // ---------- 言葉で探す（入力中の言葉は、少し待ってからアドレスに書く） ----------

  const [draft, setDraft] = useState<string | null>(null);
  const queryInput = draft ?? filters.q;
  const queryTimer = useRef<number | undefined>(undefined);
  /** 入力したあと、まだアドレスに書いていない言葉（待っている間だけ） */
  const pendingQuery = useRef<string | null>(null);

  const writeQuery = useCallback(
    (value: string, { reveal = true }: { reveal?: boolean } = {}) => {
      window.clearTimeout(queryTimer.current);
      pendingQuery.current = null;
      const params = currentParams();
      const before = params.get("q") ?? "";
      if (value.trim()) params.set("q", value);
      else params.delete("q");
      if ((params.get("q") ?? "") !== before) {
        writeSearch(orderParams(params));
        if (reveal) revealResults();
      }
      setDraft(null);
    },
    [revealResults],
  );

  const onQueryInput = useCallback(
    (value: string, composing: boolean) => {
      setDraft(value);
      window.clearTimeout(queryTimer.current);
      // かな漢字の変換中は、確定するまで待つ
      if (composing) return;
      pendingQuery.current = value;
      queryTimer.current = window.setTimeout(() => writeQuery(value), QUERY_DELAY);
    },
    [writeQuery],
  );

  useEffect(() => () => window.clearTimeout(queryTimer.current), []);

  const onQueryCommit = useCallback(() => writeQuery(queryInput), [writeQuery, queryInput]);
  const onQueryClear = useCallback(() => writeQuery(""), [writeQuery]);

  const onFacetChange = useCallback(
    (facet: Facet, value: string) => {
      const params = currentParams();
      if (value) params.set(facet, value);
      else params.delete(facet);
      writeSearch(orderParams(params));
      revealResults();
    },
    [revealResults],
  );

  const clearAll = useCallback(() => {
    window.clearTimeout(queryTimer.current);
    pendingQuery.current = null;
    const params = currentParams();
    for (const key of FILTER_KEYS) params.delete(key);
    writeSearch(orderParams(params));
    setDraft(null);
    revealResults();
  }, [revealResults]);

  // ---------- ページの一覧（目次）から、絞り込みで隠れているページへ移動したとき ----------
  // 条件を解除して、そのページを表示してから移動する（一覧が入れ替わったあとでスクロールする）

  const pendingAnchor = useRef<string | null>(null);

  useEffect(() => {
    if (mode !== "section") return;
    const anchors = new Set(pages.map((p) => `p-${p.no}`));
    const reveal = (id: string) => {
      if (!anchors.has(id) || document.getElementById(id)) return;
      pendingAnchor.current = id;
      clearAll();
    };
    // 目次のリンクを押したとき（同じリンクをもう一度押して、アドレスの # が変わらない場合も含む）
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (link) reveal(decodeURIComponent(link.hash.slice(1)));
    };
    // アドレスの # を直接変えたとき・ブラウザの「戻る」「進む」
    const onHashChange = () => reveal(decodeURIComponent(window.location.hash.slice(1)));
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [mode, pages, clearAll]);

  useEffect(() => {
    const id = pendingAnchor.current;
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    pendingAnchor.current = null;
    target.scrollIntoView();
  }, [groups]);

  // ---------- 拡大表示 ----------

  const openShot = useCallback(
    (shot: Shot) => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // 入力したばかりの言葉は、先に今の履歴に書いておく（閉じて「戻る」で戻ったときに、言葉が消えないように）
      if (pendingQuery.current !== null) writeQuery(pendingQuery.current, { reveal: false });
      setWideSlug(null);
      const params = currentParams();
      params.set("shot", shot.slug);
      // 開くときは履歴を積む（ブラウザの「戻る」で閉じられるように）
      writeSearch(orderParams(params), { push: true });
    },
    [writeQuery],
  );

  const showShot = useCallback(
    (shot: Shot) => {
      setWideSlug(viewerWide ? shot.slug : null);
      const params = currentParams();
      params.set("shot", shot.slug);
      writeSearch(orderParams(params));
    },
    [viewerWide],
  );

  const onViewerClosed = useCallback(() => {
    setWideSlug(null);
    const params = currentParams();
    if (!params.has("shot")) return;
    // 開いたときに積んだ履歴なら「戻る」で閉じる（ブラウザの「進む」で、もう一度開けるように）
    if (isViewerEntry()) {
      window.history.back();
      return;
    }
    params.delete("shot");
    writeSearch(orderParams(params));
  }, []);

  // 閉じたら、最後に表示していた画面のカードにフォーカスを戻す（見えていなければ、そこまでスクロールする）
  const lastOpenSlug = useRef<string | null>(null);
  useEffect(() => {
    const previous = lastOpenSlug.current;
    lastOpenSlug.current = openSlug;
    if (!previous || openSlug) return;
    const card = rootRef.current?.querySelector<HTMLElement>(`[data-shot="${CSS.escape(previous)}"]`);
    const opener = openerRef.current?.isConnected ? openerRef.current : null;
    const target = card ?? opener ?? summaryRef.current;
    if (!target) return;
    target.focus({ preventScroll: true });
    const rect = target.getBoundingClientRect();
    const barBottom = barRef.current?.getBoundingClientRect().bottom ?? 0;
    if (rect.top < barBottom || rect.bottom > window.innerHeight) target.scrollIntoView({ block: "center" });
  }, [openSlug]);

  // ---------- 固定した絞り込みの帯の高さ（ページ内のリンクで移動したとき、見出しが帯に隠れないように） ----------

  useLayoutEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;
    const update = () => root.style.setProperty("--gallery-bar-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // ---------- 印刷するときは、まだ読み込んでいない縮小画像も読み込む ----------

  useEffect(() => {
    const onBeforePrint = () => {
      rootRef.current?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = "eager";
      });
    };
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

  const total = shots.length;

  return (
    <div className={styles.browser} ref={rootRef} data-mode={mode}>
      <FilterBar
        mode={mode}
        filters={filters}
        counts={now.counts}
        sections={sections}
        queryInput={queryInput}
        activeFacets={activeFacets}
        hasFilter={barHasFilter}
        visibleCount={now.visible.length}
        onQueryInput={onQueryInput}
        onQueryCommit={onQueryCommit}
        onQueryClear={onQueryClear}
        onFacetChange={onFacetChange}
        onClearAll={clearAll}
        barRef={barRef}
      />

      <div className={`container ${styles.results}`} ref={resultsRef} data-pending={pending || undefined} aria-busy={pending || undefined}>
        <div className={styles.summaryRow}>
          <p className={styles.summary} role="status" ref={summaryRef} tabIndex={-1}>
            {terms.length > 0 && <span className={styles.summaryQuery}>「{listFilters.q.trim()}」を含む画面：</span>}
            {listHasFilter ? (
              <>
                {total}枚中 <strong className={styles.summaryCount}>{visible.length}</strong>枚を表示しています
              </>
            ) : (
              <>
                <strong className={styles.summaryCount}>{total}</strong>枚すべてを表示しています
              </>
            )}
          </p>
          {listHasFilter && visible.length > 0 && (
            <button type="button" className={`btn btn-ghost btn-sm ${styles.clearAll}`} onClick={clearAll}>
              <RotateCcw aria-hidden />
              条件をすべて解除
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <div className={styles.empty}>
            <SearchX aria-hidden className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>条件に合う画面がありません</p>
            <p className={styles.emptyText}>言葉を変えるか、絞り込みの条件を解除してください。</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>
              <RotateCcw aria-hidden />
              条件をすべて解除
            </button>
          </div>
        ) : mode === "all" ? (
          groups.map((group) => <SectionBlock key={group.section.id} group={group} onOpen={openShot} eager={eager} />)
        ) : (
          groups.flatMap((group) =>
            group.pages.map((pageGroup) => (
              <PageBlock key={pageGroup.page.key} group={pageGroup} level="h2" anchor onOpen={openShot} eager={eager} />
            )),
          )
        )}
      </div>

      {viewer && (
        <Lightbox
          list={viewer.list}
          index={viewer.index}
          sections={sectionById}
          pages={pageByKey}
          onNavigate={showShot}
          onClosed={onViewerClosed}
        />
      )}
    </div>
  );
}

type BlockProps = { onOpen: (shot: Shot) => void; eager: ReadonlySet<string> };

/** 領域のまとまり（すべての画面のページ） */
const SectionBlock = memo(function SectionBlock({ group, onOpen, eager }: BlockProps & { group: SectionGroup }) {
  const { section } = group;
  const titleId = `s-${section.id}-title`;
  return (
    <section className={styles.section} id={`s-${section.id}`} aria-labelledby={titleId}>
      <header className={styles.sectionHead}>
        <div className={styles.sectionText}>
          <p className={`eyebrow ${styles.sectionEn}`}>{section.en}</p>
          <h2 id={titleId} className={styles.sectionTitle}>
            <span className={styles.sectionNo}>{section.no}</span> <span>{section.title}</span>
          </h2>
          <p className={styles.sectionLead}>{section.lead}</p>
        </div>
        <div className={styles.sectionAside}>
          <p className={styles.sectionCount}>
            <span className={styles.sectionCountNum}>{group.count}</span>枚
          </p>
          <Link href={section.href} className={styles.sectionLink}>
            この領域のページへ
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </header>
      {group.pages.map((pageGroup) => (
        <PageBlock key={pageGroup.page.key} group={pageGroup} level="h3" onOpen={onOpen} eager={eager} />
      ))}
    </section>
  );
});

/** ページのまとまり（見出し・アドレス・数と、PC・スマートフォンの列） */
const PageBlock = memo(function PageBlock({
  group,
  level,
  anchor = false,
  onOpen,
  eager,
}: BlockProps & { group: PageGroup; level: "h2" | "h3"; anchor?: boolean }) {
  const { page, pc, sp } = group;
  const Heading = level;
  const both = pc.length > 0 && sp.length > 0;
  // 描く前の高さの見積もりに使う（shot-browser.module.css の .page）
  const estimate = { "--pc": pc.length, "--sp": sp.length, "--both": both ? 1 : 0 } as CSSProperties;
  return (
    <section className={styles.page} id={anchor ? `p-${page.no}` : undefined} data-level={level} style={estimate}>
      <header className={styles.pageHead}>
        <Heading className={styles.pageTitle}>
          <span className={styles.pageNo}>{page.no}</span> <span className={styles.pageName}>{page.title}</span>
        </Heading>
        <p className={styles.pageMeta}>
          {page.path && <code className={styles.path}>{page.path}</code>}
          <span className={styles.pageCount}>{pc.length + sp.length}枚</span>
        </p>
      </header>
      {pc.length > 0 && <Lane device="pc" shots={pc} labelled={both} onOpen={onOpen} eager={eager} />}
      {sp.length > 0 && <Lane device="sp" shots={sp} labelled={both} onOpen={onOpen} eager={eager} />}
    </section>
  );
});

/** 端末ごとの列（PC は横長、スマートフォンは縦長のカードを、それぞれの幅で並べる） */
function Lane({ device, shots, labelled, onOpen, eager }: BlockProps & { device: Device; shots: Shot[]; labelled: boolean }) {
  const Icon = device === "pc" ? Monitor : Smartphone;
  return (
    <div className={styles.lane} data-device={device}>
      {labelled && (
        <p className={styles.laneLabel}>
          <Icon aria-hidden />
          {DEVICE_LABEL[device]}
          <span className={styles.laneCount}>{shots.length}枚</span>
        </p>
      )}
      <ul className={styles.grid} data-device={device} role="list">
        {shots.map((shot) => (
          <li key={shot.slug} className={styles.cell}>
            <Card shot={shot} onOpen={onOpen} eager={eager.has(shot.slug)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
