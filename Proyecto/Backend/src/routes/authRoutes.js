import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { login, register, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/profile', verificarToken, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

export default router;
