'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaMapMarkerAlt,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaTractor,
  FaSeedling,
  FaLeaf,
  FaWater,
  FaHandHoldingHeart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowLeft,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegBuilding,
  FaRegHeart,
  FaRegFileAlt,
  FaRegChartBar,
  FaRegLightbulb,
  FaRegMoneyBillAlt,
  FaRegCreditCard
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
  status: 'active' | 'inactive' | 'maintenance';
  established: string;
  service_count?: number;
  staff_count?: number;
}

interface Service {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  description: string;
  cost: string;
  duration: string;
  availability: string;
  is_active: boolean;
}

interface CenterService {
  id: number;
  center_id: number;
  service_id: number;
  service_name: string;
  category_name: string;
  availability: 'available' | 'limited' | 'unavailable';
  price: string;
  provider_name: string;
  provider_contact: string;
  schedule_info: string;
  notes: string;
  is_active: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  color: string;
}

// ==================== CENTER FORM MODAL ====================

interface CenterFormModalProps {
  center: TinkhundlaCenter | null;
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
    status: center?.status || 'active',
    established: center?.established || new Date().getFullYear().toString()
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCenter: TinkhundlaCenter = {
        id: center?.id || Math.floor(Math.random() * 1000) + 100,
        ...formData,
        chiefdoms: Number(formData.chiefdoms),
        service_count: center?.service_count || 0,
        staff_count: center?.staff_count || 0
      };

      onSave(newCenter);
      toast.success(center ? 'Center updated successfully' : 'Center created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save center');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {center ? 'Edit Center' : 'Add New Center'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Center Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Hhohho">Hhohho</option>
                  <option value="Manzini">Manzini</option>
                  <option value="Shiselweni">Shiselweni</option>
                  <option value="Lubombo">Lubombo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chiefdoms</label>
                <input
                  type="number"
                  name="chiefdoms"
                  value={formData.chiefdoms}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
              >
                {loading ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : <><FaSave className="mr-2" /> {center ? 'Update' : 'Create'}</>}
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
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<CenterService | null>(null);
  const [formData, setFormData] = useState({
    selectedServiceId: 0,  // Changed from service_id to avoid conflict
    availability: 'available',
    price: '',
    provider_name: '',
    provider_contact: '',
    schedule_info: '',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchAvailableServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/centers/${center.id}/services`);
      if (response.data.success) {
        setServices(response.data.centerServices || []);
      }
    } catch (error) {
      console.error('Error fetching center services:', error);
      // Sample data for demo
      setServices([
        {
          id: 1,
          center_id: center.id,
          service_id: 1,
          service_name: 'Tractor Hiring',
          category_name: 'Tractor Services',
          availability: 'available',
          price: 'E400/hour',
          provider_name: 'John Dlamini',
          provider_contact: '+268 7612 3001',
          schedule_info: 'Mon-Sat 8AM-5PM',
          notes: 'Minimum 2 hours booking',
          is_active: true
        },
        {
          id: 2,
          center_id: center.id,
          service_id: 5,
          service_name: 'Seed Distribution',
          category_name: 'Seed Services',
          availability: 'available',
          price: 'From E50/kg',
          provider_name: 'Mary Nkosi',
          provider_contact: '+268 7612 3002',
          schedule_info: 'Mon-Fri 8AM-4PM',
          notes: 'Bring ID and farm registration',
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/services`);
      if (response.data.success) {
        setAvailableServices(response.data.services || []);
      }
    } catch (error) {
      console.error('Error fetching available services:', error);
      // Sample data for demo
      setAvailableServices([
        { id: 1, name: 'Tractor Hiring', category_id: 1, category_name: 'Tractor Services', description: 'Tractor hiring service', cost: 'E400/hour', duration: '2-8 hours', availability: 'all', is_active: true },
        { id: 2, name: 'Ploughing Service', category_id: 1, category_name: 'Tractor Services', description: 'Professional ploughing', cost: 'E400/hour', duration: '2-8 hours', availability: 'seasonal', is_active: true },
        { id: 5, name: 'Seed Distribution', category_id: 2, category_name: 'Seed Services', description: 'Quality seeds', cost: 'From E50/kg', duration: 'Immediate', availability: 'seasonal', is_active: true }
      ]);
    }
  };

