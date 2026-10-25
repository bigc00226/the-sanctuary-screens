import type { ReactNode } from "react";
import styles from "./device-frame.module.css";

type Props = {
  device: "pc" | "sp";
  /** PC のアドレスバーに表示する文字（例：the-sanctuary.jp/mypage）。省略するとアドレスバーを出しません */
  address?: string;
  /** 影を強めに（トップページの大きな見本など） */
  elevated?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * 画面の画像を、ブラウザの窓（PC）・スマートフォンの形の枠に入れて表示します。
 * 開いたときに見える範囲（最初の画面）の画像に使ってください（ページ全体・画面の一部には使いません）。
 */
export function DeviceFrame({ device, address, elevated = false, className, children }: Props) {
  if (device === "sp") {
    return (
      <div className={[styles.phone, elevated && styles.elevated, className].filter(Boolean).join(" ")}>
        <div className={styles.phoneScreen}>{children}</div>
      </div>
    );
  }
  return (
    <div className={[styles.browser, elevated && styles.elevated, className].filter(Boolean).join(" ")}>
      <div className={styles.toolbar} aria-hidden>
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        {address && <span className={styles.address}>{address}</span>}
      </div>
      <div className={styles.browserScreen}>{children}</div>
    </div>
  );
}

/** 画面のアドレスを、アドレスバー用の文字にする（例：/mypage → the-sanctuary.jp/mypage） */
export function addressOf(path: string, host = "the-sanctuary.jp"): string {
  if (!path.startsWith("/")) return path;
  return `${host}${path === "/" ? "" : path}`;
}
