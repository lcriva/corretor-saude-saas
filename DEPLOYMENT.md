# Guia de Implantação: Servidor VPS (Manual / Ubuntu)

Este guia descreve como instalar sua aplicação SaaS do zero em um servidor Linux (VPS).

**Requisitos:**
- Servidor VPS com **Ubuntu 22.04** ou superior (Recomendado: 2GB RAM+).
- Domínio apontado para o IP do servidor (Registro A).

---

## 1. Acessar o Servidor e Atualizar
Acesse seu servidor via terminal (SSH) e atualize os pacotes:
```bash
ssh root@seu-ip-aqui
sudo apt update && sudo apt upgrade -y
```

## 2. Instalar Ferramentas Básicas (Node.js, Git, Nginx, PM2)
```bash
# Instalar curl e git
sudo apt install -y curl git nginx

# Instalar Node.js 20 (versão LTS recomendada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Confirmar instalação
node -v  # Deve ser v20.x.x
npm -v

# Instalar PM2 globalmente (Gerenciador de Processos)
sudo npm install -g pm2
```

## 3. Instalar e Configurar PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Entrar no prompt do Postgres
sudo -u postgres psql

# --- DENTRO DO PROMPT DO POSTGRES (copie linha por linha) ---
-- 1. Criar banco de dados
CREATE DATABASE corretorsaude;

-- 2. Alterar senha do usuário 'postgres' (IMPORTANTE: Mude 'sua_senha_segura'!)
ALTER USER postgres WITH PASSWORD 'L';

-- 3. Sair
\q
# ------------------------------------------------------------
```

## 4. Clonar e Configurar o Projeto
```bash
# Ir para pasta de sites
cd /var/www

git clone https://github.com/lcriva/corretor-saude-saas.git app

# Entrar na pasta
cd app
```

### 4.1. Configurar Backend
```bash
cd backend

# Criar arquivo .env
nano .env
# --- COLE O CONTEÚDO ---
DATABASE_URL="postgresql://postgres:Lueta@28092018@localhost:5432/corretorsaude?schema=public"
JWT_SECRET="a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4"
OPENAI_API_KEY="sk-..."
PORT=3001
# -----------------------
# Salve (Ctrl+O, Enter) e Saia (Ctrl+X)

# Instalar dependências e buildar
npm install
npx prisma generate
npx prisma migrate deploy  # Cria as tabelas no banco
npm run build
npx prisma db seed # Criar usuário admin inicial (demo@corretor.com)
```

### 4.2. Configurar Frontend
```bash
cd ../frontend

# Criar arquivo .env.local
nano .env.local
# --- COLE O CONTEÚDO ---
NEXT_PUBLIC_API_URL=https://api.preventseniormelhoridade.com.br
# -----------------------
# Salve e Saia

# Instalar dependências e buildar
npm install
npm run build
```

## 5. Iniciar Aplicação com PM2
Volte para a raiz do projeto e inicie tudo:
```bash
cd /var/www/app
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# (Execute o comando que o 'pm2 startup' pedir para rodar)
```

## 6. Configurar Nginx (Proxy Reverso)
O Nginx vai receber os acessos do domínio e mandar para o Node.js.

```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/corretorsaude
```

**Conteúdo do arquivo (Copie e ajuste o domínio):**
```nginx
# 1. API Backend (api.preventseniormelhoridade.com.br)
server {
    server_name api.preventseniormelhoridade.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. Frontend (preventseniormelhoridade.com.br)
server {
    server_name preventseniormelhoridade.com.br www.preventseniormelhoridade.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site e reiniciar Nginx
sudo ln -s /etc/nginx/sites-available/corretorsaude /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # (Opcional: remove site padrão)
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Configurar HTTPS (Cadeado de Segurança)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d preventseniormelhoridade.com.br -d www.preventseniormelhoridade.com.br -d api.preventseniormelhoridade.com.br
```

---
**Pronto!** Seu sistema deve estar acessível em `https://preventseniormelhoridade.com.br`.
