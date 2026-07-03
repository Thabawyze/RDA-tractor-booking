// controllers/momoController.js
const momoService = require('../services/momoService');
const Payment = require('../models/Payment');
const pool = require('../config/db');

// Initiate MoMo payment
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!bookingId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID and phone number are required'
      });
    }

    // Validate phone number format
    if (!momoService.validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number. Please enter 76XXXXXX or 78XXXXXX'
      });
    }

    // Get booking details
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const bookingData = booking.rows[0];

    // Check if booking already has a successful payment
    const existingPayment = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 AND status = $2',
      [bookingId, 'completed']
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This booking has already been paid'
      });
    }

    // Initiate payment with custom MoMo service
    const paymentResult = await momoService.initiatePayment(
      bookingData.total_amount,
      phoneNumber,
      bookingId,
      `Payment for tractor booking #${bookingId}`
    );

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        error: paymentResult.error || 'Failed to initiate payment'
      });
    }

    // Save payment record to database
    const payment = await Payment.create({
      booking_id: bookingId,
      amount: bookingData.total_amount,
      phone_number: phoneNumber,
      momo_reference: paymentResult.referenceId,
      status: 'pending',
      expires_at: new Date(paymentResult.expiresAt).toISOString()
    });

    res.json({
      success: true,
      message: 'Payment initiated successfully. Please check your phone for OTP.',
      data: {
        referenceId: paymentResult.referenceId,
        status: payment.status,
        paymentId: payment.id,
        otpRequired: true,
        expiresAt: paymentResult.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while initiating payment'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { referenceId, otp } = req.body;

    if (!referenceId || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Reference ID and OTP are required'
      });
    }

    const result = await momoService.verifyOTP(referenceId, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        attemptsLeft: result.attemptsLeft
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying OTP'
    });
  }
};

// Complete payment (after OTP verification)
exports.completePayment = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const result = await momoService.completePayment(referenceId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Update payment status in database
    const payment = await Payment.getByReference(referenceId);
    if (payment) {
      await Payment.updateStatus(referenceId, 'completed', result.transactionId);
      await Payment.updateBookingPaymentStatus(payment.booking_id, 'paid');
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        transactionId: result.transactionId,
        status: result.status
      }
    });

  } catch (error) {
    console.error('❌ Payment completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while completing payment'
    });
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        error: 'Reference ID is required'
      });
    }

    const result = await momoService.checkPaymentStatus(referenceId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    // Update database if status changed
    if (result.data.status === 'SUCCESSFUL') {
      const payment = await Payment.getByReference(referenceId);
      if (payment && payment.status !== 'completed') {
        await Payment.updateStatus(referenceId, 'completed', result.data.transactionId);
        await Payment.updateBookingPaymentStatus(payment.booking_id, 'paid');
      }
    } else if (result.data.status === 'FAILED' || result.data.status === 'EXPIRED') {
      await Payment.updateStatus(referenceId, 'failed');
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking payment status'
    });
  }
};

// Cancel payment
exports.cancelPayment = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const result = await momoService.cancelPayment(referenceId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    await Payment.updateStatus(referenceId, 'cancelled');

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Payment cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling payment'
    });
  }
};

// Get payment details by booking ID
exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payments = await Payment.getByBookingId(bookingId);

    // Enhance with mock service data if available
    const enhancedPayments = await Promise.all(payments.map(async (payment) => {
      if (payment.momo_reference) {
        const status = await momoService.checkPaymentStatus(payment.momo_reference);
        return {
          ...payment,
          mockDetails: status.success ? status.data : null
        };
      }
      return payment;
    }));

    res.json({
      success: true,
      data: enhancedPayments
    });

  } catch (error) {
    console.error('❌ Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching payment details'
    });
  }
};

// Admin: Get all pending payments
exports.getPendingPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const pending = await momoService.getPendingPayments();

    res.json({
      success: true,
      data: pending
    });

  } catch (error) {
    console.error('❌ Get pending payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching pending payments'
    });
  }
};

// Admin: Manually complete a payment
exports.adminCompletePayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { referenceId } = req.params;

    const result = await momoService.completePayment(referenceId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    const payment = await Payment.getByReference(referenceId);
    if (payment) {
      await Payment.updateStatus(referenceId, 'completed', result.transactionId);
      await Payment.updateBookingPaymentStatus(payment.booking_id, 'paid');
    }

    res.json({
      success: true,
      message: 'Payment manually completed by admin'
    });

  } catch (error) {
    console.error('❌ Admin payment completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while completing payment'
    });
  }
};