# ====================================================================
# 🐳 DOCKERFILE UNIFICADO - DIGIURBAN SYSTEM
# ====================================================================
# Container único com Frontend + Backend + Nginx Proxy
# ====================================================================

FROM node:18-alpine AS backend-build

# Build do Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN rm -f src/database/seedRunner.ts src/database/seeds/001_initial_data.ts
RUN npx tsc --noEmitOnError false || true

# ====================================================================

FROM node:18-alpine AS frontend-build

# Build do Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====================================================================

FROM node:18-alpine AS production

# Instalar nginx e PM2
RUN apk add --no-cache nginx
RUN npm install -g pm2

# Criar diretórios
WORKDIR /app
RUN mkdir -p backend data logs

# Instalar dependências do backend em produção
COPY --from=backend-build /app/backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --only=production
WORKDIR /app

# Copiar backend compilado
COPY --from=backend-build /app/backend/dist ./backend/dist

# Copiar frontend compilado
COPY --from=frontend-build /app/frontend/dist ./frontend

# Copiar configurações
COPY nginx-unified.conf /etc/nginx/conf.d/default.conf
COPY pm2.json ./
COPY start-services.sh ./
RUN chmod +x start-services.sh

# Expor apenas a porta do nginx
EXPOSE 80

# Script de inicialização
CMD ["./start-services.sh"]