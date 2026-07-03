// models/Payment.js
const pool = require('../config/db');

class Payment {
  // Create a new payment record
  static async create(paymentData) {
    const {
      booking_id,
      amount,
      phone_number,
      momo_reference,
      transaction_id,
      status = 'pending',
      payment_method = 'momo',
      expires_at
    } = paymentData;

    const query = `
      INSERT INTO payments (
        booking_id, amount, phone_number, momo_reference, 
        transaction_id, status, payment_method, expires_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [booking_id, amount, phone_number, momo_reference, transaction_id, status, payment_method, expires_at];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(referenceId, status, transactionId = null) {
    const query = `
      UPDATE payments 
      SET status = $1, 
          transaction_id = COALESCE($2, transaction_id),
          payment_date = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE payment_date END,
          updated_at = CURRENT_TIMESTAMP
      WHERE momo_reference = $3
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, transactionId, referenceId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw error;
    }
  }

  // Get payment by booking ID
  static async getByBookingId(bookingId) {
    const query = 'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [bookingId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching payment:', error);
      throw error;
    }
  }

  // Get payment by reference ID
  static async getByReference(referenceId) {
    const query = 'SELECT * FROM payments WHERE momo_reference = $1';
    
    try {
      const result = await pool.query(query, [referenceId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error fetching payment:', error);
      throw error;
    }
  }

  // Update booking payment status
  static async updateBookingPaymentStatus(bookingId, status) {
    const query = `
      UPDATE bookings 
      SET payment_status = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, bookingId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating booking payment status:', error);
      throw error;
    }
  }
}

module.exports = Payment;