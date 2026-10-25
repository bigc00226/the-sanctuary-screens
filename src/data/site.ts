/**
 * サイト全体の設定。公開する前に `url` を、このサイトを置くアドレスに変更してください
 * （環境変数 NEXT_PUBLIC_SITE_URL があれば、そちらを使います）。SNS で共有したときの表示に使われます。
 */
export const site = {
  /** ブラウザのタブ・共有したときに出るサイト名 */
  name: "THE SANCTUARY 画面一覧",
  /** システムの名前（ロゴの文字） */
  product: "THE SANCTUARY",
  productSubtitle: "Private Healing & Wellness",
  productTagline: "完全会員制のオンラインヒーリングサロン",
  /** 本番のサイト（公開ページ）のアドレス。画面の説明に添えるだけで、リンクの先はこのサイトの外になります */
  productUrl: "https://the-sanctuary.jp",
  description:
    "完全会員制のオンラインヒーリングサロン「THE SANCTUARY」の Web システムの画面一覧です。入会のお申し込みから、ご予約と事前決済、ビデオ通話のセッション、ヒーラー画面、管理画面まで、PC とスマートフォンの画面を収録しています。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /**
   * 検索エンジンに載せるかどうか。お客様のシステムの管理画面なども含むため、はじめは載せない設定（false）です。
   * 載せる場合は true にしてください（robots.txt とサイトマップ、各ページの robots の指定が切り替わります）。
   */
  indexable: false,
  /** 画面の撮影について（すべてのページの下部に表示） */
  notes: ["ログイン後の画面のデータは、架空の見本データです。", "公開ページの事業者情報は、伏せ字にしています。"],
} as const;
