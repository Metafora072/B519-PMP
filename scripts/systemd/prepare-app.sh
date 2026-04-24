#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"
install_script_traps

begin_stage "prepare-bootstrap" "加载 Node.js 运行时"
load_node_runtime
complete_stage "prepare-bootstrap" "Node.js 运行时已加载"

cd "$PROJECT_ROOT"
export NEXT_TELEMETRY_DISABLED=1

log "当前 Node 版本: $(node -v)"
log "当前 npm 版本: $(npm -v)"

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  run_step "prepare-install-deps" "检测到缺少 node_modules，开始安装依赖" \
    npm install
else
  begin_stage "prepare-install-deps" "依赖目录已存在，跳过 npm install"
  complete_stage "prepare-install-deps" "使用现有 node_modules"
fi

run_step "prepare-prisma-generate" "生成 Prisma Client" \
  npm run prisma:generate -w server

if find "$PROJECT_ROOT/server/prisma/migrations" -mindepth 2 -maxdepth 2 -name migration.sql -print -quit 2>/dev/null | grep -q .; then
  run_step "prepare-prisma-deploy" "执行 Prisma migrate deploy" \
    npm run prisma:deploy -w server
else
  run_step "prepare-prisma-db-push" "未发现 migration 文件，执行 Prisma db push 兜底建表" \
    npm exec -w server prisma db push -- --accept-data-loss
fi

run_step "prepare-build-server" "构建后端" \
  npm run build:server

run_step "prepare-build-web" "构建前端" \
  npm run build:web

begin_stage "prepare-summary" "准备阶段全部完成"
complete_stage "prepare-summary" "依赖、Prisma、后端、前端均已完成"
