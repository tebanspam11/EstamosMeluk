import { Router } from 'express';
import { requestPasswordReset, verifyResetCode, resetPassword } from '../controllers/passwordResetController.js';

const router = Router();

router.post('/request-reset', requestPasswordReset);
router.post('/verify-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;
