import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get("/profile", authMiddleware, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

export default router;
