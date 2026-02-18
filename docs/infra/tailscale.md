# Tailscale - VPN e Acesso Remoto

## Visão Geral

Tailscale fornece VPN segura para acesso remoto à infraestrutura EdiculaWorks. Permite conexão privada criptografada entre dispositivos autorizados e a VPS.

## Instalação

### 1. Instalar Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

### 2. Autenticar

```bash
tailscale up --accept-routes --accept-dns
```

Este comando exibirá uma URL de autenticação. Acesse pelo navegador e faça login com sua conta Google/GitHub/Microsoft.

### 3. Verificar Status

```bash
tailscale status
```

Saída esperada:
```
100.x.x.x    laptop         linux   -
100.x.x.x    vps-edicula    linux   online
```

## Configuração

### Acesso Remoto (Funnel)

Para expor o OpenClaw pela internet usando Tailscale:

```bash
tailscale funnel 18789
```

Verificar:

```bash
tailscale funnel status
```

### Rede Tailscale

A VPS terá um IP na rede 100.x.x.x (ex: 100.64.0.1)

Para conectar:
1. Instale Tailscale no dispositivo
2. Faça login com a mesma conta
3. Acesse via http://100.x.x.x:18789

## Comandos Úteis

### Ver dispositivos conectados

```bash
tailscale status
```

### Ver IP da VPS no Tailscale

```bash
tailscale ip -4
```

### Desconectar

```bash
tailscale down
```

### Reconectar

```bash
tailscale up
```

### Ver logs

```bash
journalctl -u tailscaled -f
```

## Configuração Avançada

### Arquivo de configuração

Edite `/etc/tailscale/tailscaled.conf`:

```ini
PORT=41641
FLAGS=--accept-routes --accept-dns
```

### SSH via Tailscale

Habilite SSH através do Tailscale:

```bash
tailscale ssh vps-edicula
```

### Servidor de arquivos

Para compartilhar arquivos:

```bash
tailscale file-server --listen :8080
```

Acesse pelos outros dispositivos em `http://100.x.x.x:8080`

## Segurança

### Acesso Restrito

Por padrão, apenas dispositivos logados na mesma conta Tailscale podem acessar.

### Auditar Acessos

```bash
tailscale lastseen
```

### Desativar encaminhamento

```bash
tailscale up --accept-routes=false
```

## Integração com Nginx

### Proxy para acesso Tailscale

Configure Nginx para servir via domínio:

```bash
nano /etc/nginx/sites-available/openclaw
```

```nginx
server {
    listen 80;
    server_name openclaw.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Troubleshooting

### Não consegue conectar

1. Verifique se o Tailscale está rodando:
```bash
systemctl status tailscaled
```

2. Reinicie o serviço:
```bash
systemctl restart tailscaled
```

3. Verifique a conexão:
```bash
tailscale status
```

### Porta bloqueada

Se a porta 41641 estiver bloqueada:

```bash
# Verificar firewall
sudo iptables -L -n

# Abrir porta
sudo iptables -A INPUT -p udp --dport 41641 -j ACCEPT
```

### Log de conexões

```bash
journalctl -u tailscaled -f | grep -i "peer"
```

## Manutenção

### Atualizar Tailscale

```bash
apt update && apt upgrade tailscale
```

### Desinstalar

```bash
apt remove tailscale
rm -rf /var/lib/tailscale
```

## Limitações do Plano Grátis

- Até 3 dispositivos
- Sem suporte prioritário
- Recursos básicos suficientes para uso pessoal/empresa pequena

## Boas Práticas

1. **Mantenha o客户端 atualizado** - Atualize Tailscale em todos os dispositivos
2. **Revise dispositivos conectados** - Verifique periodicamente quem tem acesso
3. **Use autenticação** - Configure senha no OpenClaw mesmo via Tailscale
4. **Monitore acessos** - Use `tailscale lastseen` para auditing
