'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
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
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaClock
} from 'react-icons/fa';

// Define TypeScript interfaces
interface Inkhundla {
  id: string;
  name: string;
  region: string;
  contact_person?: string;
  contact_phone?: string;
}

interface InkhundlaData {
  inkhundla: Inkhundla[];
  groupedByRegion: Record<string, Inkhundla[]>;
}

interface Tractor {
  id: string;
  inkhundla_id: string;
  [key: string]: any;
}

interface TractorCounts {
  [key: string]: number;
}

interface CenterDetails {
  phone: string;
  contact: string;
  email: string;
}

interface Service {
 icon: React.ReactNode; 
  name: string;
  description: string;
  details?: string[];
}

interface SpecializedServices {
  [key: string]: Service[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CentersPage = () => {
  const [loading, setLoading] = useState(true);
  const [inkhundlaData, setInkhundlaData] = useState<InkhundlaData>({ inkhundla: [], groupedByRegion: {} });
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tractorCounts, setTractorCounts] = useState<TractorCounts>({});
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);

  // Complete list of all 55 Tinkhundla with their details
  const tinkhundlaDetails: Record<string, CenterDetails> = {
    // Hhohho Region (12)
    'Hhukwini': { phone: '+268 2416 1201', contact: 'Mnt. S. Dlamini', email: 'hhukwini@rda.co.sz' },
    'Lobamba': { phone: '+268 2416 1202', contact: 'Mr. T. Mamba', email: 'lobamba@rda.co.sz' },
    'Madlangempisi': { phone: '+268 2416 1203', contact: 'Mrs. N. Simelane', email: 'madlangempisi@rda.co.sz' },
    'Maphalaleni': { phone: '+268 2416 1204', contact: 'Mr. B. Nkosi', email: 'maphalaleni@rda.co.sz' },
    'Mbabane East': { phone: '+268 2416 1205', contact: 'Ms. P. Mdluli', email: 'mbabane.east@rda.co.sz' },
    'Mbabane West': { phone: '+268 2416 1206', contact: 'Mr. S. Fakudze', email: 'mbabane.west@rda.co.sz' },
    'Motshane': { phone: '+268 2416 1207', contact: 'Mrs. T. Dlamini', email: 'motshane@rda.co.sz' },
    'Nkhaba': { phone: '+268 2416 1208', contact: 'Mr. M. Masuku', email: 'nkhaba@rda.co.sz' },
    'Nokwane': { phone: '+268 2416 1209', contact: 'Ms. L. Shongwe', email: 'nokwane@rda.co.sz' },
    'Ntfonjeni': { phone: '+268 2416 1210', contact: 'Mr. J. Ngwenya', email: 'ntfonjeni@rda.co.sz' },
    'Piggs Peak': { phone: '+268 2437 1211', contact: 'Mrs. S. Mnisi', email: 'piggspeak@rda.co.sz' },
    'Timphisini': { phone: '+268 2416 1212', contact: 'Mr. N. Vilakati', email: 'timphisini@rda.co.sz' },

    // Manzini Region (18)
    'Ekukhanyeni': { phone: '+268 2505 2301', contact: 'Ms. B. Dlamini', email: 'ekukhanyeni@rda.co.sz' },
    'Kwaluseni': { phone: '+268 2505 2302', contact: 'Mr. T. Mhlanga', email: 'kwaluseni@rda.co.sz' },
    'Lamgabhi': { phone: '+268 2505 2303', contact: 'Mrs. N. Mabuza', email: 'lamgabhi@rda.co.sz' },
    'Lobamba Lomdzala': { phone: '+268 2505 2304', contact: 'Mr. S. Simelane', email: 'lobamba.lomdzala@rda.co.sz' },
    'Ludzeludze': { phone: '+268 2505 2305', contact: 'Ms. P. Khumalo', email: 'ludzeludze@rda.co.sz' },
    'Mafutseni': { phone: '+268 2505 2307', contact: 'Mrs. L. Nxumalo', email: 'mafutseni@rda.co.sz' },
    'Mahlangatsha': { phone: '+268 2505 2308', contact: 'Mr. T. Maseko', email: 'mahlangatsha@rda.co.sz' },
    'Mangcongco': { phone: '+268 2505 2309', contact: 'Ms. S. Tfwala', email: 'mangcongco@rda.co.sz' },
    'Manzini North': { phone: '+268 2505 2310', contact: 'Mr. B. Maziya', email: 'manzini.north@rda.co.sz' },
    'Manzini South': { phone: '+268 2505 2311', contact: 'Mrs. N. Shongwe', email: 'manzini.south@rda.co.sz' },
    'Mahlanya': { phone: '+268 2505 2312', contact: 'Mr. J. Dlamini', email: 'mahlanya@rda.co.sz' },
    'Mkhiweni': { phone: '+268 2505 2313', contact: 'Ms. T. Magagula', email: 'mkhiweni@rda.co.sz' },
    'Mpaka': { phone: '+268 2505 2314', contact: 'Mr. S. Kunene', email: 'mpaka@rda.co.sz' },
    'Nhlambeni': { phone: '+268 2505 2316', contact: 'Mr. M. Hlophe', email: 'nhlambeni@rda.co.sz' },
    'Njabulweni': { phone: '+268 2505 2317', contact: 'Ms. L. Mamba', email: 'njabulweni@rda.co.sz' },
    

    // Lubombo Region (10)
    'Dvokodvweni': { phone: '+268 2383 3401', contact: 'Mrs. S. Gama', email: 'dvokodvweni@rda.co.sz' },
    'Lomahasha': { phone: '+268 2383 3402', contact: 'Mr. B. Simelane', email: 'lomahasha@rda.co.sz' },
    'Mhlume': { phone: '+268 2311 3403', contact: 'Ms. N. Dlamini', email: 'mhlume@rda.co.sz' },
    'Mpolonjeni': { phone: '+268 2383 3404', contact: 'Mr. T. Mavuso', email: 'mpolonjeni@rda.co.sz' },
    'Nkilongo': { phone: '+268 2383 3405', contact: 'Mrs. P. Magagula', email: 'nkilongo@rda.co.sz' },
    'Siphofaneni': { phone: '+268 2383 3406', contact: 'Mr. S. Mdluli', email: 'siphofaneni@rda.co.sz' },
    'Sithobela': { phone: '+268 2383 3407', contact: 'Ms. L. Mkhabela', email: 'sithobela@rda.co.sz' },
    'Tshaneni': { phone: '+268 2313 3408', contact: 'Mr. M. Zwane', email: 'tshaneni@rda.co.sz' },
    'Nsoko': { phone: '+268 2383 3409', contact: 'Mrs. T. Nkosi', email: 'nsoko@rda.co.sz' },
    'Lugongolweni': { phone: '+268 2383 3410', contact: 'Mr. B. Shabangu', email: 'lugongolweni.lb@rda.co.sz' },

    // Shiselweni Region (16)
    'Gege': { phone: '+268 2207 4501', contact: 'Ms. S. Dlamini', email: 'gege@rda.co.sz' },
    'Hosea': { phone: '+268 2207 4502', contact: 'Mr. N. Matsebula', email: 'hosea@rda.co.sz' },
    'Kubuta': { phone: '+268 2207 4503', contact: 'Mrs. P. Mngomezulu', email: 'kubuta@rda.co.sz' },
    'Lavumisa': { phone: '+268 2207 4504', contact: 'Mr. T. Vilakati', email: 'lavumisa@rda.co.sz' },
    'Luyengo': { phone: '+268 2527 4505', contact: 'Ms. L. Simelane', email: 'luyengo@rda.co.sz' },
    'Matsanjeni North': { phone: '+268 2207 4506', contact: 'Mr. M. Dlamini', email: 'matsanjeni.north@rda.co.sz' },
    'Matsanjeni South': { phone: '+268 2207 4507', contact: 'Mrs. S. Khumalo', email: 'matsanjeni.south@rda.co.sz' },
    'Mbadlane': { phone: '+268 2207 4508', contact: 'Mr. B. Mamba', email: 'mbadlane@rda.co.sz' },
    'Mkhondvo': { phone: '+268 2207 4509', contact: 'Ms. N. Shongwe', email: 'mkhondvo@rda.co.sz' },
    'Ngudzeni': { phone: '+268 2207 4510', contact: 'Mr. T. Masuku', email: 'ngudzeni.sh@rda.co.sz' },
    'Nkwene': { phone: '+268 2207 4511', contact: 'Mrs. P. Mdluli', email: 'nkwene.sh@rda.co.sz' },
    'Sandleni': { phone: '+268 2207 4512', contact: 'Mr. S. Fakudze', email: 'sandleni@rda.co.sz' },
    'Shiselweni I': { phone: '+268 2207 4513', contact: 'Ms. L. Dlamini', email: 'shiselweni1@rda.co.sz' },
    'Shiselweni II': { phone: '+268 2207 4514', contact: 'Mr. M. Nxumalo', email: 'shiselweni2@rda.co.sz' },
    'Sigwe': { phone: '+268 2207 4515', contact: 'Mrs. T. Magagula', email: 'sigwe@rda.co.sz' },
    'Somntongo': { phone: '+268 2207 4516', contact: 'Mr. P. Dlamini', email: 'somntongo@rda.co.sz' }
  };

