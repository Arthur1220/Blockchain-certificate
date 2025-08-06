import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Rota de "health check" para saber se a API está no ar
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API do Certificate Blockchain System está no ar!' });
});

// Importa as rotas de usuário
// (por exemplo, registro, atualização, listagem)
router.use('/users', userRoutes);
// Importa as rotas de autenticação
// (por exemplo, login, logout, refresh token)
router.use('/auth', authRoutes);

export default router;