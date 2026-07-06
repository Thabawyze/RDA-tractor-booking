'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaTractor,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaUsers,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaRegBuilding,
  FaRegClock,
  FaRegCalendarAlt,
  FaStar,
  FaSeedling,
  FaLeaf,
  FaWater,
  FaHandHoldingHeart,
  FaRegHeart,
  FaRegFileAlt,
  FaRegChartBar,
  FaRegLightbulb,
  FaRegMoneyBillAlt,
  FaRegCreditCard,
  FaChevronLeft,
  FaChevronRight,
  FaUserPlus,
  FaCalendarCheck,
  FaPhoneAlt,
  FaEnvelopeOpenText,
  FaGlobe,
  FaTree,
  FaMountain,
  FaSun,
  FaCloudSun,
  FaEgg,
  FaFish,
  FaAppleAlt,
  FaCarrot,
  FaShoppingCart,
  FaTruck,
  FaWarehouse,
  FaToolbox,
  FaBolt,
  FaFire,
  FaRecycle,
  FaLeaf as FaLeafOrganic
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface TinkhundlaCenter {
  id: number;
  name: string;
  region: string;
  location: string;
  chiefdoms: number;
  contact_number: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  established: string;
  description?: string;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  service_count?: number;
  staff_count?: number;
  distance?: string;
}

interface CenterService {
  id: number;
  center_id: number;
  service_id: number;
  service_name: string;
  category_name: string;
  description: string;
  availability: 'available' | 'limited' | 'unavailable';
  price: string;
  provider_name: string;
  provider_contact: string;
  schedule_info: string;
  notes: string;
  rating?: number;
  is_active: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
}

interface ServiceOffering {
  id: number;
  name: string;
  description: string;
  icon: IconType;
  category: string;
  price: string;
  duration: string;
  availability: string;
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

// ==================== SERVICE CATEGORIES ====================

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'tractor', name: 'Tractor Services', description: 'Tractor hiring, ploughing, harrowing', icon: FaTractor, color: 'blue' },
  { id: 'seeds', name: 'Seed Services', description: 'Quality seeds and seedlings', icon: FaSeedling, color: 'green' },
  { id: 'fertilizer', name: 'Fertilizer Services', description: 'Organic and chemical fertilizers', icon: FaLeaf, color: 'yellow' },
  { id: 'irrigation', name: 'Irrigation Services', description: 'Irrigation systems and water management', icon: FaWater, color: 'cyan' },
  { id: 'training', name: 'Training Services', description: 'Farmer training and workshops', icon: FaUsers, color: 'purple' },
  { id: 'financial', name: 'Financial Services', description: 'Loans and insurance', icon: FaRegMoneyBillAlt, color: 'emerald' },
  { id: 'veterinary', name: 'Veterinary Services', description: 'Animal health and vaccinations', icon: FaRegHeart, color: 'red' },
  { id: 'equipment', name: 'Equipment Services', description: 'Equipment rental and repairs', icon: FaToolbox, color: 'orange' },
  { id: 'storage', name: 'Storage Services', description: 'Grain storage facilities', icon: FaWarehouse, color: 'indigo' },
  { id: 'marketing', name: 'Marketing Services', description: 'Market linkages and export support', icon: FaShoppingCart, color: 'pink' },
  { id: 'insurance', name: 'Insurance Services', description: 'Crop and livestock insurance', icon: FaRegCreditCard, color: 'teal' },
  { id: 'extension', name: 'Extension Services', description: 'Agricultural advice and support', icon: FaRegLightbulb, color: 'amber' }
];

// ==================== REGIONS ====================

