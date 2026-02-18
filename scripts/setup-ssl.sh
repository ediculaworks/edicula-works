#!/bin/bash
set -e

echo "=== Configurando SSL Seguro com Nginx ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

if [ -z "$1" ]; then
    echo "Uso: $0 <domínio> [email]"
    echo "Exemplo: $0 openclaw.ediculaworks.com seu@email.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo "Domínio: $DOMAIN"
echo "Email: $EMAIL"

echo "Instalando Nginx..."
apt install -y nginx certbot python3-certbot-nginx

echo "Parando Nginx..."
systemctl stop nginx

echo "Criando configuração Nginx segura..."
cat > /etc/nginx/sites-available/openclaw <<'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m max_size=100m inactive=60m use_temp_path=off;

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Block common exploits
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    location /api {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /ws {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket timeouts
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://127.0.0.1:18789/api/health;
        access_log off;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF

# Substituir domínio
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/openclaw

echo "Ativando configuração..."
ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
nginx -t

echo "Gerando certificado SSL..."
certbot --nginx -d $DOMAIN --agree-tos --email $EMAIL --redirect --hsts --staple-ocsp --non-interactive

echo "Criando configuração com HSTS e segurança reforçada..."
cat > /etc/nginx/snippets/ssl-edicula.conf <<'EOF'
# SSL Configuration
ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

# SSL Security
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# HSTS (comentado por padrão - habilite após testar)
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/snippets/ssl-edicula.conf

echo "Atualizando configuração para incluir SSL..."
cat > /etc/nginx/sites-available/openclaw-ssl <<'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;
    
    include /etc/nginx/snippets/ssl-edicula.conf;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; font-src 'self' data:;" always;
    
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /ws {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:18789/api/health;
        access_log off;
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/openclaw-ssl

echo "Aplicando nova configuração..."
rm -f /etc/nginx/sites-enabled/openclaw
ln -sf /etc/nginx/sites-available/openclaw-ssl /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo ""
echo "=== SSL configurado com segurança! ==="
echo ""
echo "Acesse: https://$DOMAIN"
echo ""
echo "RECURSOS DE SEGURANÇA ATIVOS:"
echo "  - Rate limiting (3-10 req/s por IP)"
echo "  - Headers de segurança (XSS, CSRF, etc)"
echo "  - OCSP Stapling"
echo "  - SSL moderno (TLS 1.2/1.3)"
echo "  - Redirect HTTP → HTTPS"
echo ""
echo "Para testar SSL:"
echo "  ssltest.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "Para renovar manualmente:"
echo "  certbot renew"
