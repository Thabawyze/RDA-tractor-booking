'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';  // Add this line
import { 
  FaMobileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaShieldAlt,
  FaInfoCircle,
  FaSpinner,
  FaArrowLeft,
  FaKey
} from 'react-icons/fa';

// ==================== TYPES ====================

interface Booking {
  id: number;
  total_amount: number;
  booking_reference?: string;
}

interface MoMoPaymentProps {
  booking: Booking;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    referenceId: string;
    status: string;
    paymentId: number;
    otpRequired: boolean;
    expiresAt: number;
  };
  error?: string;
}

interface StatusResponse {
  success: boolean;
  data?: {
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'VERIFIED';
    amount: number;
    phoneNumber: string;
    transactionId?: string;
    otpVerified?: boolean;
    expiresAt: number;
  };
  error?: string;
}

interface OTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  attemptsLeft?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const MoMoPayment = ({ booking, onSuccess, onCancel }: MoMoPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'checking' | 'success' | 'failed' | 'expired' | 'cancelled'>('idle');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Countdown timer for payment expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && paymentStatus === 'checking') {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, paymentStatus]);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return /^(76|78)\d{6}$/.test(cleaned);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setPhoneNumber(value);
      setError('');
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const initiatePayment = async (): Promise<void> => {
    try {
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Invalid phone number. Please enter 76XXXXXX or 78XXXXXX');
        return;
      }

      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.post<PaymentResponse>(
        `${API_URL}/api/payments/momo/initiate`,
        {
          bookingId: booking.id,
          phoneNumber: phoneNumber
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.data) {
        setReferenceId(response.data.data.referenceId);
        setOtpStep(true);
        setCountdown(Math.floor((response.data.data.expiresAt - Date.now()) / 1000));
        toast.success('OTP sent to your phone!');
      } else {
        setError(response.data.error || 'Failed to initiate payment');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (): Promise<void> => {
    try {
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.post<OTPResponse>(
        `${API_URL}/api/payments/momo/verify-otp`,
        {
          referenceId,
          otp
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPaymentStatus('checking');
        toast.success('OTP verified! Processing payment...');
        
        // Complete the payment
        await completePayment();
        
        // Start checking payment status
        startStatusCheck(referenceId!);
      } else {
        setError(response.data.error || 'Invalid OTP');
        if (response.data.attemptsLeft !== undefined) {
          setAttemptsLeft(response.data.attemptsLeft);
          toast.error(`${response.data.attemptsLeft} attempts remaining`);
        }
      }

    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/api/payments/momo/${referenceId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Payment completion error:', error);
    }
  };

  const startStatusCheck = (refId: string): void => {
    let attempts = 0;
    const maxAttempts = 30; // 2.5 minutes (30 * 5 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const status = await checkPaymentStatus(refId);

        if (status === 'SUCCESSFUL') {
          clearInterval(interval);
          setPaymentStatus('success');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 2000);
        } else if (status === 'FAILED' || status === 'EXPIRED') {
          clearInterval(interval);
          setPaymentStatus(status === 'EXPIRED' ? 'expired' : 'failed');
          setError(status === 'EXPIRED' ? 'Payment expired' : 'Payment failed');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setError('Payment timeout. Please try again.');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const checkPaymentStatus = async (refId: string): Promise<string> => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get<StatusResponse>(
        `${API_URL}/api/payments/momo/status/${refId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.status;
      }
      return 'PENDING';

    } catch (error) {
      console.error('Status check error:', error);
      return 'PENDING';
    }
  };

  const cancelPayment = async (): Promise<void> => {
    try {
      if (referenceId) {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/api/payments/momo/${referenceId}/cancel`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
      setPaymentStatus('cancelled');
      setOtpStep(false);
      setReferenceId(null);
      setError('');
      setCountdown(0);
      setAttemptsLeft(3);
      setOtp('');
      if (onCancel) onCancel();
    }
  };

  const resetPayment = (): void => {
    setPaymentStatus('idle');
    setOtpStep(false);
    setReferenceId(null);
    setError('');
    setCountdown(0);
    setAttemptsLeft(3);
    setOtp('');
  };

  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex items-center justify-center mb-4">
          <FaMobileAlt className="text-4xl mr-3" />
          <h2 className="text-2xl font-bold">RDA MoMo Payment</h2>
        </div>
        <p className="text-center text-green-100">
          Pay securely with Mobile Money
        </p>
      </div>

      {/* Payment Amount */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-green-600">
            E{formatCurrency(booking.total_amount)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Booking #{booking.booking_reference || booking.id}
          </p>
        </div>
      </div>

      {/* Payment Status Views */}
      <div className="p-6">
        {paymentStatus === 'idle' && !otpStep && (
          <>
            {/* Phone Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MTN Mobile Money Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">+268</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="76 123 456"
                  maxLength={8}
                  className="block w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <FaInfoCircle className="mr-1 text-green-500" />
                Enter your MTN number (76XXXXXX or 78XXXXXX)
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  {error}
                </p>
              )}
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FaShieldAlt className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p className="text-xs">
                    You will receive a 6-digit OTP on your phone. Enter it to complete the payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={initiatePayment}
              disabled={loading || !validatePhoneNumber(phoneNumber)}
              className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaMobileAlt className="mr-2" />
                  Pay E{formatCurrency(booking.total_amount)}
                </>
              )}
            </button>
          </>
        )}

        {otpStep && paymentStatus === 'idle' && (
          <>
            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  maxLength={6}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium text-center tracking-widest"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <FaInfoCircle className="mr-1 text-green-500" />
                Enter the 6-digit code sent to +268 {phoneNumber.slice(0,4)} {phoneNumber.slice(4)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Attempts remaining: {attemptsLeft}
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  {error}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <FaKey className="mr-2" />
                  Verify OTP
                </>
              )}
            </button>

            <button
              onClick={() => setOtpStep(false)}
              className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
          </>
        )}

        {paymentStatus === 'checking' && (
          <div className="text-center py-8">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="text-4xl text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we process your payment
            </p>
            {countdown > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Time remaining: {formatTime(countdown)}
              </p>
            )}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your booking has been confirmed
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Reference:</strong> {referenceId?.slice(0,8)}...
              </p>
              <p className="text-sm text-green-800 mt-1">
                <strong>Amount:</strong> E{formatCurrency(booking.total_amount)}
              </p>
            </div>
          </div>
        )}

        {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
          <div className="text-center py-8">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-4xl text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Payment {paymentStatus === 'expired' ? 'Expired' : 'Failed'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || `The payment could not be completed`}
            </p>
            <button
              onClick={resetPayment}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-4xl text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h3>
            <p className="text-gray-600 mb-4">
              You have cancelled the payment
            </p>
            <button
              onClick={resetPayment}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        {paymentStatus === 'idle' && !otpStep && (
          <button
            onClick={cancelPayment}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" />
            Cancel
          </button>
        )}
        {(paymentStatus === 'pending' || paymentStatus === 'checking') && (
          <button
            onClick={cancelPayment}
            className="w-full py-2 text-red-600 hover:text-red-800 transition-colors font-medium"
          >
            Cancel Payment
          </button>
        )}
        
        <div className="flex items-center justify-center text-xs text-gray-500 mt-3">
          <FaShieldAlt className="mr-1 text-green-500" />
          <span>Secured by RDA Payment System</span>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;