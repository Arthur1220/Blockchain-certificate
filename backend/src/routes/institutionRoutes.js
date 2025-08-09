import { Router } from 'express';
import * as institutionController from '../controllers/institutionController.js';
import { protect } from '../middlewares/protect.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import institutionValidator from '../validators/institutionValidator.js';
import courseRoutes from './courseRoutes.js';

const router = Router();

router.use(protect);

// Aninha as rotas de curso
router.use('/:institutionId/courses', courseRoutes);

// Rotas da própria Instituição
router
  .route('/')
  .post(authorize('ADMIN'), validate(institutionValidator.createInstitutionSchema), institutionController.create)
  .get(authorize('ADMIN'), institutionController.getAll);

router
  .route('/:id')
  .get(authorize('ADMIN', 'STAFF'), validate(institutionValidator.idParamSchema), institutionController.getById)
  .patch(authorize('ADMIN', 'STAFF'), validate(institutionValidator.updateInstitutionSchema), institutionController.update)
  .delete(authorize('ADMIN'), validate(institutionValidator.idParamSchema), institutionController.remove);

export default router;