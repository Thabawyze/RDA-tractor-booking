'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

import Navbar from '@/components/Navbar';
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
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaSpinner,
  FaDownload,
  FaPrint,
  FaChartBar,
  FaTachometerAlt,
  FaCreditCard,
  FaCashRegister,
  FaTrash,
  FaSave,
  FaPlus
} from 'react-icons/fa';

// Types
interface Booking {
  id: number;
  full_name: string;
  email: string;
  contact_number: string;
  location_description: string;
  available_time: string;
  hours_booked: number;
  total_amount: number;
  payment_method: string;
  proof_of_payment: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  tractor_assigned: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    tractor_assigned: '',
    admin_notes: ''
  });
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    fetchBookings();
    fetchStats();
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/admin/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setBookings(response.data.bookings || []);
        setFilteredBookings(response.data.bookings || []);
        
        // Calculate total pages
        const total = response.data.bookings?.length || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else if (Array.isArray(response.data)) {
        setBookings(response.data);
        setFilteredBookings(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else {
        console.error('Unexpected response format:', response.data);
        setBookings([]);
        setFilteredBookings([]);
      }

      setError(null);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      setError('Failed to fetch bookings');
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/bookings/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setStats(response.data.stats || response.data);
      } else if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  // Filter and search bookings
  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      setFilteredBookings([]);
      setTotalPages(1);
      return;
    }

    let filtered = [...bookings];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Apply payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(b => b.payment_method === paymentFilter);
    }

    // Apply date filter
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(b => new Date(b.created_at).toDateString() === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(b => new Date(b.created_at) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(b => new Date(b.created_at) >= monthAgo);
    } else if (dateFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(b => {
        const date = new Date(b.created_at);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.full_name.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.contact_number.includes(term) ||
        b.location_description.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [bookings, statusFilter, paymentFilter, dateFilter, startDate, endDate, searchTerm, itemsPerPage]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Booking #${bookingId} updated to ${newStatus}`);
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update booking');
      console.error('Update error:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update booking with full details
  const updateBookingDetails = async () => {
    if (!selectedBooking) return;

    setUpdatingId(selectedBooking.id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${selectedBooking.id}/status`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Booking updated successfully');
      setIsEditModalOpen(false);
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update booking');
      console.error('Update error:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle view booking
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      status: booking.status,
      tractor_assigned: booking.tractor_assigned || '',
      admin_notes: booking.admin_notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaHourglassHalf },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    
    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${color}`}>
        <Icon className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get payment method badge
  const getPaymentBadge = (method: string) => {
    const config = {
      cash: { color: 'bg-green-100 text-green-800', icon: FaCashRegister },
      momo: { color: 'bg-purple-100 text-purple-800', icon: FaCreditCard },
      card: { color: 'bg-blue-100 text-blue-800', icon: FaCreditCard },
      bank_transfer: { color: 'bg-indigo-100 text-indigo-800', icon: FaMoneyBillWave }
    };
    
    const { color, icon: Icon } = config[method as keyof typeof config] || { color: 'bg-gray-100 text-gray-800', icon: FaCreditCard };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${color}`}>
        <Icon className="mr-1" />
        {method || 'Not specified'}
      </span>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Location', 'Date', 'Hours', 'Amount', 'Payment', 'Status'];
    const data = filteredBookings.map(b => [
      b.id,
      b.full_name,
      b.email || '',
      b.contact_number,
      b.location_description,
      formatDate(b.created_at),
      b.hours_booked,
      b.total_amount,
      b.payment_method,
      b.status
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-green-600 mb-4" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <FaTachometerAlt className="text-3xl text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">Manage Bookings</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold text-green-600">{stats.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">E {stats.revenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-black">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="momo">MoMo</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Items per page */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm text-black"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <p className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageItems().map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.full_name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-2 text-gray-400" />
                        {booking.contact_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500 max-w-xs">
                        <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{booking.location_description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {formatDate(booking.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.hours_booked} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      E {booking.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(booking.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                          disabled={updatingId === booking.id}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingId === booking.id && (
                          <FaSpinner className="animate-spin text-green-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
              {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setDateFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredBookings.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-black"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-black">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-black"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-800">Booking Details #{selectedBooking.id}</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Farmer Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-black">
                    <p><span className="text-gray-600">Name:</span> {selectedBooking.full_name}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedBooking.email || 'N/A'}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedBooking.contact_number}</p>
                    <p><span className="text-gray-600">Location:</span> {selectedBooking.location_description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-black">
                  <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
                  <p><span className="text-gray-600">Date:</span> {formatDate(selectedBooking.created_at)}</p>
                  <p><span className="text-gray-600">Available Time:</span> {selectedBooking.available_time}</p>
                  <p><span className="text-gray-600">Hours:</span> {selectedBooking.hours_booked}</p>
                  <p><span className="text-gray-600">Total Amount:</span> E {selectedBooking.total_amount}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-black">
                  <h3 className="font-semibold text-gray-800 mb-2">Payment & Status</h3>
                  <p><span className="text-gray-600">Payment Method:</span> {selectedBooking.payment_method}</p>
                  <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedBooking.status)}</p>
                  {selectedBooking.proof_of_payment && (
                    <p>
                      <span className="text-gray-600">Proof:</span>{' '}
                      <a 
                        href={`http://localhost:5000/uploads/proofs/${selectedBooking.proof_of_payment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View File
                      </a>
                    </p>
                  )}
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-lg text-black">
                  <h3 className="font-semibold text-gray-800 mb-2">Admin Information</h3>
                  <p><span className="text-gray-600">Tractor Assigned:</span> {selectedBooking.tractor_assigned || 'Not assigned'}</p>
                  <p><span className="text-gray-600">Admin Notes:</span> {selectedBooking.admin_notes || 'No notes'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditBooking(selectedBooking);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mr-2"
                >
                  <FaEdit className="inline mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-800">Edit Booking #{selectedBooking.id}</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tractor Assigned</label>
                  <input
                    type="text"
                    value={editFormData.tractor_assigned}
                    onChange={(e) => setEditFormData({...editFormData, tractor_assigned: e.target.value})}
                    placeholder="Enter tractor registration number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea
                    value={editFormData.admin_notes}
                    onChange={(e) => setEditFormData({...editFormData, admin_notes: e.target.value})}
                    rows={4}
                    placeholder="Add notes about this booking..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBookingDetails}
                  disabled={updatingId === selectedBooking.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                >
                  {updatingId === selectedBooking.id ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}