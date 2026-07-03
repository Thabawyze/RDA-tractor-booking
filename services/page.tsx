'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaTractor, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaArrowRight,
  FaUsers,
  FaLeaf,
  FaWater,
  FaSeedling,
  FaHandHoldingHeart,
  FaUserPlus,
  FaSignInAlt,
  FaCalendarCheck,
  FaStar,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaRegBuilding,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegCreditCard,
  FaRegHeart,
  FaRegSun,
  FaRegMoon,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaRegFileAlt,
  FaRegClipboard,
  FaRegChartBar,
  FaRegLightbulb,
  FaRegMoneyBillAlt,
  FaRegQuestionCircle,
  FaRegSmile,
  FaRegThumbsUp,
  FaRegUser,
  FaRegWindowMaximize
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// Types
interface ServiceOffering {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  icon: IconType;
  category: 'tractor' | 'seeds' | 'fertilizer' | 'irrigation' | 'training' | 'financial' | 'veterinary' | 'equipment' | 'storage' | 'marketing' | 'insurance' | 'extension';
  eligibility: string[];
  requirements: string[];
  benefits: string[];
  process: string[];
  cost: string;
  duration: string;
  availability: 'all' | 'seasonal' | 'limited';
  season?: string;
  documents: string[];
  contactInfo: string;
  providers: CenterProvider[];
  faqs: FAQ[];
}

interface CenterProvider {
  id: number;
  centerId: number;
  centerName: string;
  region: string;
  location: string;
  contactNumber: string;
  email: string;
  availability: string;
  distance?: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
  count: number;
}

interface RegistrationForm {
  serviceId: number;
  serviceName: string;
  centerId: number;
  centerName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  farmSize?: string;
  cropType?: string;
  livestockType?: string;
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
  agreeTerms: boolean;
}

interface ApiService {
  id: number;
  name: string;
  description: string;
  long_description: string;
  category_id: number;
  category_name: string;
  eligibility: string[];
  requirements: string[];
  benefits: string[];
  process_steps: string[];
  cost: string;
  duration: string;
  availability: string;
  season_info: string | null;
  documents: string[];
  contact_info?: string;
  is_active: boolean;
  icon_name?: string;
}

interface ApiCenter {
  id: number;
  name: string;
  region: string;
  location: string;
  contact_number: string;
  email: string;
}

interface ApiCenterService {
  center_id: number;
  service_id: number;
  availability: string;
  price: string;
  provider_name: string;
  provider_contact: string;
  schedule_info: string;
  center_name?: string;
  region?: string;
  location?: string;
  contact_number?: string;
  email?: string;
}

// Service Categories (keep this for UI)
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { 
    id: 'tractor', 
    name: 'Tractor Services', 
    description: 'Tractor hiring, ploughing, harrowing, and planting services', 
    icon: FaTractor, 
    color: 'from-blue-500 to-blue-700',
    count: 0
  },
  { 
    id: 'seeds', 
    name: 'Seed Services', 
    description: 'High-quality seeds, distribution, and planting advice', 
    icon: FaSeedling, 
    color: 'from-green-500 to-green-700',
    count: 0
  },
  { 
    id: 'fertilizer', 
    name: 'Fertilizer Services', 
    description: 'Organic and chemical fertilizers, soil testing, and application', 
    icon: FaLeaf, 
    color: 'from-yellow-500 to-yellow-700',
    count: 0
  },
  { 
    id: 'irrigation', 
    name: 'Irrigation Services', 
    description: 'Irrigation systems, water management, and support', 
    icon: FaWater, 
    color: 'from-cyan-500 to-cyan-700',
    count: 0
  },
  { 
    id: 'training', 
    name: 'Training Services', 
    description: 'Farmer training, workshops, and extension services', 
    icon: FaUsers, 
    color: 'from-purple-500 to-purple-700',
    count: 0
  },
  { 
    id: 'financial', 
    name: 'Financial Services', 
    description: 'Loans, insurance, and financial planning for farmers', 
    icon: FaRegMoneyBillAlt, 
    color: 'from-emerald-500 to-emerald-700',
    count: 0
  },
  { 
    id: 'veterinary', 
    name: 'Veterinary Services', 
    description: 'Animal health, vaccinations, and livestock support', 
    icon: FaRegHeart, 
    color: 'from-red-500 to-red-700',
    count: 0
  },
  { 
    id: 'equipment', 
    name: 'Equipment Services', 
    description: 'Equipment rental, repairs, and maintenance', 
    icon: FaRegBuilding, 
    color: 'from-orange-500 to-orange-700',
    count: 0
  },
  { 
    id: 'storage', 
    name: 'Storage Services', 
    description: 'Storage facilities, grain silos, and cold storage', 
    icon: FaRegFileAlt, 
    color: 'from-indigo-500 to-indigo-700',
    count: 0
  },
  { 
    id: 'marketing', 
    name: 'Marketing Services', 
    description: 'Market linkages, export support, and price information', 
    icon: FaRegChartBar, 
    color: 'from-pink-500 to-pink-700',
    count: 0
  },
  { 
    id: 'insurance', 
    name: 'Insurance Services', 
    description: 'Crop insurance, livestock insurance, and risk management', 
    icon: FaRegCreditCard, 
    color: 'from-teal-500 to-teal-700',
    count: 0
  },
  { 
    id: 'extension', 
    name: 'Extension Services', 
    description: 'Agricultural advice, field visits, and technical support', 
    icon: FaRegLightbulb, 
    color: 'from-amber-500 to-amber-700',
    count: 0
  }
];

