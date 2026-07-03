'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
// import { toast, Toaster } from 'react-hot-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaEnvelope,
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
  FaUserCheck,
  FaKey,
  FaEnvelopeOpenText,
  FaMobile,
  FaPhone,
  FaExclamationTriangle
} from 'react-icons/fa';

// ==================== TYPES ====================

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerifyOTPForm {
  email: string;
  otp: string;
}

// ==================== STEP INDICATOR ====================

interface StepIndicatorProps {
  currentStep: number;
  steps: { number: number; label: string; icon: any }[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-green-600 border-green-600 text-white'
                  : step.number === currentStep
                  ? 'bg-white border-green-600 text-green-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <FaCheckCircle className="text-white text-xl" />
              ) : (
                <step.icon className="text-xl" />
              )}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={step.number === currentStep ? 'text-green-600' : 'text-gray-500'}>
                {step.label}
              </span>
            </div>
          </div>

          {/* Connector Line (except for last step) */}
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-2 transition-all duration-300 ${
                step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== FORGOT PASSWORD STEP 1 ====================

interface ForgotPasswordStep1Props {
  formData: ForgotPasswordForm;
  setFormData: (data: ForgotPasswordForm) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ForgotPasswordStep1 = ({ formData, setFormData, onSubmit, loading, error }: ForgotPasswordStep1Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Forgot your password?</h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            placeholder="farmer@example.com"
            required
            disabled={loading}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 flex items-center">
          <FaInfoCircle className="mr-1 text-green-500" />
          We'll send a 6-digit verification code to this email
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            Send Verification Code
            <FaArrowRight className="ml-2" />
          </>
        )}
      </button>

      <div className="text-center">
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center">
          <FaArrowLeft className="mr-1 text-sm" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

// ==================== VERIFY OTP STEP 2 ====================

interface VerifyOTPStep2Props {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
  resendLoading: boolean;
  error: string | null;
  timer: number;
}

const VerifyOTPStep2 = ({ 
  email, 
  otp, 
  setOtp, 
  onSubmit, 
  onResend,
  loading, 
  resendLoading,
  error, 
  timer 
}: VerifyOTPStep2Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaEnvelopeOpenText className="text-4xl text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to <span className="font-medium text-green-600">{email}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          placeholder="000000"
          maxLength={6}
          required
          disabled={loading}
        />
        <p className="mt-2 text-xs text-gray-500 text-center">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onResend}
          disabled={timer > 0 || resendLoading}
          className="text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendLoading ? (
            <span className="flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Resending...
            </span>
          ) : timer > 0 ? (
            `Resend code in ${timer}s`
          ) : (
            'Resend Code'
          )}
        </button>

        <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700 text-sm">
          Use different email
        </Link>
      </div>
    </form>
  );
};

// ==================== RESET PASSWORD STEP 3 ====================

interface ResetPasswordStep3Props {
  formData: ResetPasswordForm;
  setFormData: (data: ResetPasswordForm) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passwordStrength: number;
  passwordFeedback: string[];
}

const ResetPasswordStep3 = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  error,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  passwordFeedback
}: ResetPasswordStep3Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaKey className="text-4xl text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Your Password</h3>
        <p className="text-gray-600">
          Create a new strong password for your account
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            placeholder="••••••••"
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Password Strength:</span>
            <span className={`text-sm font-medium ${
              passwordStrength < 30 ? 'text-red-600' :
              passwordStrength < 60 ? 'text-yellow-600' :
              passwordStrength < 80 ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {passwordStrength < 30 ? 'Weak' :
               passwordStrength < 60 ? 'Fair' :
               passwordStrength < 80 ? 'Good' :
               'Strong'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                passwordStrength < 30 ? 'bg-red-500' :
                passwordStrength < 60 ? 'bg-yellow-500' :
                passwordStrength < 80 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
          {passwordFeedback.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <ul className="list-disc list-inside">
                {passwordFeedback.map((feedback, index) => (
                  <li key={index}>{feedback}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            placeholder="••••••••"
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

      {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
        <div className="text-sm text-red-600 flex items-center">
          <FaTimesCircle className="mr-2" />
          Passwords do not match
        </div>
      )}

      {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
        <div className="text-sm text-green-600 flex items-center">
          <FaCheckCircle className="mr-2" />
          Passwords match
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || passwordStrength < 60}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
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
    </form>
  );
};

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-5xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [forgotForm, setForgotForm] = useState<ForgotPasswordForm>({ email: '' });
  const [resetForm, setResetForm] = useState<ResetPasswordForm>({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  // Steps configuration
  const steps = [
    { number: 1, label: 'Email', icon: FaEnvelope },
    { number: 2, label: 'Verify', icon: FaMobile },
    { number: 3, label: 'Reset', icon: FaKey }
  ];

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Password strength checker
  useEffect(() => {
    if (resetForm.newPassword) {
      calculatePasswordStrength(resetForm.newPassword);
    } else {
      setPasswordStrength(0);
      setPasswordFeedback([]);
    }
  }, [resetForm.newPassword]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const feedback = [];

    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) strength += 25;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) strength += 25;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) strength += 12.5;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) strength += 12.5;
    else feedback.push('Add special characters (@$!%*?&)');

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Step 1: Request password reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: forgotForm.email
      });

      if (response.data.success) {
        // Store token temporarily (in memory, not localStorage for security)
        setResetForm(prev => ({ ...prev, token: response.data.token }));
        setStep(2);
        setTimer(60); // Start 60 second timer for resend
        toast.success('Verification code sent to your email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: forgotForm.email,
        otp: otp
      });

      if (response.data.success) {
        setStep(3);
        toast.success('Email verified successfully');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: forgotForm.email
      });

      if (response.data.success) {
        setTimer(60);
        toast.success('New verification code sent');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 60) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token: resetForm.token,
        newPassword: resetForm.newPassword
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* <Toaster position="top-right" /> */}

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Secure your account with a new password
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} steps={steps} />

          {/* Step Content */}
          {step === 1 && (
            <ForgotPasswordStep1
              formData={forgotForm}
              setFormData={setForgotForm}
              onSubmit={handleForgotSubmit}
              loading={loading}
              error={error}
            />
          )}

          {step === 2 && (
            <VerifyOTPStep2
              email={forgotForm.email}
              otp={otp}
              setOtp={setOtp}
              onSubmit={handleVerifySubmit}
              onResend={handleResendOTP}
              loading={loading}
              resendLoading={resendLoading}
              error={error}
              timer={timer}
            />
          )}

          {step === 3 && (
            <ResetPasswordStep3
              formData={resetForm}
              setFormData={setResetForm}
              onSubmit={handleResetSubmit}
              loading={loading}
              error={error}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordStrength={passwordStrength}
              passwordFeedback={passwordFeedback}
            />
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center">
          <FaShieldAlt className="mr-2 text-green-600" />
          <span>Your information is protected with 256-bit encryption</span>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </div>
  );
}