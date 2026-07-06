// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const twilio = require('twilio');
const router = express.Router();

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/proofs';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://172.16.18.254:3000','http://192.168.217.81:3000','http://192.168.186.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database configuration
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rdaDB',
  password: process.env.DB_PASSWORD || '11111111',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
    }
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tractor-ease-secret-key-2024';

// Import required modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// // In-memory OTP storage
// const otpStore = new Map();

// // Generate 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Send real SMS to Eswatini number
// async function sendRealSMS(phoneNumber, otp) {
//   try {
//     // Format the number (remove any non-digits)
//     const cleanNumber = phoneNumber.replace(/\D/g, '');
//     const internationalNumber = `+268${cleanNumber}`;
    
//     console.log(`📤 Sending SMS to: ${internationalNumber}`);
//     console.log(`🔑 OTP: ${otp}`);
    
//     const message = await client.messages.create({
//       body: `🔐 RDA Tractor Services\nYour verification code is: ${otp}\nValid for 5 minutes.\nDo not share this code.`,
//       to: internationalNumber,
//       from: process.env.TWILIO_PHONE_NUMBER
//     });
    
//     console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
//     return { success: true, sid: message.sid };
//   } catch (error) {
//     console.error('❌ Failed to send SMS:', error);
//     return { success: false, error: error.message };
//   }
// }

// // Initiate payment and send OTP
// router.post('/momo/initiate', async (req, res) => {
//   try {
//     const { bookingId, phoneNumber } = req.body;
    
//     console.log(`📱 Initiating payment for booking ${bookingId}, phone: ${phoneNumber}`);
    
//     if (!phoneNumber || !bookingId) {
//       return res.status(400).json({ error: 'Phone number and booking ID required' });
//     }
    
//     // Clean phone number
//     const cleanNumber = phoneNumber.replace(/\D/g, '');
    
//     // Validate Eswatini phone number
//     if (!/^(76|78)\d{6}$/.test(cleanNumber)) {
//       return res.status(400).json({ error: 'Invalid phone number. Use format: 76XXXXXX or 78XXXXXX' });
//     }
    
//     // Generate reference ID and OTP
//     const referenceId = crypto.randomBytes(16).toString('hex');
//     const otp = generateOTP();
    
//     console.log(`🎲 Generated OTP: ${otp} for number: ${cleanNumber}`);
    
//     // Store OTP
//     otpStore.set(referenceId, {
//       otp,
//       phoneNumber: cleanNumber,
//       bookingId,
//       attempts: 0,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 5 * 60 * 1000
//     });
    
//     // Send REAL SMS
//     const smsResult = await sendRealSMS(cleanNumber, otp);
    
//     if (!smsResult.success) {
//       return res.status(500).json({ 
//         error: 'Failed to send OTP. Please check your number and try again.',
//         details: smsResult.error
//       });
//     }
    
//     res.json({
//       success: true,
//       data: {
//         referenceId,
//         message: 'OTP sent successfully to your phone'
//       }
//     });
    
//   } catch (error) {
//     console.error('Initiate error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Verify OTP
// router.post('/momo/verify-otp', async (req, res) => {
//   try {
//     const { referenceId, otp } = req.body;
    
//     const storedData = otpStore.get(referenceId);
    
//     if (!storedData) {
//       return res.status(400).json({ error: 'Invalid or expired session' });
//     }
    
//     // Check expiration
//     if (Date.now() > storedData.expiresAt) {
//       otpStore.delete(referenceId);
//       return res.status(400).json({ error: 'OTP has expired. Please try again.' });
//     }
    
//     // Check attempts
//     if (storedData.attempts >= 3) {
//       otpStore.delete(referenceId);
//       return res.status(400).json({ error: 'Too many failed attempts. Please restart.' });
//     }
    
//     // Verify OTP
//     if (storedData.otp !== otp) {
//       storedData.attempts++;
//       otpStore.set(referenceId, storedData);
//       return res.status(400).json({ 
//         error: 'Invalid OTP',
//         attemptsLeft: 3 - storedData.attempts
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'OTP verified successfully'
//     });
    
//   } catch (error) {
//     console.error('Verification error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Resend OTP
// router.post('/momo/resend-otp', async (req, res) => {
//   try {
//     const { referenceId } = req.body;
    
//     const storedData = otpStore.get(referenceId);
    
//     if (!storedData) {
//       return res.status(400).json({ error: 'Invalid session' });
//     }
    
//     // Check cooldown (30 seconds minimum between resends)
//     const timeSinceLastSend = Date.now() - storedData.createdAt;
//     if (timeSinceLastSend < 30000) {
//       return res.status(429).json({ 
//         error: `Please wait ${Math.ceil((30000 - timeSinceLastSend) / 1000)} seconds`
//       });
//     }
    
//     // Generate new OTP
//     const newOtp = generateOTP();
    
//     // Update stored data
//     storedData.otp = newOtp;
//     storedData.createdAt = Date.now();
//     storedData.expiresAt = Date.now() + 5 * 60 * 1000;
//     storedData.attempts = 0;
//     otpStore.set(referenceId, storedData);
    
//     // Resend SMS
//     const smsResult = await sendRealSMS(storedData.phoneNumber, newOtp);
    
//     if (!smsResult.success) {
//       return res.status(500).json({ error: 'Failed to resend OTP' });
//     }
    
//     res.json({
//       success: true,
//       message: 'OTP resent successfully'
//     });
    
//   } catch (error) {
//     console.error('Resend error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Complete payment
// router.post('/momo/:referenceId/complete', async (req, res) => {
//   try {
//     const { referenceId } = req.params;
    
//     const storedData = otpStore.get(referenceId);
    
//     if (!storedData) {
//       return res.status(400).json({ error: 'Invalid session' });
//     }
    
//     // Here you would process the actual payment
//     const paymentResult = {
//       success: true,
//       transactionId: crypto.randomBytes(8).toString('hex'),
//       amount: 800,
//       referenceId: referenceId
//     };
    
//     if (paymentResult.success) {
//       otpStore.delete(referenceId);
//       res.json({
//         success: true,
//         message: 'Payment completed successfully',
//         data: paymentResult
//       });
//     } else {
//       res.status(400).json({ error: 'Payment processing failed' });
//     }
    
//   } catch (error) {
//     console.error('Complete payment error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

module.exports = router;
// ==================== SIMPLE MOMO PAYMENT ENDPOINTS ====================
// Add this right after your other route definitions

// Simple in-memory storage
const simplePayments = new Map();

// Generate random ID
const generateId = () => {
  return 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Generate random OTP (always 123456 for testing)
const getTestOtp = () => '123456';

/**
 * POST /api/payments/momo/initiate - Start payment
 */
app.post('/api/payments/momo/initiate', authenticateToken, async (req, res) => {
  console.log('📱 MoMo initiate called with body:', req.body);
  
  try {
    const { bookingId, phoneNumber } = req.body;
    
    if (!bookingId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID and phone number are required'
      });
    }

    // Validate phone (simple check)
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (!/^(76|78)\d{6}$/.test(cleaned)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number. Use 76XXXXXX or 78XXXXXX'
      });
    }

    const referenceId = generateId();
    const otp = getTestOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store payment
    simplePayments.set(referenceId, {
      referenceId,
      bookingId,
      phoneNumber,
      amount: 1600, // You should get this from the booking
      status: 'PENDING',
      otp,
      expiresAt,
      attempts: 0
    });

    console.log('✅ Payment initiated:', {
      referenceId,
      phoneNumber,
      otp // In production, never log OTP!
    });

    res.json({
      success: true,
      message: 'Payment initiated. Use OTP: 123456',
      data: {
        referenceId,
        status: 'pending',
        otpRequired: true,
        expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * POST /api/payments/momo/verify-otp - Verify OTP
 */
app.post('/api/payments/momo/verify-otp', authenticateToken, (req, res) => {
  console.log('🔑 Verify OTP called with body:', req.body);
  
  const { referenceId, otp } = req.body;
  
  if (!referenceId || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Reference ID and OTP required'
    });
  }

  const payment = simplePayments.get(referenceId);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found'
    });
  }

  if (payment.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      error: `Payment is ${payment.status}`
    });
  }

  if (Date.now() > payment.expiresAt) {
    payment.status = 'EXPIRED';
    simplePayments.set(referenceId, payment);
    return res.status(400).json({
      success: false,
      error: 'OTP expired'
    });
  }

  payment.attempts += 1;
  
  if (payment.attempts > 3) {
    payment.status = 'FAILED';
    simplePayments.set(referenceId, payment);
    return res.status(400).json({
      success: false,
      error: 'Too many attempts'
    });
  }

  // For testing, accept 123456 or the stored OTP
  if (otp !== payment.otp && otp !== '123456') {
    return res.status(400).json({
      success: false,
      error: 'Invalid OTP',
      attemptsLeft: 3 - payment.attempts
    });
  }

  // OTP verified
  payment.status = 'VERIFIED';
  simplePayments.set(referenceId, payment);

  res.json({
    success: true,
    message: 'OTP verified'
  });
});

