"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./chapter-nav.module.css";

export type ChapterNavItem = {
  /** 章の id（ページの中の位置は #c-{id}） */
  id: string;
  /** 章の番号（01〜） */
  no: string;
  title: string;
  /** 章の画面の数 */
  count: number;
};

/**
 * 帯の右の端をうすくしている幅（36px。chapter-nav.module.css の mask-image）のうち、項目の左右の余白（14px）で足りない分。
 * chapter-nav.module.css の scroll-margin-inline-end と .list::after の幅も、同じ 24px です
 */
const FADE_END = 24;

/** 帯の中だけを横にスクロールして、項目を帯の中央に見せる（ページは動かさない。帯が入りきるときは何もしない） */
function centerInList(list: HTMLElement, link: HTMLElement) {
  if (list.scrollWidth <= list.clientWidth) return;
  const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  list.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
}

/**
 * 章の一覧（サイトの上部のすぐ下に固定する帯）。押すと、その章へ移動します。
 * 画面の上の方に見えている章を、IntersectionObserver で調べて目立たせます。
 * スマートフォンでは、帯の中を横にスクロールできます（ページ全体は横にはみ出しません）。
 */
export function ChapterNav({ items }: { items: ChapterNavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // 今の章：帯のすぐ下から、画面の高さの 45% までの範囲に入っている章のうち、いちばん前のもの
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const targets = items
      .map((item) => document.getElementById(`c-${item.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // 章へ移動したときの位置（帯のすぐ下）より少し下から数える
    // （ひとつ前の章の終わりを、今の章と見なさないように）
    const stuckTop = Number.parseFloat(getComputedStyle(nav).top) || 0;
    const top = Math.ceil(stuckTop + nav.offsetHeight + 24);
    const inView = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.slice("c-".length);
          if (entry.isIntersecting) inView.add(id);
          else inView.delete(id);
        }
        setActive(items.find((item) => inView.has(item.id))?.id ?? null);
      },
      { rootMargin: `-${top}px 0px -55% 0px` },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [items]);

  // スマートフォン：今の章が帯の中で見えるように、帯だけを横にスクロールする（今の章がない、ページの最初では、帯の始めに戻す）
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const link = active ? list.querySelector<HTMLElement>(`[data-chapter="${active}"]`) : null;
    if (link) centerInList(list, link);
    else if (list.scrollLeft > 0) list.scrollTo({ left: 0, behavior: "auto" });
  }, [active]);

  return (
    <nav ref={navRef} className={styles.nav} aria-label="主な画面の章">
      <div className={styles.inner}>
        <ol ref={listRef} className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <a
                href={`#c-${item.id}`}
                className={styles.link}
                data-chapter={item.id}
                aria-current={active === item.id ? "true" : undefined}
                onClick={(event) => {
                  // 新しいタブ・ウィンドウで開くとき（Ctrl・⌘・Shift を押しながら・中ボタン）は、このページは動かない
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  setActive(item.id);
                }}
                onFocus={(event) => {
                  // キーボードで選んだ項目が帯の端で切れているときは、帯の中央に見せる
                  // （ブラウザは、一部が見えている項目を、帯の中で動かして見せてくれないため）
                  const list = listRef.current;
                  if (!list) return;
                  const box = list.getBoundingClientRect();
                  const rect = event.currentTarget.getBoundingClientRect();
                  if (rect.left < box.left || rect.right > box.right - FADE_END) centerInList(list, event.currentTarget);
                }}
              >
                <span className={styles.no} aria-hidden>
                  {item.no}
                </span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.count}>{item.count}枚</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
