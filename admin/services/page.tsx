'use client';

import { useState, useEffect } from 'react';
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
  FaRegWindowMaximize,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaBan,
  FaEye,
  FaEyeSlash,
  FaToggleOn,
  FaToggleOff,
  FaCog,
  FaList,
  FaTh,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaHome,
  FaTachometerAlt,
  FaSignOutAlt
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// Types
interface TinkhundlaCenter {
  id: number;
  name: string;
  region: string;
  location: string;
  chiefdoms: number;
  contact_number: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive' | 'maintenance';
  established: string;
  services?: CenterService[];
  staff?: Staff[];
  service_count?: number;
  staff_count?: number;
  created_at: string;
  updated_at: string;
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
  is_active: boolean;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  contact_number: string;
  email: string;
  center_id: number;
  is_active: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  icon: IconType;
  color: string;
  description: string;
}

interface ServiceOffering {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  description: string;
  long_description: string;
  eligibility: string[];
  requirements: string[];
  benefits: string[];
  process_steps: string[];
  cost: string;
  duration: string;
  availability: 'all' | 'seasonal' | 'limited';
  season_info?: string;
  documents: string[];
  is_active: boolean;
  icon_name?: string;
  contact_info?: string;
  created_at: string;
  icon:string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  centers?: TinkhundlaCenter[];
  services?: ServiceOffering[];
  centerServices?: CenterService[];
  center?: TinkhundlaCenter;
  service?: ServiceOffering;
  categories?: ServiceCategory[];
}

// Service Categories with icons
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 1, name: 'Tractor Services', icon: FaTractor, color: 'blue', description: 'Tractor hiring, ploughing, harrowing, and planting services' },
  { id: 2, name: 'Seed Services', icon: FaSeedling, color: 'green', description: 'High-quality seeds, distribution, and planting advice' },
  { id: 3, name: 'Fertilizer Services', icon: FaLeaf, color: 'yellow', description: 'Organic and chemical fertilizers, soil testing, and application' },
  { id: 4, name: 'Irrigation Services', icon: FaWater, color: 'cyan', description: 'Irrigation systems, water management, and support' },
  { id: 5, name: 'Training Services', icon: FaUsers, color: 'purple', description: 'Farmer training, workshops, and extension services' },
  { id: 6, name: 'Financial Services', icon: FaRegMoneyBillAlt, color: 'emerald', description: 'Loans, insurance, and financial planning for farmers' },
  { id: 7, name: 'Veterinary Services', icon: FaRegHeart, color: 'red', description: 'Animal health, vaccinations, and livestock support' },
  { id: 8, name: 'Equipment Services', icon: FaRegBuilding, color: 'orange', description: 'Equipment rental, repairs, and maintenance' },
  { id: 9, name: 'Storage Services', icon: FaRegFileAlt, color: 'indigo', description: 'Storage facilities, grain silos, and cold storage' },
  { id: 10, name: 'Marketing Services', icon: FaRegChartBar, color: 'pink', description: 'Market linkages, export support, and price information' },
  { id: 11, name: 'Insurance Services', icon: FaRegCreditCard, color: 'teal', description: 'Crop insurance, livestock insurance, and risk management' },
  { id: 12, name: 'Extension Services', icon: FaRegLightbulb, color: 'amber', description: 'Agricultural advice, field visits, and technical support' }
];

// Map category IDs to icon components
const getCategoryIcon = (categoryId: number): IconType => {
  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
  return category?.icon || FaSeedling;
};

// Map category IDs to color
const getCategoryColor = (categoryId: number): string => {
  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
  return category?.color || 'green';
};

// ==================== CENTER FORM MODAL ====================

interface CenterFormModalProps {
  center?: TinkhundlaCenter;
  onClose: () => void;
  onSave: (center: TinkhundlaCenter) => void;
}