/**
 * POST /api/payments/momo/:referenceId/complete - Complete payment
 */
app.post('/api/payments/momo/:referenceId/complete', authenticateToken, async (req, res) => {
  console.log('💰 Complete payment called for:', req.params.referenceId);
  
  const { referenceId } = req.params;
  
  const payment = simplePayments.get(referenceId);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found'
    });
  }

  if (payment.status !== 'VERIFIED') {
    return res.status(400).json({
      success: false,
      error: 'Payment not verified'
    });
  }

  // Mark as successful
  payment.status = 'SUCCESSFUL';
  payment.transactionId = 'TXN_' + Date.now();
  simplePayments.set(referenceId, payment);

  // Update booking payment status in database
  try {
    await pool.query(
      'UPDATE bookings SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['paid', payment.bookingId]
    );
    
    console.log(`✅ Booking ${payment.bookingId} marked as paid`);
  } catch (dbError) {
    console.error('Error updating booking:', dbError);
  }

  res.json({
    success: true,
    message: 'Payment completed',
    data: {
      transactionId: payment.transactionId,
      status: 'SUCCESSFUL'
    }
  });
});

/**
 * GET /api/payments/momo/status/:referenceId - Check status
 */
app.get('/api/payments/momo/status/:referenceId', authenticateToken, (req, res) => {
  const { referenceId } = req.params;
  
  const payment = simplePayments.get(referenceId);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found'
    });
  }

  res.json({
    success: true,
    data: {
      referenceId: payment.referenceId,
      status: payment.status,
      amount: payment.amount,
      phoneNumber: payment.phoneNumber,
      transactionId: payment.transactionId,
      expiresAt: payment.expiresAt
    }
  });
});


// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
// ==================== COMPLETE PASSWORD RESET FLOW ====================

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean up expired OTPs every hour
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60 * 60 * 1000);

// 1. FORGOT PASSWORD - Request OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No account found with this email' });
    }

    const user = userResult.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiresAt,
      userId: user.id,
      attempts: 0
    });

    console.log(`📧 OTP for ${email}: ${otp}`); // For development

    // Generate token
    const token = jwt.sign(
      { email, purpose: 'reset' }, 
      JWT_SECRET, 
      { expiresIn: '10m' }
    );

    res.json({ 
      success: true, 
      message: 'Verification code sent',
      token
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 2. VERIFY OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ success: false, error: 'No verification code found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, error: 'Verification code has expired' });
    }

    storedData.attempts += 1;

    if (storedData.attempts > 5) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, error: 'Too many attempts. Please request a new code.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStore.set(email, storedData);

    // Generate verification token
    const token = jwt.sign(
      { email, verified: true }, 
      JWT_SECRET, 
      { expiresIn: '10m' }
    );

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 3. RESEND OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const existingData = otpStore.get(email);

    if (!existingData) {
      return res.status(400).json({ success: false, error: 'Please request password reset first' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, {
      ...existingData,
      otp,
      expiresAt,
      attempts: 0
    });

    console.log(`📧 New OTP for ${email}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'New verification code sent'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 4. RESET PASSWORD (with token)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token and new password are required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ success: false, error: 'Reset link has expired' });
      }
      return res.status(400).json({ success: false, error: 'Invalid reset link' });
    }

    if (!decoded.email || !decoded.verified) {
      return res.status(400).json({ success: false, error: 'Invalid reset token' });
    }

    const storedData = otpStore.get(decoded.email);

    if (!storedData || !storedData.verified) {
      return res.status(400).json({ success: false, error: 'Reset session expired or not verified' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [decoded.email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, userResult.rows[0].password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password cannot be the same as your current password' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, decoded.email]
    );

    // Clear OTP data
    otpStore.delete(decoded.email);

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 5. VALIDATE RESET TOKEN
app.post('/api/auth/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ success: false, error: 'Token has expired', expired: true });
      }
      return res.status(400).json({ success: false, error: 'Invalid token', invalid: true });
    }

    if (!decoded.email || !decoded.verified) {
      return res.status(400).json({ success: false, error: 'Invalid token format' });
    }

    const storedData = otpStore.get(decoded.email);

    if (!storedData || !storedData.verified) {
      return res.status(400).json({ success: false, error: 'Reset session expired' });
    }

    res.json({ 
      success: true, 
      message: 'Token is valid',
      email: decoded.email
    });

  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 6. UPDATE PASSWORD (when logged in)
app.put('/api/auth/update-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' 
      });
    }

    // Get user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password cannot be the same as your current password' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const query = `
      INSERT INTO users (email, password, full_name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, phone, role, created_at
    `;

    const values = [email, hashedPassword, full_name, phone || null, role || 'farmer'];
    const result = await pool.query(query, values);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.rows[0].id, 
        email: result.rows[0].email, 
        role: result.rows[0].role,
        full_name: result.rows[0].full_name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// For backward compatibility - keep the old endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    
    // Redirect to the new endpoint
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (email, password, full_name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, phone, role, created_at
    `;

    const values = [email, hashedPassword, full_name, phone || null, role || 'farmer'];
    const insertResult = await pool.query(query, values);

    const token = jwt.sign(
      { 
        id: insertResult.rows[0].id, 
        email: insertResult.rows[0].email, 
        role: insertResult.rows[0].role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: insertResult.rows[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        full_name: user.full_name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// For backward compatibility
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// ==================== BOOKING ENDPOINT ====================
// POST /api/auth/bookings - Create new booking (Public)
app.post('/api/auth/bookings', upload.single('proof_of_payment'), async (req, res) => {
  try {
    console.log('📝 Received booking request:', req.body);
    console.log('📎 File:', req.file);

    const {
      full_name,
      email,
      contact_number,
      location_description,
      available_time,
      hours_booked,
      payment_method
    } = req.body;

    // Validate required fields
    if (!full_name || !contact_number || !location_description || !available_time || !hours_booked) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        required: ['full_name', 'contact_number', 'location_description', 'available_time', 'hours_booked']
      });
    }

    const hours = parseFloat(hours_booked);
    if (isNaN(hours) || hours <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid hours booked' });
    }

    const total_amount = hours * 400; // E400 per hour
    const proof_of_payment = req.file ? req.file.filename : null;

    // Insert into database
    const query = `
      INSERT INTO bookings (
        full_name, 
        email, 
        contact_number, 
        location_description, 
        available_time, 
        hours_booked, 
        total_amount, 
        payment_method, 
        proof_of_payment, 
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [
      full_name,
      email || null,
      contact_number,
      location_description,
      available_time,
      hours,
      total_amount,
      payment_method || 'momo',
      proof_of_payment,
      'paid' // Default status
    ];

    console.log('📊 Executing query with values:', values);
    const result = await pool.query(query, values);
    console.log('✅ Booking created successfully with ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: result.rows[0].id,
        full_name: result.rows[0].full_name,
        contact_number: result.rows[0].contact_number,
        location_description: result.rows[0].location_description,
        available_time: result.rows[0].available_time,
        hours_booked: result.rows[0].hours_booked,
        total_amount: result.rows[0].total_amount,
        payment_method: result.rows[0].payment_method,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while creating booking',
      details: error.message
    });
  }
});
// Simple fallback endpoint
app.get('/api/admin/bookings/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json({ 
      success: true, 
      bookings: result.rows 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BOOKING ROUTES ====================
app.post('/api/auth/bookings', upload.single('proof_of_payment'), async (req, res) => {
  try {
    const {
      full_name,
      email,
      location_description,
      hours_booked,
      payment_method,
      available_time,
      contact_number,
      farmer_id
    } = req.body;

    // Validate required fields
    if (!full_name || !location_description || !hours_booked || !available_time || !contact_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hours = parseFloat(hours_booked);
    if (isNaN(hours) || hours <= 0) {
      return res.status(400).json({ error: 'Invalid hours booked' });
    }

    const total_amount = hours * 400;
    const proof_of_payment = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO bookings (
        full_name,
        email,
        contact_number,
        location_description,
        available_time,
        hours_booked,
        total_amount,
        payment_method,
        proof_of_payment,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      full_name,           // $1 - full_name
      email || null,       // $2 - email
      contact_number,      // $3 - contact_number
      location_description, // $4 - location_description
      available_time,      // $5 - available_time
      hours,              // $6 - hours_booked
      total_amount,       // $7 - total_amount
      payment_method,     // $8 - payment_method
      proof_of_payment,   // $9 - proof_of_payment
      'paid'   
    ];

    console.log('📊 Executing query with values:', values);
    const result = await pool.query(query, values);
    console.log('✅ Booking created successfully:', result.rows[0].id);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({ 
      error: 'Server error while creating booking',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// ==================== BOOKING DETAILS ENDPOINT ====================
// GET /api/bookings/:id - Get booking by ID (simplified)
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Simple query - just get the booking
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = result.rows[0];

    // Check if user has permission to view this booking
    if (req.user.role !== 'admin') {
      if (booking.email !== req.user.email && booking.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. You do not have permission to view this booking.' 
        });
      }
    }

    res.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching booking' 
    });
  }
});
 

// Get booking by ID
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const values = [id];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    const booking = result.rows[0];
    if (req.user.role !== 'admin' && booking.farmer_id !== req.user.id && booking.email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status (admin only)
app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tractor_assigned, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const query = `
      UPDATE bookings 
      SET status = $1, 
          tractor_assigned = $2, 
          admin_notes = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    const values = [status, tractor_assigned || null, admin_notes || null, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bookings by farmer email (public endpoint for checking bookings)
app.get('/bookings/farmer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get farmer bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// ==================== BOOKING ROUTES ====================

// Get all bookings (with optional filters) - Admin only
app.get('/api/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      status, 
      from_date, 
      to_date, 
      payment_method,
      limit = 100,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    let query = `
      SELECT b.*, 
             COUNT(*) OVER() as total_count
      FROM bookings b
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Apply status filter
    if (status) {
      query += ` AND b.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    // Apply date range filter
    if (from_date) {
      query += ` AND b.created_at >= $${paramCount}`;
      values.push(from_date);
      paramCount++;
    }

    if (to_date) {
      query += ` AND b.created_at <= $${paramCount}`;
      values.push(to_date);
      paramCount++;
    }

    // Apply payment method filter
    if (payment_method) {
      query += ` AND b.payment_method ILIKE $${paramCount}`;
      values.push(`%${payment_method}%`);
      paramCount++;
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'total_amount', 'hours_booked', 'status', 'full_name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY b.${sortColumn} ${sortOrder}`;

    // Apply pagination
    const limitNum = parseInt(limit) || 100;
    const offsetNum = parseInt(offset) || 0;
    
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limitNum, offsetNum);

    const result = await pool.query(query, values);

    // Get total count from the first row
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    // Remove total_count from each row
    const bookings = result.rows.map(row => {
      const { total_count, ...booking } = row;
      return booking;
    });

    res.json({
      success: true,
      bookings,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        page: Math.floor(offsetNum / limitNum) + 1,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching bookings' 
    });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    const booking = result.rows[0];

    // Check if user has permission to view this booking
    if (req.user.role !== 'admin') {
      // For non-admin users, check if they own this booking
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR phone = $2',
        [booking.email, booking.contact_number]
      );

      if (userCheck.rows.length === 0 || userCheck.rows[0].id !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. You do not have permission to view this booking.' 
        });
      }
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching booking' 
    });
  }
});

// Get bookings by farmer email (public endpoint for checking bookings)
app.get('/bookings/farmer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );

    res.json({
      success: true,
      bookings: result.rows
    });

  } catch (error) {
    console.error('Get farmer bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching bookings' 
    });
  }
});

// Get bookings by phone number (for farmers without email)
app.get('/api/bookings/phone/:phone', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM bookings WHERE contact_number = $1 ORDER BY created_at DESC',
      [phone]
    );

    // Check if user has permission
    if (req.user.role !== 'admin') {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE phone = $1',
        [phone]
      );

      if (userCheck.rows.length === 0 || userCheck.rows[0].id !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied' 
        });
      }
    }

    res.json({
      success: true,
      bookings: result.rows
    });

  } catch (error) {
    console.error('Get bookings by phone error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching bookings' 
    });
  }
});

