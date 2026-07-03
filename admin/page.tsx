'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaTractor, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEdit,
  FaSave,
  FaSpinner,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaSync
} from 'react-icons/fa';

interface User {
  role: string;
  full_name?: string;
  id?: number;
  email?: string;
}

interface Booking {
  id: number;
  full_name: string;
  email: string | null;
  contact_number: string;
  location_description: string;
  available_time: string;
  hours_booked: number;
  total_amount: number;
  payment_method: string;
  proof_of_payment: string | null;
  status: string;
  tractor_assigned: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    tractor_assigned: '',
    admin_notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check token
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('Token:', token ? 'exists' : 'missing');
      console.log('User data:', userData ? 'exists' : 'missing');

      if (!token || !userData) {
        console.log('No auth data, redirecting to login');
        router.push('/login');
        return;
      }

      // Parse user data
      const parsedUser = JSON.parse(userData);
      console.log('User role:', parsedUser.role);

      if (parsedUser.role !== 'admin') {
        console.log('Not admin, redirecting');
        router.push('/dashboard');
        return;
      }

      setUser(parsedUser);

      // Fetch bookings
      await fetchBookings(token);
      
    } catch (err) {
      console.error('Auth error:', err);
      setError('Authentication failed. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (token: string) => {
    try {
      console.log('Fetching bookings from:', `${API_URL}/api/admin/bookings/all`);
      
      const response = await axios.get(`${API_URL}/api/admin/bookings/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Bookings response:', response.data);

      // Handle different response formats
      let bookingsData = [];
      if (response.data && response.data.success && response.data.bookings) {
        bookingsData = response.data.bookings;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data && response.data.data) {
        bookingsData = response.data.data;
      }

      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      
      // Calculate stats
      calculateStats(bookingsData);
      
      toast.success(`Loaded ${bookingsData.length} bookings`);
      
    } catch (err: any) {
      console.error('Fetch bookings error:', err);
      
      let errorMessage = 'Failed to fetch bookings';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server not responding';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized - please login again';
        setTimeout(() => router.push('/login'), 2000);
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden - admin access required';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found - check server';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - is the server running?';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Try fallback endpoint
      tryFallbackEndpoint(token);
    }
  };

  const tryFallbackEndpoint = async (token: string) => {
    try {
      console.log('Trying fallback endpoint...');
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fallback response:', response.data);
      
      let bookingsData = [];
      if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data && response.data.bookings) {
        bookingsData = response.data.bookings;
      }
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      calculateStats(bookingsData);
      toast.success(`Loaded ${bookingsData.length} bookings from fallback`);
      setError(null);
      
    } catch (fallbackErr) {
      console.error('Fallback also failed:', fallbackErr);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status?.toLowerCase() === 'pending').length,
      confirmed: bookingsData.filter(b => b.status?.toLowerCase() === 'confirmed').length,
      completed: bookingsData.filter(b => b.status?.toLowerCase() === 'completed').length,
      cancelled: bookingsData.filter(b => b.status?.toLowerCase() === 'cancelled').length,
      revenue: bookingsData.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    };
    setStats(stats);
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    const notes = prompt('Add admin notes (optional):');
    
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/bookings/${bookingId}/status`,
        { 
          status: newStatus,
          admin_notes: notes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Booking #${bookingId} updated to ${newStatus}`);
      
      // Refresh data
      if (token) await fetchBookings(token);
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateBookingDetails = async () => {
    if (!selectedBooking) return;

    setUpdatingId(selectedBooking.id);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/bookings/${selectedBooking.id}/status`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Booking updated successfully');
      setIsEditModalOpen(false);
      
      if (token) await fetchBookings(token);
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter bookings
  useEffect(() => {
    if (!bookings.length) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        (b.full_name?.toLowerCase() || '').includes(term) ||
        (b.email?.toLowerCase() || '').includes(term) ||
        (b.contact_number || '').includes(term) ||
        (b.location_description?.toLowerCase() || '').includes(term)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaHourglassHalf },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    
    const { color, icon: Icon } = config[status?.toLowerCase()] || config.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${color}`}>
        <Icon className="mr-1" />
        {status || 'pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-red-600 text-lg mb-4">⚠️ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaTractor className="text-green-600 text-2xl mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.full_name || 'Admin'}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-green-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-purple-600">E {stats.revenue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 text-black">
            <h2 className="text-lg font-semibold">Bookings ({filteredBookings.length})</h2>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaTractor className="mx-auto text-gray-400 text-5xl mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-2">
                {bookings.length === 0 
                  ? 'No bookings in database yet' 
                  : 'Try clearing your filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{booking.full_name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.contact_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {booking.location_description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.hours_booked}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        E {booking.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-gray-500">
                          {booking.admin_notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                          disabled={updatingId === booking.id}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingId === booking.id && (
                          <FaSpinner className="animate-spin ml-2 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}