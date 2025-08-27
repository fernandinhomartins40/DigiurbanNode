import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

export const userRoutes = Router();

userRoutes.use(authenticateToken);

userRoutes.get('/profile', userController.getProfile);
userRoutes.put('/profile', userController.updateProfile);
userRoutes.get('/list', userController.listUsers);
userRoutes.post('/create', userController.createUser);