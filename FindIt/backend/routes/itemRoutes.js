import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItemStatus,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import {
  createResponse,
  getItemResponses,
} from '../controllers/responseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createItem)
  .get(getItems);

router.get('/myitems', protect, getMyItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

router.put('/:id/status', protect, updateItemStatus);

router.route('/:id/responses')
  .post(protect, createResponse)
  .get(protect, getItemResponses);

export default router;