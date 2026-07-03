'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaTractor,
  FaLeaf,
  FaSeedling,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaHandsHelping,
  FaHeart
} from 'react-icons/fa';

interface RegisterFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'farmer' | 'admin';
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const router = useRouter();

  // Rotating background images
  const backgrounds = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1523741543316-32e162f3b621?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const validateForm = useCallback((data: RegisterFormData) => {
    const newErrors: { [key: string]: string } = {};

    const trimmedData = {
      ...data,
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password.trim(),
      confirmPassword: data.confirmPassword.trim()
    };

    if (!trimmedData.full_name) newErrors.full_name = 'Full name is required';
    else if (trimmedData.full_name.length < 3) newErrors.full_name = 'Name must be at least 3 characters';
    
    if (!trimmedData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) newErrors.email = 'Invalid email format';
    
    if (!trimmedData.password) newErrors.password = 'Password is required';
    else if (trimmedData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(trimmedData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (!trimmedData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (trimmedData.password !== trimmedData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (trimmedData.phone && !/^[0-9+\-\s()]{10,15}$/.test(trimmedData.phone)) newErrors.phone = 'Invalid phone number format';

    return { trimmedData, newErrors };
  }, []);

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
    else feedback.push('Add special characters');

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccess(null);

    const { trimmedData, newErrors } = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setFormData(trimmedData);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        full_name: trimmedData.full_name,
        email: trimmedData.email,
        phone: trimmedData.phone,
        password: trimmedData.password,
        role: trimmedData.role
      });

      setSuccess('Registration successful! Redirecting to login...');
      setErrors({});
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
              index === backgroundIndex ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-white/10 text-9xl font-bold animate-pulse-slow">
          <FaTractor className="transform -rotate-12" />
        </div>
        <div className="absolute bottom-10 right-10 text-white/10 text-9xl font-bold animate-pulse-slow animation-delay-2000">
          <FaSeedling />
        </div>

        <div className="max-w-md w-full space-y-8 relative">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="absolute -top-16 left-0 text-white/80 hover:text-white transition flex items-center group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Brand Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full inline-flex shadow-2xl">
                  <FaTractor className="text-5xl text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-2">
              Join RDA Family
            </h2>
            <p className="text-green-200 text-lg">
              Start your farming journey with us
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Welcome Message */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-green-500/20 rounded-full px-4 py-2 mb-4">
                <FaHeart className="text-green-300 mr-2 animate-pulse" />
                <span className="text-green-200 text-sm font-medium">Welcome to the family!</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Create Account</h3>
              <p className="text-green-200">Join thousands of farmers already using RDA</p>
            </div>

            {/* Alerts */}
            {generalError && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center animate-shake">
                <FaTimesCircle className="mr-3 text-red-300 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center animate-bounce-subtle">
                <FaCheckCircle className="mr-3 text-green-300 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Full Name <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className={`text-lg transition-colors duration-300 ${
                      focusedField === 'full_name' ? 'text-yellow-400' : 'text-green-300'
                    }`} />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('full_name')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
                    placeholder="Fullname please"
                  />
                  {!errors.full_name && formData.full_name && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg" />
                    </div>
                  )}
                </div>
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Email Address <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className={`text-lg transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-yellow-400' : 'text-green-300'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
                    placeholder="email"
                  />
                  {!errors.email && formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className={`text-lg transition-colors duration-300 ${
                      focusedField === 'phone' ? 'text-yellow-400' : 'text-green-300'
                    }`} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
                    placeholder="+268 7612 3456"
                  />
                  {!errors.phone && formData.phone && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg" />
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Role Selection - Styled Radio Cards
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                      formData.role === 'farmer'
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="farmer"
                      checked={formData.role === 'farmer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <FaLeaf className={`text-2xl mb-2 ${
                        formData.role === 'farmer' ? 'text-yellow-400' : 'text-green-300'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.role === 'farmer' ? 'text-yellow-400' : 'text-green-200'
                      }`}>Farmer</span>
                    </div>
                  </label>
                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                      formData.role === 'admin'
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <FaShieldAlt className={`text-2xl mb-2 ${
                        formData.role === 'admin' ? 'text-yellow-400' : 'text-green-300'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.role === 'admin' ? 'text-yellow-400' : 'text-green-200'
                      }`}>Admin</span>
                    </div>
                  </label>
                </div>
              </div> */}

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Password <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`text-lg transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-yellow-400' : 'text-green-300'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-300 hover:text-yellow-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-500 ease-out rounded-full`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-300 font-medium">
                        {passwordStrength < 30 ? 'Weak' : passwordStrength < 60 ? 'Medium' : passwordStrength < 80 ? 'Strong' : 'Very Strong'}
                      </span>
                    </div>
                    {passwordFeedback.length > 0 && (
                      <div className="text-xs text-green-300 bg-white/5 rounded-lg p-2">
                        {passwordFeedback.map((feedback, index) => (
                          <div key={index} className="flex items-center mt-1 first:mt-0">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full mr-2" />
                            {feedback}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Confirm Password <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`text-lg transition-colors duration-300 ${
                      focusedField === 'confirmPassword' ? 'text-yellow-400' : 'text-green-300'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-300 hover:text-yellow-400 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                  {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-12 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg" />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-300 flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border-2 border-transparent text-lg font-bold rounded-xl text-green-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl mt-8 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create Account
                    <FaHandsHelping className="ml-2 group-hover:rotate-12 transition-transform" />
                  </span>
                )}
              </button>

              {/* Terms and Login Link */}
              <div className="text-center mt-6 space-y-3">
                <p className="text-sm text-green-200">
                  By joining, you agree to our{' '}
                  <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                <p className="text-sm text-green-200">
                  Already have an account?{' '}
                  <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-bold hover:underline inline-flex items-center group">
                    Sign In
                    <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-xs text-green-300">Happy Farmers</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">59</div>
              <div className="text-xs text-green-300">Centers</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-green-300">Support</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .duration-2000 {
          transition-duration: 2000ms;
        }
      `}</style>
    </div>
  );
}