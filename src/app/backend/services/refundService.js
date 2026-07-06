// services/refundService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

class RefundService {
  // Process refund based on payment method
  async processRefund(booking, options = {}) {
    const { payment_method, total_amount, id: bookingId } = booking;
    
    try {
      let refundResult;
      
      switch(payment_method?.toLowerCase()) {
        case 'credit card':
        case 'card':
          refundResult = await this.processCardRefund(booking, options);
          break;
          
        case 'mobile money':
        case 'momo':
          refundResult = await this.processMobileMoneyRefund(booking, options);
          break;
          
        case 'bank transfer':
          refundResult = await this.processBankTransferRefund(booking, options);
          break;
          
        case 'cash':
          refundResult = await this.processCashRefund(booking, options);
          break;
          
        default:
          refundResult = {
            success: false,
            message: 'Unsupported payment method for automatic refund'
          };
      }
      
      return refundResult;
      
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process refund'
      };
    }
  }
  
  // Process credit card refund via Stripe
  async processCardRefund(booking, options) {
    try {
      // Assuming you stored payment_intent_id during initial payment
      const paymentIntentId = booking.payment_intent_id;
      
      if (!paymentIntentId) {
        return {
          success: false,
          message: 'No payment intent found for this booking'
        };
      }
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(booking.total_amount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          booking_id: booking.id,
          customer_name: booking.full_name,
          cancellation_reason: booking.cancellation_reason
        }
      });
      
      return {
        success: true,
        refund_id: refund.id,
        amount: booking.total_amount,
        method: 'Credit Card',
        status: 'completed',
        message: 'Refund processed successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Process Mobile Money refund (example with MTN MoMo API)
  async processMobileMoneyRefund(booking, options) {
    try {
      // This is a placeholder - implement based on your mobile money provider
      const momoApiUrl = process.env.MOMO_API_URL;
      const momoApiKey = process.env.MOMO_API_KEY;
      
      const response = await axios.post(
        `${momoApiUrl}/v1/refund`,
        {
          transaction_id: booking.momo_transaction_id,
          amount: booking.total_amount,
          reason: booking.cancellation_reason,
          refund_type: 'full'
        },
        {
          headers: {
            'Authorization': `Bearer ${momoApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          refund_id: response.data.refund_id,
          amount: booking.total_amount,
          method: 'Mobile Money',
          status: 'completed',
          message: 'Mobile money refund initiated'
        };
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to process mobile money refund'
      };
    }
  }
  
  // Process Bank Transfer refund
  async processBankTransferRefund(booking, options) {
    try {
      // Mark as pending for manual processing
      return {
        success: true,
        refund_id: null,
        amount: booking.total_amount,
        method: 'Bank Transfer',
        status: 'pending',
        requires_manual: true,
        message: 'Refund requires manual processing and will be completed within 5-7 business days'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Process Cash refund
  async processCashRefund(booking, options) {
    try {
      // Mark as pending for manual processing
      return {
        success: true,
        refund_id: null,
        amount: booking.total_amount,
        method: 'Cash',
        status: 'pending',
        requires_manual: true,
        message: 'Please visit the center to collect your cash refund'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Send refund notification
  async sendRefundNotification(booking, refundResult) {
    try {
      // Email notification
      if (booking.email) {
        await this.sendRefundEmail(booking, refundResult);
      }
      
      // SMS notification
      if (booking.contact_number) {
        await this.sendRefundSMS(booking, refundResult);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to send refund notification:', error);
      return false;
    }
  }
  
  async sendRefundEmail(booking, refundResult) {
    // Implement email sending logic
    // You can use nodemailer, sendgrid, etc.
    const emailService = require('./emailService');
    
    await emailService.send({
      to: booking.email,
      subject: `Refund Processed for Booking #${booking.id}`,
      template: 'refund-notification',
      data: {
        booking_id: booking.id,
        amount: refundResult.amount,
        method: refundResult.method,
        status: refundResult.status,
        message: refundResult.message,
        date: new Date().toLocaleDateString()
      }
    });
  }
  
  async sendRefundSMS(booking, refundResult) {
    // Implement SMS sending logic
    // You can use Twilio, Africa's Talking, etc.
    const smsService = require('./smsService');
    
    await smsService.send({
      to: booking.contact_number,
      message: `Your refund of E${refundResult.amount} for booking #${booking.id} has been processed. Status: ${refundResult.status}. ${refundResult.message}`
    });
  }
}

module.exports = new RefundService();