const express=require('express');
const {getNotifications,getUnreadCount,markAsRead,markAllAsRead,deleteNotification,clearAllNotifications}=require('../controllers/notificationController');
const {protect}=require('../middelware/auth');

const router=express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router