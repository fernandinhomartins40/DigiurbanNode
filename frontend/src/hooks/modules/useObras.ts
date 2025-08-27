import { useModuleCRUD } from '../useModuleCRUD';

export const useObras = () => {
  const projetos = useModuleCRUD('obras', 'projetos');
  const acompanhamento = useModuleCRUD('obras', 'acompanhamento');
  
  return {
    projetos,
    acompanhamento
  };
};