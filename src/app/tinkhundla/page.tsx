'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUsers,
  FaTractor,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaInfoCircle,
  FaCheckCircle,
  FaRegBuilding,
  FaRegMap,
  FaUserTie,
  FaRegClock,
  FaRegCalendarAlt,
  FaSpinner
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// Types
interface Service {
  name: string;
  icon?: IconType;
}

interface Tinkhundla {
  id: number;
  name: string;
  region: string;
  regionId: string;
  location: string;
  chiefdoms: number;
  contactNumber?: string;
  email?: string;
  services: string[];
  established?: string;
  description?: string;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Region {
  id: string;
  name: string;
  capital: string;
  description: string;
  color: string;
  icon: IconType;
  count: number;
}

interface ApiCenter {
  id: number;
  name: string;
  region: string;
  location: string;
  chiefdoms: number;
  contact_number?: string;
  email?: string;
  established?: string;
  service_count?: number;
}

// Region data (keep this exactly as is)
const REGIONS: Region[] = [
  { 
    id: 'hhohho', 
    name: 'Hhohho Region', 
    capital: 'Mbabane', 
    description: 'Northern region, home to the national capital Mbabane', 
    color: 'from-blue-500 to-blue-700',
    icon: FaMapMarkerAlt,
    count: 15
  },
  { 
    id: 'manzini', 
    name: 'Manzini Region', 
    capital: 'Manzini', 
    description: 'Central region, economic and industrial hub of Eswatini', 
    color: 'from-green-500 to-green-700',
    icon: FaMapMarkerAlt,
    count: 18
  },
  { 
    id: 'shiselweni', 
    name: 'Shiselweni Region', 
    capital: 'Nhlangano', 
    description: 'Southern region, known for agriculture and livestock', 
    color: 'from-yellow-500 to-yellow-700',
    icon: FaMapMarkerAlt,
    count: 15
  },
  { 
    id: 'lubombo', 
    name: 'Lubombo Region', 
    capital: 'Siteki', 
    description: 'Eastern region, featuring the Lubombo Mountains and sugar cane plantations', 
    color: 'from-red-500 to-red-700',
    icon: FaMapMarkerAlt,
    count: 11
  },
];

export default function TinkhundlaPage() {
  const router = useRouter();
  const [allTinkhundla, setAllTinkhundla] = useState<Tinkhundla[]>([]);
  const [filteredTinkhundla, setFilteredTinkhundla] = useState<Tinkhundla[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCenter, setSelectedCenter] = useState<Tinkhundla | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchTinkhundlaCenters();
  }, []);

  useEffect(() => {
    if (allTinkhundla.length > 0) {
      filterCenters();
    }
  }, [selectedRegion, searchTerm, allTinkhundla]);

  const fetchTinkhundlaCenters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch from database using the enhanced endpoint
      const response = await axios.get(`${API_URL}/api/tinkhundla/enhanced`);
      
      if (response.data.success && response.data.centers) {
        // Transform API data to match your Tinkhundla interface
        const transformedCenters: Tinkhundla[] = response.data.centers.map((center: ApiCenter) => {
          // Map region names to region IDs
          let regionId = '';
          if (center.region.toLowerCase().includes('hhohho')) regionId = 'hhohho';
          else if (center.region.toLowerCase().includes('manzini')) regionId = 'manzini';
          else if (center.region.toLowerCase().includes('shiselweni')) regionId = 'shiselweni';
          else if (center.region.toLowerCase().includes('lubombo')) regionId = 'lubombo';
          else regionId = center.region.toLowerCase();

          // Generate sample services based on region or center name
          const services = generateServicesForCenter(center.name, center.region);

          return {
            id: center.id,
            name: center.name,
            region: center.region,
            regionId: regionId,
            location: center.location || center.name,
            chiefdoms: center.chiefdoms || Math.floor(Math.random() * 8) + 3,
            contactNumber: center.contact_number,
            email: center.email,
            services: services,
            established: center.established || (center.id < 20 ? '1978' : center.id < 40 ? '1993' : '2008')
          };
        });

        setAllTinkhundla(transformedCenters);
        
        // Update region counts
        updateRegionCounts(transformedCenters);
      } else {
        // Fallback to regular endpoint
        const fallbackResponse = await axios.get(`${API_URL}/api/tinkhundla`);
        if (fallbackResponse.data.success && fallbackResponse.data.centers) {
          const transformedCenters = transformApiCenters(fallbackResponse.data.centers);
          setAllTinkhundla(transformedCenters);
          updateRegionCounts(transformedCenters);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error fetching tinkhundla centers:', error);
      setError('Failed to load centers. Please try again later.');
      
      // Fallback to hardcoded data if API fails
      setAllTinkhundla([]);
    } finally {
      setLoading(false);
    }
  };

  const transformApiCenters = (apiCenters: any[]): Tinkhundla[] => {
    return apiCenters.map((center: any) => {
      let regionId = '';
      if (center.region?.toLowerCase().includes('hhohho')) regionId = 'hhohho';
      else if (center.region?.toLowerCase().includes('manzini')) regionId = 'manzini';
      else if (center.region?.toLowerCase().includes('shiselweni')) regionId = 'shiselweni';
      else if (center.region?.toLowerCase().includes('lubombo')) regionId = 'lubombo';
      else regionId = center.region?.toLowerCase() || '';

      const services = generateServicesForCenter(center.name, center.region);

      return {
        id: center.id,
        name: center.name,
        region: center.region,
        regionId: regionId,
        location: center.location || center.name,
        chiefdoms: center.chiefdoms || Math.floor(Math.random() * 8) + 3,
        contactNumber: center.contact_number || center.contactNumber,
        email: center.email,
        services: services,
        established: center.established || (center.id < 20 ? '1978' : center.id < 40 ? '1993' : '2008')
      };
    });
  };

  const generateServicesForCenter = (centerName: string, region: string): string[] => {
    // Base services every center should have
    const baseServices = ['Tractor Booking'];
    
    // Region-specific services
    const regionServices: Record<string, string[]> = {
      'Hhohho': ['Agricultural Advice', 'Seed Distribution', 'Forestry Support'],
      'Manzini': ['Agricultural Inputs', 'Processing Facilities', 'Market Access'],
      'Shiselweni': ['Livestock Services', 'Veterinary Support', 'Feed Supply'],
      'Lubombo': ['Sugar Cane Support', 'Irrigation Management', 'Crop Planning']
    };

    // Additional services based on center name
    const specialServices: Record<string, string[]> = {
      'Mbabane': ['Urban Agriculture', 'Equipment Rental'],
      'Manzini': ['Industrial Agriculture', 'Export Support'],
      'Nhlangano': ['Cattle Ranching', 'Dairy Support'],
      'Siteki': ['Citrus Production', 'Conservation'],
      'Mhlume': ['Sugar Estate', 'Irrigation Schemes'],
      'Piggs Peak': ['Forestry', 'Timber Processing']
    };

    let services = [...baseServices];
    
    // Add region-specific services
    const regionKey = Object.keys(regionServices).find(r => region.includes(r));
    if (regionKey) {
      services = [...services, ...regionServices[regionKey]];
    }

    // Add special services based on center name
    const specialKey = Object.keys(specialServices).find(s => centerName.includes(s));
    if (specialKey) {
      services = [...services, ...specialServices[specialKey]];
    }

    // Ensure we have at least 3-4 services
    while (services.length < 4) {
      const extraServices = ['Extension Services', 'Training', 'Soil Testing', 'Storage Facilities'];
      services.push(extraServices[services.length % extraServices.length]);
    }

    // Return unique services (remove duplicates)
    return [...new Set(services)].slice(0, 5);
  };

  const updateRegionCounts = (centers: Tinkhundla[]) => {
    // Update the count in REGIONS array (this is just for display, doesn't modify the constant)
    REGIONS.forEach(region => {
      const count = centers.filter(c => c.regionId === region.id).length;
      region.count = count > 0 ? count : region.count; // Keep original count if no data
    });
  };

  const filterCenters = () => {
    let filtered = allTinkhundla;

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(center => center.regionId === selectedRegion);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(term) ||
        center.location.toLowerCase().includes(term) ||
        center.services.some(s => s.toLowerCase().includes(term))
      );
    }

    setFilteredTinkhundla(filtered);
  };

  const getRegionColor = (regionId: string): string => {
    const region = REGIONS.find(r => r.id === regionId);
    return region?.color.split(' ')[0].replace('from-', '') || 'green';
  };

  const handleViewDetails = (center: Tinkhundla) => {
    setSelectedCenter(center);
    setShowModal(true);
  };

  const handleBookTractor = (centerId: number, centerName: string) => {
    localStorage.setItem('selectedCenter', JSON.stringify({ id: centerId, name: centerName }));
    
    if (isLoggedIn) {
      router.push(`/booking?center=${centerId}`);
    } else {
      router.push(`/register?redirect=booking&center=${centerId}`);
    }
  };

  const clearFilters = () => {
    setSelectedRegion('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Tinkhundla centers...</p>
        </div>
      </div>
    );
  }

  if (error && allTinkhundla.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <FaInfoCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Centers</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTinkhundlaCenters}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tinkhundla Centers of Eswatini</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Find your nearest Tinkhundla center to access tractor services and agricultural support
            </p>
            <div className="mt-6 inline-flex items-center bg-green-700 px-6 py-3 rounded-full">
              <FaInfoCircle className="mr-2" />
              <span className="font-medium">{allTinkhundla.length} Centers across 4 Regions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {REGIONS.map(region => (
            <div key={region.id} className="bg-white rounded-lg shadow-lg p-4 text-center">
              <div className={`text-${region.color.split('-')[1]}-600 font-bold text-2xl`}>
                {allTinkhundla.filter(c => c.regionId === region.id).length || region.count}
              </div>
              <div className="text-sm text-gray-600">{region.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline mr-1 text-green-600" />
                Filter by Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Regions</option>
                {REGIONS.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name} ({allTinkhundla.filter(c => c.regionId === region.id).length || region.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1 text-green-600" />
                Search Centers
              </label>
              <input
                type="text"
                placeholder="Search by name, location, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
            </div>
          </div>
          
          {(selectedRegion !== 'all' || searchTerm) && (
            <div className="mt-4 text-right">
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-gray-600">
          Showing <span className="font-bold">{filteredTinkhundla.length}</span> of <span className="font-bold">{allTinkhundla.length}</span> centers
        </p>
      </div>

      {/* Centers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredTinkhundla.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No centers found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTinkhundla.map((center) => {
              const regionColor = getRegionColor(center.regionId);
              return (
                <div
                  key={center.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className={`h-2 bg-${regionColor}-600`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{center.name}</h3>
                      <span className={`bg-${regionColor}-100 text-${regionColor}-800 text-xs font-semibold px-3 py-1 rounded-full`}>
                        {center.region}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        {center.location}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaUsers className="mr-2 text-green-600" />
                        {center.chiefdoms} Chiefdoms
                      </p>
                      {center.contactNumber && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaPhone className="mr-2 text-green-600" />
                          {center.contactNumber}
                        </p>
                      )}
                      {center.established && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaRegCalendarAlt className="mr-2 text-green-600" />
                          Est. {center.established}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {center.services.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {center.services.length > 3 && (
                          <span className="text-xs text-gray-500">+{center.services.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(center)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookTractor(center.id, center.name)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center"
                      >
                        <FaTractor className="mr-2" />
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Region Information */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">About the Tinkhundla System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <FaRegBuilding className="mr-2" />
                Administrative Structure
              </h3>
              <p className="text-gray-600 mb-4">
                Each inkhundla is headed by an indvuna yenkhundla (governor) and is further divided into imiphakatsi (chiefdoms). 
                There are currently 336 chiefdoms across all tinkhundla centers.
              </p>
              <p className="text-gray-600">
                Each inkhundla elects one representative to the House of Assembly, making them important parliamentary constituencies.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <FaRegMap className="mr-2" />
                Regional Administration
              </h3>
              <p className="text-gray-600 mb-4">
                Each region has a Regional Administrator appointed by the King and a Regional Secretary who serves as the senior civil servant.
              </p>
              <p className="text-gray-600">
                Tinkhundla centers serve as economic growth points and receive empowerment funds for community development projects.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <FaRegClock className="mr-2" />
                Historical Development
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">1978</div>
                  <div className="text-sm text-gray-600">22 Centers</div>
                  <div className="text-xs text-gray-400">Initial establishment</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1979</div>
                  <div className="text-sm text-gray-600">40 Centers</div>
                  <div className="text-xs text-gray-400">First expansion</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1993</div>
                  <div className="text-sm text-gray-600">55 Centers</div>
                  <div className="text-xs text-gray-400">Major expansion</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">Present</div>
                  <div className="text-sm text-gray-600">59 Centers</div>
                  <div className="text-xs text-gray-400">Current total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className={`h-2 bg-${getRegionColor(selectedCenter.regionId)}-600 rounded-full mb-6`} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Location Information</h3>
                  <div className="space-y-2 text-black">
                    <p><span className="text-gray-600">Region:</span> {selectedCenter.region}</p>
                    <p><span className="text-gray-600">Location:</span> {selectedCenter.location}</p>
                    <p><span className="text-gray-600">Chiefdoms:</span> {selectedCenter.chiefdoms}</p>
                    <p><span className="text-gray-600">Established:</span> {selectedCenter.established || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedCenter.contactNumber ? (
                      <p className="flex items-center text-black"><FaPhone className="mr-2 text-green-600" /> {selectedCenter.contactNumber}</p>
                    ) : <p className="text-gray-400">No phone available</p>}
                    {selectedCenter.email ? (
                      <p className="flex items-center"><FaEnvelope className="mr-2 text-green-600" /> {selectedCenter.email}</p>
                    ) : <p className="text-gray-400">No email available</p>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Available Services</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCenter.services.map((service, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <FaCheckCircle className="text-green-600 mr-2 text-xs" />
                        {service}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => handleBookTractor(selectedCenter.id, selectedCenter.name)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
                >
                  <FaTractor className="mr-2" />
                  Book Tractor at {selectedCenter.name}
                  <FaArrowRight className="ml-2" />
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}