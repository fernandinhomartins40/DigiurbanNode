import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export interface User {
  id: string;
  tenantId: string | null;
  nomeCompleto: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  ultimoLogin: Date | null;
  failedLoginAttempts: number | null;
  lockedUntil: Date | null;
  emailVerified: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  nomeCompleto: string;
  role: string;
  tenantId?: string;
  status?: string;
}