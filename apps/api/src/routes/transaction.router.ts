import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  transactionController.createTransaction,
);

router.get(
  "/",
  authenticate,
  authorize("ORGANIZER"),
  transactionController.getTransactions,
);
router.put(
  "/:id/accept",
  authenticate,
  authorize("ORGANIZER"),
  transactionController.acceptTransaction,
);
router.put(
  "/:id/reject",
  authenticate,
  authorize("ORGANIZER"),
  transactionController.rejectTransaction,
);
router.get(
  "/:id/payment-proof",
  authenticate,
  authorize("ORGANIZER"),
  transactionController.getPaymentProof,
);

export default router;
