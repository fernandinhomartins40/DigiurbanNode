import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userService } from '../services/userService.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from "../database/prisma.js";
import User, { UserModel } from '../models/User.js';
import { CookieManager } from '../utils/cookieManager.js';
import { AUTH_CONFIG, isProduction } from '../config/auth.js';
import { StructuredLogger, withRequestContext } from '../monitoring/structuredLogger.js';
import { recordAuthAttempt } from '../monitoring/metrics.js';

class AuthController {
  async login(req: Request, res: Response) {
    const startTime = Date.now();
    const context = withRequestContext(req, { 
      action: 'user_login',
      resource: 'authentication'
    });

    try {
      const { email, password } = req.body;

      // Log da tentativa de login
      StructuredLogger.audit('User login attempt', {
        ...context,
        success: false, // Será atualizado para true se bem sucedido
        details: `Login attempt for email: ${email?.substring(0, 3)}***`
      });

      if (!email || !password) {
        recordAuthAttempt('failure', 'unknown', 'password');
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }

      const user = await UserModel.findByEmail(email.toLowerCase().trim());
      if (!user) {
        StructuredLogger.security('Failed login attempt - user not found', {
          ...context,
          severity: 'medium',
          threat: 'credential_stuffing',
          source: req.ip
        });
        
        recordAuthAttempt('failure', 'unknown', 'password');
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      console.log('👤 [AUTH] User found:', { id: user.id, role: user.role, status: user.status });

      if (user.status !== 'ativo') {
        StructuredLogger.security('Login attempt on inactive user', {
          ...context,
          userId: user.id,
          tenantId: user.tenantId,
          severity: 'high',
          threat: 'account_abuse',
          source: req.ip
        });
        
        recordAuthAttempt('failure', user.tenantId || 'unknown', 'password');
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo ou bloqueado'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        StructuredLogger.security('Failed login attempt - invalid password', {
          ...context,
          userId: user.id,
          tenantId: user.tenantId,
          severity: 'high',
          threat: 'brute_force',
          source: req.ip
        });
        
        recordAuthAttempt('failure', user.tenantId || 'unknown', 'password');
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Gerar tokens JWT
      const sessionId = crypto.randomUUID();
      const csrfToken = crypto.randomBytes(32).toString('hex');

      const accessToken = (jwt as any).sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          tenant_id: user.tenantId,
          sessionId,
          csrf: csrfToken
        },
        AUTH_CONFIG.JWT_SECRET,
        { 
          expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
          issuer: 'digiurban-auth',
          audience: 'digiurban-api'
        }
      );

      const refreshToken = (jwt as any).sign(
        { 
          userId: user.id, 
          sessionId 
        },
        AUTH_CONFIG.JWT_REFRESH_SECRET,
        { 
          expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
          issuer: 'digiurban-auth',
          audience: 'digiurban-refresh'
        }
      );

      // Buscar dados do tenant se existir
      let tenantData = null;
      if (user.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: { id: true, nome: true, status: true }
        });
        if (tenant) {
          tenantData = {
            id: tenant.id,
            name: tenant.nome,
            status: tenant.status
          };
        }
      }

      // Log de sucesso com auditoria
      const loginDuration = Date.now() - startTime;
      
      StructuredLogger.audit('User login successful', {
        ...context,
        userId: user.id,
        tenantId: user.tenantId,
        success: true,
        details: `Successful login for user ${user.id.substring(0, 8)}...`
      });

      StructuredLogger.business('User authentication', {
        ...context,
        userId: user.id,
        tenantId: user.tenantId,
        entityType: 'user_session',
        entityId: sessionId,
        operation: 'create'
      });

      StructuredLogger.performance('User login', {
        ...context,
        userId: user.id,
        tenantId: user.tenantId,
        duration: loginDuration,
        threshold: 2000 // 2 segundos
      });

      recordAuthAttempt('success', user.tenantId || 'unknown', 'password');

      // Definir cookies seguros
      CookieManager.setAuthCookies(res, {
        accessToken,
        refreshToken,
        sessionId,
        csrfToken
      });

      // Response sem tokens expostos (cookies httpOnly são mais seguros)
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nome_completo: user.nomeCompleto,
            email: user.email,
            role: user.role,
            status: user.status,
            tenant_id: user.tenantId,
            email_verified: user.emailVerified,
            created_at: user.createdAt,
            updated_at: user.updatedAt
          },
          // Manter tokens na response para compatibilidade com frontend atual
          // TODO: Remover após migração completa para cookies
          tokens: {
            accessToken,
            refreshToken
          },
          tenant: tenantData,
          csrfToken // Necessário para requests protegidos
        }
      });

    } catch (error) {
      StructuredLogger.error('Login error', error, {
        ...context,
        errorType: 'authentication_error'
      });

      recordAuthAttempt('failure', 'unknown', 'password');
      
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor' 
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        throw new AppError('Email já está em uso', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userService.create({
        email,
        password: hashedPassword,
        name,
        role: 'user'
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Erro ao criar usuário' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      // Priorizar refresh token dos cookies
      let refreshToken = CookieManager.getRefreshToken(req);
      
      // Fallback para body (compatibilidade)
      if (!refreshToken) {
        refreshToken = req.body.refreshToken;
      }

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token não fornecido'
        });
      }

      const decoded = jwt.verify(
        refreshToken, 
        AUTH_CONFIG.JWT_REFRESH_SECRET,
        {
          issuer: 'digiurban-auth',
          audience: 'digiurban-refresh'
        }
      ) as any;

      const user = await UserModel.findById(decoded.userId);
      if (!user || user.status !== 'ativo') {
        // Limpar cookies inválidos
        CookieManager.clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          error: 'Usuário inválido ou inativo'
        });
      }

      // Gerar novo access token mantendo sessionId
      const newCsrfToken = crypto.randomBytes(32).toString('hex');
      const accessToken = (jwt as any).sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          tenant_id: user.tenantId,
          sessionId: decoded.sessionId,
          csrf: newCsrfToken
        },
        AUTH_CONFIG.JWT_SECRET as any,
        { 
          expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
          issuer: 'digiurban-auth',
          audience: 'digiurban-api'
        }
      );

      // Atualizar cookies
      CookieManager.setAccessToken(res, accessToken);
      CookieManager.setCSRFToken(res, newCsrfToken);

      res.json({
        success: true,
        data: {
          accessToken, // Manter para compatibilidade
          csrfToken: newCsrfToken
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Refresh token error:', error);
      CookieManager.clearAuthCookies(res);
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Log seguro
      if (isProduction()) {
        console.log(`🚪 [AUTH] User logout: ${userId?.substring(0, 8)}...`);
      } else {
        console.log('🚪 [AUTH] User logout:', userId);
      }

      // Limpar todos os cookies de autenticação
      CookieManager.clearAuthCookies(res);

      // TODO: Implementar invalidação de sessão no banco de dados
      // Se tiver sessionId, invalidar no banco para segurança extra
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      // Mesmo com erro, limpar cookies por segurança
      CookieManager.clearAuthCookies(res);
      res.status(500).json({
        success: false,
        error: 'Erro no logout'
      });
    }
  }
}

export const authController = new AuthController();