'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
// import { toast, Toaster } from 'react-hot-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaLock,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaKey,
  FaExclamationTriangle,
  FaHome
} from 'react-icons/fa';

// ==================== TYPES ====================

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

// ==================== PASSWORD REQUIREMENTS ====================

const PASSWORD_REQUIREMENTS = [
  { id: 'minLength', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'lowercase', label: 'Contains lowercase letter', regex: /[a-z]/ },
  { id: 'uppercase', label: 'Contains uppercase letter', regex: /[A-Z]/ },
  { id: 'number', label: 'Contains number', regex: /\d/ },
  { id: 'special', label: 'Contains special character', regex: /[@$!%*?&]/ }
];

// ==================== STRENGTH INDICATOR ====================

interface StrengthIndicatorProps {
  strength: number;
}

const StrengthIndicator = ({ strength }: StrengthIndicatorProps) => {
  const getStrengthColor = () => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password Strength:</span>
        <span className={`text-sm font-medium ${
          strength < 30 ? 'text-red-600' :
          strength < 60 ? 'text-yellow-600' :
          strength < 80 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {getStrengthLabel()}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};

// ==================== REQUIREMENT CHECK ====================

interface RequirementCheckProps {
  met: boolean;
  label: string;
}

const RequirementCheck = ({ met, label }: RequirementCheckProps) => (
  <div className="flex items-center text-sm">
    {met ? (
      <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <FaTimesCircle className="text-gray-300 mr-2 flex-shrink-0" />
    )}
    <span className={met ? 'text-green-700' : 'text-gray-500'}>{label}</span>
  </div>
);

// ==================== SUCCESS MODAL ====================

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal = ({ onClose }: SuccessModalProps) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center transform animate-slideUp">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <FaCheckCircle className="text-5xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
        >
          Go to Login
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<ResetPasswordForm>({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    minLength: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      setTimeout(() => router.push('/forgot-password'), 2000);
    }
  }, [token, router]);

  // Check password requirements and calculate strength
  useEffect(() => {
    const newRequirements = {
      minLength: PASSWORD_REQUIREMENTS[0].regex.test(formData.newPassword),
      lowercase: PASSWORD_REQUIREMENTS[1].regex.test(formData.newPassword),
      uppercase: PASSWORD_REQUIREMENTS[2].regex.test(formData.newPassword),
      number: PASSWORD_REQUIREMENTS[3].regex.test(formData.newPassword),
      special: PASSWORD_REQUIREMENTS[4].regex.test(formData.newPassword)
    };
    setRequirements(newRequirements);

    // Calculate strength percentage
    const metCount = Object.values(newRequirements).filter(Boolean).length;
    const strengthPercentage = (metCount / PASSWORD_REQUIREMENTS.length) * 100;
    setPasswordStrength(strengthPercentage);
  }, [formData.newPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 100) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setShowSuccess(true);
        toast.success('Password reset successfully');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // If no token, show loading or redirect
  if (!token) {
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
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Create a new strong password for your account
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-shake">
                <FaExclamationTriangle className="mr-2 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <StrengthIndicator strength={passwordStrength} />
            )}

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
              {PASSWORD_REQUIREMENTS.map(req => (
                <RequirementCheck
                  key={req.id}
                  met={requirements[req.id as keyof typeof requirements]}
                  label={req.label}
                />
              ))}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {formData.newPassword && formData.confirmPassword && (
              <div className={`text-sm flex items-center ${
                formData.newPassword === formData.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="mr-2" />
                    Passwords do not match
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || passwordStrength < 100}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <FaArrowRight className="ml-2" />
                </>
              )}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center">
                <FaArrowLeft className="mr-1" />
                Back to Login
              </Link>
              <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700">
                Request new link
              </Link>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center">
          <FaShieldAlt className="mr-2 text-green-600" />
          <span>Your new password is encrypted with 256-bit security</span>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

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