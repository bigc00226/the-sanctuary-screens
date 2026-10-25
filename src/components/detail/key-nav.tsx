"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 矢印キーを自分で使う部品（文字の入力欄・選択肢など）。この中では、矢印キーで画面を移動しません */
const KEEPS_ARROW_KEYS = [
  "input",
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="radiogroup"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="tablist"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="grid"]',
  '[role="tree"]',
].join(", ");

function keepsArrowKeys(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return target.closest(KEEPS_ARROW_KEYS) !== null;
}

type Props = {
  /** 前の画面の詳しいページ（最初の画面では省略） */
  prev?: string;
  /** 次の画面の詳しいページ（最後の画面では省略） */
  next?: string;
};

/**
 * ← → キーで、前後の画面の詳しいページへ移動します（画面には何も表示しません）。
 * 前後のページは先に読み込んでおき、すぐに切り替わるようにします。
 */
export function KeyNav({ prev, next }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (prev) router.prefetch(prev);
    if (next) router.prefetch(next);
  }, [router, prev, next]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const href = event.key === "ArrowLeft" ? prev : event.key === "ArrowRight" ? next : undefined;
      if (!href) return;
      if (keepsArrowKeys(event.target) || keepsArrowKeys(document.activeElement)) return;
      // メニューなどのダイアログが開いているときは、移動しない
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      router.push(href);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, prev, next]);

  return null;
}
