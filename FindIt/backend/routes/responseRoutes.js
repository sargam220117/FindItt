import express from 'express';
import {
  getMyResponses,
  updateResponseStatus,
} from '../controllers/responseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyResponses);
router.put('/:id', protect, updateResponseStatus);

export default router;