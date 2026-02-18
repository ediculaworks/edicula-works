#!/bin/bash
set -e

echo "=== Hardening SSH Seguro ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Fazendo backup da configuração SSH atual..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)

echo "Instalando fail2ban..."
apt install -y fail2ban

echo "Configurando SSH seguro..."
cat > /etc/ssh/sshd_config.d/edicula-hardening.conf <<'EOF'
# SSH Hardening - EdiculaWorks

# Porta alternativa (mude para sua preferência)
Port 2222

# Protocolo seguro
Protocol 2

# Desabilitar login root
PermitRootLogin no

# Autenticação por chave apenas
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no

# Timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar tentativas
MaxAuthTries 3
MaxSessions 10

# Banner
Banner /etc/ssh/banner

# Segurança adicional
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitUserEnvironment no
Compression delayed
UseDNS no
GSSAPIAuthentication no

# Logging
LogLevel VERBOSE

# KexAlgorithms
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512

# Ciphers
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr

# MACs
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512,hmac-sha2-256
EOF

echo "Criando banner SSH..."
cat > /etc/ssh/banner <<'EOF'
=====================================
  ACESSO AUTORIZADO SOMENTE
  EdiculaWorks - Infraestrutura
=====================================
 
 Todas as tentativas de acesso são
 monitoradas e registradas.
 
 Em caso de emergência, contacte:
   admin@ediculaworks.com
=====================================
EOF

echo "Verificando configuração SSH..."
sshd -t

echo "Reiniciando SSH..."
systemctl restart sshd

echo "Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
sender = fail2ban@ediculaworks.com
destemail = admin@ediculaworks.com

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[sshd-ddos]
enabled = true
port = 2222
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 10
bantime = 7200
EOF

echo "Reiniciando Fail2Ban..."
systemctl enable fail2ban
systemctl restart fail2ban

echo ""
echo "=== SSH securizado! ==="
echo ""
echo "ALTERAÇÕES FEITAS:"
echo "  - Porta alterada para 2222"
echo "  - Login root desabilitado"
echo "  - Autenticação por chave apenas"
echo "  - Fail2Ban ativo"
echo ""
echo "IMPORTANTE:"
echo "  1. Configure chave SSH antes de desconectar!"
echo "  2. Teste login na porta 2222 antes de fechar sessão atual"
echo ""
echo "Para adicionar sua chave:"
echo "  ssh-copy-id -p 2222 usuario@IP_DA_VPS"
echo ""
echo "Para verificar status do Fail2Ban:"
echo "  fail2ban-client status"
