import { Router } from 'express';
import * as institutionController from '../controllers/institutionController.js';
import { protect } from '../middlewares/protect.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import institutionValidator from '../validators/institutionValidator.js';
import courseRoutes from './courseRoutes.js';

const router = Router();

// Middleware de proteção para todas as rotas de instituição
router.use(protect);

// Aninha as rotas de curso DENTRO das rotas de instituição
// Isso cria os endpoints /api/institutions/:institutionId/courses
router.use('/:institutionId/courses', authorize('ADMIN', 'STAFF'), courseRoutes);

// Rotas que são exclusivamente para ADMINS
//CREATE
// Rota de criação de instituição (protegida, apenas ADMIN)
router.post('/', authorize('ADMIN'), validate(institutionValidator.createInstitutionSchema), institutionController.create);
// READ
// Rota de listagem de instituições (protegida, apenas ADMIN)
router.get('/', authorize('ADMIN'), institutionController.getAll);
// DELETE
// Rota de remoção de instituição (protegida, apenas ADMIN)
router.delete('/:id', authorize('ADMIN'), institutionController.remove);

// Rotas que podem ser acessadas por ADMIN ou STAFF
// READ
// Rota de obtenção de uma instituição por ID (protegida, apenas ADMIN ou STAFF)
router.get('/:id', authorize('ADMIN', 'STAFF'), institutionController.getById);
// UPDATE
// Rota de atualização de instituição (protegida, apenas ADMIN ou STAFF)
router.patch('/:id', authorize('ADMIN', 'STAFF'), validate(institutionValidator.updateInstitutionSchema), institutionController.update);

export default router;