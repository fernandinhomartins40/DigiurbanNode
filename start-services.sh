#!/bin/sh

# ====================================================================
# 🚀 SCRIPT DE INICIALIZAÇÃO - DIGIURBAN UNIFICADO
# ====================================================================
# Configuração segura para usuário não-privilegiado
# ====================================================================

echo "🚀 Iniciando Digiurban System..."

# Verificar permissões
echo "👤 Executando como usuário: $(whoami)"
echo "🔒 UID/GID: $(id)"

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p /app/logs /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Iniciar backend com PM2
echo "🔧 Iniciando Backend..."
cd /app && pm2 start pm2.json --no-daemon &

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 10

# Verificar se backend está rodando (retry com timeout)
echo "🔍 Verificando Backend..."
retries=0
max_retries=30

while [ $retries -lt $max_retries ]; do
  if curl -f http://localhost:3021/api/health >/dev/null 2>&1; then
    echo "✅ Backend iniciado com sucesso"
    break
  fi
  echo "⏳ Tentativa $((retries + 1))/$max_retries - Aguardando backend..."
  retries=$((retries + 1))
  sleep 2
done

if [ $retries -eq $max_retries ]; then
  echo "❌ Backend não iniciou após $max_retries tentativas"
  pm2 logs --nostream
  exit 1
fi

# Iniciar Nginx com configuração não-root
echo "🌐 Iniciando Nginx..."
nginx -c /etc/nginx/nginx.conf -g 'daemon off;' &

# Aguardar nginx inicializar
sleep 2

# Verificar se nginx está rodando
echo "🔍 Verificando Nginx..."
if ! curl -f http://localhost:8080/health >/dev/null 2>&1; then
  echo "❌ Nginx não iniciou corretamente"
  cat /tmp/error.log
  exit 1
fi

echo "✅ Nginx iniciado com sucesso"
echo "🎉 Sistema DigiUrban rodando em http://localhost:8080"

# Manter container rodando e mostrar logs
echo "📊 Monitorando logs..."
tail -f /tmp/access.log /tmp/error.log /app/logs/*.log 2>/dev/null &

# Aguardar processos
wait