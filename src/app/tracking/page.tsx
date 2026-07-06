'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaTractor,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaRoute,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaArrowLeft,
  FaSearch,
  FaInfoCircle,
  FaWhatsapp,
  FaLocationArrow,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaComment,
  FaThumbsUp,
  FaFlag,
  FaCheck,
  FaFileAlt,
} from 'react-icons/fa';

interface TrackingInfo {
  booking_id: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  tractor_details?: {
    id: string;
    model: string;
    registration: string;
    capacity: string;
  };
  driver_details?: {
    name: string;
    phone: string;
    photo?: string;
    rating?: number;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
    current_location: string;
  };
  estimated_arrival?: {
    time: string;
    distance: string;
    duration: string;
  };
  queue_info?: {
    position: number;
    total_waiting: number;
    estimated_wait: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
  last_update: string;
  farmer_details?: {
    name: string;
    phone: string;
    location: string;
  };
  feedback_submitted?: boolean;
  feedback?: FeedbackData;
}

interface FeedbackData {
  id: number;
  rating: number;
  comment: string;
  service_received: boolean;
  completion_time: string;
  issues: string;
  photos?: string[];
  response_time?: string;
  driver_rating?: number;
  would_recommend?: boolean;
  created_at: string;
  admin_response?: string;
}

interface FeedbackForm {
  rating: number;
  comment: string;
  service_received: boolean;
  completion_time: string;
  issues: string;
  driver_rating: number;
  would_recommend: boolean;
  response_time: string;
  photos: File[];
}

interface BookingBasic {
  id: number;
  status: string;
  available_time: string;
  location_description: string;
  total_amount: number;
}

export default function TractorTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingBasic[]>([]);
  const [activeTab, setActiveTab] = useState<'track' | 'history' | 'feedback'>('track');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    rating: 5,
    comment: '',
    service_received: false,
    completion_time: '',
    issues: '',
    driver_rating: 5,
    would_recommend: true,
    response_time: '',
    photos: []
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackData[]>([]);

  // Load recent bookings for farmer
  useEffect(() => {
    loadRecentBookings();
    loadFeedbackHistory();
  }, []);

  // Auto-refresh tracking info
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    if (autoRefresh && trackingInfo && ['assigned', 'en_route', 'arrived', 'in_progress'].includes(trackingInfo.status)) {
      interval = setInterval(() => {
        refreshTrackingInfo();
      }, 30000);
      
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [autoRefresh, trackingInfo?.booking_id, trackingInfo?.status]);

