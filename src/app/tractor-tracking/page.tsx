'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaArrowLeft, FaTractor, FaMapMarkerAlt, FaClock, FaCalendarAlt,
  FaSpinner, FaUserCheck, FaUsers, FaCheckCircle, FaHourglassHalf,
  FaExclamationTriangle, FaBell, FaPhoneAlt, FaEnvelope,
  FaStar, FaChartLine, FaHistory, FaLocationArrow, FaRoad,
  FaUserClock, FaRegClock, FaStopwatch, FaSync, FaArrowRight,FaInfoCircle,
  FaQrcode, FaShare, FaPrint, FaUserFriends, FaThumbsUp
} from 'react-icons/fa';

interface ServiceQueue {
  position: number;
  total_in_queue: number;
  estimated_wait_time_minutes: number;
  estimated_service_time: string;
  farmers_ahead: Array<{
    id: number;
    name: string;
    location: string;
    status: 'pending' | 'in_progress' | 'completed';
    estimated_duration: number;
  }>;
}

interface TractorStatus {
  id: number;
  tractor_name: string;
  registration_number: string;
  current_status: 'available' | 'en_route' | 'servicing' | 'maintenance' | 'completed';
  current_location: string;
  next_destination: string;
  estimated_arrival: string;
  driver_name: string;
  driver_phone: string;
  speed_kmh: number;
  last_updated: string;
}

interface BookingInfo {
  booking_id: number;
  farmer_name: string;
  location: string;
  scheduled_date: string;
  scheduled_time: string;
  hours_booked: number;
  status: 'pending' | 'confirmed' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

interface ServiceHistory {
  id: number;
  date: string;
  tractor_name: string;
  hours_served: number;
  amount: number;
  rating?: number;
  feedback?: string;
}

const TractorTrackingPage = () => {
  const [bookingId, setBookingId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [queueInfo, setQueueInfo] = useState<ServiceQueue | null>(null);
  const [tractorStatus, setTractorStatus] = useState<TractorStatus | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'track' | 'history' | 'info'>('track');
  const [showShareModal, setShowShareModal] = useState(false);
  
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Mock data for demonstration
  const mockQueueInfo: ServiceQueue = {
    position: 3,
    total_in_queue: 12,
    estimated_wait_time_minutes: 45,
    estimated_service_time: '2024-01-15T14:30:00',
    farmers_ahead: [
      { id: 101, name: 'John Dlamini', location: 'Malkerns', status: 'in_progress', estimated_duration: 60 },
      { id: 102, name: 'Mary Mamba', location: 'Matsapha', status: 'pending', estimated_duration: 45 },
      { id: 103, name: 'Peter Simelane', location: 'Manzini', status: 'pending', estimated_duration: 50 }
    ]
  };

  const mockTractorStatus: TractorStatus = {
    id: 1,
    tractor_name: 'John Deere 5050D',
    registration_number: 'RDA 001 TR',
    current_status: 'en_route',
    current_location: 'Matsapha Industrial Area',
    next_destination: 'Malkerns Farm',
    estimated_arrival: '2024-01-15T13:45:00',
    driver_name: 'Thabo Nkosi',
    driver_phone: '+268 76123456',
    speed_kmh: 35,
    last_updated: new Date().toISOString()
  };

  const mockServiceHistory: ServiceHistory[] = [
    { id: 1, date: '2023-12-01', tractor_name: 'Massey Ferguson 275', hours_served: 4, amount: 1600, rating: 5, feedback: 'Excellent service!' },
    { id: 2, date: '2023-11-15', tractor_name: 'New Holland TD5050', hours_served: 3, amount: 1200, rating: 4, feedback: 'Good, arrived on time' },
    { id: 3, date: '2023-10-20', tractor_name: 'John Deere 5050D', hours_served: 6, amount: 2400, rating: 5, feedback: 'Very professional' }
  ];

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, replace with actual API call
      // const response = await axios.get(`${API_URL}/api/bookings/track`, {
      //   params: { booking_id: bookingId, phone: phoneNumber }
      // });
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockBookingInfo: BookingInfo = {
        booking_id: parseInt(bookingId) || 12345,
        farmer_name: 'John Dlamini',
        location: 'Malkerns, Manzini',
        scheduled_date: '2024-01-15',
        scheduled_time: '13:00',
        hours_booked: 4,
        status: 'confirmed',
        total_amount: 1600,
        payment_status: 'paid',
        created_at: '2024-01-10T10:30:00'
      };
      
      setBookingInfo(mockBookingInfo);
      setQueueInfo(mockQueueInfo);
      setTractorStatus(mockTractorStatus);
      setServiceHistory(mockServiceHistory);
      setIsAuthenticated(true);
      
      // Start auto-refresh every 30 seconds
      startAutoRefresh();
      
      toast.success('Booking found! Tracking active');
    } catch (err) {
      setError('Booking not found. Please check your booking ID and phone number.');
      toast.error('Failed to find booking');
    } finally {
      setLoading(false);
    }
  };

