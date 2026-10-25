/**
 * 画面の6つの領域（元の画像のフォルダ 01_public〜06_admin に対応）。
 * 並び順は、この配列の順です。
 */
export const SECTIONS = [
  {
    id: "public",
    folder: "01_public",
    no: "01",
    title: "公開ページ",
    en: "Public Pages",
    icon: "globe",
    lead: "どなたでもご覧いただけるページです。",
    description:
      "トップページ、メニュー・料金、お知らせ・コラム、入会のお申し込み（3つの手順）、ログインとパスワードの再設定、会員規約などの画面です。入力エラーの表示や、ページが見つからないときの画面も収録しています。",
  },
  {
    id: "member",
    folder: "02_member",
    no: "02",
    title: "マイページ",
    en: "My Page",
    icon: "user",
    lead: "ログインした会員様の画面です。",
    description:
      "審査中・お支払い前・ご利用中・特別会員・月会費の未納・停止・お見送りなど、会員様の状態ごとに表示が変わります。会員資格とお支払いの履歴、登録情報、ご感想、会員限定の記事も収録しています。",
  },
  {
    id: "booking",
    folder: "03_booking",
    no: "03",
    title: "ご予約",
    en: "Booking",
    icon: "calendar",
    lead: "メニューを選んでから、ご予約が確定するまでの画面です。",
    description:
      "メニュー、ヒーラーと日時、内容の確認、Stripe でのお支払い、ご予約の確定と進みます。キャンセルすると、キャンセルポリシーに沿って自動で返金します。月会費が未納のときは、新しいご予約を止めます。",
  },
  {
    id: "session",
    folder: "04_session",
    no: "04",
    title: "セッションのお部屋",
    en: "Session Room",
    icon: "video",
    lead: "ブラウザだけで使える、ビデオ通話の画面です。",
    description:
      "入室前の映り方とマイクの確認、通話中のチャットとカルテ、美肌フィルター、表示の切り替え、その場でお支払いできるセッションの延長、残り時間のお知らせ、接続できなかったときのご案内などです。",
  },
  {
    id: "healer",
    folder: "05_healer",
    no: "05",
    title: "ヒーラー画面",
    en: "Healer",
    icon: "sparkles",
    lead: "セッションを担当するヒーラーの画面です。",
    description:
      "今日のセッション、空いた時間に受付を始める「今すぐヒーリング」、曜日ごとの営業時間と臨時休業日、会員様ごとのカルテの記入、アカウントの設定などです。",
  },
  {
    id: "admin",
    folder: "06_admin",
    no: "06",
    title: "管理画面",
    en: "Admin",
    icon: "settings",
    lead: "サロンを運営する管理者の画面です。",
    description:
      "予約・会員・売上の確認、通話テスト、入会審査、特別会員の登録、記事とメールの配信、メニュー・スケジュール・ヒーラー・料金設定の管理などです。",
  },
] as const;

export type SectionData = (typeof SECTIONS)[number];
export type SectionId = SectionData["id"];
export type SectionIcon = SectionData["icon"];
