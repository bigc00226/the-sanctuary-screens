import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DeviceFrame, addressOf } from "@/components/device-frame";
import { ShotImage } from "@/components/shot-image";
import type { Shot } from "@/lib/shots";
import styles from "./tour-item.module.css";

export type TourItemData = {
  /** 主な画面の中での番号（1〜18） */
  no: number;
  title: string;
  description: string;
  shot: Shot;
  /** 同じページのほかの画面（ほかの画面がないページは、領域のページ）へのリンク */
  more: { label: string; href: string };
};

type Props = {
  item: TourItemData;
  /** PC で画像を置く側（左右を交互に） */
  side: "left" | "right";
  /** ページを開いてすぐに見える画像（1枚目）は true */
  preload?: boolean;
  /** スクロールに合わせて表示する（最初に見える位置の1枚目は false） */
  reveal?: boolean;
};

/**
 * 画像の表示の幅（tour-item.module.css の列の幅に合わせる）
 * ・1280px 以上：本文の幅 1,200px から列の間を除いた 7/12 ＝ 約 660px
 * ・1024〜1279px：画面の幅の約 52%
 * ・それより狭い画面：左右の余白を除いた幅
 */
const SIZES = "(min-width: 1280px) 660px, (min-width: 1024px) 52vw, calc(100vw - 32px)";

/**
 * 見出しを、表示のために3つに分ける（読み上げ・コピーでは、元の見出しのまま）
 * ・「：」より前：見出しの上に小さく（例：「管理画面：売上」の「管理画面」）
 * ・最後の（…）：見出しの下に補足として（例：「入会のお申し込み（3つの手順の入力フォーム）」）
 */
function splitTitle(title: string): { kicker?: string; main: string; note?: string } {
  const noteMatch = /^(.+?)（([^（）]+)）$/.exec(title);
  const rest = noteMatch ? noteMatch[1] : title;
  const note = noteMatch ? noteMatch[2] : undefined;
  const kickerMatch = /^([^：]+)：(.+)$/.exec(rest);
  return kickerMatch ? { kicker: kickerMatch[1], main: kickerMatch[2], note } : { main: rest, note };
}

/** 主な画面の1枚（番号・見出し・画像・説明・リンク）。PC では画像と文章を左右に並べます */
export function TourItem({ item, side, preload = false, reveal = true }: Props) {
  const { no, title, description, shot, more } = item;
  const id = `h-${no}`;
  const { kicker, main, note } = splitTitle(title);

  return (
    <article id={id} className={styles.item} data-side={side} data-reveal={reveal || undefined} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <p className={styles.no} aria-hidden>
          <span className="gold-text">{String(no).padStart(2, "0")}</span>
        </p>
        <h3 id={`${id}-title`} className={styles.title}>
          {kicker && (
            <span className={styles.kicker}>
              {kicker}
              <span className="visually-hidden">：</span>
            </span>
          )}
          {main}
          {note && (
            <span className={styles.note}>
              <span className="visually-hidden">（</span>
              {note}
              <span className="visually-hidden">）</span>
            </span>
          )}
        </h3>
      </div>

      <div className={styles.media}>
        {/* リンクの名前は画像の説明（alt）から付く（aria-label を使うと、見えている文字と名前が食い違うため） */}
        <Link href={shot.href} prefetch={false} className={styles.mediaLink}>
          <DeviceFrame device="pc" address={addressOf(shot.path)} className={styles.frame}>
            <ShotImage shot={shot} sizes={SIZES} fit="fill" preload={preload} alt={`${title}のくわしいページ`} />
          </DeviceFrame>
        </Link>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>{description}</p>
        <ul className={styles.links}>
          <li>
            <Link href={shot.href} prefetch={false} className={styles.link}>
              <span>
                この画面のくわしいページ
                <span className="visually-hidden">（{title}）</span>
              </span>
              <ArrowRight aria-hidden className={styles.arrow} />
            </Link>
          </li>
          <li>
            <Link href={more.href} prefetch={false} className={styles.link}>
              <span>{more.label}</span>
              <ArrowRight aria-hidden className={styles.arrow} />
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}
