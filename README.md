# THE SANCTUARY 画面一覧

完全会員制のオンラインヒーリングサロン「THE SANCTUARY」の Web システムの画面を、422枚ご覧いただけるサイトです。
Next.js 16（App Router・React 19・TypeScript）で作成しています。データベースや外部のサービスは使いません。

公開ページは本番のサイトの画面、ログイン後の画面は架空の見本データで撮影しています。
公開ページの事業者情報は、伏せ字にしています。

## ページ

| アドレス | 内容 |
| --- | --- |
| `/` | トップページ。システムの概要、数字で見る画面、主な画面、6つの領域、できること、使用技術 |
| `/tour` | 主な画面（18枚）。サロンを知るところから管理画面まで、流れに沿ってご紹介します |
| `/screens` | すべての画面（422枚）。領域・端末・撮影の範囲で絞り込めて、言葉でも探せます |
| `/screens/<領域>` | 領域ごとの画面（例：`/screens/public`）。ページごとにまとめて表示します |
| `/screens/<領域>/<画像の名前>` | 1枚ごとのページ（例：`/screens/public/01_top_pc_view`）。同じ画面の別の撮影や、前後の画面へ移動できます |

領域の名前は `public`（公開ページ）・`member`（マイページ）・`booking`（ご予約）・`session`（セッションのお部屋）・
`healer`（ヒーラー画面）・`admin`（管理画面）です。画像の名前は、元の画像のファイル名から `.png` を除いたものです。

一覧（`/screens`・`/screens/<領域>`）では、画像を押すと大きく表示します。← → キー（スマートフォンでは左右へのスワイプ）で
前後の画面へ移動し、Esc キーで閉じます。絞り込みの条件と、大きく表示している画面はアドレスに残るため、そのままリンクとして共有できます。

| アドレスの項目 | 値 |
| --- | --- |
| `device` | `pc`・`sp` |
| `capture` | `view`（最初の画面）・`part`（画面の一部）・`full`（ページ全体） |
| `section` | 領域の名前（`/screens` だけ） |
| `q` | 探す言葉（ひらがな・カタカナのどちらでも探せます） |
| `shot` | 大きく表示している画面（画像の名前） |

例：`/screens?device=sp&capture=full`・`/screens/booking?shot=04_stripe-checkout_pc_view`

## 動かし方

