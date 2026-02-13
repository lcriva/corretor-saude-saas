# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Instalar apenas dependências de produção para reduzir tamanho (opcional, mas mantive node_modules do builder para simplicidade com prisma)
# Se quiser otimizar: COPY package*.json ./ && npm install --only=production && COPY --from=builder /app/dist ./dist ...

EXPOSE 3001

# Variável de ambiente para persistência do WhatsApp
ENV WHATSAPP_AUTH_DIR="/app/auth_info_data"
ENV PORT=3001

CMD ["node", "dist/server.js"]
