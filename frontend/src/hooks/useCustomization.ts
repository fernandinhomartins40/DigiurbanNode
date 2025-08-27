import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { BaseEntity } from "@/types/common";

export interface PersonalizacaoTenantPadrao extends BaseEntity {
  tenant_id: string;
  // Visual Branding
  logo_url?: string;
  favicon_url?: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_destaque?: string;
  
  // Domain and URLs
  dominio_personalizado?: string;
  url_portal_cidadao?: string;
  url_transparencia?: string;
  
  // Layout Customization
  tipo_layout: 'default' | 'minimal' | 'modern' | 'classic';
  estilo_sidebar: 'expandido' | 'retraido' | 'oculto';
  estilo_cabecalho: 'default' | 'compacto' | 'estendido';
  
  // Text Customization
  nome_sistema?: string;
  slogan?: string;
  texto_rodape?: string;
  texto_boas_vindas?: string;
  
  // Contact Information
  endereco_completo?: string;
  telefone_principal?: string;
  email_principal?: string;
  horario_funcionamento?: string;
  
  // Social Media
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  
  // Advanced Customization
  css_customizado?: string;
  javascript_customizado?: string;
  
  // Features Toggle
  mostrar_mapa?: boolean;
  mostrar_noticias?: boolean;
  mostrar_eventos?: boolean;
  mostrar_transparencia?: boolean;
  permitir_avaliacoes?: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CustomTheme {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export function useCustomization(tenantId?: string) {
  const [customization, setCustomization] = useState<PersonalizacaoTenantPadrao | null>(null);
  const [theme, setTheme] = useState<CustomTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar customização
  const fetchCustomization = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('tenant_customization')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      
      if (data) {
        setCustomization(data);
        generateTheme(data);
      } else {
        // Criar customização padrão se não existir
        await createDefaultCustomization();
      }
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Criar customização padrão
  const createDefaultCustomization = async () => {
    if (!tenantId) return;

    try {
      const defaultCustomization = {
        tenant_id: tenantId,
        cor_primaria: '#1E40AF',
        cor_secundaria: '#3B82F6',
        tipo_layout: 'default' as const,
        estilo_sidebar: 'expandido' as const,
        estilo_cabecalho: 'default' as const,
        nome_sistema: 'DigiUrban',
        mostrar_mapa: true,
        mostrar_noticias: true,
        mostrar_eventos: true,
        mostrar_transparencia: true,
        permitir_avaliacoes: true
      };

      const { data, error } = await supabase
        .from('tenant_customization')
        .insert([defaultCustomization])
        .select()
        .single();

      if (error) throw error;
      
      setCustomization(data);
      generateTheme(data);
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Atualizar customização
  const updateCustomization = async (updates: Partial<PersonalizacaoTenantPadrao>) => {
    if (!customization) return;

    try {
      const { data, error } = await supabase
        .from('tenant_customization')
        .update(updates)
        .eq('id', customization.id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomization(data);
      generateTheme(data);
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao atualizar customização: ${err.message}`);
    }
  };

  // Upload de logo
  const uploadLogo = async (file: File) => {
    if (!tenantId) throw new Error('Tenant ID não informado');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      await updateCustomization({ logo_url: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao fazer upload do logo: ${err.message}`);
    }
  };

  // Upload de favicon
  const uploadFavicon = async (file: File) => {
    if (!tenantId) throw new Error('Tenant ID não informado');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/favicon.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      await updateCustomization({ favicon_url: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao fazer upload do favicon: ${err.message}`);
    }
  };

  // Atualizar cores
  const updateColors = async (colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
  }) => {
    const updates: Partial<PersonalizacaoTenantPadrao> = {};
    
    if (colors.primary) updates.cor_primaria = colors.primary;
    if (colors.secondary) updates.cor_secundaria = colors.secondary;
    if (colors.accent) updates.cor_destaque = colors.accent;

    return updateCustomization(updates);
  };

  // Atualizar domínio personalizado
  const updateDomain = async (domain: string) => {
    return updateCustomization({ dominio_personalizado: domain });
  };

  // Atualizar informações de contato
  const updateContactInfo = async (contactInfo: {
    endereco?: string;
    telefone?: string;
    email?: string;
    horario?: string;
  }) => {
    const updates: Partial<PersonalizacaoTenantPadrao> = {};
    
    if (contactInfo.endereco) updates.endereco_completo = contactInfo.endereco;
    if (contactInfo.telefone) updates.telefone_principal = contactInfo.telefone;
    if (contactInfo.email) updates.email_principal = contactInfo.email;
    if (contactInfo.horario) updates.horario_funcionamento = contactInfo.horario;

    return updateCustomization(updates);
  };

  // Atualizar redes sociais
  const updateSocialMedia = async (socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  }) => {
    const updates: Partial<PersonalizacaoTenantPadrao> = {};
    
    if (socialMedia.facebook) updates.facebook_url = socialMedia.facebook;
    if (socialMedia.twitter) updates.twitter_url = socialMedia.twitter;
    if (socialMedia.instagram) updates.instagram_url = socialMedia.instagram;
    if (socialMedia.youtube) updates.youtube_url = socialMedia.youtube;

    return updateCustomization(updates);
  };

  // Toggle de funcionalidades
  const toggleFeature = async (feature: string, enabled: boolean) => {
    const updates: Partial<PersonalizacaoTenantPadrao> = {};
    
    switch (feature) {
      case 'mapa':
        updates.mostrar_mapa = enabled;
        break;
      case 'noticias':
        updates.mostrar_noticias = enabled;
        break;
      case 'eventos':
        updates.mostrar_eventos = enabled;
        break;
      case 'transparencia':
        updates.mostrar_transparencia = enabled;
        break;
      case 'avaliacoes':
        updates.permitir_avaliacoes = enabled;
        break;
    }

    return updateCustomization(updates);
  };

  // Gerar tema CSS baseado na customização
  const generateTheme = (custom: PersonalizacaoTenantPadrao) => {
    const theme: CustomTheme = {
      colors: {
        primary: custom.cor_primaria,
        secondary: custom.cor_secundaria,
        accent: custom.cor_destaque || custom.cor_primaria,
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1F2937',
        textSecondary: '#6B7280'
      },
      fonts: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'system-ui, sans-serif',
        size: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px'
      }
    };

    setTheme(theme);
  };

  // Aplicar tema ao documento
  const applyTheme = (theme: CustomTheme) => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent || theme.colors.primary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);

    // Atualizar favicon se customizado
    if (customization?.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = customization.favicon_url;
      }
    }

    // Atualizar título se customizado
    if (customization?.nome_sistema) {
      document.title = customization.nome_sistema;
    }
  };

  // Gerar CSS customizado
  const generateCustomCSS = () => {
    if (!theme) return '';

    return `
      :root {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text: ${theme.colors.text};
        --color-text-secondary: ${theme.colors.textSecondary};
        
        --font-primary: ${theme.fonts.primary};
        --font-secondary: ${theme.fonts.secondary};
        
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        
        --border-radius-sm: ${theme.borderRadius.sm};
        --border-radius-md: ${theme.borderRadius.md};
        --border-radius-lg: ${theme.borderRadius.lg};
        --border-radius-full: ${theme.borderRadius.full};
      }
      
      ${customization?.css_customizado || ''}
    `;
  };

  // Reset para padrão
  const resetToDefault = async () => {
    if (!customization) return;

    const defaultValues = {
      cor_primaria: '#1E40AF',
      cor_secundaria: '#3B82F6',
      cor_destaque: undefined,
      tipo_layout: 'default' as const,
      estilo_sidebar: 'expandido' as const,
      estilo_cabecalho: 'default' as const,
      nome_sistema: 'DigiUrban',
      slogan: null,
      css_customizado: null,
      javascript_customizado: null
    };

    return updateCustomization(defaultValues);
  };

  useEffect(() => {
    if (tenantId) {
      fetchCustomization().finally(() => setLoading(false));
    }
  }, [tenantId]);

  useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  return {
    customization,
    theme,
    loading,
    error,
    updateCustomization,
    uploadLogo,
    uploadFavicon,
    updateColors,
    updateDomain,
    updateContactInfo,
    updateSocialMedia,
    toggleFeature,
    generateCustomCSS,
    resetToDefault,
    refetch: fetchCustomization
  };
}

// Hook para usar customização global (sem tenant específico)
export function useGlobalCustomization() {
  const [customizations, setCustomizations] = useState<PersonalizacaoTenantPadrao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCustomizations = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_customization')
        .select(`
          *,
          tenants (
            nome,
            status
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCustomizations(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomizations();
  }, []);

  return {
    customizations,
    loading,
    error,
    refetch: fetchAllCustomizations
  };
}