const CenterFormModal = ({ center, onClose, onSave }: CenterFormModalProps) => {
  const [formData, setFormData] = useState({
    name: center?.name || '',
    region: center?.region || 'Hhohho',
    location: center?.location || '',
    chiefdoms: center?.chiefdoms || 1,
    contact_number: center?.contact_number || '',
    email: center?.email || '',
    address: center?.address || '',
    status: center?.status || 'active',
    established: center?.established || new Date().getFullYear().toString()
  });
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.region || !formData.location || !formData.contact_number) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (center) {
        // Update existing center
        const response = await axios.put(`${API_URL}/api/tinkhundla/${center.id}`, formData, { headers });
        if (response.data.success) {
          const updatedCenter = { ...center, ...formData, chiefdoms: Number(formData.chiefdoms) };
          onSave(updatedCenter);
          toast.success('Center updated successfully');
        }
      } else {
        // Create new center
        const response = await axios.post(`${API_URL}/api/tinkhundla`, formData, { headers });
        if (response.data.success) {
          onSave(response.data.center);
          toast.success('Center created successfully');
        }
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving center:', error);
      toast.error(error.response?.data?.error || 'Failed to save center');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {center ? 'Edit Center' : 'Create New Center'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                >
                  <option value="Hhohho">Hhohho Region</option>
                  <option value="Manzini">Manzini Region</option>
                  <option value="Shiselweni">Shiselweni Region</option>
                  <option value="Lubombo">Lubombo Region</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location/Town *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Chiefdoms</label>
                <input
                  type="number"
                  name="chiefdoms"
                  value={formData.chiefdoms}
                  onChange={handleNumberChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center">
                {loading ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : <><FaSave className="mr-2" /> {center ? 'Update Center' : 'Create Center'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== SERVICE FORM MODAL ====================

interface ServiceFormModalProps {
  service?: ServiceOffering;
  onClose: () => void;
  onSave: (service: ServiceOffering) => void;
}

const ServiceFormModal = ({ service, onClose, onSave }: ServiceFormModalProps) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    category_id: service?.category_id || 1,
    description: service?.description || '',
    long_description: service?.long_description || '',
    eligibility: service?.eligibility || [],
    requirements: service?.requirements || [],
    benefits: service?.benefits || [],
    process_steps: service?.process_steps || [],
    cost: service?.cost || '',
    duration: service?.duration || '',
    availability: service?.availability || 'all',
    season_info: service?.season_info || '',
    documents: service?.documents || [],
    is_active: service?.is_active ?? true,
    icon_name: '',
    contact_info: service?.contact_info || ''
  });
  const [loading, setLoading] = useState(false);
  const [eligibilityInput, setEligibilityInput] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [benefitsInput, setBenefitsInput] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [documentsInput, setDocumentsInput] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEligibility = () => {
    if (eligibilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        eligibility: [...(prev.eligibility || []), eligibilityInput.trim()]
      }));
      setEligibilityInput('');
    }
  };

  const handleRemoveEligibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      eligibility: prev.eligibility?.filter((_, i) => i !== index)
    }));
  };

  const handleAddRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirementsInput.trim()]
      }));
      setRequirementsInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index)
    }));
  };

  const handleAddBenefit = () => {
    if (benefitsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefitsInput.trim()]
      }));
      setBenefitsInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index)
    }));
  };

  const handleAddProcess = () => {
    if (processInput.trim()) {
      setFormData(prev => ({
        ...prev,
        process_steps: [...(prev.process_steps || []), processInput.trim()]
      }));
      setProcessInput('');
    }
  };

  const handleRemoveProcess = (index: number) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps?.filter((_, i) => i !== index)
    }));
  };

  const handleAddDocument = () => {
    if (documentsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), documentsInput.trim()]
      }));
      setDocumentsInput('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.cost) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (service) {
        // Update existing service
        const response = await axios.put(`${API_URL}/api/services/${service.id}`, formData, { headers });
        if (response.data.success) {
          const category = SERVICE_CATEGORIES.find(c => c.id === formData.category_id);
          const updatedService = { 
            ...response.data.service, 
            category_name: category?.name || '',
            icon: getCategoryIcon(formData.category_id)
          };
          onSave(updatedService);
          toast.success('Service updated successfully');
        }
      } else {
        // Create new service
        const response = await axios.post(`${API_URL}/api/services`, formData, { headers });
        if (response.data.success) {
          const category = SERVICE_CATEGORIES.find(c => c.id === formData.category_id);
          const newService = { 
            ...response.data.service, 
            category_name: category?.name || '',
            icon: getCategoryIcon(formData.category_id)
          };
          onSave(newService);
          toast.success('Service created successfully');
        }
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {service ? 'Edit Service' : 'Create New Service'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                >
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">Year-Round</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="limited">Limited</option>
                </select>
              </div>

              {formData.availability === 'seasonal' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season Details</label>
                  <input
                    type="text"
                    name="season_info"
                    value={formData.season_info}
                    onChange={handleChange}
                    placeholder="e.g., August - December"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                <textarea
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost/Price *</label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="e.g., E400 per hour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 2-8 hours"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  placeholder="e.g., Contact your local center"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      checked={formData.is_active === true}
                      onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      checked={formData.is_active === false}
                      onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={eligibilityInput}
                  onChange={(e) => setEligibilityInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Add eligibility criteria"
                />
                <button type="button" onClick={handleAddEligibility} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.eligibility?.map((item, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {item}
                    <button type="button" onClick={() => handleRemoveEligibility(index)} className="ml-2 text-green-600 hover:text-green-800">
                      <FaTimes size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Add required document"
                />
                <button type="button" onClick={handleAddRequirement} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((item, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {item}
                    <button type="button" onClick={() => handleRemoveRequirement(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                      <FaTimes size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={benefitsInput}
                  onChange={(e) => setBenefitsInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Add benefit"
                />
                <button type="button" onClick={handleAddBenefit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((item, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {item}
                    <button type="button" onClick={() => handleRemoveBenefit(index)} className="ml-2 text-purple-600 hover:text-purple-800">
                      <FaTimes size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Process Steps */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Process Steps</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={processInput}
                  onChange={(e) => setProcessInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Add process step"
                />
                <button type="button" onClick={handleAddProcess} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.process_steps?.map((item, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {item}
                    <button type="button" onClick={() => handleRemoveProcess(index)} className="ml-2 text-orange-600 hover:text-orange-800">
                      <FaTimes size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={documentsInput}
                  onChange={(e) => setDocumentsInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  placeholder="Add document"
                />
                <button type="button" onClick={handleAddDocument} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.documents?.map((item, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {item}
                    <button type="button" onClick={() => handleRemoveDocument(index)} className="ml-2 text-gray-600 hover:text-gray-800">
                      <FaTimes size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center">
                {loading ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : <><FaSave className="mr-2" /> {service ? 'Update Service' : 'Create Service'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== CENTER SERVICES MODAL ====================

interface CenterServicesModalProps {
  center: TinkhundlaCenter;
  onClose: () => void;
  onUpdate: () => void;
}

const CenterServicesModal = ({ center, onClose, onUpdate }: CenterServicesModalProps) => {
  const [services, setServices] = useState<CenterService[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<CenterService | null>(null);
  const [formData, setFormData] = useState({
    service_id: 0,
    availability: 'available',
    price: '',
    provider_name: '',
    provider_contact: '',
    schedule_info: '',
    notes: ''
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchServices();
    fetchAvailableServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/centers/${center.id}/services`);
      if (response.data.success) {
        setServices(response.data.centerServices || []);
      }
    } catch (error) {
      console.error('Error fetching center services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services?is_active=true`);
      if (response.data.success) {
        setAvailableServices(response.data.services || []);
      }
    } catch (error) {
      console.error('Error fetching available services:', error);
    }
  };

  const handleAddService = async () => {
    if (!formData.service_id) {
      toast.error('Please select a service');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const selectedService = availableServices.find(s => s.id === formData.service_id);

      const payload = {
        service_id: formData.service_id,
        availability: formData.availability,
        price: formData.price || selectedService?.cost,
        provider_name: formData.provider_name,
        provider_contact: formData.provider_contact,
        schedule_info: formData.schedule_info,
        notes: formData.notes
      };

      if (editingService) {
        // Update existing service
        await axios.put(`${API_URL}/api/centers/${center.id}/services/${editingService.service_id}`, payload, { headers });
        toast.success('Service updated successfully');
      } else {
        // Add new service
        await axios.post(`${API_URL}/api/centers/${center.id}/services`, payload, { headers });
        toast.success('Service added successfully');
      }

      fetchServices();
      setShowAddForm(false);
      setEditingService(null);
      setFormData({
        service_id: 0,
        availability: 'available',
        price: '',
        provider_name: '',
        provider_contact: '',
        schedule_info: '',
        notes: ''
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEditService = (service: CenterService) => {
    setEditingService(service);
    setFormData({
      service_id: service.service_id,
      availability: service.availability,
      price: service.price || '',
      provider_name: service.provider_name || '',
      provider_contact: service.provider_contact || '',
      schedule_info: service.schedule_info || '',
      notes: service.notes || ''
    });
    setShowAddForm(true);
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to remove this service?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/api/centers/${center.id}/services/${serviceId}`, { headers });
      toast.success('Service removed successfully');
      fetchServices();
      onUpdate();
    } catch (error) {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service');
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      limited: 'bg-yellow-100 text-yellow-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    return colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Center Services</h2>
              <p className="text-gray-600">{center.name} - {center.location}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => {
                setEditingService(null);
                setFormData({
                  service_id: 0,
                  availability: 'available',
                  price: '',
                  provider_name: '',
                  provider_contact: '',
                  schedule_info: '',
                  notes: ''
                });
                setShowAddForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => {
                      const serviceId = Number(e.target.value);
                      const service = availableServices.find(s => s.id === serviceId);
                      setFormData({
                        ...formData,
                        service_id: serviceId,
                        price: service?.cost || ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    disabled={!!editingService}
                  >
                    <option value="0">Select a service</option>
                    {availableServices.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Contact</label>
                  <input
                    type="text"
                    value={formData.provider_contact}
                    onChange={(e) => setFormData({ ...formData, provider_contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <input
                    type="text"
                    value={formData.schedule_info}
                    onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
                    placeholder="e.g., Mon-Fri 8AM-5PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button onClick={handleAddService} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto" />
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No services added yet</p>
              ) : (
                services.map(service => {
                  const CategoryIcon = getCategoryIcon(
                    SERVICE_CATEGORIES.find(c => c.name === service.category_name)?.id || 1
                  );
                  return (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <CategoryIcon className="text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                            <p className="text-sm text-gray-600">{service.category_name}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(service.availability)}`}>
                            {service.availability}
                          </span>
                          <button onClick={() => handleEditService(service)} className="text-blue-600 hover:text-blue-800">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleRemoveService(service.service_id)} className="text-red-600 hover:text-red-800">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {service.price && <div><span className="text-gray-500">Price:</span> {service.price}</div>}
                        {service.provider_name && <div><span className="text-gray-500">Provider:</span> {service.provider_name}</div>}
                        {service.provider_contact && <div><span className="text-gray-500">Contact:</span> {service.provider_contact}</div>}
                        {service.schedule_info && <div><span className="text-gray-500">Schedule:</span> {service.schedule_info}</div>}
                      </div>
                      {service.notes && <p className="text-sm text-gray-500 mt-2">📝 {service.notes}</p>}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
              Cancel
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center space-x-3">
            <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'centers' | 'services'>('centers');
  const [centers, setCenters] = useState<TinkhundlaCenter[]>([]);
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<TinkhundlaCenter[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceOffering[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<TinkhundlaCenter | undefined>();
  const [selectedService, setSelectedService] = useState<ServiceOffering | undefined>();
  const [itemToDelete, setItemToDelete] = useState<{ type: 'center' | 'service', id: number, name: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await fetchData();
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch centers
      const centersRes = await axios.get(`${API_URL}/api/tinkhundla/enhanced`, { headers });
      if (centersRes.data.success) {
        setCenters(centersRes.data.centers);
        setFilteredCenters(centersRes.data.centers);
      }

      // Fetch services
      const servicesRes = await axios.get(`${API_URL}/api/services`, { headers });
      if (servicesRes.data.success) {
        const servicesWithIcons = servicesRes.data.services.map((s: ServiceOffering) => ({
          ...s,
          icon: getCategoryIcon(s.category_id)
        }));
        setServices(servicesWithIcons);
        setFilteredServices(servicesWithIcons);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  // Filter centers
  useEffect(() => {
    let filtered = [...centers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(term) ||
        center.location.toLowerCase().includes(term) ||
        center.region.toLowerCase().includes(term) ||
        center.contact_number.includes(term)
      );
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(center => center.region.toLowerCase() === regionFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(center => center.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof TinkhundlaCenter];
      let bVal = b[sortField as keyof TinkhundlaCenter];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    setFilteredCenters(filtered);
  }, [centers, searchTerm, regionFilter, statusFilter, sortField, sortDirection]);

  // Filter services
  useEffect(() => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category_name?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category_id === parseInt(categoryFilter));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? service.is_active : !service.is_active
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateCenter = (newCenter: TinkhundlaCenter) => {
    setCenters([...centers, newCenter]);
  };

  const handleUpdateCenter = (updatedCenter: TinkhundlaCenter) => {
    setCenters(centers.map(c => c.id === updatedCenter.id ? updatedCenter : c));
  };

  const handleCreateService = (newService: ServiceOffering) => {
    setServices([...services, newService]);
  };

  const handleUpdateService = (updatedService: ServiceOffering) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (itemToDelete.type === 'center') {
        await axios.delete(`${API_URL}/api/tinkhundla/${itemToDelete.id}`, { headers });
        setCenters(centers.filter(c => c.id !== itemToDelete.id));
        toast.success(`Center "${itemToDelete.name}" deleted successfully`);
      } else {
        await axios.delete(`${API_URL}/api/services/${itemToDelete.id}`, { headers });
        setServices(services.filter(s => s.id !== itemToDelete.id));
        toast.success(`Service "${itemToDelete.name}" deleted successfully`);
      }
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateCenterServices = () => {
    fetchData(); // Refresh data
    toast.success('Services updated successfully');
    setShowServicesModal(false);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return config[status as keyof typeof config] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Service Center Management</h1>
              <p className="text-green-100 mt-2">Manage Tinkhundla centers and agricultural services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-white text-green-800 rounded-lg hover:bg-green-50 transition font-medium flex items-center"
              >
                <FaTachometerAlt className="mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium flex items-center"
              >
                <FaHome className="mr-2" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('centers')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'centers'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaRegBuilding className="inline mr-2" />
              Service Centers ({centers.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'services'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaList className="inline mr-2" />
              Services ({services.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'centers' ? 'centers' : 'services'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              {activeTab === 'centers' && (
                <>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    <option value="all">All Regions</option>
                    <option value="hhohho">Hhohho</option>
                    <option value="manzini">Manzini</option>
                    <option value="shiselweni">Shiselweni</option>
                    <option value="lubombo">Lubombo</option>
                  </select>
                </>
              )}

              {activeTab === 'services' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Categories</option>
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {activeTab === 'centers' && <option value="maintenance">Maintenance</option>}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaList />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaTh />
                </button>
              </div>

              <button
                onClick={() => {
                  if (activeTab === 'centers') {
                    setSelectedCenter(undefined);
                    setShowCenterForm(true);
                  } else {
                    setSelectedService(undefined);
                    setShowServiceForm(true);
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <FaPlus className="mr-2" />
                Add {activeTab === 'centers' ? 'Center' : 'Service'}
              </button>
            </div>
          </div>

          {(searchTerm || regionFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRegionFilter('all');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{activeTab === 'centers' ? filteredCenters.length : filteredServices.length}</span> of{' '}
            <span className="font-bold">{activeTab === 'centers' ? centers.length : services.length}</span>{' '}
            {activeTab === 'centers' ? 'centers' : 'services'}
          </p>
        </div>

        {/* Centers Table/Grid */}
        {activeTab === 'centers' && (
          <>
            {filteredCenters.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaRegBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No centers found</p>
                <button
                  onClick={() => setShowCenterForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Add Your First Center
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                          <div className="flex items-center">
                            Center Name
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('region')}>
                          <div className="flex items-center">
                            Region
                            {sortField === 'region' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Services
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCenters.map((center) => (
                        <tr key={center.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{center.name}</div>
                            <div className="text-sm text-gray-500">Est. {center.established}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {center.region}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {center.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{center.contact_number}</div>
                            <div className="text-sm text-gray-500">{center.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {center.service_count || 0} Services
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(center.status)}`}>
                              {center.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCenter(center);
                                  setShowServicesModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Manage Services"
                              >
                                <FaCog />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCenter(center);
                                  setShowCenterForm(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => {
                                  setItemToDelete({ type: 'center', id: center.id, name: center.name });
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCenters.map((center) => (
                  <div key={center.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{center.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <FaMapMarkerAlt className="mr-1 text-green-600" />
                            {center.location}, {center.region}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(center.status)}`}>
                          {center.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaPhone className="mr-2 text-green-600" />
                          {center.contact_number}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaEnvelope className="mr-2 text-green-600" />
                          {center.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaUsers className="mr-2 text-green-600" />
                          {center.chiefdoms} Chiefdoms
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">Services:</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {center.service_count || 0} Available
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCenter(center);
                            setShowServicesModal(true);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center"
                        >
                          <FaCog className="mr-2" />
                          Services
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCenter(center);
                            setShowCenterForm(true);
                          }}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete({ type: 'center', id: center.id, name: center.name });
                            setShowDeleteModal(true);
                          }}
                          className="px-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Services Table/Grid */}
        {activeTab === 'services' && (
          <>
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaList className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No services found</p>
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Add Your First Service
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Availability
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredServices.map((service) => {
                        const ServiceIcon = service.icon || getCategoryIcon(service.category_id);
                        return (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                  <ServiceIcon className="text-green-600" />
                                </div>
                                <div className="font-medium text-gray-900">{service.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 bg-${getCategoryColor(service.category_id)}-100 text-${getCategoryColor(service.category_id)}-800 rounded-full text-xs`}>
                                {service.category_name || SERVICE_CATEGORIES.find(c => c.id === service.category_id)?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {service.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.cost}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                service.availability === 'all' ? 'bg-green-100 text-green-800' :
                                service.availability === 'seasonal' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {service.availability}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {service.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedService(service);
                                    setShowServiceForm(true);
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => {
                                    setItemToDelete({ type: 'service', id: service.id, name: service.name });
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const ServiceIcon = service.icon || getCategoryIcon(service.category_id);
                  return (
                    <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-green-100 p-3 rounded-lg mr-3">
                            <ServiceIcon className="text-2xl text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                            <span className="text-xs text-gray-500">{service.category_name || SERVICE_CATEGORIES.find(c => c.id === service.category_id)?.name}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cost:</span>
                            <span className="font-medium text-gray-900">{service.cost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Duration:</span>
                            <span className="text-gray-900">{service.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Availability:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              service.availability === 'all' ? 'bg-green-100 text-green-800' :
                              service.availability === 'seasonal' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {service.availability}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedService(service);
                              setShowServiceForm(true);
                            }}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete({ type: 'service', id: service.id, name: service.name });
                              setShowDeleteModal(true);
                            }}
                            className="px-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCenterForm && (
        <CenterFormModal
          center={selectedCenter}
          onClose={() => {
            setShowCenterForm(false);
            setSelectedCenter(undefined);
          }}
          onSave={(center) => {
            if (selectedCenter) {
              handleUpdateCenter(center);
            } else {
              handleCreateCenter(center);
            }
          }}
        />
      )}

      {showServiceForm && (
        <ServiceFormModal
          service={selectedService}
          onClose={() => {
            setShowServiceForm(false);
            setSelectedService(undefined);
          }}
          onSave={(service) => {
            if (selectedService) {
              handleUpdateService(service);
            } else {
              handleCreateService(service);
            }
          }}
        />
      )}

      {showServicesModal && selectedCenter && (
        <CenterServicesModal
          center={selectedCenter}
          onClose={() => {
            setShowServicesModal(false);
            setSelectedCenter(undefined);
          }}
          onUpdate={handleUpdateCenterServices}
        />
      )}

      {showDeleteModal && itemToDelete && (
        <DeleteConfirmModal
          title={`Delete ${itemToDelete.type === 'center' ? 'Center' : 'Service'}`}
          message={`Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setItemToDelete(null);
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
}