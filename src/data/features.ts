/**
 * トップページの「できること」と「使用技術」。
 * `shots` は、その機能が分かる画面（画像のファイル名・拡張子なし）です。
 */
export type FeatureIcon =
  | "clipboard"
  | "calendar"
  | "refund"
  | "video"
  | "sparkles"
  | "notebook"
  | "mail"
  | "layout"
  | "badge";

export type Feature = {
  id: string;
  icon: FeatureIcon;
  title: string;
  body: string;
  shots: string[];
};

export const FEATURES: Feature[] = [
  {
    id: "membership",
    icon: "clipboard",
    title: "入会の審査とお支払い",
    body: "3つの手順のお申し込みを管理画面で審査し、結果をメールとマイページでお知らせします。審査を通過した方は、入会金と初月の月会費を Stripe で1回にまとめてお支払いいただき、翌月からは毎月自動で決済します。",
    shots: ["05_apply_pc_view", "06_applications_pc_view", "08_mypage-approved_pc_view"],
  },
  {
    id: "status",
    icon: "badge",
    title: "会員様の状態ごとのご案内",
    body: "審査中・お支払い前・ご利用中・特別会員・月会費の未納・停止・お見送りなど、会員様の状態ごとにマイページの表示とご案内が変わります。月会費が未納のあいだは、新しいご予約を止めます。",
    shots: ["07_mypage-pending_pc_view", "09_mypage-payment-issue_pc_view", "07_book-blocked_pc_view"],
  },
  {
    id: "booking",
    icon: "calendar",
    title: "ご予約と事前決済",
    body: "営業時間・臨時休業日・受付期限・ほかのご予約から空き枠を作り、お支払いの間はその時間を仮押さえします。同じヒーラーのご予約が重ならないことは、データベースの制約で保証しています。",
    shots: ["02_book-datetime_pc_view", "03_book-confirm_pc_view", "04_stripe-checkout_pc_view"],
  },
  {
    id: "refund",
    icon: "refund",
    title: "キャンセルと自動の返金",
    body: "キャンセルの前に返金額を表示し、キャンセルポリシー（前日までは全額・当日は半額）に沿って Stripe で自動で返金します。サロン都合のキャンセルは、全額を返金します。",
    shots: ["01_mypage-cancel_pc_view", "06_cancel-refunded_pc_view", "01_reservations-salon-cancel_pc_view"],
  },
  {
    id: "session",
    icon: "video",
    title: "ビデオ通話のお部屋",
    body: "アプリのいらない、ブラウザだけで使えるビデオ通話です。入れるのはご予約の会員様と担当のヒーラーだけで、チャット・残り時間のお知らせ・その場でお支払いできる延長を備えています。",
    shots: ["03_call_sp_view", "04_chat-overlay_sp_view", "08_extension_sp_view"],
  },
  {
    id: "beauty",
    icon: "sparkles",
    title: "美肌フィルター",
    body: "顔の位置を検出し、目・眉・唇を残して肌だけをなめらかにします。補正はご本人の端末の中で行い、補正後の映像をそのまま相手に送ります。",
    shots: ["13_camera-fx_pc_view", "06_call-fx_sp_view", "02_lobby-fx_sp_view"],
  },
  {
    id: "records",
    icon: "notebook",
    title: "カルテとご感想",
    body: "ヒーラーはセッションごとにカルテを記入し、次回への申し送りを残せます。会員様はセッションのあとに満足度とご感想を送れて、30日間は変更できます。",
    shots: ["06_healer-record_pc_view", "05_call-karte_pc_view", "14_feedback_pc_view"],
  },
  {
    id: "mail",
    icon: "mail",
    title: "記事とメールの配信",
    body: "お知らせ・コラム（会員様だけが読める記事も）を管理画面から公開できます。会員様全員、または選んだ方へのメールは、送信の状況を確認でき、送れなかった方へは再送できます。",
    shots: ["09_post-edit_pc_view", "10_mail_pc_view", "10_mail-campaign_pc_view"],
  },
  {
    id: "admin",
    icon: "layout",
    title: "ひとつにまとまった管理画面",
    body: "予約・会員・売上・入会審査・特別会員・メニュー・スケジュール・ヒーラー・料金設定を、ひとつの管理画面で扱えます。売上の明細は CSV でダウンロードできます。",
    shots: ["01_reservations_pc_view", "02_members_pc_view", "04_sales_pc_view"],
  },
];

export type Tech = { name: string; role: string };

export const TECH: Tech[] = [
  { name: "Next.js（App Router）・React・TypeScript", role: "画面とサーバーの処理" },
  { name: "Tailwind CSS", role: "画面のデザイン" },
  { name: "Supabase", role: "ログイン・データベース・画像の保存・チャットのリアルタイムの配信" },
  { name: "Stripe", role: "入会金・月会費の継続の決済、ご予約の事前決済、返金、カードの変更と領収書" },
  { name: "Daily", role: "ビデオ通話（映像と音声の通信）" },
  { name: "MediaPipe・WebGL", role: "美肌フィルター（顔の検出と、映像の補正）" },
  { name: "Nodemailer（SMTP）", role: "ご予約・お手続き・お知らせのメール" },
];
