#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"
install_script_traps

begin_stage "server-bootstrap" "加载 Node.js 运行时"
load_node_runtime
complete_stage "server-bootstrap" "Node.js 运行时已加载"

cd "$PROJECT_ROOT"

export NODE_ENV=production
PORT="${PORT:-3001}"
STARTUP_TIMEOUT_SEC="${STARTUP_TIMEOUT_SEC:-30}"

log "当前 Node 版本: $(node -v)"
begin_stage "server-start" "启动 NestJS 服务，端口=${PORT}"
node "$PROJECT_ROOT/server/dist/main.js" &
SERVER_PID=$!
log "NestJS 进程已拉起，pid=${SERVER_PID}"

wait_for_http_with_pid \
  "http://127.0.0.1:${PORT}/api/auth/me" \
  "200 401" \
  "$STARTUP_TIMEOUT_SEC" \
  "NestJS 服务" \
  "$SERVER_PID" \
  "server-ready"

CURRENT_STAGE="server-running"
log "NestJS 服务启动成功，进入持续运行阶段"
wait "$SERVER_PID"
