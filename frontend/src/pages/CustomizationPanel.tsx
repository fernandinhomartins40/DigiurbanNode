import React, { useState } from 'react';
import {
  Palette,
  Upload,
  Globe,
  Type,
  Layout,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Eye,
  RotateCcw,
  Save,
  Image,
  Code,
  Settings,
  Monitor
} from 'lucide-react';
import { useCustomization } from "@/hooks/useCustomization";
import { useAuth } from '@/auth';

const CustomizationPanel: React.FC = () => {
  const { profile: user } = useAuth();
  const { 
    customization,
    loading,
    updateCustomization,
    uploadLogo,
    uploadFavicon,
    updateColors,
    updateContactInfo,
    updateSocialMedia,
    toggleFeature,
    resetToDefault
  } = useCustomization(user?.tenant_id);

  const [activeTab, setActiveTab] = useState('visual');
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading('logo');
    try {
      await uploadLogo(file);
      alert('Logo atualizado com sucesso!');
    } catch (error: Error | unknown) {
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading('favicon');
    try {
      await uploadFavicon(file);
      alert('Favicon atualizado com sucesso!');
    } catch (error: Error | unknown) {
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleColorChange = async (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    try {
      await updateColors({
        [colorType]: color
      });
    } catch (error: Error | unknown) {
      alert(`Erro ao atualizar cor: ${error.message}`);
    }
  };

  const handleContactUpdate = async (field: string, value: string) => {
    try {
      await updateContactInfo({
        [field]: value
      });
    } catch (error: Error | unknown) {
      alert(`Erro ao atualizar contato: ${error.message}`);
    }
  };

  const handleSocialUpdate = async (platform: string, url: string) => {
    try {
      await updateSocialMedia({
        [platform]: url
      });
    } catch (error: Error | unknown) {
      alert(`Erro ao atualizar rede social: ${error.message}`);
    }
  };

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    try {
      await toggleFeature(feature, enabled);
    } catch (error: Error | unknown) {
      alert(`Erro ao atualizar funcionalidade: ${error.message}`);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tem certeza de que deseja resetar todas as customizações para o padrão?')) {
      return;
    }

    try {
      await resetToDefault();
      alert('Customizações resetadas para o padrão!');
    } catch (error: Error | unknown) {
      alert(`Erro ao resetar: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customização não encontrada</h2>
          <p className="text-gray-600">Não foi possível carregar as configurações de customização.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personalização</h1>
              <p className="text-gray-600 mt-1">Customize a aparência e configurações da sua prefeitura</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-5 w-5" />
                {previewMode ? 'Sair da Visualização' : 'Visualizar'}
              </button>
              <button
                onClick={handleReset}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                Resetar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'visual', name: 'Identidade Visual', icon: Palette },
                { id: 'layout', name: 'Layout & Design', icon: Layout },
                { id: 'content', name: 'Conteúdo & Textos', icon: Type },
                { id: 'contact', name: 'Informações de Contato', icon: Phone },
                { id: 'social', name: 'Redes Sociais', icon: Globe },
                { id: 'features', name: 'Funcionalidades', icon: Settings },
                { id: 'domain', name: 'Domínio & URLs', icon: Globe },
                { id: 'advanced', name: 'Avançado', icon: Code }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Visual Identity Tab */}
              {activeTab === 'visual' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Identidade Visual</h2>
                  
                  {/* Logo Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Logo da Prefeitura</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {customization.logo_url ? (
                          <img 
                            src={customization.logo_url} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Sem logo</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {uploading === 'logo' ? 'Enviando...' : 'Enviar Logo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploading === 'logo'}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Formatos aceitos: PNG, JPG, SVG. Tamanho recomendado: 200x200px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {customization.favicon_url ? (
                          <img 
                            src={customization.favicon_url} 
                            alt="Favicon" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Monitor className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {uploading === 'favicon' ? 'Enviando...' : 'Enviar Favicon'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFaviconUpload}
                            disabled={uploading === 'favicon'}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Formato ICO ou PNG 32x32px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Paleta de Cores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Primária
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customization.cor_primaria}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.cor_primaria}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Secundária
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customization.cor_secundaria}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.cor_secundaria}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor de Destaque
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customization.cor_accent || customization.cor_primaria}
                            onChange={(e) => handleColorChange('accent', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.cor_accent || ''}
                            onChange={(e) => handleColorChange('accent', e.target.value)}
                            placeholder="Opcional"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Conteúdo & Textos</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Sistema
                      </label>
                      <input
                        type="text"
                        value={customization.nome_sistema || ''}
                        onChange={(e) => updateCustomization({ nome_sistema: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="DigiUrban"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slogan
                      </label>
                      <input
                        type="text"
                        value={customization.slogan || ''}
                        onChange={(e) => updateCustomization({ slogan: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Modernizando a gestão pública"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto de Boas-vindas
                      </label>
                      <textarea
                        value={customization.texto_boas_vindas || ''}
                        onChange={(e) => updateCustomization({ texto_boas_vindas: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Bem-vindo ao portal da nossa prefeitura..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto do Rodapé
                      </label>
                      <textarea
                        value={customization.texto_rodape || ''}
                        onChange={(e) => updateCustomization({ texto_rodape: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Copyright © 2024 Prefeitura Municipal"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações de Contato</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Endereço Completo
                      </label>
                      <textarea
                        value={customization.endereco_completo || ''}
                        onChange={(e) => handleContactUpdate('endereco', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Rua das Flores, 123 - Centro - Cidade/UF - CEP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Telefone Principal
                      </label>
                      <input
                        type="tel"
                        value={customization.telefone_principal || ''}
                        onChange={(e) => handleContactUpdate('telefone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="(11) 3333-4444"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email Principal
                      </label>
                      <input
                        type="email"
                        value={customization.email_principal || ''}
                        onChange={(e) => handleContactUpdate('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="contato@prefeitura.gov.br"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Horário de Funcionamento
                      </label>
                      <input
                        type="text"
                        value={customization.horario_funcionamento || ''}
                        onChange={(e) => handleContactUpdate('horario', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Segunda a Sexta: 8h às 17h"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Redes Sociais</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Facebook className="h-4 w-4 inline mr-2" />
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={customization.facebook_url || ''}
                        onChange={(e) => handleSocialUpdate('facebook', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://facebook.com/prefeitura"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Instagram className="h-4 w-4 inline mr-2" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={customization.instagram_url || ''}
                        onChange={(e) => handleSocialUpdate('instagram', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://instagram.com/prefeitura"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Twitter className="h-4 w-4 inline mr-2" />
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={customization.twitter_url || ''}
                        onChange={(e) => handleSocialUpdate('twitter', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://twitter.com/prefeitura"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Youtube className="h-4 w-4 inline mr-2" />
                        YouTube
                      </label>
                      <input
                        type="url"
                        value={customization.youtube_url || ''}
                        onChange={(e) => handleSocialUpdate('youtube', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://youtube.com/prefeitura"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Funcionalidades</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'mapa', label: 'Mostrar Mapa da Cidade', field: 'mostrar_mapa' },
                      { key: 'noticias', label: 'Seção de Notícias', field: 'mostrar_noticias' },
                      { key: 'eventos', label: 'Calendário de Eventos', field: 'mostrar_eventos' },
                      { key: 'transparencia', label: 'Portal da Transparência', field: 'mostrar_transparencia' },
                      { key: 'avaliacoes', label: 'Sistema de Avaliações', field: 'permitir_avaliacoes' }
                    ].map(feature => (
                      <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{feature.label}</h3>
                          <p className="text-sm text-gray-600">
                            {feature.key === 'mapa' && 'Exibe mapa interativo da cidade na página inicial'}
                            {feature.key === 'noticias' && 'Permite publicação e exibição de notícias'}
                            {feature.key === 'eventos' && 'Calendário com eventos municipais'}
                            {feature.key === 'transparencia' && 'Link para portal da transparência'}
                            {feature.key === 'avaliacoes' && 'Cidadãos podem avaliar serviços'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customization[feature.field as keyof typeof customization] as boolean}
                            onChange={(e) => handleFeatureToggle(feature.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domain Tab */}
              {activeTab === 'domain' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Domínio & URLs</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domínio Personalizado
                      </label>
                      <input
                        type="text"
                        value={customization.dominio_personalizado || ''}
                        onChange={(e) => updateCustomization({ dominio_personalizado: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="prefeitura.digiurban.com.br"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Configure um domínio personalizado para sua prefeitura
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Portal do Cidadão
                      </label>
                      <input
                        type="url"
                        value={customization.url_portal_cidadao || ''}
                        onChange={(e) => updateCustomization({ url_portal_cidadao: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://cidadao.prefeitura.gov.br"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Portal da Transparência
                      </label>
                      <input
                        type="url"
                        value={customization.url_transparencia || ''}
                        onChange={(e) => updateCustomization({ url_transparencia: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://transparencia.prefeitura.gov.br"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações Avançadas</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSS Customizado
                      </label>
                      <textarea
                        value={customization.css_customizado || ''}
                        onChange={(e) => updateCustomization({ css_customizado: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                        rows={10}
                        placeholder="/* CSS customizado aqui */
.custom-header {
  background-color: var(--color-primary);
}"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Adicione CSS personalizado para customizações avançadas
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        JavaScript Customizado
                      </label>
                      <textarea
                        value={customization.javascript_customizado || ''}
                        onChange={(e) => updateCustomization({ javascript_customizado: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                        rows={8}
                        placeholder="// JavaScript customizado aqui
console.log('Sistema personalizado carregado');"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Adicione JavaScript personalizado (use com cuidado)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Layout & Design</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Tipo de Layout
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { value: 'DEFAULT', name: 'Padrão', description: 'Layout tradicional' },
                          { value: 'MINIMAL', name: 'Minimalista', description: 'Design limpo' },
                          { value: 'MODERN', name: 'Moderno', description: 'Estilo contemporâneo' },
                          { value: 'CLASSIC', name: 'Clássico', description: 'Aparência formal' }
                        ].map(layout => (
                          <label key={layout.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="layout_type"
                              value={layout.value}
                              checked={customization.layout_type === layout.value}
                              onChange={(e) => updateCustomization({ layout_type: e.target.value as any })}
                              className="sr-only peer"
                            />
                            <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                              <h3 className="font-medium text-gray-900">{layout.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estilo da Sidebar
                        </label>
                        <select
                          value={customization.sidebar_style}
                          onChange={(e) => updateCustomization({ sidebar_style: e.target.value as any })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="EXPANDED">Expandida</option>
                          <option value="COLLAPSED">Colapsada</option>
                          <option value="HIDDEN">Oculta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estilo do Header
                        </label>
                        <select
                          value={customization.header_style}
                          onChange={(e) => updateCustomization({ header_style: e.target.value as any })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="DEFAULT">Padrão</option>
                          <option value="COMPACT">Compacto</option>
                          <option value="EXTENDED">Estendido</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;