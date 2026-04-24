#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"
install_script_traps

begin_stage "web-bootstrap" "加载 Node.js 运行时"
load_node_runtime
complete_stage "web-bootstrap" "Node.js 运行时已加载"

cd "$PROJECT_ROOT/web"

export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"
STARTUP_TIMEOUT_SEC="${STARTUP_TIMEOUT_SEC:-45}"

log "当前 Node 版本: $(node -v)"
begin_stage "web-start" "启动 Next.js Web 服务，host=${HOST}，port=${PORT}"
next start --hostname "$HOST" --port "$PORT" &
WEB_PID=$!
log "Next.js 进程已拉起，pid=${WEB_PID}"

wait_for_http_with_pid \
  "http://127.0.0.1:${PORT}/login" \
  "200 307 308" \
  "$STARTUP_TIMEOUT_SEC" \
  "Next.js Web 服务" \
  "$WEB_PID" \
  "web-ready"

CURRENT_STAGE="web-running"
log "Next.js Web 服务启动成功，进入持续运行阶段"
wait "$WEB_PID"
