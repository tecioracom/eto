# éto

ひとりずつ施術するネイルサロンのウェブサイト。60分＋オフ30分で90分、¥7,700。

公開先: https://eto.sample.teciora.com

## 画面

| ルート | |
|---|---|
| `/` | éto トップ |
| `/admin` | 店舗スタッフのログイン |
| `/admin/calendar` | 予約カレンダー |
| `/admin/menu` | メニュー・予約枠 |
| `/admin/reservations/detail` | 予約の詳細 |
| `/menu` | メニュー・料金 `/menu`。予約の流れの1段め |
| `/reserve` | 予約 `/reserve`。予約の流れの2〜4段め |

## 作りで決めたこと

### 時間と金額が同時に積み上がる

メニューを選ぶと所要時間と合計が一緒に増える。片方だけ見せると、
店に着いてから「そんなに掛かるのか」になる。

### 空き枠はカレンダーから導く

客が見る空き枠と、店が見る1日の予定は同じ定数から作る。

## 入力を扱う画面について

入力欄のある画面はあるが、`<form>` 要素を1つも置いていない。`action` の無い
form は、ハイドレートが終わる前に Enter を押すと現在の URL へ GET する。
氏名・電話・メールがクエリ文字列に乗り、履歴・リファラ・アクセスログに残る。
送信先を持たない画面にその穴を残す理由がないので、form ごと置いていない。

同じ理由で、`fetch` も Server Actions も `localStorage` も持たせていない。
ボタンの文字も実際に起きることに合わせてある（「送信する」ではなく
「入力内容を確認する」）。

`scripts/check.sh` がこれを機械で確かめる。15群あり、27通りの違反を注入して
全部赤くなることを確認してある。

```bash
bash scripts/check.sh
```

## 動かす

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # 本番と同じ静的書き出し
npm run typecheck
```

Next.js 15 の App Router。全7ルートを静的に書き出す。欧文の見出しに Playfair Display を1書体だけ読む。和文は端末の書体に任せる。

main に push すると GitHub Actions が Vercel へ出す（`.github/workflows/deploy.yml`）。

## 素材

写真は AI 生成（Higgsfield 経由の `gpt_image_2`）。人体は写していない。
出所と条件は [docs/credits.md](docs/credits.md) に1ファイル1行で書いてある。
`public/samples/eto/` に10ファイル、AVIF と WebP の2系統で置いてある。

## 書いてあることについて

この事業者は架空。社名・人名・住所・電話番号・金額・在庫数はこの画面のために
用意したもので、実在の事業者とは関係ない。全ページ noindex にしてある。

---

制作: [Teciora](https://www.teciora.com/)
