#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"

load_node_runtime
cd "$PROJECT_ROOT/web"

export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"

exec next start --hostname "$HOST" --port "$PORT"

