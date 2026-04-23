#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/common.sh"

load_node_runtime
cd "$PROJECT_ROOT"

export NODE_ENV=production
exec node "$PROJECT_ROOT/server/dist/main.js"

