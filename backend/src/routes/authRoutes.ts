import express from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();
const authController = new AuthController();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('phone').optional().isMobilePhone('any')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
  body('currentPassword').optional().notEmpty(),
  body('newPassword').optional().isLength({ min: 6 })
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', auth, authController.getProfile);
router.patch('/profile', auth, updateProfileValidation, authController.updateProfile);

export default router;