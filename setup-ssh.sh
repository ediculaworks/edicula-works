#!/bin/bash
set -e

echo "============================================"
echo "  CONFIGURAR SSH SEGURO"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

read -p "Sua chave pública SSH (cole aqui): " SSH_KEY
read -p "Usuário non-root (padrão: edicula): " USERNAME
USERNAME=${USERNAME:-edicula}

if [ -z "$SSH_KEY" ]; then
    echo "Erro: Chave SSH não fornecida"
    exit 1
fi

echo ""
echo "Configurando usuário $USERNAME..."

# Criar usuário se não existir
if ! id "$USERNAME" &>/dev/null; then
    adduser --gecos "" $USERNAME
    echo "   ✓ Usuário criado"
else
    echo "   ✓ Usuário já existe"
fi

# Grupos
usermod -aG sudo $USERNAME
usermod -aG docker $USERNAME
echo "   ✓ Grupos configurados"

# Configurar chaves SSH
mkdir -p /home/$USERNAME/.ssh
echo "$SSH_KEY" > /home/$USERNAME/.ssh/authorized_keys
chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh
chmod 700 /home/$USERNAME/.ssh
chmod 600 /home/$USERNAME/.ssh/authorized_keys
echo "   ✓ Chave SSH adicionada"

# Hardening SSH
echo ""
echo "Aplicando hardening SSH..."
cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
Port 2222
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
LogLevel VERBOSE
EOF
echo "   ✓ Configuração aplicada"

# Firewall
echo ""
echo "Abrindo porta 2222 no firewall..."
ufw allow 2222/tcp comment 'SSH-new' > /dev/null 2>&1
echo "   ✓ Porta aberta"

# Testar configuração
echo ""
echo "Testando configuração SSH..."
if sshd -t; then
    echo "   ✓ Configuração válida"
else
    echo "   ✗ Erro na configuração!"
    exit 1
fi

echo ""
echo "============================================"
echo "  IMPORTANTE!"
echo "============================================"
echo ""
echo "  ANTES de fechar esta conexão, abra um NOVO terminal"
echo "  e teste o acesso:"
echo ""
echo "    ssh -p 2222 $USERNAME@$(curl -s ifconfig.me)"
echo ""
echo "  Se funcionar, você pode fechar esta sessão."
echo "  Se NÃO funcionar, NÃO feche esta sessão!"
echo ""
read -p "Já testou? Confirma que funcionou? [s/n] " confirm

if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
    echo ""
    echo "Reiniciando SSH..."
    systemctl restart sshd
    echo ""
    echo "============================================"
    echo "  SSH CONFIGURADO!"
    "============================================"
    echo ""
    echo "  Conexão: ssh -p 2222 $USERNAME@$(curl -s ifconfig.me)"
    echo "  Senha desativada - apenas chave SSH"
    echo ""
else
    echo ""
    echo "Configure sua chave primeiro, depois execute:"
    echo "  systemctl restart sshd"
fi
