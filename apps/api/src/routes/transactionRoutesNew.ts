import express from 'express';
import { body } from 'express-validator';
import { 
  createTransaction, 
  getUserTransactions, 
  getTransactionById
} from '../controllers/transactionControllerNew';
import {
  uploadPaymentProof,
  cancelTransaction,
  confirmPayment
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const uploadMiddleware: any = upload.single('paymentProof');

const router = express.Router();

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create transaction
router.post('/', [
  authenticate,
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('ticketCount').isInt({ min: 1 }).withMessage('Ticket count must be a positive integer'),
  body('pointsUsed').optional().isInt({ min: 0 }).withMessage('Points used must be a non-negative integer'),
], validate, createTransaction);

// Get user transactions
router.get('/', authenticate, getUserTransactions);

// Get transaction by ID
router.get('/:id', authenticate, getTransactionById);

// Upload payment proof
router.post('/:transactionId/payment-proof', 
  authenticate,
  uploadMiddleware, 
  uploadPaymentProof
);

// Cancel transaction
router.patch('/:transactionId/cancel', authenticate, cancelTransaction);

// Organizer: Confirm or reject payment
router.patch('/:transactionId/confirm', [
  authenticate,
  body('action').isIn(['confirm', 'reject']).withMessage('Action must be confirm or reject')
], validate, confirmPayment);

export default router;