Node.js 20.9 以上が必要です。

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # 本番用のビルド（すべてのページを、あらかじめ書き出します）
npm start           # ビルドしたものを配信
npm run lint        # コードの確認
npm run typecheck   # 型の確認
npm run fonts       # 日本語の文字のファイルを作り直す（文章を変えて、新しい漢字が増えたとき。下の「文字の種類」）
npm run catalog     # 画面の一覧のデータを作り直す（dev・build の前にも自動で実行されます）
```

## 画面の画像とデータ

| 場所 | 内容 |
| --- | --- |
| `public/media/shots/<フォルダ>/` | 画面の画像（PNG・422枚。フォルダは `01_public` 〜 `06_admin`） |
| `public/media/thumbs/<フォルダ>/` | 一覧で使う縮小画像（JPEG。画像と同じ名前で、拡張子だけ `.jpg`） |
| `public/media/the-sanctuary-screens.pdf` | すべての画面の一覧（ダウンロード用） |
| `src/data/manifest.json` | 画面ごとの説明・アドレス・端末・撮影の範囲・大きさ |
| `src/data/shots.json` | 画面の一覧のデータ（自動で作るため、手で直さないでください） |

`public/` に置いたファイルは、そのままのアドレスで配信されます（例：`/media/shots/01_public/01_top_pc_view.png`）。

`npm run dev`・`npm run build` の前には、`scripts/build-catalog.mjs`（`npm run catalog`）が自動で実行され、次のことを行います。

1. `src/data/manifest.json` と画像・縮小画像から、画面の一覧のデータ `src/data/shots.json` を作ります。ファイルの大きさと縮小画像の大きさは、ファイルから読み取ります。
2. 画像がない、画像の大きさが `manifest.json` と違う、縮小画像がない、といった場合は、内容を表示して止まります。
3. `manifest.json` に書かれていない画像があるときや、日本語の文字のファイルに入っていない文字が増えたときは、お知らせします。

## 画面を追加・差し替えるとき

1. 画像を `public/media/shots/<フォルダ>/` に置きます。名前は `番号_名前[-状態]_端末_範囲.png` の形にします。
   - 番号：ページの番号（2桁）。同じ番号の画像は、同じページとしてまとめて表示します
   - 端末：`pc`（幅 1,440px の画面で撮影）・`sp`（幅 390px の画面で撮影）
   - 範囲：`view`（開いたときに見える範囲・画面の一部）・`full`（ページ全体）
   - 例：`public/media/shots/01_public/05_apply-errors_pc_full.png`
2. 縮小画像を、同じ名前（拡張子は `.jpg`）で `public/media/thumbs/<フォルダ>/` に置きます（例：`public/media/thumbs/01_public/05_apply-errors_pc_full.jpg`）。
   幅は PC が 720px、スマートフォンが 360px です。縦に長い画像は、上の部分を PC は 720×900、スマートフォンは 360×780 で切り出します。
3. `src/data/manifest.json` に1件追加します（`file`・`section`・`caption`・`url`・`kind`・`full`・`width`・`height`。`file` は `01_public/05_apply-errors_pc_full.png` の形）。
4. 新しい番号のページの場合は、`src/data/pages.ts` にページの名前を追加します。
5. `npm run catalog`（または `npm run dev`）を実行します。

「最初の画面」と「画面の一部」は、画像の大きさで見分けています。PC の 2880×1800・1440×900、スマートフォンの 1170×2532・390×844 が
「最初の画面」で、それ以外の `view` の画像は「画面の一部」として表示します（`src/lib/catalog.ts`）。

同じ名前のまま画像を差し替えたときは、変換した画像の保存場所 `.next/cache/images` を削除してください（下の「画像の変換と保存」）。

## 文章を変えるとき

| ファイル | 内容 |
| --- | --- |
| `src/data/site.ts` | サイト名・説明・公開するアドレス・検索エンジンへの公開・ページの下部の注記 |
| `src/data/sections.ts` | 6つの領域の名前・説明・代表の画面（`cover`。トップページの領域のカードなどに使う、PC の「最初の画面」） |
| `src/data/pages.ts` | ページの名前（領域ごと・番号ごと） |
| `src/data/highlights.ts` | 主な画面（18枚）の選び方と説明 |
| `src/data/features.ts` | トップページの「できること」と「使用技術」 |
| `src/data/manifest.json` | 画面ごとの説明（`caption`） |

## 公開する前に

- **公開するアドレス**：環境変数 `NEXT_PUBLIC_SITE_URL` に設定します（`.env.example` をご覧ください）。
  SNS で共有したときの画像と、サイトマップに使います。設定しない場合は `http://localhost:3000` になります。
- **検索エンジン**：はじめは、検索結果に載せない設定（`src/data/site.ts` の `indexable: false`）です。お客様のシステムの
  管理画面なども含むためです。載せる場合は `true` にしてください。`robots.txt`・サイトマップ・各ページの指定が切り替わります。

## 公開のしかた

### Vercel

GitHub のリポジトリを Vercel に読み込むだけで、設定はそのままで公開できます。環境変数 `NEXT_PUBLIC_SITE_URL` を設定してください。

### サーバー（VPS など）

```bash
npm ci
npm run build
npm start            # ポートを変える場合：npm start -- -p 8080
```

nginx などから、このポートへ転送してください。

### 静的なファイルとして書き出す

```bash
STATIC_EXPORT=1 npm run build   # out/ に書き出します
```

`out/` を、そのまま Web サーバーに置けます（アドレスの最後に「/」が付く形です）。この場合は、画像の変換
（WebP への変換・大きさの調整）を行わず、大きな画像は元の PNG、一覧は縮小画像の JPEG をそのまま配信します。

## 画像の変換と保存

- 大きく表示する画像は、見ている端末に合った大きさの WebP に変換して配信します（画質 90）。変換した画像は31日間保存します。
- 一覧の縮小画像（`public/media/thumbs` の JPEG）も、表示する幅に合わせた WebP に変換して配信します。
- 画像・縮小画像・PDF（`/media/…`）は、ブラウザに1日保存してもらいます。
- 縦に非常に長い画像（高さ 16,000px を超えるもの）は、WebP の大きさの上限を超えるため、元の PNG をそのまま配信します。

## 文字の種類

THE SANCTUARY の画面と同じく、見出しに「しっぽり明朝 B1」、本文に「Zen 角ゴシック New」、英字の見出しに「Cormorant Garamond」を
使っています（いずれも SIL Open Font License。`src/fonts/OFL-*.txt`）。

