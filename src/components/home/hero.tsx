import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { addressOf, DeviceFrame } from "@/components/ui/device-frame";
import { Emblem } from "@/components/ui/emblem";
import { ShotImage } from "@/components/shots/shot-image";
import { site } from "@/data/site";
import type { Shot } from "@/lib/shots";
import { Thumb } from "./thumb";
import styles from "./hero.module.css";

type Props = {
  /** PC の見本（ページを開いてすぐに見える大きな画像。先読みします） */
  pc: Shot;
  /** スマートフォンの見本（PC の手前に重ねます） */
  sp: Shot;
  total: number;
  highlights: number;
};

/** トップページの最初の帯（黒の地に、サイト名・説明・ボタンと、PC とスマートフォンの画面の見本） */
export function HomeHero({ pc, sp, total, highlights }: Props) {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.glow} aria-hidden />
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>{site.productSubtitle}</p>
          {/* 見出しの文字としては「THE SANCTUARY 完全会員制の…Web システム」（間の空白は、読み上げ・検索のため） */}
          <h1 id="home-title" className={styles.title}>
            <span className={`gold-text-light ${styles.wordmark}`}>{site.product}</span>{" "}
            <span className={styles.subtitle}>
              {/* 言葉の途中で改行しないように、まとまりごとに分ける（英字の前だけ空白を入れる） */}
              <span className={styles.phrase}>完全会員制の</span>
              <span className={styles.phrase}>オンラインヒーリングサロンの</span>{" "}
              <span className={styles.phrase}>Web システム</span>
            </span>
          </h1>
          {/* 日本語の文の間に空白が入らないように、文ごとに文字列で書く */}
          <p className={styles.lead}>
            {"入会のお申し込みと審査、お支払い、ご予約と事前決済、ブラウザだけで使えるビデオ通話のセッションまで。"}
            {"会員様のご利用がオンラインで完結する Web システムです。"}
            {`ヒーラー画面と管理画面を含む${total}枚の画面を、PC とスマートフォンで収録しています。`}
          </p>
          <div className={styles.actions}>
            <Link href="/tour" className="btn btn-gold btn-lg">
              主な画面（{highlights}枚）
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/screens" className="btn btn-outline-light btn-lg">
              すべての画面（{total}枚）
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <Emblem className={styles.emblem} />
          <Link href={pc.href} prefetch={false} className={styles.pc}>
            <DeviceFrame device="pc" address={addressOf(pc.path)} elevated className={styles.pcFrame}>
              {/*
               * ページを開いてすぐに見える、いちばん大きな画像（LCP）。すぐに・高い優先度で読み込む
               * （Next.js の説明に沿って preload ではなく loading と fetchPriority を使う。この場合も、
               * React がページの先頭に先読みの指定（<link rel="preload">）を入れます）
               */}
              <ShotImage
                shot={pc}
                loading="eager"
                fetchPriority="high"
                fit="fill"
                sizes="(min-width: 1200px) 540px, (min-width: 1024px) 42vw, (min-width: 700px) 540px, 86vw"
              />
            </DeviceFrame>
          </Link>
          <Link href={sp.href} prefetch={false} className={styles.sp}>
            <DeviceFrame device="sp" elevated className={styles.spFrame}>
              {/*
               * 表示する幅は 200px ほどのため、縮小画像（幅 360px）で足りる。すぐに見える位置なのですぐに読み込むが、
               * 優先度は低くして、先読みの対象から外す（PC の大きな画像の読み込みを妨げないように）
               */}
              <Thumb shot={sp} sizes="(min-width: 1024px) 220px, 32vw" alt={sp.caption} eager fetchPriority="low" />
            </DeviceFrame>
          </Link>
        </div>
      </div>
    </section>
  );
}
