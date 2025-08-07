import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import institutionRoutes from './institutionRoutes.js';
import certificateRoutes from './certificateRoutes.js';

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
// Importa as rotas de instituições
// (por exemplo, criação, atualização, listagem)
router.use('/institutions', institutionRoutes);
// Importa as rotas de certificados
// (por exemplo, listagem, criação, atualização)
router.use('/certificates', certificateRoutes);

export default router;