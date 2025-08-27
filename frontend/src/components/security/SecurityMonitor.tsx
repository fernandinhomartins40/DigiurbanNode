// ====================================================================
// 🛡️ MONITOR DE SEGURANÇA EM TEMPO REAL - DIGIURBAN2
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/auth';
import { tokenRotationManager } from "@/lib/tokenRotation";
import { authRateLimiter } from "@/utils/rateLimiter";

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failed' | 'token_rotation' | 'suspicious_activity';
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityStats {
  activeUsers: number;
  failedLogins: number;
  tokenRotations: number;
  suspiciousActivities: number;
  lastSecurityScan: number;
}

const SecurityMonitor: React.FC = () => {
  const { profile: user, isSuperAdmin, isAdmin } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    activeUsers: 0,
    failedLogins: 0,
    tokenRotations: 0,
    suspiciousActivities: 0,
    lastSecurityScan: Date.now()
  });

  // ====================================================================
  // PERMISSÕES E VISIBILIDADE
  // ====================================================================

  useEffect(() => {
    // Só mostrar para admins e super admins
    setIsVisible(isSuperAdmin() || isAdmin());
  }, [user]);

  // ====================================================================
  // COLETA DE DADOS DE SEGURANÇA
  // ====================================================================

  useEffect(() => {
    if (!isVisible) return;

    const collectSecurityData = () => {
      // Estatísticas do Rate Limiter
      const rateLimitStats = authRateLimiter.getSecurityStats();
      
      // Estatísticas de rotação de tokens
      const tokenStats = tokenRotationManager.getRotationStats();

      setStats(prev => ({
        ...prev,
        failedLogins: rateLimitStats.totalAttempts,
        tokenRotations: tokenStats.rotationCount,
        suspiciousActivities: rateLimitStats.blockedEmails + rateLimitStats.blockedIPs,
        lastSecurityScan: Date.now()
      }));

      // Adicionar evento de verificação
      addSecurityEvent({
        type: 'login_success',
        details: 'Verificação de segurança executada',
        severity: 'low'
      });
    };

    // Executar imediatamente e depois a cada 30 segundos
    collectSecurityData();
    const interval = setInterval(collectSecurityData, 30000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // ====================================================================
  // EVENTOS DE SEGURANÇA
  // ====================================================================

  const addSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      ...event
    };

    setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Manter apenas os 20 mais recentes
  };

  useEffect(() => {
    // Listener para eventos de rotação de token
    const handleTokenRotation = () => {
      addSecurityEvent({
        type: 'token_rotation',
        details: 'Token rotacionado automaticamente',
        severity: 'low'
      });
    };

    // Listener para atividade suspeita
    const handleSuspiciousActivity = (event: CustomEvent) => {
      addSecurityEvent({
        type: 'suspicious_activity',
        details: event.detail?.reason || 'Atividade suspeita detectada',
        severity: 'high'
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenRotated', handleTokenRotation);
      window.addEventListener('suspiciousActivity', handleSuspiciousActivity as EventListener);

      return () => {
        window.removeEventListener('tokenRotated', handleTokenRotation);
        window.removeEventListener('suspiciousActivity', handleSuspiciousActivity as EventListener);
      };
    }
  }, []);

  // ====================================================================
  // AÇÕES DE SEGURANÇA
  // ====================================================================

  const forceTokenRotation = async () => {
    try {
      const success = await tokenRotationManager.forceRotation();
      if (success) {
        addSecurityEvent({
          type: 'token_rotation',
          details: 'Token rotacionado manualmente pelo administrador',
          severity: 'medium'
        });
      }
    } catch (error) {
      console.error('Erro ao forçar rotação:', error);
    }
  };

  const clearRateLimitData = () => {
    authRateLimiter.clearAll();
    addSecurityEvent({
      type: 'login_success',
      details: 'Dados de rate limiting limpos pelo administrador',
      severity: 'medium'
    });
  };

  // ====================================================================
  // UTILITÁRIOS DE FORMATAÇÃO
  // ====================================================================

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'login_failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'token_rotation': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Monitor de Segurança</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Última verificação: {formatTimestamp(stats.lastSecurityScan)}
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tentativas Falhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.failedLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rotações de Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.tokenRotations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividades Suspeitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousActivities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {stats.suspiciousActivities > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Foram detectadas {stats.suspiciousActivities} atividade(s) suspeita(s). 
            Verifique os logs de segurança.
          </AlertDescription>
        </Alert>
      )}

      {/* Ações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações de Segurança</CardTitle>
          <CardDescription>
            Controles administrativos para gerenciar a segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={forceTokenRotation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Forçar Rotação de Token
            </Button>
            
            <Button 
              onClick={clearRateLimitData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Limpar Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Eventos de Segurança
          </CardTitle>
          <CardDescription>
            Últimos 20 eventos registrados pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Nenhum evento registrado ainda
              </div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="text-sm font-medium">{event.details}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                    {event.severity}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;