// Map category names to category IDs
const categoryNameToId: Record<string, string> = {
  'Tractor Services': 'tractor',
  'Seed Services': 'seeds',
  'Fertilizer Services': 'fertilizer',
  'Irrigation Services': 'irrigation',
  'Training Services': 'training',
  'Financial Services': 'financial',
  'Veterinary Services': 'veterinary',
  'Equipment Services': 'equipment',
  'Storage Services': 'storage',
  'Marketing Services': 'marketing',
  'Insurance Services': 'insurance',
  'Extension Services': 'extension'
};

// Map icon names to IconType
const iconMap: Record<string, IconType> = {
  FaTractor: FaTractor,
  FaSeedling: FaSeedling,
  FaLeaf: FaLeaf,
  FaWater: FaWater,
  FaUsers: FaUsers,
  FaRegMoneyBillAlt: FaRegMoneyBillAlt,
  FaRegHeart: FaRegHeart,
  FaRegBuilding: FaRegBuilding,
  FaRegFileAlt: FaRegFileAlt,
  FaRegChartBar: FaRegChartBar,
  FaRegCreditCard: FaRegCreditCard,
  FaRegLightbulb: FaRegLightbulb
};

// Service Registration Modal
const ServiceRegistrationModal = ({ 
  service, 
  onClose, 
  onSuccess 
}: { 
  service: ServiceOffering; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [formData, setFormData] = useState<RegistrationForm>({
    serviceId: service.id,
    serviceName: service.name,
    centerId: 0,
    centerName: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    farmSize: '',
    cropType: '',
    livestockType: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCenterSelect = (centerId: number) => {
    const provider = service.providers.find(p => p.centerId === centerId);
    if (provider) {
      setSelectedCenter(centerId);
      setFormData(prev => ({
        ...prev,
        centerId: centerId,
        centerName: provider.centerName
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      
      // Send registration to API
      await axios.post(`${API_URL}/api/service-registrations`, {
        service_id: service.id,
        center_id: formData.centerId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        farm_location: formData.address,
        farm_size: formData.farmSize,
        crop_type: formData.cropType,
        livestock_type: formData.livestockType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        additional_notes: formData.additionalNotes
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      toast.success(`Successfully registered for ${service.name}!`);
      setSubmitted(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering for {service.name}. A confirmation has been sent to your email.
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              <strong>Next Steps:</strong> You will receive a confirmation SMS within 24 hours with further instructions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Register for Service</h2>
              <p className="text-gray-600">{service.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
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
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Select Service Center</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.providers.map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => handleCenterSelect(provider.centerId)}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        selectedCenter === provider.centerId
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{provider.centerName}</h4>
                        <div className="flex items-center text-yellow-400">
                          <FaStar className="text-sm" />
                          <span className="text-xs text-gray-600 ml-1">{provider.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-1 text-green-600" />
                        {provider.location}, {provider.region}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FaPhone className="mr-1 text-green-600" />
                        {provider.contactNumber}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaClock className="mr-1 text-green-600" />
                        {provider.availability}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!selectedCenter}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Size (hectares)
                    </label>
                    <input
                      type="text"
                      name="farmSize"
                      value={formData.farmSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Crop / Livestock
                    </label>
                    <input
                      type="text"
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      placeholder="e.g., Maize, Cattle"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Schedule & Confirmation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any special requirements or information..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Registration Summary</h4>
                  <div className="space-y-2 text-sm text-black">
                    <p><span className="text-gray-600">Service:</span> {service.name}</p>
                    <p><span className="text-gray-600">Center:</span> {formData.centerName}</p>
                    <p><span className="text-gray-600">Date:</span> {formData.preferredDate || 'Not selected'}</p>
                    <p><span className="text-gray-600">Time:</span> {formData.preferredTime || 'Not selected'}</p>
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
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center"
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

// Service Details Modal
const ServiceDetailsModal = ({ 
  service, 
  onClose,
  onRegister 
}: { 
  service: ServiceOffering; 
  onClose: () => void;
  onRegister: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'process' | 'providers' | 'faqs'>('overview');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <service.icon className="text-3xl text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                <div className="flex items-center mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.availability === 'all' ? 'bg-green-100 text-green-800' :
                    service.availability === 'seasonal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {service.availability === 'all' ? 'Available Year-Round' :
                     service.availability === 'seasonal' ? `Seasonal (${service.season})` :
                     'Limited Availability'}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">{service.category}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {(['overview', 'benefits', 'process', 'providers', 'faqs'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mb-6 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{service.longDescription}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {service.eligibility.map((item, idx) => (
                      <li key={idx} className="text-gray-600 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Required Documents</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {service.documents.map((doc, idx) => (
                      <li key={idx} className="text-gray-600 text-sm">{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="font-semibold text-gray-900">{service.cost}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{service.duration}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">Key Benefits</h3>
                <ul className="space-y-3">
                  {service.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'process' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
                <ol className="space-y-3">
                  {service.process.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-green-600 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">Available Centers</h3>
                <div className="grid grid-cols-1 gap-3">
                  {service.providers.map(provider => (
                    <div key={provider.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{provider.centerName}</h4>
                        <div className="flex items-center text-yellow-400">
                          <FaStar className="text-sm" />
                          <span className="text-xs text-gray-600 ml-1">{provider.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        {provider.location}, {provider.region}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FaPhone className="mr-2 text-green-600" />
                        {provider.contactNumber}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaClock className="mr-2 text-green-600" />
                        {provider.availability}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-3">
                      <p className="font-medium text-gray-900 mb-1">{faq.question}</p>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              <strong>Contact for more information:</strong> {service.contactInfo}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onRegister}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" />
              Register for this Service
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const router = useRouter();
  const [allServices, setAllServices] = useState<ServiceOffering[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceOffering | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedServices, setSavedServices] = useState<number[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchServices();
  }, []);

  useEffect(() => {
    if (allServices.length > 0) {
      filterServices();
    }
  }, [selectedCategory, searchTerm, allServices]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch services
      const servicesResponse = await axios.get(`${API_URL}/api/services`);
      
      if (servicesResponse.data.success && servicesResponse.data.services) {
        const apiServices = servicesResponse.data.services;
        
        // Fetch centers for providers
        const centersResponse = await axios.get(`${API_URL}/api/tinkhundla`);
        const centers = centersResponse.data.success ? centersResponse.data.centers : [];
        
        // Fetch center services for each service
        const transformedServices = await Promise.all(apiServices.map(async (apiService: ApiService) => {
          // Fetch providers for this service
          let providers: CenterProvider[] = [];
          try {
            // This endpoint would need to be implemented on the backend
            // For now, we'll generate providers from available centers
            const centerServicesResponse = await axios.get(`${API_URL}/api/centers/services?service_id=${apiService.id}`);
            if (centerServicesResponse.data.success && centerServicesResponse.data.centerServices) {
              providers = centerServicesResponse.data.centerServices.map((cs: ApiCenterService, index: number) => ({
                id: index + 1,
                centerId: cs.center_id,
                centerName: cs.center_name || `Center ${cs.center_id}`,
                region: cs.region || 'Unknown',
                location: cs.location || 'Unknown',
                contactNumber: cs.contact_number || '+268 0000 0000',
                email: cs.email || 'info@rda.co.sz',
                availability: cs.schedule_info || 'Mon-Fri 8AM-5PM',
                rating: 4.5
              }));
            }
          } catch (error) {
            // If no providers found, generate some from centers
            providers = centers.slice(0, 3).map((center: any, index: number) => ({
              id: index + 1,
              centerId: center.id,
              centerName: center.name,
              region: center.region,
              location: center.location || center.name,
              contactNumber: center.contact_number || '+268 0000 0000',
              email: center.email || 'info@rda.co.sz',
              availability: 'Mon-Fri 8AM-5PM',
              rating: 4.5
            }));
          }

          // Get category ID and name
          const categoryId = categoryNameToId[apiService.category_name || ''] || 'tractor';
          const categoryIcon = serviceCategories.find(c => c.id === categoryId)?.icon || FaTractor;

          // Generate FAQs if not provided
          const faqs: FAQ[] = [
            { question: `What is the cost of ${apiService.name}?`, answer: apiService.cost || 'Contact center for pricing' },
            { question: 'How do I register?', answer: 'Visit your nearest Tinkhundla center or register online' },
            { question: 'Is there any eligibility criteria?', answer: apiService.eligibility?.join(', ') || 'Open to all registered farmers' }
          ];

          return {
            id: apiService.id,
            name: apiService.name,
            description: apiService.description || apiService.name,
            longDescription: apiService.long_description || apiService.description || apiService.name,
            icon: categoryIcon,
            category: categoryId as any,
            eligibility: apiService.eligibility || ['Registered farmers'],
            requirements: apiService.requirements || ['Valid ID', 'Farm registration'],
            benefits: apiService.benefits || ['Access to modern equipment', 'Professional service', 'Affordable rates'],
            process: apiService.process_steps || ['Visit center', 'Register', 'Schedule', 'Get service'],
            cost: apiService.cost || 'Contact center for pricing',
            duration: apiService.duration || 'Varies by service',
            availability: (apiService.availability as any) || 'all',
            season: apiService.season_info || undefined,
            documents: apiService.documents || ['ID', 'Farm registration'],
            contactInfo: apiService.contact_info || 'Contact your local Tinkhundla center',
            providers: providers,
            faqs: faqs
          };
        }));

        setAllServices(transformedServices);
        
        // Update category counts
        const updatedCategories = serviceCategories.map(category => {
          const count = transformedServices.filter((s: ServiceOffering) => s.category === category.id).length;
          return { ...category, count };
        });
        setServiceCategories(updatedCategories);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = allServices;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term)
      );
    }

    setFilteredServices(filtered);
  };

  const handleViewDetails = (service: ServiceOffering) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleRegister = () => {
    setShowDetailsModal(false);
    setShowRegistrationModal(true);
  };

  const handleSaveService = (serviceId: number) => {
    if (savedServices.includes(serviceId)) {
      setSavedServices(savedServices.filter(id => id !== serviceId));
      toast.success('Removed from saved services');
    } else {
      setSavedServices([...savedServices, serviceId]);
      toast.success('Service saved for later');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = serviceCategories.find(c => c.id === categoryId);
    return category?.color.split(' ')[0].replace('from-', '') || 'green';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <FaInfoCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Services</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchServices}
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
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Agricultural Services</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive agricultural services available at your nearest Tinkhundla center
            </p>
            <div className="mt-6 inline-flex items-center bg-green-700 px-6 py-3 rounded-full">
              <FaInfoCircle className="mr-2" />
              <span className="font-medium">{allServices.length} Services Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {serviceCategories.slice(0, 6).map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-lg p-4 text-center">
              <category.icon className={`text-2xl mx-auto mb-2 text-${category.color.split('-')[1]}-600`} />
              <div className="text-sm font-medium text-gray-900">{category.count}</div>
              <div className="text-xs text-gray-500">{category.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Services
            </button>
            {serviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center">
                  <category.icon className="mr-2" />
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1 text-green-600" />
                Search Services
              </label>
              <input
                type="text"
                placeholder="Search by service name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
            </div>
          </div>
          
          {(selectedCategory !== 'all' || searchTerm) && (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4">
        <p className="text-gray-600">
          Showing <span className="font-bold">{filteredServices.length}</span> of <span className="font-bold">{allServices.length}</span> services
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaRegQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No services found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const categoryColor = getCategoryColor(service.category);
              const isSaved = savedServices.includes(service.id);
              
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className={`h-2 bg-${categoryColor}-600`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <service.icon className="text-xl text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                      </div>
                      <button
                        onClick={() => handleSaveService(service.id)}
                        className="text-gray-400 hover:text-yellow-500 transition"
                      >
                        {isSaved ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark />}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <FaMapMarkerAlt className="mr-1 text-green-600" />
                        {service.providers.length} centers available
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaRegClock className="mr-1 text-green-600" />
                        {service.availability === 'all' ? 'Available year-round' : 
                         service.availability === 'seasonal' ? service.season : 'Limited availability'}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(service)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowRegistrationModal(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center"
                      >
                        <FaUserPlus className="mr-2" />
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedService(null);
          }}
          onRegister={handleRegister}
        />
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedService && (
        <ServiceRegistrationModal
          service={selectedService}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowRegistrationModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}