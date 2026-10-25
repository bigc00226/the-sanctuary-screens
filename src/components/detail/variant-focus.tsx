"use client";

import { useEffect } from "react";

/**
 * 切り替えを押して移動している途中の、行き先のアドレス（ページを移動しても、この値は残ります）。
 * 移動した先のページで、同じ切り替えにピントを戻すために使います。
 */
let pendingHref: string | null = null;

type Props = {
  /** 切り替えの一覧（nav）の id */
  navId: string;
};

/**
 * 同じ画面のほかの撮影への切り替え（VariantTabs）を押して移動したあと、ピントを今の切り替えに戻します
 * （キーボードで操作する方が、ページの最初から操作し直さなくてよいように）。画面には何も表示しません。
 */
export function VariantFocus({ navId }: Props) {
  useEffect(() => {
    const nav = document.getElementById(navId);
    if (!nav) return;

    const current = nav.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    if (pendingHref !== null) {
      if (current && current.pathname === pendingHref) current.focus({ preventScroll: true });
      pendingHref = null;
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || !nav.contains(link) || link.getAttribute("aria-current") === "page") return;
      pendingHref = link.pathname;
    };
    nav.addEventListener("click", onClick);
    return () => nav.removeEventListener("click", onClick);
  }, [navId]);

  return null;
}
