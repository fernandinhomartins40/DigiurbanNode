#!/bin/bash

# ====================================================================
# 🚀 DEPLOY HELPERS - VISUAL FEEDBACK SYSTEM
# ====================================================================
# Scripts para feedback visual inteligente no processo de deploy
# ====================================================================

# Cores para output visual
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Função para log com timestamp e cor
log_step() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[${timestamp}] ℹ️  INFO:${NC} ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] ✅ SUCCESS:${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}] ⚠️  WARNING:${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] ❌ ERROR:${NC} ${message}"
            ;;
        "DEPLOY")
            echo -e "${PURPLE}[${timestamp}] 🚀 DEPLOY:${NC} ${message}"
            ;;
        "BUILD")
            echo -e "${CYAN}[${timestamp}] 🔨 BUILD:${NC} ${message}"
            ;;
        *)
            echo -e "[${timestamp}] ${message}"
            ;;
    esac
}

# Função para criar separador visual
separator() {
    local title=$1
    echo ""
    echo "$(printf '=%.0s' {1..80})"
    echo "🔥 $title"
    echo "$(printf '=%.0s' {1..80})"
    echo ""
}

# Função para verificar sucesso de comando
check_command() {
    local cmd=$1
    local description=$2
    local max_retries=${3:-1}
    local retry_delay=${4:-5}
    
    local attempt=1
    while [ $attempt -le $max_retries ]; do
        log_step "INFO" "Executando: $description (Tentativa $attempt/$max_retries)"
        
        if eval "$cmd"; then
            log_step "SUCCESS" "$description - Concluído com sucesso!"
            return 0
        else
            if [ $attempt -lt $max_retries ]; then
                log_step "WARNING" "$description - Falhou, tentando novamente em ${retry_delay}s..."
                sleep $retry_delay
            else
                log_step "ERROR" "$description - Falhou após $max_retries tentativas!"
                return 1
            fi
        fi
        ((attempt++))
    done
}

# Função para verificar build status
verify_build() {
    local component=$1  # frontend ou backend
    local build_dir=$2
    
    separator "VERIFICANDO BUILD - $component"
    
    if [ ! -d "$build_dir" ]; then
        log_step "ERROR" "$component: Diretório de build não encontrado: $build_dir"
        return 1
    fi
    
    local file_count=$(find "$build_dir" -type f | wc -l)
    local dir_size=$(du -sh "$build_dir" | cut -f1)
    
    if [ $file_count -gt 0 ]; then
        log_step "SUCCESS" "$component: Build encontrado - $file_count arquivos, $dir_size"
        log_step "INFO" "$component: Estrutura do build:"
        ls -la "$build_dir" | head -10
        return 0
    else
        log_step "ERROR" "$component: Build vazio ou inválido"
        return 1
    fi
}

# Função para health check avançado
advanced_health_check() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-30}
    local delay=${4:-10}
    
    separator "HEALTH CHECK - $service_name"
    
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        local total_time=$((attempt * delay))
        log_step "INFO" "Health check $service_name - Tentativa $attempt/$max_attempts (${total_time}s total)"
        
        # Testar conectividade
        local response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$url" 2>/dev/null)
        local http_code=$(echo $response | cut -d'|' -f1)
        local time_total=$(echo $response | cut -d'|' -f2)
        
        if [ "$http_code" = "200" ]; then
            log_step "SUCCESS" "$service_name: Respondendo corretamente (${time_total}s)"
            
            # Teste adicional de conteúdo se for o frontend
            if [[ "$url" == *":3020/" ]] && [[ "$service_name" == *"Frontend"* ]]; then
                local content_check=$(curl -s "$url" | grep -i "digiurban\|react\|app" | wc -l)
                if [ $content_check -gt 0 ]; then
                    log_step "SUCCESS" "$service_name: Conteúdo válido detectado"
                else
                    log_step "WARNING" "$service_name: Conteúdo pode estar incompleto"
                fi
            fi
            
            return 0
        elif [ "$http_code" = "000" ]; then
            log_step "WARNING" "$service_name: Serviço não responde - aguardando ${delay}s..."
        else
            log_step "WARNING" "$service_name: HTTP $http_code - aguardando ${delay}s..."
        fi
        
        sleep $delay
        ((attempt++))
    done
    
    log_step "ERROR" "$service_name: Falhou após $max_attempts tentativas (${total_time}s total)"
    return 1
}

# Função para resumo final
deploy_summary() {
    local status=$1  # SUCCESS ou ERROR
    local start_time=$2
    local end_time=$(date '+%s')
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    separator "RESUMO DO DEPLOY"
    
    if [ "$status" = "SUCCESS" ]; then
        log_step "SUCCESS" "Deploy concluído com sucesso!"
        log_step "INFO" "Tempo total: $duration_formatted"
        log_step "INFO" "Aplicação: http://72.60.10.112:3020"
        log_step "INFO" "Health Check: http://72.60.10.112:3020/api/health"
        echo ""
        echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉${NC}"
    else
        log_step "ERROR" "Deploy falhou!"
        log_step "INFO" "Tempo até falha: $duration_formatted"
        echo ""
        echo -e "${RED}💥 DEPLOY FALHOU - VERIFIQUE OS LOGS ACIMA 💥${NC}"
    fi
    
    echo ""
}

# Export das funções
export -f log_step
export -f separator  
export -f check_command
export -f verify_build
export -f advanced_health_check
export -f deploy_summary