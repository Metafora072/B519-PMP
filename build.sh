#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
JOURNAL_PID=""

cleanup() {
  if [ -n "$JOURNAL_PID" ] && kill -0 "$JOURNAL_PID" >/dev/null 2>&1; then
    kill "$JOURNAL_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "[build.sh] 预热 sudo 凭据..."
sudo -v

echo "[build.sh] 重新安装 systemd 单元..."
bash "$PROJECT_ROOT/scripts/systemd/install.sh"

SINCE_TS="$(date '+%Y-%m-%d %H:%M:%S')"

sudo journalctl \
  -u b519-pmp-deps.service \
  -u b519-pmp-prepare.service \
  -u b519-pmp-server.service \
  -u b519-pmp-web.service \
  --no-pager \
  --output=short-iso \
  --since "$SINCE_TS" \
  -f &
JOURNAL_PID=$!

sleep 1

echo "[build.sh] 启动 B519-PMP 服务..."
sudo systemctl restart b519-pmp.service

echo "[build.sh] 服务已构建，继续跟随日志，按 Ctrl+C 退出。"
wait "$JOURNAL_PID"
