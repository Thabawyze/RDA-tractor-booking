'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTractor, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMobile, FaIdCard } from 'react-icons/fa';

export default function DriverLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/driver/login`, {
        email,
        password,
        role: 'driver'
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back, Driver!');
        
        // Redirect to driver dashboard
        router.push('/driver/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/driver/send-verification`, {
        phone: phone.replace(/\D/g, '')
      });
      
      if (response.data.success) {
        setShowVerification(true);
        toast.success('Verification code sent to your phone');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/driver/verify-phone`, {
        phone: phone.replace(/\D/g, ''),
        code: verificationCode
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful!');
        router.push('/driver/dashboard');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" />
      
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <FaTractor className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your assignments</p>
        </div>
        
        {/* Login Method Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => {
                setLoginMethod('email');
                setShowVerification(false);
              }}
              className={`flex-1 py-2 font-medium transition ${
                loginMethod === 'email' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FaEnvelope className="inline mr-2" /> Email Login
            </button>
            <button
              onClick={() => {
                setLoginMethod('phone');
                setShowVerification(false);
              }}
              className={`flex-1 py-2 font-medium transition ${
                loginMethod === 'phone' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FaMobile className="inline mr-2" /> Phone Login
            </button>
          </div>
          
          {loginMethod === 'email' && !showVerification && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="driver@rda.co.sz"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}
          
          {loginMethod === 'phone' && !showVerification && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">+268</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="76 123 456"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter your registered MTN number</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}
          
          {showVerification && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your phone</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode('');
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to phone number
              </button>
            </form>
          )}
        </div>
        
        {/* Footer Links */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-green-600 hover:underline">
            ← Back to Home
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Need help? Contact RDA Support: +268 2404 1234
          </p>
        </div>
      </div>
    </div>
  );
}