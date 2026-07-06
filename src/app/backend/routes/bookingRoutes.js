// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const refundController = require('../controllers/refundController');

// Cancel booking with refund
router.post(
  '/bookings/:id/cancel-with-refund',
  authMiddleware,
  refundController.cancelBookingWithRefund
);

// Generate receipt
router.post(
  '/bookings/:id/generate-receipt',
  authMiddleware,
  refundController.generateReceipt
);

// Send refund notification
router.post(
  '/notifications/send-refund-notification',
  authMiddleware,
  refundController.sendRefundNotification
);

module.exports = router;