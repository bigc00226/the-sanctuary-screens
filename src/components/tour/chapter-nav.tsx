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

    // 章へ移動したときの位置（帯の下 ＋ 16px）より少し下から数える（ひとつ前の章の終わりを、今の章と見なさないように）
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

  // スマートフォン：今の章が帯の中で見えるように、帯だけを横にスクロールする（ページは動かさない）
  useEffect(() => {
    const list = listRef.current;
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const link = list.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    if (!link) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
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
                onClick={() => setActive(item.id)}
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
