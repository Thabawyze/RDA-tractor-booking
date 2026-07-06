'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Center {
  id: number;
  name: string;
  location: string;
  contact_number?: string;
  email?: string;
  services?: Record<string, string>;
}

export default function CenterDetailPage() {
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (id) {
      fetchCenter();
    } else {
      setError('Invalid center ID');
      setLoading(false);
    }
  }, [id]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/centers/${id}`);
      setCenter(response.data);
    } catch (error) {
      console.error('Error fetching center:', error);
      setError('Failed to load center details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    if (id) fetchCenter();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600 text-lg mb-4">{error || 'Center not found'}</p>
            <button
              onClick={retryFetch}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link 
            href="/centers" 
            className="text-green-600 hover:text-green-500 font-medium"
          >
            ← Back to Centers
          </Link>
        </nav>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg" role="article">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900">{center?.name || 'Unnamed Center'}</h1>
            <p className="mt-2 text-lg text-gray-600">{center?.location || 'Location not available'}</p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {center?.contact_number || 'Not provided'}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {center?.email || 'Not provided'}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Services Offered</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {center?.services ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {Object.entries(center.services).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No services listed'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Booking CTA */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Need Tractor Services?
          </h2>
          <p className="mt-2 text-gray-600">
            Book a tractor service from this center
          </p>
          <div className="mt-4">
            <Link
              href="/bookings"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}