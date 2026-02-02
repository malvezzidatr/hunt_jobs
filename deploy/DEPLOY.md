# Deploy na Oracle Cloud - Hunt Jobs

## Pré-requisitos

- Conta Oracle Cloud (gratuita): https://www.oracle.com/cloud/free/
- Chaves SSH geradas no seu computador

---

## 1. Criar Conta Oracle Cloud

1. Acesse https://www.oracle.com/cloud/free/
2. Clique em "Start for free"
3. Preencha os dados (não precisa de cartão para Always Free)
4. Aguarde verificação (pode levar alguns minutos)

---

## 2. Criar VM (Compute Instance)

### 2.1 Acessar Console

1. Faça login em https://cloud.oracle.com
2. No menu, vá em **Compute** → **Instances**
3. Clique **Create Instance**

### 2.2 Configurar Instância

| Campo | Valor |
|-------|-------|
| **Name** | `hunt-jobs` |
| **Compartment** | (manter default) |
| **Placement** | (manter default) |

### 2.3 Image and Shape

1. Clique **Edit** em "Image and shape"
2. **Image**: Ubuntu 22.04 (Canonical Ubuntu)
3. **Shape**: Clique "Change shape"
   - Shape series: **Ampere** (ARM, mais recursos grátis) ou **AMD**
   - Para AMD: VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
   - Para ARM: VM.Standard.A1.Flex (até 4 OCPU, 24GB RAM - configure 1 OCPU, 6GB RAM)

### 2.4 Networking

1. Clique **Edit** em "Networking"
2. **Virtual cloud network**: Create new VCN (ou use existente)
3. **Subnet**: Create new public subnet
4. **Public IPv4 address**: Assign a public IPv4 address ✅

### 2.5 SSH Keys

1. Clique **Edit** em "Add SSH keys"
2. Selecione **Paste public keys**
3. Cole sua chave pública SSH (~/.ssh/id_rsa.pub)

### 2.6 Boot Volume

- Manter padrão (50GB é suficiente)

### 2.7 Criar

Clique **Create** e aguarde a instância ficar "Running"

---

## 3. Configurar Security List (Firewall)

1. Na página da instância, clique no **Subnet** link
2. Clique na **Security List** (Default Security List)
3. Clique **Add Ingress Rules**
4. Adicione regras:

| Source CIDR | Protocol | Dest Port | Description |
|-------------|----------|-----------|-------------|
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | TCP | 3000 | API (opcional, se não usar nginx) |

---

## 4. Conectar à VM

```bash
# Pegue o IP público na página da instância
ssh ubuntu@SEU_IP_PUBLICO
```

---

## 5. Setup da VM

### 5.1 Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 5.2 Instalar Docker

```bash
# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Sair e entrar novamente para aplicar grupo
exit
```

### 5.3 Reconectar

```bash
ssh ubuntu@SEU_IP_PUBLICO
```

### 5.4 Configurar Firewall (iptables)

```bash
# Abrir portas
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# Persistir regras
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## 6. Deploy da Aplicação

### 6.1 Clonar Repositório

```bash
# Criar diretório
sudo mkdir -p /opt/hunt-jobs
sudo chown $USER:$USER /opt/hunt-jobs
cd /opt/hunt-jobs

# Clonar (substitua pela sua URL)
git clone https://github.com/SEU_USUARIO/hunt-jobs.git .
```

### 6.2 Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env na raiz
cat > .env << 'EOF'
# API Keys (obrigatórias para AI features)
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx

# URLs
VITE_API_URL=http://SEU_IP_PUBLICO:3000
EOF
```

### 6.3 Build e Start

```bash
# Build das imagens
docker compose build

# Iniciar em background
docker compose up -d

# Ver logs
docker compose logs -f
```

### 6.4 Verificar

```bash
# Testar API
curl http://localhost:3000/jobs/stats

# Testar frontend
curl http://localhost:80
```

---

## 7. Configurar Inicialização Automática

```bash
# Copiar service file
sudo cp deploy/hunt-jobs.service /etc/systemd/system/

# Habilitar serviço
sudo systemctl daemon-reload
sudo systemctl enable hunt-jobs

# Agora reinicia automaticamente com a VM
```

---

## 8. (Opcional) Configurar Domínio + HTTPS

### 8.1 Apontar Domínio

No seu provedor de DNS, crie um registro A apontando para o IP público da VM.

### 8.2 Instalar Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Copiar config nginx
sudo cp deploy/nginx-proxy.conf /etc/nginx/sites-available/hunt-jobs

# Editar e trocar YOUR_DOMAIN_OR_IP pelo seu domínio
sudo nano /etc/nginx/sites-available/hunt-jobs

# Habilitar site
sudo ln -s /etc/nginx/sites-available/hunt-jobs /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com
```

---

## Comandos Úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs
docker compose logs -f api
docker compose logs -f web

# Reiniciar
docker compose restart

# Atualizar código
cd /opt/hunt-jobs
git pull
docker compose build
docker compose up -d

# Forçar sync de vagas
curl -X POST http://localhost:3000/jobs/sync

# Ver estatísticas
curl http://localhost:3000/jobs/stats
```

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs api

# Verificar se porta está ocupada
sudo lsof -i :3000
```

### Não consegue acessar externamente

1. Verificar Security List no Oracle Cloud
2. Verificar iptables: `sudo iptables -L INPUT -n`
3. Verificar se container está rodando: `docker compose ps`

### Banco de dados corrompido

```bash
# Parar containers
docker compose down

# Remover volume do banco
docker volume rm hunt-jobs_api-data

# Reiniciar (vai criar banco novo)
docker compose up -d
```

---

## Custos

| Recurso | Custo |
|---------|-------|
| VM (Always Free) | $0 |
| Storage (50GB) | $0 |
| Bandwidth (10TB/mês) | $0 |
| **Total** | **$0/mês** |
