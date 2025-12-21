import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);

router.get('/unread/count', getUnreadCount);

router.put('/:notificationId/read', markAsRead);

router.put('/read/all', markAllAsRead);

router.delete('/:notificationId', deleteNotification);

export default router;
