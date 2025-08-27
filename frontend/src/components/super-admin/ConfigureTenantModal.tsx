import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Shield,
  Database,
  Users,
  FileText,
  Loader2,
  Save,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';

// ====================================================================
// INTERFACES
// ====================================================================

interface Tenant {
  id: string;
  nome: string;
  tenant_code: string;
  cidade: string;
  estado: string;
  status: 'ativo' | 'inativo' | 'suspenso' | 'trial';
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  usuarios_ativos: number;
  protocolos_mes: number;
  has_admin: boolean;
  cores_tema?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  website?: string;
  logo_url?: string;
}

interface ConfigureTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSave: (tenantId: string, configs: any) => void;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const ConfigureTenantModal: React.FC<ConfigureTenantModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  
  // Estados para configurações visuais
  const [logoUrl, setLogoUrl] = useState(tenant?.logo_url || '');
  const [website, setWebsite] = useState(tenant?.website || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.cores_tema?.primary || '#1f2937');
  const [secondaryColor, setSecondaryColor] = useState(tenant?.cores_tema?.secondary || '#3b82f6');
  const [accentColor, setAccentColor] = useState(tenant?.cores_tema?.accent || '#10b981');
  const [backgroundColor, setBackgroundColor] = useState(tenant?.cores_tema?.background || '#ffffff');
  
  // Estados para configurações de sistema
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = async () => {
    if (!tenant) return;
    
    setLoading(true);
    try {
      const configs = {
        // Configurações visuais
        logo_url: logoUrl,
        website: website,
        cores_tema: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
          background: backgroundColor
        },
        // Configurações de sistema
        configuracoes: {
          notifications_enabled: notificationsEnabled,
          analytics_enabled: analyticsEnabled,
          maintenance_mode: maintenanceMode
        }
      };
      
      console.log('💾 Salvando configurações do tenant:', configs);
      await onSave(tenant.id, configs);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form states
    setActiveTab('visual');
    setLoading(false);
    onClose();
  };

  if (!tenant) return null;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      suspenso: 'bg-red-100 text-red-800',
      trial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.inativo;
  };

  const getPlanColor = (plano: string) => {
    const colors = {
      STARTER: 'bg-purple-100 text-purple-800',
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-green-100 text-green-800'
    };
    return colors[plano as keyof typeof colors] || colors.STARTER;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[calc(100vh-2rem)] mx-4 my-2 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Configurações</div>
              <div className="text-sm text-gray-500 font-normal">{tenant.nome}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Configure aspectos visuais e funcionais do tenant
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-modal">
          {/* Informações básicas do tenant */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{tenant.nome}</span>
                  <span className="text-sm text-gray-500">({tenant.tenant_code})</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(tenant.status)}>
                    {tenant.status?.toUpperCase() || 'INDEFINIDO'}
                  </Badge>
                  <Badge className={getPlanColor(tenant.plano)}>
                    {tenant.plano}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{formatNumber(tenant.usuarios_ativos)} usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span>{formatNumber(tenant.protocolos_mes)} protocolos/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>{tenant.has_admin ? 'Com admin' : 'Sem admin'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abas de configuração */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">
                <Palette className="h-4 w-4 mr-2" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="system">
                <Database className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Globe className="h-4 w-4 mr-2" />
                Integrações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-6 mt-6">
              {/* Configurações visuais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identidade Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">URL do Logo</Label>
                      <Input
                        id="logo_url"
                        placeholder="https://exemplo.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://prefeitura.com.br"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16"
                          disabled={loading}
                        />
                        <Input
                          placeholder="#1f2937"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-16"
                          disabled={loading}
                        />
                        <Input
                          placeholder="#3b82f6"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accent_color">Cor de Destaque</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-16"
                          disabled={loading}
                        />
                        <Input
                          placeholder="#10b981"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="background_color">Cor de Fundo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background_color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16"
                          disabled={loading}
                        />
                        <Input
                          placeholder="#ffffff"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 mt-6">
              {/* Configurações de sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notificações</Label>
                      <div className="text-sm text-gray-500">
                        Ativar notificações por email e push
                      </div>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Analytics</Label>
                      <div className="text-sm text-gray-500">
                        Coletar dados de uso e estatísticas
                      </div>
                    </div>
                    <Switch
                      id="analytics"
                      checked={analyticsEnabled}
                      onCheckedChange={setAnalyticsEnabled}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance">Modo Manutenção</Label>
                      <div className="text-sm text-gray-500">
                        Bloquear acesso ao sistema temporariamente
                      </div>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 mt-6">
              {/* Configurações de integrações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integrações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Funcionalidade em desenvolvimento</p>
                    <p className="text-sm">Integrações com APIs externas estarão disponíveis em breve</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-between flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureTenantModal;