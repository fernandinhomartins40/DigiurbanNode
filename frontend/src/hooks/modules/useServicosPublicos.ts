import { useModuleCRUD } from '../useModuleCRUD';

export const useServicosPublicos = () => {
  const iluminacao = useModuleCRUD('servicos', 'iluminacao');
  const limpeza = useModuleCRUD('servicos', 'limpeza');
  const problemas = useModuleCRUD('servicos', 'problemas');
  const coletaEspecial = useModuleCRUD('servicos', 'coleta_especial');
  const areasVerdes = useModuleCRUD('servicos', 'areas_verdes');

  return {
    iluminacao,
    limpeza,
    problemas,
    coletaEspecial,
    areasVerdes
  };
};