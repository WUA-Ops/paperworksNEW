#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/wyx/code/paper_work"
CONF_NAME="paperworker.conf"
DOMAIN="paperworker.top"
SSL_DIR="/etc/nginx/ssl"

echo "===== 部署 paperworker.top Nginx 配置 ====="

echo "[1/6] 复制SSL证书到 $SSL_DIR/"
mkdir -p "$SSL_DIR"
cp "$PROJECT_DIR/nginx/ssl/paperworker.top_bundle.crt" "$SSL_DIR/paperworker.top_bundle.crt"
cp "$PROJECT_DIR/nginx/ssl/paperworker.top.key" "$SSL_DIR/paperworker.top.key"
chmod 600 "$SSL_DIR/paperworker.top.key"
chmod 644 "$SSL_DIR/paperworker.top_bundle.crt"

echo "[2/6] 复制配置文件到 /etc/nginx/sites-available/"
cp "$PROJECT_DIR/nginx/$CONF_NAME" /etc/nginx/sites-available/$CONF_NAME

echo "[3/6] 创建符号链接到 /etc/nginx/sites-enabled/"
ln -sf /etc/nginx/sites-available/$CONF_NAME /etc/nginx/sites-enabled/$CONF_NAME

echo "[4/6] 移除默认站点（如存在）"
rm -f /etc/nginx/sites-enabled/default

echo "[5/6] 测试 Nginx 配置"
nginx -t

echo "[6/6] 重启 Nginx"
systemctl restart nginx

echo ""
echo "===== 部署完成 ====="
echo "站点: https://$DOMAIN"
echo "静态文件目录: $PROJECT_DIR/dist"
echo "SSL证书目录: $SSL_DIR"
