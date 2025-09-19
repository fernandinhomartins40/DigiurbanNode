// ====================================================================
// 🏛️ ROTAS SEGURAS DO PAINEL DO CIDADÃO - SISTEMA DE PERMISSÕES GRANULARES
// ====================================================================
// Exemplo de implementação das rotas com controle de acesso específico para cidadãos
// Demonstra o isolamento entre painel público e administrativo
// ====================================================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validators, handleValidationErrors, sanitizeAll } from '../middleware/validation.js';
import { generalRateLimit, strictRateLimit } from '../middleware/rateLimiter.js';
import { PermissionService } from '../services/PermissionService.js';
import { ActivityService } from '../services/ActivityService.js';

export const secureCidadaoRoutes = Router();

// ====================================================================
// VALIDAÇÕES ESPECÍFICAS DO CIDADÃO
// ====================================================================

const protocoloValidation = [
  validators.body('titulo')
    .isLength({ min: 5, max: 100 })
    .withMessage('Título deve ter entre 5 e 100 caracteres'),
  validators.body('descricao')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  validators.body('categoria')
    .isIn(['servicos', 'reclamacao', 'sugestao', 'informacao'])
    .withMessage('Categoria inválida'),
  validators.body('prioridade')
    .optional()
    .isIn(['baixa', 'normal', 'alta'])
    .withMessage('Prioridade inválida')
];

const perfilValidation = [
  validators.body('nome_completo')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  validators.body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ser válido'),
  validators.body('endereco')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Endereço deve ter entre 5 e 200 caracteres')
];

// ====================================================================
// ROTAS DO PAINEL DO CIDADÃO
// ====================================================================

/**
 * GET /cidadao/dashboard
 * Dashboard principal do cidadão
 */
secureCidadaoRoutes.get('/dashboard',
  authMiddleware,
  PermissionService.requireCidadaoDashboard,
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar se é realmente cidadão ou super_admin
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        await ActivityService.log({
          user_id: req.user!.id,
          action: 'cidadao_access_denied',
          resource: 'cidadao_dashboard',
          details: JSON.stringify({
            reason: 'User role is not cidadao',
            userRole: req.user!.role
          }),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          error: 'Acesso restrito ao painel do cidadão'
        });
        return;
      }

      // Buscar dados do dashboard (protocolos recentes, notícias, etc.)
      const dashboardData = {
        protocolos_recentes: [], // Implementar busca de protocolos
        notificacoes: [],
        servicos_populares: [],
        agenda_publica: []
      };

      await ActivityService.log({
        user_id: req.user!.id,
        action: 'cidadao_dashboard_accessed',
        resource: 'cidadao_dashboard',
        details: JSON.stringify({
          userRole: req.user!.role
        }),
        ip_address: req.ip
      });

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro no dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /cidadao/protocolos
 * Criar novo protocolo/solicitação
 */
