import { useModuleCRUD } from '../useModuleCRUD';

export const useGabinete = () => {
  const atendimentos = useModuleCRUD('gabinete', 'atendimentos');
  const audiencias = useModuleCRUD('gabinete', 'audiencias');
  const projetosEstrategicos = useModuleCRUD('gabinete', 'projetos_estrategicos');
  const agenda = useModuleCRUD('gabinete', 'agenda');
  const indicadores = useModuleCRUD('gabinete', 'indicadores');

  return {
    atendimentos,
    audiencias,
    projetosEstrategicos,
    agenda,
    indicadores
  };
};