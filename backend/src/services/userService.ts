import { prisma } from "../database/prisma.js";
import { User, CreateUserData } from '../types/auth.js';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user as User | null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();

    const user = await prisma.user.create({
      data: {
        id,
        email: userData.email,
        passwordHash: userData.password, // Assumindo que password é o hash
        nomeCompleto: userData.name,
        role: userData.role as any
      }
    });

    return {
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      name: user.nomeCompleto,
      role: user.role as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};

    // Mapear campos para o schema Prisma
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.passwordHash = data.password;
    if (data.name) updateData.nomeCompleto = data.name;
    if (data.role) updateData.role = data.role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return {
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      name: user.nomeCompleto,
      role: user.role as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      password: '', // Não retornar senha
      name: user.nomeCompleto,
      role: user.role as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const userService = new UserService();