// Get booking statistics (Admin only)
app.get('/api/bookings/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND created_at >= CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '1 year'";
        break;
      default:
        dateFilter = '';
    }

    const queries = await Promise.all([
      // Total bookings
      pool.query(`SELECT COUNT(*) as count FROM bookings WHERE 1=1 ${dateFilter}`),
      
      // Bookings by status
      pool.query(`
        SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
        FROM bookings 
        WHERE 1=1 ${dateFilter}
        GROUP BY status
      `),
      
      // Total revenue
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
        FROM bookings 
        WHERE status IN ('confirmed', 'completed') ${dateFilter}
      `),
      
      // Average booking value
      pool.query(`
        SELECT COALESCE(AVG(total_amount), 0) as avg_value 
        FROM bookings 
        WHERE status IN ('confirmed', 'completed') ${dateFilter}
      `),
      
      // Daily bookings for chart
      pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(total_amount) as revenue
        FROM bookings 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `)
    ]);

    const totalBookings = parseInt(queries[0].rows[0].count);
    const statusStats = queries[1].rows;
    const totalRevenue = parseFloat(queries[2].rows[0].total_revenue);
    const avgValue = parseFloat(queries[3].rows[0].avg_value);
    const dailyStats = queries[4].rows;

    // Format status stats
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    const statusRevenue = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    statusStats.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
      statusRevenue[row.status] = parseFloat(row.revenue) || 0;
    });

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        averageValue: avgValue,
        statusCounts,
        statusRevenue,
        dailyStats
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching booking statistics' 
    });
  }
});

// Get recent bookings (for dashboard)
app.get('/api/bookings/recent', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;

    const result = await pool.query(`
      SELECT id, full_name, total_amount, status, created_at 
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      recentBookings: result.rows
    });

  } catch (error) {
    console.error('Get recent bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching recent bookings' 
    });
  }
});

// Legacy endpoint for backward compatibility
app.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get booking by ID (legacy)
app.get('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// ==================== BOOKING MANAGEMENT ENDPOINTS ====================

// Update booking status (for farmer cancellation)
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status value' 
      });
    }

    // Get current booking to check ownership
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns this booking (for non-admin)
    if (req.user.role !== 'admin') {
      if (booking.email !== req.user.email && booking.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to modify this booking' 
        });
      }
    }

    // If cancelling a booking that was paid, check if refund was processed
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, admin_notes, id]);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating booking' 
    });
  }
});

// Update booking payment status
app.put('/api/bookings/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Validate payment status
    const validStatuses = ['paid', 'unpaid', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment status value' 
      });
    }

    // Get current booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    // Update payment status
    const result = await pool.query(
      `UPDATE bookings 
       SET payment_status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [payment_status, id]
    );

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating payment status' 
    });
  }
});

// ==================== REFUND ENDPOINTS ====================

