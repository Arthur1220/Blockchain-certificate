import { Router } from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { protect } from '../middlewares/protect.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import certificateValidator from '../validators/certificateValidator.js';

const router = Router();

// Todas as rotas de certificados requerem login
router.use(protect);

// Rota para listar certificados (lógica de permissão está no serviço)
router.get('/', certificateController.getAll);

// Rota para emitir um novo certificado (apenas STAFF e ADMIN)
router.post(
  '/',
  authorize('ADMIN', 'STAFF'),
  validate(certificateValidator.issueCertificateSchema),
  certificateController.issue
);

// Rota para atualizar o status de um certificado (apenas STAFF e ADMIN)
router.patch(
  '/:id/status',
  authorize('ADMIN', 'STAFF'),
  validate(certificateValidator.updateCertificateStatusSchema),
  certificateController.updateStatus
);

export default router;