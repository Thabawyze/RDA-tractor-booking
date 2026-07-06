'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaMobileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaShieldAlt,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';

// ==================== TYPES ====================

interface Booking {
  id: number;
  booking_reference?: string;
  total_cost?: number;
  farmer_phone?: string;
}

interface MoMoPaymentProps {
  booking: Booking | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    referenceId: string;
    status: string;
  };
}

interface StatusResponse {
  success: boolean;
  data?: {
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    referenceId?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const MoMoPayment = ({ booking, onSuccess, onCancel }: MoMoPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'checking' | 'success' | 'failed'>('idle');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-fill user's phone if available
    if (booking?.farmer_phone) {
      setPhoneNumber(formatPhoneDisplay(booking.farmer_phone));
    }

    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [booking]);

  const formatPhoneDisplay = (phone: string): string => {
    // Format for display: 7612 3456
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('268')) {
      return cleaned.substring(3);
    }
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // Must be 76XXXXXX or 78XXXXXX (8 digits)
    return /^(76|78)\d{6}$/.test(cleaned);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 8) {
      setPhoneNumber(value);
      setError('');
    }
  };

  const initiatePayment = async (): Promise<void> => {
    try {
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Invalid phone number. Please enter 76XXXXXX or 78XXXXXX');
        return;
      }

      if (!booking?.id) {
        setError('Booking information is missing');
        return;
      }

      setLoading(true);
      setError('');
      setPaymentStatus('pending');

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
        setPaymentStatus('checking');
        
        // Start checking payment status
        startStatusCheck(response.data.data.referenceId);
      } else {
        setError(response.data.message || 'Failed to initiate payment');
        setPaymentStatus('idle');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment');
      setPaymentStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const startStatusCheck = (refId: string): void => {
    let attempts = 0;
    const maxAttempts = 60; // Check for 5 minutes (60 * 5 seconds)

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
        } else if (status === 'FAILED') {
          clearInterval(interval);
          setPaymentStatus('failed');
          setError('Payment failed. Please try again.');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setError('Payment timeout. Please check your phone and try again.');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const checkPaymentStatus = async (refId: string): Promise<'PENDING' | 'SUCCESSFUL' | 'FAILED'> => {
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

  const cancelPayment = (): void => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    setPaymentStatus('idle');
    setReferenceId(null);
    setError('');
    if (onCancel) onCancel();
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return '0.00';
    return amount.toFixed(2);
  };

  const totalCost = booking?.total_cost || 0;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg p-6 text-white">
        <div className="flex items-center justify-center mb-4">
          <FaMobileAlt className="text-4xl mr-3" />
          <h2 className="text-2xl font-bold">MTN MoMo Payment</h2>
        </div>
        <p className="text-center text-green-100">
          Pay securely with Mobile Money
        </p>
      </div>

      {/* Payment Amount */}
      <div className="bg-white border-x border-gray-200 p-6">
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-green-600">
            E{formatCurrency(totalCost)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Booking: {booking?.booking_reference || `#${booking?.id}`}
          </p>
        </div>

        {/* Payment Status Views */}
        {paymentStatus === 'idle' && (
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
                  placeholder="76123456"
                  maxLength={8}
                  className="block w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
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
                    Your payment is processed securely through MTN Mobile Money. 
                    You will receive a prompt on your phone to approve the payment.
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
                  Pay E{formatCurrency(totalCost)}
                </>
              )}
            </button>
          </>
        )}

        {paymentStatus === 'pending' && (
          <div className="text-center py-8">
            <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaHourglassHalf className="text-4xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Request Sent
            </h3>
            <p className="text-gray-600 mb-4">
              Please check your phone (+268 {phoneNumber}) for the MoMo prompt
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                Instructions:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Check your phone for MoMo notification</li>
                <li>Enter your MoMo PIN</li>
                <li>Confirm the payment</li>
              </ol>
            </div>
          </div>
        )}

        {paymentStatus === 'checking' && (
          <div className="text-center py-8">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="text-4xl text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment
            </p>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
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
                <strong>Reference:</strong> {referenceId}
              </p>
              <p className="text-sm text-green-800 mt-1">
                <strong>Amount:</strong> E{formatCurrency(totalCost)}
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-4xl text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'The payment could not be completed'}
            </p>
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setError('');
                setReferenceId(null);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-b-lg border-x border-b border-gray-200 p-4">
        {paymentStatus === 'idle' && (
          <button
            onClick={cancelPayment}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
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
          <FaInfoCircle className="mr-1" />
          <span>Powered by MTN Mobile Money</span>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;