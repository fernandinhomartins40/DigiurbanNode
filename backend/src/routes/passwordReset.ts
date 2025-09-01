// ====================================================================
// 🔑 ROTAS DE RECUPERAÇÃO DE SENHA - DIGIURBAN PASSWORD RESET
// ====================================================================
// Rotas para solicitação e redefinição de senhas com validação
// ====================================================================

import { Router, Request, Response } from 'express';
import { body, validationResult } from '../utils/validators.js';
import { PasswordResetService } from '../services/PasswordResetService.js';
import { generalRateLimit, passwordResetRateLimit } from '../middleware/rateLimiter.js';
import { sanitizeAll, handleValidationErrors } from '../middleware/validation.js';

export const passwordResetRoutes = Router();

// ====================================================================
// VALIDAÇÕES
// ====================================================================

const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter formato válido')
];

const updatePasswordValidation = [
  body('token')
    .notEmpty()
    .isLength({ min: 32 })
    .withMessage('Token de recuperação inválido'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nova senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo especial')
];

const validateTokenValidation = [
  body('token')
    .notEmpty()
    .isLength({ min: 32 })
    .withMessage('Token de recuperação inválido')
];

// ====================================================================
// ROTAS PÚBLICAS
// ====================================================================

/**
 * POST /password-reset/request
 * Solicitar recuperação de senha por e-mail
 */
passwordResetRoutes.post('/request',
  sanitizeAll,
  passwordResetRateLimit, // Rate limit específico para recuperação
  requestPasswordResetValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const result = await PasswordResetService.requestPasswordReset({
        email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: {
          tokenSent: result.tokenSent
        }
      });

    } catch (error) {
      console.error('Erro na solicitação de recuperação de senha:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * POST /password-reset/validate-token
 * Validar token de recuperação de senha
 */
passwordResetRoutes.post('/validate-token',
  sanitizeAll,
  generalRateLimit,
  validateTokenValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      const validation = await PasswordResetService.validateResetToken(token);

      res.status(validation.valid ? 200 : 400).json({
        success: validation.valid,
        message: validation.message,
        data: validation.valid ? {
          userEmail: validation.userEmail,
          expiresAt: validation.expiresAt
        } : null
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

/**
 * POST /password-reset/update-password
 * Redefinir senha usando token válido
 */
passwordResetRoutes.post('/update-password',
  sanitizeAll,
  generalRateLimit,
  updatePasswordValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const result = await PasswordResetService.updatePassword({
        token,
        newPassword,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: result.success ? {
          userEmail: result.userEmail
        } : null
      });

    } catch (error) {
      console.error('Erro na atualização de senha:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ====================================================================
// ROTAS ADMINISTRATIVAS (FUTURAS)
// ====================================================================

/**
 * GET /password-reset/stats
 * Estatísticas de recuperação de senha (para admins)
 */
passwordResetRoutes.get('/stats',
  generalRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Por enquanto, rota básica - você pode adicionar middleware de auth admin depois
      const stats = await PasswordResetService.getPasswordResetStats();

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: stats
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas de recuperação:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

export default passwordResetRoutes;