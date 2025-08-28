// ====================================================================
// 🔐 ROTAS DE AUTENTICAÇÃO - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Rotas completas para login, logout, refresh token e validação
// Sistema integrado com rate limiting e logs de atividade
// ====================================================================

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { RegistrationService } from '../services/RegistrationService.js';
// import { ActivityService } from '../services/ActivityService.js';
import { loginRateLimit, generalRateLimit, registerRateLimit } from '../middleware/rateLimiter.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

export const authRoutes = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

const registerValidation = [
  body('nome_completo')
    .isLength({ min: 2 })
    .withMessage('Nome completo é obrigatório'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'),
  body('tenant_id')
    .optional()
    .isUUID()
    .withMessage('Tenant ID deve ser um UUID válido')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
];

// ====================================================================
// ROTAS PÚBLICAS
// ====================================================================

/**
 * POST /auth/login
 * Realizar login com email e senha
 */
authRoutes.post('/login', 
  loginRateLimit,
  loginValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Realizar login
      const result = await AuthService.login({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro no login:', error);
      
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /auth/register
 * Registrar novo usuário
 */
authRoutes.post('/register',
  registerRateLimit,
  registerValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
        return;
      }

      const registrationData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      // Registrar usuário
      const result = await RegistrationService.registerUser(registrationData);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Renovar token de acesso
 */
authRoutes.post('/refresh',
  generalRateLimit,
  refreshTokenValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Refresh token inválido',
          details: errors.array()
        });
        return;
      }

      const { refreshToken } = req.body;

      // Renovar token
      const result = await AuthService.refreshToken({ refreshToken });

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro no refresh token:', error);
      
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token inválido'
      });
    }
  }
);

/**
 * POST /auth/validate
 * Validar token atual
 */
authRoutes.post('/validate',
  generalRateLimit,
  body('token').notEmpty().withMessage('Token é obrigatório'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Token é obrigatório',
          details: errors.array()
        });
        return;
      }

      const { token } = req.body;

      // Validar token
      const validation = await AuthService.validateToken(token);

      if (!validation.valid) {
        res.status(401).json({
          success: false,
          error: validation.error || 'Token inválido'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: validation.user,
          valid: true
        }
      });

    } catch (error) {
      console.error('Erro na validação do token:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS PROTEGIDAS (REQUEREM AUTENTICAÇÃO)
// ====================================================================

/**
 * POST /auth/logout
 * Realizar logout da sessão atual
 */
authRoutes.post('/logout',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const token = req.headers.authorization?.replace('Bearer ', '') || '';

      const result = await AuthService.logout(userId, token);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /auth/logout-all
 * Fazer logout de todas as sessões
 */
authRoutes.post('/logout-all',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const result = await AuthService.logoutAll(userId);

      res.json({
        success: true,
        message: result.message,
        data: {
          sessionsTerminated: result.sessionsTerminated
        }
      });

    } catch (error) {
      console.error('Erro no logout geral:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /auth/profile
 * Obter perfil do usuário autenticado
 */
authRoutes.get('/profile',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Usuário já está disponível via middleware
      const user = req.user!;

      res.json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: {
          user
        }
      });

    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * GET /auth/sessions
 * Listar sessões ativas do usuário
 */
authRoutes.get('/sessions',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const sessions = await AuthService.getActiveSessions(userId);

      res.json({
        success: true,
        message: 'Sessões obtidas com sucesso',
        data: {
          sessions,
          total: sessions.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar sessões:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

/**
 * DELETE /auth/sessions/:sessionId
 * Encerrar sessão específica
 */
authRoutes.delete('/sessions/:sessionId',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

      const result = await AuthService.terminateSession(sessionId, userId);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS ADMINISTRATIVAS
// ====================================================================

/**
 * GET /auth/stats
 * Estatísticas de autenticação (apenas admins)
 */
authRoutes.get('/stats',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar se é admin
      if (!['admin', 'super_admin'].includes(req.user!.role)) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado - apenas administradores'
        });
        return;
      }

      const tenantId = req.user!.role === 'super_admin' ? undefined : req.user!.tenant_id;
      const stats = await AuthService.getAuthStats(tenantId);

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: stats
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);