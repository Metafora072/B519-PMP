#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"

ACTION="${1:-}"

if [ -z "$ACTION" ]; then
  fail "缺少动作参数，支持 start 或 stop。"
fi

resolve_docker_compose
cd "$PROJECT_ROOT"

case "$ACTION" in
  start)
    log "启动 Docker 依赖服务"
    "${DOCKER_COMPOSE_COMMAND[@]}" up -d
    ;;
  stop)
    log "停止 Docker 依赖服务"
    "${DOCKER_COMPOSE_COMMAND[@]}" stop
    ;;
  *)
    fail "不支持的动作: $ACTION"
    ;;
esac