日本語の文字のファイルは、そのままでは1つ数 MB あるため、サイトで使う文字（約 960 文字。ひらがな・カタカナ・英数字・記号は
すべて）だけに絞ったもの（1つ約 90〜180KB）を `src/fonts/` に置いています。文章を変えて新しい漢字が増えたときは、
`npm run build` のときに「日本語の文字のファイルに入っていない文字があります」と表示されます。次のように作り直してください
（作り直すまでの間も、その文字だけ端末にある文字の種類で表示されるため、読めなくなることはありません）。

```bash
pip install fonttools brotli   # 初回だけ（Python の道具を使います）
npm run fonts
```

元の文字のファイルは、Google Fonts のリポジトリから初回だけダウンロードします。本文の文字は、表示したあとに入れ替えない設定
（`display: optional`）です。読み込みが間に合わなかったページでは端末の文字で表示し、次のページからはこの文字で表示します
（表示のあとに文章が組み直されて、画面がずれないようにするためです）。

## 共有したときの画像（OG 画像）

`src/app/opengraph-image.png`・`src/app/twitter-image.png`（1200×630）は、`scripts/make-og-image.mjs` で、画面の画像とサイトの文字を
組み合わせて作っています。作り直すときは、次のように実行します（Chrome と、インターネットへの接続が必要です）。

```bash
npm i --no-save playwright-core@1.58
node scripts/make-og-image.mjs
```

`playwright-core` はサイトには必要ないため、`package.json` には入れていません（`--no-save` で、一時的に入れます）。

## そのほかのファイル

`docs/highlights/` には、主な画面18枚の画像と、その説明（`説明.txt`）を置いています（サイトの表示には使いません。
ポートフォリオの登録などに使う資料です）。サイトの「主な画面」（`/tour`・`src/data/highlights.ts`）は、この説明をもとにしています。

## フォルダの構成

Next.js の標準の構成（`src/` にアプリのコード、`public/` に配信するファイル、いちばん上に設定のファイル）です。

```
├── docs/
│   └── highlights/           主な画面18枚と説明（資料。サイトでは使いません）
├── public/                   そのまま配信するファイル
│   ├── emblem.svg            飾りの図形（円と星。すべてのページで使い回す）
│   └── media/
│       ├── shots/            画面の画像（01_public 〜 06_admin・PNG）
│       ├── thumbs/           縮小画像（同じフォルダ分け・JPEG）
│       └── the-sanctuary-screens.pdf   すべての画面の一覧（PDF）
├── scripts/
│   ├── build-catalog.mjs     画面の一覧のデータの作成（npm run catalog。dev・build の前に自動で実行）
│   ├── subset-fonts.mjs      日本語の文字のファイルの作成（npm run fonts）
│   ├── font-chars.mjs        サイトで使う文字の一覧（上の2つで使う）
│   └── make-og-image.mjs     共有したときの画像の作成
├── src/
│   ├── app/                  ページ（URL と同じ形のフォルダ）・全体のレイアウト・CSS・アイコン・共有したときの画像
│   │   ├── page.tsx          /（トップページ）
│   │   ├── tour/             /tour（主な画面）
│   │   ├── screens/          /screens・/screens/<領域>・/screens/<領域>/<画像の名前>
│   │   ├── not-found.tsx     ページが見つからないとき
│   │   ├── robots.ts・sitemap.ts
│   │   └── layout.tsx・globals.css
│   ├── components/
│   │   ├── layout/           サイトの上部・下部
│   │   ├── ui/               見出しの帯・パンくずリスト・飾りの図形・端末の枠などの共通の部品
│   │   ├── shots/            画面のカード・画面の画像
│   │   ├── home/             トップページの部品
│   │   ├── tour/             主な画面のページの部品
│   │   ├── gallery/          一覧・絞り込み・拡大表示
│   │   └── detail/           1枚ごとのページの部品
│   ├── data/                 文章と設定・画面の説明（manifest.json）・画面の一覧のデータ（shots.json は自動で作成）
│   ├── fonts/                文字のファイルとライセンス
│   └── lib/                  画面のデータの読み込み・並べ替え・表示の名前
├── next.config.ts・tsconfig.json・eslint.config.mjs・package.json
└── README.md・AGENTS.md・CLAUDE.md・.env.example
```
