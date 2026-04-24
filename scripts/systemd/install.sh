#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
UNITS_DIR="$PROJECT_ROOT/scripts/systemd/units"
SYSTEMD_DIR="/etc/systemd/system"
RUN_USER="${RUN_USER:-$(stat -c %U "$PROJECT_ROOT")}"
RUN_GROUP="${RUN_GROUP:-$(stat -c %G "$PROJECT_ROOT")}"
AUTO_START="false"

if [ "${1:-}" = "--start" ]; then
  AUTO_START="true"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log() {
  printf '[b519-pmp][install] %s\n' "$*"
}

render_unit() {
  local template_file="$1"
  local target_file="$2"

  sed \
    -e "s|__PROJECT_ROOT__|$PROJECT_ROOT|g" \
    -e "s|__RUN_USER__|$RUN_USER|g" \
    -e "s|__RUN_GROUP__|$RUN_GROUP|g" \
    "$template_file" > "$target_file"
}

for template in "$UNITS_DIR"/*.in; do
  base_name="$(basename "$template" .in)"
  log "渲染 unit: $base_name"
  render_unit "$template" "$TMP_DIR/$base_name"
  sudo install -m 0644 "$TMP_DIR/$base_name" "$SYSTEMD_DIR/$base_name"
done

log "更新脚本执行权限"
sudo chmod +x \
  "$PROJECT_ROOT/scripts/systemd/common.sh" \
  "$PROJECT_ROOT/scripts/systemd/manage-deps.sh" \
  "$PROJECT_ROOT/scripts/systemd/prepare-app.sh" \
  "$PROJECT_ROOT/scripts/systemd/run-server.sh" \
  "$PROJECT_ROOT/scripts/systemd/run-web.sh"

log "执行 systemd daemon-reload"
sudo systemctl daemon-reload
log "启用 b519-pmp.service"
sudo systemctl enable b519-pmp.service

if [ "$AUTO_START" = "true" ]; then
  log "自动启动 b519-pmp.service"
  sudo systemctl restart b519-pmp.service
fi

printf '已安装 systemd 单元。\n'
printf '启动: sudo systemctl start b519-pmp.service\n'
printf '停止: sudo systemctl stop b519-pmp.service\n'
printf '状态: sudo systemctl status b519-pmp.service\n'
printf '日志: sudo journalctl -u b519-pmp-deps.service -u b519-pmp-prepare.service -u b519-pmp-server.service -u b519-pmp-web.service -f\n'