const REGIONS: Region[] = [
  { 
    id: 'Hhohho', 
    name: 'Hhohho Region', 
    capital: 'Mbabane', 
    description: 'Northern region, home to the national capital', 
    color: 'from-blue-500 to-blue-700',
    icon: FaMountain,
    count: 0
  },
  { 
    id: 'Manzini', 
    name: 'Manzini Region', 
    capital: 'Manzini', 
    description: 'Central region, economic hub of Eswatini', 
    color: 'from-green-500 to-green-700',
    icon: FaTree,
    count: 0
  },
  { 
    id: 'Shiselweni', 
    name: 'Shiselweni Region', 
    capital: 'Nhlangano', 
    description: 'Southern region, known for agriculture and livestock', 
    color: 'from-yellow-500 to-yellow-700',
    icon: FaSun,
    count: 0
  },
  { 
    id: 'Lubombo', 
    name: 'Lubombo Region', 
    capital: 'Siteki', 
    description: 'Eastern region with sugar cane plantations', 
    color: 'from-red-500 to-red-700',
    icon: FaCloudSun,
    count: 0
  }
];

// ==================== CENTER DETAILS MODAL ====================

interface CenterDetailsModalProps {
  center: TinkhundlaCenter | null;
  services: CenterService[];
  onClose: () => void;
  onBookTractor: (centerId: number, centerName: string) => void;
  onRegisterService: (service: CenterService) => void;
}

