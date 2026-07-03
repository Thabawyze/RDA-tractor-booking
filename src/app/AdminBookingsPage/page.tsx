'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaTractor,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaPrint,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaImage,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';

// Define TypeScript interfaces
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  tractor_assigned: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SortConfig {
  key: keyof Booking;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  paymentMethod: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AdminBookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0
  });

  const [filters, setFilters] = useState<FilterConfig>({
    status: 'all',
    dateRange: 'all',
    paymentMethod: 'all'
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '',
    tractor_assigned: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, filters, sortConfig]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data);
      calculateStats(response.data);
      
    } catch (error: unknown) {
      console.error('Failed to fetch bookings:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.error || 'Failed to load bookings');
        if (error.response.status === 401) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      } else {
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const total = bookingsData.length;
    const pending = bookingsData.filter(b => b.status === 'pending').length;
    const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
    const completed = bookingsData.filter(b => b.status === 'completed').length;
    const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
    
    const revenue = bookingsData
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0);
    
    const avgValue = (confirmed + completed) > 0 
      ? revenue / (confirmed + completed) 
      : 0;

    setStats({
      totalBookings: total,
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      cancelledBookings: cancelled,
      totalRevenue: revenue,
      averageBookingValue: avgValue
    });
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((booking: Booking) => 
        booking.full_name?.toLowerCase().includes(term) ||
        booking.email?.toLowerCase().includes(term) ||
        booking.contact_number?.toLowerCase().includes(term) ||
        booking.location_description?.toLowerCase().includes(term) ||
        booking.tractor_assigned?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((booking: Booking) => booking.status === filters.status);
    }

    // Apply payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter((booking: Booking) => booking.payment_method === filters.paymentMethod);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((booking: Booking) => {
        const bookingDate = new Date(booking.created_at);
        
        switch (filters.dateRange) {
          case 'today':
            return bookingDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return bookingDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return bookingDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a: Booking, b: Booking) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Special handling for different data types
      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at' || sortConfig.key === 'available_time') {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        
        if (isNaN(aTime) || isNaN(bTime)) return 0;
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      } 
      else if (sortConfig.key === 'total_amount' || sortConfig.key === 'hours_booked') {
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        
        if (isNaN(aNum) || isNaN(bNum)) return 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      else {
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });

    setFilteredBookings(filtered);
  };

  const handleSort = (key: keyof Booking) => {
    setSortConfig((prev: SortConfig) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Booking) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-green-600" /> : 
      <FaSortDown className="text-green-600" />;
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      tractor_assigned: booking.tractor_assigned || '',
      admin_notes: booking.admin_notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/bookings/${selectedBooking.id}/status`, {
        status: editForm.status,
        tractor_assigned: editForm.tractor_assigned,
        admin_notes: editForm.admin_notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Booking updated successfully');
      setShowEditModal(false);
      fetchBookings();
      
    } catch (error: unknown) {
      console.error('Update booking error:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.error || 'Failed to update booking');
      } else {
        toast.error('Failed to update booking');
      }
    }
  };

  const handleViewProof = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowProofModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
            <FaHourglassHalf className="mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
            <FaCheckCircle className="mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
            <FaTimesCircle className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'momo':
      case 'mtn momo':
        return '📱';
      case 'card':
      case 'credit card':
        return '💳';
      case 'cash':
        return '💰';
      default:
        return '💵';
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Location', 'Date', 'Hours', 'Amount', 'Status', 'Payment Method'];
    const csvData = filteredBookings.map((booking: Booking) => [
      booking.id,
      booking.full_name,
      booking.email || '',
      booking.contact_number,
      booking.location_description,
      new Date(booking.created_at).toLocaleDateString(),
      booking.hours_booked,
      booking.total_amount,
      booking.status,
      booking.payment_method || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Manage Bookings
          </h1>
          <p className="text-gray-600">
            View and manage all tractor bookings in the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-xs mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-xs mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-xs mb-1">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completedBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-xs mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-xs mb-1">Revenue</p>
            <p className="text-2xl font-bold text-purple-600">E{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-indigo-500">
            <p className="text-gray-600 text-xs mb-1">Avg Value</p>
            <p className="text-2xl font-bold text-indigo-600">E{stats.averageBookingValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex-1 flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="relative w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-bold text-green-600">{filteredBookings.length}</span> bookings
          </p>
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>ID</span>
                      {getSortIcon('id')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Customer</span>
                      {getSortIcon('full_name')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Date</span>
                      {getSortIcon('created_at')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('hours_booked')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Hours</span>
                      {getSortIcon('hours_booked')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_amount')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Amount</span>
                      {getSortIcon('total_amount')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Status</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No bookings found</p>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((booking: Booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-xs" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.contact_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.hours_booked} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        E{booking.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {getPaymentMethodIcon(booking.payment_method)} {booking.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Booking"
                          >
                            <FaEdit />
                          </button>
                          {booking.proof_of_payment && (
                            <button
                              onClick={() => handleViewProof(booking)}
                              className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Payment Proof"
                            >
                              {booking.proof_of_payment?.match(/\.(jpg|jpeg|png)$/i) ? <FaImage /> : <FaFilePdf />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredBookings.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredBookings.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredBookings.length}</span> results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-md">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-600 text-xl mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Booking Management Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <span className="font-medium">Pending</span> - Awaiting confirmation</li>
                <li>• <span className="font-medium">Confirmed</span> - Booking confirmed, tractor assigned</li>
                <li>• <span className="font-medium">Completed</span> - Service has been completed</li>
                <li>• <span className="font-medium">Cancelled</span> - Booking was cancelled</li>
                <li>• Click on a booking to view full details or update its status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h3>
                  <p className="text-lg font-semibold text-gray-900">#{selectedBooking.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedBooking.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedBooking.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedBooking.location_description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Time</p>
                    <p className="font-medium">{new Date(selectedBooking.available_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hours Booked</p>
                    <p className="font-medium">{selectedBooking.hours_booked} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-green-600">E{selectedBooking.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{selectedBooking.payment_method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tractor Assigned</p>
                    <p className="font-medium">{selectedBooking.tractor_assigned || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedBooking.admin_notes || 'No admin notes'}
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(selectedBooking.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(selectedBooking.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditBooking(selectedBooking);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Edit Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Update Booking</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tractor Assigned
                  </label>
                  <input
                    type="text"
                    value={editForm.tractor_assigned}
                    onChange={(e) => setEditForm({ ...editForm, tractor_assigned: e.target.value })}
                    placeholder="e.g., Tractor #MF-385-001"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                    rows={4}
                    placeholder="Add any notes about this booking..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBooking}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Update Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Proof Modal */}
      {showProofModal && selectedBooking && selectedBooking.proof_of_payment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Payment Proof</h2>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Booking #{selectedBooking.id} - {selectedBooking.full_name}
              </p>
              
              {selectedBooking.proof_of_payment.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={`${API_URL.replace('/api', '')}/uploads/proofs/${selectedBooking.proof_of_payment}`}
                  alt="Payment Proof"
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <FaFilePdf className="text-6xl text-red-500 mx-auto mb-4" />
                  <p className="text-gray-700 mb-4">PDF Document - {selectedBooking.proof_of_payment}</p>
                  <a
                    href={`${API_URL.replace('/api', '')}/uploads/proofs/${selectedBooking.proof_of_payment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaFilePdf className="mr-2" />
                    Open PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;