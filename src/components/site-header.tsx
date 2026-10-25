"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { EmblemMark } from "./emblem";
import styles from "./site-header.module.css";

export type NavSection = { id: string; no: string; title: string; en: string; count: number };

/** サイトの上部（ロゴ・メニュー）。スマートフォンでは「≡」から開くメニューにまとめます */
export function SiteHeader({ sections, total, highlights }: { sections: NavSection[]; total: number; highlights: number }) {
  const pathname = usePathname();
  // 領域のメニューは、開いたときのページでだけ開いた状態にする（ページを移動すると自然に閉じる）
  const [openOn, setOpenOn] = useState<string | null>(null);
  const sectionsOpen = openOn === pathname;
  const setSectionsOpen = (open: boolean) => setOpenOn(open ? pathname : null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  // ページを移動したら、スマートフォンのメニューを閉じる
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // 領域のメニュー：外側を押す・Esc で閉じる
  useEffect(() => {
    if (!sectionsOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [sectionsOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const inSection = sections.some((s) => isActive(`/screens/${s.id}`));

  return (
    <header className={styles.header}>
      <div className={`container-wide ${styles.bar}`}>
        {/* リンクの名前は、見えている文字（THE SANCTUARY 画面一覧）に「トップへ」を添えたもの */}
        <Link href="/" className={styles.brand}>
          <EmblemMark className={styles.mark} />
          <span className={styles.wordmark}>
            <span className={styles.product}>THE SANCTUARY</span>{" "}
            <span className={styles.label}>画面一覧</span>
          </span>
          <span className="visually-hidden">（トップへ）</span>
        </Link>

        <nav className={styles.nav} aria-label="サイトのメニュー">
          <Link href="/tour" className={styles.navLink} aria-current={isActive("/tour") ? "page" : undefined}>
            主な画面
          </Link>
          <div className={styles.popoverWrap} ref={popoverRef}>
            <button
              type="button"
              className={styles.navLink}
              aria-expanded={sectionsOpen}
              aria-controls={popoverId}
              data-active={inSection || undefined}
              onClick={() => setSectionsOpen(!sectionsOpen)}
            >
              領域ごとに見る
              <ChevronDown aria-hidden className={styles.chevron} data-open={sectionsOpen || undefined} />
            </button>
            <div id={popoverId} className={styles.popover} hidden={!sectionsOpen}>
              <ul className={styles.sectionList}>
                {sections.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/screens/${s.id}`}
                      className={styles.sectionLink}
                      aria-current={isActive(`/screens/${s.id}`) ? "page" : undefined}
                      onClick={() => setSectionsOpen(false)}
                    >
                      <span className={styles.sectionNo}>{s.no}</span>
                      <span className={styles.sectionText}>
                        <span className={styles.sectionTitle}>{s.title}</span>
                        <span className={styles.sectionEn}>{s.en}</span>
                      </span>
                      <span className={styles.sectionCount}>{s.count}枚</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/screens" className="btn btn-noir btn-sm" aria-current={pathname === "/screens" ? "page" : undefined}>
            すべての画面<span className={styles.count}>{total}</span>
          </Link>
        </nav>

        <button type="button" className={styles.menuButton} aria-label="メニューを開く" aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
          <Menu aria-hidden />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.sheet}
        aria-label="メニュー"
        onClick={(e) => {
          // 背景（メニューの外側）を押したら閉じる
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className={styles.sheetInner}>
          <div className={styles.sheetHead}>
            <span className={styles.sheetTitle}>メニュー</span>
            <button type="button" className={styles.closeButton} aria-label="メニューを閉じる" onClick={() => dialogRef.current?.close()}>
              <X aria-hidden />
            </button>
          </div>
          <nav aria-label="サイトのメニュー（スマートフォン）">
            <ul className={styles.sheetList}>
              <li>
                <Link href="/" className={styles.sheetLink} aria-current={isActive("/") ? "page" : undefined}>
                  トップ
                </Link>
              </li>
              <li>
                <Link href="/tour" className={styles.sheetLink} aria-current={isActive("/tour") ? "page" : undefined}>
                  主な画面<span className={styles.sheetCount}>{highlights}枚</span>
                </Link>
              </li>
              <li>
                <Link href="/screens" className={styles.sheetLink} aria-current={pathname === "/screens" ? "page" : undefined}>
                  すべての画面<span className={styles.sheetCount}>{total}枚</span>
                </Link>
              </li>
            </ul>
            <p className={styles.sheetGroup}>領域ごとに見る</p>
            <ul className={styles.sheetList}>
              {sections.map((s) => (
                <li key={s.id}>
                  <Link href={`/screens/${s.id}`} className={styles.sheetLink} aria-current={isActive(`/screens/${s.id}`) ? "page" : undefined}>
                    <span className={styles.sectionNo}>{s.no}</span>
                    {s.title}
                    <span className={styles.sheetCount}>{s.count}枚</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
