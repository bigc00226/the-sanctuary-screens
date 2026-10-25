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
```

`npm run dev`・`npm run build` の前には、`scripts/prepare-media.mjs` が自動で実行されます（次の「画面の画像のしくみ」）。

## 画面の画像のしくみ

元の画像は、このフォルダにあるものをそのまま使います。サイトのために動かしたり、書き換えたりはしません。

| 場所 | 内容 |
| --- | --- |
| `01_public/` 〜 `06_admin/` | 画面の画像（PNG・422枚） |
| `_thumbs/` | 一覧で使う縮小画像（JPEG） |
| `manifest.json` | 画面ごとの説明・アドレス・端末・撮影の範囲・大きさ |
| `一覧.pdf` | すべての画面の一覧（ダウンロード用に配信します） |

`scripts/prepare-media.mjs` が、次のことを行います。

1. 画像・縮小画像・PDF を `public/media/` に用意します。「ハードリンク」という、同じファイルをもう一つの名前で指す方法を使うため、容量は増えません（リンクを作れない環境では、コピーします）。
2. `manifest.json` から、画面の一覧のデータ `src/data/shots.json` を作ります。ファイルの大きさと縮小画像の大きさは、ファイルから読み取ります。
3. 画像がない、画像の大きさが `manifest.json` と違う、縮小画像がない、といった場合は、内容を表示して止まります。

`public/media/` は毎回自動で作るため、Git には入れていません。

## 画面を追加・差し替えるとき

1. 画像を、領域のフォルダ（`01_public/` など）に置きます。名前は `番号_名前[-状態]_端末_範囲.png` の形にします。
   - 番号：ページの番号（2桁）。同じ番号の画像は、同じページとしてまとめて表示します
   - 端末：`pc`（幅 1,440px の画面で撮影）・`sp`（幅 390px の画面で撮影）
   - 範囲：`view`（開いたときに見える範囲・画面の一部）・`full`（ページ全体）
   - 例：`05_apply-errors_pc_full.png`
2. 縮小画像を `_thumbs/<フォルダ>__<名前>.jpg` に置きます（例：`_thumbs/01_public__05_apply-errors_pc_full.jpg`）。
   幅は PC が 720px、スマートフォンが 360px です。縦に長い画像は、上の部分を PC は 720×900、スマートフォンは 360×780 で切り出します。
3. `manifest.json` に1件追加します（`file`・`section`・`caption`・`url`・`kind`・`full`・`width`・`height`）。
4. 新しい番号のページの場合は、`src/data/pages.ts` にページの名前を追加します。
5. `npm run prepare-media`（または `npm run dev`）を実行します。

「最初の画面」と「画面の一部」は、画像の大きさで見分けています。PC の 2880×1800・1440×900、スマートフォンの 1170×2532・390×844 が
「最初の画面」で、それ以外の `view` の画像は「画面の一部」として表示します（`src/lib/catalog.ts`）。

同じ名前のまま画像を差し替えたときは、変換した画像の保存場所 `.next/cache/images` を削除してください（下の「画像の変換と保存」）。

## 文章を変えるとき

| ファイル | 内容 |
| --- | --- |
| `src/data/site.ts` | サイト名・説明・公開するアドレス・検索エンジンへの公開・ページの下部の注記 |
| `src/data/sections.ts` | 6つの領域の名前と説明 |
| `src/data/pages.ts` | ページの名前（領域ごと・番号ごと） |
| `src/data/highlights.ts` | 主な画面（18枚）の選び方と説明 |
| `src/data/features.ts` | トップページの「できること」と「使用技術」 |
| `manifest.json` | 画面ごとの説明（`caption`） |

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
（WebP への変換・大きさの調整）を行わず、元の PNG をそのまま配信します。

## 画像の変換と保存

- 大きく表示する画像は、見ている端末に合った大きさの WebP に変換して配信します（画質 90）。変換した画像は31日間保存します。
- 一覧の縮小画像は、変換せずにそのまま配信します。
- 画像・縮小画像・PDF（`/media/…`）は、ブラウザに1日保存してもらいます。
- 縦に非常に長い画像（高さ 16,000px を超えるもの）は、WebP の大きさの上限を超えるため、元の PNG をそのまま配信します。

## 共有したときの画像（OG 画像）

`src/app/opengraph-image.png`・`src/app/twitter-image.png`（1200×630）は、`scripts/make-og-image.mjs` で、画面の画像とサイトの文字を
組み合わせて作っています。作り直すときは、次のように実行します（Chrome と、インターネットへの接続が必要です）。

```bash
npm i --no-save playwright-core@1.58
node scripts/make-og-image.mjs
```

`playwright-core` はサイトには必要ないため、`package.json` には入れていません（`--no-save` で、一時的に入れます）。

## そのほかのファイル

`index.html`（以前の一覧のページ）・`一覧.pdf`・`the-sanctuary/`（主な画面18枚と説明）は、以前のまま残しています。
主な画面の選び方と説明は、`the-sanctuary/説明.txt` をもとにしています。

## フォルダの構成

```
├── 01_public/ … 06_admin/   画面の画像（元のデータ）
├── _thumbs/                  縮小画像（元のデータ）
├── manifest.json             画面の説明（元のデータ）
├── index.html・一覧.pdf・the-sanctuary/   以前の一覧（そのまま）
├── scripts/
│   ├── prepare-media.mjs     画像の用意と、画面の一覧のデータの作成（dev・build の前に自動で実行）
│   └── make-og-image.mjs     共有したときの画像の作成
├── public/media/             （自動で作成）配信する画像・縮小画像・PDF
└── src/
    ├── app/                  ページ（/・/tour・/screens・/screens/<領域>・/screens/<領域>/<画像の名前>）
    ├── components/           部品（gallery：一覧と拡大表示・detail：1枚ごとのページ・home：トップページ・tour：主な画面）
    ├── data/                 文章と設定・画面の一覧のデータ（shots.json は自動で作成）
    └── lib/                  画面のデータの読み込み・並べ替え・表示の名前
```
