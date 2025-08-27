export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agricultura_ater: {
        Row: {
          anexos: string[] | null
          avaliacao_produtor: number | null
          created_at: string | null
          cultivos_orientados: string[] | null
          data_visita: string | null
          id: string
          insumos_recomendados: Json | null
          observacoes: string | null
          problemas_identificados: string[] | null
          produtor_id: string | null
          proxima_visita_agendada: string | null
          resultados_obtidos: string | null
          solucoes_propostas: string[] | null
          status: string | null
          tecnico_responsavel_id: string | null
          tecnologias_apresentadas: string[] | null
          tenant_id: string
          tipo_atendimento: string | null
          updated_at: string | null
        }
        Insert: {
          anexos?: string[] | null
          avaliacao_produtor?: number | null
          created_at?: string | null
          cultivos_orientados?: string[] | null
          data_visita?: string | null
          id?: string
          insumos_recomendados?: Json | null
          observacoes?: string | null
          problemas_identificados?: string[] | null
          produtor_id?: string | null
          proxima_visita_agendada?: string | null
          resultados_obtidos?: string | null
          solucoes_propostas?: string[] | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          tecnologias_apresentadas?: string[] | null
          tenant_id: string
          tipo_atendimento?: string | null
          updated_at?: string | null
        }
        Update: {
          anexos?: string[] | null
          avaliacao_produtor?: number | null
          created_at?: string | null
          cultivos_orientados?: string[] | null
          data_visita?: string | null
          id?: string
          insumos_recomendados?: Json | null
          observacoes?: string | null
          problemas_identificados?: string[] | null
          produtor_id?: string | null
          proxima_visita_agendada?: string | null
          resultados_obtidos?: string | null
          solucoes_propostas?: string[] | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          tecnologias_apresentadas?: string[] | null
          tenant_id?: string
          tipo_atendimento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agricultura_ater_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "agricultura_produtores"
            referencedColumns: ["id"]
          },
        ]
      }
      agricultura_distribuicao: {
        Row: {
          area_aplicacao_hectares: number | null
          comprovante_entrega: string | null
          created_at: string | null
          data_distribuicao: string | null
          feedback_produtor: string | null
          finalidade: string | null
          id: string
          insumo_id: string | null
          observacoes: string | null
          produtor_id: string | null
          programa_id: string | null
          quantidade: number | null
          responsavel_entrega_id: string | null
          resultados_obtidos: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          area_aplicacao_hectares?: number | null
          comprovante_entrega?: string | null
          created_at?: string | null
          data_distribuicao?: string | null
          feedback_produtor?: string | null
          finalidade?: string | null
          id?: string
          insumo_id?: string | null
          observacoes?: string | null
          produtor_id?: string | null
          programa_id?: string | null
          quantidade?: number | null
          responsavel_entrega_id?: string | null
          resultados_obtidos?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          area_aplicacao_hectares?: number | null
          comprovante_entrega?: string | null
          created_at?: string | null
          data_distribuicao?: string | null
          feedback_produtor?: string | null
          finalidade?: string | null
          id?: string
          insumo_id?: string | null
          observacoes?: string | null
          produtor_id?: string | null
          programa_id?: string | null
          quantidade?: number | null
          responsavel_entrega_id?: string | null
          resultados_obtidos?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agricultura_distribuicao_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "agricultura_insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agricultura_distribuicao_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "agricultura_produtores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agricultura_distribuicao_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "agricultura_programas"
            referencedColumns: ["id"]
          },
        ]
      }
      agricultura_insumos: {
        Row: {
          categoria: string | null
          created_at: string | null
          especificacoes_tecnicas: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fornecedor: string | null
          id: string
          local_armazenamento: string | null
          modo_uso: string | null
          nome: string
          registro_ministerio: string | null
          restricoes_uso: string[] | null
          status: string | null
          tenant_id: string
          tipo_cultivo: string[] | null
          unidade_medida: string | null
          updated_at: string | null
          validade: string | null
          valor_unitario: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          especificacoes_tecnicas?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          local_armazenamento?: string | null
          modo_uso?: string | null
          nome: string
          registro_ministerio?: string | null
          restricoes_uso?: string[] | null
          status?: string | null
          tenant_id: string
          tipo_cultivo?: string[] | null
          unidade_medida?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          especificacoes_tecnicas?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          local_armazenamento?: string | null
          modo_uso?: string | null
          nome?: string
          registro_ministerio?: string | null
          restricoes_uso?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo_cultivo?: string[] | null
          unidade_medida?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      agricultura_produtores: {
        Row: {
          area_total_hectares: number | null
          car: string | null
          ccir: string | null
          contato: Json | null
          cooperativa: string | null
          cpf: string | null
          created_at: string | null
          criacao_animais: string[] | null
          ctr: string | null
          dap: boolean | null
          endereco_residencial: Json | null
          id: string
          nome_completo: string
          principais_cultivos: string[] | null
          propriedades: Json[] | null
          renda_familiar_estimada: number | null
          sindicato_associacao: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          area_total_hectares?: number | null
          car?: string | null
          ccir?: string | null
          contato?: Json | null
          cooperativa?: string | null
          cpf?: string | null
          created_at?: string | null
          criacao_animais?: string[] | null
          ctr?: string | null
          dap?: boolean | null
          endereco_residencial?: Json | null
          id?: string
          nome_completo: string
          principais_cultivos?: string[] | null
          propriedades?: Json[] | null
          renda_familiar_estimada?: number | null
          sindicato_associacao?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          area_total_hectares?: number | null
          car?: string | null
          ccir?: string | null
          contato?: Json | null
          cooperativa?: string | null
          cpf?: string | null
          created_at?: string | null
          criacao_animais?: string[] | null
          ctr?: string | null
          dap?: boolean | null
          endereco_residencial?: Json | null
          id?: string
          nome_completo?: string
          principais_cultivos?: string[] | null
          propriedades?: Json[] | null
          renda_familiar_estimada?: number | null
          sindicato_associacao?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agricultura_programas: {
        Row: {
          coordenador_id: string | null
          created_at: string | null
          criterios_selecao: string[] | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          documentos_necessarios: string[] | null
          fonte_recurso: string | null
          id: string
          meta_beneficiados: number | null
          nome: string
          orcamento_total: number | null
          processo_inscricao: string | null
          produtores_beneficiados: number | null
          publico_alvo: string | null
          recursos_distribuidos: Json | null
          relatorios_progresso: string[] | null
          requisitos_participacao: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          coordenador_id?: string | null
          created_at?: string | null
          criterios_selecao?: string[] | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          fonte_recurso?: string | null
          id?: string
          meta_beneficiados?: number | null
          nome: string
          orcamento_total?: number | null
          processo_inscricao?: string | null
          produtores_beneficiados?: number | null
          publico_alvo?: string | null
          recursos_distribuidos?: Json | null
          relatorios_progresso?: string[] | null
          requisitos_participacao?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          coordenador_id?: string | null
          created_at?: string | null
          criterios_selecao?: string[] | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          fonte_recurso?: string | null
          id?: string
          meta_beneficiados?: number | null
          nome?: string
          orcamento_total?: number | null
          processo_inscricao?: string | null
          produtores_beneficiados?: number | null
          publico_alvo?: string | null
          recursos_distribuidos?: Json | null
          relatorios_progresso?: string[] | null
          requisitos_participacao?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      anexos: {
        Row: {
          caminho_storage: string | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          hash_arquivo: string | null
          id: string
          nome_arquivo: string
          protocolo_id: string | null
          publico: boolean | null
          tamanho_bytes: number | null
          tenant_id: string
          tipo_mime: string | null
          updated_at: string | null
          upload_usuario_id: string | null
        }
        Insert: {
          caminho_storage?: string | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          hash_arquivo?: string | null
          id?: string
          nome_arquivo: string
          protocolo_id?: string | null
          publico?: boolean | null
          tamanho_bytes?: number | null
          tenant_id: string
          tipo_mime?: string | null
          updated_at?: string | null
          upload_usuario_id?: string | null
        }
        Update: {
          caminho_storage?: string | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          hash_arquivo?: string | null
          id?: string
          nome_arquivo?: string
          protocolo_id?: string | null
          publico?: boolean | null
          tamanho_bytes?: number | null
          tenant_id?: string
          tipo_mime?: string | null
          updated_at?: string | null
          upload_usuario_id?: string | null
        }
        Relationships: []
      }
      assistencia_atendimentos: {
        Row: {
          acoes_realizadas: string[] | null
          atendente_id: string
          created_at: string | null
          data_atendimento: string
          demanda_principal: string
          descricao_caso: string | null
          encaminhamentos: Json | null
          familia_id: string
          horario_fim: string | null
          horario_inicio: string
          id: string
          observacoes: string | null
          proxima_acao: Json | null
          status: string | null
          tenant_id: string
          tipo_atendimento: string
          unidade_atendimento_id: string | null
          updated_at: string | null
        }
        Insert: {
          acoes_realizadas?: string[] | null
          atendente_id: string
          created_at?: string | null
          data_atendimento: string
          demanda_principal: string
          descricao_caso?: string | null
          encaminhamentos?: Json | null
          familia_id: string
          horario_fim?: string | null
          horario_inicio: string
          id?: string
          observacoes?: string | null
          proxima_acao?: Json | null
          status?: string | null
          tenant_id: string
          tipo_atendimento: string
          unidade_atendimento_id?: string | null
          updated_at?: string | null
        }
        Update: {
          acoes_realizadas?: string[] | null
          atendente_id?: string
          created_at?: string | null
          data_atendimento?: string
          demanda_principal?: string
          descricao_caso?: string | null
          encaminhamentos?: Json | null
          familia_id?: string
          horario_fim?: string | null
          horario_inicio?: string
          id?: string
          observacoes?: string | null
          proxima_acao?: Json | null
          status?: string | null
          tenant_id?: string
          tipo_atendimento?: string
          unidade_atendimento_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistencia_atendimentos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "assistencia_familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_atendimentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assistencia_familias: {
        Row: {
          codigo_familia: string
          contato: Json | null
          cras_referencia: string | null
          created_at: string | null
          data_cadastro: string | null
          endereco: Json | null
          id: string
          numero_membros: number | null
          observacoes: string | null
          programas_inscritos: string[] | null
          renda_familiar: number | null
          responsavel_cpf: string | null
          responsavel_nis: string | null
          responsavel_nome: string
          situacao_vulnerabilidade: string[] | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          codigo_familia: string
          contato?: Json | null
          cras_referencia?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          endereco?: Json | null
          id?: string
          numero_membros?: number | null
          observacoes?: string | null
          programas_inscritos?: string[] | null
          renda_familiar?: number | null
          responsavel_cpf?: string | null
          responsavel_nis?: string | null
          responsavel_nome: string
          situacao_vulnerabilidade?: string[] | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          codigo_familia?: string
          contato?: Json | null
          cras_referencia?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          endereco?: Json | null
          id?: string
          numero_membros?: number | null
          observacoes?: string | null
          programas_inscritos?: string[] | null
          renda_familiar?: number | null
          responsavel_cpf?: string | null
          responsavel_nis?: string | null
          responsavel_nome?: string
          situacao_vulnerabilidade?: string[] | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistencia_familias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assistencia_unidades: {
        Row: {
          capacidade_atendimento: number | null
          contato: Json | null
          coordenador_id: string | null
          created_at: string | null
          endereco: Json | null
          equipe_tecnica: string[] | null
          familias_referenciadas: number | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          servicos_oferecidos: string[] | null
          status: string | null
          tenant_id: string
          territorio_abrangencia: string[] | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          capacidade_atendimento?: number | null
          contato?: Json | null
          coordenador_id?: string | null
          created_at?: string | null
          endereco?: Json | null
          equipe_tecnica?: string[] | null
          familias_referenciadas?: number | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id: string
          territorio_abrangencia?: string[] | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          capacidade_atendimento?: number | null
          contato?: Json | null
          coordenador_id?: string | null
          created_at?: string | null
          endereco?: Json | null
          equipe_tecnica?: string[] | null
          familias_referenciadas?: number | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id?: string
          territorio_abrangencia?: string[] | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistencia_unidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          categoria: string | null
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          detalhes: string | null
          id: string
          ip_address: unknown | null
          nivel: string | null
          operacao: string
          registro_id: string | null
          sessao_id: string | null
          tabela: string | null
          tenant_id: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          detalhes?: string | null
          id?: string
          ip_address?: unknown | null
          nivel?: string | null
          operacao: string
          registro_id?: string | null
          sessao_id?: string | null
          tabela?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          detalhes?: string | null
          id?: string
          ip_address?: unknown | null
          nivel?: string | null
          operacao?: string
          registro_id?: string | null
          sessao_id?: string | null
          tabela?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      cultura_espacos: {
        Row: {
          capacidade: number | null
          contato: Json | null
          created_at: string | null
          endereco: Json | null
          fotos: string[] | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          recursos_disponiveis: string[] | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          valor_locacao: number | null
        }
        Insert: {
          capacidade?: number | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          recursos_disponiveis?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          valor_locacao?: number | null
        }
        Update: {
          capacidade?: number | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          recursos_disponiveis?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          valor_locacao?: number | null
        }
        Relationships: []
      }
      cultura_eventos: {
        Row: {
          apoiadores: string[] | null
          avaliacoes: Json | null
          categoria: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          entrada_gratuita: boolean | null
          espaco_id: string | null
          faixa_etaria: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          local_realizacao: string | null
          material_promocional: string[] | null
          nome: string
          orcamento_previsto: number | null
          orcamento_realizado: number | null
          organizador_id: string | null
          publico_esperado: number | null
          publico_presente: number | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          valor_ingresso: number | null
        }
        Insert: {
          apoiadores?: string[] | null
          avaliacoes?: Json | null
          categoria?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          entrada_gratuita?: boolean | null
          espaco_id?: string | null
          faixa_etaria?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          local_realizacao?: string | null
          material_promocional?: string[] | null
          nome: string
          orcamento_previsto?: number | null
          orcamento_realizado?: number | null
          organizador_id?: string | null
          publico_esperado?: number | null
          publico_presente?: number | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          valor_ingresso?: number | null
        }
        Update: {
          apoiadores?: string[] | null
          avaliacoes?: Json | null
          categoria?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          entrada_gratuita?: boolean | null
          espaco_id?: string | null
          faixa_etaria?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          local_realizacao?: string | null
          material_promocional?: string[] | null
          nome?: string
          orcamento_previsto?: number | null
          orcamento_realizado?: number | null
          organizador_id?: string | null
          publico_esperado?: number | null
          publico_presente?: number | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          valor_ingresso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cultura_eventos_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "cultura_espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      cultura_grupos: {
        Row: {
          apresentacoes_realizadas: number | null
          categoria: string | null
          coordenador_contato: Json | null
          coordenador_nome: string | null
          created_at: string | null
          horario_ensaio: Json | null
          id: string
          local_ensaio: string | null
          nome: string
          participantes_ativos: number | null
          participantes_cadastrados: number | null
          premios_recebidos: string[] | null
          repertorio: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          apresentacoes_realizadas?: number | null
          categoria?: string | null
          coordenador_contato?: Json | null
          coordenador_nome?: string | null
          created_at?: string | null
          horario_ensaio?: Json | null
          id?: string
          local_ensaio?: string | null
          nome: string
          participantes_ativos?: number | null
          participantes_cadastrados?: number | null
          premios_recebidos?: string[] | null
          repertorio?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          apresentacoes_realizadas?: number | null
          categoria?: string | null
          coordenador_contato?: Json | null
          coordenador_nome?: string | null
          created_at?: string | null
          horario_ensaio?: Json | null
          id?: string
          local_ensaio?: string | null
          nome?: string
          participantes_ativos?: number | null
          participantes_cadastrados?: number | null
          premios_recebidos?: string[] | null
          repertorio?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cultura_oficinas: {
        Row: {
          avaliacoes: Json | null
          carga_horaria: number | null
          categoria: string | null
          certificado: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          horario: Json | null
          id: string
          idade_maxima: number | null
          idade_minima: number | null
          instrutor_curriculo: string | null
          instrutor_nome: string | null
          local_realizacao: string | null
          material_necessario: string[] | null
          modalidade: string | null
          nivel: string | null
          nome: string
          pre_requisitos: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          vagas_ocupadas: number | null
          vagas_oferecidas: number | null
          valor_inscricao: number | null
        }
        Insert: {
          avaliacoes?: Json | null
          carga_horaria?: number | null
          categoria?: string | null
          certificado?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          horario?: Json | null
          id?: string
          idade_maxima?: number | null
          idade_minima?: number | null
          instrutor_curriculo?: string | null
          instrutor_nome?: string | null
          local_realizacao?: string | null
          material_necessario?: string[] | null
          modalidade?: string | null
          nivel?: string | null
          nome: string
          pre_requisitos?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_oferecidas?: number | null
          valor_inscricao?: number | null
        }
        Update: {
          avaliacoes?: Json | null
          carga_horaria?: number | null
          categoria?: string | null
          certificado?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          horario?: Json | null
          id?: string
          idade_maxima?: number | null
          idade_minima?: number | null
          instrutor_curriculo?: string | null
          instrutor_nome?: string | null
          local_realizacao?: string | null
          material_necessario?: string[] | null
          modalidade?: string | null
          nivel?: string | null
          nome?: string
          pre_requisitos?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_oferecidas?: number | null
          valor_inscricao?: number | null
        }
        Relationships: []
      }
      cultura_projetos: {
        Row: {
          atividades_previstas: Json | null
          atividades_realizadas: Json | null
          beneficiarios_diretos: number | null
          beneficiarios_indiretos: number | null
          coordenador_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          fonte_recurso: string | null
          id: string
          indicadores_sucesso: Json | null
          nome: string
          objetivo: string | null
          orcamento_total: number | null
          prestacao_contas: Json | null
          publico_alvo: string | null
          relatorios: string[] | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          atividades_previstas?: Json | null
          atividades_realizadas?: Json | null
          beneficiarios_diretos?: number | null
          beneficiarios_indiretos?: number | null
          coordenador_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          fonte_recurso?: string | null
          id?: string
          indicadores_sucesso?: Json | null
          nome: string
          objetivo?: string | null
          orcamento_total?: number | null
          prestacao_contas?: Json | null
          publico_alvo?: string | null
          relatorios?: string[] | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          atividades_previstas?: Json | null
          atividades_realizadas?: Json | null
          beneficiarios_diretos?: number | null
          beneficiarios_indiretos?: number | null
          coordenador_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          fonte_recurso?: string | null
          id?: string
          indicadores_sucesso?: Json | null
          nome?: string
          objetivo?: string | null
          orcamento_total?: number | null
          prestacao_contas?: Json | null
          publico_alvo?: string | null
          relatorios?: string[] | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      educacao_alunos: {
        Row: {
          beneficios_sociais: string[] | null
          certidao_nascimento: string | null
          codigo_aluno: string
          cor_raca: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string
          documentos_entregues: string[] | null
          endereco: Json | null
          id: string
          nacionalidade: string | null
          naturalidade: string | null
          necessidades_especiais: Json | null
          nis: string | null
          nome_completo: string
          observacoes: string | null
          responsaveis: Json | null
          saude: Json | null
          sexo: string | null
          situacao_vacinal_em_dia: boolean | null
          status: string | null
          tenant_id: string
          transporte_escolar: Json | null
          updated_at: string | null
        }
        Insert: {
          beneficios_sociais?: string[] | null
          certidao_nascimento?: string | null
          codigo_aluno: string
          cor_raca?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento: string
          documentos_entregues?: string[] | null
          endereco?: Json | null
          id?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          necessidades_especiais?: Json | null
          nis?: string | null
          nome_completo: string
          observacoes?: string | null
          responsaveis?: Json | null
          saude?: Json | null
          sexo?: string | null
          situacao_vacinal_em_dia?: boolean | null
          status?: string | null
          tenant_id: string
          transporte_escolar?: Json | null
          updated_at?: string | null
        }
        Update: {
          beneficios_sociais?: string[] | null
          certidao_nascimento?: string | null
          codigo_aluno?: string
          cor_raca?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string
          documentos_entregues?: string[] | null
          endereco?: Json | null
          id?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          necessidades_especiais?: Json | null
          nis?: string | null
          nome_completo?: string
          observacoes?: string | null
          responsaveis?: Json | null
          saude?: Json | null
          sexo?: string | null
          situacao_vacinal_em_dia?: boolean | null
          status?: string | null
          tenant_id?: string
          transporte_escolar?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educacao_alunos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      educacao_escolas: {
        Row: {
          capacidade_total_alunos: number | null
          cnpj: string | null
          codigo_inep: string | null
          codigo_mec: string | null
          contato: Json | null
          coordenador_pedagogico_id: string | null
          created_at: string | null
          diretor_id: string | null
          endereco: Json | null
          horario_funcionamento: Json | null
          id: string
          infraestrutura: Json | null
          modalidades_ensino: string[] | null
          nome: string
          observacoes: string | null
          programas_governo: string[] | null
          recursos_tecnologicos: Json | null
          status: string | null
          tenant_id: string
          tipo: string
          turnos_funcionamento: string[] | null
          updated_at: string | null
          vagas_disponiveis: number | null
          vice_diretor_id: string | null
        }
        Insert: {
          capacidade_total_alunos?: number | null
          cnpj?: string | null
          codigo_inep?: string | null
          codigo_mec?: string | null
          contato?: Json | null
          coordenador_pedagogico_id?: string | null
          created_at?: string | null
          diretor_id?: string | null
          endereco?: Json | null
          horario_funcionamento?: Json | null
          id?: string
          infraestrutura?: Json | null
          modalidades_ensino?: string[] | null
          nome: string
          observacoes?: string | null
          programas_governo?: string[] | null
          recursos_tecnologicos?: Json | null
          status?: string | null
          tenant_id: string
          tipo: string
          turnos_funcionamento?: string[] | null
          updated_at?: string | null
          vagas_disponiveis?: number | null
          vice_diretor_id?: string | null
        }
        Update: {
          capacidade_total_alunos?: number | null
          cnpj?: string | null
          codigo_inep?: string | null
          codigo_mec?: string | null
          contato?: Json | null
          coordenador_pedagogico_id?: string | null
          created_at?: string | null
          diretor_id?: string | null
          endereco?: Json | null
          horario_funcionamento?: Json | null
          id?: string
          infraestrutura?: Json | null
          modalidades_ensino?: string[] | null
          nome?: string
          observacoes?: string | null
          programas_governo?: string[] | null
          recursos_tecnologicos?: Json | null
          status?: string | null
          tenant_id?: string
          tipo?: string
          turnos_funcionamento?: string[] | null
          updated_at?: string | null
          vagas_disponiveis?: number | null
          vice_diretor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educacao_escolas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      educacao_matriculas: {
        Row: {
          aluno_id: string
          ano_letivo: number
          boletim_anterior: string | null
          created_at: string | null
          data_conclusao: string | null
          data_matricula: string
          data_transferencia: string | null
          documentos_entregues: Json | null
          escola_id: string
          historico_escolar: string | null
          id: string
          laudo_medico: string | null
          motivo_status: string | null
          numero_matricula: string
          observacoes: string | null
          status: string | null
          tenant_id: string
          turma_id: string
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          boletim_anterior?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_matricula: string
          data_transferencia?: string | null
          documentos_entregues?: Json | null
          escola_id: string
          historico_escolar?: string | null
          id?: string
          laudo_medico?: string | null
          motivo_status?: string | null
          numero_matricula: string
          observacoes?: string | null
          status?: string | null
          tenant_id: string
          turma_id: string
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          boletim_anterior?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_matricula?: string
          data_transferencia?: string | null
          documentos_entregues?: Json | null
          escola_id?: string
          historico_escolar?: string | null
          id?: string
          laudo_medico?: string | null
          motivo_status?: string | null
          numero_matricula?: string
          observacoes?: string | null
          status?: string | null
          tenant_id?: string
          turma_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educacao_matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "educacao_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_matriculas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "educacao_escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_matriculas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "educacao_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      educacao_profissionais: {
        Row: {
          carga_horaria_semanal: number | null
          cargo: string
          contato: Json | null
          cpf: string | null
          created_at: string | null
          data_admissao: string
          data_demissao: string | null
          data_nascimento: string | null
          disciplinas_lecionadas: string[] | null
          endereco: Json | null
          escolas_atuacao: string[] | null
          especialidade: string[] | null
          experiencia_anos: number | null
          formacao_academica: Json | null
          id: string
          matricula_funcional: string
          nome_completo: string
          observacoes: string | null
          status: string | null
          tenant_id: string
          turmas_responsavel: string[] | null
          turno_trabalho: string[] | null
          updated_at: string | null
        }
        Insert: {
          carga_horaria_semanal?: number | null
          cargo: string
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_admissao: string
          data_demissao?: string | null
          data_nascimento?: string | null
          disciplinas_lecionadas?: string[] | null
          endereco?: Json | null
          escolas_atuacao?: string[] | null
          especialidade?: string[] | null
          experiencia_anos?: number | null
          formacao_academica?: Json | null
          id?: string
          matricula_funcional: string
          nome_completo: string
          observacoes?: string | null
          status?: string | null
          tenant_id: string
          turmas_responsavel?: string[] | null
          turno_trabalho?: string[] | null
          updated_at?: string | null
        }
        Update: {
          carga_horaria_semanal?: number | null
          cargo?: string
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_admissao?: string
          data_demissao?: string | null
          data_nascimento?: string | null
          disciplinas_lecionadas?: string[] | null
          endereco?: Json | null
          escolas_atuacao?: string[] | null
          especialidade?: string[] | null
          experiencia_anos?: number | null
          formacao_academica?: Json | null
          id?: string
          matricula_funcional?: string
          nome_completo?: string
          observacoes?: string | null
          status?: string | null
          tenant_id?: string
          turmas_responsavel?: string[] | null
          turno_trabalho?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educacao_profissionais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      educacao_turmas: {
        Row: {
          ano_letivo: number
          codigo: string
          created_at: string | null
          disciplinas_oferecidas: string[] | null
          escola_id: string
          horario_aulas: Json | null
          id: string
          nivel_ensino: string
          nome: string | null
          observacoes: string | null
          professor_regente_id: string | null
          sala_aula: string | null
          serie: string
          status: string | null
          tenant_id: string
          turno: string
          updated_at: string | null
          vagas_ocupadas: number | null
          vagas_reservadas: number | null
          vagas_total: number | null
        }
        Insert: {
          ano_letivo: number
          codigo: string
          created_at?: string | null
          disciplinas_oferecidas?: string[] | null
          escola_id: string
          horario_aulas?: Json | null
          id?: string
          nivel_ensino: string
          nome?: string | null
          observacoes?: string | null
          professor_regente_id?: string | null
          sala_aula?: string | null
          serie: string
          status?: string | null
          tenant_id: string
          turno: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_reservadas?: number | null
          vagas_total?: number | null
        }
        Update: {
          ano_letivo?: number
          codigo?: string
          created_at?: string | null
          disciplinas_oferecidas?: string[] | null
          escola_id?: string
          horario_aulas?: Json | null
          id?: string
          nivel_ensino?: string
          nome?: string | null
          observacoes?: string | null
          professor_regente_id?: string | null
          sala_aula?: string | null
          serie?: string
          status?: string | null
          tenant_id?: string
          turno?: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_reservadas?: number | null
          vagas_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "educacao_turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "educacao_escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_turmas_professor_regente_id_fkey"
            columns: ["professor_regente_id"]
            isOneToOne: false
            referencedRelation: "educacao_profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_turmas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      esportes_atletas: {
        Row: {
          conquistas_individuais: string[] | null
          contato: Json | null
          cpf: string | null
          created_at: string | null
          data_exame_medico: string | null
          data_nascimento: string | null
          endereco: Json | null
          equipe_id: string | null
          exame_medico_valido: boolean | null
          federado: boolean | null
          historico_lesoes: string[] | null
          id: string
          modalidades: string[] | null
          nivel_experiencia: string | null
          nome_completo: string
          numero_federacao: string | null
          posicao_funcao: string | null
          responsavel_legal: Json | null
          restricoes_medicas: string[] | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          conquistas_individuais?: string[] | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_exame_medico?: string | null
          data_nascimento?: string | null
          endereco?: Json | null
          equipe_id?: string | null
          exame_medico_valido?: boolean | null
          federado?: boolean | null
          historico_lesoes?: string[] | null
          id?: string
          modalidades?: string[] | null
          nivel_experiencia?: string | null
          nome_completo: string
          numero_federacao?: string | null
          posicao_funcao?: string | null
          responsavel_legal?: Json | null
          restricoes_medicas?: string[] | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          conquistas_individuais?: string[] | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_exame_medico?: string | null
          data_nascimento?: string | null
          endereco?: Json | null
          equipe_id?: string | null
          exame_medico_valido?: boolean | null
          federado?: boolean | null
          historico_lesoes?: string[] | null
          id?: string
          modalidades?: string[] | null
          nivel_experiencia?: string | null
          nome_completo?: string
          numero_federacao?: string | null
          posicao_funcao?: string | null
          responsavel_legal?: Json | null
          restricoes_medicas?: string[] | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esportes_atletas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "esportes_equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      esportes_competicoes: {
        Row: {
          categoria: string | null
          cobertura_midia: string[] | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          equipes_inscritas: number | null
          equipes_participantes: number | null
          id: string
          local_realizacao_id: string | null
          modalidade: string | null
          nome: string
          orcamento_total: number | null
          organizador_id: string | null
          patrocinadores: string[] | null
          premiacao: Json | null
          publico_esperado: number | null
          publico_presente: number | null
          regulamento: string | null
          resultados: Json | null
          status: string | null
          tenant_id: string
          tipo: string | null
          transmissao_online: boolean | null
          updated_at: string | null
          valor_inscricao: number | null
        }
        Insert: {
          categoria?: string | null
          cobertura_midia?: string[] | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          equipes_inscritas?: number | null
          equipes_participantes?: number | null
          id?: string
          local_realizacao_id?: string | null
          modalidade?: string | null
          nome: string
          orcamento_total?: number | null
          organizador_id?: string | null
          patrocinadores?: string[] | null
          premiacao?: Json | null
          publico_esperado?: number | null
          publico_presente?: number | null
          regulamento?: string | null
          resultados?: Json | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          transmissao_online?: boolean | null
          updated_at?: string | null
          valor_inscricao?: number | null
        }
        Update: {
          categoria?: string | null
          cobertura_midia?: string[] | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          equipes_inscritas?: number | null
          equipes_participantes?: number | null
          id?: string
          local_realizacao_id?: string | null
          modalidade?: string | null
          nome?: string
          orcamento_total?: number | null
          organizador_id?: string | null
          patrocinadores?: string[] | null
          premiacao?: Json | null
          publico_esperado?: number | null
          publico_presente?: number | null
          regulamento?: string | null
          resultados?: Json | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          transmissao_online?: boolean | null
          updated_at?: string | null
          valor_inscricao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "esportes_competicoes_local_realizacao_id_fkey"
            columns: ["local_realizacao_id"]
            isOneToOne: false
            referencedRelation: "esportes_infraestrutura"
            referencedColumns: ["id"]
          },
        ]
      }
      esportes_equipes: {
        Row: {
          atletas_ativos: number | null
          atletas_cadastrados: number | null
          categoria: string | null
          conquistas: string[] | null
          created_at: string | null
          equipamentos_fornecidos: string[] | null
          historico_competicoes: Json | null
          horario_treino: Json | null
          id: string
          local_treino_id: string | null
          modalidade: string | null
          nome: string
          orcamento_anual: number | null
          patrocinadores: string[] | null
          status: string | null
          tecnico_contato: Json | null
          tecnico_nome: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          atletas_ativos?: number | null
          atletas_cadastrados?: number | null
          categoria?: string | null
          conquistas?: string[] | null
          created_at?: string | null
          equipamentos_fornecidos?: string[] | null
          historico_competicoes?: Json | null
          horario_treino?: Json | null
          id?: string
          local_treino_id?: string | null
          modalidade?: string | null
          nome: string
          orcamento_anual?: number | null
          patrocinadores?: string[] | null
          status?: string | null
          tecnico_contato?: Json | null
          tecnico_nome?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          atletas_ativos?: number | null
          atletas_cadastrados?: number | null
          categoria?: string | null
          conquistas?: string[] | null
          created_at?: string | null
          equipamentos_fornecidos?: string[] | null
          historico_competicoes?: Json | null
          horario_treino?: Json | null
          id?: string
          local_treino_id?: string | null
          modalidade?: string | null
          nome?: string
          orcamento_anual?: number | null
          patrocinadores?: string[] | null
          status?: string | null
          tecnico_contato?: Json | null
          tecnico_nome?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esportes_equipes_local_treino_id_fkey"
            columns: ["local_treino_id"]
            isOneToOne: false
            referencedRelation: "esportes_infraestrutura"
            referencedColumns: ["id"]
          },
        ]
      }
      esportes_escolinhas: {
        Row: {
          apresentacoes_publicas: boolean | null
          avaliacoes_periodicas: boolean | null
          created_at: string | null
          faixa_etaria_fim: number | null
          faixa_etaria_inicio: number | null
          horario: Json | null
          id: string
          lista_espera: number | null
          local_atividade_id: string | null
          material_incluido: string[] | null
          metodologia: string | null
          modalidade: string | null
          nome: string
          objetivos: string | null
          professor_id: string | null
          seguro_incluido: boolean | null
          status: string | null
          tenant_id: string
          uniforme_fornecido: boolean | null
          updated_at: string | null
          vagas_ocupadas: number | null
          vagas_oferecidas: number | null
          valor_mensalidade: number | null
        }
        Insert: {
          apresentacoes_publicas?: boolean | null
          avaliacoes_periodicas?: boolean | null
          created_at?: string | null
          faixa_etaria_fim?: number | null
          faixa_etaria_inicio?: number | null
          horario?: Json | null
          id?: string
          lista_espera?: number | null
          local_atividade_id?: string | null
          material_incluido?: string[] | null
          metodologia?: string | null
          modalidade?: string | null
          nome: string
          objetivos?: string | null
          professor_id?: string | null
          seguro_incluido?: boolean | null
          status?: string | null
          tenant_id: string
          uniforme_fornecido?: boolean | null
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_oferecidas?: number | null
          valor_mensalidade?: number | null
        }
        Update: {
          apresentacoes_publicas?: boolean | null
          avaliacoes_periodicas?: boolean | null
          created_at?: string | null
          faixa_etaria_fim?: number | null
          faixa_etaria_inicio?: number | null
          horario?: Json | null
          id?: string
          lista_espera?: number | null
          local_atividade_id?: string | null
          material_incluido?: string[] | null
          metodologia?: string | null
          modalidade?: string | null
          nome?: string
          objetivos?: string | null
          professor_id?: string | null
          seguro_incluido?: boolean | null
          status?: string | null
          tenant_id?: string
          uniforme_fornecido?: boolean | null
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_oferecidas?: number | null
          valor_mensalidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "esportes_escolinhas_local_atividade_id_fkey"
            columns: ["local_atividade_id"]
            isOneToOne: false
            referencedRelation: "esportes_infraestrutura"
            referencedColumns: ["id"]
          },
        ]
      }
      esportes_infraestrutura: {
        Row: {
          acessibilidade: boolean | null
          capacidade: number | null
          condicoes_uso: string | null
          created_at: string | null
          endereco: Json | null
          equipamentos_disponiveis: string[] | null
          estacionamento: number | null
          horario_funcionamento: Json | null
          id: string
          iluminacao: boolean | null
          manutencao_necessaria: string[] | null
          modalidades: string[] | null
          nome: string
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          ultima_reforma: string | null
          updated_at: string | null
          valor_locacao_hora: number | null
          vestiarios: number | null
        }
        Insert: {
          acessibilidade?: boolean | null
          capacidade?: number | null
          condicoes_uso?: string | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_disponiveis?: string[] | null
          estacionamento?: number | null
          horario_funcionamento?: Json | null
          id?: string
          iluminacao?: boolean | null
          manutencao_necessaria?: string[] | null
          modalidades?: string[] | null
          nome: string
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          ultima_reforma?: string | null
          updated_at?: string | null
          valor_locacao_hora?: number | null
          vestiarios?: number | null
        }
        Update: {
          acessibilidade?: boolean | null
          capacidade?: number | null
          condicoes_uso?: string | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_disponiveis?: string[] | null
          estacionamento?: number | null
          horario_funcionamento?: Json | null
          id?: string
          iluminacao?: boolean | null
          manutencao_necessaria?: string[] | null
          modalidades?: string[] | null
          nome?: string
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          ultima_reforma?: string | null
          updated_at?: string | null
          valor_locacao_hora?: number | null
          vestiarios?: number | null
        }
        Relationships: []
      }
      gabinete_agenda: {
        Row: {
          apoio_necessario: string[] | null
          assessor_responsavel_id: string | null
          ata_reuniao: string | null
          avaliacao_evento: string | null
          categoria: string | null
          compromissos_assumidos: string[] | null
          contato_organizador: Json | null
          created_at: string | null
          data_evento: string | null
          descricao: string | null
          documentos_evento: string[] | null
          dresscode: string | null
          endereco_completo: Json | null
          equipamentos_necessarios: string[] | null
          fotos_evento: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          imprensa_convidada: boolean | null
          local_evento: string | null
          materiais_necessarios: string[] | null
          motorista_designado: string | null
          observacoes_especiais: string | null
          organizador: string | null
          participantes: Json | null
          pauta: string[] | null
          pendencias: string[] | null
          protocolo_necessario: string[] | null
          seguranca_necessaria: boolean | null
          status: string | null
          tenant_id: string
          tipo_evento: string | null
          titulo: string
          transmissao_online: boolean | null
          updated_at: string | null
          veiculo_oficial: string | null
        }
        Insert: {
          apoio_necessario?: string[] | null
          assessor_responsavel_id?: string | null
          ata_reuniao?: string | null
          avaliacao_evento?: string | null
          categoria?: string | null
          compromissos_assumidos?: string[] | null
          contato_organizador?: Json | null
          created_at?: string | null
          data_evento?: string | null
          descricao?: string | null
          documentos_evento?: string[] | null
          dresscode?: string | null
          endereco_completo?: Json | null
          equipamentos_necessarios?: string[] | null
          fotos_evento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          imprensa_convidada?: boolean | null
          local_evento?: string | null
          materiais_necessarios?: string[] | null
          motorista_designado?: string | null
          observacoes_especiais?: string | null
          organizador?: string | null
          participantes?: Json | null
          pauta?: string[] | null
          pendencias?: string[] | null
          protocolo_necessario?: string[] | null
          seguranca_necessaria?: boolean | null
          status?: string | null
          tenant_id: string
          tipo_evento?: string | null
          titulo: string
          transmissao_online?: boolean | null
          updated_at?: string | null
          veiculo_oficial?: string | null
        }
        Update: {
          apoio_necessario?: string[] | null
          assessor_responsavel_id?: string | null
          ata_reuniao?: string | null
          avaliacao_evento?: string | null
          categoria?: string | null
          compromissos_assumidos?: string[] | null
          contato_organizador?: Json | null
          created_at?: string | null
          data_evento?: string | null
          descricao?: string | null
          documentos_evento?: string[] | null
          dresscode?: string | null
          endereco_completo?: Json | null
          equipamentos_necessarios?: string[] | null
          fotos_evento?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          imprensa_convidada?: boolean | null
          local_evento?: string | null
          materiais_necessarios?: string[] | null
          motorista_designado?: string | null
          observacoes_especiais?: string | null
          organizador?: string | null
          participantes?: Json | null
          pauta?: string[] | null
          pendencias?: string[] | null
          protocolo_necessario?: string[] | null
          seguranca_necessaria?: boolean | null
          status?: string | null
          tenant_id?: string
          tipo_evento?: string | null
          titulo?: string
          transmissao_online?: boolean | null
          updated_at?: string | null
          veiculo_oficial?: string | null
        }
        Relationships: []
      }
      gabinete_atendimentos: {
        Row: {
          acompanhamento: Json | null
          arquivos_resposta: string[] | null
          assunto: string | null
          canal_entrada: string | null
          categoria: string | null
          created_at: string | null
          data_protocolo: string | null
          data_resposta: string | null
          descricao_solicitacao: string | null
          documentos_anexos: string[] | null
          encaminhamentos: string[] | null
          endereco_solicitante: Json | null
          feedback_cidadao: string | null
          funcionario_designado_id: string | null
          horario_protocolo: string | null
          id: string
          observacoes: string | null
          prazo_resposta: number | null
          protocolo: string | null
          responsavel_recebimento_id: string | null
          resposta_dada: string | null
          satisfacao_cidadao: number | null
          secretaria_destino: string | null
          solicitante_contato: Json | null
          solicitante_cpf: string | null
          solicitante_nome: string
          status: string | null
          tenant_id: string
          tipo_atendimento: string | null
          updated_at: string | null
          urgencia: string | null
        }
        Insert: {
          acompanhamento?: Json | null
          arquivos_resposta?: string[] | null
          assunto?: string | null
          canal_entrada?: string | null
          categoria?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_resposta?: string | null
          descricao_solicitacao?: string | null
          documentos_anexos?: string[] | null
          encaminhamentos?: string[] | null
          endereco_solicitante?: Json | null
          feedback_cidadao?: string | null
          funcionario_designado_id?: string | null
          horario_protocolo?: string | null
          id?: string
          observacoes?: string | null
          prazo_resposta?: number | null
          protocolo?: string | null
          responsavel_recebimento_id?: string | null
          resposta_dada?: string | null
          satisfacao_cidadao?: number | null
          secretaria_destino?: string | null
          solicitante_contato?: Json | null
          solicitante_cpf?: string | null
          solicitante_nome: string
          status?: string | null
          tenant_id: string
          tipo_atendimento?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Update: {
          acompanhamento?: Json | null
          arquivos_resposta?: string[] | null
          assunto?: string | null
          canal_entrada?: string | null
          categoria?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_resposta?: string | null
          descricao_solicitacao?: string | null
          documentos_anexos?: string[] | null
          encaminhamentos?: string[] | null
          endereco_solicitante?: Json | null
          feedback_cidadao?: string | null
          funcionario_designado_id?: string | null
          horario_protocolo?: string | null
          id?: string
          observacoes?: string | null
          prazo_resposta?: number | null
          protocolo?: string | null
          responsavel_recebimento_id?: string | null
          resposta_dada?: string | null
          satisfacao_cidadao?: number | null
          secretaria_destino?: string | null
          solicitante_contato?: Json | null
          solicitante_cpf?: string | null
          solicitante_nome?: string
          status?: string | null
          tenant_id?: string
          tipo_atendimento?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Relationships: []
      }
      gabinete_audiencias: {
        Row: {
          acompanhamento_necessario: boolean | null
          assunto_audiencia: string | null
          ata_reuniao: string | null
          avaliacao_resultado: string | null
          categoria: string | null
          compromissos_assumidos: string[] | null
          created_at: string | null
          data_agendamento: string | null
          data_proximo_contato: string | null
          data_solicitacao: string | null
          demandas_apresentadas: string[] | null
          documentos_apresentacao: string[] | null
          duracao_minutos: number | null
          encaminhamentos: string[] | null
          entidade_representada: string | null
          fotos_reuniao: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          justificativa: string | null
          local_realizacao: string | null
          material_entregue: string[] | null
          observacoes: string | null
          participantes: Json | null
          pauta_discussao: string[] | null
          prazos_acordados: Json | null
          proximos_passos: string[] | null
          secretarias_envolvidas: string[] | null
          solicitante_cargo: string | null
          solicitante_contato: Json | null
          solicitante_nome: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          acompanhamento_necessario?: boolean | null
          assunto_audiencia?: string | null
          ata_reuniao?: string | null
          avaliacao_resultado?: string | null
          categoria?: string | null
          compromissos_assumidos?: string[] | null
          created_at?: string | null
          data_agendamento?: string | null
          data_proximo_contato?: string | null
          data_solicitacao?: string | null
          demandas_apresentadas?: string[] | null
          documentos_apresentacao?: string[] | null
          duracao_minutos?: number | null
          encaminhamentos?: string[] | null
          entidade_representada?: string | null
          fotos_reuniao?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          justificativa?: string | null
          local_realizacao?: string | null
          material_entregue?: string[] | null
          observacoes?: string | null
          participantes?: Json | null
          pauta_discussao?: string[] | null
          prazos_acordados?: Json | null
          proximos_passos?: string[] | null
          secretarias_envolvidas?: string[] | null
          solicitante_cargo?: string | null
          solicitante_contato?: Json | null
          solicitante_nome: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          acompanhamento_necessario?: boolean | null
          assunto_audiencia?: string | null
          ata_reuniao?: string | null
          avaliacao_resultado?: string | null
          categoria?: string | null
          compromissos_assumidos?: string[] | null
          created_at?: string | null
          data_agendamento?: string | null
          data_proximo_contato?: string | null
          data_solicitacao?: string | null
          demandas_apresentadas?: string[] | null
          documentos_apresentacao?: string[] | null
          duracao_minutos?: number | null
          encaminhamentos?: string[] | null
          entidade_representada?: string | null
          fotos_reuniao?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          justificativa?: string | null
          local_realizacao?: string | null
          material_entregue?: string[] | null
          observacoes?: string | null
          participantes?: Json | null
          pauta_discussao?: string[] | null
          prazos_acordados?: Json | null
          proximos_passos?: string[] | null
          secretarias_envolvidas?: string[] | null
          solicitante_cargo?: string | null
          solicitante_contato?: Json | null
          solicitante_nome?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gabinete_indicadores: {
        Row: {
          acoes_melhoria: string[] | null
          alertas_configurados: Json | null
          benchmark_referencia: number | null
          categoria: string | null
          created_at: string | null
          dashboard_publico: boolean | null
          fonte_benchmark: string | null
          fonte_dados: string | null
          frequencia_atualizacao: string | null
          historico_valores: Json | null
          id: string
          meta_anual: number | null
          meta_mensal: number | null
          metas_intermediarias: Json | null
          metodologia_calculo: string | null
          nome_indicador: string
          observacoes_valor: string | null
          percentual_meta: number | null
          proxima_atualizacao: string | null
          relatorios_gerados: string[] | null
          responsavel_coleta_id: string | null
          status: string | null
          tenant_id: string
          tendencia: string | null
          ultima_atualizacao: string | null
          unidade_medida: string | null
          updated_at: string | null
          valor_atual: number | null
          valor_mes_anterior: number | null
        }
        Insert: {
          acoes_melhoria?: string[] | null
          alertas_configurados?: Json | null
          benchmark_referencia?: number | null
          categoria?: string | null
          created_at?: string | null
          dashboard_publico?: boolean | null
          fonte_benchmark?: string | null
          fonte_dados?: string | null
          frequencia_atualizacao?: string | null
          historico_valores?: Json | null
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          metas_intermediarias?: Json | null
          metodologia_calculo?: string | null
          nome_indicador: string
          observacoes_valor?: string | null
          percentual_meta?: number | null
          proxima_atualizacao?: string | null
          relatorios_gerados?: string[] | null
          responsavel_coleta_id?: string | null
          status?: string | null
          tenant_id: string
          tendencia?: string | null
          ultima_atualizacao?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_atual?: number | null
          valor_mes_anterior?: number | null
        }
        Update: {
          acoes_melhoria?: string[] | null
          alertas_configurados?: Json | null
          benchmark_referencia?: number | null
          categoria?: string | null
          created_at?: string | null
          dashboard_publico?: boolean | null
          fonte_benchmark?: string | null
          fonte_dados?: string | null
          frequencia_atualizacao?: string | null
          historico_valores?: Json | null
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          metas_intermediarias?: Json | null
          metodologia_calculo?: string | null
          nome_indicador?: string
          observacoes_valor?: string | null
          percentual_meta?: number | null
          proxima_atualizacao?: string | null
          relatorios_gerados?: string[] | null
          responsavel_coleta_id?: string | null
          status?: string | null
          tenant_id?: string
          tendencia?: string | null
          ultima_atualizacao?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_atual?: number | null
          valor_mes_anterior?: number | null
        }
        Relationships: []
      }
      gabinete_projetos_estrategicos: {
        Row: {
          avaliacao_final: string | null
          coordenador_projeto_id: string | null
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          descricao: string | null
          equipe_trabalho: string[] | null
          etapas_concluidas: Json | null
          etapas_previstas: Json | null
          fonte_recursos: string | null
          id: string
          impacto_economico: number | null
          impacto_social: string | null
          indicadores_sucesso: Json | null
          justificativa: string | null
          licoes_aprendidas: string[] | null
          marcos_importantes: Json | null
          nome_projeto: string
          objetivo_principal: string | null
          objetivos_especificos: string[] | null
          observacoes: string | null
          orcamento_total: number | null
          parceiros_externos: string[] | null
          percentual_executado: number | null
          plano_contingencia: string[] | null
          prestacao_contas: string[] | null
          publico_beneficiado: string | null
          recomendacoes: string[] | null
          relatorios_progresso: string[] | null
          resultados_alcancados: string[] | null
          riscos_identificados: string[] | null
          secretarias_envolvidas: string[] | null
          status: string | null
          sustentabilidade: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          avaliacao_final?: string | null
          coordenador_projeto_id?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          equipe_trabalho?: string[] | null
          etapas_concluidas?: Json | null
          etapas_previstas?: Json | null
          fonte_recursos?: string | null
          id?: string
          impacto_economico?: number | null
          impacto_social?: string | null
          indicadores_sucesso?: Json | null
          justificativa?: string | null
          licoes_aprendidas?: string[] | null
          marcos_importantes?: Json | null
          nome_projeto: string
          objetivo_principal?: string | null
          objetivos_especificos?: string[] | null
          observacoes?: string | null
          orcamento_total?: number | null
          parceiros_externos?: string[] | null
          percentual_executado?: number | null
          plano_contingencia?: string[] | null
          prestacao_contas?: string[] | null
          publico_beneficiado?: string | null
          recomendacoes?: string[] | null
          relatorios_progresso?: string[] | null
          resultados_alcancados?: string[] | null
          riscos_identificados?: string[] | null
          secretarias_envolvidas?: string[] | null
          status?: string | null
          sustentabilidade?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          avaliacao_final?: string | null
          coordenador_projeto_id?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          equipe_trabalho?: string[] | null
          etapas_concluidas?: Json | null
          etapas_previstas?: Json | null
          fonte_recursos?: string | null
          id?: string
          impacto_economico?: number | null
          impacto_social?: string | null
          indicadores_sucesso?: Json | null
          justificativa?: string | null
          licoes_aprendidas?: string[] | null
          marcos_importantes?: Json | null
          nome_projeto?: string
          objetivo_principal?: string | null
          objetivos_especificos?: string[] | null
          observacoes?: string | null
          orcamento_total?: number | null
          parceiros_externos?: string[] | null
          percentual_executado?: number | null
          plano_contingencia?: string[] | null
          prestacao_contas?: string[] | null
          publico_beneficiado?: string | null
          recomendacoes?: string[] | null
          relatorios_progresso?: string[] | null
          resultados_alcancados?: string[] | null
          riscos_identificados?: string[] | null
          secretarias_envolvidas?: string[] | null
          status?: string | null
          sustentabilidade?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      habitacao_familias: {
        Row: {
          composicao_familiar: Json | null
          contato: Json | null
          created_at: string | null
          criancas_adolescentes: number | null
          data_nascimento: string | null
          endereco_atual: Json | null
          estado_civil: string | null
          id: string
          observacoes: string | null
          pessoas_deficiencia: number | null
          pessoas_idosas: number | null
          pontuacao_social: number | null
          profissao: string | null
          programas_interesse: string[] | null
          renda_familiar: number | null
          responsavel_cpf: string | null
          responsavel_nome: string
          responsavel_rg: string | null
          situacao_atual: string | null
          situacao_documentos: string | null
          status: string | null
          tempo_municipio: number | null
          tenant_id: string
          updated_at: string | null
          valor_aluguel_atual: number | null
          vulnerabilidades: string[] | null
        }
        Insert: {
          composicao_familiar?: Json | null
          contato?: Json | null
          created_at?: string | null
          criancas_adolescentes?: number | null
          data_nascimento?: string | null
          endereco_atual?: Json | null
          estado_civil?: string | null
          id?: string
          observacoes?: string | null
          pessoas_deficiencia?: number | null
          pessoas_idosas?: number | null
          pontuacao_social?: number | null
          profissao?: string | null
          programas_interesse?: string[] | null
          renda_familiar?: number | null
          responsavel_cpf?: string | null
          responsavel_nome: string
          responsavel_rg?: string | null
          situacao_atual?: string | null
          situacao_documentos?: string | null
          status?: string | null
          tempo_municipio?: number | null
          tenant_id: string
          updated_at?: string | null
          valor_aluguel_atual?: number | null
          vulnerabilidades?: string[] | null
        }
        Update: {
          composicao_familiar?: Json | null
          contato?: Json | null
          created_at?: string | null
          criancas_adolescentes?: number | null
          data_nascimento?: string | null
          endereco_atual?: Json | null
          estado_civil?: string | null
          id?: string
          observacoes?: string | null
          pessoas_deficiencia?: number | null
          pessoas_idosas?: number | null
          pontuacao_social?: number | null
          profissao?: string | null
          programas_interesse?: string[] | null
          renda_familiar?: number | null
          responsavel_cpf?: string | null
          responsavel_nome?: string
          responsavel_rg?: string | null
          situacao_atual?: string | null
          situacao_documentos?: string | null
          status?: string | null
          tempo_municipio?: number | null
          tenant_id?: string
          updated_at?: string | null
          valor_aluguel_atual?: number | null
          vulnerabilidades?: string[] | null
        }
        Relationships: []
      }
      habitacao_programas: {
        Row: {
          coordenador_id: string | null
          created_at: string | null
          criterios_pontuacao: Json | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          documentos_necessarios: string[] | null
          entrada_necessaria: number | null
          fonte_recurso: string | null
          id: string
          nome: string
          orcamento_total: number | null
          prazo_financiamento: number | null
          prestacao_maxima: number | null
          publico_alvo: string | null
          renda_maxima: number | null
          renda_minima: number | null
          status: string | null
          tenant_id: string
          tipo: string | null
          unidades_entregues: number | null
          unidades_previstas: number | null
          updated_at: string | null
          valor_financiado: number | null
          valor_subsidiado: number | null
        }
        Insert: {
          coordenador_id?: string | null
          created_at?: string | null
          criterios_pontuacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          entrada_necessaria?: number | null
          fonte_recurso?: string | null
          id?: string
          nome: string
          orcamento_total?: number | null
          prazo_financiamento?: number | null
          prestacao_maxima?: number | null
          publico_alvo?: string | null
          renda_maxima?: number | null
          renda_minima?: number | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          unidades_entregues?: number | null
          unidades_previstas?: number | null
          updated_at?: string | null
          valor_financiado?: number | null
          valor_subsidiado?: number | null
        }
        Update: {
          coordenador_id?: string | null
          created_at?: string | null
          criterios_pontuacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          entrada_necessaria?: number | null
          fonte_recurso?: string | null
          id?: string
          nome?: string
          orcamento_total?: number | null
          prazo_financiamento?: number | null
          prestacao_maxima?: number | null
          publico_alvo?: string | null
          renda_maxima?: number | null
          renda_minima?: number | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          unidades_entregues?: number | null
          unidades_previstas?: number | null
          updated_at?: string | null
          valor_financiado?: number | null
          valor_subsidiado?: number | null
        }
        Relationships: []
      }
      habitacao_regularizacao: {
        Row: {
          area_ocupada: number | null
          created_at: string | null
          documentacao_final: string[] | null
          documentos_posse: string[] | null
          endereco_imovel: Json | null
          id: string
          numero_parcelas: number | null
          observacoes: string | null
          parcelamento_aprovado: boolean | null
          parcelas_pagas: number | null
          processo_judicial: string | null
          registro_cartorio: boolean | null
          requerente_cpf: string | null
          requerente_nome: string
          responsavel_tecnico_id: string | null
          situacao_legal: string | null
          status: string | null
          taxa_regularizacao: number | null
          tempo_ocupacao: number | null
          tenant_id: string
          tipo_ocupacao: string | null
          updated_at: string | null
          valor_avaliacao: number | null
          valor_parcela: number | null
        }
        Insert: {
          area_ocupada?: number | null
          created_at?: string | null
          documentacao_final?: string[] | null
          documentos_posse?: string[] | null
          endereco_imovel?: Json | null
          id?: string
          numero_parcelas?: number | null
          observacoes?: string | null
          parcelamento_aprovado?: boolean | null
          parcelas_pagas?: number | null
          processo_judicial?: string | null
          registro_cartorio?: boolean | null
          requerente_cpf?: string | null
          requerente_nome: string
          responsavel_tecnico_id?: string | null
          situacao_legal?: string | null
          status?: string | null
          taxa_regularizacao?: number | null
          tempo_ocupacao?: number | null
          tenant_id: string
          tipo_ocupacao?: string | null
          updated_at?: string | null
          valor_avaliacao?: number | null
          valor_parcela?: number | null
        }
        Update: {
          area_ocupada?: number | null
          created_at?: string | null
          documentacao_final?: string[] | null
          documentos_posse?: string[] | null
          endereco_imovel?: Json | null
          id?: string
          numero_parcelas?: number | null
          observacoes?: string | null
          parcelamento_aprovado?: boolean | null
          parcelas_pagas?: number | null
          processo_judicial?: string | null
          registro_cartorio?: boolean | null
          requerente_cpf?: string | null
          requerente_nome?: string
          responsavel_tecnico_id?: string | null
          situacao_legal?: string | null
          status?: string | null
          taxa_regularizacao?: number | null
          tempo_ocupacao?: number | null
          tenant_id?: string
          tipo_ocupacao?: string | null
          updated_at?: string | null
          valor_avaliacao?: number | null
          valor_parcela?: number | null
        }
        Relationships: []
      }
      habitacao_selecao: {
        Row: {
          aprovado: boolean | null
          classificacao: number | null
          created_at: string | null
          data_aprovacao: string | null
          data_inscricao: string | null
          documentos_entregues: string[] | null
          documentos_pendentes: string[] | null
          familia_id: string | null
          id: string
          motivo_reprovacao: string | null
          observacoes: string | null
          pontuacao_final: number | null
          programa_id: string | null
          recurso_apresentado: boolean | null
          recurso_aprovado: boolean | null
          status: string | null
          tenant_id: string
          unidade_indicada_id: string | null
          updated_at: string | null
        }
        Insert: {
          aprovado?: boolean | null
          classificacao?: number | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_inscricao?: string | null
          documentos_entregues?: string[] | null
          documentos_pendentes?: string[] | null
          familia_id?: string | null
          id?: string
          motivo_reprovacao?: string | null
          observacoes?: string | null
          pontuacao_final?: number | null
          programa_id?: string | null
          recurso_apresentado?: boolean | null
          recurso_aprovado?: boolean | null
          status?: string | null
          tenant_id: string
          unidade_indicada_id?: string | null
          updated_at?: string | null
        }
        Update: {
          aprovado?: boolean | null
          classificacao?: number | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_inscricao?: string | null
          documentos_entregues?: string[] | null
          documentos_pendentes?: string[] | null
          familia_id?: string | null
          id?: string
          motivo_reprovacao?: string | null
          observacoes?: string | null
          pontuacao_final?: number | null
          programa_id?: string | null
          recurso_apresentado?: boolean | null
          recurso_aprovado?: boolean | null
          status?: string | null
          tenant_id?: string
          unidade_indicada_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habitacao_selecao_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "habitacao_familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habitacao_selecao_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "habitacao_programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habitacao_selecao_unidade_indicada_id_fkey"
            columns: ["unidade_indicada_id"]
            isOneToOne: false
            referencedRelation: "habitacao_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      habitacao_unidades: {
        Row: {
          acessibilidade: boolean | null
          area_construida: number | null
          area_terreno: number | null
          banheiros: number | null
          created_at: string | null
          data_entrega: string | null
          endereco: Json | null
          escritura_registrada: boolean | null
          familia_beneficiada_id: string | null
          financiamento_aprovado: boolean | null
          fotos: string[] | null
          garagem: boolean | null
          id: string
          numero_unidade: string | null
          observacoes: string | null
          programa_id: string | null
          quartos: number | null
          quintal: boolean | null
          situacao: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          valor_avaliacao: number | null
          valor_venda: number | null
        }
        Insert: {
          acessibilidade?: boolean | null
          area_construida?: number | null
          area_terreno?: number | null
          banheiros?: number | null
          created_at?: string | null
          data_entrega?: string | null
          endereco?: Json | null
          escritura_registrada?: boolean | null
          familia_beneficiada_id?: string | null
          financiamento_aprovado?: boolean | null
          fotos?: string[] | null
          garagem?: boolean | null
          id?: string
          numero_unidade?: string | null
          observacoes?: string | null
          programa_id?: string | null
          quartos?: number | null
          quintal?: boolean | null
          situacao?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          valor_avaliacao?: number | null
          valor_venda?: number | null
        }
        Update: {
          acessibilidade?: boolean | null
          area_construida?: number | null
          area_terreno?: number | null
          banheiros?: number | null
          created_at?: string | null
          data_entrega?: string | null
          endereco?: Json | null
          escritura_registrada?: boolean | null
          familia_beneficiada_id?: string | null
          financiamento_aprovado?: boolean | null
          fotos?: string[] | null
          garagem?: boolean | null
          id?: string
          numero_unidade?: string | null
          observacoes?: string | null
          programa_id?: string | null
          quartos?: number | null
          quintal?: boolean | null
          situacao?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          valor_avaliacao?: number | null
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habitacao_unidades_familia_beneficiada_id_fkey"
            columns: ["familia_beneficiada_id"]
            isOneToOne: false
            referencedRelation: "habitacao_familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habitacao_unidades_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "habitacao_programas"
            referencedColumns: ["id"]
          },
        ]
      }
      meio_ambiente_areas_protegidas: {
        Row: {
          acoes_conservacao: string[] | null
          ameacas_identificadas: string[] | null
          area_hectares: number | null
          atividades_monitoramento: string[] | null
          bioma: string | null
          categoria: string | null
          coordenadas_poligono: Json | null
          created_at: string | null
          estudos_realizados: string[] | null
          fauna_presente: string[] | null
          gestor_responsavel: string | null
          id: string
          infraestrutura: string[] | null
          legislacao_aplicavel: string[] | null
          nome: string
          observacoes: string | null
          perimetro_km: number | null
          plano_manejo: string | null
          recursos_hidricos: string[] | null
          restricoes: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          uso_permitido: string[] | null
          vegetacao_predominante: string | null
          visitacao_permitida: boolean | null
        }
        Insert: {
          acoes_conservacao?: string[] | null
          ameacas_identificadas?: string[] | null
          area_hectares?: number | null
          atividades_monitoramento?: string[] | null
          bioma?: string | null
          categoria?: string | null
          coordenadas_poligono?: Json | null
          created_at?: string | null
          estudos_realizados?: string[] | null
          fauna_presente?: string[] | null
          gestor_responsavel?: string | null
          id?: string
          infraestrutura?: string[] | null
          legislacao_aplicavel?: string[] | null
          nome: string
          observacoes?: string | null
          perimetro_km?: number | null
          plano_manejo?: string | null
          recursos_hidricos?: string[] | null
          restricoes?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          uso_permitido?: string[] | null
          vegetacao_predominante?: string | null
          visitacao_permitida?: boolean | null
        }
        Update: {
          acoes_conservacao?: string[] | null
          ameacas_identificadas?: string[] | null
          area_hectares?: number | null
          atividades_monitoramento?: string[] | null
          bioma?: string | null
          categoria?: string | null
          coordenadas_poligono?: Json | null
          created_at?: string | null
          estudos_realizados?: string[] | null
          fauna_presente?: string[] | null
          gestor_responsavel?: string | null
          id?: string
          infraestrutura?: string[] | null
          legislacao_aplicavel?: string[] | null
          nome?: string
          observacoes?: string | null
          perimetro_km?: number | null
          plano_manejo?: string | null
          recursos_hidricos?: string[] | null
          restricoes?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          uso_permitido?: string[] | null
          vegetacao_predominante?: string | null
          visitacao_permitida?: boolean | null
        }
        Relationships: []
      }
      meio_ambiente_denuncias: {
        Row: {
          anonimo: boolean | null
          coordenadas_gps: Json | null
          created_at: string | null
          data_ocorrencia: string | null
          data_vistoria: string | null
          denunciante_contato: Json | null
          denunciante_nome: string | null
          descricao_fatos: string | null
          evidencias: string[] | null
          feedback_denunciante: string | null
          frequencia_ocorrencia: string | null
          horario_ocorrencia: string | null
          id: string
          local_ocorrencia: Json | null
          medidas_adotadas: string[] | null
          multa_aplicada: boolean | null
          processo_judicial: boolean | null
          relatorio_vistoria: string | null
          responsavel_presumido: string | null
          responsavel_vistoria_id: string | null
          riscos_identificados: string[] | null
          status: string | null
          tenant_id: string
          tipo_denuncia: string | null
          updated_at: string | null
          urgencia: string | null
          valor_multa: number | null
        }
        Insert: {
          anonimo?: boolean | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          data_ocorrencia?: string | null
          data_vistoria?: string | null
          denunciante_contato?: Json | null
          denunciante_nome?: string | null
          descricao_fatos?: string | null
          evidencias?: string[] | null
          feedback_denunciante?: string | null
          frequencia_ocorrencia?: string | null
          horario_ocorrencia?: string | null
          id?: string
          local_ocorrencia?: Json | null
          medidas_adotadas?: string[] | null
          multa_aplicada?: boolean | null
          processo_judicial?: boolean | null
          relatorio_vistoria?: string | null
          responsavel_presumido?: string | null
          responsavel_vistoria_id?: string | null
          riscos_identificados?: string[] | null
          status?: string | null
          tenant_id: string
          tipo_denuncia?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_multa?: number | null
        }
        Update: {
          anonimo?: boolean | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          data_ocorrencia?: string | null
          data_vistoria?: string | null
          denunciante_contato?: Json | null
          denunciante_nome?: string | null
          descricao_fatos?: string | null
          evidencias?: string[] | null
          feedback_denunciante?: string | null
          frequencia_ocorrencia?: string | null
          horario_ocorrencia?: string | null
          id?: string
          local_ocorrencia?: Json | null
          medidas_adotadas?: string[] | null
          multa_aplicada?: boolean | null
          processo_judicial?: boolean | null
          relatorio_vistoria?: string | null
          responsavel_presumido?: string | null
          responsavel_vistoria_id?: string | null
          riscos_identificados?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo_denuncia?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_multa?: number | null
        }
        Relationships: []
      }
      meio_ambiente_educacao: {
        Row: {
          atividades_praticas: string[] | null
          avaliacoes: Json | null
          carga_horaria: number | null
          certificacao: boolean | null
          created_at: string | null
          cronograma: Json | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          educador_responsavel: string | null
          faixa_etaria: string | null
          id: string
          impacto_medido: string | null
          local_realizacao: string | null
          material_didatico: string[] | null
          metodologia: string | null
          multiplicadores_formados: number | null
          numero_participantes: number | null
          orcamento: number | null
          parcerias: string[] | null
          programa_nome: string
          publico_alvo: string | null
          recursos_necessarios: string[] | null
          resultados_alcancados: string | null
          status: string | null
          temas_abordados: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          atividades_praticas?: string[] | null
          avaliacoes?: Json | null
          carga_horaria?: number | null
          certificacao?: boolean | null
          created_at?: string | null
          cronograma?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          educador_responsavel?: string | null
          faixa_etaria?: string | null
          id?: string
          impacto_medido?: string | null
          local_realizacao?: string | null
          material_didatico?: string[] | null
          metodologia?: string | null
          multiplicadores_formados?: number | null
          numero_participantes?: number | null
          orcamento?: number | null
          parcerias?: string[] | null
          programa_nome: string
          publico_alvo?: string | null
          recursos_necessarios?: string[] | null
          resultados_alcancados?: string | null
          status?: string | null
          temas_abordados?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          atividades_praticas?: string[] | null
          avaliacoes?: Json | null
          carga_horaria?: number | null
          certificacao?: boolean | null
          created_at?: string | null
          cronograma?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          educador_responsavel?: string | null
          faixa_etaria?: string | null
          id?: string
          impacto_medido?: string | null
          local_realizacao?: string | null
          material_didatico?: string[] | null
          metodologia?: string | null
          multiplicadores_formados?: number | null
          numero_participantes?: number | null
          orcamento?: number | null
          parcerias?: string[] | null
          programa_nome?: string
          publico_alvo?: string | null
          recursos_necessarios?: string[] | null
          resultados_alcancados?: string | null
          status?: string | null
          temas_abordados?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meio_ambiente_licenciamento: {
        Row: {
          area_impacto: number | null
          atividade_licenciada: string | null
          condicoes_impostas: string[] | null
          created_at: string | null
          data_emissao: string | null
          data_protocolo: string | null
          data_validade: string | null
          data_vistoria: string | null
          descricao_atividade: string | null
          documentos_anexos: string[] | null
          endereco_atividade: Json | null
          estudos_ambientais: string[] | null
          id: string
          impactos_identificados: string[] | null
          medidas_mitigadoras: string[] | null
          numero_licenca: string | null
          observacoes: string | null
          requerente_cpf_cnpj: string | null
          requerente_nome: string
          responsavel_tecnico: string | null
          status: string | null
          tenant_id: string
          tipo_licenca: string | null
          updated_at: string | null
          valor_taxa: number | null
        }
        Insert: {
          area_impacto?: number | null
          atividade_licenciada?: string | null
          condicoes_impostas?: string[] | null
          created_at?: string | null
          data_emissao?: string | null
          data_protocolo?: string | null
          data_validade?: string | null
          data_vistoria?: string | null
          descricao_atividade?: string | null
          documentos_anexos?: string[] | null
          endereco_atividade?: Json | null
          estudos_ambientais?: string[] | null
          id?: string
          impactos_identificados?: string[] | null
          medidas_mitigadoras?: string[] | null
          numero_licenca?: string | null
          observacoes?: string | null
          requerente_cpf_cnpj?: string | null
          requerente_nome: string
          responsavel_tecnico?: string | null
          status?: string | null
          tenant_id: string
          tipo_licenca?: string | null
          updated_at?: string | null
          valor_taxa?: number | null
        }
        Update: {
          area_impacto?: number | null
          atividade_licenciada?: string | null
          condicoes_impostas?: string[] | null
          created_at?: string | null
          data_emissao?: string | null
          data_protocolo?: string | null
          data_validade?: string | null
          data_vistoria?: string | null
          descricao_atividade?: string | null
          documentos_anexos?: string[] | null
          endereco_atividade?: Json | null
          estudos_ambientais?: string[] | null
          id?: string
          impactos_identificados?: string[] | null
          medidas_mitigadoras?: string[] | null
          numero_licenca?: string | null
          observacoes?: string | null
          requerente_cpf_cnpj?: string | null
          requerente_nome?: string
          responsavel_tecnico?: string | null
          status?: string | null
          tenant_id?: string
          tipo_licenca?: string | null
          updated_at?: string | null
          valor_taxa?: number | null
        }
        Relationships: []
      }
      meio_ambiente_monitoramento: {
        Row: {
          acoes_corretivas: string[] | null
          conformidade: boolean | null
          coordenadas_gps: Json | null
          created_at: string | null
          data_coleta: string | null
          desvios_identificados: string[] | null
          equipamentos_utilizados: string[] | null
          frequencia_coleta: string | null
          horario_coleta: string | null
          id: string
          laudos_laboratoriais: string[] | null
          parametros_monitorados: Json | null
          ponto_coleta: string | null
          proxima_coleta: string | null
          recomendacoes: string[] | null
          relatorio_tecnico: string | null
          responsavel_coleta: string | null
          resultados: Json | null
          status: string | null
          tenant_id: string
          tendencias_observadas: string | null
          tipo_monitoramento: string | null
          updated_at: string | null
          valores_referencia: Json | null
        }
        Insert: {
          acoes_corretivas?: string[] | null
          conformidade?: boolean | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          data_coleta?: string | null
          desvios_identificados?: string[] | null
          equipamentos_utilizados?: string[] | null
          frequencia_coleta?: string | null
          horario_coleta?: string | null
          id?: string
          laudos_laboratoriais?: string[] | null
          parametros_monitorados?: Json | null
          ponto_coleta?: string | null
          proxima_coleta?: string | null
          recomendacoes?: string[] | null
          relatorio_tecnico?: string | null
          responsavel_coleta?: string | null
          resultados?: Json | null
          status?: string | null
          tenant_id: string
          tendencias_observadas?: string | null
          tipo_monitoramento?: string | null
          updated_at?: string | null
          valores_referencia?: Json | null
        }
        Update: {
          acoes_corretivas?: string[] | null
          conformidade?: boolean | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          data_coleta?: string | null
          desvios_identificados?: string[] | null
          equipamentos_utilizados?: string[] | null
          frequencia_coleta?: string | null
          horario_coleta?: string | null
          id?: string
          laudos_laboratoriais?: string[] | null
          parametros_monitorados?: Json | null
          ponto_coleta?: string | null
          proxima_coleta?: string | null
          recomendacoes?: string[] | null
          relatorio_tecnico?: string | null
          responsavel_coleta?: string | null
          resultados?: Json | null
          status?: string | null
          tenant_id?: string
          tendencias_observadas?: string | null
          tipo_monitoramento?: string | null
          updated_at?: string | null
          valores_referencia?: Json | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          acao_texto: string | null
          acao_url: string | null
          canal: string | null
          conteudo: string
          created_at: string | null
          data_leitura: string | null
          destinatario_id: string
          expira_em: string | null
          id: string
          lida: boolean | null
          metadados: Json | null
          prioridade: string | null
          remetente_id: string | null
          tenant_id: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          acao_texto?: string | null
          acao_url?: string | null
          canal?: string | null
          conteudo: string
          created_at?: string | null
          data_leitura?: string | null
          destinatario_id: string
          expira_em?: string | null
          id?: string
          lida?: boolean | null
          metadados?: Json | null
          prioridade?: string | null
          remetente_id?: string | null
          tenant_id: string
          tipo?: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          acao_texto?: string | null
          acao_url?: string | null
          canal?: string | null
          conteudo?: string
          created_at?: string | null
          data_leitura?: string | null
          destinatario_id?: string
          expira_em?: string | null
          id?: string
          lida?: boolean | null
          metadados?: Json | null
          prioridade?: string | null
          remetente_id?: string | null
          tenant_id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      obras_acompanhamento: {
        Row: {
          aprovacao_etapa: boolean | null
          atividades_executadas: string[] | null
          atividades_previstas_proxima: string[] | null
          condicoes_climaticas: string | null
          created_at: string | null
          data_visita: string | null
          equipamentos_obra: string[] | null
          fiscal_responsavel_id: string | null
          fotos_progresso: string[] | null
          funcionarios_presentes: number | null
          id: string
          impacto_comunidade: string | null
          impacto_transito: string | null
          justificativa_atrasos: string | null
          materiais_utilizados: Json | null
          medidas_corretivas: string[] | null
          obra_id: string | null
          observacoes: string | null
          percentual_financeiro: number | null
          percentual_fisico: number | null
          prazos_afetados: boolean | null
          problemas_identificados: string[] | null
          proxima_visita: string | null
          relatorio_tecnico: string | null
          seguranca_trabalho: string | null
          solucoes_propostas: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          aprovacao_etapa?: boolean | null
          atividades_executadas?: string[] | null
          atividades_previstas_proxima?: string[] | null
          condicoes_climaticas?: string | null
          created_at?: string | null
          data_visita?: string | null
          equipamentos_obra?: string[] | null
          fiscal_responsavel_id?: string | null
          fotos_progresso?: string[] | null
          funcionarios_presentes?: number | null
          id?: string
          impacto_comunidade?: string | null
          impacto_transito?: string | null
          justificativa_atrasos?: string | null
          materiais_utilizados?: Json | null
          medidas_corretivas?: string[] | null
          obra_id?: string | null
          observacoes?: string | null
          percentual_financeiro?: number | null
          percentual_fisico?: number | null
          prazos_afetados?: boolean | null
          problemas_identificados?: string[] | null
          proxima_visita?: string | null
          relatorio_tecnico?: string | null
          seguranca_trabalho?: string | null
          solucoes_propostas?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          aprovacao_etapa?: boolean | null
          atividades_executadas?: string[] | null
          atividades_previstas_proxima?: string[] | null
          condicoes_climaticas?: string | null
          created_at?: string | null
          data_visita?: string | null
          equipamentos_obra?: string[] | null
          fiscal_responsavel_id?: string | null
          fotos_progresso?: string[] | null
          funcionarios_presentes?: number | null
          id?: string
          impacto_comunidade?: string | null
          impacto_transito?: string | null
          justificativa_atrasos?: string | null
          materiais_utilizados?: Json | null
          medidas_corretivas?: string[] | null
          obra_id?: string | null
          observacoes?: string | null
          percentual_financeiro?: number | null
          percentual_fisico?: number | null
          prazos_afetados?: boolean | null
          problemas_identificados?: string[] | null
          proxima_visita?: string | null
          relatorio_tecnico?: string | null
          seguranca_trabalho?: string | null
          solucoes_propostas?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_acompanhamento_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      obras_projetos: {
        Row: {
          area_intervencao: number | null
          categoria: string | null
          cnpj_contratada: string | null
          coordenadas_gps: Json | null
          crea_responsavel: string | null
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          descricao: string | null
          empresa_contratada: string | null
          endereco_obra: Json | null
          etapas_concluidas: Json | null
          etapas_previstas: Json | null
          extensao_metros: number | null
          fonte_recurso: string | null
          id: string
          nome: string
          numero_contrato: string | null
          numero_convenio: string | null
          observacoes: string | null
          percentual_executado: number | null
          prazo_dias: number | null
          responsavel_tecnico: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          valor_contratado: number | null
          valor_orcado: number | null
        }
        Insert: {
          area_intervencao?: number | null
          categoria?: string | null
          cnpj_contratada?: string | null
          coordenadas_gps?: Json | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          empresa_contratada?: string | null
          endereco_obra?: Json | null
          etapas_concluidas?: Json | null
          etapas_previstas?: Json | null
          extensao_metros?: number | null
          fonte_recurso?: string | null
          id?: string
          nome: string
          numero_contrato?: string | null
          numero_convenio?: string | null
          observacoes?: string | null
          percentual_executado?: number | null
          prazo_dias?: number | null
          responsavel_tecnico?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          valor_contratado?: number | null
          valor_orcado?: number | null
        }
        Update: {
          area_intervencao?: number | null
          categoria?: string | null
          cnpj_contratada?: string | null
          coordenadas_gps?: Json | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          empresa_contratada?: string | null
          endereco_obra?: Json | null
          etapas_concluidas?: Json | null
          etapas_previstas?: Json | null
          extensao_metros?: number | null
          fonte_recurso?: string | null
          id?: string
          nome?: string
          numero_contrato?: string | null
          numero_convenio?: string | null
          observacoes?: string | null
          percentual_executado?: number | null
          prazo_dias?: number | null
          responsavel_tecnico?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          valor_contratado?: number | null
          valor_orcado?: number | null
        }
        Relationships: []
      }
      planejamento_alvaras: {
        Row: {
          area_autorizada: number | null
          atividade_exercida: string | null
          condicoes_especiais: string[] | null
          crea_responsavel: string | null
          created_at: string | null
          data_emissao: string | null
          data_vencimento: string | null
          documentos_anexos: string[] | null
          endereco_obra: Json | null
          id: string
          numero_alvara: string | null
          observacoes: string | null
          penalidades: string[] | null
          prazo_execucao: number | null
          projeto_id: string | null
          renovacao_automatica: boolean | null
          requerente_nome: string | null
          responsavel_obra: string | null
          status: string | null
          tenant_id: string
          tipo_alvara: string | null
          updated_at: string | null
          valor_taxa: number | null
          vistorias_obrigatorias: string[] | null
        }
        Insert: {
          area_autorizada?: number | null
          atividade_exercida?: string | null
          condicoes_especiais?: string[] | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          documentos_anexos?: string[] | null
          endereco_obra?: Json | null
          id?: string
          numero_alvara?: string | null
          observacoes?: string | null
          penalidades?: string[] | null
          prazo_execucao?: number | null
          projeto_id?: string | null
          renovacao_automatica?: boolean | null
          requerente_nome?: string | null
          responsavel_obra?: string | null
          status?: string | null
          tenant_id: string
          tipo_alvara?: string | null
          updated_at?: string | null
          valor_taxa?: number | null
          vistorias_obrigatorias?: string[] | null
        }
        Update: {
          area_autorizada?: number | null
          atividade_exercida?: string | null
          condicoes_especiais?: string[] | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          documentos_anexos?: string[] | null
          endereco_obra?: Json | null
          id?: string
          numero_alvara?: string | null
          observacoes?: string | null
          penalidades?: string[] | null
          prazo_execucao?: number | null
          projeto_id?: string | null
          renovacao_automatica?: boolean | null
          requerente_nome?: string | null
          responsavel_obra?: string | null
          status?: string | null
          tenant_id?: string
          tipo_alvara?: string | null
          updated_at?: string | null
          valor_taxa?: number | null
          vistorias_obrigatorias?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "planejamento_alvaras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "planejamento_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      planejamento_consultas_publicas: {
        Row: {
          assunto: string
          audiencia_publica: boolean | null
          comissao_analise: string[] | null
          contribuicoes: Json | null
          contribuicoes_recebidas: number | null
          created_at: string | null
          data_audiencia: string | null
          data_fim: string | null
          data_inicio: string | null
          decisao_final: string | null
          descricao: string | null
          documentos_consulta: string[] | null
          id: string
          impacto_contribuicoes: string | null
          justificativa: string | null
          local_realizacao: string | null
          parecer_tecnico: string | null
          participantes_efetivos: number | null
          participantes_esperados: number | null
          publicacao_resultado: string | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          assunto: string
          audiencia_publica?: boolean | null
          comissao_analise?: string[] | null
          contribuicoes?: Json | null
          contribuicoes_recebidas?: number | null
          created_at?: string | null
          data_audiencia?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          decisao_final?: string | null
          descricao?: string | null
          documentos_consulta?: string[] | null
          id?: string
          impacto_contribuicoes?: string | null
          justificativa?: string | null
          local_realizacao?: string | null
          parecer_tecnico?: string | null
          participantes_efetivos?: number | null
          participantes_esperados?: number | null
          publicacao_resultado?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          audiencia_publica?: boolean | null
          comissao_analise?: string[] | null
          contribuicoes?: Json | null
          contribuicoes_recebidas?: number | null
          created_at?: string | null
          data_audiencia?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          decisao_final?: string | null
          descricao?: string | null
          documentos_consulta?: string[] | null
          id?: string
          impacto_contribuicoes?: string | null
          justificativa?: string | null
          local_realizacao?: string | null
          parecer_tecnico?: string | null
          participantes_efetivos?: number | null
          participantes_esperados?: number | null
          publicacao_resultado?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planejamento_projetos: {
        Row: {
          area_construida: number | null
          area_total: number | null
          categoria: string | null
          coeficiente_aproveitamento: number | null
          condicoes_aprovacao: string[] | null
          crea_responsavel: string | null
          created_at: string | null
          data_analise: string | null
          data_aprovacao: string | null
          data_protocolo: string | null
          descricao: string | null
          documentos_projeto: string[] | null
          endereco_projeto: Json | null
          id: string
          memoriais: string[] | null
          nome: string
          numero_pavimentos: number | null
          numero_unidades: number | null
          observacoes: string | null
          plantas_aprovadas: string[] | null
          responsavel_tecnico: string | null
          status: string | null
          taxa_ocupacao: number | null
          taxa_permeabilidade: number | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          uso_pretendido: string | null
          vagas_estacionamento: number | null
          validade_aprovacao: string | null
          zoneamento: string | null
        }
        Insert: {
          area_construida?: number | null
          area_total?: number | null
          categoria?: string | null
          coeficiente_aproveitamento?: number | null
          condicoes_aprovacao?: string[] | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_analise?: string | null
          data_aprovacao?: string | null
          data_protocolo?: string | null
          descricao?: string | null
          documentos_projeto?: string[] | null
          endereco_projeto?: Json | null
          id?: string
          memoriais?: string[] | null
          nome: string
          numero_pavimentos?: number | null
          numero_unidades?: number | null
          observacoes?: string | null
          plantas_aprovadas?: string[] | null
          responsavel_tecnico?: string | null
          status?: string | null
          taxa_ocupacao?: number | null
          taxa_permeabilidade?: number | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          uso_pretendido?: string | null
          vagas_estacionamento?: number | null
          validade_aprovacao?: string | null
          zoneamento?: string | null
        }
        Update: {
          area_construida?: number | null
          area_total?: number | null
          categoria?: string | null
          coeficiente_aproveitamento?: number | null
          condicoes_aprovacao?: string[] | null
          crea_responsavel?: string | null
          created_at?: string | null
          data_analise?: string | null
          data_aprovacao?: string | null
          data_protocolo?: string | null
          descricao?: string | null
          documentos_projeto?: string[] | null
          endereco_projeto?: Json | null
          id?: string
          memoriais?: string[] | null
          nome?: string
          numero_pavimentos?: number | null
          numero_unidades?: number | null
          observacoes?: string | null
          plantas_aprovadas?: string[] | null
          responsavel_tecnico?: string | null
          status?: string | null
          taxa_ocupacao?: number | null
          taxa_permeabilidade?: number | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          uso_pretendido?: string | null
          vagas_estacionamento?: number | null
          validade_aprovacao?: string | null
          zoneamento?: string | null
        }
        Relationships: []
      }
      planejamento_vistorias: {
        Row: {
          alvara_id: string | null
          aprovado: boolean | null
          conformidades_verificadas: string[] | null
          created_at: string | null
          data_agendamento: string | null
          data_realizacao: string | null
          embargo_obra: boolean | null
          fiscal_responsavel_id: string | null
          fotos_vistoria: string[] | null
          id: string
          irregularidades_encontradas: string[] | null
          medidas_solicitadas: string[] | null
          multa_aplicada: boolean | null
          observacoes_vistoria: string | null
          prazo_regularizacao: number | null
          projeto_id: string | null
          proxima_vistoria: string | null
          relatorio_tecnico: string | null
          status: string | null
          tenant_id: string
          tipo_vistoria: string | null
          updated_at: string | null
          valor_multa: number | null
        }
        Insert: {
          alvara_id?: string | null
          aprovado?: boolean | null
          conformidades_verificadas?: string[] | null
          created_at?: string | null
          data_agendamento?: string | null
          data_realizacao?: string | null
          embargo_obra?: boolean | null
          fiscal_responsavel_id?: string | null
          fotos_vistoria?: string[] | null
          id?: string
          irregularidades_encontradas?: string[] | null
          medidas_solicitadas?: string[] | null
          multa_aplicada?: boolean | null
          observacoes_vistoria?: string | null
          prazo_regularizacao?: number | null
          projeto_id?: string | null
          proxima_vistoria?: string | null
          relatorio_tecnico?: string | null
          status?: string | null
          tenant_id: string
          tipo_vistoria?: string | null
          updated_at?: string | null
          valor_multa?: number | null
        }
        Update: {
          alvara_id?: string | null
          aprovado?: boolean | null
          conformidades_verificadas?: string[] | null
          created_at?: string | null
          data_agendamento?: string | null
          data_realizacao?: string | null
          embargo_obra?: boolean | null
          fiscal_responsavel_id?: string | null
          fotos_vistoria?: string[] | null
          id?: string
          irregularidades_encontradas?: string[] | null
          medidas_solicitadas?: string[] | null
          multa_aplicada?: boolean | null
          observacoes_vistoria?: string | null
          prazo_regularizacao?: number | null
          projeto_id?: string | null
          proxima_vistoria?: string | null
          relatorio_tecnico?: string | null
          status?: string | null
          tenant_id?: string
          tipo_vistoria?: string | null
          updated_at?: string | null
          valor_multa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planejamento_vistorias_alvara_id_fkey"
            columns: ["alvara_id"]
            isOneToOne: false
            referencedRelation: "planejamento_alvaras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamento_vistorias_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "planejamento_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      planejamento_zoneamento: {
        Row: {
          area_hectares: number | null
          coeficiente_aproveitamento_maximo: number | null
          coordenadas_perimetro: Json | null
          created_at: string | null
          data_criacao: string | null
          densidade_permitida: number | null
          descricao: string | null
          equipamentos_publicos_obrigatorios: string[] | null
          gabarito_maximo: number | null
          id: string
          incentivos_fiscais: string[] | null
          legislacao_base: string | null
          observacoes: string | null
          populacao_estimada: number | null
          recuos_obrigatorios: Json | null
          restricoes_especiais: string[] | null
          sigla: string | null
          status: string | null
          taxa_ocupacao_maxima: number | null
          taxa_permeabilidade_minima: number | null
          tenant_id: string
          tipo_zona: string | null
          ultima_alteracao: string | null
          updated_at: string | null
          uso_permitido: string[] | null
          uso_proibido: string[] | null
          vagas_estacionamento_obrigatorias: number | null
          zona_nome: string
        }
        Insert: {
          area_hectares?: number | null
          coeficiente_aproveitamento_maximo?: number | null
          coordenadas_perimetro?: Json | null
          created_at?: string | null
          data_criacao?: string | null
          densidade_permitida?: number | null
          descricao?: string | null
          equipamentos_publicos_obrigatorios?: string[] | null
          gabarito_maximo?: number | null
          id?: string
          incentivos_fiscais?: string[] | null
          legislacao_base?: string | null
          observacoes?: string | null
          populacao_estimada?: number | null
          recuos_obrigatorios?: Json | null
          restricoes_especiais?: string[] | null
          sigla?: string | null
          status?: string | null
          taxa_ocupacao_maxima?: number | null
          taxa_permeabilidade_minima?: number | null
          tenant_id: string
          tipo_zona?: string | null
          ultima_alteracao?: string | null
          updated_at?: string | null
          uso_permitido?: string[] | null
          uso_proibido?: string[] | null
          vagas_estacionamento_obrigatorias?: number | null
          zona_nome: string
        }
        Update: {
          area_hectares?: number | null
          coeficiente_aproveitamento_maximo?: number | null
          coordenadas_perimetro?: Json | null
          created_at?: string | null
          data_criacao?: string | null
          densidade_permitida?: number | null
          descricao?: string | null
          equipamentos_publicos_obrigatorios?: string[] | null
          gabarito_maximo?: number | null
          id?: string
          incentivos_fiscais?: string[] | null
          legislacao_base?: string | null
          observacoes?: string | null
          populacao_estimada?: number | null
          recuos_obrigatorios?: Json | null
          restricoes_especiais?: string[] | null
          sigla?: string | null
          status?: string | null
          taxa_ocupacao_maxima?: number | null
          taxa_permeabilidade_minima?: number | null
          tenant_id?: string
          tipo_zona?: string | null
          ultima_alteracao?: string | null
          updated_at?: string | null
          uso_permitido?: string[] | null
          uso_proibido?: string[] | null
          vagas_estacionamento_obrigatorias?: number | null
          zona_nome?: string
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          atribuido_para_id: string | null
          avaliacao: number | null
          categoria: string
          comentario_avaliacao: string | null
          comprovante_pagamento: string | null
          created_at: string | null
          criado_por_id: string
          dados_formulario: Json | null
          data_abertura: string | null
          data_avaliacao: string | null
          data_conclusao: string | null
          data_pagamento: string | null
          data_prazo: string | null
          desconto_aplicado: number | null
          descricao: string
          documentos_anexados: string[] | null
          documentos_exigidos: string[] | null
          forma_pagamento: string | null
          id: string
          localizacao_referencia: Json | null
          motivo_cancelamento: string | null
          numero_protocolo: string
          observacoes_internas: string | null
          observacoes_publicas: string | null
          prazo_dias: number | null
          prioridade: Database["public"]["Enums"]["prioridade_enum"] | null
          representante_legal: Json | null
          secretaria_destino_id: string | null
          secretaria_origem_id: string
          setor_destino: string | null
          setor_origem: string | null
          solicitante: Json
          status: Database["public"]["Enums"]["status_processo_enum"] | null
          subcategoria: string | null
          supervisor_id: string | null
          taxa_servico: number | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          urgente: boolean | null
          valor_multa: number | null
        }
        Insert: {
          atribuido_para_id?: string | null
          avaliacao?: number | null
          categoria: string
          comentario_avaliacao?: string | null
          comprovante_pagamento?: string | null
          created_at?: string | null
          criado_por_id: string
          dados_formulario?: Json | null
          data_abertura?: string | null
          data_avaliacao?: string | null
          data_conclusao?: string | null
          data_pagamento?: string | null
          data_prazo?: string | null
          desconto_aplicado?: number | null
          descricao: string
          documentos_anexados?: string[] | null
          documentos_exigidos?: string[] | null
          forma_pagamento?: string | null
          id?: string
          localizacao_referencia?: Json | null
          motivo_cancelamento?: string | null
          numero_protocolo: string
          observacoes_internas?: string | null
          observacoes_publicas?: string | null
          prazo_dias?: number | null
          prioridade?: Database["public"]["Enums"]["prioridade_enum"] | null
          representante_legal?: Json | null
          secretaria_destino_id?: string | null
          secretaria_origem_id: string
          setor_destino?: string | null
          setor_origem?: string | null
          solicitante: Json
          status?: Database["public"]["Enums"]["status_processo_enum"] | null
          subcategoria?: string | null
          supervisor_id?: string | null
          taxa_servico?: number | null
          tenant_id: string
          titulo: string
          updated_at?: string | null
          urgente?: boolean | null
          valor_multa?: number | null
        }
        Update: {
          atribuido_para_id?: string | null
          avaliacao?: number | null
          categoria?: string
          comentario_avaliacao?: string | null
          comprovante_pagamento?: string | null
          created_at?: string | null
          criado_por_id?: string
          dados_formulario?: Json | null
          data_abertura?: string | null
          data_avaliacao?: string | null
          data_conclusao?: string | null
          data_pagamento?: string | null
          data_prazo?: string | null
          desconto_aplicado?: number | null
          descricao?: string
          documentos_anexados?: string[] | null
          documentos_exigidos?: string[] | null
          forma_pagamento?: string | null
          id?: string
          localizacao_referencia?: Json | null
          motivo_cancelamento?: string | null
          numero_protocolo?: string
          observacoes_internas?: string | null
          observacoes_publicas?: string | null
          prazo_dias?: number | null
          prioridade?: Database["public"]["Enums"]["prioridade_enum"] | null
          representante_legal?: Json | null
          secretaria_destino_id?: string | null
          secretaria_origem_id?: string
          setor_destino?: string | null
          setor_origem?: string | null
          solicitante?: Json
          status?: Database["public"]["Enums"]["status_processo_enum"] | null
          subcategoria?: string | null
          supervisor_id?: string | null
          taxa_servico?: number | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          urgente?: boolean | null
          valor_multa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "protocolos_atribuido_para_id_fkey"
            columns: ["atribuido_para_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_secretaria_destino_id_fkey"
            columns: ["secretaria_destino_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_secretaria_origem_id_fkey"
            columns: ["secretaria_origem_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos_historico: {
        Row: {
          acao: string
          campo_alterado: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          observacoes: string | null
          protocolo_id: string
          user_agent: string | null
          usuario_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          acao: string
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          observacoes?: string | null
          protocolo_id: string
          user_agent?: string | null
          usuario_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          acao?: string
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          observacoes?: string | null
          protocolo_id?: string
          user_agent?: string | null
          usuario_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: []
      }
      saude_agendamentos: {
        Row: {
          created_at: string | null
          data_agendamento: string
          data_retorno_sugerida: string | null
          duracao_minutos: number | null
          especialidade: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          lembrete_enviado: boolean | null
          observacoes: string | null
          paciente_id: string
          prescricoes: string[] | null
          prioridade: string | null
          procedimentos_realizados: string[] | null
          profissional_id: string
          retorno_necessario: boolean | null
          sintomas_relatados: string | null
          status: string | null
          tenant_id: string
          tipo_consulta: string
          unidade_saude_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_agendamento: string
          data_retorno_sugerida?: string | null
          duracao_minutos?: number | null
          especialidade?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          paciente_id: string
          prescricoes?: string[] | null
          prioridade?: string | null
          procedimentos_realizados?: string[] | null
          profissional_id: string
          retorno_necessario?: boolean | null
          sintomas_relatados?: string | null
          status?: string | null
          tenant_id: string
          tipo_consulta: string
          unidade_saude_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_agendamento?: string
          data_retorno_sugerida?: string | null
          duracao_minutos?: number | null
          especialidade?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          paciente_id?: string
          prescricoes?: string[] | null
          prioridade?: string | null
          procedimentos_realizados?: string[] | null
          profissional_id?: string
          retorno_necessario?: boolean | null
          sintomas_relatados?: string | null
          status?: string | null
          tenant_id?: string
          tipo_consulta?: string
          unidade_saude_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "saude_pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saude_agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "saude_profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saude_agendamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saude_agendamentos_unidade_saude_id_fkey"
            columns: ["unidade_saude_id"]
            isOneToOne: false
            referencedRelation: "saude_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_campanhas: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          equipe_ids: string[] | null
          id: string
          indicadores_sucesso: Json | null
          locais_realizacao: string[] | null
          materiais_necessarios: string[] | null
          meta_atendimentos: number | null
          nome: string
          orcamento_gasto: number | null
          orcamento_previsto: number | null
          publico_alvo: Json | null
          realizados: number | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string
          unidades_participantes: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          equipe_ids?: string[] | null
          id?: string
          indicadores_sucesso?: Json | null
          locais_realizacao?: string[] | null
          materiais_necessarios?: string[] | null
          meta_atendimentos?: number | null
          nome: string
          orcamento_gasto?: number | null
          orcamento_previsto?: number | null
          publico_alvo?: Json | null
          realizados?: number | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo: string
          unidades_participantes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          equipe_ids?: string[] | null
          id?: string
          indicadores_sucesso?: Json | null
          locais_realizacao?: string[] | null
          materiais_necessarios?: string[] | null
          meta_atendimentos?: number | null
          nome?: string
          orcamento_gasto?: number | null
          orcamento_previsto?: number | null
          publico_alvo?: Json | null
          realizados?: number | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string
          unidades_participantes?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_campanhas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "saude_profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saude_campanhas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_medicamentos: {
        Row: {
          categoria: string | null
          codigo_ean: string | null
          concentracao: string | null
          controlado: boolean | null
          created_at: string | null
          fabricante: string | null
          forma_farmaceutica: string | null
          id: string
          nome: string
          principio_ativo: string | null
          registro_anvisa: string | null
          requer_receita: boolean | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          codigo_ean?: string | null
          concentracao?: string | null
          controlado?: boolean | null
          created_at?: string | null
          fabricante?: string | null
          forma_farmaceutica?: string | null
          id?: string
          nome: string
          principio_ativo?: string | null
          registro_anvisa?: string | null
          requer_receita?: boolean | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          codigo_ean?: string | null
          concentracao?: string | null
          controlado?: boolean | null
          created_at?: string | null
          fabricante?: string | null
          forma_farmaceutica?: string | null
          id?: string
          nome?: string
          principio_ativo?: string | null
          registro_anvisa?: string | null
          requer_receita?: boolean | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_medicamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_pacientes: {
        Row: {
          alergias: string[] | null
          cns: string | null
          condicoes_medicas: string[] | null
          contato: Json | null
          contato_emergencia: Json | null
          convenio_medico: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          endereco: Json | null
          id: string
          medicamentos_uso_continuo: string[] | null
          nome_completo: string
          observacoes: string | null
          sexo: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          alergias?: string[] | null
          cns?: string | null
          condicoes_medicas?: string[] | null
          contato?: Json | null
          contato_emergencia?: Json | null
          convenio_medico?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: Json | null
          id?: string
          medicamentos_uso_continuo?: string[] | null
          nome_completo: string
          observacoes?: string | null
          sexo?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          alergias?: string[] | null
          cns?: string | null
          condicoes_medicas?: string[] | null
          contato?: Json | null
          contato_emergencia?: Json | null
          convenio_medico?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: Json | null
          id?: string
          medicamentos_uso_continuo?: string[] | null
          nome_completo?: string
          observacoes?: string | null
          sexo?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_pacientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_profissionais: {
        Row: {
          carga_horaria_semanal: number | null
          contato: Json | null
          cpf: string | null
          created_at: string | null
          crm: string | null
          crm_uf: string | null
          especialidades: string[] | null
          id: string
          nome_completo: string
          status: string | null
          tenant_id: string
          tipo_profissional: string
          turno_trabalho: string | null
          unidades_trabalho: string[] | null
          updated_at: string | null
        }
        Insert: {
          carga_horaria_semanal?: number | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          crm_uf?: string | null
          especialidades?: string[] | null
          id?: string
          nome_completo: string
          status?: string | null
          tenant_id: string
          tipo_profissional: string
          turno_trabalho?: string | null
          unidades_trabalho?: string[] | null
          updated_at?: string | null
        }
        Update: {
          carga_horaria_semanal?: number | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          crm_uf?: string | null
          especialidades?: string[] | null
          id?: string
          nome_completo?: string
          status?: string | null
          tenant_id?: string
          tipo_profissional?: string
          turno_trabalho?: string | null
          unidades_trabalho?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_profissionais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_unidades: {
        Row: {
          capacidade_atendimento: Json | null
          cnes: string | null
          cnpj: string | null
          contato: Json | null
          created_at: string | null
          endereco: Json | null
          equipamentos_disponiveis: string[] | null
          especialidades_disponiveis: string[] | null
          gestor_responsavel_id: string | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          servicos_oferecidos: string[] | null
          status: string | null
          tenant_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          capacidade_atendimento?: Json | null
          cnes?: string | null
          cnpj?: string | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_disponiveis?: string[] | null
          especialidades_disponiveis?: string[] | null
          gestor_responsavel_id?: string | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          capacidade_atendimento?: Json | null
          cnes?: string | null
          cnpj?: string | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_disponiveis?: string[] | null
          especialidades_disponiveis?: string[] | null
          gestor_responsavel_id?: string | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_unidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      secretarias: {
        Row: {
          categorias_servicos: string[] | null
          codigo: string
          cor_tema: string | null
          created_at: string | null
          data_criacao: string | null
          descricao: string | null
          email: string | null
          endereco: Json | null
          horario_funcionamento: Json | null
          icone: string | null
          id: string
          meta_atendimentos_mes: number | null
          nome: string
          orcamento_anual: number | null
          secretario_id: string | null
          servicos_oferecidos: Json | null
          sigla: string
          status: Database["public"]["Enums"]["status_base_enum"] | null
          telefone: string | null
          tenant_id: string
          updated_at: string | null
          vice_secretario_id: string | null
          visivel_portal: boolean | null
        }
        Insert: {
          categorias_servicos?: string[] | null
          codigo: string
          cor_tema?: string | null
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: Json | null
          horario_funcionamento?: Json | null
          icone?: string | null
          id?: string
          meta_atendimentos_mes?: number | null
          nome: string
          orcamento_anual?: number | null
          secretario_id?: string | null
          servicos_oferecidos?: Json | null
          sigla: string
          status?: Database["public"]["Enums"]["status_base_enum"] | null
          telefone?: string | null
          tenant_id: string
          updated_at?: string | null
          vice_secretario_id?: string | null
          visivel_portal?: boolean | null
        }
        Update: {
          categorias_servicos?: string[] | null
          codigo?: string
          cor_tema?: string | null
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: Json | null
          horario_funcionamento?: Json | null
          icone?: string | null
          id?: string
          meta_atendimentos_mes?: number | null
          nome?: string
          orcamento_anual?: number | null
          secretario_id?: string | null
          servicos_oferecidos?: Json | null
          sigla?: string
          status?: Database["public"]["Enums"]["status_base_enum"] | null
          telefone?: string | null
          tenant_id?: string
          updated_at?: string | null
          vice_secretario_id?: string | null
          visivel_portal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "secretarias_secretario_id_fkey"
            columns: ["secretario_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secretarias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secretarias_vice_secretario_id_fkey"
            columns: ["vice_secretario_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seguranca_guardas: {
        Row: {
          avaliacoes_desempenho: Json | null
          contato: Json | null
          cpf: string | null
          created_at: string | null
          cursos_especializacao: string[] | null
          data_admissao: string | null
          elogios_recebidos: string[] | null
          endereco: Json | null
          equipamentos_fornecidos: string[] | null
          escala_servico: string | null
          especialidades: string[] | null
          experiencia_anterior: string | null
          formacao: string[] | null
          horario_trabalho: Json | null
          id: string
          matricula: string | null
          nome_completo: string
          numero_arma: string | null
          observacoes: string | null
          ocorrencias_disciplinares: string[] | null
          porte_arma: boolean | null
          posto_graduacao: string | null
          setor_atuacao: string | null
          situacao: string | null
          status: string | null
          superior_direto_id: string | null
          tenant_id: string
          treinamentos_realizados: string[] | null
          updated_at: string | null
          validade_porte: string | null
          viatura_designada: string | null
        }
        Insert: {
          avaliacoes_desempenho?: Json | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          cursos_especializacao?: string[] | null
          data_admissao?: string | null
          elogios_recebidos?: string[] | null
          endereco?: Json | null
          equipamentos_fornecidos?: string[] | null
          escala_servico?: string | null
          especialidades?: string[] | null
          experiencia_anterior?: string | null
          formacao?: string[] | null
          horario_trabalho?: Json | null
          id?: string
          matricula?: string | null
          nome_completo: string
          numero_arma?: string | null
          observacoes?: string | null
          ocorrencias_disciplinares?: string[] | null
          porte_arma?: boolean | null
          posto_graduacao?: string | null
          setor_atuacao?: string | null
          situacao?: string | null
          status?: string | null
          superior_direto_id?: string | null
          tenant_id: string
          treinamentos_realizados?: string[] | null
          updated_at?: string | null
          validade_porte?: string | null
          viatura_designada?: string | null
        }
        Update: {
          avaliacoes_desempenho?: Json | null
          contato?: Json | null
          cpf?: string | null
          created_at?: string | null
          cursos_especializacao?: string[] | null
          data_admissao?: string | null
          elogios_recebidos?: string[] | null
          endereco?: Json | null
          equipamentos_fornecidos?: string[] | null
          escala_servico?: string | null
          especialidades?: string[] | null
          experiencia_anterior?: string | null
          formacao?: string[] | null
          horario_trabalho?: Json | null
          id?: string
          matricula?: string | null
          nome_completo?: string
          numero_arma?: string | null
          observacoes?: string | null
          ocorrencias_disciplinares?: string[] | null
          porte_arma?: boolean | null
          posto_graduacao?: string | null
          setor_atuacao?: string | null
          situacao?: string | null
          status?: string | null
          superior_direto_id?: string | null
          tenant_id?: string
          treinamentos_realizados?: string[] | null
          updated_at?: string | null
          validade_porte?: string | null
          viatura_designada?: string | null
        }
        Relationships: []
      }
      seguranca_ocorrencias: {
        Row: {
          categoria: string | null
          comunicante_contato: Json | null
          comunicante_nome: string | null
          coordenadas_gps: Json | null
          created_at: string | null
          croqui_local: string | null
          data_ocorrencia: string | null
          data_registro: string | null
          delegacia_comunicada: string | null
          encaminhamentos: string[] | null
          endereco_ocorrencia: Json | null
          fotos_local: string[] | null
          guarda_responsavel_id: string | null
          horario_ocorrencia: string | null
          horario_registro: string | null
          id: string
          numero_bo: string | null
          numero_bo_civil: string | null
          objetos_envolvidos: string[] | null
          observacoes: string | null
          providencias_tomadas: string[] | null
          relato_fatos: string | null
          status: string | null
          suspeito_descricao: string | null
          tenant_id: string
          testemunhas: Json | null
          tipo_ocorrencia: string | null
          updated_at: string | null
          valor_prejuizo: number | null
          viatura_utilizada: string | null
          vitima_contato: Json | null
          vitima_nome: string | null
        }
        Insert: {
          categoria?: string | null
          comunicante_contato?: Json | null
          comunicante_nome?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          croqui_local?: string | null
          data_ocorrencia?: string | null
          data_registro?: string | null
          delegacia_comunicada?: string | null
          encaminhamentos?: string[] | null
          endereco_ocorrencia?: Json | null
          fotos_local?: string[] | null
          guarda_responsavel_id?: string | null
          horario_ocorrencia?: string | null
          horario_registro?: string | null
          id?: string
          numero_bo?: string | null
          numero_bo_civil?: string | null
          objetos_envolvidos?: string[] | null
          observacoes?: string | null
          providencias_tomadas?: string[] | null
          relato_fatos?: string | null
          status?: string | null
          suspeito_descricao?: string | null
          tenant_id: string
          testemunhas?: Json | null
          tipo_ocorrencia?: string | null
          updated_at?: string | null
          valor_prejuizo?: number | null
          viatura_utilizada?: string | null
          vitima_contato?: Json | null
          vitima_nome?: string | null
        }
        Update: {
          categoria?: string | null
          comunicante_contato?: Json | null
          comunicante_nome?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          croqui_local?: string | null
          data_ocorrencia?: string | null
          data_registro?: string | null
          delegacia_comunicada?: string | null
          encaminhamentos?: string[] | null
          endereco_ocorrencia?: Json | null
          fotos_local?: string[] | null
          guarda_responsavel_id?: string | null
          horario_ocorrencia?: string | null
          horario_registro?: string | null
          id?: string
          numero_bo?: string | null
          numero_bo_civil?: string | null
          objetos_envolvidos?: string[] | null
          observacoes?: string | null
          providencias_tomadas?: string[] | null
          relato_fatos?: string | null
          status?: string | null
          suspeito_descricao?: string | null
          tenant_id?: string
          testemunhas?: Json | null
          tipo_ocorrencia?: string | null
          updated_at?: string | null
          valor_prejuizo?: number | null
          viatura_utilizada?: string | null
          vitima_contato?: Json | null
          vitima_nome?: string | null
        }
        Relationships: []
      }
      servicos_areas_verdes: {
        Row: {
          acessibilidade: boolean | null
          area_m2: number | null
          arvores_quantidade: number | null
          created_at: string | null
          endereco: Json | null
          equipamentos_danificados: string[] | null
          equipamentos_instalados: string[] | null
          especies_plantadas: string[] | null
          estado_conservacao: string | null
          eventos_realizados: number | null
          frequencia_manutencao: string | null
          id: string
          irrigacao: string | null
          melhorias_sugeridas: string[] | null
          necessidades_reparos: string[] | null
          nome_local: string
          observacoes: string | null
          orcamento_manutencao: number | null
          proximo_servico: string | null
          responsavel_manutencao: string | null
          seguranca: string | null
          servicos_realizados: Json | null
          sistema_drenagem: boolean | null
          status: string | null
          tenant_id: string
          tipo_area: string | null
          ultimo_servico: string | null
          updated_at: string | null
          uso_comunidade: string | null
          vandalismo_reportado: boolean | null
        }
        Insert: {
          acessibilidade?: boolean | null
          area_m2?: number | null
          arvores_quantidade?: number | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_danificados?: string[] | null
          equipamentos_instalados?: string[] | null
          especies_plantadas?: string[] | null
          estado_conservacao?: string | null
          eventos_realizados?: number | null
          frequencia_manutencao?: string | null
          id?: string
          irrigacao?: string | null
          melhorias_sugeridas?: string[] | null
          necessidades_reparos?: string[] | null
          nome_local: string
          observacoes?: string | null
          orcamento_manutencao?: number | null
          proximo_servico?: string | null
          responsavel_manutencao?: string | null
          seguranca?: string | null
          servicos_realizados?: Json | null
          sistema_drenagem?: boolean | null
          status?: string | null
          tenant_id: string
          tipo_area?: string | null
          ultimo_servico?: string | null
          updated_at?: string | null
          uso_comunidade?: string | null
          vandalismo_reportado?: boolean | null
        }
        Update: {
          acessibilidade?: boolean | null
          area_m2?: number | null
          arvores_quantidade?: number | null
          created_at?: string | null
          endereco?: Json | null
          equipamentos_danificados?: string[] | null
          equipamentos_instalados?: string[] | null
          especies_plantadas?: string[] | null
          estado_conservacao?: string | null
          eventos_realizados?: number | null
          frequencia_manutencao?: string | null
          id?: string
          irrigacao?: string | null
          melhorias_sugeridas?: string[] | null
          necessidades_reparos?: string[] | null
          nome_local?: string
          observacoes?: string | null
          orcamento_manutencao?: number | null
          proximo_servico?: string | null
          responsavel_manutencao?: string | null
          seguranca?: string | null
          servicos_realizados?: Json | null
          sistema_drenagem?: boolean | null
          status?: string | null
          tenant_id?: string
          tipo_area?: string | null
          ultimo_servico?: string | null
          updated_at?: string | null
          uso_comunidade?: string | null
          vandalismo_reportado?: boolean | null
        }
        Relationships: []
      }
      servicos_coleta_especial: {
        Row: {
          acesso_veiculo: string | null
          avaliacao_servico: number | null
          comprovante_pagamento: string | null
          contato_solicitante: Json | null
          created_at: string | null
          data_agendada: string | null
          data_coleta: string | null
          data_solicitacao: string | null
          descricao_material: string | null
          destino_material: string | null
          endereco_coleta: Json | null
          equipamento_necessario: string | null
          equipe_coleta: string | null
          forma_pagamento: string | null
          fotos_antes: string[] | null
          fotos_depois: string[] | null
          horario_agendado: string | null
          horario_coleta: string | null
          id: string
          observacoes: string | null
          origem_material: string | null
          quantidade_coletada: number | null
          quantidade_estimada: number | null
          solicitante_cpf: string | null
          solicitante_nome: string | null
          status: string | null
          taxa_cobrada: number | null
          tenant_id: string
          tipo_material: string | null
          unidade_medida: string | null
          updated_at: string | null
          valor_servico: number | null
          veiculo_utilizado: string | null
        }
        Insert: {
          acesso_veiculo?: string | null
          avaliacao_servico?: number | null
          comprovante_pagamento?: string | null
          contato_solicitante?: Json | null
          created_at?: string | null
          data_agendada?: string | null
          data_coleta?: string | null
          data_solicitacao?: string | null
          descricao_material?: string | null
          destino_material?: string | null
          endereco_coleta?: Json | null
          equipamento_necessario?: string | null
          equipe_coleta?: string | null
          forma_pagamento?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          horario_agendado?: string | null
          horario_coleta?: string | null
          id?: string
          observacoes?: string | null
          origem_material?: string | null
          quantidade_coletada?: number | null
          quantidade_estimada?: number | null
          solicitante_cpf?: string | null
          solicitante_nome?: string | null
          status?: string | null
          taxa_cobrada?: number | null
          tenant_id: string
          tipo_material?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_servico?: number | null
          veiculo_utilizado?: string | null
        }
        Update: {
          acesso_veiculo?: string | null
          avaliacao_servico?: number | null
          comprovante_pagamento?: string | null
          contato_solicitante?: Json | null
          created_at?: string | null
          data_agendada?: string | null
          data_coleta?: string | null
          data_solicitacao?: string | null
          descricao_material?: string | null
          destino_material?: string | null
          endereco_coleta?: Json | null
          equipamento_necessario?: string | null
          equipe_coleta?: string | null
          forma_pagamento?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          horario_agendado?: string | null
          horario_coleta?: string | null
          id?: string
          observacoes?: string | null
          origem_material?: string | null
          quantidade_coletada?: number | null
          quantidade_estimada?: number | null
          solicitante_cpf?: string | null
          solicitante_nome?: string | null
          status?: string | null
          taxa_cobrada?: number | null
          tenant_id?: string
          tipo_material?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_servico?: number | null
          veiculo_utilizado?: string | null
        }
        Relationships: []
      }
      servicos_iluminacao: {
        Row: {
          altura_poste: number | null
          consumo_kwh: number | null
          coordenadas_gps: Json | null
          created_at: string | null
          custo_energia_mensal: number | null
          data_instalacao: string | null
          endereco: Json | null
          fluxo_pessoas: string | null
          fornecedor_instalacao: string | null
          funcionamento: string | null
          garantia_meses: number | null
          id: string
          impacto_seguranca: string | null
          numero_patrimonio: string | null
          observacoes: string | null
          potencia_watts: number | null
          problemas_reportados: string[] | null
          proxima_manutencao: string | null
          reclamacoes_cidadaos: number | null
          reparos_realizados: Json | null
          responsavel_manutencao: string | null
          status: string | null
          tenant_id: string
          tipo_luminaria: string | null
          tipo_poste: string | null
          ultima_manutencao: string | null
          updated_at: string | null
        }
        Insert: {
          altura_poste?: number | null
          consumo_kwh?: number | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          custo_energia_mensal?: number | null
          data_instalacao?: string | null
          endereco?: Json | null
          fluxo_pessoas?: string | null
          fornecedor_instalacao?: string | null
          funcionamento?: string | null
          garantia_meses?: number | null
          id?: string
          impacto_seguranca?: string | null
          numero_patrimonio?: string | null
          observacoes?: string | null
          potencia_watts?: number | null
          problemas_reportados?: string[] | null
          proxima_manutencao?: string | null
          reclamacoes_cidadaos?: number | null
          reparos_realizados?: Json | null
          responsavel_manutencao?: string | null
          status?: string | null
          tenant_id: string
          tipo_luminaria?: string | null
          tipo_poste?: string | null
          ultima_manutencao?: string | null
          updated_at?: string | null
        }
        Update: {
          altura_poste?: number | null
          consumo_kwh?: number | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          custo_energia_mensal?: number | null
          data_instalacao?: string | null
          endereco?: Json | null
          fluxo_pessoas?: string | null
          fornecedor_instalacao?: string | null
          funcionamento?: string | null
          garantia_meses?: number | null
          id?: string
          impacto_seguranca?: string | null
          numero_patrimonio?: string | null
          observacoes?: string | null
          potencia_watts?: number | null
          problemas_reportados?: string[] | null
          proxima_manutencao?: string | null
          reclamacoes_cidadaos?: number | null
          reparos_realizados?: Json | null
          responsavel_manutencao?: string | null
          status?: string | null
          tenant_id?: string
          tipo_luminaria?: string | null
          tipo_poste?: string | null
          ultima_manutencao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      servicos_limpeza: {
        Row: {
          area_atendida: string | null
          avaliacao_qualidade: string | null
          bairros_atendidos: string[] | null
          cidadaos_orientados: number | null
          combustivel_gasto: number | null
          created_at: string | null
          custo_operacional: number | null
          dias_semana: string[] | null
          elogios: number | null
          entulho_coletado: number | null
          equipamentos_utilizados: string[] | null
          equipe_responsavel: string | null
          frequencia: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          logradouros: string[] | null
          manutencao_equipamentos: number | null
          material_reciclavel: number | null
          multas_aplicadas: number | null
          numero_funcionarios: number | null
          observacoes: string | null
          pontos_criticos: string[] | null
          problemas_encontrados: string[] | null
          quilometragem_percorrida: number | null
          reclamacoes: number | null
          residuos_organicos: number | null
          status: string | null
          tenant_id: string
          tipo_servico: string | null
          updated_at: string | null
          veiculos_utilizados: string[] | null
          volume_coletado: number | null
        }
        Insert: {
          area_atendida?: string | null
          avaliacao_qualidade?: string | null
          bairros_atendidos?: string[] | null
          cidadaos_orientados?: number | null
          combustivel_gasto?: number | null
          created_at?: string | null
          custo_operacional?: number | null
          dias_semana?: string[] | null
          elogios?: number | null
          entulho_coletado?: number | null
          equipamentos_utilizados?: string[] | null
          equipe_responsavel?: string | null
          frequencia?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          logradouros?: string[] | null
          manutencao_equipamentos?: number | null
          material_reciclavel?: number | null
          multas_aplicadas?: number | null
          numero_funcionarios?: number | null
          observacoes?: string | null
          pontos_criticos?: string[] | null
          problemas_encontrados?: string[] | null
          quilometragem_percorrida?: number | null
          reclamacoes?: number | null
          residuos_organicos?: number | null
          status?: string | null
          tenant_id: string
          tipo_servico?: string | null
          updated_at?: string | null
          veiculos_utilizados?: string[] | null
          volume_coletado?: number | null
        }
        Update: {
          area_atendida?: string | null
          avaliacao_qualidade?: string | null
          bairros_atendidos?: string[] | null
          cidadaos_orientados?: number | null
          combustivel_gasto?: number | null
          created_at?: string | null
          custo_operacional?: number | null
          dias_semana?: string[] | null
          elogios?: number | null
          entulho_coletado?: number | null
          equipamentos_utilizados?: string[] | null
          equipe_responsavel?: string | null
          frequencia?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          logradouros?: string[] | null
          manutencao_equipamentos?: number | null
          material_reciclavel?: number | null
          multas_aplicadas?: number | null
          numero_funcionarios?: number | null
          observacoes?: string | null
          pontos_criticos?: string[] | null
          problemas_encontrados?: string[] | null
          quilometragem_percorrida?: number | null
          reclamacoes?: number | null
          residuos_organicos?: number | null
          status?: string | null
          tenant_id?: string
          tipo_servico?: string | null
          updated_at?: string | null
          veiculos_utilizados?: string[] | null
          volume_coletado?: number | null
        }
        Relationships: []
      }
      servicos_municipais: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          documentos_necessarios: string[] | null
          id: string
          nome: string
          prazo_dias: number | null
          secretaria_id: string | null
          status: string | null
          taxa: number | null
          tenant_id: string
          tipo_servico: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          id?: string
          nome: string
          prazo_dias?: number | null
          secretaria_id?: string | null
          status?: string | null
          taxa?: number | null
          tenant_id: string
          tipo_servico?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          documentos_necessarios?: string[] | null
          id?: string
          nome?: string
          prazo_dias?: number | null
          secretaria_id?: string | null
          status?: string | null
          taxa?: number | null
          tenant_id?: string
          tipo_servico?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_municipais_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_problemas: {
        Row: {
          anonimo: boolean | null
          area_responsavel: string | null
          canal_entrada: string | null
          categoria: string | null
          coordenadas_gps: Json | null
          created_at: string | null
          custo_reparo: number | null
          data_abertura: string | null
          data_agendamento: string | null
          data_resolucao: string | null
          descricao: string | null
          endereco: Json | null
          feedback_solicitante: string | null
          fotos_problema: string[] | null
          fotos_resolucao: string[] | null
          funcionario_designado_id: string | null
          horario_abertura: string | null
          id: string
          impacto_seguranca: string | null
          impacto_transito: string | null
          materiais_utilizados: string[] | null
          observacoes: string | null
          problemas_relacionados: string[] | null
          reincidencia: boolean | null
          satisfacao_solicitante: number | null
          solicitante_contato: Json | null
          solicitante_nome: string | null
          solucao_aplicada: string | null
          status: string | null
          tempo_resolucao: number | null
          tenant_id: string
          tipo_problema: string | null
          updated_at: string | null
          urgencia: string | null
        }
        Insert: {
          anonimo?: boolean | null
          area_responsavel?: string | null
          canal_entrada?: string | null
          categoria?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          custo_reparo?: number | null
          data_abertura?: string | null
          data_agendamento?: string | null
          data_resolucao?: string | null
          descricao?: string | null
          endereco?: Json | null
          feedback_solicitante?: string | null
          fotos_problema?: string[] | null
          fotos_resolucao?: string[] | null
          funcionario_designado_id?: string | null
          horario_abertura?: string | null
          id?: string
          impacto_seguranca?: string | null
          impacto_transito?: string | null
          materiais_utilizados?: string[] | null
          observacoes?: string | null
          problemas_relacionados?: string[] | null
          reincidencia?: boolean | null
          satisfacao_solicitante?: number | null
          solicitante_contato?: Json | null
          solicitante_nome?: string | null
          solucao_aplicada?: string | null
          status?: string | null
          tempo_resolucao?: number | null
          tenant_id: string
          tipo_problema?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Update: {
          anonimo?: boolean | null
          area_responsavel?: string | null
          canal_entrada?: string | null
          categoria?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          custo_reparo?: number | null
          data_abertura?: string | null
          data_agendamento?: string | null
          data_resolucao?: string | null
          descricao?: string | null
          endereco?: Json | null
          feedback_solicitante?: string | null
          fotos_problema?: string[] | null
          fotos_resolucao?: string[] | null
          funcionario_designado_id?: string | null
          horario_abertura?: string | null
          id?: string
          impacto_seguranca?: string | null
          impacto_transito?: string | null
          materiais_utilizados?: string[] | null
          observacoes?: string | null
          problemas_relacionados?: string[] | null
          reincidencia?: boolean | null
          satisfacao_solicitante?: number | null
          solicitante_contato?: Json | null
          solicitante_nome?: string | null
          solucao_aplicada?: string | null
          status?: string | null
          tempo_resolucao?: number | null
          tenant_id?: string
          tipo_problema?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          cidade: string
          cnpj: string | null
          configuracoes: Json | null
          cores_tema: Json | null
          created_at: string | null
          data_ativacao: string | null
          data_vencimento: string | null
          email: string | null
          endereco: Json | null
          estado: string
          id: string
          logo_url: string | null
          metadata: Json | null
          modulos_habilitados: string[] | null
          nome: string
          plano: Database["public"]["Enums"]["tenant_plano_enum"] | null
          populacao: number | null
          protocolos_max: number | null
          regiao: string | null
          responsavel: Json | null
          slug: string
          status: Database["public"]["Enums"]["status_tenant_enum"] | null
          storage_max_gb: number | null
          telefone: string | null
          tenant_code: string
          updated_at: string | null
          uso_atual: Json | null
          usuarios_max: number | null
          website: string | null
        }
        Insert: {
          cidade: string
          cnpj?: string | null
          configuracoes?: Json | null
          cores_tema?: Json | null
          created_at?: string | null
          data_ativacao?: string | null
          data_vencimento?: string | null
          email?: string | null
          endereco?: Json | null
          estado: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          modulos_habilitados?: string[] | null
          nome: string
          plano?: Database["public"]["Enums"]["tenant_plano_enum"] | null
          populacao?: number | null
          protocolos_max?: number | null
          regiao?: string | null
          responsavel?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["status_tenant_enum"] | null
          storage_max_gb?: number | null
          telefone?: string | null
          tenant_code: string
          updated_at?: string | null
          uso_atual?: Json | null
          usuarios_max?: number | null
          website?: string | null
        }
        Update: {
          cidade?: string
          cnpj?: string | null
          configuracoes?: Json | null
          cores_tema?: Json | null
          created_at?: string | null
          data_ativacao?: string | null
          data_vencimento?: string | null
          email?: string | null
          endereco?: Json | null
          estado?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          modulos_habilitados?: string[] | null
          nome?: string
          plano?: Database["public"]["Enums"]["tenant_plano_enum"] | null
          populacao?: number | null
          protocolos_max?: number | null
          regiao?: string | null
          responsavel?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["status_tenant_enum"] | null
          storage_max_gb?: number | null
          telefone?: string | null
          tenant_code?: string
          updated_at?: string | null
          uso_atual?: Json | null
          usuarios_max?: number | null
          website?: string | null
        }
        Relationships: []
      }
      turismo_estabelecimentos: {
        Row: {
          aceita_cartao: boolean | null
          aceita_pix: boolean | null
          acessibilidade: boolean | null
          avaliacoes: Json | null
          capacidade: number | null
          categoria: string | null
          certificacoes: string[] | null
          cnpj: string | null
          comodidades: string[] | null
          contato: Json | null
          created_at: string | null
          endereco: Json | null
          estacionamento: boolean | null
          fotos: string[] | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          preco_medio: number | null
          proprietario_nome: string | null
          redes_sociais: Json | null
          servicos_oferecidos: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          website: string | null
          wifi_gratuito: boolean | null
        }
        Insert: {
          aceita_cartao?: boolean | null
          aceita_pix?: boolean | null
          acessibilidade?: boolean | null
          avaliacoes?: Json | null
          capacidade?: number | null
          categoria?: string | null
          certificacoes?: string[] | null
          cnpj?: string | null
          comodidades?: string[] | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          estacionamento?: boolean | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          preco_medio?: number | null
          proprietario_nome?: string | null
          redes_sociais?: Json | null
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
          wifi_gratuito?: boolean | null
        }
        Update: {
          aceita_cartao?: boolean | null
          aceita_pix?: boolean | null
          acessibilidade?: boolean | null
          avaliacoes?: Json | null
          capacidade?: number | null
          categoria?: string | null
          certificacoes?: string[] | null
          cnpj?: string | null
          comodidades?: string[] | null
          contato?: Json | null
          created_at?: string | null
          endereco?: Json | null
          estacionamento?: boolean | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          preco_medio?: number | null
          proprietario_nome?: string | null
          redes_sociais?: Json | null
          servicos_oferecidos?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
          wifi_gratuito?: boolean | null
        }
        Relationships: []
      }
      turismo_eventos: {
        Row: {
          ambulancia_standby: boolean | null
          atracoes: string[] | null
          avaliacoes: Json | null
          categoria: string | null
          cobertura_midia: string[] | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          hospedagens_reservadas: number | null
          id: string
          impacto_economico_estimado: number | null
          infraestrutura_montada: string[] | null
          local_realizacao: string | null
          nome: string
          organizador: string | null
          patrocinadores: string[] | null
          ponto_turistico_id: string | null
          programacao: Json | null
          publico_esperado: number | null
          publico_presente: number | null
          restaurantes_participantes: number | null
          seguranca_contratada: boolean | null
          status: string | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          valor_entrada: number | null
        }
        Insert: {
          ambulancia_standby?: boolean | null
          atracoes?: string[] | null
          avaliacoes?: Json | null
          categoria?: string | null
          cobertura_midia?: string[] | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          hospedagens_reservadas?: number | null
          id?: string
          impacto_economico_estimado?: number | null
          infraestrutura_montada?: string[] | null
          local_realizacao?: string | null
          nome: string
          organizador?: string | null
          patrocinadores?: string[] | null
          ponto_turistico_id?: string | null
          programacao?: Json | null
          publico_esperado?: number | null
          publico_presente?: number | null
          restaurantes_participantes?: number | null
          seguranca_contratada?: boolean | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
        }
        Update: {
          ambulancia_standby?: boolean | null
          atracoes?: string[] | null
          avaliacoes?: Json | null
          categoria?: string | null
          cobertura_midia?: string[] | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          hospedagens_reservadas?: number | null
          id?: string
          impacto_economico_estimado?: number | null
          infraestrutura_montada?: string[] | null
          local_realizacao?: string | null
          nome?: string
          organizador?: string | null
          patrocinadores?: string[] | null
          ponto_turistico_id?: string | null
          programacao?: Json | null
          publico_esperado?: number | null
          publico_presente?: number | null
          restaurantes_participantes?: number | null
          seguranca_contratada?: boolean | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "turismo_eventos_ponto_turistico_id_fkey"
            columns: ["ponto_turistico_id"]
            isOneToOne: false
            referencedRelation: "turismo_pontos"
            referencedColumns: ["id"]
          },
        ]
      }
      turismo_pontos: {
        Row: {
          acessibilidade: boolean | null
          avaliacoes: Json | null
          capacidade_visitantes: number | null
          categoria: string | null
          coordenadas_gps: Json | null
          created_at: string | null
          descricao: string | null
          endereco: Json | null
          fotos: string[] | null
          horario_funcionamento: Json | null
          id: string
          infraestrutura: string[] | null
          melhor_epoca_visita: string | null
          nivel_dificuldade: string | null
          nome: string
          responsavel_manutencao: string | null
          restricoes_idade: string[] | null
          status: string | null
          tempo_visita_sugerido: number | null
          tenant_id: string
          updated_at: string | null
          valor_entrada: number | null
          videos: string[] | null
        }
        Insert: {
          acessibilidade?: boolean | null
          avaliacoes?: Json | null
          capacidade_visitantes?: number | null
          categoria?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          descricao?: string | null
          endereco?: Json | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          infraestrutura?: string[] | null
          melhor_epoca_visita?: string | null
          nivel_dificuldade?: string | null
          nome: string
          responsavel_manutencao?: string | null
          restricoes_idade?: string[] | null
          status?: string | null
          tempo_visita_sugerido?: number | null
          tenant_id: string
          updated_at?: string | null
          valor_entrada?: number | null
          videos?: string[] | null
        }
        Update: {
          acessibilidade?: boolean | null
          avaliacoes?: Json | null
          capacidade_visitantes?: number | null
          categoria?: string | null
          coordenadas_gps?: Json | null
          created_at?: string | null
          descricao?: string | null
          endereco?: Json | null
          fotos?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          infraestrutura?: string[] | null
          melhor_epoca_visita?: string | null
          nivel_dificuldade?: string | null
          nome?: string
          responsavel_manutencao?: string | null
          restricoes_idade?: string[] | null
          status?: string | null
          tempo_visita_sugerido?: number | null
          tenant_id?: string
          updated_at?: string | null
          valor_entrada?: number | null
          videos?: string[] | null
        }
        Relationships: []
      }
      turismo_roteiros: {
        Row: {
          alimentacao_incluida: boolean | null
          avaliacoes: Json | null
          created_at: string | null
          criado_por_id: string | null
          custo_estimado: number | null
          descricao: string | null
          dificuldade: string | null
          duracao_horas: number | null
          equipamentos_necessarios: string[] | null
          estabelecimentos: string[] | null
          fotos: string[] | null
          guia_necessario: boolean | null
          id: string
          mapa_roteiro: string | null
          melhor_epoca: string | null
          nome: string
          ordem_visitacao: Json | null
          pontos_turisticos: string[] | null
          publico_alvo: string | null
          restricoes: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          transporte_incluido: boolean | null
          updated_at: string | null
        }
        Insert: {
          alimentacao_incluida?: boolean | null
          avaliacoes?: Json | null
          created_at?: string | null
          criado_por_id?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          dificuldade?: string | null
          duracao_horas?: number | null
          equipamentos_necessarios?: string[] | null
          estabelecimentos?: string[] | null
          fotos?: string[] | null
          guia_necessario?: boolean | null
          id?: string
          mapa_roteiro?: string | null
          melhor_epoca?: string | null
          nome: string
          ordem_visitacao?: Json | null
          pontos_turisticos?: string[] | null
          publico_alvo?: string | null
          restricoes?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          transporte_incluido?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alimentacao_incluida?: boolean | null
          avaliacoes?: Json | null
          created_at?: string | null
          criado_por_id?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          dificuldade?: string | null
          duracao_horas?: number | null
          equipamentos_necessarios?: string[] | null
          estabelecimentos?: string[] | null
          fotos?: string[] | null
          guia_necessario?: boolean | null
          id?: string
          mapa_roteiro?: string | null
          melhor_epoca?: string | null
          nome?: string
          ordem_visitacao?: Json | null
          pontos_turisticos?: string[] | null
          publico_alvo?: string | null
          restricoes?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          transporte_incluido?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      turismo_visitantes: {
        Row: {
          avaliacao_geral: number | null
          cidade_origem: string | null
          created_at: string | null
          data_visita: string | null
          estabelecimento_id: string | null
          estado_origem: string | null
          evento_id: string | null
          faixa_etaria: string | null
          forma_conhecimento: string | null
          gasto_estimado: number | null
          id: string
          meio_transporte: string | null
          motivo_visita: string | null
          origem_visitante: string | null
          pais_origem: string | null
          permanencia_dias: number | null
          ponto_turistico_id: string | null
          sexo: string | null
          sugestoes: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          avaliacao_geral?: number | null
          cidade_origem?: string | null
          created_at?: string | null
          data_visita?: string | null
          estabelecimento_id?: string | null
          estado_origem?: string | null
          evento_id?: string | null
          faixa_etaria?: string | null
          forma_conhecimento?: string | null
          gasto_estimado?: number | null
          id?: string
          meio_transporte?: string | null
          motivo_visita?: string | null
          origem_visitante?: string | null
          pais_origem?: string | null
          permanencia_dias?: number | null
          ponto_turistico_id?: string | null
          sexo?: string | null
          sugestoes?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          avaliacao_geral?: number | null
          cidade_origem?: string | null
          created_at?: string | null
          data_visita?: string | null
          estabelecimento_id?: string | null
          estado_origem?: string | null
          evento_id?: string | null
          faixa_etaria?: string | null
          forma_conhecimento?: string | null
          gasto_estimado?: number | null
          id?: string
          meio_transporte?: string | null
          motivo_visita?: string | null
          origem_visitante?: string | null
          pais_origem?: string | null
          permanencia_dias?: number | null
          ponto_turistico_id?: string | null
          sexo?: string | null
          sugestoes?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turismo_visitantes_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "turismo_estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turismo_visitantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "turismo_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turismo_visitantes_ponto_turistico_id_fkey"
            columns: ["ponto_turistico_id"]
            isOneToOne: false
            referencedRelation: "turismo_pontos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          id: string
          ip_address: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip_address?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip_address?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bloqueado_ate: string | null
          cargo: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          departamento: string | null
          email: string
          endereco: Json | null
          horario_trabalho: Json | null
          id: string
          metadata: Json | null
          nome_completo: string
          permissoes: string[] | null
          preferencias: Json | null
          primeiro_acesso: boolean | null
          secretaria_id: string | null
          secretarias_acesso: string[] | null
          senha_temporaria: boolean | null
          setor_id: string | null
          status: Database["public"]["Enums"]["status_base_enum"] | null
          supervisor_id: string | null
          telefone: string | null
          tenant_id: string
          tentativas_login: number | null
          tipo_usuario: Database["public"]["Enums"]["user_tipo_enum"] | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bloqueado_ate?: string | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          departamento?: string | null
          email: string
          endereco?: Json | null
          horario_trabalho?: Json | null
          id: string
          metadata?: Json | null
          nome_completo: string
          permissoes?: string[] | null
          preferencias?: Json | null
          primeiro_acesso?: boolean | null
          secretaria_id?: string | null
          secretarias_acesso?: string[] | null
          senha_temporaria?: boolean | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["status_base_enum"] | null
          supervisor_id?: string | null
          telefone?: string | null
          tenant_id: string
          tentativas_login?: number | null
          tipo_usuario?: Database["public"]["Enums"]["user_tipo_enum"] | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bloqueado_ate?: string | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          departamento?: string | null
          email?: string
          endereco?: Json | null
          horario_trabalho?: Json | null
          id?: string
          metadata?: Json | null
          nome_completo?: string
          permissoes?: string[] | null
          preferencias?: Json | null
          primeiro_acesso?: boolean | null
          secretaria_id?: string | null
          secretarias_acesso?: string[] | null
          senha_temporaria?: boolean | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["status_base_enum"] | null
          supervisor_id?: string | null
          telefone?: string | null
          tenant_id?: string
          tentativas_login?: number | null
          tipo_usuario?: Database["public"]["Enums"]["user_tipo_enum"] | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          dispositivo: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          localizacao: Json | null
          sessao_id: string
          tenant_id: string | null
          ultima_atividade: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          dispositivo?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          localizacao?: Json | null
          sessao_id: string
          tenant_id?: string | null
          ultima_atividade?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          dispositivo?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          localizacao?: Json | null
          sessao_id?: string
          tenant_id?: string | null
          ultima_atividade?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_numero_protocolo: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_current_user_tenant: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_audit_action: {
        Args:
          | {
              p_action: string
              p_details?: Json
              p_ip_address?: string
              p_user_agent?: string
              p_user_id: string
            }
          | {
              p_action?: string
              p_details?: string
              p_ip_address?: unknown
              p_user_agent?: string
              p_user_id?: string
            }
        Returns: undefined
      }
      log_login_attempt: {
        Args:
          | {
              p_email: string
              p_failure_reason?: string
              p_ip_address?: string
              p_success: boolean
              p_user_agent?: string
              p_user_id?: string
            }
          | {
              p_email: string
              p_failure_reason?: string
              p_ip_address?: unknown
              p_success: boolean
              p_user_agent?: string
              p_user_id?: string
            }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      prioridade_enum: "baixa" | "media" | "alta" | "urgente" | "critica"
      status_agendamento_enum:
        | "agendado"
        | "confirmado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
        | "nao_compareceu"
        | "reagendado"
      status_base_enum: "ativo" | "inativo" | "pendente" | "suspenso"
      status_processo_enum:
        | "aberto"
        | "em_andamento"
        | "aguardando_documentos"
        | "aguardando_aprovacao"
        | "aprovado"
        | "rejeitado"
        | "concluido"
        | "cancelado"
        | "suspenso"
        | "em_revisao"
      status_tenant_enum: "ativo" | "suspenso" | "cancelado" | "trial"
      tenant_plano_enum: "starter" | "professional" | "enterprise"
      user_tipo_enum:
        | "super_admin"
        | "admin"
        | "secretario"
        | "diretor"
        | "coordenador"
        | "supervisor"
        | "operador"
        | "cidadao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      prioridade_enum: ["baixa", "media", "alta", "urgente", "critica"],
      status_agendamento_enum: [
        "agendado",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
        "nao_compareceu",
        "reagendado",
      ],
      status_base_enum: ["ativo", "inativo", "pendente", "suspenso"],
      status_processo_enum: [
        "aberto",
        "em_andamento",
        "aguardando_documentos",
        "aguardando_aprovacao",
        "aprovado",
        "rejeitado",
        "concluido",
        "cancelado",
        "suspenso",
        "em_revisao",
      ],
      status_tenant_enum: ["ativo", "suspenso", "cancelado", "trial"],
      tenant_plano_enum: ["starter", "professional", "enterprise"],
      user_tipo_enum: [
        "super_admin",
        "admin",
        "secretario",
        "diretor",
        "coordenador",
        "supervisor",
        "operador",
        "cidadao",
      ],
    },
  },
} as const
