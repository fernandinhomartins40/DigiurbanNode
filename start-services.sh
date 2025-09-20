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

# Criar diretórios necessários e configurar permissões
echo "📁 Criando diretórios e configurando permissões..."
mkdir -p /app/logs /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp
chmod 755 /app/logs
chmod 777 /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

echo "🗃️ Executando setup do banco..."

# Verificar se scripts existem antes de executar
if [ -f "/app/scripts/setup-database.sh" ]; then
  echo "✅ Script setup-database.sh encontrado, executando..."
  chmod +x /app/scripts/setup-database.sh
  /app/scripts/setup-database.sh

  if [ $? -eq 0 ]; then
    echo "✅ Database configurado com sucesso"
  else
    echo "⚠️ Erro na configuração do database, mas continuando..."
  fi
else
  echo "⚠️ Script setup-database.sh não encontrado!"
  echo "🔧 Executando setup básico manual..."

  # Setup básico manual
  mkdir -p /app/data
  export DATABASE_URL="file:/app/data/digiurban.db"

  echo "🚀 Criando schema básico..."
  cd /app/backend && npx prisma db push --schema=../schema.prisma || echo "⚠️ Falha no schema, continuando..."

  echo "🌱 Tentando executar seeds..."
  cd /app/backend && node dist/database/seed.js || echo "⚠️ Falha nos seeds, continuando..."

  echo "⚠️ Setup manual concluído (com possíveis falhas)"
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

# Testar configuração do nginx primeiro
echo "🔍 Testando configuração do Nginx..."
if nginx -t; then
  echo "✅ Configuração do Nginx válida"
else
  echo "❌ Erro na configuração do Nginx"
  cat /tmp/error.log 2>/dev/null || echo "Sem logs de erro disponíveis"
  exit 1
fi

# Iniciar nginx
nginx -g 'daemon off;' &
nginx_pid=$!

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
  echo "⚠️ Nginx health check falhou!"
  echo "📋 Logs do Nginx:"
  cat /tmp/error.log 2>/dev/null || echo "Sem logs de erro"
  
  # Verificar se o processo nginx ainda está rodando
  if kill -0 $nginx_pid 2>/dev/null; then
    echo "🔄 Processo Nginx ainda está rodando (PID: $nginx_pid)"
  else
    echo "❌ Processo Nginx não está mais rodando"
    exit 1
  fi
fi

echo "🎉 Sistema DigiUrban iniciado em http://localhost:3020"
echo "📊 Status Backend: $(if [ "$backend_ok" = "true" ]; then echo "✅ OK"; else echo "⚠️ Aguardando"; fi)"
echo "📊 Status Nginx: $(if [ "$nginx_ok" = "true" ]; then echo "✅ OK"; else echo "⚠️ Verificar"; fi)"

# Função para monitorar processos
monitor_processes() {
  while true; do
    # Verificar backend (PM2)
    if ! pm2 list | grep -q "online"; then
      echo "❌ Backend PM2 não está rodando!"
      exit 1
    fi
    
    # Verificar nginx
    if ! kill -0 $nginx_pid 2>/dev/null; then
      echo "❌ Nginx não está mais rodando!"
      exit 1
    fi
    
    sleep 30
  done
}

# Iniciar monitor em background
monitor_processes &

# Manter container rodando e mostrar logs
echo "📊 Monitorando logs e processos..."
tail -f /tmp/access.log /tmp/error.log /app/logs/*.log 2>/dev/null &

# Aguardar processos
wait