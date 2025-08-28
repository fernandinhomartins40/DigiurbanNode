# ====================================================================
# 🐳 DOCKERFILE UNIFICADO - DIGIURBAN SYSTEM
# ====================================================================
# Container único com Frontend + Backend + Nginx Proxy
# ====================================================================

FROM node:20-alpine AS backend-build

# Build do Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN rm -f src/database/seedRunner.ts src/database/seeds/001_initial_data.ts src/database/seed.ts
RUN npm run build

# ====================================================================

FROM node:20-alpine AS frontend-build

# Build do Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====================================================================

FROM node:20-alpine AS production

# Instalar nginx e PM2
RUN apk add --no-cache nginx
RUN npm install -g pm2

# Criar usuário não-privilegiado
RUN addgroup -g 1001 -S digiurban && \
    adduser -S digiurban -u 1001 -G digiurban

# Criar diretórios com permissões corretas
WORKDIR /app
RUN mkdir -p backend data logs && \
    chown -R digiurban:digiurban /app && \
    chown -R digiurban:digiurban /var/log/nginx && \
    chown -R digiurban:digiurban /var/lib/nginx && \
    chown -R digiurban:digiurban /run/nginx

# Instalar apenas dependências de produção do backend
COPY --from=backend-build /app/backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev
WORKDIR /app

# Copiar backend compilado com permissões corretas
COPY --from=backend-build --chown=digiurban:digiurban /app/backend/dist ./backend/dist

# Copiar frontend compilado com permissões corretas
COPY --from=frontend-build --chown=digiurban:digiurban /app/frontend/dist ./frontend

# Copiar configurações
COPY --chown=digiurban:digiurban nginx-unified.conf /etc/nginx/conf.d/default.conf
COPY --chown=digiurban:digiurban pm2.json ./
COPY --chown=digiurban:digiurban start-services.sh ./
RUN chmod +x start-services.sh

# Trocar para usuário não-root
USER digiurban

# Expor apenas a porta do nginx
EXPOSE 3020

# Script de inicialização
CMD ["./start-services.sh"]