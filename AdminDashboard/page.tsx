'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    FaCalendarCheck, 
    FaClock, 
    FaUser, 
    FaTractor, 
    FaMapMarkerAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaMoneyBillWave,
    FaChartBar,
    FaSpinner,
    FaTachometerAlt,
    FaPhone,
    FaEnvelope
} from 'react-icons/fa';

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
  status: string;
  created_at: string;
  // Add other fields as needed
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]); // Initialize as empty array
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Using the enhanced admin endpoint
      const response = await axios.get('http://localhost:5000/api/admin/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', response.data); // Debug log

      // Check the response structure and extract bookings
      if (response.data && response.data.success) {
        // New endpoint format with success wrapper
        setBookings(response.data.bookings || []);
        setFilteredBookings(response.data.bookings || []);
      } else if (Array.isArray(response.data)) {
        // Legacy endpoint format (direct array)
        setBookings(response.data);
        setFilteredBookings(response.data);
      } else if (response.data && response.data.bookings) {
        // Alternative format
        setBookings(response.data.bookings);
        setFilteredBookings(response.data.bookings);
      } else {
        // Fallback - ensure we always set an array
        console.error('Unexpected response format:', response.data);
        setBookings([]);
        setFilteredBookings([]);
      }

    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to fetch bookings');
      setBookings([]); // Set empty array on error
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort bookings - with safety checks
  useEffect(() => {
    if (!bookings || !Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings]; // Create a copy

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking && booking.status === statusFilter
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking && (
          (booking.full_name && booking.full_name.toLowerCase().includes(term)) ||
          (booking.email && booking.email.toLowerCase().includes(term)) ||
          (booking.contact_number && booking.contact_number.includes(term)) ||
          (booking.location_description && booking.location_description.toLowerCase().includes(term))
        )
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchTerm]);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Booking status updated');
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <FaTachometerAlt className="text-3xl text-green-600" />
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {(!filteredBookings || filteredBookings.length === 0) ? (
            <div className="text-center py-12">
              <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Farmer</th>
                      <th className="px-6 py-3 text-left">Contact</th>
                      <th className="px-6 py-3 text-left">Location</th>
                      <th className="px-6 py-3 text-left">Date & Time</th>
                      <th className="px-6 py-3 text-left">Hours</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking?.id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{booking?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{booking?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaPhone className="text-gray-400 mr-2" />
                            {booking?.contact_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {booking?.location_description || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {booking?.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking?.available_time || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {booking?.hours_booked || 0} hours
                        </td>
                        <td className="px-6 py-4 font-medium">
                          E {booking?.total_amount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking?.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking?.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking?.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={booking?.status || 'pending'}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with count */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {filteredBookings.length} of {bookings?.length || 0} bookings
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}