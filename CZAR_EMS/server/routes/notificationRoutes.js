const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controller/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications); // Get my notifications
router.put('/:id/read', verifyToken, markAsRead); // Mark specific as read
router.put('/mark-all-read', verifyToken, markAllAsRead); // Mark all user's notifications as read

module.exports = router;
