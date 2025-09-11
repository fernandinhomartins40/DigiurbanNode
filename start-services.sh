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

# Executar migrations Knex antes de iniciar backend
echo "🗃️ Executando migrations do banco..."

# Debug: Verificar estrutura de arquivos
echo "🔍 Debug - Verificando estrutura:"
echo "📁 Conteúdo /app/:"
ls -la /app/
echo "📁 Conteúdo /app/backend/:"
ls -la /app/backend/
echo "📁 Conteúdo /app/migrations/:"
ls -la /app/migrations/ || echo "❌ Diretório /app/migrations não existe"

cd /app/backend && npm run knex:migrate
if [ $? -eq 0 ]; then
  echo "✅ Migrations executadas com sucesso"
else
  echo "❌ Erro nas migrations, mas continuando..."
fi

# Iniciar backend com PM2
echo "🔧 Iniciando Backend..."
cd /app && pm2 start pm2.json --no-daemon &

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 10

# Verificar se backend está rodando (retry com timeout menor e menos restritivo)
echo "🔍 Verificando Backend..."
retries=0
max_retries=10
backend_ok=false

while [ $retries -lt $max_retries ]; do
  if curl -f http://localhost:3021/api/health >/dev/null 2>&1; then
    echo "✅ Backend iniciado com sucesso"
    backend_ok=true
    break
  fi
  echo "⏳ Tentativa $((retries + 1))/$max_retries - Aguardando backend..."
  retries=$((retries + 1))
  sleep 3
done

if [ "$backend_ok" = "false" ]; then
  echo "⚠️ Backend não respondeu health check após $max_retries tentativas"
  echo "🔄 Continuando mesmo assim - Nginx pode funcionar..."
  pm2 logs --nostream --lines 10
fi

# Iniciar Nginx com configuração não-root
echo "🌐 Iniciando Nginx..."
nginx -g 'daemon off;' &

# Aguardar nginx inicializar
sleep 2

# Verificar se nginx está rodando (menos restritivo)
echo "🔍 Verificando Nginx..."
sleep 3

nginx_retries=0
nginx_max_retries=5
nginx_ok=false

while [ $nginx_retries -lt $nginx_max_retries ]; do
  if curl -f http://localhost:3020/health >/dev/null 2>&1; then
    echo "✅ Nginx iniciado com sucesso"
    nginx_ok=true
    break
  fi
  echo "⏳ Tentativa Nginx $((nginx_retries + 1))/$nginx_max_retries..."
  nginx_retries=$((nginx_retries + 1))
  sleep 2
done

if [ "$nginx_ok" = "false" ]; then
  echo "⚠️ Nginx health check falhou, mas continuando..."
  echo "📋 Logs do Nginx:"
  cat /tmp/error.log 2>/dev/null || echo "Sem logs de erro"
fi

echo "🎉 Sistema DigiUrban iniciado em http://localhost:3020"
echo "📊 Status Backend: $(if [ "$backend_ok" = "true" ]; then echo "✅ OK"; else echo "⚠️ Aguardando"; fi)"
echo "📊 Status Nginx: $(if [ "$nginx_ok" = "true" ]; then echo "✅ OK"; else echo "⚠️ Verificar"; fi)"

# Manter container rodando e mostrar logs
echo "📊 Monitorando logs..."
tail -f /tmp/access.log /tmp/error.log /app/logs/*.log 2>/dev/null &

# Aguardar processos
wait