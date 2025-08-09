import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import userValidator from '../validators/userValidator.js'; // Usando a exportação padrão
import { protect } from '../middlewares/protect.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// --- Rotas Públicas ---
router.post('/register', validate(userValidator.registerSchema), userController.register);

// --- A partir daqui, todas as rotas exigem autenticação ---
router.use(protect);

// --- Rotas Específicas (vêm antes das genéricas) ---
router.get('/profile/me', userController.getMe);

// --- Rotas para Usuários em Geral (com permissões) ---
router.get('/', authorize('ADMIN'), userController.getAll);

// --- Rotas Genéricas com :id (vêm por último) ---
router
  .route('/:id')
  .get(validate(userValidator.idParamSchema), userController.getById) // Valida o ID
  .patch(validate(userValidator.updateUserSchema), userController.update) // Valida ID + body
  .delete(validate(userValidator.idParamSchema), authorize('ADMIN'), userController.remove); // Valida o ID

export default router;