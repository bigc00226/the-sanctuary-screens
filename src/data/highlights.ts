/**
 * 主な画面（18枚）。元のフォルダ the-sanctuary/ の画像と同じものを、画面の一覧から選んでいます。
 * `slug` は画像のファイル名（拡張子なし）です。
 */
export const CHAPTERS = [
  { id: "join", title: "知る・申し込む", en: "Discover" },
  { id: "mypage", title: "マイページ", en: "My Page" },
  { id: "booking", title: "ご予約と事前決済", en: "Booking & Payment" },
  { id: "session", title: "オンラインセッション", en: "Online Session" },
  { id: "healer", title: "ヒーラー画面", en: "For Healers" },
  { id: "admin", title: "管理画面", en: "Administration" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export type Highlight = {
  slug: string;
  chapter: ChapterId;
  title: string;
  description: string;
};

export const HIGHLIGHTS: Highlight[] = [
  {
    slug: "01_top_pc_view",
    chapter: "join",
    title: "トップページ",
    description:
      "完全会員制・オンライン専用のヒーリングサロンであることを、最初の画面でお伝えします。コンセプトやヒーラーのご紹介は、見出しを押すと本文が開く形にして、はじめに読む文章を絞りました。",
  },
  {
    slug: "02_menu_pc_view",
    chapter: "join",
    title: "メニュー・料金",
    description:
      "カテゴリーごとの説明と、所要時間・料金・延長料金を並べます。内容は管理画面の「メニュー」「料金設定」から変更でき、変更するとこのページにもそのまま反映されます。",
  },
  {
    slug: "05_apply_pc_view",
    chapter: "join",
    title: "入会のお申し込み（3つの手順の入力フォーム）",
    description:
      "基本情報、ご利用について、入力内容の確認の3つの手順で進みます。20歳以上であることや、同じ方の重複のお申し込みを、次の手順へ進むときに確認します。お申し込みは、管理画面で審査します。",
  },
  {
    slug: "01_mypage_pc_view",
    chapter: "mypage",
    title: "マイページ（ご予約・ご感想のお願い・お知らせ）",
    description:
      "ログインすると、今後のご予約、セッションのあとのご感想のお願い、サロンからのお知らせを表示します。開始の10分前になると、セッションのお部屋に入るボタンが表示されます。",
  },
  {
    slug: "01_book-menu_pc_view",
    chapter: "booking",
    title: "ご予約 手順1：メニューを選ぶ",
    description: "カテゴリーの説明と、所要時間ごとの料金・延長料金を見比べて選びます。特別会員には、割引後の料金を表示します。",
  },
  {
    slug: "02_book-datetime_pc_view",
    chapter: "booking",
    title: "ご予約 手順2：ヒーラーと日時を選ぶ（空き枠のカレンダー）",
    description:
      "ヒーラーを選ぶと、カレンダーに予約できる日が表示されます。空き枠は、営業時間・臨時休業日・受付期限・ほかのご予約と、ヒーラーの準備の時間をもとに作ります。",
  },
  {
    slug: "03_book-confirm_pc_view",
    chapter: "booking",
    title: "ご予約 手順3：内容の確認（料金・キャンセルポリシー）",
    description:
      "料金・延長料金・キャンセルポリシーを確かめ、ヒーラーへのご要望を書き添えて、お支払いへ進みます。料金とキャンセルポリシーは、予約した時点の内容を予約ごとに保存します。",
  },
  {
    slug: "04_stripe-checkout_pc_view",
    chapter: "booking",
    title: "Stripe の決済画面（テスト環境）",
    description:
      "お支払いは Stripe の決済画面で行います。お支払いの間はその時間を仮押さえし、お支払いがなければ自動で解放します。",
  },
  {
    slug: "04_stripe-checkout-filled_pc_view",
    chapter: "booking",
    title: "Stripe の決済画面：カード情報を入力（テスト用のカード）",
    description: "テスト用のカードを入力したところです。このカードは、セッション中に延長するときのお支払いにも使います。",
  },
  {
    slug: "05_booked_pc_view",
    chapter: "booking",
    title: "お支払いの完了後：ご予約が確定",
    description: "お支払いが完了すると、ご予約が確定して「今後のご予約」に加わります。会員様・ヒーラー・管理者には、確定のメールが届きます。",
  },
  {
    slug: "06_cancel-refunded_pc_view",
    chapter: "booking",
    title: "キャンセル：キャンセルポリシーに沿って自動で返金",
    description:
      "キャンセルの前に、今キャンセルした場合の返金額を表示します。確定すると、キャンセルポリシー（前日までは全額・当日は半額）に沿って、Stripe で自動で返金します。",
  },
  {
    slug: "02_lobby_pc_view",
    chapter: "session",
    title: "セッションのお部屋：入室前の確認（カメラ・マイク）",
    description:
      "入室する前に、映り方とマイクを確かめます。声を拾うとマイクのボタンが光り、カメラ・マイクの切り替えや美肌フィルターもここで設定できます。アプリのインストールは不要です。",
  },
  {
    slug: "03_call-split_pc_view",
    chapter: "session",
    title: "ビデオ通話とチャット（並べて表示）",
    description:
      "映像は「自分を大きく」「相手を大きく」「並べて表示」から選べます。チャットは予約ごとに保存して相手の画面にすぐ表示し、ビデオ通話がつながらないときにも使えます。",
  },
  {
    slug: "13_camera-fx_pc_view",
    chapter: "session",
    title: "美肌フィルター（なめらかさ・明るさ・雰囲気）",
    description:
      "なめらかさ・明るさ・雰囲気（自然・あたたか・ローズ・やわらか）を調整できます。顔の位置を検出して目・眉・唇はそのまま残し、補正はご本人の端末の中で行います。",
  },
  {
    slug: "01_healer-home_pc_view",
    chapter: "healer",
    title: "ヒーラー画面：今日のセッション・未記入のカルテ",
    description:
      "今日のセッションと入室のボタン、カルテが未記入のセッション、今後のご予約、受付時間と予約の空き枠を、ひとつの画面で確認できます。空いた時間には「今すぐヒーリング」の受付も始められます。",
  },
  {
    slug: "06_healer-record_pc_view",
    chapter: "healer",
    title: "ヒーラー画面：会員様ごとのカルテ",
    description:
      "会員様ごとに、ご入会のときのご回答、セッションの履歴、カルテ、ご感想をまとめて表示します。カルテは会員様には表示されず、担当したことのあるヒーラーと管理者だけが読めます。",
  },
  {
    slug: "01_reservations_pc_view",
    chapter: "admin",
    title: "管理画面：予約の状況",
    description:
      "今日のセッションの状況（開始前・入室できます・セッション中・終了）と、今後のご予約を確認できます。サロン都合のキャンセルでは全額を返金し、会員様とヒーラーにお知らせします。",
  },
  {
    slug: "04_sales_pc_view",
    chapter: "admin",
    title: "管理画面：売上（月ごと・ヒーラーごと・明細）",
    description:
      "入会金・月会費・セッション・延長・返金を月ごとに集計し、直近12か月の推移、ヒーラーごとの売上、明細を表示します。明細は CSV でダウンロードできます。",
  },
];
