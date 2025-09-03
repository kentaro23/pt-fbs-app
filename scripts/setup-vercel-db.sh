#!/usr/bin/env bash
set -euo pipefail

# 色出力
green(){ printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }
red(){ printf "\033[31m%s\033[0m\n" "$*"; }

# 1) Vercel プロジェクト連携の確認
if ! npx vercel status >/dev/null 2>&1; then
  red "Vercel CLI にログインしていません。 'npx vercel login --confirm' を先に実行してください。"
  exit 1
fi

# 2) 接続文字列の入力（非表示）
yellow "PostgreSQL の接続文字列を貼り付けて Enter（例: postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require）"
read -r -s DATABASE_URL
echo

if [ -z "$DATABASE_URL" ]; then
  red "DATABASE_URL が空です。処理を中止します。"; exit 1
fi

# 3) Env 追加（Preview/Production）
green "Vercel に DATABASE_URL を追加します（Preview/Production）..."
printf "%s" "$DATABASE_URL" | npx vercel env add DATABASE_URL preview --yes
printf "%s" "$DATABASE_URL" | npx vercel env add DATABASE_URL production --yes

# 4) Env をローカルに pull
green "Vercel から .env.production.local を取得します..."
npx vercel env pull .env.production.local --yes

# 5) Prisma スキーマ適用（.env.production.local を読み込んで実行）
green "Prisma スキーマをクラウドDBに適用します..."
# .env.production.local を export してコマンドに引き継ぐ
set -a
# shellcheck disable=SC1091
. ./.env.production.local || true
set +a

if npx prisma migrate deploy; then
  green "migrate deploy が完了しました。"
else
  yellow "migrate が無い/失敗のため db push を試します..."
  npx prisma db push
fi

# 6) 本番デプロイ
green "Vercel 本番デプロイを行います..."
npx vercel --prod --yes

green "完了！ /api/diag/env と /api/health で確認してください。"
