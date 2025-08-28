import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from '../services/userService.js';
import { AppError } from '../middleware/errorHandler.js';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await userService.findByEmail(email);
      if (!user) {
        throw new AppError('Credenciais inválidas', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Credenciais inválidas', 401);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(401).json({ message: 'Falha na autenticação' });
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

  async refreshToken(_req: Request, res: Response) {
    res.json({ message: 'Refresh token - implementar' });
  }

  async logout(_req: Request, res: Response) {
    res.json({ message: 'Logout realizado com sucesso' });
  }
}

export const authController = new AuthController();