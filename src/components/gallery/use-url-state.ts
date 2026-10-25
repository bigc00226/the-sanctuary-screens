"use client";

/*
 * 絞り込みの条件と、拡大表示している画面を、アドレスの「?」以降（例：?device=sp&q=予約&shot=…）に保存します。
 * アドレスをそのまま共有すると、同じ条件の一覧（・同じ画面の拡大表示）が開きます。
 *
 * ・読むとき：useSyncExternalStore で window.location.search を読みます。サーバーで描くときは ""（条件なし）として描き、
 *   ブラウザで表示したあとに、アドレスの条件に切り替わります（useSearchParams を使うと、ページ全体が
 *   ブラウザで描くまで表示されなくなるため使いません）。
 * ・書くとき：history.replaceState / pushState で書き換えます（ページは移動しません）。Next.js はこの2つを
 *   ルーターに取り込むため、Next.js の内部の情報（history.state の __NA など）は渡さず、このサイトの目印だけを渡します。
 */
import { useSyncExternalStore } from "react";

/** 自分でアドレスを書き換えたことを知らせる合図（popstate は、自分で書き換えたときには起きないため） */
const CHANGE_EVENT = "sanctuary:locationchange";

/** 拡大表示を開いたときに積んだ履歴の目印（history.state に入れる）。閉じるときに「戻る」でよいかの判断に使う */
const VIEWER_ENTRY = "sanctuaryViewer";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  return window.location.search;
}

function getServerSnapshot() {
  return "";
}

/** いまのアドレスの「?」以降（例：「?device=pc」）。サーバーで描くときと、ブラウザで最初に描くときは "" */
export function useLocationSearch(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** いまの履歴が、拡大表示を開いたときに積んだものかどうか */
export function isViewerEntry(): boolean {
  const state: unknown = window.history.state;
  return typeof state === "object" && state !== null && (state as Record<string, unknown>)[VIEWER_ENTRY] === true;
}

type WriteOptions = {
  /** true：履歴を1つ積む（ブラウザの「戻る」で元に戻る）。false：いまの履歴を書き換える */
  push?: boolean;
};

/**
 * アドレスの「?」以降を書き換える。
 * 拡大表示の目印は、履歴を積むときに付け、書き換えるときは今の履歴の目印をそのまま引き継ぎます。
 */
export function writeSearch(params: URLSearchParams, { push = false }: WriteOptions = {}): void {
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  const mark = push || isViewerEntry();
  const state = mark ? { [VIEWER_ENTRY]: true } : null;
  if (push) window.history.pushState(state, "", url);
  else window.history.replaceState(state, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** いまのアドレスの「?」以降を、書き換えのために取り出す（ほかの項目はそのまま残す） */
export function currentParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
