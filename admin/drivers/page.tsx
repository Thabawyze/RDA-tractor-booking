'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

import {
  FaTractor,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCar,
  FaCalendarAlt,
  FaUsers,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
  FaClock,
  FaBan,
  FaCheck,
  FaToggleOn,
  FaToggleOff,
  FaUserCheck,
  FaUserClock,
  FaClipboardList,
  FaChartLine,
  FaPhoneAlt,
  FaEnvelopeOpenText,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaSave,
  FaUserPlus,
  FaDownload,
  FaPrint,
  FaKey,
  FaLock,
  FaUnlockAlt,
  FaGraduationCap,
  FaWrench,
  FaGasPump,
  FaRoad,
  FaCalendarCheck
} from 'react-icons/fa';

// ==================== TYPES ====================

interface Driver {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  vehicle_registration: string;
  tractor_type: string;
  tractor_model?: string;
  tractor_year?: number;
  experience_years: number;
  current_status: 'available' | 'busy' | 'off_duty';
  total_completed_jobs: number;
  rating: number;
  assigned_tractor?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
  profile_photo?: string;
}

interface DriverFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  license_number: string;
  license_expiry: string;
  vehicle_registration: string;
  tractor_type: string;
  tractor_model: string;
  tractor_year: number;
  experience_years: number;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

interface DriverStats {
  totalDrivers: number;
  availableDrivers: number;
  busyDrivers: number;
  offDutyDrivers: number;
  totalJobsCompleted: number;
  averageRating: number;
  topPerformer?: Driver;
}

// ==================== STATUS BADGE COMPONENT ====================

const DriverStatusBadge = ({ status }: { status: string }) => {
  const config = {
    available: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Available' },
    busy: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, label: 'Busy' },
    off_duty: { color: 'bg-gray-100 text-gray-800', icon: FaBan, label: 'Off Duty' }
  };

  const { color, icon: Icon, label } = config[status as keyof typeof config] || config.off_duty;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="mr-1 text-xs" />
      {label}
    </span>
  );
};

// ==================== RATING STARS COMPONENT ====================

const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={i} className="text-yellow-500 text-sm" />
      ))}
      {hasHalfStar && <FaStarHalfAlt className="text-yellow-500 text-sm" />}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <FaRegStar key={i} className="text-gray-300 text-sm" />
      ))}
      <span className="ml-1 text-xs text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};

// ==================== STATS CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-2xl ${color}`} />
      </div>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
    <p className="text-gray-600 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

// ==================== DRIVER CARD COMPONENT ====================