secureCidadaoRoutes.post('/protocolos',
  authMiddleware,
  PermissionService.requireCidadaoProtocolosCreate,
  sanitizeAll,
  generalRateLimit,
  protocoloValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar se é cidadão
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Apenas cidadãos podem criar protocolos'
        });
        return;
      }

      const { titulo, descricao, categoria, prioridade = 'normal' } = req.body;

      // Gerar número do protocolo
      const protocoloNumero = `PROT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Simular criação do protocolo (implementar com model real)
      const protocolo = {
        id: protocoloNumero,
        numero: protocoloNumero,
        titulo,
        descricao,
        categoria,
        prioridade,
        status: 'aberto',
        cidadao_id: req.user!.id,
        created_at: new Date()
      };

      await ActivityService.log({
        user_id: req.user!.id,
        action: 'protocolo_created',
        resource: 'cidadao_protocolos',
        resource_id: protocoloNumero,
        details: JSON.stringify({
          titulo: titulo.substring(0, 50),
          categoria,
          prioridade
        }),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Protocolo criado com sucesso',
        data: protocolo
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro ao criar protocolo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /cidadao/protocolos
 * Listar protocolos do cidadão
 */
secureCidadaoRoutes.get('/protocolos',
  authMiddleware,
  PermissionService.requireCidadaoProtocolosRead,
  generalRateLimit,
  [
    validators.query('status').optional().isString(),
    validators.query('categoria').optional().isString(),
    validators.query('limit').optional().isInt({ min: 1, max: 50 }),
    validators.query('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Apenas cidadãos podem visualizar seus protocolos'
        });
        return;
      }

      const { status, categoria, limit = 10, offset = 0 } = req.query;

      // Simular busca de protocolos do cidadão
      const protocolos = []; // Implementar busca real no banco

      await ActivityService.log({
        user_id: req.user!.id,
        action: 'protocolos_listed',
        resource: 'cidadao_protocolos',
        details: JSON.stringify({
          filters: { status, categoria },
          resultCount: protocolos.length
        }),
        ip_address: req.ip
      });

      res.json({
        success: true,
        data: protocolos,
        total: protocolos.length
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro ao listar protocolos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /cidadao/servicos
 * Listar serviços públicos disponíveis
 */
secureCidadaoRoutes.get('/servicos',
  authMiddleware,
  PermissionService.requireCidadaoServicos,
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Cidadãos e super_admins podem acessar
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Acesso restrito ao painel do cidadão'
        });
        return;
      }

      // Simular lista de serviços públicos
      const servicos = [
        {
          id: 1,
          nome: 'Emissão de Segunda Via de IPTU',
          descricao: 'Solicitação de segunda via da guia de IPTU',
          categoria: 'Tributário',
          prazo: '5 dias úteis',
          documentos_necessarios: ['RG', 'CPF', 'Comprovante de endereço']
        },
        {
          id: 2,
          nome: 'Licença para Construção',
          descricao: 'Solicitação de licença para construção civil',
          categoria: 'Obras',
          prazo: '30 dias úteis',
          documentos_necessarios: ['Projeto arquitetônico', 'ART', 'Documentos do imóvel']
        }
      ];

      res.json({
        success: true,
        data: servicos
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro ao listar serviços:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * PUT /cidadao/perfil
 * Atualizar perfil do cidadão
 */
secureCidadaoRoutes.put('/perfil',
  authMiddleware,
  PermissionService.requireCidadaoPerfil,
  sanitizeAll,
  strictRateLimit,
  perfilValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Apenas cidadãos podem atualizar seu perfil'
        });
        return;
      }

      const { nome_completo, telefone, endereco } = req.body;

      // Simular atualização do perfil
      const perfilAtualizado = {
        id: req.user!.id,
        nome_completo: nome_completo || req.user!.nomeCompleto,
        telefone,
        endereco,
        updated_at: new Date()
      };

      await ActivityService.log({
        user_id: req.user!.id,
        action: 'perfil_updated',
        resource: 'cidadao_perfil',
        details: JSON.stringify({
          campos_alterados: Object.keys(req.body)
        }),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: perfilAtualizado
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /cidadao/noticias
 * Listar notícias e comunicados públicos
 */
secureCidadaoRoutes.get('/noticias',
  authMiddleware,
  PermissionService.requireCidadaoNoticias,
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user!.role !== 'cidadao' && req.user!.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Acesso restrito ao painel do cidadão'
        });
        return;
      }

      // Simular notícias públicas
      const noticias = [
        {
          id: 1,
          titulo: 'Novo sistema de protocolo online',
          resumo: 'Agora é possível abrir protocolos diretamente pelo site',
          data_publicacao: new Date(),
          categoria: 'Sistema'
        },
        {
          id: 2,
          titulo: 'Horário de funcionamento das secretarias',
          resumo: 'Confira os horários atualizados de atendimento',
          data_publicacao: new Date(),
          categoria: 'Atendimento'
        }
      ];

      res.json({
        success: true,
        data: noticias
      });

    } catch (error) {
      console.error('❌ [CIDADAO-SECURE] Erro ao listar notícias:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default secureCidadaoRoutes;