  // Core services available at ALL centers
  const coreServices: Service[] = [
    { 
      icon: <FaTractor className="text-2xl" />, 
      name: 'Tractor Services', 
      description: 'Land ploughing, cultivation, and harrowing services',
      details: ['Disc ploughing', 'Moldboard ploughing', 'Harrowing', 'Land leveling']
    },
    { 
      icon: <FaSeedling className="text-2xl" />, 
      name: 'Seed Distribution', 
      description: 'Quality certified seeds for various crops',
      details: ['Maize seeds', 'Bean seeds', 'Vegetable seeds', 'Seasonal varieties']
    },
    { 
      icon: <FaTools className="text-2xl" />, 
      name: 'Equipment Rental', 
      description: 'Agricultural tools and machinery rental',
      details: ['Hand tools', 'Planters', 'Sprayers', 'Harvesting equipment']
    },
    { 
      icon: <FaGraduationCap className="text-2xl" />, 
      name: 'Training Programs', 
      description: 'Farmer education and capacity building',
      details: ['Modern farming techniques', 'Crop management', 'Pest control', 'Post-harvest handling']
    },
    { 
      icon: <FaHandHoldingUsd className="text-2xl" />, 
      name: 'Financial Advisory', 
      description: 'Assistance with loans and grants',
      details: ['Loan application support', 'Grant information', 'Financial planning', 'Subsidy programs']
    },
    { 
      icon: <FaLeaf className="text-2xl" />, 
      name: 'Extension Services', 
      description: 'Agricultural advisory and technical support',
      details: ['Crop advisory', 'Soil testing', 'Pest management', 'Weather information']
    }
  ];

