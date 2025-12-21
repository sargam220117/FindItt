import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkChatAccess } from '../middleware/chatMiddleware.js';
import { 
  getMessages,
  createMessage,
  markMessagesAsRead,
  getUnreadCount,
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/unread', protect, getUnreadCount);

router.route('/:responseId')
  .get(protect, checkChatAccess, getMessages)
  .post(protect, checkChatAccess, createMessage);

router.route('/:responseId/read')
  .put(protect, checkChatAccess, markMessagesAsRead);

export default router;