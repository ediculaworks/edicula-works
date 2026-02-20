#!/bin/bash
set -e

echo "=== [11] Configurando Nginx ==="

mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

sed -i "s/ediculaworks.com/$DOMAIN/g" "$PROJECT_DIR/config/nginx.conf"

cp "$PROJECT_DIR/config/nginx.conf" /etc/nginx/sites-available/ediculaworks
ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "✓ Nginx configurado"
