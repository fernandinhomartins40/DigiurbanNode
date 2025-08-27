import { useModuleCRUD } from '../useModuleCRUD';

export const usePlanejamento = () => {
  const projetos = useModuleCRUD('planejamento', 'projetos');
  const alvaras = useModuleCRUD('planejamento', 'alvaras');
  const vistorias = useModuleCRUD('planejamento', 'vistorias');
  const consultasPublicas = useModuleCRUD('planejamento', 'consultas_publicas');
  const zoneamento = useModuleCRUD('planejamento', 'zoneamento');

  return {
    projetos,
    alvaras,
    vistorias,
    consultasPublicas,
    zoneamento
  };
};