'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
// import { toast, Toaster } from 'react-hot-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaEnvelope,
  FaRedo,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaMobile,
  FaPaperPlane,
  FaInbox,
  FaEnvelopeOpenText
} from 'react-icons/fa';

// ==================== TYPES ====================

interface ResendOTPForm {
  email: string;
}

// ==================== SUCCESS MODAL ====================

interface SuccessModalProps {
  email: string;
  onClose: () => void;
}

const SuccessModal = ({ email, onClose }: SuccessModalProps) => {
  const router = useRouter();

  const handleVerify = () => {
    onClose();
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center transform animate-slideUp">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <FaPaperPlane className="text-4xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Resent Successfully!</h2>
        <p className="text-gray-600 mb-2">
          A new verification code has been sent to:
        </p>
        <p className="font-medium text-green-600 mb-4 break-all">{email}</p>
        <p className="text-gray-600 mb-6">
          Please check your inbox and enter the 6-digit code.
        </p>
        <button
          onClick={handleVerify}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
        >
          Go to Verification
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// ==================== COOLDOWN TIMER ====================

interface CooldownTimerProps {
  seconds: number;
}

const CooldownTimer = ({ seconds }: CooldownTimerProps) => {
  const formatTime = (totalSeconds: number) => {
    const secs = totalSeconds % 60;
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  };

  if (seconds <= 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center">
      <FaClock className="text-yellow-600 mr-2 flex-shrink-0" />
      <p className="text-sm text-yellow-700">
        Please wait <span className="font-bold">{formatTime(seconds)}</span> before requesting another code.
      </p>
    </div>
  );
};

// ==================== EMAIL HINT ====================

interface EmailHintProps {
  email: string;
}

const EmailHint = ({ email }: EmailHintProps) => {
  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain?.includes('gmail')) return 'Gmail';
    if (domain?.includes('yahoo')) return 'Yahoo Mail';
    if (domain?.includes('outlook') || domain?.includes('hotmail')) return 'Outlook';
    if (domain?.includes('icloud')) return 'iCloud';
    return null;
  };

  const provider = getEmailProvider(email);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-800 mb-2 flex items-center">
        <FaInfoCircle className="mr-2" />
        Quick Tips
      </h3>
      <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
        <li>Check your spam or junk folder if you don't see the email</li>
        <li>The code expires after 10 minutes</li>
        {provider && (
          <li>
            For {provider}, emails usually arrive within 1-2 minutes
          </li>
        )}
        <li>Add <span className="font-mono bg-blue-100 px-1 rounded">noreply@rda.co.sz</span> to your contacts</li>
      </ul>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function ResendOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState<ResendOTPForm>({
    email: emailParam || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting again`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: formData.email
      });

      if (response.data.success) {
        // Set cooldown (60 seconds)
        setCooldown(60);
        setResendCount(prev => prev + 1);
        setShowSuccess(true);
        toast.success('New verification code sent');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    router.push('/forgot-password');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Resend Verification Code</h1>
          <p className="text-gray-600 mt-2">
            Didn't receive the code? Request a new one
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Cooldown Timer */}
          <CooldownTimer seconds={cooldown} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
              <FaExclamationTriangle className="mr-2 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resend Count Warning */}
          {resendCount >= 3 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center">
              <FaInfoCircle className="text-orange-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                You've requested {resendCount} codes. For security, you may be temporarily limited.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="farmer@example.com"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <FaInfoCircle className="mr-1 text-green-500" />
                Enter the email address you used to register
              </p>
            </div>

            {/* Email Provider Hint */}
            {formData.email && <EmailHint email={formData.email} />}

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center text-gray-600">
                <FaClock className="mr-2 text-green-600" />
                <span className="text-sm">Code expires in:</span>
              </div>
              <span className="font-mono font-bold text-gray-900">10 minutes</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FaRedo className="mr-2" />
                  Resend Verification Code
                </>
              )}
            </button>

            {/* Help Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={handleUseDifferentEmail}
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
              >
                <FaArrowLeft className="mr-1" />
                Use different email
              </button>
              
              <Link href="/login" className="text-gray-500 hover:text-gray-700">
                Back to Login
              </Link>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center">
            <FaShieldAlt className="mr-2 text-green-600" />
            <span>Your information is protected with 256-bit encryption</span>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <FaInbox className="text-green-600 mr-2" />
            Common Issues
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                <span className="font-medium">Check spam folder:</span> Sometimes emails end up in spam.
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                <span className="font-medium">Wrong email?</span> Make sure you entered the correct email address.
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                <span className="font-medium">Still not receiving?</span> Contact support at 
                <a href="mailto:support@rda.co.sz" className="text-green-600 hover:underline ml-1">
                  support@rda.co.sz
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex justify-center space-x-4">
          <Link 
            href="/contact" 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <FaEnvelopeOpenText className="mr-1" />
            Contact Support
          </Link>
          <span className="text-gray-300">|</span>
          <Link 
            href="/faq" 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <FaInfoCircle className="mr-1" />
            FAQ
          </Link>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal 
          email={formData.email} 
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