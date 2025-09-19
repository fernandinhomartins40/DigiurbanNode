import { prisma } from "../database/prisma.js";
import { User, CreateUserData } from '../types/auth.js';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const user = await queryOne(sql, [id]) as User | null;
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const user = await queryOne(sql, [email]) as User | null;
    return user;
  }

  async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const sql = `
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await execute(sql, [id, userData.email, userData.password, userData.name, userData.role, now, now]);

    return {
      id,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      createdAt: now,
      updatedAt: now
    };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const now = new Date();
    const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt');
    const values = fields.map(field => data[field as keyof User]);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const sql = `
      UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?
    `;

    await execute(sql, [...values, now, id]);

    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async findAll(): Promise<User[]> {
    const sql = 'SELECT id, email, name, role, createdAt, updatedAt FROM users';
    return await query(sql) as User[];
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await execute(sql, [id]);
    return (result as any).changes > 0;
  }
}

export const userService = new UserService();