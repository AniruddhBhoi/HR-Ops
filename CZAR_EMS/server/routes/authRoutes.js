const express = require('express');
const {
  register,
  login,
  adminLogin,
  changePassword,
  confirmPasswordChange,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controller/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/confirm-password-change', verifyToken, confirmPasswordChange);

module.exports = router;