  const startAutoRefresh = () => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    refreshInterval.current = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // In production, call API to get updated queue and tractor status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update queue position (mock - decreases over time)
      if (queueInfo && queueInfo.position > 1) {
        setQueueInfo(prev => prev ? {
          ...prev,
          position: Math.max(1, prev.position - 0.5),
          estimated_wait_time_minutes: Math.max(0, prev.estimated_wait_time_minutes - 5)
        } : null);
      }
      
      // Update tractor estimated arrival
      if (tractorStatus && tractorStatus.current_status === 'en_route') {
        const newArrival = new Date(tractorStatus.estimated_arrival);
        newArrival.setMinutes(newArrival.getMinutes() - 2);
        setTractorStatus(prev => prev ? {
          ...prev,
          estimated_arrival: newArrival.toISOString()
        } : null);
      }
      
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const cancelAutoRefresh = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  };

  useEffect(() => {
    return () => cancelAutoRefresh();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingId && phoneNumber) {
      fetchBookingDetails();
    } else {
      toast.warning('Please enter both Booking ID and Phone Number');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'en_route': return 'bg-orange-500';
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed - Waiting for Tractor';
      case 'en_route': return 'Tractor En Route';
      case 'in_progress': return 'Service in Progress';
      case 'completed': return 'Service Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getTractorStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'en_route': return 'text-orange-600';
      case 'servicing': return 'text-blue-600';
      case 'maintenance': return 'text-red-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${Math.ceil(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`;
  };

  const formatEswatiniTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-SZ', { hour: '2-digit', minute: '2-digit' });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4">
        <ToastContainer />
        <div className="max-w-md mx-auto">
          <Link href="/advisory" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <FaArrowLeft className="mr-2" /> Back to Advisory
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTractor className="text-white text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-white">Track Your Tractor</h1>
              <p className="text-green-100 mt-2">Enter your booking details to track service status</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaQrcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="e.g., BK-12345"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Found in your booking confirmation SMS</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+268 76123456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><FaSpinner className="animate-spin" /> Tracking...</>
                ) : (
                  <><FaLocationArrow /> Track My Tractor</>
                )}
              </button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Don't have a booking? {' '}
                  <Link href="/advisory/tractor-booking" className="text-green-600 hover:underline">
                    Book a tractor now
                  </Link>
                </p>
              </div>
            </form>
          </div>
          
          {/* Help Section */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 text-center">
              <FaInfoCircle className="inline mr-1 text-green-600" />
              Need help? Call our support at <a href="tel:+26824041234" className="text-green-600 font-medium">+268 2404 1234</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tracking Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/advisory" className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft className="text-xl" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tractor Service Tracker</h1>
              <p className="text-sm text-gray-500">Booking #{bookingInfo?.booking_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={refreshData} 
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FaShare /> Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'track', label: 'Live Tracking', icon: <FaLocationArrow /> },
            { id: 'history', label: 'Service History', icon: <FaHistory /> },
            { id: 'info', label: 'Booking Info', icon: <FaInfoCircle /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                selectedTab === tab.id 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        {/* Live Tracking Tab */}
        {selectedTab === 'track' && (
          <div className="space-y-6">
            {/* Queue Position Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl text-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-green-100 text-sm">Your Position in Queue</p>
                  <p className="text-5xl font-bold">{Math.ceil(queueInfo?.position || 0)}</p>
                  <p className="text-green-100 text-sm">of {queueInfo?.total_in_queue} farmers</p>
                </div>
                <div className="text-center">
                  <p className="text-green-100 text-sm">Estimated Wait Time</p>
                  <p className="text-3xl font-bold">{formatTimeRemaining(queueInfo?.estimated_wait_time_minutes || 0)}</p>
                  <p className="text-green-100 text-sm flex items-center justify-center gap-1">
                    <FaRegClock /> Est. arrival: {queueInfo?.estimated_service_time ? formatEswatiniTime(queueInfo.estimated_service_time) : '--:--'}
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-green-100 text-sm">Service Status</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${
                      bookingInfo?.status === 'en_route' ? 'animate-pulse bg-orange-400' :
                      bookingInfo?.status === 'in_progress' ? 'animate-pulse bg-green-400' : 'bg-white'
                    }`} />
                    <span className="font-medium">{getStatusText(bookingInfo?.status || 'pending')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Queue Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUsers className="text-green-600" />
                Farmers Ahead of You
              </h3>
              <div className="space-y-3">
                {queueInfo?.farmers_ahead.map((farmer, idx) => (
                  <div key={farmer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{farmer.name}</p>
                        <p className="text-xs text-gray-500">{farmer.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        farmer.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {farmer.status === 'in_progress' ? 'In Progress' : 'Waiting'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{farmer.estimated_duration} min est.</p>
                    </div>
                  </div>
                ))}
              </div>
              {queueInfo && queueInfo.position > 4 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  +{queueInfo.total_in_queue - queueInfo.position} more farmers behind you
                </p>
              )}
            </div>
            
            {/* Tractor Location Card */}
            {tractorStatus && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaTractor className="text-green-600" />
                  Tractor Location & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <FaTractor className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tractorStatus.tractor_name}</p>
                        <p className="text-xs text-gray-500">{tractorStatus.registration_number}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-medium text-gray-900">{tractorStatus.current_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaLocationArrow className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Next Destination</p>
                        <p className="font-medium text-gray-900">{tractorStatus.next_destination}</p>
                        <p className="text-xs text-green-600">Your location is #{queueInfo?.position} in queue</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaClock className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Arrival at Your Farm</p>
                        <p className="font-medium text-green-600 text-lg">
                          {queueInfo?.estimated_service_time ? formatEswatiniTime(queueInfo.estimated_service_time) : '--:--'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaUserCheck className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Driver</p>
                        <p className="font-medium text-gray-900">{tractorStatus.driver_name}</p>
                        <a href={`tel:${tractorStatus.driver_phone}`} className="text-xs text-green-600 hover:underline">
                          <FaPhoneAlt className="inline mr-1" size={10} /> {tractorStatus.driver_phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaStopwatch className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Speed / Last Update</p>
                        <p className="text-gray-900">{tractorStatus.speed_kmh} km/h</p>
                        <p className="text-xs text-gray-500">{new Date(tractorStatus.last_updated).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Service Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {[
                    { status: 'confirmed', label: 'Booking Confirmed', time: bookingInfo?.created_at, completed: true },
                    { status: 'en_route', label: 'Tractor Dispatched', time: bookingInfo?.scheduled_date, completed: bookingInfo?.status !== 'pending' },
                    { status: 'in_progress', label: 'Service Started', completed: bookingInfo?.status === 'in_progress' || bookingInfo?.status === 'completed' },
                    { status: 'completed', label: 'Service Completed', completed: bookingInfo?.status === 'completed' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 ml-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        step.completed ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        {step.completed ? <FaCheckCircle className="text-white text-sm" /> : <FaHourglassHalf className="text-gray-400" />}
                      </div>
                      <div>
                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        {step.time && <p className="text-xs text-gray-500">{new Date(step.time).toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Notification Bell */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaBell className="text-yellow-600 text-xl mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Get Real-time Updates</p>
                  <p className="text-sm text-yellow-700">
                    We'll send you SMS notifications when the tractor is 30 minutes away and when service starts.
                  </p>
                  <button className="mt-2 text-sm text-yellow-800 underline">Enable SMS Alerts</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Service History Tab */}
        {selectedTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaHistory className="text-green-600" />
              Your Service History
            </h3>
            {serviceHistory.length > 0 ? (
              <div className="space-y-4">
                {serviceHistory.map(service => (
                  <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{service.tractor_name}</p>
                        <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString('en-SZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">E{service.amount}</p>
                        <p className="text-xs text-gray-500">{service.hours_served} hours</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-sm ${i < (service.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {service.feedback && (
                        <p className="text-sm text-gray-600 italic">"{service.feedback}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No service history yet</p>
            )}
          </div>
        )}
        
        {/* Booking Info Tab */}
        {selectedTab === 'info' && bookingInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium text-gray-900">#{bookingInfo.booking_id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Farmer Name</span>
                  <span className="font-medium text-gray-900">{bookingInfo.farmer_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{bookingInfo.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Scheduled Date</span>
                  <span className="font-medium text-gray-900">{new Date(bookingInfo.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Scheduled Time</span>
                  <span className="font-medium text-gray-900">{bookingInfo.scheduled_time}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Hours Booked</span>
                  <span className="font-medium text-gray-900">{bookingInfo.hours_booked} hours</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-green-600">E{bookingInfo.total_amount}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bookingInfo.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bookingInfo.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Assistance?</h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaPhoneAlt className="text-green-600" />
                    <span className="font-medium">Call Support</span>
                  </div>
                  <a href="tel:+26824041234" className="text-xl font-bold text-green-700">+268 2404 1234</a>
                  <p className="text-xs text-gray-500 mt-1">Mon-Fri 8:00 AM - 5:00 PM</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaEnvelope className="text-blue-600" />
                    <span className="font-medium">Email Support</span>
                  </div>
                  <a href="mailto:tractor@rda.org.sz" className="text-blue-700">tractor@rda.org.sz</a>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaThumbsUp className="text-yellow-600" />
                    <span className="font-medium">Emergency Contact</span>
                  </div>
                  <p className="text-sm">For urgent issues or delays, call our dispatch team at <strong>+268 76123456</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share Tracking Link</h3>
              <p className="text-sm text-gray-600 mb-4">Share this link with family to track your tractor service:</p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <code className="text-sm break-all">
                  {`${window.location.origin}/track?booking=${bookingInfo?.booking_id}`}
                </code>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Copy Link
                </button>
                <button onClick={() => setShowShareModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TractorTrackingPage;