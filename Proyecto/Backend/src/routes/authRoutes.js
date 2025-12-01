const express = require('express');
const { login, register } = require('../controllers/authController');
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get("/profile", authMiddleware, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

module.exports = router;
