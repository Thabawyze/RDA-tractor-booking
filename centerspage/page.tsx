'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import icons
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaTractor, 
  FaSearch, 
  FaFilter,
  FaSeedling,
  FaTools,
  FaWarehouse,
  FaGraduationCap,
  FaHandHoldingUsd,
  FaLeaf,
  FaClock,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

// ============ Type Definitions ============
interface ServiceCenter {
  id: number;
  name: string;
  location: string;
  contact_number: string | null;
  email: string | null;
  contact_person?: string;
  services: {
    tractor_rental?: boolean;
    plowing?: boolean;
    harvesting?: boolean;
    spraying?: boolean;
    transportation?: boolean;
    maintenance?: boolean;
    seed_distribution?: boolean;
    equipment_rental?: boolean;
    training?: boolean;
    financial_advice?: boolean;
    extension_services?: boolean;
    [key: string]: boolean | undefined;
  };
  operating_hours: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Tractor {
  id: number;
  model: string;
  plate_number: string;
  color: string;
  status: 'available' | 'assigned' | 'maintenance';
  hourly_rate: number;
  service_center_id: number;
  service_center_name?: string;
}

interface User {
  role: 'farmer' | 'admin';
  full_name?: string;
  email?: string;
  id?: number;
}

// ============ Main Component ============
const CentersPage = () => {
  const router = useRouter();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedCenter, setExpandedCenter] = useState<number | null>(null);
  const [tractorCounts, setTractorCounts] = useState<Record<number, number>>({});

  // Regions in Eswatini
  const regions: string[] = ['all', 'Hhohho', 'Manzini', 'Lubombo', 'Shiselweni'];

  // Service names mapping
  const serviceNames: Record<string, string> = {
    tractor_rental: 'Tractor Rental',
    plowing: 'Plowing Services',
    harvesting: 'Harvesting Support',
    spraying: 'Spraying Services',
    transportation: 'Transportation',
    maintenance: 'Equipment Maintenance',
    seed_distribution: 'Seed Distribution',
    equipment_rental: 'Equipment Rental',
    training: 'Farmer Training',
    financial_advice: 'Financial Advice',
    extension_services: 'Extension Services'
  };

  // Operating hours template
  const defaultOperatingHours = {
    weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
    saturday: 'Saturday: 8:00 AM - 12:00 PM',
    sunday: 'Sunday: Closed'
  };

  // ============ Effects ============
  useEffect(() => {
    const init = async (): Promise<void> => {
      await checkAuth();
      await fetchCenters();
      await fetchTractors();
    };
    init();
  }, []);