  const handleAddService = async () => {
    if (!formData.selectedServiceId) {
      toast.error('Please select a service');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const selectedService = availableServices.find(s => s.id === formData.selectedServiceId);
      
      // Create payload with service_id for the API
      const payload = {
        service_id: formData.selectedServiceId,
        availability: formData.availability,
        price: formData.price,
        provider_name: formData.provider_name,
        provider_contact: formData.provider_contact,
        schedule_info: formData.schedule_info,
        notes: formData.notes
      };

      if (editingService) {
        // Update existing service
        await axios.put(`${API_URL}/api/centers/${center.id}/services/${editingService.service_id}`, payload);
        toast.success('Service updated successfully');
      } else {
        // Add new service
        await axios.post(`${API_URL}/api/centers/${center.id}/services`, payload);
        toast.success('Service added successfully');
      }
      
      fetchServices();
      setShowAddForm(false);
      setEditingService(null);
      setFormData({
        selectedServiceId: 0,
        availability: 'available',
        price: '',
        provider_name: '',
        provider_contact: '',
        schedule_info: '',
        notes: ''
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleEditService = (service: CenterService) => {
    setEditingService(service);
    setFormData({
      selectedServiceId: service.service_id,
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/centers/${center.id}/services/${serviceId}`);
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => {
                setEditingService(null);
                setFormData({
                  selectedServiceId: 0,
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select
                    value={formData.selectedServiceId}
                    onChange={(e) => {
                      const serviceId = Number(e.target.value);
                      const service = availableServices.find(s => s.id === serviceId);
                      setFormData({
                        ...formData,
                        selectedServiceId: serviceId,
                        price: service?.cost || ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Contact</label>
                  <input
                    type="text"
                    value={formData.provider_contact}
                    onChange={(e) => setFormData({ ...formData, provider_contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <input
                    type="text"
                    value={formData.schedule_info}
                    onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Mon-Fri 8AM-5PM"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingService ? 'Update' : 'Add'}
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
                services.map(service => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                        <p className="text-sm text-gray-500">{service.category_name}</p>
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
                ))
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
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

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel }: DeleteConfirmModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div className="text-center">
        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center space-x-3">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-xl ${color}`} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminCentersServicesPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<TinkhundlaCenter[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<TinkhundlaCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState<TinkhundlaCenter | null>(null);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<TinkhundlaCenter | null>(null);
  const [stats, setStats] = useState({
    totalCenters: 0,
    activeCenters: 0,
    totalServices: 0,
    totalServiceAssignments: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [centers, searchTerm, regionFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch centers
      const centersRes = await axios.get(`${API_URL}/api/tinkhundla/enhanced`);
      const centersData = centersRes.data.success ? centersRes.data.centers : [];
      setCenters(centersData);
      
      // Fetch services
      const servicesRes = await axios.get(`${API_URL}/api/services`);
      const servicesData = servicesRes.data.success ? servicesRes.data.services : [];
      setServices(servicesData);
      
      // Calculate stats
      const activeCenters = centersData.filter((c: TinkhundlaCenter) => c.status === 'active').length;
      const totalServiceAssignments = centersData.reduce((sum: number, c: TinkhundlaCenter) => sum + (c.service_count || 0), 0);
      
      setStats({
        totalCenters: centersData.length,
        activeCenters,
        totalServices: servicesData.length,
        totalServiceAssignments
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Sample data for demo
      const sampleCenters: TinkhundlaCenter[] = [
        { id: 1, name: 'Mbabane East', region: 'Hhohho', location: 'Mbabane', chiefdoms: 4, contact_number: '+268 2404 5678', email: 'mbabane.east@rda.co.sz', status: 'active', established: '1978', service_count: 3, staff_count: 5 },
        { id: 2, name: 'Manzini North', region: 'Manzini', location: 'Manzini', chiefdoms: 6, contact_number: '+268 2505 5678', email: 'manzini.north@rda.co.sz', status: 'active', established: '1978', service_count: 4, staff_count: 6 },
        { id: 3, name: 'Nhlangano', region: 'Shiselweni', location: 'Nhlangano', chiefdoms: 8, contact_number: '+268 2207 1234', email: 'nhlangano@rda.co.sz', status: 'active', established: '1978', service_count: 2, staff_count: 4 }
      ];
      setCenters(sampleCenters);
      setStats({
        totalCenters: sampleCenters.length,
        activeCenters: 3,
        totalServices: 12,
        totalServiceAssignments: 9
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCenters = () => {
    let filtered = [...centers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term)
      );
    }
    
    if (regionFilter !== 'all') {
      filtered = filtered.filter(c => c.region === regionFilter);
    }
    
    setFilteredCenters(filtered);
  };

  const handleAddCenter = (newCenter: TinkhundlaCenter) => {
    setCenters([...centers, newCenter]);
    setStats({
      ...stats,
      totalCenters: stats.totalCenters + 1,
      activeCenters: newCenter.status === 'active' ? stats.activeCenters + 1 : stats.activeCenters
    });
  };

  const handleUpdateCenter = (updatedCenter: TinkhundlaCenter) => {
    setCenters(centers.map(c => c.id === updatedCenter.id ? updatedCenter : c));
  };

  const handleDeleteCenter = async () => {
    if (!centerToDelete) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/tinkhundla/${centerToDelete.id}`);
      
      setCenters(centers.filter(c => c.id !== centerToDelete.id));
      setStats({
        ...stats,
        totalCenters: stats.totalCenters - 1,
        activeCenters: centerToDelete.status === 'active' ? stats.activeCenters - 1 : stats.activeCenters
      });
      
      toast.success('Center deleted successfully');
    } catch (error) {
      console.error('Error deleting center:', error);
      toast.error('Failed to delete center');
    } finally {
      setShowDeleteModal(false);
      setCenterToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading centers and services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Centers & Services Management</h1>
              <p className="text-green-100 mt-2">Manage Tinkhundla centers and their services</p>
            </div>
            <Link href="/admin/dashboard" className="px-4 py-2 bg-white text-green-800 rounded-lg hover:bg-green-50 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Centers" value={stats.totalCenters} icon={FaBuilding} color="text-blue-600" bgColor="bg-blue-100" />
          <StatCard title="Active Centers" value={stats.activeCenters} icon={FaCheckCircle} color="text-green-600" bgColor="bg-green-100" />
          <StatCard title="Total Services" value={stats.totalServices} icon={FaSeedling} color="text-purple-600" bgColor="bg-purple-100" />
          <StatCard title="Service Assignments" value={stats.totalServiceAssignments} icon={FaCog} color="text-orange-600" bgColor="bg-orange-100" />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search centers by name, location, region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Regions</option>
                <option value="Hhohho">Hhohho</option>
                <option value="Manzini">Manzini</option>
                <option value="Shiselweni">Shiselweni</option>
                <option value="Lubombo">Lubombo</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedCenter(null);
                setShowCenterForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <FaPlus className="mr-2" />
              Add New Center
            </button>
          </div>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredCenters.length}</span> of <span className="font-bold">{centers.length}</span> centers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map(center => (
            <div key={center.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition border border-gray-100">
              <div className={`h-2 rounded-t-xl ${
                center.region === 'Hhohho' ? 'bg-blue-500' :
                center.region === 'Manzini' ? 'bg-green-500' :
                center.region === 'Shiselweni' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{center.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <FaMapMarkerAlt className="mr-1 text-green-600" />
                      {center.location}, {center.region}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(center.status)}`}>
                    {center.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="flex items-center text-gray-600">
                    <FaPhone className="mr-2 text-green-600" />
                    {center.contact_number}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2 text-green-600" />
                    {center.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaUsers className="mr-2 text-green-600" />
                    {center.chiefdoms} Chiefdoms
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaRegCalendarAlt className="mr-2 text-green-600" />
                    Est. {center.established}
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
                      setCenterToDelete(center);
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
      </div>

      {/* Modals */}
      {showCenterForm && (
        <CenterFormModal
          center={selectedCenter}
          onClose={() => {
            setShowCenterForm(false);
            setSelectedCenter(null);
          }}
          onSave={(center) => {
            if (selectedCenter) {
              handleUpdateCenter(center);
            } else {
              handleAddCenter(center);
            }
          }}
        />
      )}

      {showServicesModal && selectedCenter && (
        <CenterServicesModal
          center={selectedCenter}
          onClose={() => {
            setShowServicesModal(false);
            setSelectedCenter(null);
          }}
          onUpdate={fetchData}
        />
      )}

      {showDeleteModal && centerToDelete && (
        <DeleteConfirmModal
          title="Delete Center"
          message={`Are you sure you want to delete ${centerToDelete.name}? This action cannot be undone.`}
          onConfirm={handleDeleteCenter}
          onCancel={() => {
            setShowDeleteModal(false);
            setCenterToDelete(null);
          }}
        />
      )}
    </div>
  );
}