#!/usr/bin/env bash
set -euo pipefail

# 色出力
green(){ printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }
red(){ printf "\033[31m%s\033[0m\n" "$*"; }

# 1) Vercel プロジェクト連携の確認
if ! npx vercel whoami >/dev/null 2>&1; then
  red "Vercel CLI にログインしていません。 'npx vercel login' を先に実行してください。"
  exit 1
fi

# 2) 接続文字列の入力（非表示）
yellow "PostgreSQL の接続文字列を貼り付けて Enter（例: postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require）"
read -r -s DATABASE_URL
INPUT_DATABASE_URL="$DATABASE_URL"
echo

if [ -z "$INPUT_DATABASE_URL" ]; then
  red "DATABASE_URL が空です。処理を中止します。"; exit 1
fi

# 3) Env 追加（Preview/Production）
green "Vercel に DATABASE_URL を追加します（Preview/Production）..."
# stdinパイプで値を渡す（既存があれば --force で上書き）
printf "%s" "$INPUT_DATABASE_URL" | npx vercel env add DATABASE_URL preview --force
printf "%s" "$INPUT_DATABASE_URL" | npx vercel env add DATABASE_URL production --force

# 4) Env をローカルに pull
green "Vercel から .env.production.local を取得します..."
npx vercel env pull .env.production.local

# 5) Prisma スキーマ適用（必ず入力値のDATABASE_URLを使用）
green "Prisma スキーマをクラウドDBに適用します..."
# いったん .env.production.local を読み込むが、直後に入力のURLを上書きする
set -a
# shellcheck disable=SC1091
. ./.env.production.local || true
set +a
export DATABASE_URL="$INPUT_DATABASE_URL"

if DATABASE_URL="$INPUT_DATABASE_URL" npx prisma migrate deploy; then
  green "migrate deploy が完了しました。"
else
  yellow "migrate が無い/失敗のため db push を試します..."
  DATABASE_URL="$INPUT_DATABASE_URL" npx prisma db push
fi

# 6) 本番デプロイ
green "Vercel 本番デプロイを行います..."
npx vercel --prod

green "完了！ /api/diag/env と /api/health で確認してください。"
