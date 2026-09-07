const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.route('/users')
  .get(protect, adminOnly, getUsers);

router.route('/users/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
