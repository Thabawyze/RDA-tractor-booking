// services/momoService.js
const crypto = require('crypto');

class MoMoService {
  constructor() {
    this.payments = new Map(); // Store pending payments
    this.MOCK_MOMO_ENABLED = process.env.MOCK_MOMO_ENABLED === 'true';
    this.MOCK_MOMO_AUTO_APPROVE = process.env.MOCK_MOMO_AUTO_APPROVE === 'true';
    this.PAYMENT_TIMEOUT = parseInt(process.env.MOMO_PAYMENT_TIMEOUT) || 300000;
  }

  // Generate UUID for transaction
  generateUUID() {
    return crypto.randomUUID();
  }

  // Format phone number
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('268')) {
      return cleaned;
    }
    return `268${cleaned}`;
  }

  // Validate phone number (Eswatini format)
  validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^(76|78)\d{6}$/.test(cleaned) || /^268(76|78)\d{6}$/.test(cleaned);
  }

  // Format phone for display
  formatPhoneForDisplay(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('268')) {
      const number = cleaned.slice(3);
      return `+268 ${number.slice(0, 4)} ${number.slice(4)}`;
    }
    return phoneNumber;
  }

  // Generate a random 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Initiate payment
  async initiatePayment(amount, phoneNumber, externalId, payerNote = 'Tractor booking payment') {
    try {
      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please use 76XXXXXX or 78XXXXXX'
        };
      }

      const referenceId = this.generateUUID();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const otp = this.generateOTP();
      const expiresAt = Date.now() + this.PAYMENT_TIMEOUT;

      // Store payment in memory
      const paymentData = {
        referenceId,
        amount,
        phoneNumber: formattedPhone,
        externalId,
        note: payerNote,
        status: 'PENDING',
        otp,
        otpVerified: false,
        createdAt: Date.now(),
        expiresAt,
        attempts: 0,
        transactionId: null
      };

      this.payments.set(referenceId, paymentData);

      console.log('\n📱 === MOCK MoMo PAYMENT INITIATED ===');
      console.log(`Reference ID: ${referenceId}`);
      console.log(`Amount: E${amount}`);
      console.log(`Phone: +268 ${this.formatPhoneForDisplay(phoneNumber)}`);
      console.log(`OTP Code: ${otp} (use this to simulate payment)`);
      console.log(`Expires: ${new Date(expiresAt).toLocaleString()}`);
      console.log('=====================================\n');

      // If auto-approve is enabled, automatically complete the payment
      if (this.MOCK_MOMO_AUTO_APPROVE) {
        setTimeout(() => {
          this.completePayment(referenceId);
        }, 5000);
      }

      return {
        success: true,
        referenceId,
        status: 'PENDING',
        message: 'Payment request sent. Please check your phone for OTP.',
        otpRequired: true,
        expiresAt
      };

    } catch (error) {
      console.error('❌ Mock MoMo payment initiation error:', error);
      return {
        success: false,
        error: 'Failed to initiate payment'
      };
    }
  }

  // Verify OTP
  async verifyOTP(referenceId, otp) {
    try {
      const payment = this.payments.get(referenceId);

      if (!payment) {
        return {
          success: false,
          error: 'Payment reference not found'
        };
      }

      if (payment.status !== 'PENDING') {
        return {
          success: false,
          error: `Payment is already ${payment.status.toLowerCase()}`
        };
      }

      if (Date.now() > payment.expiresAt) {
        payment.status = 'EXPIRED';
        this.payments.set(referenceId, payment);
        return {
          success: false,
          error: 'OTP has expired. Please initiate a new payment.'
        };
      }

      payment.attempts += 1;

      if (payment.attempts > 3) {
        payment.status = 'FAILED';
        this.payments.set(referenceId, payment);
        return {
          success: false,
          error: 'Too many failed attempts. Payment cancelled.'
        };
      }

      // Check if OTP matches
      if (payment.otp !== otp) {
        return {
          success: false,
          error: 'Invalid OTP. Please try again.',
          attemptsLeft: 3 - payment.attempts
        };
      }

      // OTP verified successfully
      payment.otpVerified = true;
      payment.status = 'VERIFIED';
      this.payments.set(referenceId, payment);

      console.log(`\n✅ OTP Verified for payment ${referenceId}\n`);

      return {
        success: true,
        message: 'OTP verified successfully. Processing payment...'
      };

    } catch (error) {
      console.error('❌ OTP verification error:', error);
      return {
        success: false,
        error: 'Failed to verify OTP'
      };
    }
  }

  // Complete payment (after OTP verification)
  async completePayment(referenceId) {
    try {
      const payment = this.payments.get(referenceId);

      if (!payment) {
        return {
          success: false,
          error: 'Payment reference not found'
        };
      }

      if (payment.status === 'VERIFIED' || this.MOCK_MOMO_AUTO_APPROVE) {
        payment.status = 'SUCCESSFUL';
        payment.transactionId = this.generateUUID();
        payment.completedAt = Date.now();
        this.payments.set(referenceId, payment);

        console.log(`\n💰 Payment SUCCESSFUL for ${referenceId}`);
        console.log(`Amount: E${payment.amount}`);
        console.log(`Transaction ID: ${payment.transactionId}\n`);

        return {
          success: true,
          status: 'SUCCESSFUL',
          transactionId: payment.transactionId,
          message: 'Payment completed successfully'
        };
      } else {
        return {
          success: false,
          error: 'Payment cannot be completed. OTP not verified.'
        };
      }

    } catch (error) {
      console.error('❌ Payment completion error:', error);
      return {
        success: false,
        error: 'Failed to complete payment'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(referenceId) {
    try {
      const payment = this.payments.get(referenceId);

      if (!payment) {
        return {
          success: false,
          error: 'Payment reference not found'
        };
      }

      // Check if payment has expired
      if (payment.status === 'PENDING' && Date.now() > payment.expiresAt) {
        payment.status = 'EXPIRED';
        this.payments.set(referenceId, payment);
      }

      return {
        success: true,
        status: payment.status,
        data: {
          referenceId: payment.referenceId,
          amount: payment.amount,
          phoneNumber: this.formatPhoneForDisplay(payment.phoneNumber),
          externalId: payment.externalId,
          transactionId: payment.transactionId,
          otpVerified: payment.otpVerified,
          createdAt: payment.createdAt,
          expiresAt: payment.expiresAt,
          completedAt: payment.completedAt
        }
      };

    } catch (error) {
      console.error('❌ Status check error:', error);
      return {
        success: false,
        error: 'Failed to check payment status'
      };
    }
  }

  // Cancel payment
  async cancelPayment(referenceId) {
    try {
      const payment = this.payments.get(referenceId);

      if (!payment) {
        return {
          success: false,
          error: 'Payment reference not found'
        };
      }

      if (payment.status === 'PENDING' || payment.status === 'VERIFIED') {
        payment.status = 'CANCELLED';
        payment.cancelledAt = Date.now();
        this.payments.set(referenceId, payment);

        console.log(`\n❌ Payment CANCELLED for ${referenceId}\n`);

        return {
          success: true,
          message: 'Payment cancelled successfully'
        };
      } else {
        return {
          success: false,
          error: `Cannot cancel payment with status: ${payment.status}`
        };
      }

    } catch (error) {
      console.error('❌ Payment cancellation error:', error);
      return {
        success: false,
        error: 'Failed to cancel payment'
      };
    }
  }

  // Get all pending payments (admin only)
  async getPendingPayments() {
    const pending = [];
    for (const [refId, payment] of this.payments.entries()) {
      if (payment.status === 'PENDING' || payment.status === 'VERIFIED') {
        pending.push({
          referenceId: refId,
          ...payment
        });
      }
    }
    return pending;
  }

  // Clean up expired payments (run periodically)
  cleanupExpiredPayments() {
    const now = Date.now();
    let cleaned = 0;
    for (const [refId, payment] of this.payments.entries()) {
      if (payment.status === 'PENDING' && now > payment.expiresAt) {
        payment.status = 'EXPIRED';
        this.payments.set(refId, payment);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired payments`);
    }
  }
}

module.exports = new MoMoService();