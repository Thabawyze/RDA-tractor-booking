'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface User {
  role: 'farmer' | 'admin';
  full_name?: string;
  email: string;
  id?: number;
}

interface Booking {
  id: number;
  status: string;
  available_time: string;
  total_amount: string | number;
  created_at?: string;
  location_description?: string;
  contact_number?: string;
  hours_booked?: number;
  payment_method?: string;
}

export default function FarmerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      
      // 1. Check authentication first
      const authenticatedUser = await checkAuth();
      
      // 2. If authenticated as farmer, fetch bookings
      if (authenticatedUser) {
        await fetchBookings(authenticatedUser.email);
      }
      
      setLoading(false);
    };
    
    initDashboard();
  }, []); // Empty dependency array - run once on mount

  const checkAuth = async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    // Check expiry if set
    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      router.push('/auth/login');
      return null;
    }

    if (!token || !userData) {
      router.push('/auth/login');
      return null;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      
      // Check role
      if (parsedUser.role !== 'farmer') {
        if (parsedUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/auth/login');
        }
        return null;
      }
      
      // Set user state
      setUser(parsedUser);
      return parsedUser;
      
    } catch (parseError) {
      console.error('Invalid user data:', parseError);
      localStorage.removeItem('user');
      router.push('/auth/login');
      return null;
    }
  };

  const fetchBookings = async (userEmail: string) => {
    if (!userEmail) return;

    try {
      setError(null);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Try the public endpoint first (no auth required)
      try {
        const response = await axios.get(`${apiUrl}/bookings/farmer/${encodeURIComponent(userEmail)}`);
        setBookings(response.data);
        return;
      } catch (publicError) {
        console.log('Public endpoint failed, trying authenticated endpoint...');
      }
      
      // Fallback to authenticated endpoint
      const response = await axios.get(`${apiUrl}/api/bookings/farmer/${encodeURIComponent(userEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      
      if (error.response?.status === 404) {
        // No bookings found - this is fine, just empty array
        setBookings([]);
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the server is running.');
      } else {
        setError('Failed to load bookings. Please refresh or try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    router.push('/auth/login');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const retryFetch = () => {
    if (user?.email) {
      setLoading(true);
      setError(null);
      fetchBookings(user.email).finally(() => setLoading(false));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-red-600 text-lg mb-4">⚠️ {error}</div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={retryFetch}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Farmer Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Farmer Dashboard</h1>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/booking" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  New Booking
                </Link>
                <Link href="/center_services" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Service Centers
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{user?.full_name || 'Farmer'}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <span className="text-green-600 text-2xl">👨‍🌾</span>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'}!
                </h2>
                <p className="text-gray-600">
                  Manage your tractor bookings and access agricultural services
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="text-2xl font-bold text-green-600">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="text-xl font-bold text-green-600">
                      {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-xl font-bold text-blue-600">
                      {bookings.filter(b => b.status?.toLowerCase() === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/booking"
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Book New Tractor
                  </Link>
                  <Link
                    href="/advisory"
                    className="block w-full text-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    View advisory information
                  </Link>
                  <button
                    onClick={retryFetch}
                    className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Refresh Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                  <Link href="/bookings" className="text-sm text-green-600 hover:text-green-500">
                    View All
                  </Link>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
                    <p className="text-gray-400 text-sm mb-6">Start by booking a tractor for your farm</p>
                    <Link
                      href="/booking"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Make your first booking
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.slice(0, 5).map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{booking.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(booking.available_time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                                  {booking.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                E{typeof booking.total_amount === 'string' 
                                  ? parseFloat(booking.total_amount).toFixed(2) 
                                  : Number(booking.total_amount).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  href={`/bookings/${booking.id}`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View Details
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {bookings.length > 5 && (
                      <div className="mt-6 text-center">
                        <Link
                          href="/bookings"
                          className="inline-flex items-center text-green-600 hover:text-green-500 font-medium"
                        >
                          View all {bookings.length} bookings
                          <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Service Centers Nearby */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Track your tractor</h3>
                    <p className="text-gray-600 mb-4">
                       See your position in the queue, estimated arrival time, and real-time tractor status:
                    </p>
                    <Link
                      href="/tracking"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Track tractor here
                    </Link>
                  </div>
                  <div className="text-6xl text-green-200">🚜</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}