// Process refund for a booking
app.post('/api/payments/momo/refund/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;

    // Validate booking ID
    if (isNaN(parseInt(bookingId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns this booking
    if (req.user.role !== 'admin') {
      if (booking.email !== req.user.email && booking.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to refund this booking' 
        });
      }
    }

    // Check if booking has been paid
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot refund an unpaid booking' 
      });
    }

    // Check if already refunded
    if (booking.payment_status === 'refunded') {
      return res.status(400).json({ 
        success: false, 
        error: 'This booking has already been refunded' 
      });
    }

    // Get payment details
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment record not found for this booking' 
      });
    }

    const payment = paymentResult.rows[0];
    const refundAmount = amount || payment.amount;
    const refundId = 'REF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create refund record
    await pool.query(
      `INSERT INTO refunds (
        booking_id, payment_id, amount, reason, refund_reference, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [bookingId, payment.id, refundAmount, reason || 'Cancelled by farmer', refundId, 'processed']
    );

    // Update payment status to refunded
    await pool.query(
      `UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [payment.id]
    );

    // Log the refund
    console.log(`💰 Refund processed for booking #${bookingId}`);
    console.log(`Amount: E${refundAmount}`);
    console.log(`Refund ID: ${refundId}`);
    console.log(`Reason: ${reason || 'Cancelled by farmer'}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId,
        amount: refundAmount,
        bookingId: parseInt(bookingId),
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Refund processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while processing refund' 
    });
  }
});

// Get refund status
app.get('/api/payments/momo/refund/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      `SELECT r.*, b.payment_status 
       FROM refunds r
       JOIN bookings b ON r.booking_id = b.id
       WHERE r.booking_id = $1 
       ORDER BY r.created_at DESC`,
      [bookingId]
    );

    res.json({
      success: true,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('❌ Get refund status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching refund status' 
    });
  }
});

// ==================== RECEIPT ENDPOINTS ====================

// Generate receipt data for booking
app.get('/api/bookings/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Get booking with user and payment details
    const result = await pool.query(`
      SELECT 
        b.*,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        p.id as payment_id,
        p.amount as payment_amount,
        p.momo_reference,
        p.transaction_id,
        p.status as payment_status,
        p.payment_date,
        r.id as refund_id,
        r.amount as refund_amount,
        r.refund_reference,
        r.reason as refund_reason,
        r.created_at as refund_date
      FROM bookings b
      LEFT JOIN users u ON b.email = u.email OR b.contact_number = u.phone
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN refunds r ON p.id = r.payment_id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const receiptData = result.rows[0];

    // Check permissions
    if (req.user.role !== 'admin') {
      if (receiptData.email !== req.user.email && receiptData.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to view this receipt' 
        });
      }
    }

    // Format receipt data
    const receipt = {
      receipt_number: `RDA-${receiptData.id}-${new Date(receiptData.created_at).getFullYear()}`,
      booking_id: receiptData.id,
      booking_date: receiptData.created_at,
      farmer: {
        name: receiptData.full_name,
        email: receiptData.email,
        phone: receiptData.contact_number
      },
      service: {
        hours: receiptData.hours_booked,
        rate: 400,
        total: receiptData.total_amount,
        location: receiptData.location_description,
        date: receiptData.available_time
      },
      payment: {
        method: receiptData.payment_method,
        amount: receiptData.payment_amount || receiptData.total_amount,
        reference: receiptData.momo_reference || receiptData.transaction_id,
        status: receiptData.payment_status,
        date: receiptData.payment_date
      },
      refund: receiptData.payment_status === 'refunded' ? {
        amount: receiptData.refund_amount,
        reference: receiptData.refund_reference,
        reason: receiptData.refund_reason,
        date: receiptData.refund_date
      } : null,
      admin: {
        tractor_assigned: receiptData.tractor_assigned,
        notes: receiptData.admin_notes
      }
    };

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('❌ Generate receipt error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while generating receipt' 
    });
  }
});

// ==================== REFUNDS TABLE (Add to your database) ====================

// Run this SQL to create the refunds table
/*
CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    refund_reference VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX idx_refunds_refund_reference ON refunds(refund_reference);
CREATE INDEX idx_refunds_status ON refunds(status);
*/

// ==================== ADMIN REFUND MANAGEMENT ENDPOINTS ====================

// Get all refunds (admin only)
app.get('/api/admin/refunds', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, from_date, to_date, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT 
        r.*,
        b.full_name as farmer_name,
        b.contact_number as farmer_phone,
        b.email as farmer_email,
        b.total_amount as booking_amount,
        b.status as booking_status
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (from_date) {
      query += ` AND DATE(r.created_at) >= DATE($${paramCount})`;
      values.push(from_date);
      paramCount++;
    }

    if (to_date) {
      query += ` AND DATE(r.created_at) <= DATE($${paramCount})`;
      values.push(to_date);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM refunds r WHERE 1=1`;
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get refunds error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching refunds' 
    });
  }
});

// Process refund manually (admin only)
app.post('/api/admin/refunds/:refundId/process', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { refundId } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE refunds 
       SET status = 'processed', 
           processed_by = $1, 
           processed_at = CURRENT_TIMESTAMP,
           admin_notes = COALESCE($2, admin_notes)
       WHERE id = $3 
       RETURNING *`,
      [req.user.id, notes, refundId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Refund not found' 
      });
    }

    // Update related payment status
    await pool.query(
      `UPDATE payments 
       SET status = 'refunded', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [result.rows[0].payment_id]
    );

    // Update booking payment status
    await pool.query(
      `UPDATE bookings 
       SET payment_status = 'refunded', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [result.rows[0].booking_id]
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Process refund error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while processing refund' 
    });
  }
});

// ==================== BOOKING MANAGEMENT ENDPOINTS ====================

// Update booking status (for farmer cancellation)
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status value' 
      });
    }

    // Get current booking to check ownership
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns this booking (for non-admin)
    if (req.user.role !== 'admin') {
      if (booking.email !== req.user.email && booking.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to modify this booking' 
        });
      }
    }

    // Update booking status
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, admin_notes, id]);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating booking' 
    });
  }
});

// Update booking payment status
app.put('/api/bookings/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Validate payment status
    const validStatuses = ['paid', 'unpaid', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment status value' 
      });
    }

    // Get current booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    // Update payment status
    const result = await pool.query(
      `UPDATE bookings 
       SET payment_status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [payment_status, id]
    );

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating payment status' 
    });
  }
});

// ==================== REFUND ENDPOINTS ====================

// Process refund for a booking
app.post('/api/payments/momo/refund/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason, phoneNumber } = req.body;

    // Validate booking ID
    if (isNaN(parseInt(bookingId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns this booking
    if (req.user.role !== 'admin') {
      if (booking.email !== req.user.email && booking.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to refund this booking' 
        });
      }
    }

    // Check if booking has been paid
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot refund an unpaid booking' 
      });
    }

    // Check if already refunded
    if (booking.payment_status === 'refunded') {
      return res.status(400).json({ 
        success: false, 
        error: 'This booking has already been refunded' 
      });
    }

    // Get payment details
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment record not found for this booking' 
      });
    }

    const payment = paymentResult.rows[0];
    const refundAmount = amount || payment.amount;
    const refundId = 'REF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const refundPhone = phoneNumber || booking.contact_number;

    // Create refund record
    await pool.query(
      `INSERT INTO refunds (
        booking_id, payment_id, amount, reason, refund_reference, 
        phone_number, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [bookingId, payment.id, refundAmount, reason || 'Cancelled by farmer', refundId, refundPhone, 'processed']
    );

    // Update payment status to refunded
    await pool.query(
      `UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [payment.id]
    );

    // Log the refund
    console.log(`💰 Refund processed for booking #${bookingId}`);
    console.log(`Amount: E${refundAmount}`);
    console.log(`Refund ID: ${refundId}`);
    console.log(`Phone: +268 ${refundPhone}`);
    console.log(`Reason: ${reason || 'Cancelled by farmer'}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId,
        amount: refundAmount,
        bookingId: parseInt(bookingId),
        phoneNumber: refundPhone,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Refund processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while processing refund' 
    });
  }
});

// Get refund status
app.get('/api/payments/momo/refund/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      `SELECT r.*, b.payment_status 
       FROM refunds r
       JOIN bookings b ON r.booking_id = b.id
       WHERE r.booking_id = $1 
       ORDER BY r.created_at DESC`,
      [bookingId]
    );

    res.json({
      success: true,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('❌ Get refund status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching refund status' 
    });
  }
});

// ==================== RECEIPT ENDPOINTS ====================

// Generate receipt data for booking
app.get('/api/bookings/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Get booking with user and payment details
    const result = await pool.query(`
      SELECT 
        b.*,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        p.id as payment_id,
        p.amount as payment_amount,
        p.momo_reference,
        p.transaction_id,
        p.status as payment_status,
        p.payment_date,
        r.id as refund_id,
        r.amount as refund_amount,
        r.refund_reference,
        r.reason as refund_reason,
        r.phone_number as refund_phone,
        r.created_at as refund_date
      FROM bookings b
      LEFT JOIN users u ON b.email = u.email OR b.contact_number = u.phone
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN refunds r ON p.id = r.payment_id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const receiptData = result.rows[0];

    // Check permissions
    if (req.user.role !== 'admin') {
      if (receiptData.email !== req.user.email && receiptData.contact_number !== req.user.phone) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to view this receipt' 
        });
      }
    }

    // Format receipt data
    const receipt = {
      receipt_number: `RDA-${receiptData.id}-${new Date(receiptData.created_at).getFullYear()}`,
      booking_id: receiptData.id,
      booking_date: receiptData.created_at,
      farmer: {
        name: receiptData.full_name,
        email: receiptData.email,
        phone: receiptData.contact_number
      },
      service: {
        hours: receiptData.hours_booked,
        rate: 400,
        total: receiptData.total_amount,
        location: receiptData.location_description,
        date: receiptData.available_time
      },
      payment: {
        method: receiptData.payment_method,
        amount: receiptData.payment_amount || receiptData.total_amount,
        reference: receiptData.momo_reference || receiptData.transaction_id,
        status: receiptData.payment_status || 'unpaid',
        date: receiptData.payment_date
      },
      refund: receiptData.payment_status === 'refunded' ? {
        amount: receiptData.refund_amount,
        reference: receiptData.refund_reference,
        reason: receiptData.refund_reason,
        phone: receiptData.refund_phone,
        date: receiptData.refund_date
      } : null,
      admin: {
        tractor_assigned: receiptData.tractor_assigned,
        notes: receiptData.admin_notes
      }
    };

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('❌ Generate receipt error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while generating receipt' 
    });
  }
});

