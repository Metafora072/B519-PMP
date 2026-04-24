#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"
install_script_traps

ACTION="${1:-}"

if [ -z "$ACTION" ]; then
  fail "缺少动作参数，支持 start 或 stop。"
fi

resolve_docker_compose
cd "$PROJECT_ROOT"

case "$ACTION" in
  start)
    run_step "deps-start" "启动 Docker 依赖服务(postgres, redis)" \
      "${DOCKER_COMPOSE_COMMAND[@]}" up -d
    begin_stage "deps-status" "检查 Docker 依赖状态"
    "${DOCKER_COMPOSE_COMMAND[@]}" ps
    complete_stage "deps-status" "Docker 依赖状态已输出"
    ;;
  stop)
    run_step "deps-stop" "停止 Docker 依赖服务(postgres, redis)" \
      "${DOCKER_COMPOSE_COMMAND[@]}" stop
    ;;
  *)
    fail "不支持的动作: $ACTION"
    ;;
esac
