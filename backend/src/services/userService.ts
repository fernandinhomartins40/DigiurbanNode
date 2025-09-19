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
        passwordHash: userData.passwordHash, // Assumindo que password é o hash
        nomeCompleto: userData.nomeCompleto,
        role: userData.role as any
      }
    });

    return user as User;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};

    // Mapear campos para o schema Prisma
    if (data.email) updateData.email = data.email;
    if (data.passwordHash) updateData.passwordHash = data.passwordHash;
    if (data.nomeCompleto) updateData.nomeCompleto = data.nomeCompleto;
    if (data.role) updateData.role = data.role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return user as User;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();

    return users.map(user => ({
      ...user,
      passwordHash: '', // Não retornar senha
    } as User));
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