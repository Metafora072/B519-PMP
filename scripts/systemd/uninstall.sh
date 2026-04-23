#!/usr/bin/env bash
set -euo pipefail

SYSTEMD_DIR="/etc/systemd/system"

sudo systemctl disable --now b519-pmp.service 2>/dev/null || true
sudo rm -f \
  "$SYSTEMD_DIR/b519-pmp.service" \
  "$SYSTEMD_DIR/b519-pmp-deps.service" \
  "$SYSTEMD_DIR/b519-pmp-prepare.service" \
  "$SYSTEMD_DIR/b519-pmp-server.service" \
  "$SYSTEMD_DIR/b519-pmp-web.service"
sudo systemctl daemon-reload

printf '已卸载 b519-pmp systemd 单元。\n'

