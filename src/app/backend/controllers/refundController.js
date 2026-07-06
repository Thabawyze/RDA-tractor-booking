// controllers/refundController.js
const Booking = require('../models/Booking');
const RefundService = require('../services/refundService');

// Cancel booking with refund
exports.cancelBookingWithRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, cancelled_by = 'farmer' } = req.body;
    
    // Find the booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    // Check if refund already processed
    if (booking.refund_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Refund has already been processed for this booking'
      });
    }
    
    // Update booking with cancellation info
    booking.status = 'cancelled';
    booking.cancellation_reason = reason;
    booking.cancelled_by = cancelled_by;
    booking.updated_at = new Date();
    
    // Process refund
    const refundResult = await RefundService.processRefund(booking);
    
    if (refundResult.success) {
      // Update booking with refund info
      booking.refund_status = refundResult.status;
      booking.refund_amount = refundResult.amount;
      booking.refund_date = new Date();
      await booking.save();
      
      // Send notification
      await RefundService.sendRefundNotification(booking, refundResult);
      
      return res.status(200).json({
        success: true,
        message: refundResult.message,
        booking: {
          id: booking._id,
          status: booking.status,
          refund_status: booking.refund_status,
          refund_amount: booking.refund_amount,
          refund_date: booking.refund_date
        },
        refund: refundResult
      });
      
    } else {
      // If refund fails, mark as pending for manual processing
      booking.refund_status = 'pending';
      booking.refund_amount = booking.total_amount;
      await booking.save();
      
      // Notify admin about failed refund
      await notifyAdminAboutFailedRefund(booking, refundResult.message);
      
      return res.status(200).json({
        success: true,
        requires_approval: true,
        message: 'Booking cancelled but refund requires manual processing. You will be notified once processed.',
        booking: {
          id: booking._id,
          status: booking.status,
          refund_status: 'pending'
        }
      });
    }
    
  } catch (error) {
    console.error('Error in cancelBookingWithRefund:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process cancellation and refund',
      error: error.message
    });
  }
};

// Generate receipt
exports.generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id).populate('center_id');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Generate PDF receipt
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');
    
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${booking._id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    // Header
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .text('Tractor Hiring Service', { align: 'center' })
      .moveDown(0.5);
    
    doc.fontSize(16)
      .text('BOOKING RECEIPT', { align: 'center' })
      .moveDown(0.5);
    
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Receipt #: ${booking._id}`, { align: 'center' })
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(1);
    
    // Booking Details
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Booking Details', { underline: true })
      .moveDown(0.5);
    
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Farmer Name: ${booking.full_name}`)
      .text(`Contact Number: ${booking.contact_number}`)
      .text(`Email: ${booking.email || 'Not provided'}`)
      .text(`Service Date: ${new Date(booking.available_time).toLocaleDateString()}`)
      .text(`Hours Booked: ${booking.hours_booked} hours`)
      .text(`Location: ${booking.location_description}`)
      .text(`Payment Method: ${booking.payment_method}`)
      .moveDown(0.5);
    
    // Payment Summary
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Payment Summary', { underline: true })
      .moveDown(0.5);
    
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Hours: ${booking.hours_booked} @ E400/hour`, { continued: true })
      .text(`E${booking.hours_booked * 400}`, { align: 'right' })
      .moveDown(0.5);
    
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(`Total Amount:`, { continued: true })
      .text(`E${booking.total_amount}`, { align: 'right' })
      .moveDown(1);
    
    // Refund Information (if cancelled)
    if (booking.status === 'cancelled' && booking.refund_status === 'completed') {
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text('Refund Information', { underline: true })
        .moveDown(0.5);
      
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('black')
        .text(`Refund Status: ${booking.refund_status.toUpperCase()}`)
        .text(`Refund Amount: E${booking.refund_amount || booking.total_amount}`)
        .text(`Refund Date: ${new Date(booking.refund_date).toLocaleDateString()}`)
        .text(`Reason: ${booking.cancellation_reason || 'Cancelled by user'}`)
        .moveDown(1);
    }
    
    // Footer
    doc.fontSize(8)
      .fillColor('gray')
      .text('Thank you for choosing our service!', { align: 'center' })
      .text('For any queries, please contact support@tractorhire.com', { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
};

// Send refund notification
exports.sendRefundNotification = async (req, res) => {
  try {
    const { booking_id, refund_amount, refund_method, farmer_email, farmer_phone } = req.body;
    
    // Find booking to get more details
    const booking = await Booking.findById(booking_id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Prepare notification data
    const notificationData = {
      booking_id,
      refund_amount,
      refund_method,
      farmer_name: booking.full_name,
      farmer_email: farmer_email || booking.email,
      farmer_phone: farmer_phone || booking.contact_number,
      refund_date: new Date(),
      booking_details: {
        date: booking.available_time,
        hours: booking.hours_booked,
        location: booking.location_description
      }
    };
    
    // Send notifications via different channels
    const notifications = [];
    
    // Email notification
    if (notificationData.farmer_email) {
      notifications.push(
        RefundService.sendRefundEmail(booking, {
          amount: refund_amount,
          method: refund_method,
          status: 'completed',
          message: 'Your refund has been processed successfully'
        })
      );
    }
    
    // SMS notification
    if (notificationData.farmer_phone) {
      notifications.push(
        RefundService.sendRefundSMS(booking, {
          amount: refund_amount,
          method: refund_method,
          status: 'completed'
        })
      );
    }
    
    await Promise.all(notifications);
    
    return res.status(200).json({
      success: true,
      message: 'Refund notifications sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending refund notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send refund notification'
    });
  }
};

// Helper function to notify admin about failed refund
async function notifyAdminAboutFailedRefund(booking, errorMessage) {
  try {
    // You can implement this to send email to admin
    // or create a notification in the admin dashboard
    const adminNotification = {
      booking_id: booking._id,
      farmer_name: booking.full_name,
      amount: booking.total_amount,
      payment_method: booking.payment_method,
      error: errorMessage,
      timestamp: new Date()
    };
    
    // Save to admin notifications collection
    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      type: 'failed_refund',
      data: adminNotification,
      status: 'unread'
    });
    
    // Optionally send email to admin
    // await sendAdminEmail(adminNotification);
    
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}