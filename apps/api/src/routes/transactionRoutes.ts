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
import { validate } from '../middleware/validation';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const uploadMiddleware = upload.single('paymentProof');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create transaction (ticket purchase)
router.post('/', [
  body('eventId').isString().notEmpty().withMessage('Event ID is required'),
  body('ticketCount').isInt({ min: 1 }).withMessage('Ticket count must be at least 1'),
  body('voucherCodes').optional().isArray(),
  body('couponCodes').optional().isArray(),
  body('pointsUsed').optional().isInt({ min: 0 }).withMessage('Points used must be non-negative'),
  body('referralCode').optional().isString()
], validate, createTransaction);

// Upload payment proof
router.post('/:transactionId/payment-proof', 
  uploadMiddleware, 
  uploadPaymentProof
);

// Get user transactions
router.get('/my-transactions', getUserTransactions);

// Get transaction by ID
router.get('/:transactionId', getTransactionById);

// Cancel transaction
router.patch('/:transactionId/cancel', cancelTransaction);

// Organizer: Confirm or reject payment
router.patch('/:transactionId/confirm', [
  body('action').isIn(['confirm', 'reject']).withMessage('Action must be confirm or reject')
], validate, confirmPayment);

export default router;