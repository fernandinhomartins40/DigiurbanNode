import { useModuleCRUD, useModuleItem, useModuleStats } from '../useModuleCRUD';

// Tipos baseados no schema do banco
export interface EducacaoEscola {
  id: string;
  tenant_id: string;
  nome: string;
  codigo_inep?: string;
  codigo_mec?: string;
  tipo: 'municipal' | 'estadual' | 'federal' | 'privada' | 'comunitaria';
  modalidades_ensino?: string[];
  turnos_funcionamento?: string[];
  endereco?: any;
  contato?: any;
  cnpj?: string;
  diretor_id?: string;
  vice_diretor_id?: string;
  coordenador_pedagogico_id?: string;
  capacidade_total_alunos?: number;
  vagas_disponiveis?: number;
  infraestrutura?: any;
  recursos_tecnologicos?: any;
  programas_governo?: string[];
  horario_funcionamento?: any;
  status: 'ativa' | 'inativa' | 'reforma' | 'desativada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EducacaoAluno {
  id: string;
  tenant_id: string;
  codigo_aluno: string;
  nome_completo: string;
  cpf?: string;
  nis?: string;
  data_nascimento: string;
  sexo?: 'M' | 'F' | 'O';
  cor_raca?: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'nao_declarada';
  nacionalidade?: string;
  naturalidade?: string;
  certidao_nascimento?: string;
  endereco?: any;
  responsaveis?: unknown[];
  necessidades_especiais?: any;
  saude?: any;
  transporte_escolar?: any;
  beneficios_sociais?: string[];
  situacao_vacinal_em_dia?: boolean;
  documentos_entregues?: string[];
  status: 'ativo' | 'transferido' | 'evadido' | 'concluido' | 'falecido';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EducacaoTurma {
  id: string;
  tenant_id: string;
  escola_id: string;
  codigo: string;
  nome?: string;
  serie: string;
  nivel_ensino: 'educacao_infantil' | 'ensino_fundamental_anos_iniciais' | 'ensino_fundamental_anos_finais' | 'ensino_medio' | 'eja' | 'educacao_especial';
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  vagas_total?: number;
  vagas_ocupadas?: number;
  vagas_reservadas?: number;
  ano_letivo: number;
  professor_regente_id?: string;
  sala_aula?: string;
  horario_aulas?: unknown[];
  disciplinas_oferecidas?: string[];
  status: 'ativa' | 'inativa' | 'concluida';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EducacaoMatricula {
  id: string;
  tenant_id: string;
  aluno_id: string;
  escola_id: string;
  turma_id: string;
  ano_letivo: number;
  numero_matricula: string;
  data_matricula: string;
  data_transferencia?: string;
  data_conclusao?: string;
  status: 'ativa' | 'transferida' | 'cancelada' | 'concluida' | 'abandono' | 'remanejada';
  motivo_status?: string;
  documentos_entregues?: unknown[];
  historico_escolar?: string;
  boletim_anterior?: string;
  laudo_medico?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EducacaoProfissional {
  id: string;
  tenant_id: string;
  matricula_funcional: string;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: any;
  contato?: any;
  cargo: 'diretor' | 'vice_diretor' | 'coordenador_pedagogico' | 'professor' | 'auxiliar_ensino' | 'secretario_escola' | 'merendeiro' | 'servicos_gerais' | 'monitor' | 'psicopedagogo' | 'outro';
  especialidade?: string[];
  formacao_academica?: unknown[];
  experiencia_anos?: number;
  carga_horaria_semanal?: number;
  turno_trabalho?: string[];
  escolas_atuacao?: string[];
  disciplinas_lecionadas?: string[];
  turmas_responsavel?: string[];
  data_admissao: string;
  data_demissao?: string;
  status: 'ativo' | 'inativo' | 'licenca' | 'aposentado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Hooks específicos do módulo Educação
export const useEducacaoEscolas = (filters?: any) =>
  useModuleCRUD<EducacaoEscola>('educacao', 'escolas', {
    filters,
    orderBy: { column: 'nome', ascending: true }
  });

export const useEducacaoEscola = (id?: string) =>
  useModuleItem<EducacaoEscola>('educacao', 'escolas', id);

export const useEducacaoAlunos = (filters?: any) =>
  useModuleCRUD<EducacaoAluno>('educacao', 'alunos', {
    filters,
    orderBy: { column: 'nome_completo', ascending: true }
  });

export const useEducacaoAluno = (id?: string) =>
  useModuleItem<EducacaoAluno>('educacao', 'alunos', id);

export const useEducacaoTurmas = (filters?: any) =>
  useModuleCRUD<EducacaoTurma>('educacao', 'turmas', {
    filters,
    orderBy: { column: 'codigo', ascending: true }
  });

export const useEducacaoTurma = (id?: string) =>
  useModuleItem<EducacaoTurma>('educacao', 'turmas', id);

export const useEducacaoMatriculas = (filters?: any) =>
  useModuleCRUD<EducacaoMatricula>('educacao', 'matriculas', {
    filters,
    orderBy: { column: 'data_matricula', ascending: false }
  });

export const useEducacaoMatricula = (id?: string) =>
  useModuleItem<EducacaoMatricula>('educacao', 'matriculas', id);

export const useEducacaoProfissionais = (filters?: any) =>
  useModuleCRUD<EducacaoProfissional>('educacao', 'profissionais', {
    filters,
    orderBy: { column: 'nome_completo', ascending: true }
  });

export const useEducacaoProfissional = (id?: string) =>
  useModuleItem<EducacaoProfissional>('educacao', 'profissionais', id);

// Hooks para estatísticas
export const useEducacaoStats = () => {
  const escolasStats = useModuleStats('educacao', 'escolas');
  const alunosStats = useModuleStats('educacao', 'alunos');
  const matriculasStats = useModuleStats('educacao', 'matriculas');
  const turmasStats = useModuleStats('educacao', 'turmas');
  const profissionaisStats = useModuleStats('educacao', 'profissionais');

  return {
    totalEscolas: escolasStats.data?.total || 0,
    totalAlunos: alunosStats.data?.total || 0,
    totalMatriculas: matriculasStats.data?.total || 0,
    totalTurmas: turmasStats.data?.total || 0,
    totalProfissionais: profissionaisStats.data?.total || 0,
    isLoading: escolasStats.isLoading || alunosStats.isLoading || 
               matriculasStats.isLoading || turmasStats.isLoading || 
               profissionaisStats.isLoading,
  };
};