#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() {
  printf '[b519-pmp] %s\n' "$*"
}

fail() {
  printf '[b519-pmp] %s\n' "$*" >&2
  exit 1
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
