#!/bin/sh

# ====================================================================
# 🚀 SCRIPT DE INICIALIZAÇÃO - DIGIURBAN UNIFICADO
# ====================================================================

echo "🚀 Iniciando Digiurban System..."

# Criar logs directory
mkdir -p /app/logs

# Iniciar backend com PM2
echo "🔧 Iniciando Backend..."
cd /app && pm2 start pm2.json --no-daemon &

# Aguardar backend inicializar
sleep 5

# Verificar se backend está rodando
echo "🔍 Verificando Backend..."
if ! curl -f http://localhost:3021/api/health >/dev/null 2>&1; then
  echo "❌ Backend não iniciou corretamente"
  pm2 logs
  exit 1
fi

echo "✅ Backend iniciado com sucesso"

# Iniciar Nginx
echo "🌐 Iniciando Nginx..."
nginx -g 'daemon off;' &

# Manter container rodando
wait