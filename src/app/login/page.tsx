'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaTractor,
  FaLeaf,
  FaSeedling,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
  FaHandsHelping,
  FaHeart,
  FaUserFriends,
  FaGlobeAfrica,
  FaTree,
  FaWater
} from 'react-icons/fa';

interface LoginFormData {
  email: string;
  password: string;
  role: 'farmer' | 'admin';
}

interface LoginResponse {
  token: string;
  user: {
    role: 'farmer' | 'admin';
    full_name?: string;
    email?: string;
  };
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'farmer'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const router = useRouter();

  // Rotating background images
  const backgrounds = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
    'https://images.unsplash.com/photo-1523741543316-32e162f3b621?ixlib=rb-4.0.3&auto=format&fit=crop&w=2532&q=80',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const validateForm = useCallback((data: LoginFormData) => {
    const trimmedEmail = data.email.trim();
    const errors: string[] = [];

    if (!trimmedEmail) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.push('Invalid email format');
    if (!data.password.trim()) errors.push('Password is required');
    else if (data.password.length < 6) errors.push('Password must be at least 6 characters');

    return { trimmedEmail, errors };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error when user types
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { trimmedEmail, errors } = validateForm(formData);
    if (errors.length > 0) {
      setError(errors.join(', '));
      setLoading(false);
      return;
    }

    const submitData = { ...formData, email: trimmedEmail };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post<LoginResponse>(`${apiUrl}/api/auth/login`, {
        email: submitData.email,
        password: submitData.password
      });

      const tokenExpiry = rememberMe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (tokenExpiry) localStorage.setItem('tokenExpiry', tokenExpiry);

      if (response.data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/farmer');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" >
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
          <FaTree className="transform -rotate-12" />
        </div>
        <div className="absolute bottom-10 right-10 text-white/10 text-9xl font-bold animate-pulse-slow animation-delay-2000">
          <FaWater />
        </div>
        <div className="absolute top-1/2 left-1/4 text-white/5 text-8xl font-bold animate-spin-slow">
          <FaLeaf />
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
              Welcome Back
            </h2>
            <p className="text-green-200 text-lg">
              Sign in to continue your farming journey
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Welcome Message */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-green-500/20 rounded-full px-4 py-2 mb-4">
                <FaUserFriends className="text-green-300 mr-2 animate-pulse" />
                <span className="text-green-200 text-sm font-medium">Welcome back, Farmer!</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Login to RDA</h3>
              <p className="text-green-200">Access your dashboard and manage your farm</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center animate-shake">
                <FaTimesCircle className="mr-3 text-red-300 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection - Styled Radio Cards */}
              <div className="relative group">
                 {/* <label className="block text-sm font-medium text-green-200 mb-3 ml-1"> 
                  Login as
                </label> */}
                <div className="grid grid-cols-2 gap-3">
                 {/* <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                      formData.role === 'farmer'
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
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
                      <FaLeaf className={`text-2xl mb-2 transition-colors ${
                        formData.role === 'farmer' ? 'text-yellow-400' : 'text-green-300'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.role === 'farmer' ? 'text-yellow-400' : 'text-green-200'
                      }`}>Farmer</span>
                      <span className="text-xs text-green-300/70 mt-1">Access farm tools</span>
                    </div>
                    {formData.role === 'farmer' && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-900 text-xs" />
                      </div>
                    )}
                  </label>
                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                      formData.role === 'admin'
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
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
                      <FaShieldAlt className={`text-2xl mb-2 transition-colors ${
                        formData.role === 'admin' ? 'text-yellow-400' : 'text-green-300'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.role === 'admin' ? 'text-yellow-400' : 'text-green-200'
                      }`}>Admin</span>
                      <span className="text-xs text-green-300/70 mt-1">System management</span>
                    </div>
                    {formData.role === 'admin' && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-900 text-xs" />
                      </div>
                    )}
                  </label>*/}
                </div>
              </div>

              {/* Email Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Email Address
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
                    placeholder="Enter valid please"
                  />
                  {!error && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg animate-bounce-subtle" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-green-300/50 ml-1">We'll never share your email</p>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-green-200 mb-2 ml-1">
                  Password
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
                    autoComplete="current-password"
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
                  {!error && formData.password && formData.password.length >= 6 && (
                    <div className="absolute inset-y-0 right-0 pr-12 flex items-center">
                      <FaCheckCircle className="text-green-400 text-lg animate-bounce-subtle" />
                    </div>
                  )}
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                      rememberMe 
                        ? 'bg-yellow-400 border-yellow-400' 
                        : 'border-white/30 group-hover:border-yellow-400/50'
                    }`}>
                      {rememberMe && (
                        <FaCheckCircle className="text-green-900 text-xs absolute -top-1 -right-1" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-green-200 group-hover:text-yellow-400 transition">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-200 hover:text-yellow-400 transition flex items-center"
                >
                  Forgot password?
                  <FaArrowRight className="ml-1 text-xs" />
                </Link>
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
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <FaHandsHelping className="ml-2 group-hover:rotate-12 transition-transform" />
                  </span>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-green-200">
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    className="text-yellow-400 hover:text-yellow-300 font-bold hover:underline inline-flex items-center group"
                  >
                    Create Account
                    <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-6 mt-8">
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition">250+</div>
              <div className="text-xs text-green-300 group-hover:text-green-200 transition">Happy Farmers</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition">59</div>
              <div className="text-xs text-green-300 group-hover:text-green-200 transition">Centers</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition">24/7</div>
              <div className="text-xs text-green-300 group-hover:text-green-200 transition">Support</div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-xs text-green-300/50">
              <FaShieldAlt className="text-green-400/50" />
              <span>SSL Secured • 256-bit Encryption</span>
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
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
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
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