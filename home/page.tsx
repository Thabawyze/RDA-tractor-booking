'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Center {
  id: number;
  name: string;
  location: string;
}

export default function Home() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/centers`);
      setCenters(response.data);
    } catch (error) {
      console.error('Error fetching centers:', error);
      setError('Failed to load service centers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-700">
                🚜 TractorEase
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-green-600">
                Home
              </Link>
              <Link href="/bookings" className="text-gray-700 hover:text-green-600">
                My Bookings
              </Link>
              <Link href="/centers" className="text-gray-700 hover:text-green-600">
                Service Centers
              </Link>
              <Link href="/admin" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Book Tractor</span>
                  <span className="block text-green-600">Services Online</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Easily book tractor services, track your bookings, and access agricultural services information for your Inkhundla center.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/booking"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                    >
                      Book Tractor Now
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/centers"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10"
                    >
                      View Services
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1586771107445-d3ca888129fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Tractor in field"
          />
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              Services
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Agricultural Services Available
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Access various agricultural services at your nearest Inkhundla center
            </p>
          </div>

          {error ? (
            <div className="mt-10 text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
              <button
                onClick={fetchCenters}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : centers.length === 0 ? (
            <div className="mt-10 text-center py-8">
              <p className="text-gray-500 text-lg">No service centers available at the moment.</p>
            </div>
          ) : (
            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {centers.slice(0, 3).map((center) => (
                  <div key={center.id} className="pt-6">
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg" aria-label="Service center icon">
                          <span className="text-white text-2xl sr-only">🏢</span>
                          <span className="sr-only">Service center</span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                          {center?.name || 'Unnamed Center'}
                        </h3>
                        <p className="mt-5 text-base text-gray-500">
                          {center?.location || 'Location not available'}
                        </p>
                        <div className="mt-4">
                          <Link
                            href={`/centers/${center.id}`}
                            className="text-green-600 hover:text-green-500 font-medium"
                          >
                            View Services →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}