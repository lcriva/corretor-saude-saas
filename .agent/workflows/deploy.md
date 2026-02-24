---
description: como fazer deploy das atualizações no servidor VPS
---

## Deploy no Servidor

Conecte via SSH e rode os comandos abaixo na ordem:

```bash
cd /var/www/app

# 1. Baixar alterações do GitHub
git pull origin main

# 2. Instalar dependências do backend (se houver pacotes novos)
cd backend && npm install

# 3. Sincronizar schema com o banco (apenas quando schema.prisma mudar)
npx prisma db push

# 4. Rebuild do frontend (sempre que arquivos .tsx, .ts ou .css do frontend mudarem)
cd ../frontend && npm run build

# 5. Reiniciar todos os serviços
pm2 restart all

# 6. Verificar status
pm2 status
```

## Quando rodar cada etapa

| Etapa | Quando rodar |
|---|---|
| `git pull` | **SEMPRE** |
| `npm install` | Quando `package.json` mudou |
| `prisma db push` | Quando `schema.prisma` mudou |
| `npm run build` | Quando qualquer arquivo do `frontend/` mudou |
| `pm2 restart all` | **SEMPRE** |