  const loadRecentBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        return;
      }
      
      const user = JSON.parse(userData);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/bookings/farmer/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get only confirmed/active bookings
      const activeBookings = response.data.filter((b: any) => 
        ['confirmed', 'assigned', 'en_route', 'arrived', 'in_progress'].includes(b.status?.toLowerCase())
      );
      setRecentBookings(activeBookings.slice(0, 5));
      
      // If there's a booking ID in URL, track it
      const bookingId = searchParams.get('id');
      if (bookingId) {
        setTrackingNumber(bookingId);
        await trackBooking(bookingId);
      }
    } catch (error) {
      console.error('Failed to load recent bookings:', error);
    }
  };

  const loadFeedbackHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) return;
      
      const user = JSON.parse(userData);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/feedback/history/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeedbackHistory(response.data);
    } catch (error) {
      console.error('Failed to load feedback history:', error);
    }
  };

  const trackBooking = async (referenceOrId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/track-tractor/${referenceOrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTrackingInfo(response.data);
      toast.success('Tracking information loaded!');
      
      // Check if feedback is needed (service completed but no feedback)
      if (response.data.status === 'completed' && !response.data.feedback_submitted) {
        setShowFeedbackForm(true);
        toast.info('Please provide feedback for your completed service!', {
          autoClose: 5000
        });
      }
      
      // Update URL with booking ID
      const url = new URL(window.location.href);
      url.searchParams.set('id', referenceOrId.toString());
      window.history.pushState({}, '', url.toString());
      
    } catch (error: any) {
      console.error('Failed to track booking:', error);
      
      if (error.response?.status === 404) {
        setError('Booking not found. Please check your reference number.');
      } else if (error.response?.status === 401) {
        setError('Please login to track your tractor.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError('Unable to fetch tracking information. Please try again.');
        
        // Demo data for testing
        if (referenceOrId === 'demo' || referenceOrId === '123') {
          setTrackingInfo(generateDemoTrackingInfo(parseInt(referenceOrId) || 123));
          toast.info('Demo mode: Showing sample tracking data');
        }
      }
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  const refreshTrackingInfo = async () => {
    if (!trackingInfo?.booking_id) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/track-tractor/${trackingInfo.booking_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTrackingInfo(response.data);
      setCountdown(30);
    } catch (error) {
      console.error('Failed to refresh tracking:', error);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackForm.service_received) {
      toast.error('Please confirm that you received the tractor service');
      return;
    }
    
    if (!feedbackForm.completion_time) {
      toast.error('Please provide the service completion time');
      return;
    }
    
    setSubmittingFeedback(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const formData = new FormData();
      formData.append('booking_id', trackingInfo!.booking_id.toString());
      formData.append('rating', feedbackForm.rating.toString());
      formData.append('comment', feedbackForm.comment);
      formData.append('service_received', feedbackForm.service_received.toString());
      formData.append('completion_time', feedbackForm.completion_time);
      formData.append('issues', feedbackForm.issues);
      formData.append('driver_rating', feedbackForm.driver_rating.toString());
      formData.append('would_recommend', feedbackForm.would_recommend.toString());
      formData.append('response_time', feedbackForm.response_time);
      
      // Append photos if any
      feedbackForm.photos.forEach((photo) => {
        formData.append(`photos`, photo);
      });
      
      const response = await axios.post(`${apiUrl}/api/booking-feedback`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Thank you for your valuable feedback!');
        setShowFeedbackForm(false);
        
        // Reset form
        setFeedbackForm({
          rating: 5,
          comment: '',
          service_received: false,
          completion_time: '',
          issues: '',
          driver_rating: 5,
          would_recommend: true,
          response_time: '',
          photos: []
        });
        
        // Refresh tracking info to update feedback status
        await refreshTrackingInfo();
        await loadFeedbackHistory();
        
        // Switch to feedback history tab
        setActiveTab('feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Unable to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const generateDemoTrackingInfo = (bookingId: number): TrackingInfo => {
    return {
      booking_id: bookingId,
      status: 'completed',
      tractor_details: {
        id: 'TRC-2024-001',
        model: 'John Deere 5050E',
        registration: 'RDA 1234',
        capacity: '50 HP'
      },
      driver_details: {
        name: 'John Mamba',
        phone: '+268 76123456',
        rating: 4.8
      },
      location: {
        lat: -26.3167,
        lng: 31.1333,
        address: 'Mbabane-Manzini Highway, near Malkerns',
        current_location: 'Malkerns Valley'
      },
      estimated_arrival: {
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        distance: '0 km',
        duration: 'Arrived'
      },
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          description: 'Booking confirmed'
        },
        {
          status: 'assigned',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          description: 'Tractor assigned to your booking'
        },
        {
          status: 'en_route',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          description: 'Tractor dispatched from depot'
        },
        {
          status: 'arrived',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          description: 'Tractor arrived at your location'
        },
        {
          status: 'in_progress',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          description: 'Service in progress'
        },
        {
          status: 'completed',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          description: 'Service completed successfully'
        }
      ],
      last_update: new Date().toISOString(),
      farmer_details: {
        name: 'Sipho Dlamini',
        phone: '+268 76345678',
        location: 'Malkerns Farm, Plot 23'
      },
      feedback_submitted: false
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-blue-500" />;
      case 'assigned': return <FaUser className="text-indigo-500" />;
      case 'en_route': return <FaTractor className="text-yellow-500 animate-pulse" />;
      case 'arrived': return <FaMapMarkerAlt className="text-green-500" />;
      case 'in_progress': return <FaSpinner className="text-purple-500 animate-spin" />;
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-blue-500 bg-blue-50';
      case 'assigned': return 'border-indigo-500 bg-indigo-50';
      case 'en_route': return 'border-yellow-500 bg-yellow-50';
      case 'arrived': return 'border-green-500 bg-green-50';
      case 'in_progress': return 'border-purple-500 bg-purple-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'cancelled': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Booking Confirmed';
      case 'assigned': return 'Tractor Assigned';
      case 'en_route': return 'Tractor En Route';
      case 'arrived': return 'Tractor Arrived';
      case 'in_progress': return 'Service In Progress';
      case 'completed': return 'Service Completed';
      case 'cancelled': return 'Booking Cancelled';
      default: return 'Processing';
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'text-2xl' : 'text-lg';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className={`${starSize} text-yellow-500`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className={`${starSize} text-yellow-500`} />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <FaRegStar key={i} className={`${starSize} text-gray-300`} />
        ))}
      </div>
    );
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid time';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter your booking reference number');
      return;
    }
    trackBooking(trackingNumber);
  };

  const calculateProgress = () => {
    if (!trackingInfo) return 0;
    const stages = ['confirmed', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed'];
    const currentIndex = stages.indexOf(trackingInfo.status);
    if (currentIndex === -1) return 0;
    return (currentIndex / (stages.length - 1)) * 100;
  };

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header */}
      <div className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaTractor className="text-3xl" />
              <div>
                <h1 className="text-2xl font-bold">Tractor Tracking & Feedback</h1>
                <p className="text-green-100 text-sm">Track your tractor and rate your experience</p>
              </div>
            </div>
            <Link href="/farmer/dashboard" className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">
              <FaArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'track' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTractor className="inline mr-2" /> Track Tractor
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'history' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaClock className="inline mr-2" /> Recent Bookings
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'feedback' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaStar className="inline mr-2" /> My Feedback
          </button>
        </div>

        {/* Track Tab */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Booking Reference</h2>
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., #123 or 123"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  Track Now
                </button>
              </form>
            </div>

            {/* Tracking Info Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {trackingInfo && !error && (
              <>
                {/* Feedback Banner for Completed Services */}
                {trackingInfo.status === 'completed' && !trackingInfo.feedback_submitted && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">⭐</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Service Completed!</h3>
                          <p className="text-sm text-gray-600">Your tractor service has been completed. Please share your experience.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                      >
                        Give Feedback Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback Form Modal */}
                {showFeedbackForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <FaStar className="text-yellow-500" /> Service Feedback
                        </h3>
                        <button
                          onClick={() => setShowFeedbackForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                      
                      <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-6">
                        {/* Service Received Confirmation */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={feedbackForm.service_received}
                              onChange={(e) => setFeedbackForm({...feedbackForm, service_received: e.target.checked})}
                              className="w-5 h-5 text-green-600"
                            />
                            <span className="font-medium">I confirm that I received the tractor service</span>
                          </label>
                        </div>

                        {/* Overall Rating */}
                        <div>
                          <label className="block font-semibold mb-2">How would you rate the overall service?</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                                className="text-3xl focus:outline-none"
                              >
                                {star <= feedbackForm.rating ? (
                                  <FaStar className="text-yellow-500" />
                                ) : (
                                  <FaRegStar className="text-gray-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Driver Rating */}
                        <div>
                          <label className="block font-semibold mb-2">Rate the driver</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackForm({...feedbackForm, driver_rating: star})}
                                className="text-3xl focus:outline-none"
                              >
                                {star <= feedbackForm.driver_rating ? (
                                  <FaStar className="text-yellow-500" />
                                ) : (
                                  <FaRegStar className="text-gray-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Completion Time */}
                        <div>
                          <label className="block font-semibold mb-2">When was the service completed?</label>
                          <input
                            type="datetime-local"
                            value={feedbackForm.completion_time}
                            onChange={(e) => setFeedbackForm({...feedbackForm, completion_time: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            required
                          />
                        </div>

                        {/* Response Time */}
                        <div>
                          <label className="block font-semibold mb-2">How was the response time?</label>
                          <select
                            value={feedbackForm.response_time}
                            onChange={(e) => setFeedbackForm({...feedbackForm, response_time: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          >
                            <option value="">Select response time</option>
                            <option value="excellent">Excellent (Under 30 min)</option>
                            <option value="good">Good (30-60 min)</option>
                            <option value="average">Average (1-2 hours)</option>
                            <option value="poor">Poor (Over 2 hours)</option>
                          </select>
                        </div>

                        {/* Issues */}
                        <div>
                          <label className="block font-semibold mb-2">Did you encounter any issues?</label>
                          <textarea
                            value={feedbackForm.issues}
                            onChange={(e) => setFeedbackForm({...feedbackForm, issues: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            placeholder="e.g., arrived late, equipment issues, driver behavior, etc."
                          />
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="block font-semibold mb-2">Additional comments</label>
                          <textarea
                            value={feedbackForm.comment}
                            onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            placeholder="Share your experience with the tractor service..."
                            required
                          />
                        </div>

                        {/* Would Recommend */}
                        <div>
                          <label className="block font-semibold mb-2">Would you recommend RDA Tractor Services to others?</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={feedbackForm.would_recommend === true}
                                onChange={() => setFeedbackForm({...feedbackForm, would_recommend: true})}
                                className="w-4 h-4"
                              />
                              <span>Yes, definitely</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={feedbackForm.would_recommend === false}
                                onChange={() => setFeedbackForm({...feedbackForm, would_recommend: false})}
                                className="w-4 h-4"
                              />
                              <span>No, not really</span>
                            </label>
                          </div>
                        </div>

                        {/* Photo Upload */}
                        <div>
                          <label className="block font-semibold mb-2">Upload photos (optional)</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setFeedbackForm({...feedbackForm, photos: files});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          />
                          <p className="text-xs text-gray-500 mt-1">You can upload photos of the completed work</p>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {submittingFeedback ? <><FaSpinner className="inline animate-spin mr-2" /> Submitting...</> : 'Submit Feedback'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Main Tracking Display */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className={`p-6 border-l-8 ${getStatusColor(trackingInfo.status)}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(trackingInfo.status)}
                          <h2 className="text-2xl font-bold text-gray-900">
                            Booking #{trackingInfo.booking_id}
                          </h2>
                        </div>
                        <p className="text-gray-600">
                          Status: <span className="font-semibold">{getStatusText(trackingInfo.status)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Last updated</p>
                        <p className="text-sm font-medium">{formatTime(trackingInfo.last_update)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Confirmed</span>
                      <span>Assigned</span>
                      <span>En Route</span>
                      <span>Arrived</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaClock /> Service Timeline
                    </h3>
                    <div className="space-y-4">
                      {trackingInfo.timeline.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full mt-1.5 ${
                              index === trackingInfo.timeline.length - 1 ? 'bg-green-600' : 'bg-gray-300'
                            }`} />
                            {index < trackingInfo.timeline.length - 1 && (
                              <div className="absolute top-4 left-1.5 w-0.5 h-full bg-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-gray-900">{event.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tractor & Driver Info */}
                  <div className="grid md:grid-cols-2 gap-6 p-6 border-b">
                    {trackingInfo.tractor_details && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaTractor /> Tractor Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Model:</span> {trackingInfo.tractor_details.model}</p>
                          <p><span className="text-gray-500">Registration:</span> {trackingInfo.tractor_details.registration}</p>
                          <p><span className="text-gray-500">Capacity:</span> {trackingInfo.tractor_details.capacity}</p>
                        </div>
                      </div>
                    )}
                    
                    {trackingInfo.driver_details && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaUser /> Driver Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Name:</span> {trackingInfo.driver_details.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Contact:</span>
                            <a href={`tel:${trackingInfo.driver_details.phone}`} className="text-green-600 hover:underline">
                              {trackingInfo.driver_details.phone}
                            </a>
                            <button
                              onClick={() => openWhatsApp(trackingInfo.driver_details!.phone)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FaWhatsapp />
                            </button>
                          </div>
                          {trackingInfo.driver_details.rating && (
                            <p><span className="text-gray-500">Rating:</span> ⭐ {trackingInfo.driver_details.rating}/5</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto-refresh Toggle */}
                  <div className="p-6 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaInfoCircle className="text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Auto-refresh: {autoRefresh ? `ON (updates every ${countdown}s)` : 'OFF'}
                      </span>
                    </div>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-3 py-1 rounded text-sm ${
                        autoRefresh ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <div className="p-6 bg-gray-50 border-t">
                    <button
                      onClick={refreshTrackingInfo}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FaSpinner className={loading ? 'animate-spin' : ''} /> Refresh Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Active Bookings</h2>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <FaTractor className="text-gray-300 text-6xl mx-auto mb-4" />
                <p className="text-gray-500">No active bookings found</p>
                <Link href="/booking" className="text-green-600 hover:underline mt-2 inline-block">
                  Book a tractor now →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => {
                      setTrackingNumber(booking.id.toString());
                      setActiveTab('track');
                      trackBooking(booking.id.toString());
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono font-bold">#{booking.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'en_route' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <FaCalendarAlt className="inline mr-1" /> {formatDate(booking.available_time)}
                        </p>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {booking.location_description}
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Track →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback History Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {/* Feedback Stats */}
            {feedbackHistory.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Feedback Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{feedbackHistory.length}</div>
                    <div className="text-xs text-gray-600">Feedbacks Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(feedbackHistory.reduce((acc, f) => acc + f.rating, 0) / feedbackHistory.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {feedbackHistory.filter(f => f.would_recommend).length}
                    </div>
                    <div className="text-xs text-gray-600">Would Recommend</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {feedbackHistory.filter(f => f.service_received).length}
                    </div>
                    <div className="text-xs text-gray-600">Services Completed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Feedback History</h2>
              
              {feedbackHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FaStar className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500">No feedback submitted yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    After your tractor service is completed, you can rate and review your experience
                  </p>
                  <Link href="/booking" className="text-green-600 hover:underline mt-4 inline-block">
                    Book a tractor →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackHistory.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-gray-500">Booking #{feedback.id}</span>
                            {renderStars(feedback.rating)}
                          </div>
                          <p className="text-sm text-gray-600">{formatDate(feedback.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            {feedback.would_recommend ? (
                              <><FaThumbsUp className="text-green-500" /> Would Recommend</>
                            ) : (
                              <><FaFlag className="text-red-500" /> Would not recommend</>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{feedback.comment}</p>
                      
                      {feedback.issues && (
                        <div className="bg-yellow-50 p-2 rounded mb-2 text-sm">
                          <span className="font-medium">Issues reported:</span> {feedback.issues}
                        </div>
                      )}
                      
                      {feedback.driver_rating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Driver rating:</span>
                          {renderStars(feedback.driver_rating)}
                        </div>
                      )}
                      
                      {feedback.response_time && (
                        <div className="text-xs text-gray-500 mt-2">
                          Response time: {feedback.response_time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback Tips */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-blue-600 text-xl mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Why Your Feedback Matters</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Your feedback helps us improve our tractor services for all farmers in Eswatini.
                    We read every review and use it to:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Improve driver training and service quality</li>
                    <li>Reduce waiting times and improve response</li>
                    <li>Recognize our best performing drivers</li>
                    <li>Address any issues promptly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}