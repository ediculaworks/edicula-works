#!/bin/bash
set -e

echo "=== [10] Configurando SSL ==="

apt install -y nginx certbot python3-certbot-nginx

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    systemctl stop nginx
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
fi

systemctl enable certbot.timer
systemctl start certbot.timer

echo "✓ SSL configurado"
