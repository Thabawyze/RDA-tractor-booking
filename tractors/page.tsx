'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  FaTractor, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaGasPump,
  FaCog,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';
import BookingModal from '@/components/BookingModal';

// Define types
interface Tractor {
  id: string;
  model: string;
  tractor_number: string;
  capacity: string;
  hourly_rate: string | number;
  status: string;
  inkhundla_id: string;
  inkhundla_name: string;
  region?: string;
  image_url?: string;
  fuel_type?: string;
  year?: string | number;
  contact_person?: string;
  contact_phone?: string;
}

interface Inkhundla {
  id: string;
  name: string;
  region: string;
  contact_person?: string;
  contact_phone?: string;
}

interface TractorParams {
  status: string;
  inkhundla_id?: string;
  region?: string;
}

interface Filters {
  inkhundla_id: string;
  region: string;
  status: string;
  search: string;
  minRate: string;
  maxRate: string;
  minHP: string;
  sortBy: string;
}

// API Response interfaces
interface TractorsResponse {
  tractors: Tractor[];
}

interface InkhundlaResponse {
  inkhundla: Inkhundla[];
}

const TractorsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [inkhundlaList, setInkhundlaList] = useState<Inkhundla[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [filters, setFilters] = useState<Filters>({
    inkhundla_id: searchParams.get('inkhundla_id') || '',
    region: searchParams.get('region') || '',
    status: 'available',
    search: '',
    minRate: '',
    maxRate: '',
    minHP: '',
    sortBy: 'name' // 'name', 'price-low', 'price-high', 'hp-high', 'hp-low'
  });

  // Tractor specifications and features data
  const tractorFeatures = {
    common: [
      { icon: <FaCheckCircle className="text-green-500" />, text: 'Regular maintenance' },
      { icon: <FaCheckCircle className="text-green-500" />, text: 'Experienced operators available' },
      { icon: <FaCheckCircle className="text-green-500" />, text: 'Fuel included in rate' },
      { icon: <FaCheckCircle className="text-green-500" />, text: 'Insurance coverage' }
    ]
  };

  useEffect(() => {
    fetchData();
  }, [filters.inkhundla_id, filters.region, filters.status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters with proper typing
      const tractorParams: TractorParams = {
        status: filters.status
      };
      
      // Only add properties if they have values
      if (filters.inkhundla_id) {
        tractorParams.inkhundla_id = filters.inkhundla_id;
      }
      if (filters.region) {
        tractorParams.region = filters.region;
      }
      
      // Fetch tractors and inkhundla data with proper typing
      const [tractorResponse, inkhundlaResponse] = await Promise.all([
        axios.get<TractorsResponse>('/api/tractors', { params: tractorParams }),
        axios.get<InkhundlaResponse>('/api/inkhundla')
      ]);
      
      setTractors(tractorResponse.data.tractors || []);
      
      // Process inkhundla data
      const inkhundlaData = inkhundlaResponse.data.inkhundla || [];
      setInkhundlaList(inkhundlaData);
      
      // Extract unique regions from inkhundla data with proper typing
      const uniqueRegions: string[] = [...new Set(
        inkhundlaData
          .map((ink: Inkhundla) => ink.region)
          .filter((region): region is string => Boolean(region))
      )];
      setRegions(uniqueRegions);
      
    } catch (error) {
      toast.error('Failed to load tractors');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      inkhundla_id: '',
      region: '',
      status: 'available',
      search: '',
      minRate: '',
      maxRate: '',
      minHP: '',
      sortBy: 'name'
    });
  };

  const handleBookNow = (tractor: Tractor) => {
    // Check if user is authenticated (you can implement your own auth check)
    const isAuthenticated = localStorage.getItem('token'); // or however you store auth
    if (!isAuthenticated) {
      toast.info('Please login to book a tractor');
      router.push('/login');
      return;
    }
    setSelectedTractor(tractor);
    setShowBookingModal(true);
  };

  const handleViewDetails = (tractor: Tractor) => {
    setSelectedTractor(tractor);
    // You can implement a details modal or page here
    toast.info(`Viewing details for ${tractor.model}`);
  };

  // Extract HP from capacity string (e.g., "75 HP" -> 75)
  const extractHP = (capacity: string): number => {
    const match = capacity?.match(/(\d+)\s*HP/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter and sort tractors
  const getFilteredAndSortedTractors = (): Tractor[] => {
    let filtered = [...tractors];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tractor => 
        tractor.model?.toLowerCase().includes(searchLower) ||
        tractor.tractor_number?.toLowerCase().includes(searchLower) ||
        tractor.inkhundla_name?.toLowerCase().includes(searchLower)
      );
    }

    // Rate filters
    if (filters.minRate) {
      filtered = filtered.filter(t => parseFloat(t.hourly_rate.toString()) >= parseFloat(filters.minRate));
    }
    if (filters.maxRate) {
      filtered = filtered.filter(t => parseFloat(t.hourly_rate.toString()) <= parseFloat(filters.maxRate));
    }

    // HP filter
    if (filters.minHP) {
      filtered = filtered.filter(t => extractHP(t.capacity) >= parseInt(filters.minHP));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return parseFloat(a.hourly_rate.toString()) - parseFloat(b.hourly_rate.toString());
        case 'price-high':
          return parseFloat(b.hourly_rate.toString()) - parseFloat(a.hourly_rate.toString());
        case 'hp-high':
          return extractHP(b.capacity) - extractHP(a.capacity);
        case 'hp-low':
          return extractHP(a.capacity) - extractHP(b.capacity);
        case 'name':
        default:
          return (a.model || '').localeCompare(b.model || '');
      }
    });

    return filtered;
  };

  const filteredTractors = getFilteredAndSortedTractors();

  // Get price range for display
  const priceRange = tractors.length > 0 ? {
    min: Math.min(...tractors.map(t => parseFloat(t.hourly_rate.toString()))),
    max: Math.max(...tractors.map(t => parseFloat(t.hourly_rate.toString())))
  } : { min: 0, max: 0 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tractors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Tractors
          </h1>
          <p className="text-lg text-gray-600">
            Browse and book tractors across Eswatini • E{priceRange.min.toFixed(0)} - E{priceRange.max.toFixed(0)} per hour
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Tractors</p>
            <p className="text-2xl font-bold text-gray-900">{tractors.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Available Now</p>
            <p className="text-2xl font-bold text-green-600">
              {tractors.filter(t => t.status === 'available').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Avg. Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              E{(tractors.reduce((sum, t) => sum + parseFloat(t.hourly_rate.toString()), 0) / (tractors.length || 1)).toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Locations</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(tractors.map(t => t.inkhundla_id)).size}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FaFilter className="mr-2 text-green-600" />
              Filter Tractors
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by model, number, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Inkhundla Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inkhundla
              </label>
              <select
                value={filters.inkhundla_id}
                onChange={(e) => handleFilterChange('inkhundla_id', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Tinkhundla</option>
                {inkhundlaList
                  .filter(ink => !filters.region || ink.region === filters.region)
                  .map(ink => (
                    <option key={ink.id} value={ink.id}>
                      {ink.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Min HP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Horsepower
              </label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={filters.minHP}
                onChange={(e) => handleFilterChange('minHP', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Min Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Rate (E)
              </label>
              <input
                type="number"
                placeholder="e.g., 200"
                value={filters.minRate}
                onChange={(e) => handleFilterChange('minRate', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Max Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. Rate (E)
              </label>
              <input
                type="number"
                placeholder="e.g., 500"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="hp-high">Power: High to Low</option>
                <option value="hp-low">Power: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-semibold text-green-600">{filteredTractors.length}</span> of {tractors.length} tractors
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Link 
              href="/centers"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              <FaMapMarkerAlt className="mr-1" />
              Browse by Centers
            </Link>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Tractors Display */}
        {filteredTractors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tractors Found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTractors.map(tractor => (
              <div
                key={tractor.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Tractor Image */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative">
                  {tractor.image_url ? (
                    <img
                      src={tractor.image_url}
                      alt={tractor.model}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaTractor className="text-white text-8xl opacity-50" />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tractor.status === 'available' 
                        ? 'bg-green-100 text-green-700'
                        : tractor.status === 'in_use'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tractor.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                {/* Tractor Details */}
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {tractor.model || 'Unknown Model'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      #{tractor.tractor_number || 'N/A'}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-green-600 flex-shrink-0" />
                      <span className="truncate">{tractor.inkhundla_name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaCog className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>{tractor.capacity || 'N/A'}</span>
                    </div>
                    
                    {tractor.fuel_type && (
                      <div className="flex items-center text-gray-600">
                        <FaGasPump className="mr-2 text-gray-400 flex-shrink-0" />
                        <span>{tractor.fuel_type}</span>
                      </div>
                    )}
                    
                    {tractor.year && (
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0" />
                        <span>{tractor.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-4 space-y-1">
                    {tractorFeatures.common.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <span className="text-green-600 mr-1">{feature.icon}</span>
                        {feature.text}
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <FaMoneyBillWave className="mr-2 text-green-600" />
                        <span className="text-sm">Hourly Rate</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-700">
                          E{parseFloat(tractor.hourly_rate?.toString() || '0').toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleViewDetails(tractor)}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleBookNow(tractor)}
                      disabled={tractor.status !== 'available'}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        tractor.status === 'available'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {tractor.status === 'available' ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredTractors.map(tractor => (
              <div
                key={tractor.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="md:w-48 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {tractor.image_url ? (
                      <img
                        src={tractor.image_url}
                        alt={tractor.model}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <FaTractor className="text-white text-6xl opacity-50" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {tractor.model || 'Unknown Model'}
                        </h3>
                        <p className="text-sm text-gray-500">#{tractor.tractor_number || 'N/A'}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        tractor.status === 'available' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tractor.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">{tractor.inkhundla_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Power</p>
                        <p className="font-semibold text-gray-900">{tractor.capacity || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fuel</p>
                        <p className="font-semibold text-gray-900">{tractor.fuel_type || 'Diesel'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="font-semibold text-gray-900">{tractor.year || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-4">
                      {tractorFeatures.common.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="text-green-600 mr-1">{feature.icon}</span>
                          {feature.text}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Hourly Rate</p>
                          <p className="text-2xl font-bold text-green-700">
                            E{parseFloat(tractor.hourly_rate?.toString() || '0').toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleViewDetails(tractor)}
                          className="flex-1 sm:flex-none px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBookNow(tractor)}
                          disabled={tractor.status !== 'available'}
                          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition-colors ${
                            tractor.status === 'available'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {tractor.status === 'available' ? 'Book Now' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FaInfoCircle className="mr-2" />
            Booking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Booking Hours:</h4>
              <ul className="space-y-1">
                <li>• Minimum: 2 hours</li>
                <li>• Maximum: 12 hours per day</li>
                <li>• Book up to 30 days ahead</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payment Options:</h4>
              <ul className="space-y-1">
                <li>• MTN MoMo (Mobile Money)</li>
                <li>• Credit/Debit Cards (Stripe)</li>
                <li>• Instant confirmation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cancellation:</h4>
              <ul className="space-y-1">
                <li>• Free cancellation 24hrs before</li>
                <li>• Refund in 5-7 business days</li>
                <li>• Modify bookings anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTractor && (
        <BookingModal
          tractor={selectedTractor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTractor(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedTractor(null);
            toast.success('Booking created! Redirecting to payment...');
            setTimeout(() => router.push('/bookings'), 2000);
          }}
        />
      )}
    </div>
  );
};

export default TractorsPage;