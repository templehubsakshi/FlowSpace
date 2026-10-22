const express = require('express');
const {
  getNotifications, getUnreadCount, markAsRead, markAllAsRead,
  deleteNotification, clearAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middelware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// FIX: static paths MUST be registered before '/:id' routes. Before, PATCH
// /mark-all-read matched '/:id' first (id = "mark-all-read"), the ObjectId cast
// failed and "Mark all as read" always returned 500.
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id', markAsRead);

router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router;