const CenterDetailsModal = ({ center, services, onClose, onBookTractor, onRegisterService }: CenterDetailsModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  if (!center) return null;

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category_name?.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getRegionColor = (region: string) => {
    const colors = {
      'Hhohho': 'from-blue-500 to-blue-700',
      'Manzini': 'from-green-500 to-green-700',
      'Shiselweni': 'from-yellow-500 to-yellow-700',
      'Lubombo': 'from-red-500 to-red-700'
    };
    return colors[region as keyof typeof colors] || 'from-green-500 to-green-700';
  };

  const getAvailabilityBadge = (availability: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      limited: 'bg-yellow-100 text-yellow-800',
      unavailable: 'bg-red-100 text-red-800',
      seasonal: 'bg-purple-100 text-purple-800'
    };
    return colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{center.name}</h2>
              <p className="text-gray-600 mt-1">{center.location}, {center.region} Region</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Center Info Cards */}
          <div className={`bg-gradient-to-r ${getRegionColor(center.region)} rounded-xl p-6 mb-8 text-white`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-3xl mr-4 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Location</p>
                  <p className="font-semibold">{center.location}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-3xl mr-4 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Contact</p>
                  <p className="font-semibold">{center.contact_number}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaUsers className="text-3xl mr-4 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Chiefdoms</p>
                  <p className="font-semibold">{center.chiefdoms} Chiefdoms</p>
                </div>
              </div>
            </div>
            {center.description && (
              <p className="mt-4 text-sm opacity-90 border-t border-white/20 pt-4">{center.description}</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => onBookTractor(center.id, center.name)}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
            >
              <FaTractor className="mr-2" />
              Book Tractor
              <FaArrowRight className="ml-2" />
            </button>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h3>
            
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-4 mb-6 space-x-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Services
              </button>
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center ${
                    selectedCategory === cat.name
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="mr-2 text-sm" />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FaInfoCircle className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No services available in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map(service => {
                  const CategoryIcon = SERVICE_CATEGORIES.find(c => c.name === service.category_name)?.icon || FaSeedling;
                  
                  return (
                    <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-3 rounded-lg mr-3">
                            <CategoryIcon className="text-2xl text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                            <p className="text-sm text-gray-500">{service.category_name}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(service.availability)}`}>
                          {service.availability}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                      <div className="space-y-2 mb-4">
                        {service.price && (
                          <p className="text-sm"><span className="text-gray-500">Price:</span> <span className="font-medium text-black">{service.price}</span></p>
                        )}
                        {service.provider_name && (
                          <p className="text-sm"><span className="text-gray-500">Provider:</span> <span className="font-medium text-black"> {service.provider_name}</span></p>
                        )}
                        {service.schedule_info && (
                          <p className="text-sm"><span className="text-gray-500">Schedule:</span><span className="font-medium text-black"> {service.schedule_info}</span></p>
                        )}
                        {service.rating && (
                          <div className="flex items-center">
                            <span className="text-gray-500 text-sm mr-2">Rating:</span>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < Math.floor(service.rating!) ? 'text-yellow-400' : 'text-gray-300'} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">{service.rating}</span>
                          </div>
                        )}
                      </div>

                      {service.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">📝 {service.notes}</p>
                      )}

                      <button
                        onClick={() => onRegisterService(service)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center"
                      >
                        <FaUserPlus className="mr-2" />
                        Register for this Service
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SERVICE REGISTRATION MODAL ====================

interface ServiceRegistrationModalProps {
  service: CenterService;
  centerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceRegistrationModal = ({ service, centerName, onClose, onSuccess }: ServiceRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    farmLocation: '',
    farmSize: '',
    cropType: '',
    livestockType: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/api/service-registrations`, {
        service_id: service.service_id,
        center_id: service.center_id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        farm_location: formData.farmLocation,
        farm_size: formData.farmSize,
        crop_type: formData.cropType,
        livestock_type: formData.livestockType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        additional_notes: formData.additionalNotes
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      toast.success(`Successfully registered for ${service.service_name}!`);
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Register for Service</h2>
              <p className="text-gray-600">{service.service_name} - {centerName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            <div className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location *</label>
                    <input
                      type="text"
                      name="farmLocation"
                      value={formData.farmLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Farm Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (hectares)</label>
                    <input
                      type="text"
                      name="farmSize"
                      value={formData.farmSize}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Crop Type</label>
                    <input
                      type="text"
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleChange}
                      placeholder="e.g., Maize, Vegetables"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Livestock Type</label>
                    <input
                      type="text"
                      name="livestockType"
                      value={formData.livestockType}
                      onChange={handleChange}
                      placeholder="e.g., Cattle, Goats"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Schedule & Confirmation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Registration Summary</h4>
                  <div className="space-y-1 text-sm text-black">
                    <p><span className="text-gray-600">Service:</span> {service.service_name}</p>
                    <p><span className="text-gray-600">Center:</span> {centerName}</p>
                    <p><span className="text-gray-600">Farmer:</span> {formData.fullName || 'Not provided'}</p>
                    <p><span className="text-gray-600">Date:</span> {formData.preferredDate || 'Not selected'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleCheckboxChange}
                    className="mt-1 mr-3"
                    required
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the terms and conditions and confirm that the information provided is accurate.
                  </label>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function CentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<TinkhundlaCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<TinkhundlaCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<TinkhundlaCenter | null>(null);
  const [centerServices, setCenterServices] = useState<CenterService[]>([]);
  const [selectedService, setSelectedService] = useState<CenterService | null>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchCenters();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [centers, searchTerm, selectedRegion]);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch centers from database
      const centersRes = await axios.get(`${API_URL}/api/tinkhundla/enhanced`);
      
      if (centersRes.data.success && centersRes.data.centers) {
        setCenters(centersRes.data.centers);
        setFilteredCenters(centersRes.data.centers);
        
        // Update region counts
        const updatedRegions = REGIONS.map(region => ({
          ...region,
          count: centersRes.data.centers.filter((c: TinkhundlaCenter) => c.region === region.id).length
        }));
        // Update REGIONS array (you might want to move REGIONS to state if you need dynamic counts)
      } else {
        console.error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      toast.error('Failed to load centers. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenterServices = async (centerId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch services for this center from database
      const servicesRes = await axios.get(`${API_URL}/api/centers/${centerId}/services`);
      
      if (servicesRes.data.success && servicesRes.data.centerServices) {
        return servicesRes.data.centerServices;
      }
      return [];
    } catch (error) {
      console.error('Error fetching center services:', error);
      return [];
    }
  };

  const filterCenters = () => {
    let filtered = centers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }

    setFilteredCenters(filtered);
  };

  const handleViewCenter = async (center: TinkhundlaCenter) => {
    setSelectedCenter(center);
    setLoading(true);
    
    // Fetch real services from database
    const services = await fetchCenterServices(center.id);
    setCenterServices(services);
    
    setLoading(false);
    setShowCenterModal(true);
  };

  const handleBookTractor = (centerId: number, centerName: string) => {
    localStorage.setItem('selectedCenter', JSON.stringify({ id: centerId, name: centerName }));
    
    if (isLoggedIn) {
      router.push(`/booking?center=${centerId}`);
    } else {
      router.push(`/register?redirect=booking&center=${centerId}`);
    }
  };

  const handleRegisterService = (service: CenterService) => {
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', JSON.stringify({
        path: '/centers',
        serviceId: service.service_id,
        centerId: service.center_id
      }));
      router.push('/register');
      return;
    }
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const getRegionColor = (region: string) => {
    const colors = {
      'Hhohho': 'from-blue-500 to-blue-700',
      'Manzini': 'from-green-500 to-green-700',
      'Shiselweni': 'from-yellow-500 to-yellow-700',
      'Lubombo': 'from-red-500 to-red-700'
    };
    return colors[region as keyof typeof colors] || 'from-green-500 to-green-700';
  };

  const getRegionBadgeColor = (region: string) => {
    const colors = {
      'Hhohho': 'bg-blue-100 text-blue-800',
      'Manzini': 'bg-green-100 text-green-800',
      'Shiselweni': 'bg-yellow-100 text-yellow-800',
      'Lubombo': 'bg-red-100 text-red-800'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && centers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Tinkhundla centers...</p>
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
            <h1 className="text-4xl font-bold mb-4">Tinkhundla Service Centers</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Find your nearest center and access tractor services, agricultural support, and expert advice
            </p>
            <div className="mt-6 inline-flex items-center bg-green-700 px-6 py-3 rounded-full">
              <FaInfoCircle className="mr-2" />
              <span className="font-medium">{centers.length} Centers across 4 Regions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {REGIONS.map(region => (
            <div key={region.id} className="bg-white rounded-lg shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition"
                 onClick={() => setSelectedRegion(region.id)}>
              <div className={`text-${region.color.split('-')[1]}-600 font-bold text-2xl`}>
                {centers.filter(c => c.region === region.id).length}
              </div>
              <div className="text-sm text-gray-600">{region.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1 text-green-600" />
                Search Centers
              </label>
              <input
                type="text"
                placeholder="Search by center name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
            </div>
            <div className="w-full md:w-64">
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
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-gray-600">
          Showing <span className="font-bold">{filteredCenters.length}</span> of <span className="font-bold">{centers.length}</span> centers
        </p>
      </div>

      {/* Centers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredCenters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No centers found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('all');
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map(center => (
              <div
                key={center.id}
                onClick={() => handleViewCenter(center)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${getRegionColor(center.region)}`} />
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition">
                        {center.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaMapMarkerAlt className="mr-1 text-green-600" />
                        {center.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegionBadgeColor(center.region)}`}>
                      {center.region}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {center.description || `Agricultural service center serving the ${center.location} area.`}
                  </p>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaPhone className="mr-2 text-green-600 text-xs" />
                      {center.contact_number}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaUsers className="mr-2 text-green-600 text-xs" />
                      {center.chiefdoms} Chiefdoms
                    </p>
                    {center.service_count !== undefined && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaSeedling className="mr-2 text-green-600 text-xs" />
                        {center.service_count} Services Available
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCenter(center);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center group-hover:scale-105 transform transition-transform"
                    >
                      View Services
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Center Details Modal */}
      {showCenterModal && selectedCenter && (
        <CenterDetailsModal
          center={selectedCenter}
          services={centerServices}
          onClose={() => {
            setShowCenterModal(false);
            setSelectedCenter(null);
            setCenterServices([]);
          }}
          onBookTractor={handleBookTractor}
          onRegisterService={handleRegisterService}
        />
      )}

      {/* Service Registration Modal */}
      {showServiceModal && selectedService && selectedCenter && (
        <ServiceRegistrationModal
          service={selectedService}
          centerName={selectedCenter.name}
          onClose={() => {
            setShowServiceModal(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowServiceModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} RDA Tractor Booking System. All 59 Tinkhundla Centers of Eswatini.
          </p>
        </div>
      </footer>
    </div>
  );
}