// ==================== REFUNDS TABLE (Run this SQL to create the table) ====================

/*
CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    refund_reference VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',
    processed_by INTEGER REFERENCES users(id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_refund_reference ON refunds(refund_reference);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Add payment_status column to bookings if not exists
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';

-- Add payment_date column to bookings if not exists
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;

-- Update existing bookings to have payment_status
UPDATE bookings SET payment_status = 'paid' WHERE payment_status IS NULL AND status IN ('confirmed', 'completed');
UPDATE bookings SET payment_status = 'unpaid' WHERE payment_status IS NULL;
*/

// ==================== ADMIN REFUND MANAGEMENT ENDPOINTS ====================

// Get all refunds (admin only)
app.get('/api/admin/refunds', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, from_date, to_date, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT 
        r.*,
        b.full_name as farmer_name,
        b.contact_number as farmer_phone,
        b.email as farmer_email,
        b.total_amount as booking_amount,
        b.status as booking_status
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (from_date) {
      query += ` AND DATE(r.created_at) >= DATE($${paramCount})`;
      values.push(from_date);
      paramCount++;
    }

    if (to_date) {
      query += ` AND DATE(r.created_at) <= DATE($${paramCount})`;
      values.push(to_date);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM refunds r WHERE 1=1`;
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get refunds error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching refunds' 
    });
  }
});

// Process refund manually (admin only)
app.post('/api/admin/refunds/:refundId/process', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { refundId } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE refunds 
       SET status = 'processed', 
           processed_by = $1, 
           processed_at = CURRENT_TIMESTAMP,
           admin_notes = COALESCE($2, admin_notes)
       WHERE id = $3 
       RETURNING *`,
      [req.user.id, notes, refundId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Refund not found' 
      });
    }

    // Update related payment status
    await pool.query(
      `UPDATE payments 
       SET status = 'refunded', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [result.rows[0].payment_id]
    );

    // Update booking payment status
    await pool.query(
      `UPDATE bookings 
       SET payment_status = 'refunded', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [result.rows[0].booking_id]
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Process refund error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while processing refund' 
    });
  }
});
// Update booking status (for farmer cancellation)
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking ID format' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status value' 
      });
    }

    // Get current booking to check ownership
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    const booking = bookingResult.rows[0];

    console.log('🔐 Permission Check:');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('User Phone:', req.user.phone);
    console.log('Booking User ID:', booking.user_id);
    console.log('Booking Email:', booking.email);
    console.log('Booking Phone:', booking.contact_number);
    console.log('User Role:', req.user.role);

    // Check if user has permission to modify this booking
    let hasPermission = false;
    
    if (req.user.role === 'admin') {
      // Admin can modify any booking
      hasPermission = true;
      console.log('✅ Admin access granted');
    } else {
      // Check if the booking belongs to this farmer
      // Check by user_id, email, or phone number
      const userIdMatch = booking.user_id === req.user.id;
      const emailMatch = booking.email === req.user.email;
      const phoneMatch = booking.contact_number === req.user.phone;
      
      hasPermission = userIdMatch || emailMatch || phoneMatch;
      
      console.log('User ID Match:', userIdMatch);
      console.log('Email Match:', emailMatch);
      console.log('Phone Match:', phoneMatch);
      console.log('Has Permission:', hasPermission);
    }

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have permission to modify this booking. You can only cancel your own bookings.' 
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'This booking is already cancelled' 
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel a completed booking' 
      });
    }

    // Update booking status
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, admin_notes, id]);

    console.log(`✅ Booking ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating booking' 
    });
  }
});
// In your booking creation endpoint
app.post('/api/auth/bookings', upload.single('proof_of_payment'), async (req, res) => {
  try {
    // ... existing validation code ...

    // Get user_id if authenticated
    let user_id = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user_id = decoded.id;
        console.log('User ID from token:', user_id);
      } catch (err) {
        console.log('Invalid token, proceeding as guest');
      }
    }

    // Insert into database with user_id
    const query = `
      INSERT INTO bookings (
        full_name, email, contact_number, location_description, 
        available_time, hours_booked, total_amount, payment_method, 
        proof_of_payment, status, user_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [
      full_name,
      email || null,
      contact_number,
      location_description,
      available_time,
      hours,
      total_amount,
      payment_method || 'momo',
      proof_of_payment,
      'pending',
      user_id  // Add user_id here
    ];

    const result = await pool.query(query, values);
    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
});

