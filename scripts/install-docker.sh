#!/bin/bash
set -e

echo "=== Instalando Docker com Segurança ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Atualizando sistema..."
apt update && apt upgrade -y

echo "Instalando dependências..."
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    wget \
    jq

echo "Adicionando repositório Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Instalando Docker..."
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Criando usuário dedicado para Docker..."
if ! id "dockerapp" &>/dev/null; then
    useradd -r -s /bin/false -c "Docker application user" dockerapp
fi

echo "Configurando Docker daemon com segurança..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        }
    },
    "userland-proxy": false,
    "icc": false,
    "no-new-privileges": true
}
EOF

echo "Protegendo socket Docker..."
chmod 660 /var/run/docker.sock
chown root:dockerapp /var/run/docker.sock

echo "Habilitando e iniciando Docker..."
systemctl enable docker
systemctl start docker

echo "Verificando instalação..."
docker --version
docker compose version

echo ""
echo "=== Docker instalado com segurança! ==="
