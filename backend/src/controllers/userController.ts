import { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { AuthRequest } from '../types/auth.js';

class UserController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await userService.findById(req.userId!);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.userId!;

      const updatedUser = await userService.update(userId, { name });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  }

  async listUsers(req: AuthRequest, res: Response) {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  }

  async createUser(req: AuthRequest, res: Response) {
    try {
      const userData = req.body;
      const user = await userService.create(userData);
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }
}

export const userController = new UserController();