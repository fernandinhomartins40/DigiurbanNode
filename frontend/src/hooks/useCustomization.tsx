// ====================================================================
// 🎨 HOOK DE CUSTOMIZAÇÃO - PERSONALIZAÇÃO POR CLIENTE
// Sistema completo de white-label e branding personalizado
// ====================================================================

import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// Types
interface TenantBranding {
  id: string;
  tenant_id: string;
  
  // Visual Identity
  logo_url: string | null;
  logo_dark_url: string | null; // Para modo escuro
  favicon_url: string | null;
  
  // Colors
  cor_primaria: string;
  cor_secundaria: string;
  cor_acento: string;
  cor_texto: string;
  cor_fundo: string;
  
  // Typography
  fonte_primaria: string;
  fonte_secundaria: string;
  
  // Domain & URLs
  dominio_personalizado: string | null;
  subdomain: string | null; // prefeitura.digiurban.com.br
  
  // Custom CSS
  css_customizado: string | null;
  
  // Footer & Header
  cabecalho_personalizado: string | null;
  rodape_personalizado: string | null;
  
  // Contact Info
  endereco_completo: string | null;
  telefone_principal: string | null;
  email_contato: string | null;
  site_oficial: string | null;
  redes_sociais: any; // JSON com links das redes
  
  // Settings
  mostrar_powered_by: boolean;
  permitir_cadastro_publico: boolean;
  manutencao_ativa: boolean;
  mensagem_manutencao: string | null;
  
  created_at: string;
  updated_at: string;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  colors: {
    cor_primaria: string;
    cor_secundaria: string;
    cor_acento: string;
    cor_texto: string;
    cor_fundo: string;
  };
  category: 'INSTITUCIONAL' | 'MODERNO' | 'CLASSICO' | 'MINIMALISTA';
}

interface CustomizationPreview {
  html: string;
  css: string;
  mockup_url: string;
}

