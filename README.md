# FBS 自動生成アプリ (理学療法士向け)

## セットアップ

```bash
npm i
npm run prisma:generate && npm run prisma:migrate
npm run seed # 任意
npm run dev
```

- 開発DB: SQLite (`prisma/dev.db`)
- UI: shadcn/ui
- PDF出力: html2canvas + jsPDF

## ルート
- `/` ダッシュボード（選手一覧）
- `/athletes/new` 選手作成
- `/athletes/[id]` 選手詳細 + Assessment一覧
- `/assessments/new?athleteId=...` 測定入力
- `/assessments/[id]/fbs` FBS

## 📱 マルチデバイス対応

### PWA（Progressive Web App）対応
このアプリはPWAとして動作し、モバイルデバイスやタブレットでネイティブアプリのように使用できます。

#### iOS（Safari）でのインストール
1. Safariでアプリにアクセス
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

#### Android（Chrome）でのインストール
1. Chromeでアプリにアクセス
2. メニュー（⋮）をタップ
3. 「アプリをインストール」を選択
4. 「インストール」をタップ

#### デスクトップ（Chrome/Edge）でのインストール
1. アドレスバーの右側に表示される「インストール」アイコンをクリック
2. 「インストール」を選択

### モバイル最適化機能
- **タッチ操作最適化**: 44px以上のタッチターゲット
- **レスポンシブデザイン**: 全デバイスサイズに対応
- **モバイルフォーム**: 入力しやすいUI/UX
- **横スクロール対応**: 可動域テーブルのモバイル表示
- **安全領域対応**: ノッチやホームインジケーターに対応

### 対応デバイス
- 📱 スマートフォン（iOS/Android）
- 📱 タブレット（iPad/Android）
- 💻 デスクトップ（Windows/macOS/Linux）
- 🌐 ブラウザ（Chrome/Safari/Firefox/Edge）

## 🚀 デプロイ

### Vercel（推奨）
```bash
npm run build
vercel --prod
```

## 運用チェックリスト（安定化パック）

- /api/health の確認
  - 返却: `{ ok:true, db:"ok|ng", stripe:"ok|ng", email:"ok|ng", version }`
  - DB: Prismaで `athlete.count()` が成功すれば ok
  - Stripe: 環境変数 `STRIPE_SECRET_KEY` が設定されていれば ok
  - Email: `RESEND_API_KEY` が設定されていれば ok

- Sentry 監視
  - 環境変数 `SENTRY_DSN` を設定すると自動で有効化
  - クライアント/サーバの初期化は `src/sentry.client.ts` / `src/sentry.server.ts`
  - 例外送信: `captureExceptionSafe(error, { where: 'api/auth/login' })`

- レート制限
  - 10分5回/キー(IP+種別)
  - 実装: `src/lib/rateLimit.ts`
  - 超過時は HTTP 429 と `retryAfterSec` を返す

- www リダイレクト
  - `pt-fbs.com` へのアクセスは `www.pt-fbs.com` へ 301（API/静的は除外）
  - 実装: `src/middleware.ts`

- FREE 上限のAPI側検証
  - 選手作成時に `assertAthleteCreateAllowed` でサーバ側で再検証
  - 超過時は 402 / `PLAN_LIMIT_EXCEEDED` を返す（フロントはアップグレード導線表示）


### その他のプラットフォーム
- Netlify
- AWS Amplify
- Google Cloud Run
- Azure Static Web Apps

## 🔧 開発

### アイコン生成
```bash
node scripts/generate-icons.js
```

### データベース
```bash
npm run prisma:studio  # Prisma Studio起動
npm run prisma:migrate # マイグレーション実行
npm run prisma:generate # クライアント生成
```
