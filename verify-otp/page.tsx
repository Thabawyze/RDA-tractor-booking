'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
// import { toast, Toaster } from 'react-hot-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaEnvelope,
  FaMobile,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInfoCircle,
  FaShieldAlt,
  FaClock,
  FaRedo,
  FaExclamationTriangle,
  FaHome,
  FaKey
} from 'react-icons/fa';

// ==================== TYPES ====================

interface VerifyOTPForm {
  otp: string[];
}

// ==================== OTP INPUT COMPONENT ====================

interface OTPInputProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  onComplete: () => void;
  disabled?: boolean;
}

const OTPInput = ({ otp, setOtp, onComplete, disabled = false }: OTPInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Move to next input if current is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled
    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Trigger onComplete
      if (onComplete) onComplete();
    } else {
      toast.error('Please paste a valid 6-digit code');
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

// ==================== TIMER COMPONENT ====================

interface TimerProps {
  seconds: number;
  onResend: () => void;
  resendLoading: boolean;
}

const Timer = ({ seconds, onResend, resendLoading }: TimerProps) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center text-gray-700">
        <FaClock className="mr-2 text-green-600" />
        <span className="font-medium">Code expires in:</span>
        <span className={`ml-2 font-mono font-bold ${
          seconds < 60 ? 'text-orange-600' : 'text-gray-900'
        }`}>
          {formatTime(seconds)}
        </span>
      </div>
      
      <button
        onClick={onResend}
        disabled={seconds > 0 || resendLoading}
        className="flex items-center text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {resendLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <FaRedo className="mr-2" />
            Resend Code
          </>
        )}
      </button>
    </div>
  );
};

// ==================== SUCCESS MODAL ====================

interface SuccessModalProps {
  email: string;
  onClose: () => void;
}

const SuccessModal = ({ email, onClose }: SuccessModalProps) => {
  const router = useRouter();

  const handleContinue = () => {
    onClose();
    router.push('/reset-password');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center transform animate-slideUp">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <FaCheckCircle className="text-5xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
        <p className="text-gray-600 mb-2">
          Your email <span className="font-medium text-green-600">{email}</span> has been verified.
        </p>
        <p className="text-gray-600 mb-6">
          You can now reset your password.
        </p>
        <button
          onClick={handleContinue}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
        >
          Continue to Reset Password
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [showSuccess, setShowSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error('No email provided');
      setTimeout(() => router.push('/forgot-password'), 2000);
    } else {
      setVerifiedEmail(email);
    }
  }, [email, router]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: verifiedEmail,
        otp: otpString
      });

      if (response.data.success) {
        // Store token in session storage (more secure than localStorage for temporary data)
        sessionStorage.setItem('resetToken', response.data.token);
        sessionStorage.setItem('resetEmail', verifiedEmail);
        
        setShowSuccess(true);
        toast.success('Email verified successfully');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.response?.data?.error || 'Invalid verification code');
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      setTimeout(() => {
        const firstInput = document.querySelector('input') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: verifiedEmail
      });

      if (response.data.success) {
        setTimer(600); // Reset timer to 10 minutes
        setOtp(['', '', '', '', '', '']); // Clear OTP
        toast.success('New verification code sent');
        
        // Focus first input
        setTimeout(() => {
          const firstInput = document.querySelector('input') as HTMLInputElement;
          if (firstInput) firstInput.focus();
        }, 100);
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  // If no email, show loading
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* <Toaster position="top-right" /> */}

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <FaHome className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Email Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <FaEnvelope className="text-green-600 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Verification code sent to:</p>
              <p className="font-medium text-gray-900 truncate">{verifiedEmail}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
              <FaExclamationTriangle className="mr-2 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Verification Code
              </label>
              <OTPInput
                otp={otp}
                setOtp={setOtp}
                onComplete={handleVerify}
                disabled={loading || resendLoading}
              />
              <p className="mt-3 text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Timer and Resend */}
            <Timer
              seconds={timer}
              onResend={handleResendOTP}
              resendLoading={resendLoading}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.some(digit => digit === '')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <FaArrowRight className="ml-2" />
                </>
              )}
            </button>

            {/* Help Links */}
            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center">
                <FaArrowLeft className="mr-1" />
                Use different email
              </Link>
              <Link href="/login" className="text-gray-500 hover:text-gray-700">
                Back to Login
              </Link>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center">
            <FaShieldAlt className="mr-2 text-green-600" />
            <span>Your code is encrypted and secure</span>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <FaInfoCircle className="text-green-600 mr-2" />
            Didn't receive the code?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>The code expires after 10 minutes</li>
            <li>You can request a new code after the timer expires</li>
          </ul>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal 
          email={verifiedEmail} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}