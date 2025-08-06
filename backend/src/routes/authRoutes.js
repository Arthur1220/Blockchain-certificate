import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

// Rota de login (pública)
// Rota de refresh token (pública)
// Rota de logout (pública)
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;