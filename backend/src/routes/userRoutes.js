import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import userValidator from '../validators/userValidator.js';
import { protect } from '../middlewares/protect.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// CREATE
// Rota de registro de usuário (pública)
router.post('/register', validate(userValidator.registerSchema), userController.register);

// UPDATE
// Rota de atualização de usuário (protegida, qualquer usuário autenticado)
router.patch('/:id', protect, validate(userValidator.updateSchema), userController.update);

// READ
// Rota de listagem de todos os usuários (protegida, apenas ADMIN)
router.get('/', protect, authorize('ADMIN'), userController.getAll);
// Rota de obtenção do perfil do usuário autenticado (protegida, qualquer usuário autenticado)
router.get('/profile/me', protect, userController.getMe);
// Rota de obtenção de um usuário por ID (protegida, qualquer usuário autenticado)
router.get('/:id', protect, userController.getById);

// DELETE
// Rota de remoção de usuário (protegida, apenas ADMIN)
router.delete('/:id', protect, authorize('ADMIN'), userController.remove);

export default router;