'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaTractor, 
  FaSearch, 
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSave,
  FaClock,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaTools,
  FaSeedling,
  FaWarehouse,
  FaGraduationCap,
  FaHandHoldingUsd,
  FaLeaf,
  FaHome
} from 'react-icons/fa';

// ============ Type Definitions ============
interface ServiceCenter {
  id: number;
  name: string;
  location: string;
  contact_number: string | null;
  email: string | null;
  contact_person: string | null;
  services: {
    [key: string]: boolean; // Strictly boolean, no undefined
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
}

interface User {
  role: 'farmer' | 'admin';
  full_name?: string;
  email?: string;
  id?: number;
}

interface CenterFormData {
  name: string;
  location: string;
  contact_number: string;
  email: string;
  contact_person: string;
  status: 'active' | 'inactive';
  operating_hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  services: {
    [key: string]: boolean; // Strictly boolean, no undefined
  };
}

// ============ Main Component ============
export default function AdminCentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCenter, setExpandedCenter] = useState<number | null>(null);

  // Form State - All services initialized with boolean values
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    location: '',
    contact_number: '',
    email: '',
    contact_person: '',
    status: 'active',
    operating_hours: {
      weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
      saturday: 'Saturday: 8:00 AM - 12:00 PM',
      sunday: 'Sunday: Closed'
    },
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
    }
  });

  // Service options
  const serviceOptions = [
    { key: 'tractor_rental', label: 'Tractor Rental', icon: <FaTractor /> },
    { key: 'plowing', label: 'Plowing Services', icon: <FaTractor /> },
    { key: 'harvesting', label: 'Harvesting Support', icon: <FaTractor /> },
    { key: 'spraying', label: 'Spraying Services', icon: <FaTractor /> },
    { key: 'transportation', label: 'Transportation', icon: <FaTractor /> },
    { key: 'maintenance', label: 'Equipment Maintenance', icon: <FaTools /> },
    { key: 'seed_distribution', label: 'Seed Distribution', icon: <FaSeedling /> },
    { key: 'equipment_rental', label: 'Equipment Rental', icon: <FaTools /> },
    { key: 'training', label: 'Farmer Training', icon: <FaGraduationCap /> },
    { key: 'financial_advice', label: 'Financial Advice', icon: <FaHandHoldingUsd /> },
    { key: 'extension_services', label: 'Extension Services', icon: <FaLeaf /> }
  ];

  // Regions in Eswatini
  const regions = ['Hhohho', 'Manzini', 'Lubombo', 'Shiselweni'];

  // ============ Authentication ============
  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchCenters();
        await fetchTractors();
      }
      setLoading(false);
    };
    init();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/auth/login');
        return false;
      }

      const parsedUser = JSON.parse(userData) as User;
      
      if (parsedUser.role !== 'admin') {
        router.push('/');
        toast.error('Admin access required');
        return false;
      }

      setUser(parsedUser);
      return true;
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/auth/login');
      return false;
    }
  };

  // ============ Data Fetching ============
  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/admin/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCenters(response.data);
    } catch (error: any) {
      console.error('Error fetching centers:', error);
      
      // Try fallback endpoint
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/centers`);
        setCenters(response.data);
      } catch (fallbackError) {
        // If both fail, create sample data for admin
        createSampleCenters();
        toast.info('Using sample center data. Connect to backend for live data.');
      }
    }
  };

  const fetchTractors = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${apiUrl}/api/admin/tractors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTractors(response.data);
    } catch (error) {
      console.error('Error fetching tractors:', error);
    }
  };

  const createSampleCenters = () => {
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
        operating_hours: JSON.stringify({
          weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
          saturday: 'Saturday: 8:00 AM - 12:00 PM',
          sunday: 'Sunday: Closed'
        }),
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
        operating_hours: JSON.stringify({
          weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
          saturday: 'Saturday: 8:00 AM - 12:00 PM',
          sunday: 'Sunday: Closed'
        }),
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
        operating_hours: JSON.stringify({
          weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
          saturday: 'Saturday: 8:00 AM - 12:00 PM',
          sunday: 'Sunday: Closed'
        }),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setCenters(sampleCenters);
  };

  // ============ CRUD Operations ============
  const handleAddCenter = () => {
    setModalMode('add');
    setFormData({
      name: '',
      location: '',
      contact_number: '',
      email: '',
      contact_person: '',
      status: 'active',
      operating_hours: {
        weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
        saturday: 'Saturday: 8:00 AM - 12:00 PM',
        sunday: 'Sunday: Closed'
      },
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
      }
    });
    setIsModalOpen(true);
  };

  const handleEditCenter = (center: ServiceCenter) => {
    setModalMode('edit');
    setSelectedCenter(center);
    
    // Parse operating hours
    let operatingHours = {
      weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
      saturday: 'Saturday: 8:00 AM - 12:00 PM',
      sunday: 'Sunday: Closed'
    };
    
    if (center.operating_hours) {
      try {
        operatingHours = JSON.parse(center.operating_hours);
      } catch {
        // Keep default
      }
    }
    
    setFormData({
      name: center.name,
      location: center.location,
      contact_number: center.contact_number || '',
      email: center.email || '',
      contact_person: center.contact_person || '',
      status: center.status,
      operating_hours: operatingHours,
      services: center.services || formData.services
    });
    
    setIsModalOpen(true);
  };

  const handleViewCenter = (center: ServiceCenter) => {
    setModalMode('view');
    setSelectedCenter(center);
    
    // Parse operating hours
    let operatingHours = {
      weekdays: 'Monday - Friday: 7:30 AM - 4:30 PM',
      saturday: 'Saturday: 8:00 AM - 12:00 PM',
      sunday: 'Sunday: Closed'
    };
    
    if (center.operating_hours) {
      try {
        operatingHours = JSON.parse(center.operating_hours);
      } catch {
        // Keep default
      }
    }
    
    setFormData({
      name: center.name,
      location: center.location,
      contact_number: center.contact_number || '',
      email: center.email || '',
      contact_person: center.contact_person || '',
      status: center.status,
      operating_hours: operatingHours,
      services: center.services || formData.services
    });
    
    setIsModalOpen(true);
  };

  const handleDeleteCenter = (center: ServiceCenter) => {
    setModalMode('delete');
    setSelectedCenter(center);
    setIsModalOpen(true);
  };

  const confirmDeleteCenter = async () => {
    if (!selectedCenter) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      await axios.delete(`${apiUrl}/api/admin/centers/${selectedCenter.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCenters(centers.filter(c => c.id !== selectedCenter.id));
      toast.success('Service center deleted successfully');
      setIsModalOpen(false);
      setSelectedCenter(null);
    } catch (error) {
      console.error('Error deleting center:', error);
      
      // For sample data, just remove it
      setCenters(centers.filter(c => c.id !== selectedCenter.id));
      toast.success('Service center deleted successfully (sample mode)');
      setIsModalOpen(false);
      setSelectedCenter(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Ensure all services have boolean values
      const cleanServices: { [key: string]: boolean } = {};
      Object.keys(formData.services).forEach((key) => {
        cleanServices[key] = formData.services[key] === true;
      });
      
      const centerData = {
        ...formData,
        services: cleanServices,
        operating_hours: JSON.stringify(formData.operating_hours)
      };
      
      if (modalMode === 'add') {
        const response = await axios.post(`${apiUrl}/api/admin/centers`, centerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCenters([...centers, response.data]);
        toast.success('Service center added successfully');
      } else if (modalMode === 'edit' && selectedCenter) {
        const response = await axios.put(`${apiUrl}/api/admin/centers/${selectedCenter.id}`, centerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCenters(centers.map(c => c.id === selectedCenter.id ? response.data : c));
        toast.success('Service center updated successfully');
      }
      
      setIsModalOpen(false);
      setSelectedCenter(null);
    } catch (error) {
      console.error('Error saving center:', error);
      
      // For sample data, simulate success
      if (modalMode === 'add') {
        const newCenter: ServiceCenter = {
          id: Math.max(...centers.map(c => c.id), 0) + 1,
          name: formData.name,
          location: formData.location,
          contact_number: formData.contact_number || null,
          email: formData.email || null,
          contact_person: formData.contact_person || null,
          services: formData.services,
          operating_hours: JSON.stringify(formData.operating_hours),
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCenters([...centers, newCenter]);
        toast.success('Service center added successfully (sample mode)');
      } else if (modalMode === 'edit' && selectedCenter) {
        const updatedCenter: ServiceCenter = {
          ...selectedCenter,
          name: formData.name,
          location: formData.location,
          contact_number: formData.contact_number || null,
          email: formData.email || null,
          contact_person: formData.contact_person || null,
          services: formData.services,
          operating_hours: JSON.stringify(formData.operating_hours),
          status: formData.status,
          updated_at: new Date().toISOString()
        };
        setCenters(centers.map(c => c.id === selectedCenter.id ? updatedCenter : c));
        toast.success('Service center updated successfully (sample mode)');
      }
      
      setIsModalOpen(false);
      setSelectedCenter(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ Form Handlers ============
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'operating_hours') {
        setFormData({
          ...formData,
          operating_hours: {
            ...formData.operating_hours,
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleServiceToggle = (serviceKey: string) => {
    setFormData({
      ...formData,
      services: {
        ...formData.services,
        [serviceKey]: !formData.services[serviceKey]
      }
    });
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData({
      ...formData,
      status
    });
  };

  // ============ Helper Functions ============
  const getRegionFromLocation = (location: string): string => {
    for (const region of regions) {
      if (location.includes(region)) {
        return region;
      }
    }
    return 'Other';
  };

  const getTractorCount = (centerId: number): number => {
    return tractors.filter(t => t.service_center_id === centerId).length;
  };

  const getActiveServicesCount = (center: ServiceCenter): number => {
    if (!center.services) return 0;
    return Object.values(center.services).filter(v => v === true).length;
  };

  const getOperatingHours = (center: ServiceCenter) => {
    if (center.operating_hours) {
      try {
        return JSON.parse(center.operating_hours);
      } catch {
        return formData.operating_hours;
      }
    }
    return formData.operating_hours;
  };

  // Filter centers
  const filteredCenters = centers.filter(center => {
    if (filterStatus !== 'all' && center.status !== filterStatus) return false;
    
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
  const groupedCenters = filteredCenters.reduce((acc, center) => {
    const region = getRegionFromLocation(center.location);
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(center);
    return acc;
  }, {} as Record<string, ServiceCenter[]>);

  // ============ Render Modal ============
  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              {modalMode === 'add' && <><FaPlus className="mr-2 text-green-600" /> Add New Service Center</>}
              {modalMode === 'edit' && <><FaEdit className="mr-2 text-blue-600" /> Edit Service Center</>}
              {modalMode === 'view' && <><FaEye className="mr-2 text-gray-600" /> View Service Center</>}
              {modalMode === 'delete' && <><FaTrash className="mr-2 text-red-600" /> Delete Service Center</>}
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          {modalMode === 'delete' ? (
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <FaExclamationTriangle className="text-5xl text-red-600" />
                </div>
              </div>
              <p className="text-center text-gray-700 text-lg mb-2">
                Are you sure you want to delete this service center?
              </p>
              <p className="text-center text-gray-500 mb-6">
                <span className="font-semibold">{selectedCenter?.name}</span> in {selectedCenter?.location}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCenter}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Center'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitCenter}>
              <div className="max-h-[70vh] overflow-y-auto px-2">
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Center Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        required
                        placeholder="e.g. Mbabane, Hhohho Region"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="+268 1234 5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="center@rda.co.sz"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="flex space-x-4 mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === 'active'}
                            onChange={() => handleStatusChange('active')}
                            disabled={modalMode === 'view'}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={formData.status === 'inactive'}
                            onChange={() => handleStatusChange('inactive')}
                            disabled={modalMode === 'view'}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Inactive</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center">
                    <FaClock className="mr-2 text-blue-600" /> Operating Hours
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekdays (Monday - Friday)
                      </label>
                      <input
                        type="text"
                        name="operating_hours.weekdays"
                        value={formData.operating_hours.weekdays}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saturday
                      </label>
                      <input
                        type="text"
                        name="operating_hours.saturday"
                        value={formData.operating_hours.saturday}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sunday
                      </label>
                      <input
                        type="text"
                        name="operating_hours.sunday"
                        value={formData.operating_hours.sunday}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Services Offered */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center">
                    <FaTools className="mr-2 text-purple-600" /> Services Offered
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {serviceOptions.map((service) => (
                      <label
                        key={service.key}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          formData.services[service.key]
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        } ${modalMode === 'view' ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.services[service.key] || false}
                          onChange={() => handleServiceToggle(service.key)}
                          disabled={modalMode === 'view'}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 flex items-center">
                          <span className="text-gray-600 mr-2">{service.icon}</span>
                          <span className="text-sm text-gray-700">{service.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              {modalMode !== 'view' && (
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Add Center' : 'Save Changes'}
                  </button>
                </div>
              )}

              {modalMode === 'view' && (
                <div className="flex justify-end pt-4 mt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    );
  };

  // ============ Render ============
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center text-gray-700 hover:text-gray-900">
                <FaHome className="mr-2" />
                <span>Dashboard</span>
              </Link>
              <span className="mx-4 text-gray-400">/</span>
              <h1 className="text-xl font-bold text-gray-900">Manage Service Centers</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.full_name || 'Admin'}
              </span>
              <button
                onClick={handleAddCenter}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
              >
                <FaPlus className="mr-2" />
                Add New Center
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Centers</p>
                <p className="text-2xl font-bold text-gray-900">{centers.length}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <FaMapMarkerAlt className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Centers</p>
                <p className="text-2xl font-bold text-green-600">
                  {centers.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Centers</p>
                <p className="text-2xl font-bold text-red-600">
                  {centers.filter(c => c.status === 'inactive').length}
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-3">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tractors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tractors.length || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <FaTractor className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search centers by name, location, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Centers List */}
        {Object.keys(groupedCenters).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first service center'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={handleAddCenter}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Your First Center
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedCenters).sort().map(([region, regionCenters]) => (
            <div key={region} className="mb-8">
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg p-4 shadow-md">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {region} Region
                  <span className="ml-auto bg-white text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {regionCenters.length} {regionCenters.length === 1 ? 'Center' : 'Centers'}
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-b-lg shadow-md p-6">
                {regionCenters.map((center) => {
                  const tractorCount = getTractorCount(center.id);
                  const servicesCount = getActiveServicesCount(center);
                  const operatingHours = getOperatingHours(center);
                  
                  return (
                    <div
                      key={center.id}
                      className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${
                        center.status === 'active' ? 'border-gray-200' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className={`p-5 border-b ${
                        center.status === 'active' 
                          ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                          : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {center.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-green-600 text-xs" />
                              {center.location}
                            </p>
                          </div>
                          {center.status === 'active' ? (
                            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <FaCheckCircle className="mr-1" /> Active
                            </span>
                          ) : (
                            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <FaTimesCircle className="mr-1" /> Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                            <p className="text-xs text-gray-600">Tractors</p>
                            <p className="text-lg font-bold text-green-600">{tractorCount}</p>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                            <p className="text-xs text-gray-600">Services</p>
                            <p className="text-lg font-bold text-blue-600">{servicesCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="space-y-2 mb-4 text-sm">
                          {center.contact_person && (
                            <div className="flex items-center text-gray-600">
                              <FaUser className="mr-2 text-gray-400 text-xs" />
                              <span className="truncate">{center.contact_person}</span>
                            </div>
                          )}
                          {center.contact_number && (
                            <div className="flex items-center text-gray-600">
                              <FaPhone className="mr-2 text-gray-400 text-xs" />
                              <span>{center.contact_number}</span>
                            </div>
                          )}
                          {center.email && (
                            <div className="flex items-center text-gray-600">
                              <FaEnvelope className="mr-2 text-gray-400 text-xs" />
                              <span className="truncate">{center.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCenter(center)}
                            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleEditCenter(center)}
                            className="flex-1 py-2 px-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCenter(center)}
                            className="py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <FaTrash />
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
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}