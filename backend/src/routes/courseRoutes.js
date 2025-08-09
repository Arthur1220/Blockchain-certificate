import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { validate } from '../middlewares/validate.js';
import courseValidator from '../validators/courseValidator.js';
import { authorize } from '../middlewares/authorize.js'; // Importa authorize
import { protect } from '../middlewares/protect.js'; // Importa protect


const router = Router({ mergeParams: true });

// Todas as rotas de curso precisam de autenticação
router.use(protect, authorize('ADMIN', 'STAFF'));

// Rotas para criar e listar cursos
router.route('/')
  .post(validate(courseValidator.createCourseSchema), courseController.create)
  .get(courseController.getAll);

// Rotas para atualizar e deletar um curso específico
router.route('/:courseId')
  .patch(validate(courseValidator.updateCourseSchema), courseController.update)
  .delete(validate(courseValidator.courseParamsSchema), courseController.remove); // courseParamsSchema valida ambos os IDs
      
export default router;