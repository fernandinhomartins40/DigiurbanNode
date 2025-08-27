import { useModuleCRUD } from '../useModuleCRUD';

export const useSeguranca = () => {
  const ocorrencias = useModuleCRUD('seguranca', 'ocorrencias');
  const guardas = useModuleCRUD('seguranca', 'guardas');

  return {
    ocorrencias,
    guardas
  };
};