export const useCustomization = () => {
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // ====================================================================
  // 1. CARREGAR CUSTOMIZAÇÃO DO TENANT
  // ====================================================================

  const loadTenantBranding = async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenant_branding')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found
        throw fetchError;
      }

      // Se não existe, criar com padrões
      if (!data) {
        const defaultBranding = await createDefaultBranding(tenantId);
        setBranding(defaultBranding);
      } else {
        setBranding(data);
      }

    } catch (err: Error | unknown) {
      setError(err.message);
      console.error('Erro ao carregar customização:', err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 2. CRIAR BRANDING PADRÃO
  // ====================================================================

  const createDefaultBranding = async (tenantId: string): Promise<TenantBranding> => {
    const defaultBranding = {
      tenant_id: tenantId,
      cor_primaria: '#1E40AF', // Azul padrão
      cor_secundaria: '#3B82F6',
      cor_acento: '#10B981',
      cor_texto: '#1F2937',
      cor_fundo: '#FFFFFF',
      fonte_primaria: 'Inter, sans-serif',
      fonte_secundaria: 'Inter, sans-serif',
      mostrar_powered_by: true,
      permitir_cadastro_publico: true,
      manutencao_ativa: false,
      redes_sociais: {}
    };

    const { data, error } = await supabase
      .from('tenant_branding')
      .insert([defaultBranding])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // ====================================================================
  // 3. ATUALIZAR CUSTOMIZAÇÃO
  // ====================================================================

  const updateBranding = async (
    tenantId: string, 
    updates: Partial<TenantBranding>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('tenant_branding')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId);

      if (error) throw error;

      // Recarregar dados
      await loadTenantBranding(tenantId);

      // Aplicar tema imediatamente se estiver em preview
      if (previewMode) {
        applyThemePreview(updates);
      }

      return {
        success: true,
        message: 'Customização atualizada com sucesso!'
      };

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro ao atualizar: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 4. UPLOAD DE LOGO
  // ====================================================================

  const uploadLogo = async (
    tenantId: string, 
    file: File, 
    type: 'logo' | 'logo_dark' | 'favicon'
  ): Promise<{ success: boolean; url?: string; message: string }> => {
    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Arquivo deve ser uma imagem'
        };
      }

      // Tamanho máximo: 2MB
      if (file.size > 2 * 1024 * 1024) {
        return {
          success: false,
          message: 'Arquivo muito grande. Máximo 2MB.'
        };
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/${type}_${Date.now()}.${fileExt}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      // Atualizar no banco
      const updateField = type === 'logo' ? 'logo_url' : 
                         type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';

      await updateBranding(tenantId, { [updateField]: publicUrl });

      return {
        success: true,
        url: publicUrl,
        message: 'Logo atualizado com sucesso!'
      };

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro no upload: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 5. APLICAR TEMA PRESET
  // ====================================================================

  const applyThemePreset = async (
    tenantId: string, 
    presetId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const preset = themePresets.find(p => p.id === presetId);
      if (!preset) {
        return {
          success: false,
          message: 'Tema não encontrado'
        };
      }

      const updates = {
        cor_primaria: preset.colors.cor_primaria,
        cor_secundaria: preset.colors.cor_secundaria,
        cor_acento: preset.colors.cor_acento,
        cor_texto: preset.colors.cor_texto,
        cor_fundo: preset.colors.cor_fundo
      };

      return await updateBranding(tenantId, updates);

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro ao aplicar tema: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 6. CONFIGURAR DOMÍNIO PERSONALIZADO
  // ====================================================================

  const configureDomain = async (
    tenantId: string,
    domain: string,
    type: 'custom' | 'subdomain'
  ): Promise<{ success: boolean; message: string; instructions?: string }> => {
    try {
      // Validar domínio
      const isValidDomain = validateDomain(domain);
      if (!isValidDomain) {
        return {
          success: false,
          message: 'Domínio inválido'
        };
      }

      // Verificar disponibilidade
      const isAvailable = await checkDomainAvailability(domain, tenantId);
      if (!isAvailable) {
        return {
          success: false,
          message: 'Domínio já está em uso'
        };
      }

      const updates = type === 'custom' 
        ? { dominio_personalizado: domain }
        : { subdomain: domain };

      const result = await updateBranding(tenantId, updates);

      if (result.success) {
        // Gerar instruções DNS para domínio personalizado
        const instructions = type === 'custom' 
          ? generateDNSInstructions(domain)
          : '';

        return {
          ...result,
          instructions
        };
      }

      return result;

    } catch (err: Error | unknown) {
      return {
        success: false,
        message: `Erro na configuração: ${err.message}`
      };
    }
  };

  // ====================================================================
  // 7. PREVIEW DO TEMA
  // ====================================================================

  const generatePreview = async (
    customization: Partial<TenantBranding>
  ): Promise<CustomizationPreview> => {
    const css = generateCustomCSS(customization);
    const html = generatePreviewHTML(customization);
    
    // Gerar mockup (simulado)
    const mockup_url = await generateMockupImage(customization);

    return {
      html,
      css,
      mockup_url
    };
  };

  // ====================================================================
  // 8. APLICAR TEMA EM TEMPO REAL
  // ====================================================================

  const applyThemePreview = (customization: Partial<TenantBranding>) => {
    if (!previewMode) return;

    const css = generateCustomCSS(customization);
    
    // Remover estilo anterior
    const existingStyle = document.getElementById('tenant-preview-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Aplicar novo estilo
    const style = document.createElement('style');
    style.id = 'tenant-preview-styles';
    style.textContent = css;
    document.head.appendChild(style);
  };

  // ====================================================================
  // 9. GERAR CSS CUSTOMIZADO
  // ====================================================================

  const generateCustomCSS = (customization: Partial<TenantBranding>): string => {
    const {
      cor_primaria = '#1E40AF',
      cor_secundaria = '#3B82F6',
      cor_acento = '#10B981',
      cor_texto = '#1F2937',
      cor_fundo = '#FFFFFF',
      fonte_primaria = 'Inter, sans-serif'
    } = customization;

    return `
      :root {
        --color-primary: ${cor_primaria};
        --color-secondary: ${cor_secundaria};
        --color-accent: ${cor_acento};
        --color-text: ${cor_texto};
        --color-background: ${cor_fundo};
        --font-primary: ${fonte_primaria};
      }

      .bg-primary { background-color: var(--color-primary) !important; }
      .text-primary { color: var(--color-primary) !important; }
      .border-primary { border-color: var(--color-primary) !important; }
      
      .bg-secondary { background-color: var(--color-secondary) !important; }
      .text-secondary { color: var(--color-secondary) !important; }
      
      .bg-accent { background-color: var(--color-accent) !important; }
      .text-accent { color: var(--color-accent) !important; }
      
      body { 
        font-family: var(--font-primary) !important; 
        color: var(--color-text) !important;
        background-color: var(--color-background) !important;
      }
      
      .btn-primary {
        background-color: var(--color-primary) !important;
        border-color: var(--color-primary) !important;
      }
      
      .btn-primary:hover {
        background-color: ${adjustColor(cor_primaria, -20)} !important;
        border-color: ${adjustColor(cor_primaria, -20)} !important;
      }

      ${customization.css_customizado || ''}
    `;
  };

  // ====================================================================
  // 10. FUNÇÕES AUXILIARES
  // ====================================================================

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  };

  const checkDomainAvailability = async (domain: string, excludeTenantId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('tenant_branding')
      .select('id')
      .or(`dominio_personalizado.eq.${domain},subdomain.eq.${domain}`)
      .neq('tenant_id', excludeTenantId);

    return !data || data.length === 0;
  };

  const generateDNSInstructions = (domain: string): string => {
    return `
Para configurar seu domínio personalizado (${domain}), adicione os seguintes registros DNS:

Tipo: CNAME
Nome: @
Valor: digiurban-app.vercel.app

Tipo: CNAME  
Nome: www
Valor: digiurban-app.vercel.app

Após a configuração, a propagação pode levar até 48 horas.
    `.trim();
  };

  const generatePreviewHTML = (customization: Partial<TenantBranding>): string => {
    return `
      <div class="preview-container">
        <header class="bg-primary text-white p-4">
          ${customization.logo_url ? `<img src="${customization.logo_url}" alt="Logo" class="h-8">` : ''}
          <h1>Prefeitura Digital</h1>
        </header>
        <main class="p-6">
          <div class="bg-secondary text-white p-4 rounded">
            <h2>Portal do Cidadão</h2>
            <p>Acesse os serviços municipais online</p>
            <button class="btn-primary px-4 py-2 rounded">Entrar</button>
          </div>
        </main>
        <footer class="bg-accent text-white p-4">
          <p>© 2024 Prefeitura Municipal</p>
        </footer>
      </div>
    `;
  };

  const generateMockupImage = async (customization: Partial<TenantBranding>): Promise<string> => {
    // Simulação - normalmente geraria um mockup real
    return `/mockups/preview-${Date.now()}.png`;
  };

  const adjustColor = (color: string, amount: number): string => {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
  };

  // ====================================================================
  // 11. CARREGAR PRESETS DE TEMA
  // ====================================================================

  const loadThemePresets = async () => {
    const presets: ThemePreset[] = [
      {
        id: 'institucional-azul',
        name: 'Institucional Azul',
        description: 'Tema clássico institucional com tons de azul',
        preview_url: '/themes/institucional-azul.png',
        colors: {
          cor_primaria: '#1E40AF',
          cor_secundaria: '#3B82F6',
          cor_acento: '#10B981',
          cor_texto: '#1F2937',
          cor_fundo: '#FFFFFF'
        },
        category: 'INSTITUCIONAL'
      },
      {
        id: 'moderno-verde',
        name: 'Moderno Verde',
        description: 'Design moderno com foco em sustentabilidade',
        preview_url: '/themes/moderno-verde.png',
        colors: {
          cor_primaria: '#059669',
          cor_secundaria: '#10B981',
          cor_acento: '#F59E0B',
          cor_texto: '#111827',
          cor_fundo: '#F9FAFB'
        },
        category: 'MODERNO'
      },
      {
        id: 'classico-borgonha',
        name: 'Clássico Borgonha',
        description: 'Elegância tradicional com tons borgonha',
        preview_url: '/themes/classico-borgonha.png',
        colors: {
          cor_primaria: '#991B1B',
          cor_secundaria: '#DC2626',
          cor_acento: '#D97706',
          cor_texto: '#1C1917',
          cor_fundo: '#FFFBEB'
        },
        category: 'CLASSICO'
      },
      {
        id: 'minimalista-cinza',
        name: 'Minimalista Cinza',
        description: 'Design limpo e minimalista',
        preview_url: '/themes/minimalista-cinza.png',
        colors: {
          cor_primaria: '#374151',
          cor_secundaria: '#6B7280',
          cor_acento: '#8B5CF6',
          cor_texto: '#111827',
          cor_fundo: '#FFFFFF'
        },
        category: 'MINIMALISTA'
      }
    ];

    setThemePresets(presets);
  };

  // ====================================================================
  // EFEITOS
  // ====================================================================

  useEffect(() => {
    loadThemePresets();
  }, []);

  // Limpar preview ao desmontar
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById('tenant-preview-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return {
    // Estados
    branding,
    themePresets,
    loading,
    error,
    previewMode,

    // Ações principais
    loadTenantBranding,
    updateBranding,
    uploadLogo,
    applyThemePreset,
    configureDomain,

    // Preview e customização
    generatePreview,
    applyThemePreview,
    setPreviewMode,

    // Utilitários
    validateDomain,
    generateCustomCSS
  };
};