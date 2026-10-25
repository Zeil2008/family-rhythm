#!/bin/sh
set -eu

APP_DIR="/volume1/docker/family-rhythm"
BACKUP_ROOT="/volume1/docker/family-rhythm-backups"
TOOL_BIN="/var/packages/ContainerManager/target/usr/bin"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 sudo 运行：sudo sh $APP_DIR/deploy/synology-update.sh"
  exit 1
fi

cd "$APP_DIR"
if [ ! -f docker-compose.yml ] || [ ! -f server.js ]; then
  echo "错误：$APP_DIR 不是正确的项目目录。"
  exit 1
fi

if [ -x "$TOOL_BIN/docker-compose" ]; then
  COMPOSE="$TOOL_BIN/docker-compose"
  export PATH="$TOOL_BIN:$PATH"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="$(command -v docker-compose)"
else
  echo "错误：找不到 docker-compose。"
  exit 1
fi

echo "[1/5] 停止当前容器"
"$COMPOSE" down

echo "[2/5] 备份 data 到 $BACKUP_ROOT"
mkdir -p "$BACKUP_ROOT"
tar -czf "$BACKUP_ROOT/data-$STAMP.tar.gz" data
echo "备份完成：$BACKUP_ROOT/data-$STAMP.tar.gz"

echo "[3/5] 清理旧构建并重新构建"
"$COMPOSE" build --no-cache

echo "[4/5] 使用新镜像启动"
"$COMPOSE" up -d --force-recreate

echo "[5/5] 当前容器状态"
"$COMPOSE" ps

echo "应用版本："
sed -n 's/.*"version": "\([^"]*\)".*/\1/p' package.json | head -1

echo "版本接口："
if command -v curl >/dev/null 2>&1; then
  sleep 2
  curl -fsS http://127.0.0.1:3000/api/version || true
fi

echo
echo "更新完成。请查看上方版本接口是否返回 1.2.1。"
