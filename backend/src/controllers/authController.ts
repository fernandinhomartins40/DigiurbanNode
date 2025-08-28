import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from '../services/userService.js';
import { AppError } from '../middleware/errorHandler.js';
import { query, queryOne } from '../database/connection.js';
import { User, UserModel } from '../models/User.js';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      console.log('🔐 [AUTH] Login attempt for:', req.body.email);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }

      const user = await UserModel.findByEmail(email.toLowerCase().trim());
      if (!user) {
        console.log('❌ [AUTH] User not found:', email);
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      console.log('👤 [AUTH] User found:', { id: user.id, role: user.role, status: user.status });

      if (user.status !== 'ativo') {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo ou bloqueado'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        console.log('❌ [AUTH] Invalid password for:', email);
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Gerar tokens JWT
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          tenant_id: user.tenant_id 
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '2h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      // Buscar dados do tenant se existir
      let tenantData = null;
      if (user.tenant_id) {
        const tenant = await queryOne(
          'SELECT id, nome, status FROM tenants WHERE id = ?',
          [user.tenant_id]
        );
        if (tenant) {
          tenantData = {
            id: tenant.id,
            name: tenant.nome,
            status: tenant.status
          };
        }
      }

      console.log('✅ [AUTH] Login successful for:', email);

      // Response padronizada conforme esperado pelo frontend
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nome_completo: user.nome_completo,
            email: user.email,
            role: user.role,
            status: user.status,
            tenant_id: user.tenant_id,
            email_verified: user.email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          tokens: {
            accessToken,
            refreshToken
          },
          tenant: tenantData
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);
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
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token não fornecido'
        });
      }

      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as any;

      const user = await UserModel.findById(decoded.userId);
      if (!user || user.status !== 'ativo') {
        return res.status(401).json({
          success: false,
          error: 'Usuário inválido ou inativo'
        });
      }

      // Gerar novo access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          tenant_id: user.tenant_id 
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '2h' }
      );

      res.json({
        success: true,
        data: {
          accessToken
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // TODO: Implementar blacklist de tokens se necessário
      console.log('🚪 [AUTH] User logout:', req.user?.userId);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro no logout'
      });
    }
  }
}

export const authController = new AuthController();