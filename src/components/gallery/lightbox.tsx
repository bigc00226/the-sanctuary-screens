"use client";

import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, type PointerEvent } from "react";
import { ShotImage } from "@/components/shot-image";
import { CAPTURE_LABEL, DEVICE_LABEL, cssHeightOf, cssWidthOf, type Device, type Shot } from "@/lib/shots";
import type { PageMeta, SectionMeta } from "./types";
import styles from "./lightbox.module.css";

/** shot-image.tsx と同じ値：これより縦に長い画像は変換せず、元の PNG のまま配信する（先読みの URL をそろえるため） */
const MAX_OPTIMIZED_HEIGHT = 16000;
/** ページ全体（PC）を表示する幅の上限。文字が読める大きさを保ちつつ、上下にスクロールして見る */
const FULL_PC_MAX_WIDTH = 1000;
/**
 * 撮影した端末の画面の高さ（CSS の px）。これより縦に長い「画面の一部」は、画面に収めると文字が読めないほど小さくなるため、
 * ページ全体と同じく、読める幅のまま上下にスクロールして表示する
 */
const SCREEN_HEIGHT: Record<Device, number> = { pc: 900, sp: 844 };
/** 横に指を動かしたとみなす距離（px） */
const SWIPE_DISTANCE = 48;

type Props = {
  /** 前後に移動する画面の一覧（いま表示している一覧の順） */
  list: Shot[];
  index: number;
  sections: ReadonlyMap<string, SectionMeta>;
  pages: ReadonlyMap<string, PageMeta>;
  /** 前後の画面へ移動する */
  onNavigate: (shot: Shot) => void;
  /** 閉じたあと（Esc・閉じるボタン・背景を押したとき）。アドレスを元に戻すために使う */
  onClosed: () => void;
};

/** 上下にスクロールして見る画像（ページ全体と、縦に長い画面の一部） */
function isScrollable(shot: Shot): boolean {
  return shot.capture === "full" || cssHeightOf(shot) > SCREEN_HEIGHT[shot.device];
}

/** スクロールして見る画像を表示する幅（PC は上限まで、スマートフォンは撮影したときの幅） */
function readableWidthOf(shot: Shot): number {
  const width = cssWidthOf(shot);
  return shot.device === "pc" ? Math.min(width, FULL_PC_MAX_WIDTH) : width;
}

/** 表示する幅（img の sizes）。画面の幅と、撮影したときの幅のうち小さいほう */
function sizesFor(shot: Shot): string {
  const width = cssWidthOf(shot);
  if (isScrollable(shot)) return `min(${readableWidthOf(shot)}px, 100vw)`;
  // 横長の画面は、高さに合わせて縮むため、画面の高さからも上限を見積もる
  const ratio = (shot.width / shot.height).toFixed(4);
  return `min(${width}px, 100vw, calc((100vh - 180px) * ${ratio}))`;
}

/** 前後の画面の画像を先に読み込んでおく（表示するときと同じ URL になるよう、next/image の getImageProps を使う） */
function preloadShot(shot: Shot) {
  const { props } = getImageProps({
    src: shot.src,
    width: shot.width,
    height: shot.height,
    alt: "",
    sizes: sizesFor(shot),
    quality: 90,
    unoptimized: shot.height > MAX_OPTIMIZED_HEIGHT,
  });
  const image = new window.Image();
  image.decoding = "async";
  if (props.sizes) image.sizes = props.sizes;
  if (props.srcSet) image.srcset = props.srcSet;
  image.src = props.src;
  const thumb = new window.Image();
  thumb.src = shot.thumb.src;
}

/**
 * 画面の拡大表示（<dialog> を showModal で開く）。
 * ← → キー・ボタン・左右に指を動かす操作で前後の画面へ、Esc・閉じるボタン・画像の外側を押すと閉じます。
 */
