import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 5), (req, res) => {
  try {
    const files = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
    res.json(files);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;