import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createAccessRequest,
  getItemAccessRequests,
  getUserItemAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getRequestStatus
} from '../controllers/accessRequestController.js';

const router = express.Router();

router.use(protect);

router.post('/', createAccessRequest);

router.get('/my-items/requests', getUserItemAccessRequests);

router.get('/status/:itemId', getRequestStatus);

router.get('/item/:itemId', getItemAccessRequests);

router.put('/:requestId/approve', approveAccessRequest);

router.put('/:requestId/reject', rejectAccessRequest);

export default router;
