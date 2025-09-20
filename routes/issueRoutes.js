import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  submitIssue,
  getAllIssues,
  getMyIssues,
  getAssignedIssues,
  getCompletedIssues,
  completeIssue,
} from '../controller/issueController.js';

const router = express.Router();

router.post('/submit', protect, upload.single('image'), submitIssue);
router.get('/all', protect, getAllIssues);
router.get('/my', protect, getMyIssues);
router.get('/assigned', protect, getAssignedIssues);
router.get('/completed', protect, getCompletedIssues);
router.post('/complete', protect, upload.single('image'), completeIssue);

export default router;
