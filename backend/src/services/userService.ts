import db from '../config/database.js';
import { User, CreateUserData } from '../types/auth.js';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async findById(id: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    return user || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userData.email, userData.password, userData.name, userData.role, now, now);

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
    
    const stmt = db.prepare(`
      UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?
    `);

    stmt.run(...values, now, id);

    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async findAll(): Promise<User[]> {
    const stmt = db.prepare('SELECT id, email, name, role, createdAt, updatedAt FROM users');
    return stmt.all() as User[];
  }

  async delete(id: string): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userService = new UserService();