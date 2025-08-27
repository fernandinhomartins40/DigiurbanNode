import { useModuleCRUD } from '../useModuleCRUD';
import { useSecretarias } from '../useSecretarias';
import { useServicosMunicipais } from '../useServicosMunicipais';

// Hook unificado para todos os módulos com dados no Supabase
export const useModulosCompletos = () => {
  // Módulos de Planejamento Urbano
  const planejamento = {
    projetos: useModuleCRUD('planejamento', 'projetos'),
    alvaras: useModuleCRUD('planejamento', 'alvaras'),
    vistorias: useModuleCRUD('planejamento', 'vistorias'),
    consultasPublicas: useModuleCRUD('planejamento', 'consultas_publicas'),
    zoneamento: useModuleCRUD('planejamento', 'zoneamento'),
  };

  // Módulos de Obras Públicas  
  const obras = {
    projetos: useModuleCRUD('obras', 'projetos'),
    acompanhamento: useModuleCRUD('obras', 'acompanhamento'),
  };

  // Módulos de Serviços Públicos
  const servicos = {
    iluminacao: useModuleCRUD('servicos', 'iluminacao'),
    limpeza: useModuleCRUD('servicos', 'limpeza'),
    problemas: useModuleCRUD('servicos', 'problemas'),
    coletaEspecial: useModuleCRUD('servicos', 'coleta_especial'),
    areasVerdes: useModuleCRUD('servicos', 'areas_verdes'),
  };

  // Módulos de Segurança Pública
  const seguranca = {
    ocorrencias: useModuleCRUD('seguranca', 'ocorrencias'),
    guardas: useModuleCRUD('seguranca', 'guardas'),
  };

  // Módulos do Gabinete
  const gabinete = {
    atendimentos: useModuleCRUD('gabinete', 'atendimentos'),
    audiencias: useModuleCRUD('gabinete', 'audiencias'),
    projetosEstrategicos: useModuleCRUD('gabinete', 'projetos_estrategicos'),
    indicadores: useModuleCRUD('gabinete', 'indicadores'),
  };

  // Secretarias e serviços municipais
  const secretarias = useSecretarias();
  const servicosMunicipais = useServicosMunicipais();

  return {
    planejamento,
    obras,
    servicos,
    seguranca,
    gabinete,
    secretarias,
    servicosMunicipais,
  };
};