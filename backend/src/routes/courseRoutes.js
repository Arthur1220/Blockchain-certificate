import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { validate } from '../middlewares/validate.js';
import courseValidator from '../validators/courseValidator.js';

// A opção { mergeParams: true } permite que este roteador acesse os parâmetros da rota pai (ex: :institutionId)
const router = Router({ mergeParams: true });

// Rotas para criar e listar cursos
router.route('/')
  .post(validate(courseValidator.createCourseSchema), courseController.create)
  .get(courseController.getAll);

// Rotas para atualizar e deletar um curso específico
router.route('/:courseId')
  .patch(validate(courseValidator.updateCourseSchema), courseController.update)
  .delete(courseController.remove);

export default router;