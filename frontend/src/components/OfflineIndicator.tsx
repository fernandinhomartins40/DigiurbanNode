import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { WifiOff, Wifi, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useOfflineStatus } from "@/lib/offline";

export const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    pendingActionsCount,
    connectionQuality,
    syncPendingActions,
    clearPendingActions
  } = useOfflineStatus();

  // Se está online e não há ações pendentes, não mostrar nada
  if (isOnline && pendingActionsCount === 0) {
    return null;
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'offline': return <WifiOff className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'poor': return 'Lenta';
      case 'offline': return 'Offline';
      default: return 'Desconhecida';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Indicador de status da conexão */}
      <Alert className={`mb-2 ${!isOnline ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={getQualityColor(connectionQuality)}>
              {getQualityIcon(connectionQuality)}
            </span>
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {isOnline && (
              <Badge variant="outline" className="text-xs">
                {getQualityText(connectionQuality)}
              </Badge>
            )}
          </div>
          
          {pendingActionsCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingActionsCount} pendente{pendingActionsCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {!isOnline && (
          <AlertDescription className="mt-2 text-sm">
            Você está offline. Suas ações serão sincronizadas quando a conexão for restabelecida.
          </AlertDescription>
        )}
      </Alert>

      {/* Ações pendentes */}
      {pendingActionsCount > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {pendingActionsCount} ação{pendingActionsCount !== 1 ? 'ões' : ''} aguardando sincronização
              </span>
              
              <div className="flex space-x-2 ml-2">
                {isOnline && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={syncPendingActions}
                    className="h-6 text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Sincronizar
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={clearPendingActions}
                  className="h-6 text-xs text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OfflineIndicator;