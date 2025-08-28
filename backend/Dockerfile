# ====================================================================
# 🐳 DOCKERFILE - DIGIURBAN BACKEND
# ====================================================================

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório de dados
RUN mkdir -p data

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]