'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface Booking {
  id: number;
  created_at: string;
  status: string;
  full_name: string;
  location_description: string;
  available_time: string;
  contact_number: string;
  hours_booked: number;
  total_amount: number;
  payment_method: string;
  admin_notes?: string;
  tractor_assigned?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/bookings/farmer/${encodeURIComponent(email)}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return 'Invalid date';
    }
  };

  const retryFetch = () => {
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Bookings
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Track your tractor service bookings
          </p>
        </div>

        {/* Search Form */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="max-w-xl">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 color-black">
                Enter your email to view bookings
              </label>
              <div className="mt-4 flex space-x-3 text-black">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null); // Clear error on type
                  }}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  onClick={fetchBookings}
                  disabled={!email || loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'View Bookings'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length > 0 && !loading && (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Booking #{booking.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Booked on {formatDate(booking.created_at)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {booking.full_name || 'Not provided'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {booking.location_description || 'Not provided'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Service Time</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {formatDate(booking.available_time)}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {booking.contact_number || 'Not provided'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Payment Details</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>Hours:</span><span>{booking.hours_booked}</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span>E{booking.total_amount}.00</span></div>
                            <div className="flex justify-between"><span>Method:</span><span>{booking.payment_method}</span></div>
                          </div>
                        </dd>
                      </div>
                      {booking.admin_notes && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Admin Notes</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {booking.admin_notes}
                          </dd>
                        </div>
                      )}
                      {booking.tractor_assigned && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Tractor Assigned</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {booking.tractor_assigned}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 text-center py-8">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Retry
            </button>
          </div>
        )}

        {bookings.length === 0 && email && !loading && !error && (
          <div className="mt-8 text-center">
            <p className="text-gray-500">No bookings found for this email.</p>
          </div>
        )}

        {(!email || bookings.length === 0) && !loading && !error && (
          <div className="mt-8 text-center text-gray-500">
            <p>Enter your email above to view your bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}