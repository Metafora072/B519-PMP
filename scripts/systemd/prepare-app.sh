#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"

load_node_runtime
cd "$PROJECT_ROOT"
export NEXT_TELEMETRY_DISABLED=1

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  log "检测到缺少 node_modules，开始安装依赖"
  npm install
fi

log "生成 Prisma Client"
npm run prisma:generate -w server

log "执行 Prisma migrate deploy"
npm run prisma:deploy -w server

log "构建后端"
npm run build:server

log "构建前端"
npm run build:web