const DriverCard = ({ driver, onEdit, onDelete, onToggleStatus, onViewDetails }: { 
  driver: Driver; 
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onToggleStatus: (driver: Driver) => void;
  onViewDetails: (driver: Driver) => void;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header with status */}
      <div className={`p-4 ${
        driver.current_status === 'available' ? 'bg-gradient-to-r from-green-50 to-green-100' :
        driver.current_status === 'busy' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' :
        'bg-gradient-to-r from-gray-50 to-gray-100'
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {driver.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{driver.full_name}</h3>
              <p className="text-sm text-gray-500">ID: {driver.id}</p>
            </div>
          </div>
          <DriverStatusBadge status={driver.current_status} />
        </div>
      </div>

      {/* Driver Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center text-sm">
          <FaEnvelope className="text-gray-400 mr-2" />
          <span className="text-gray-600">{driver.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaPhone className="text-gray-400 mr-2" />
          <span className="text-gray-600">{driver.phone}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaIdCard className="text-gray-400 mr-2" />
          <span className="text-gray-600">License: {driver.license_number}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaCar className="text-gray-400 mr-2" />
          <span className="text-gray-600">{driver.vehicle_registration}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaTractor className="text-gray-400 mr-2" />
          <span className="text-gray-600">{driver.tractor_type}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <FaClipboardList className="text-gray-400 mr-1 text-sm" />
            <span className="text-sm font-medium text-gray-700">{driver.total_completed_jobs} jobs</span>
          </div>
          <RatingStars rating={driver.rating} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 flex justify-between gap-2">
        <button
          onClick={() => onViewDetails(driver)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1"
        >
          <FaEye /> View
        </button>
        <button
          onClick={() => onEdit(driver)}
          className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm flex items-center justify-center gap-1"
        >
          <FaEdit /> Edit
        </button>
        <button
          onClick={() => onToggleStatus(driver)}
          className={`flex-1 px-3 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1 ${
            driver.is_active 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {driver.is_active ? <FaBan /> : <FaCheck />}
          {driver.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminDriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<DriverStats>({
    totalDrivers: 0,
    availableDrivers: 0,
    busyDrivers: 0,
    offDutyDrivers: 0,
    totalJobsCompleted: 0,
    averageRating: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<DriverFormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    license_number: '',
    license_expiry: '',
    vehicle_registration: '',
    tractor_type: '',
    tractor_model: '',
    tractor_year: new Date().getFullYear(),
    experience_years: 0,
    address: '',
    emergency_contact: '',
    emergency_phone: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [searchTerm, statusFilter, drivers]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDrivers(response.data.drivers);
        calculateStats(response.data.drivers);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
      // Load sample data for demo
      loadSampleDrivers();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleDrivers = () => {
    const sampleDrivers: Driver[] = [
      {
        id: 1,
        full_name: 'John Mamba',
        email: 'john.driver@rda.co.sz',
        phone: '+268 76123456',
        license_number: 'DL123456',
        license_expiry: '2025-12-31',
        vehicle_registration: 'RDA 1234',
        tractor_type: 'John Deere 5050E',
        tractor_model: '5050E',
        tractor_year: 2022,
        experience_years: 5,
        current_status: 'available',
        total_completed_jobs: 45,
        rating: 4.8,
        assigned_tractor: 'RDA 1234',
        address: 'Mbabane, Eswatini',
        emergency_contact: 'Mary Mamba',
        emergency_phone: '+268 76234567',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-03-01T10:00:00Z',
        is_active: true
      },
      {
        id: 2,
        full_name: 'Sifiso Nkosi',
        email: 'sifiso.driver@rda.co.sz',
        phone: '+268 78234567',
        license_number: 'DL234567',
        license_expiry: '2025-10-15',
        vehicle_registration: 'RDA 5678',
        tractor_type: 'Massey Ferguson 375',
        tractor_model: '375',
        tractor_year: 2021,
        experience_years: 3,
        current_status: 'busy',
        total_completed_jobs: 32,
        rating: 4.6,
        assigned_tractor: 'RDA 5678',
        address: 'Manzini, Eswatini',
        emergency_contact: 'Thandi Nkosi',
        emergency_phone: '+268 77345678',
        created_at: '2024-02-10T08:00:00Z',
        updated_at: '2024-03-02T10:00:00Z',
        is_active: true
      },
      {
        id: 3,
        full_name: 'Thabo Dlamini',
        email: 'thabo.driver@rda.co.sz',
        phone: '+268 77456789',
        license_number: 'DL345678',
        license_expiry: '2026-03-20',
        vehicle_registration: 'RDA 9012',
        tractor_type: 'New Holland TD5.105',
        tractor_model: 'TD5.105',
        tractor_year: 2023,
        experience_years: 7,
        current_status: 'off_duty',
        total_completed_jobs: 67,
        rating: 4.9,
        assigned_tractor: 'RDA 9012',
        address: 'Malkerns, Eswatini',
        emergency_contact: 'Nomsa Dlamini',
        emergency_phone: '+268 76567890',
        created_at: '2023-11-20T08:00:00Z',
        updated_at: '2024-03-03T10:00:00Z',
        is_active: true
      }
    ];
    setDrivers(sampleDrivers);
    calculateStats(sampleDrivers);
  };

  const calculateStats = (driversList: Driver[]) => {
    const stats = {
      totalDrivers: driversList.length,
      availableDrivers: driversList.filter(d => d.current_status === 'available' && d.is_active).length,
      busyDrivers: driversList.filter(d => d.current_status === 'busy' && d.is_active).length,
      offDutyDrivers: driversList.filter(d => d.current_status === 'off_duty' && d.is_active).length,
      totalJobsCompleted: driversList.reduce((sum, d) => sum + d.total_completed_jobs, 0),
      averageRating: driversList.reduce((sum, d) => sum + d.rating, 0) / driversList.length,
      topPerformer: driversList.sort((a, b) => b.rating - a.rating)[0]
    };
    setStats(stats);
  };

  const filterDrivers = () => {
    let filtered = [...drivers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(driver =>
        driver.full_name.toLowerCase().includes(term) ||
        driver.email.toLowerCase().includes(term) ||
        driver.phone.includes(term) ||
        driver.license_number.toLowerCase().includes(term) ||
        driver.vehicle_registration.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.current_status === statusFilter);
    }

    setFilteredDrivers(filtered);
  };

  const validateForm = (isEdit: boolean = false): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.full_name) errors.full_name = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.license_number) errors.license_number = 'License number is required';
    if (!formData.vehicle_registration) errors.vehicle_registration = 'Vehicle registration is required';
    if (!formData.tractor_type) errors.tractor_type = 'Tractor type is required';
    
    if (!isEdit) {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDriver = async () => {
    if (!validateForm(false)) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/admin/drivers/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Driver added successfully');
        setShowAddModal(false);
        resetForm();
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error adding driver:', error);
      toast.error(error.response?.data?.error || 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDriver = async () => {
    if (!selectedDriver) return;
    if (!validateForm(true)) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/admin/drivers/${selectedDriver.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Driver updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error updating driver:', error);
      toast.error(error.response?.data?.error || 'Failed to update driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/admin/drivers/${selectedDriver.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Driver deleted successfully');
        setShowDeleteModal(false);
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error.response?.data?.error || 'Failed to delete driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/admin/drivers/${driver.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Driver ${response.data.is_active ? 'activated' : 'deactivated'} successfully`);
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      license_number: '',
      license_expiry: '',
      vehicle_registration: '',
      tractor_type: '',
      tractor_model: '',
      tractor_year: new Date().getFullYear(),
      experience_years: 0,
      address: '',
      emergency_contact: '',
      emergency_phone: ''
    });
    setFormErrors({});
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      full_name: driver.full_name,
      email: driver.email,
      phone: driver.phone,
      password: '',
      confirmPassword: '',
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      vehicle_registration: driver.vehicle_registration,
      tractor_type: driver.tractor_type,
      tractor_model: driver.tractor_model || '',
      tractor_year: driver.tractor_year || new Date().getFullYear(),
      experience_years: driver.experience_years,
      address: driver.address || '',
      emergency_contact: driver.emergency_contact || '',
      emergency_phone: driver.emergency_phone || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'License', 'Vehicle', 'Tractor', 'Status', 'Jobs Completed', 'Rating'];
    const csvData = filteredDrivers.map(driver => [
      driver.id,
      driver.full_name,
      driver.email,
      driver.phone,
      driver.license_number,
      driver.vehicle_registration,
      driver.tractor_type,
      driver.current_status,
      driver.total_completed_jobs,
      driver.rating
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drivers_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaTractor className="text-3xl" />
              <div>
                <h1 className="text-2xl font-bold">Driver Management</h1>
                <p className="text-green-100 text-sm">Manage tractor drivers and their assignments</p>
              </div>
            </div>
            <Link href="/admin" className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition">
              <FaArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Drivers" value={stats.totalDrivers} icon={FaUsers} color="text-blue-600" bgColor="bg-blue-100" />
          <StatCard title="Available" value={stats.availableDrivers} icon={FaCheckCircle} color="text-green-600" bgColor="bg-green-100" subtitle="Ready for work" />
          <StatCard title="Busy" value={stats.busyDrivers} icon={FaClock} color="text-yellow-600" bgColor="bg-yellow-100" subtitle="On assignment" />
          <StatCard title="Off Duty" value={stats.offDutyDrivers} icon={FaBan} color="text-gray-600" bgColor="bg-gray-100" />
          <StatCard title="Total Jobs" value={stats.totalJobsCompleted} icon={FaClipboardList} color="text-purple-600" bgColor="bg-purple-100" />
          <StatCard title="Avg Rating" value={stats.averageRating} icon={FaStar} color="text-yellow-600" bgColor="bg-yellow-100" subtitle="out of 5" />
        </div>

        {/* Top Performer Banner */}
        {stats.topPerformer && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Top Performer</p>
                  <p className="text-lg font-bold text-gray-900">{stats.topPerformer.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.topPerformer.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.topPerformer.total_completed_jobs}</p>
                  <p className="text-xs text-gray-500">Jobs Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.topPerformer.experience_years}</p>
                  <p className="text-xs text-gray-500">Years Exp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers by name, email, phone, license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
              <div className="relative w-48">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
              >
                <FaPlus className="mr-2" /> Add Driver
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center"
              >
                <FaDownload className="mr-2" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold text-green-600">{filteredDrivers.length}</span> of{' '}
            <span className="font-bold">{drivers.length}</span> drivers
          </p>
        </div>

        {/* Drivers Grid */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No drivers found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or add a new driver</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center"
            >
              <FaPlus className="mr-2" /> Add Your First Driver
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onToggleStatus={handleToggleStatus}
                onViewDetails={openDetailsModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaUserPlus className="text-green-600" /> Add New Driver
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.full_name && <p className="text-xs text-red-500 mt-1">{formErrors.full_name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="76123456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.license_number ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
                  <input
                    type="text"
                    value={formData.vehicle_registration}
                    onChange={(e) => setFormData({...formData, vehicle_registration: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.vehicle_registration ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="RDA 1234"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tractor Type *</label>
                  <select
                    value={formData.tractor_type}
                    onChange={(e) => setFormData({...formData, tractor_type: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.tractor_type ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Tractor Type</option>
                    <option value="John Deere 5050E">John Deere 5050E</option>
                    <option value="Massey Ferguson 375">Massey Ferguson 375</option>
                    <option value="New Holland TD5.105">New Holland TD5.105</option>
                    <option value="Case IH Farmall">Case IH Farmall</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Physical address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAddDriver} disabled={submitting} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {submitting ? <><FaSpinner className="animate-spin inline mr-2" /> Adding...</> : 'Add Driver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaEdit className="text-yellow-600" /> Edit Driver
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
                  <input
                    type="text"
                    value={formData.vehicle_registration}
                    onChange={(e) => setFormData({...formData, vehicle_registration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tractor Type *</label>
                  <select
                    value={formData.tractor_type}
                    onChange={(e) => setFormData({...formData, tractor_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="John Deere 5050E">John Deere 5050E</option>
                    <option value="Massey Ferguson 375">Massey Ferguson 375</option>
                    <option value="New Holland TD5.105">New Holland TD5.105</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleUpdateDriver} disabled={submitting} className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">
                  {submitting ? <><FaSpinner className="animate-spin inline mr-2" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaUser className="text-blue-600" /> Driver Details
              </h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {selectedDriver.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedDriver.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <DriverStatusBadge status={selectedDriver.current_status} />
                    <span className={`text-sm ${selectedDriver.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDriver.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Contact Information</p>
                  <p className="mt-1"><FaEnvelope className="inline mr-2 text-gray-400" /> {selectedDriver.email}</p>
                  <p><FaPhone className="inline mr-2 text-gray-400" /> {selectedDriver.phone}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">License Information</p>
                  <p className="mt-1"><FaIdCard className="inline mr-2 text-gray-400" /> {selectedDriver.license_number}</p>
                  {selectedDriver.license_expiry && (
                    <p><FaCalendarAlt className="inline mr-2 text-gray-400" /> Expires: {new Date(selectedDriver.license_expiry).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Vehicle Information</p>
                  <p className="mt-1"><FaCar className="inline mr-2 text-gray-400" /> {selectedDriver.vehicle_registration}</p>
                  <p><FaTractor className="inline mr-2 text-gray-400" /> {selectedDriver.tractor_type}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Performance</p>
                  <p className="mt-1"><FaClipboardList className="inline mr-2 text-gray-400" /> {selectedDriver.total_completed_jobs} jobs completed</p>
                  <RatingStars rating={selectedDriver.rating} />
                </div>
                
                {selectedDriver.address && (
                  <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="mt-1"><FaMapMarkerAlt className="inline mr-2 text-gray-400" /> {selectedDriver.address}</p>
                  </div>
                )}
                
                {(selectedDriver.emergency_contact || selectedDriver.emergency_phone) && (
                  <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-700 font-medium">Emergency Contact</p>
                    {selectedDriver.emergency_contact && <p>Name: {selectedDriver.emergency_contact}</p>}
                    {selectedDriver.emergency_phone && <p>Phone: {selectedDriver.emergency_phone}</p>}
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedDriver);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <FaEdit className="inline mr-2" /> Edit Driver
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-2xl text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Driver</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-bold">{selectedDriver.full_name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDeleteDriver} disabled={submitting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {submitting ? <><FaSpinner className="animate-spin inline mr-2" /> Deleting...</> : 'Delete Driver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}