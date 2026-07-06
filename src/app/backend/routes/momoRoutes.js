// routes/momoRoutes.js
const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momoController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// User routes
router.post('/initiate', authenticateToken, momoController.initiatePayment);
router.post('/verify-otp', authenticateToken, momoController.verifyOTP);
router.post('/:referenceId/complete', authenticateToken, momoController.completePayment);
router.get('/status/:referenceId', authenticateToken, momoController.checkPaymentStatus);
router.post('/:referenceId/cancel', authenticateToken, momoController.cancelPayment);
router.get('/booking/:bookingId', authenticateToken, momoController.getPaymentByBooking);

// Admin routes
router.get('/admin/pending', authenticateToken, requireAdmin, momoController.getPendingPayments);
router.post('/admin/:referenceId/complete', authenticateToken, requireAdmin, momoController.adminCompletePayment);

module.exports = router;