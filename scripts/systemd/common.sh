#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_NAME="$(basename "${0:-b519-pmp}")"
CURRENT_STAGE="bootstrap"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  printf '%s [b519-pmp][%s] %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*"
}

warn() {
  printf '%s [b519-pmp][%s] %s\n' "$(timestamp)" "$SCRIPT_NAME" "$*" >&2
}

fail() {
  warn "$*"
  exit 1
}

begin_stage() {
  local stage="$1"
  shift

  CURRENT_STAGE="$stage"
  log "==> [$stage] $*"
}

complete_stage() {
  local stage="${1:-$CURRENT_STAGE}"
  shift || true

  log "<== [$stage] ${*:-完成}"
}

run_step() {
  local stage="$1"
  local description="$2"
  shift 2

  begin_stage "$stage" "$description"
  "$@"
  complete_stage "$stage" "$description"
}

terminate_pid_if_running() {
  local pid="$1"

  if kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
  fi
}

wait_for_http_with_pid() {
  local url="$1"
  local expected_codes="$2"
  local timeout_seconds="$3"
  local label="$4"
  local pid="$5"
  local stage_name="$6"
  local elapsed=0
  local last_code="unreachable"

  command -v curl >/dev/null 2>&1 || fail "未找到 curl，无法执行 ${label} 就绪检测。"

  begin_stage "$stage_name" "等待 ${label} 就绪: ${url}"

  while [ "$elapsed" -lt "$timeout_seconds" ]; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      set +e
      wait "$pid"
      local child_exit_code=$?
      set -e
      fail "${label} 进程提前退出，exit=${child_exit_code}"
    fi

    last_code="$(curl --noproxy '*' -k -s -o /dev/null -w '%{http_code}' "$url" || true)"

    for expected_code in $expected_codes; do
      if [ "$last_code" = "$expected_code" ]; then
        complete_stage "$stage_name" "${label} 已就绪 (HTTP ${last_code})"
        return 0
      fi
    done

    sleep 1
    elapsed=$((elapsed + 1))
  done

  terminate_pid_if_running "$pid"
  fail "${label} 在 ${timeout_seconds}s 内未就绪，最后 HTTP=${last_code}"
}

on_error() {
  local exit_code="$1"
  local line_number="$2"
  local command="$3"

  warn "阶段[$CURRENT_STAGE] 执行失败，line=${line_number}，exit=${exit_code}，command=${command}"
}

on_exit() {
  local exit_code="$1"

  if [ "$exit_code" -eq 0 ]; then
    log "脚本结束，当前阶段[$CURRENT_STAGE] 状态=success"
  else
    warn "脚本结束，当前阶段[$CURRENT_STAGE] 状态=failed，exit=${exit_code}"
  fi
}

install_script_traps() {
  trap 'on_error $? $LINENO "$BASH_COMMAND"' ERR
  trap 'on_exit $?' EXIT
}

prepend_path_if_dir() {
  local dir="$1"
  if [ -d "$dir" ]; then
    export PATH="$dir:$PATH"
  fi
}

load_node_runtime() {
  prepend_path_if_dir "$HOME/.local/bin"
  prepend_path_if_dir "$HOME/bin"
  prepend_path_if_dir "$HOME/.volta/bin"
  prepend_path_if_dir "$PROJECT_ROOT/node_modules/.bin"
  prepend_path_if_dir "$PROJECT_ROOT/web/node_modules/.bin"
  prepend_path_if_dir "$PROJECT_ROOT/server/node_modules/.bin"

  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
  fi

  if [ -s "$HOME/.asdf/asdf.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.asdf/asdf.sh" >/dev/null 2>&1 || true
  fi

  if command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env --use-on-cd)" >/dev/null 2>&1 || true
  fi

  local vscode_node=""
  for candidate in \
    "$HOME"/.vscode-server/bin/*/node \
    "$HOME"/.trae-cn-server/bin/*/node
  do
    if [ -x "$candidate" ]; then
      vscode_node="$candidate"
      break
    fi
  done

  if [ -n "$vscode_node" ]; then
    prepend_path_if_dir "$(dirname "$vscode_node")"
  fi

  # Prefer the system-managed Node.js runtime for systemd execution so
  # old VS Code / nvm shims do not pin the services to an unsupported version.
  if [ -x /usr/bin/node ] && [ -x /usr/bin/npm ]; then
    prepend_path_if_dir /usr/bin
  fi

  command -v node >/dev/null 2>&1 || fail "未找到 node，请先安装 Node.js。"
  command -v npm >/dev/null 2>&1 || fail "未找到 npm，请先安装 Node.js/npm。"
}

resolve_docker_compose() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_COMMAND=("docker" "compose")
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_COMMAND=("docker-compose")
    return
  fi

  fail "未找到 docker compose，请先安装 Docker。"
}