// Update booking status (admin only)
app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tractor_assigned, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const query = `
      UPDATE bookings 
      SET status = $1, 
          tractor_assigned = $2, 
          admin_notes = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    const values = [status, tractor_assigned || null, admin_notes || null, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// ==================== TINKHUNDLA CENTERS ENDPOINTS ====================
// IMPORTANT: Order matters - put specific routes BEFORE parameterized routes

// Get all tinkhundla centers
app.get('/api/tinkhundla', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tinkhundla_centers ORDER BY region, name');
    res.json({
      success: true,
      centers: result.rows
    });
  } catch (error) {
    console.error('Get tinkhundla centers error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get centers with service counts (enhanced) - MUST come before /:id
app.get('/api/tinkhundla/enhanced', async (req, res) => {
  try {
    const query = `
      SELECT 
        tc.*,
        COUNT(DISTINCT cs.id) as service_count,
        COUNT(DISTINCT s.id) as staff_count
      FROM tinkhundla_centers tc
      LEFT JOIN center_services cs ON tc.id = cs.center_id AND cs.is_active = true
      LEFT JOIN staff s ON tc.id = s.center_id AND s.is_active = true
      GROUP BY tc.id
      ORDER BY tc.region, tc.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      centers: result.rows
    });
  } catch (error) {
    console.error('Get enhanced centers error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get centers by region - MUST come before /:id
app.get('/api/tinkhundla/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const result = await pool.query(
      'SELECT * FROM tinkhundla_centers WHERE region ILIKE $1 ORDER BY name',
      [`%${region}%`]
    );
    
    res.json({
      success: true,
      centers: result.rows
    });
  } catch (error) {
    console.error('Get centers by region error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get tinkhundla center by ID - THIS MUST COME AFTER all specific routes
app.get('/api/tinkhundla/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    const result = await pool.query('SELECT * FROM tinkhundla_centers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    
    res.json({
      success: true,
      center: result.rows[0]
    });
  } catch (error) {
    console.error('Get tinkhundla center error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get center with full details (services, staff) - MUST come before /:id
app.get('/api/tinkhundla/:id/full', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    // Get center details
    const centerResult = await pool.query('SELECT * FROM tinkhundla_centers WHERE id = $1', [id]);
    
    if (centerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    
    const center = centerResult.rows[0];
    
    // Get services for this center
    const servicesResult = await pool.query(`
      SELECT cs.*, s.name as service_name, s.category_id, sc.name as category_name
      FROM center_services cs
      JOIN services s ON cs.service_id = s.id
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE cs.center_id = $1 AND cs.is_active = true
      ORDER BY sc.name, s.name
    `, [id]);
    
    // Get staff for this center
    const staffResult = await pool.query(`
      SELECT * FROM staff 
      WHERE center_id = $1 AND is_active = true
      ORDER BY role, name
    `, [id]);
    
    res.json({
      success: true,
      center,
      services: servicesResult.rows,
      staff: staffResult.rows
    });
  } catch (error) {
    console.error('Get center full details error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create new tinkhundla center (admin only)
app.post('/api/tinkhundla', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name, region, location, chiefdoms, contact_number,
      email, address, status, established
    } = req.body;
    
    if (!name || !region) {
      return res.status(400).json({ success: false, error: 'Name and region are required' });
    }

    const query = `
      INSERT INTO tinkhundla_centers (
        name, region, location, chiefdoms, contact_number,
        email, address, status, established
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    
    const values = [
      name,
      region,
      location || null,
      chiefdoms || 1,
      contact_number || null,
      email || null,
      address || null,
      status || 'active',
      established || null
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Tinkhundla center created successfully',
      center: result.rows[0]
    });
  } catch (error) {
    console.error('Create tinkhundla center error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update tinkhundla center (admin only)
app.put('/api/tinkhundla/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    const {
      name, region, location, chiefdoms, contact_number,
      email, address, status, established
    } = req.body;
    
    const query = `
      UPDATE tinkhundla_centers 
      SET name = COALESCE($1, name),
          region = COALESCE($2, region),
          location = COALESCE($3, location),
          chiefdoms = COALESCE($4, chiefdoms),
          contact_number = COALESCE($5, contact_number),
          email = COALESCE($6, email),
          address = COALESCE($7, address),
          status = COALESCE($8, status),
          established = COALESCE($9, established),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    
    const values = [
      name, region, location, chiefdoms, contact_number,
      email, address, status, established, id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    
    res.json({
      success: true,
      message: 'Tinkhundla center updated successfully',
      center: result.rows[0]
    });
  } catch (error) {
    console.error('Update tinkhundla center error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete tinkhundla center (admin only)
app.delete('/api/tinkhundla/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    // Check if center has any services or staff
    const servicesCheck = await pool.query(
      'SELECT COUNT(*) FROM center_services WHERE center_id = $1',
      [id]
    );
    
    const staffCheck = await pool.query(
      'SELECT COUNT(*) FROM staff WHERE center_id = $1',
      [id]
    );
    
    if (parseInt(servicesCheck.rows[0].count) > 0 || parseInt(staffCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete center that has services or staff assigned' 
      });
    }
    
    const result = await pool.query('DELETE FROM tinkhundla_centers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    
    res.json({
      success: true,
      message: 'Tinkhundla center deleted successfully'
    });
  } catch (error) {
    console.error('Delete tinkhundla center error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get center statistics (admin only)
app.get('/api/admin/tinkhundla/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_centers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_centers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_centers,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_centers,
        SUM(chiefdoms) as total_chiefdoms
      FROM tinkhundla_centers
    `);

    const byRegion = await pool.query(`
      SELECT region, COUNT(*) as count
      FROM tinkhundla_centers
      GROUP BY region
      ORDER BY count DESC
    `);

    const topCenters = await pool.query(`
      SELECT tc.name, COUNT(cs.id) as service_count
      FROM tinkhundla_centers tc
      LEFT JOIN center_services cs ON tc.id = cs.center_id
      GROUP BY tc.id, tc.name
      ORDER BY service_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: stats.rows[0],
      byRegion: byRegion.rows,
      topCenters: topCenters.rows
    });
  } catch (error) {
    console.error('Get center stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// ==================== SERVICE CATEGORIES ENDPOINTS ====================

// Get all service categories
app.get('/api/service-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_categories ORDER BY name');
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Get service category by ID
app.get('/api/service-categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid category ID format' 
      });
    }
    
    const result = await pool.query('SELECT * FROM service_categories WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Get service category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Create service category (admin only)
app.post('/api/service-categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon_name, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const query = `
      INSERT INTO service_categories (name, description, icon_name, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [name, description || null, icon_name || null, color || null];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create service category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Update service category (admin only)
app.put('/api/service-categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid category ID format' 
      });
    }
    
    const { name, description, icon_name, color } = req.body;
    
    const query = `
      UPDATE service_categories 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          icon_name = COALESCE($3, icon_name),
          color = COALESCE($4, color),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    
    const values = [name, description, icon_name, color, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Service category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update service category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Delete service category (admin only)
app.delete('/api/service-categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid category ID format' 
      });
    }
    
    // Check if any services use this category
    const servicesCheck = await pool.query('SELECT COUNT(*) FROM services WHERE category_id = $1', [id]);
    if (parseInt(servicesCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete category that has services assigned to it' 
      });
    }
    
    const result = await pool.query('DELETE FROM service_categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Delete service category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// ==================== SERVICES ENDPOINTS ====================

// Get all services (with optional filters)
app.get('/api/services', async (req, res) => {
  try {
    const { category_id, is_active } = req.query;
    
    let query = `
      SELECT s.*, sc.name as category_name, sc.color as category_color
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;
    
    if (category_id && !isNaN(parseInt(category_id))) {
      query += ` AND s.category_id = $${paramCount}`;
      values.push(parseInt(category_id));
      paramCount++;
    }
    
    if (is_active !== undefined) {
      query += ` AND s.is_active = $${paramCount}`;
      values.push(is_active === 'true');
      paramCount++;
    }
    
    query += ` ORDER BY sc.name, s.name`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid service ID format' 
      });
    }
    
    const query = `
      SELECT s.*, sc.name as category_name, sc.color as category_color
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Create new service (admin only)
app.post('/api/services', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name, category_id, description, long_description,
      eligibility, requirements, benefits, process_steps,
      cost, duration, availability, season_info, documents,
      is_active, icon_name, contact_info
    } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ success: false, error: 'Name and category are required' });
    }

    // Helper function to handle array fields
    function parseArrayField(field) {
      if (Array.isArray(field)) {
        return JSON.stringify(field);
      }
      if (typeof field === 'string') {
        return field;
      }
      return '[]';
    }

    const query = `
      INSERT INTO services (
        name, category_id, description, long_description,
        eligibility, requirements, benefits, process_steps,
        cost, duration, availability, season_info, documents,
        is_active, icon_name, contact_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;

    const values = [
      name,
      category_id,
      description || null,
      long_description || null,
      parseArrayField(eligibility),
      parseArrayField(requirements),
      parseArrayField(benefits),
      parseArrayField(process_steps),
      cost || null,
      duration || null,
      availability || 'all',
      season_info || null,
      parseArrayField(documents),
      is_active !== false ? true : false,
      icon_name || null,
      contact_info || null
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Update service (admin only)
app.put('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid service ID format' 
      });
    }
    
    const {
      name, category_id, description, long_description,
      eligibility, requirements, benefits, process_steps,
      cost, duration, availability, season_info, documents,
      is_active, icon_name, contact_info
    } = req.body;

    // Helper function to handle array fields
    function parseArrayField(field) {
      if (Array.isArray(field)) {
        return JSON.stringify(field);
      }
      if (typeof field === 'string') {
        return field;
      }
      return null;
    }

    const query = `
      UPDATE services 
      SET name = COALESCE($1, name),
          category_id = COALESCE($2, category_id),
          description = COALESCE($3, description),
          long_description = COALESCE($4, long_description),
          eligibility = COALESCE($5::jsonb, eligibility::jsonb)::json[],
          requirements = COALESCE($6::jsonb, requirements::jsonb)::json[],
          benefits = COALESCE($7::jsonb, benefits::jsonb)::json[],
          process_steps = COALESCE($8::jsonb, process_steps::jsonb)::json[],
          cost = COALESCE($9, cost),
          duration = COALESCE($10, duration),
          availability = COALESCE($11, availability),
          season_info = COALESCE($12, season_info),
          documents = COALESCE($13::jsonb, documents::jsonb)::json[],
          is_active = COALESCE($14, is_active),
          icon_name = COALESCE($15, icon_name),
          contact_info = COALESCE($16, contact_info),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING *;
    `;

    const values = [
      name, 
      category_id, 
      description, 
      long_description,
      parseArrayField(eligibility),
      parseArrayField(requirements),
      parseArrayField(benefits),
      parseArrayField(process_steps),
      cost, 
      duration, 
      availability, 
      season_info,
      parseArrayField(documents),
      is_active, 
      icon_name, 
      contact_info,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Delete service (admin only)
app.delete('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid service ID format' 
      });
    }
    
    // Check if any center services use this service
    const centerServicesCheck = await pool.query('SELECT COUNT(*) FROM center_services WHERE service_id = $1', [id]);
    if (parseInt(centerServicesCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete service that is assigned to centers' 
      });
    }
    
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// ==================== CENTER SERVICES ENDPOINTS ====================

// Get all services for a specific center
app.get('/api/centers/:centerId/services', async (req, res) => {
  try {
    const centerId = req.params.centerId;
    
    // Validate that centerId is a number
    if (isNaN(parseInt(centerId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    const query = `
      SELECT cs.*, s.name as service_name, s.category_id, sc.name as category_name,
             c.name as center_name, c.region, c.location, c.contact_number, c.email
      FROM center_services cs
      JOIN services s ON cs.service_id = s.id
      JOIN service_categories sc ON s.category_id = sc.id
      JOIN tinkhundla_centers c ON cs.center_id = c.id
      WHERE cs.center_id = $1 AND cs.is_active = true
      ORDER BY sc.name, s.name
    `;
    
    const result = await pool.query(query, [centerId]);
    
    res.json({
      success: true,
      centerServices: result.rows
    });
  } catch (error) {
    console.error('Get center services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Get all centers that offer a specific service
app.get('/api/services/:serviceId/centers', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    // Validate that serviceId is a number
    if (isNaN(parseInt(serviceId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid service ID format' 
      });
    }
    
    const query = `
      SELECT cs.*, c.name as center_name, c.region, c.location, 
             c.contact_number, c.email
      FROM center_services cs
      JOIN tinkhundla_centers c ON cs.center_id = c.id
      WHERE cs.service_id = $1 AND cs.is_active = true
      ORDER BY c.name
    `;
    
    const result = await pool.query(query, [serviceId]);
    
    res.json({
      success: true,
      centers: result.rows
    });
  } catch (error) {
    console.error('Get service centers error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Add service to center (admin only)
app.post('/api/centers/:centerId/services', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const centerId = req.params.centerId;
    
    // Validate that centerId is a number
    if (isNaN(parseInt(centerId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid center ID format' 
      });
    }
    
    const {
      service_id, availability, price, provider_name,
      provider_contact, schedule_info, notes
    } = req.body;

    if (!service_id) {
      return res.status(400).json({ success: false, error: 'Service ID is required' });
    }

    // Check if service already exists for this center
    const existingCheck = await pool.query(
      'SELECT * FROM center_services WHERE center_id = $1 AND service_id = $2',
      [centerId, service_id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Service already exists for this center' 
      });
    }

    const query = `
      INSERT INTO center_services (
        center_id, service_id, availability, price,
        provider_name, provider_contact, schedule_info, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      centerId, 
      service_id, 
      availability || 'available',
      price || null, 
      provider_name || null, 
      provider_contact || null,
      schedule_info || null, 
      notes || null
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Service added to center successfully',
      centerService: result.rows[0]
    });
  } catch (error) {
    console.error('Add center service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Update center service (admin only)
app.put('/api/centers/:centerId/services/:serviceId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const centerId = req.params.centerId;
    const serviceId = req.params.serviceId;
    
    // Validate IDs
    if (isNaN(parseInt(centerId)) || isNaN(parseInt(serviceId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID format' 
      });
    }
    
    const {
      availability, price, provider_name,
      provider_contact, schedule_info, notes, is_active
    } = req.body;

    const query = `
      UPDATE center_services 
      SET availability = COALESCE($1, availability),
          price = COALESCE($2, price),
          provider_name = COALESCE($3, provider_name),
          provider_contact = COALESCE($4, provider_contact),
          schedule_info = COALESCE($5, schedule_info),
          notes = COALESCE($6, notes),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE center_id = $8 AND service_id = $9
      RETURNING *;
    `;

    const values = [
      availability, price, provider_name,
      provider_contact, schedule_info, notes,
      is_active, centerId, serviceId
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center service not found' });
    }

    res.json({
      success: true,
      message: 'Center service updated successfully',
      centerService: result.rows[0]
    });
  } catch (error) {
    console.error('Update center service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Remove service from center (admin only)
app.delete('/api/centers/:centerId/services/:serviceId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const centerId = req.params.centerId;
    const serviceId = req.params.serviceId;
    
    // Validate IDs
    if (isNaN(parseInt(centerId)) || isNaN(parseInt(serviceId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID format' 
      });
    }
    
    const result = await pool.query(
      'DELETE FROM center_services WHERE center_id = $1 AND service_id = $2 RETURNING *',
      [centerId, serviceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Center service not found' });
    }
    
    res.json({
      success: true,
      message: 'Service removed from center successfully'
    });
  } catch (error) {
    console.error('Delete center service error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// ==================== SERVICE REGISTRATIONS ENDPOINTS ====================

// Create a service registration (farmer registers for a service)
app.post('/api/service-registrations', async (req, res) => {
  try {
    const {
      service_id, center_id, full_name, email, phone,
      farm_location, farm_size, crop_type, livestock_type,
      preferred_date, preferred_time, additional_notes
    } = req.body;

    // Validate required fields
    if (!service_id || !center_id || !full_name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        required: ['service_id', 'center_id', 'full_name', 'phone']
      });
    }

    // Get user_id from token if authenticated
    let user_id = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user_id = decoded.id;
      } catch (err) {
        // Token invalid, but registration can still proceed without user_id
        console.log('No valid token, proceeding without user_id');
      }
    }

    const query = `
      INSERT INTO service_registrations (
        service_id, center_id, user_id, full_name, email, phone,
        farm_location, farm_size, crop_type, livestock_type,
        preferred_date, preferred_time, additional_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      service_id, 
      center_id, 
      user_id, 
      full_name, 
      email || null, 
      phone,
      farm_location || null, 
      farm_size || null, 
      crop_type || null, 
      livestock_type || null,
      preferred_date || null, 
      preferred_time || null, 
      additional_notes || null, 
      'pending'
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Service registration submitted successfully',
      registration: result.rows[0]
    });
  } catch (error) {
    console.error('Create service registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Get user's service registrations
app.get('/api/user/service-registrations', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT sr.*, s.name as service_name, tc.name as center_name
      FROM service_registrations sr
      JOIN services s ON sr.service_id = s.id
      JOIN tinkhundla_centers tc ON sr.center_id = tc.id
      WHERE sr.user_id = $1 OR sr.email = $2
      ORDER BY sr.created_at DESC
    `;
    
    const result = await pool.query(query, [req.user.id, req.user.email]);
    
    res.json({
      success: true,
      registrations: result.rows
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});
// ==================== CONTACT ENDPOINT ====================

// Create contact message table
const createContactTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      subject VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      replied BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  console.log('✅ Contact messages table ready');
};

// Call this when server starts
createContactTable();

// POST /api/contact - Send contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, subject, and message are required' 
      });
    }

    // Insert into database
    const query = `
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await pool.query(query, [name, email, phone, subject, message]);

    // Optional: Send email notification to admin
    // await sendEmail({
    //   to: 'admin@rda.co.sz',
    //   subject: `New Contact Message: ${subject}`,
    //   html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Message: ${message}</p>`
    // });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while sending message' 
    });
  }
});

// GET /api/admin/contact-messages - Get all contact messages (admin only)
app.get('/api/admin/contact-messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT * FROM contact_messages 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM contact_messages');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      messages: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get contact messages error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/admin/contact-messages/:id - Update message status (admin only)
app.put('/api/admin/contact-messages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replied } = req.body;

    const query = `
      UPDATE contact_messages 
      SET status = COALESCE($1, status),
          replied = COALESCE($2, replied),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [status, replied, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      message: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update message error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// GET /api/advisory/seasonal-guides - Get all seasonal guides
app.get('/api/advisory/seasonal-guides', async (req, res) => {
  try {
    const { season, crop_type, region } = req.query;
    
    let query = `
      SELECT * FROM advisory_seasonal_guides
      WHERE is_active = true
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (season) {
      query += ` AND season = $${paramCount}`;
      values.push(season);
      paramCount++;
    }
    
    if (crop_type) {
      query += ` AND crop_type ILIKE $${paramCount}`;
      values.push(`%${crop_type}%`);
      paramCount++;
    }
    
    if (region) {
      query += ` AND region ILIKE $${paramCount}`;
      values.push(`%${region}%`);
      paramCount++;
    }
    
    query += ` ORDER BY start_date DESC`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      guides: result.rows
    });
  } catch (error) {
    console.error('❌ Get seasonal guides error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/advisory/seasonal-guides - Create seasonal guide (admin only)
app.post('/api/advisory/seasonal-guides', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, season, crop_type, region, content, start_date, end_date } = req.body;
    
    if (!title || !season || !crop_type || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const query = `
      INSERT INTO advisory_seasonal_guides (
        title, season, crop_type, region, content, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, season, crop_type, region || null, content, start_date || null, end_date || null
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Seasonal guide created successfully',
      guide: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/advisory/seasonal-guides/:id - Update seasonal guide (admin only)
app.put('/api/advisory/seasonal-guides/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, season, crop_type, region, content, start_date, end_date, is_active } = req.body;
    
    const query = `
      UPDATE advisory_seasonal_guides 
      SET title = COALESCE($1, title),
          season = COALESCE($2, season),
          crop_type = COALESCE($3, crop_type),
          region = COALESCE($4, region),
          content = COALESCE($5, content),
          start_date = COALESCE($6, start_date),
          end_date = COALESCE($7, end_date),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, season, crop_type, region, content, start_date, end_date, is_active, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    res.json({
      success: true,
      message: 'Seasonal guide updated successfully',
      guide: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/advisory/seasonal-guides/:id - Delete seasonal guide (admin only)
app.delete('/api/advisory/seasonal-guides/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM advisory_seasonal_guides WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    res.json({
      success: true,
      message: 'Seasonal guide deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Get all service registrations (admin only)
app.get('/api/admin/service-registrations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, center_id, from_date, to_date, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT sr.*, s.name as service_name, tc.name as center_name, u.full_name as user_full_name
      FROM service_registrations sr
      JOIN services s ON sr.service_id = s.id
      JOIN tinkhundla_centers tc ON sr.center_id = tc.id
      LEFT JOIN users u ON sr.user_id = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND sr.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    
    if (center_id && !isNaN(parseInt(center_id))) {
      query += ` AND sr.center_id = $${paramCount}`;
      values.push(parseInt(center_id));
      paramCount++;
    }
    
    if (from_date) {
      query += ` AND DATE(sr.created_at) >= DATE($${paramCount})`;
      values.push(from_date);
      paramCount++;
    }
    
    if (to_date) {
      query += ` AND DATE(sr.created_at) <= DATE($${paramCount})`;
      values.push(to_date);
      paramCount++;
    }
    
    query += ` ORDER BY sr.created_at DESC`;
    
    // Add pagination
    const limitNum = parseInt(limit) || 100;
    const offsetNum = parseInt(offset) || 0;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limitNum, offsetNum);
    
    const result = await pool.query(query, values);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM service_registrations sr
      WHERE 1=1
    `;
    const countResult = await pool.query(countQuery, []);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      registrations: result.rows,
      pagination: {
        total: total,
        limit: limitNum,
        offset: offsetNum,
        page: Math.floor(offsetNum / limitNum) + 1,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Update service registration status (admin only)
app.put('/api/admin/service-registrations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid registration ID format' 
      });
    }
    
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const query = `
      UPDATE service_registrations 
      SET status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    const values = [status, admin_notes, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    res.json({
      success: true,
      message: 'Registration updated successfully',
      registration: result.rows[0]
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});

// Get service registration statistics (admin only)
app.get('/api/admin/service-registrations/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM service_registrations
    `);

    const byService = await pool.query(`
      SELECT s.name, COUNT(*) as count
      FROM service_registrations sr
      JOIN services s ON sr.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 10
    `);

    const byCenter = await pool.query(`
      SELECT tc.name, COUNT(*) as count
      FROM service_registrations sr
      JOIN tinkhundla_centers tc ON sr.center_id = tc.id
      GROUP BY tc.id, tc.name
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: stats.rows[0],
      byService: byService.rows,
      byCenter: byCenter.rows
    });
  } catch (error) {
    console.error('Get registration stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error'
    });
  }
});





// ==================== INKUNDLA CENTERS ROUTES ====================
app.get('/api/centers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inkhundla_centers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/centers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM inkhundla_centers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/centers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, location, contact_number, email, services } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const query = `
      INSERT INTO inkhundla_centers (name, location, contact_number, email, services)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [
      name, 
      location, 
      contact_number || null, 
      email || null, 
      services || {}
    ];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/centers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contact_number, email, services } = req.body;
    
    const query = `
      UPDATE inkhundla_centers 
      SET name = $1, 
          location = $2, 
          contact_number = $3, 
          email = $4, 
          services = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    
    const values = [
      name, 
      location, 
      contact_number || null, 
      email || null, 
      services || {}, 
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== STATS ROUTES ====================
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total bookings count
    const bookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const totalBookings = parseInt(bookingsResult.rows[0].count);

    // Get bookings by status
    const pendingResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const confirmedResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
    const completedResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
    const cancelledResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'");
    
    // Get total revenue
    const revenueResult = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM bookings WHERE status IN ('confirmed', 'completed')");
    
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const farmersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'farmer'");
    const adminsResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    
    // Get total centers
    const centersResult = await pool.query('SELECT COUNT(*) FROM inkhundla_centers');

    // Get recent bookings
    const recentBookings = await pool.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      totalBookings,
      pendingBookings: parseInt(pendingResult.rows[0].count),
      confirmedBookings: parseInt(confirmedResult.rows[0].count),
      completedBookings: parseInt(completedResult.rows[0].count),
      cancelledBookings: parseInt(cancelledResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
      totalUsers: parseInt(usersResult.rows[0].count),
      totalFarmers: parseInt(farmersResult.rows[0].count),
      totalAdmins: parseInt(adminsResult.rows[0].count),
      totalCenters: parseInt(centersResult.rows[0].count),
      recentBookings: recentBookings.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// For backward compatibility
app.get('/api/stats/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const pendingResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const confirmedResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
    const completedResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
    const revenueResult = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM bookings WHERE status IN ('confirmed', 'completed')");
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const centersResult = await pool.query('SELECT COUNT(*) FROM inkhundla_centers');

    res.json({
      totalBookings: parseInt(bookingsResult.rows[0].count),
      pendingBookings: parseInt(pendingResult.rows[0].count),
      confirmedBookings: parseInt(confirmedResult.rows[0].count),
      completedBookings: parseInt(completedResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
      totalUsers: parseInt(usersResult.rows[0].count),
      totalCenters: parseInt(centersResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USERS ROUTES (Admin only) ====================
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BACKWARD COMPATIBILITY ROUTES ====================
// These routes maintain compatibility with your existing frontend code

// Bookings farmer endpoint (without /api prefix)
app.get('/bookings/farmer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get farmer bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
const advisoryRoutes = require('./routes/advisoryRoutes');
app.use('/api/advisory', advisoryRoutes);

// Centers without /api prefix
app.get('/centers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inkhundla_centers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/centers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM inkhundla_centers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ERROR HANDLING ====================
// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  
  if (err.message && err.message.includes('allowed')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================
app.listen(port, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`🌐 Network: http://172.16.18.254:${port}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, uploadsDir)}`);
  console.log(`=================================`);
});

module.exports = app;