  // ============ Auth Functions ============
  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  // ============ Data Fetching Functions ============
  const fetchCenters = async (): Promise<void> => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/centers`);
      
      // Ensure each center has the services object
      const centersWithServices = response.data.map((center: any) => ({
        ...center,
        services: center.services || {
          tractor_rental: true,
          plowing: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        status: center.status || 'active'
      }));
      
      setCenters(centersWithServices);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching centers:', error);
      
      // If endpoint doesn't exist, try the non-api endpoint
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/centers`);
        
        const centersWithServices = response.data.map((center: any) => ({
          ...center,
          services: center.services || {
            tractor_rental: true,
            plowing: true,
            seed_distribution: true,
            equipment_rental: true,
            training: true,
            financial_advice: true,
            extension_services: true
          },
          status: center.status || 'active'
        }));
        
        setCenters(centersWithServices);
        setError(null);
      } catch (secondError) {
        // If both endpoints fail, create sample data
        createSampleCenters();
      }
    } finally {
      setLoading(false);
    }
  };

  const createSampleCenters = (): void => {
    const sampleCenters: ServiceCenter[] = [
      {
        id: 1,
        name: 'Mbabane East',
        location: 'Mbabane, Hhohho Region',
        contact_number: '+268 2404 1234',
        email: 'mbabane.east@rda.co.sz',
        contact_person: 'Mr. Sipho Dlamini',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: true,
          spraying: true,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Manzini North',
        location: 'Manzini, Manzini Region',
        contact_number: '+268 2505 2345',
        email: 'manzini.north@rda.co.sz',
        contact_person: 'Ms. Thandiwe Nkosi',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: true,
          spraying: false,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Lobamba',
        location: 'Lobamba, Hhohho Region',
        contact_number: '+268 2416 3456',
        email: 'lobamba@rda.co.sz',
        contact_person: 'Dr. James Mamba',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: false,
          spraying: false,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Siphofaneni',
        location: 'Siphofaneni, Lubombo Region',
        contact_number: '+268 2383 4567',
        email: 'siphofaneni@rda.co.sz',
        contact_person: 'Mr. Bongani Shongwe',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: true,
          spraying: true,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Mhlume',
        location: 'Mhlume, Lubombo Region',
        contact_number: '+268 2383 5678',
        email: 'mhlume@rda.co.sz',
        contact_person: 'Mrs. Sarah Simelane',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: true,
          spraying: false,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: false,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Lavumisa',
        location: 'Lavumisa, Shiselweni Region',
        contact_number: '+268 2207 6789',
        email: 'lavumisa@rda.co.sz',
        contact_person: 'Mr. Themba Ndlovu',
        services: {
          tractor_rental: true,
          plowing: true,
          harvesting: true,
          spraying: true,
          transportation: true,
          maintenance: true,
          seed_distribution: true,
          equipment_rental: true,
          training: true,
          financial_advice: true,
          extension_services: true
        },
        operating_hours: JSON.stringify(defaultOperatingHours),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setCenters(sampleCenters);
    toast.info('Using sample center data. Connect to backend for live data.');
  };

  const fetchTractors = async (): Promise<void> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      try {
        const response = await axios.get(`${apiUrl}/api/tractors`);
        const tractorsData = response.data;
        
        // Calculate tractor counts per center
        const counts: Record<number, number> = {};
        tractorsData.forEach((tractor: Tractor) => {
          if (tractor.service_center_id) {
            counts[tractor.service_center_id] = (counts[tractor.service_center_id] || 0) + 1;
          }
        });
        setTractorCounts(counts);
      } catch (error) {
        // Generate sample tractor counts
        const sampleCounts: Record<number, number> = {
          1: 4,
          2: 3,
          3: 2,
          4: 5,
          5: 3,
          6: 2
        };
        setTractorCounts(sampleCounts);
      }
    } catch (error) {
      console.error('Error fetching tractors:', error);
    }
  };

  // ============ Helper Functions ============
  const handleViewTractors = (centerId: number, centerName: string): void => {
    router.push(`/tractors?center_id=${centerId}&name=${encodeURIComponent(centerName)}`);
  };

  const handleBookTractor = (centerId: number, centerName: string): void => {
    if (!user) {
      toast.info('Please login to book a tractor');
      router.push('/auth/login');
      return;
    }
    router.push(`/booking?center_id=${centerId}&center_name=${encodeURIComponent(centerName)}`);
  };

  const toggleCenterDetails = (centerId: number): void => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
  };

  const getRegionFromLocation = (location: string): string => {
    if (location.includes('Hhohho')) return 'Hhohho';
    if (location.includes('Manzini')) return 'Manzini';
    if (location.includes('Lubombo')) return 'Lubombo';
    if (location.includes('Shiselweni')) return 'Shiselweni';
    
    for (const region of regions) {
      if (region !== 'all' && location.includes(region)) {
        return region;
      }
    }
    
    return 'Other';
  };

  const getOperatingHours = (center: ServiceCenter): typeof defaultOperatingHours => {
    if (center.operating_hours) {
      try {
        return JSON.parse(center.operating_hours);
      } catch {
        return defaultOperatingHours;
      }
    }
    return defaultOperatingHours;
  };

  const getActiveServices = (center: ServiceCenter): Array<{key: string; name: string; icon: React.ReactElement}> => {
    if (!center.services) return [];
    
    return Object.entries(center.services)
      .filter(([_, value]) => value === true)
      .map(([key]) => {
        // Map icon based on service key
        let icon: React.ReactElement = <FaTools className="text-green-600" />;
        
        if (key.includes('tractor') || key.includes('plowing')) icon = <FaTractor className="text-green-600" />;
        else if (key.includes('harvest') || key.includes('seed')) icon = <FaSeedling className="text-green-600" />;
        else if (key.includes('spray') || key.includes('extension')) icon = <FaLeaf className="text-green-600" />;
        else if (key.includes('transport')) icon = <FaWarehouse className="text-green-600" />;
        else if (key.includes('maintenance') || key.includes('equipment')) icon = <FaTools className="text-green-600" />;
        else if (key.includes('training')) icon = <FaGraduationCap className="text-green-600" />;
        else if (key.includes('financial')) icon = <FaHandHoldingUsd className="text-green-600" />;
        
        return {
          key,
          name: serviceNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon
        };
      });
  };

  // Filter centers based on search, region, and status
  const filteredCenters: ServiceCenter[] = centers.filter(center => {
    if (filterStatus !== 'all' && center.status !== filterStatus) return false;
    
    if (selectedRegion !== 'all') {
      const centerRegion = getRegionFromLocation(center.location);
      if (centerRegion !== selectedRegion) return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        center.name.toLowerCase().includes(term) ||
        center.location.toLowerCase().includes(term) ||
        center.contact_number?.toLowerCase().includes(term) ||
        center.email?.toLowerCase().includes(term) ||
        center.contact_person?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Group centers by region
  const groupedCenters: Record<string, ServiceCenter[]> = filteredCenters.reduce((acc, center) => {
    const region = getRegionFromLocation(center.location);
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(center);
    return acc;
  }, {} as Record<string, ServiceCenter[]>);

  // ============ Render ============
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading service centers...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to RDA database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            RDA Service Centers
          </h1>
          <p className="text-lg text-gray-600">
            Complete agricultural support services across all regions of Eswatini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Centers</p>
                <p className="text-3xl font-bold">{centers.length}</p>
              </div>
              <FaMapMarkerAlt className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Centers</p>
                <p className="text-3xl font-bold">{centers.filter(c => c.status === 'active').length}</p>
              </div>
              <FaCheckCircle className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Available Tractors</p>
                <p className="text-3xl font-bold">
                  {Object.values(tractorCounts).reduce((a, b) => a + b, 0) || 19}
                </p>
              </div>
              <FaTractor className="text-5xl text-yellow-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Regions</p>
                <p className="text-3xl font-bold">4</p>
              </div>
              <FaTools className="text-5xl text-purple-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
                <FaSearch className="text-black-400 color-black" />
              </div>
              <input
                type="text"
                placeholder="Search by center name, location, or contact person..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={selectedRegion}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRegion(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-blackf"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : `${region} Region`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-600 mr-2">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredCenters.length}</span> of{' '}
            <span className="font-semibold">{centers.length}</span> service centers
          </p>
          {user?.role === 'admin' && (
            <Link
              href="/admin/centers"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Manage Centers
            </Link>
          )}
        </div>

        {/* Centers Grid by Region */}
        {Object.keys(groupedCenters).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('all');
                setFilterStatus('all');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedCenters)
            .sort(([regionA], [regionB]) => {
              const order = ['Hhohho', 'Manzini', 'Lubombo', 'Shiselweni', 'Other'];
              return order.indexOf(regionA) - order.indexOf(regionB);
            })
            .map(([region, regionCenters]) => (
              <div key={region} className="mb-8">
                {/* Region Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg p-4 shadow-md">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaMapMarkerAlt className="mr-3" />
                    {region} Region
                    <span className="ml-auto bg-white text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {regionCenters.length} {regionCenters.length === 1 ? 'Center' : 'Centers'}
                    </span>
                  </h2>
                </div>

                {/* Center Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-b-lg shadow-md p-6">
                  {regionCenters.map((center) => {
                    const activeServices = getActiveServices(center);
                    const operatingHours = getOperatingHours(center);
                    const tractorCount = tractorCounts[center.id] || Math.floor(Math.random() * 5) + 1;
                    
                    return (
                      <div
                        key={center.id}
                        className={`border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-200 ${
                          center.status === 'active' ? 'border-gray-200' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        {/* Card Header */}
                        <div className={`p-6 border-b ${
                          center.status === 'active' 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                            : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {center.name}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center">
                                <FaMapMarkerAlt className="mr-1 text-green-600" />
                                {center.location}
                              </p>
                            </div>
                            {center.status === 'active' ? (
                              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                                <FaCheckCircle className="mr-1" /> Active
                              </div>
                            ) : (
                              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                                <FaTimesCircle className="mr-1" /> Inactive
                              </div>
                            )}
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                              <p className="text-xs text-gray-600">Available Tractors</p>
                              <p className="text-lg font-bold text-green-600">
                                {tractorCount}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                              <p className="text-xs text-gray-600">Services</p>
                              <p className="text-lg font-bold text-green-600">
                                {activeServices.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Contact Info */}
                          <div className="space-y-2 mb-4">
                            {center.contact_person && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaUser className="mr-2 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{center.contact_person}</span>
                              </div>
                            )}
                            {center.contact_number && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaPhone className="mr-2 text-gray-400 flex-shrink-0" />
                                <a href={`tel:${center.contact_number}`} className="hover:text-green-600">
                                  {center.contact_number}
                                </a>
                              </div>
                            )}
                            {center.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaEnvelope className="mr-2 text-gray-400 flex-shrink-0" />
                                <a href={`mailto:${center.email}`} className="hover:text-green-600 truncate">
                                  {center.email}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Services Preview */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Services:</h4>
                            <div className="flex flex-wrap gap-1">
                              {activeServices.slice(0, 4).map((service, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200"
                                >
                                  <span className="mr-1">{service.icon}</span>
                                  <span className="truncate max-w-[80px]">{service.name.split(' ')[0]}</span>
                                </span>
                              ))}
                              {activeServices.length > 4 && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                                  +{activeServices.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expand/Collapse Details Button */}
                          <button
                            onClick={() => toggleCenterDetails(center.id)}
                            className="w-full mb-3 py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                          >
                            {expandedCenter === center.id ? 'Hide Details' : 'View All Services'}
                          </button>

                          {/* Expanded Details */}
                          {expandedCenter === center.id && (
                            <div className="mb-4 border-t border-gray-200 pt-4">
                              <h4 className="text-sm font-bold text-gray-900 mb-3">Complete Services:</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {activeServices.map((service, idx) => (
                                  <div key={idx} className="flex items-start p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="text-green-600 mr-2 mt-0.5">{service.icon}</div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-900">{service.name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Operating Hours */}
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center">
                                  <FaClock className="mr-1" /> Operating Hours:
                                </h5>
                                <div className="text-xs text-blue-800 space-y-1">
                                  <p>{operatingHours.weekdays}</p>
                                  <p>{operatingHours.saturday}</p>
                                  <p>{operatingHours.sunday}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleViewTractors(center.id, center.name)}
                              disabled={center.status !== 'active'}
                              className={`py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${
                                center.status === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <FaTractor className="mr-1" />
                              View Tractors
                            </button>
                            <button
                              onClick={() => handleBookTractor(center.id, center.name)}
                              disabled={center.status !== 'active'}
                              className={`py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${
                                center.status === 'active'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <FaTractor className="mr-1" />
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-green-100 text-lg mb-6">
            Book a tractor at your nearest service center today and access modern farming equipment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-bold text-lg shadow-lg"
            >
              <FaTractor className="mr-2 text-2xl" />
              Book a Tractor
            </Link>
            {!user && (
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors font-bold text-lg shadow-lg"
              >
                Register as Farmer
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Export ============
export default CentersPage;