export function Lightbox({ list, index, sections, pages, onNavigate, onClosed }: Props) {
  const shot = list[index];
  const prev = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;
  const section = sections.get(shot.section);
  const page = pages.get(shot.pageKey);
  const scrollable = isScrollable(shot);
  const isFull = shot.capture === "full";
  const width = cssWidthOf(shot);
  const height = cssHeightOf(shot);

  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  // 開く（マウントしたとき）。閉じるときは、この部品ごと取り除きます（アドレスから shot が消えたとき）
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  // 画面が変わったら、ページ全体の表示を上に戻す
  useLayoutEffect(() => {
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }, [shot.slug]);

  // 大きな画像の読み込みが終わるまで、「読み込んでいます」を表示する（縮小画像は先に表示されている）
  useEffect(() => {
    const stage = stageRef.current;
    const image = stage?.querySelector("img");
    if (!stage || !image || (image.complete && image.naturalWidth > 0)) return;
    stage.dataset.loading = "";
    const done = () => {
      delete stage.dataset.loading;
    };
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
    return () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      done();
    };
  }, [shot.slug]);

  // 前後の画面を先に読み込む
  useEffect(() => {
    if (prev) preloadShot(prev);
    if (next) preloadShot(next);
  }, [prev, next]);

  const goTo = (target: Shot | null | undefined) => {
    if (target && target !== shot) onNavigate(target);
  };

  const close = () => dialogRef.current?.close();

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    // 閉じたあと（アドレスが元に戻るまでの間）は何もしない
    if (!dialogRef.current?.open) return;
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    // 縦に長い画像を見ている間（画像の場所にフォーカスがあるとき）は、Home・End でいちばん上・下へスクロールする（ブラウザの標準の動き）
    const scrolling = scrollable && target === stageRef.current;
    if (e.key === "ArrowLeft") goTo(prev);
    else if (e.key === "ArrowRight") goTo(next);
    else if (e.key === "Home" && !scrolling) goTo(list[0]);
    else if (e.key === "End" && !scrolling) goTo(list[list.length - 1]);
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  // 左右に指を動かす操作（縦のスクロールは妨げない。縦に動かしたときはブラウザが pointercancel を送る）
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipedRef.current = false;
    swipeRef.current = e.pointerType === "mouse" ? null : { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    swipedRef.current = true;
    goTo(dx < 0 ? next : prev);
  };

  const position = `${list.length}枚中 ${index + 1}枚目`;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClosed}
      data-device={shot.device}
      data-capture={shot.capture}
    >
      <div className={styles.frame}>
        <div className={styles.topBg} aria-hidden />
        <div className={styles.bottomBg} aria-hidden />

        <div className={styles.meta}>
          <p className={styles.position}>
            <span aria-hidden>
              <span className={styles.positionNow}>{index + 1}</span>
              <span className={styles.positionSep}>/</span>
              <span className={styles.positionTotal}>{list.length}</span>
            </span>
            <span className="visually-hidden">{position}</span>
          </p>
          <span className={styles.tags}>
            <span className={styles.tag}>{DEVICE_LABEL[shot.device]}</span>
            <span className={`${styles.tag} ${styles.tagSolid}`}>{CAPTURE_LABEL[shot.capture]}</span>
          </span>
        </div>

        <div className={styles.info}>
          <h2 id={titleId} className={styles.title}>
            {shot.caption}
          </h2>
          <p className={styles.where}>
            {section && <span className={styles.whereItem}>{section.title}</span>}
            {page && <span className={styles.whereItem}>{page.title}</span>}
            <code className={styles.path}>{shot.path}</code>
          </p>
        </div>

        <div className={styles.actions}>
          <Link href={shot.href} prefetch={false} className={`btn btn-outline-light btn-sm ${styles.action}`}>
            詳しいページ
            <ArrowRight aria-hidden />
          </Link>
          <a href={shot.src} target="_blank" rel="noopener noreferrer" className={`btn btn-sm ${styles.action} ${styles.actionGhost}`}>
            元の画像
            <ExternalLink aria-hidden />
            <span className="visually-hidden">（新しいタブで開きます）</span>
          </a>
        </div>

        <button type="button" className={styles.close} aria-label="閉じる" onClick={close}>
          <X aria-hidden />
        </button>

        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          aria-disabled={!prev}
          onClick={() => goTo(prev)}
        >
          <ChevronLeft aria-hidden className={styles.navIcon} />
          <span className={styles.navLabel}>前の画面</span>
        </button>

        <div
          ref={stageRef}
          className={styles.stage}
          data-scroll={scrollable || undefined}
          tabIndex={scrollable ? 0 : -1}
          role={scrollable ? "region" : undefined}
          aria-label={scrollable ? `${isFull ? "ページ全体" : "縦に長い画面"}の画像（上下にスクロールできます）` : undefined}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
          onClick={(e) => {
            // 画像の外側（何もないところ）を押したら閉じる（左右に指を動かしたあとは閉じない）
            if (swipedRef.current) {
              swipedRef.current = false;
              return;
            }
            if (e.target === e.currentTarget && !scrollable) close();
          }}
        >
          {scrollable ? (
            <div className={styles.fullWrap}>
              <p className={styles.fullHint}>
                <ArrowDown aria-hidden />
                {isFull ? "ページ全体" : "縦に長い画面"}：スクロールすると下までご覧いただけます
              </p>
              <ShotImage
                key={shot.slug}
                shot={shot}
                sizes={sizesFor(shot)}
                loading="eager"
                fetchPriority="high"
                className={styles.image}
                style={{ maxWidth: readableWidthOf(shot) }}
              />
            </div>
          ) : (
            <ShotImage
              key={shot.slug}
              shot={shot}
              sizes={sizesFor(shot)}
              loading="eager"
              fetchPriority="high"
              className={styles.image}
              style={{ width: `min(${width}px, 100cqw, calc(100cqh * ${(width / height).toFixed(4)}))` }}
            />
          )}
        </div>

        <p className={styles.loading} aria-hidden>
          <span className={styles.loadingDot} />
          画像を読み込んでいます
        </p>

        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          aria-disabled={!next}
          onClick={() => goTo(next)}
        >
          <span className={styles.navLabel}>次の画面</span>
          <ChevronRight aria-hidden className={styles.navIcon} />
        </button>

        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {`${position}：${shot.caption}`}
        </p>
      </div>
    </dialog>
  );
}