  // Specialized services for specific centers
  const specializedServices: SpecializedServices = {
    'Mbabane East': [
      { icon: <FaWarehouse className="text-xl" />, name: 'Cold Storage', description: 'Temperature-controlled produce storage' },
      { icon: <FaGraduationCap className="text-xl" />, name: 'Demo Farm', description: 'Practical agricultural training center' }
    ],
    'Mbabane West': [
      { icon: <FaWarehouse className="text-xl" />, name: 'Market Hub', description: 'Direct farmer-to-market linkages' }
    ],
    'Manzini North': [
      { icon: <FaTools className="text-xl" />, name: 'Irrigation Support', description: 'Modern irrigation systems and guidance' },
      { icon: <FaWarehouse className="text-xl" />, name: 'Agro-Processing', description: 'Value addition facilities' }
    ],
    'Manzini South': [
      { icon: <FaWarehouse className="text-xl" />, name: 'Storage Facility', description: 'Large-scale grain storage' }
    ],
    'Lobamba': [
      { icon: <FaGraduationCap className="text-xl" />, name: 'Research Hub', description: 'Agricultural research and innovation' },
      { icon: <FaLeaf className="text-xl" />, name: 'Organic Certification', description: 'Organic farming support and certification' }
    ],
    'Siphofaneni': [
      { icon: <FaSeedling className="text-xl" />, name: 'Sugar Cane Support', description: 'Specialized sugar cane farming services' },
      { icon: <FaWarehouse className="text-xl" />, name: 'Bulk Storage', description: 'Commercial storage facilities' }
    ],
    'Mhlume': [
      { icon: <FaSeedling className="text-xl" />, name: 'Sugar Expertise', description: 'Sugar production technical support' },
      { icon: <FaTools className="text-xl" />, name: 'Heavy Machinery', description: 'Large-scale farming equipment' }
    ],
    'Lavumisa': [
      { icon: <FaSeedling className="text-xl" />, name: 'Cotton Support', description: 'Cotton farming specialized services' },
      { icon: <FaWarehouse className="text-xl" />, name: 'Export Support', description: 'Cross-border trade assistance' }
    ],
    'Piggs Peak': [
      { icon: <FaSeedling className="text-xl" />, name: 'Forestry Support', description: 'Timber and forestry services' }
    ],
    'Tshaneni': [
      { icon: <FaSeedling className="text-xl" />, name: 'Sugarcane Services', description: 'Sugarcane production support' }
    ]
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [inkhundlaResponse, tractorResponse] = await Promise.all([
        axios.get(`${API_URL}/inkhundla`, { headers }),
        axios.get(`${API_URL}/tractors?status=available`, { headers })
      ]);

      setInkhundlaData(inkhundlaResponse.data);

      // Count tractors per Inkhundla
      const counts: TractorCounts = {};
      if (tractorResponse.data && tractorResponse.data.tractors) {
        tractorResponse.data.tractors.forEach((tractor: Tractor) => {
          counts[tractor.inkhundla_id] = (counts[tractor.inkhundla_id] || 0) + 1;
        });
      }
      setTractorCounts(counts);
      
    } catch (error) {
      console.error('Failed to load service centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const regions = ['all', ...Object.keys(inkhundlaData.groupedByRegion || {})];

  // Filter Tinkhundla
  const filteredInkhundla = inkhundlaData.inkhundla.filter(ink => {
    const matchesRegion = selectedRegion === 'all' || ink.region === selectedRegion;
    const matchesSearch = ink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ink.region.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Group by region
  const groupedFiltered = filteredInkhundla.reduce((acc: Record<string, Inkhundla[]>, ink) => {
    if (!acc[ink.region]) {
      acc[ink.region] = [];
    }
    acc[ink.region].push(ink);
    return acc;
  }, {});

  const toggleCenterDetails = (centerId: string) => {
    setExpandedCenter(expandedCenter === centerId ? null : centerId);
  };

  const getCenterDetails = (centerName: string): CenterDetails => {
    return tinkhundlaDetails[centerName] || { 
      phone: '+268 2404 2731', 
      contact: 'Center Manager', 
      email: 'info@rda.co.sz' 
    };
  };

  const getSpecializedServices = (centerName: string): Service[] => {
    return specializedServices[centerName] || [];
  };

  const getAllServices = (centerName: string): Service[] => {
    return [...coreServices, ...getSpecializedServices(centerName)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading service centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            RDA Service Centers
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Find your nearest agricultural service center among our 55 Tinkhundla across the Kingdom of Eswatini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Service Centers</p>
                <p className="text-4xl font-bold">{inkhundlaData.inkhundla?.length || 0}</p>
              </div>
              <FaMapMarkerAlt className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Regions</p>
                <p className="text-4xl font-bold">4</p>
              </div>
              <FaMapMarkerAlt className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Tractors</p>
                <p className="text-4xl font-bold">
                  {Object.values(tractorCounts).reduce((a: number, b: number) => a + b, 0)}
                </p>
              </div>
              <FaTractor className="text-5xl text-yellow-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Core Services</p>
                <p className="text-4xl font-bold">6+</p>
              </div>
              <FaTools className="text-5xl text-purple-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Core Services at Every Center</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {coreServices.map((service, index) => (
              <div key={index} className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  {service.icon}
                </div>
                <p className="text-sm font-semibold">{service.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Inkhundla or Region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : `${region} Region`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-bold text-green-600">{filteredInkhundla.length}</span> of{' '}
            <span className="font-bold">{inkhundlaData.inkhundla?.length || 0}</span> centers
          </p>
        </div>

        {/* Centers by Region */}
        {Object.keys(groupedFiltered).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('all');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedFiltered).map(([region, tinkhundla]) => (
            <div key={region} className="mb-8">
              {/* Region Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                    <FaMapMarkerAlt className="mr-3" />
                    {region} Region
                  </h2>
                  <span className="bg-white text-green-700 px-4 py-2 rounded-full text-sm md:text-base font-bold">
                    {tinkhundla.length} {tinkhundla.length === 1 ? 'Center' : 'Centers'}
                  </span>
                </div>
              </div>

              {/* Centers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-b-xl shadow-lg p-6">
                {tinkhundla.map((ink: Inkhundla) => {
                  const details = getCenterDetails(ink.name);
                  const allServices = getAllServices(ink.name);
                  const isExpanded = expandedCenter === ink.id;

                  return (
                    <div
                      key={ink.id}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b-2 border-green-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {ink.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-green-600" />
                              {ink.region}
                            </p>
                          </div>
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ACTIVE
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-600 mb-1">Tractors</p>
                            <p className="text-2xl font-bold text-green-600">
                              {tractorCounts[ink.id] || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-600 mb-1">Services</p>
                            <p className="text-2xl font-bold text-green-600">
                              {allServices.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-700">
                            <FaUser className="mr-3 text-green-600 flex-shrink-0" />
                            <span className="font-medium">{details.contact}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <FaPhone className="mr-3 text-green-600 flex-shrink-0" />
                            <a href={`tel:${details.phone}`} className="hover:text-green-600 font-medium">
                              {details.phone}
                            </a>
                          </div>
                        </div>

                        {/* Services Preview */}
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Available Services:</h4>
                          <div className="flex flex-wrap gap-2">
                            {allServices.slice(0, 3).map((service: Service, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                <span className="mr-1">{service.icon}</span>
                                {service.name.split(' ')[0]}
                              </span>
                            ))}
                            {allServices.length > 3 && (
                              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                                +{allServices.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => toggleCenterDetails(ink.id)}
                          className="w-full mb-4 py-3 px-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold flex items-center justify-center"
                        >
                          {isExpanded ? (
                            <>
                              <FaChevronUp className="mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <FaInfoCircle className="mr-2" />
                              View All Services & Details
                            </>
                          )}
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t-2 border-gray-200 pt-4 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Complete Services:</h4>
                            <div className="space-y-3 mb-4">
                              {allServices.map((service: Service, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-start">
                                    <div className="text-green-600 mr-3 mt-1">{service.icon}</div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-gray-900">{service.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                                      {service.details && (
                                        <ul className="mt-2 space-y-1">
                                          {service.details.map((detail: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-500 flex items-center">
                                              <span className="w-1 h-1 bg-green-600 rounded-full mr-2"></span>
                                              {detail}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Operating Hours */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center">
                                <FaClock className="mr-2" />
                                Operating Hours
                              </h5>
                              <div className="text-xs text-blue-800 space-y-1">
                                <p className="font-medium">Mon - Fri: 7:30 AM - 4:30 PM</p>
                                <p className="font-medium">Saturday: 8:00 AM - 12:00 PM</p>
                                <p className="font-medium">Sunday: Closed</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Book Button */}
                        <Link
                          href={`/tractors?inkhundla_id=${ink.id}&name=${encodeURIComponent(ink.name)}`}
                          className="block w-full py-4 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-base text-center shadow-lg hover:shadow-xl"
                        >
                          <FaTractor className="inline mr-2 text-xl" />
                          Book Tractor at {ink.name}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Farming?</h2>
          <p className="text-green-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Choose your nearest service center and book a tractor today. Professional support available at all locations.
          </p>
          <Link
            href="/tractors"
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            <FaTractor className="mr-3 text-2xl" />
            Browse All Available Tractors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CentersPage;