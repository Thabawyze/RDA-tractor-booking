'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaCalendarCheck, 
  FaClock, 
  FaUser, 
  FaTh,
  FaTractor, 
  FaList,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaChartBar,
  FaSpinner,
  FaTachometerAlt,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaBan,
  FaInfoCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaFileCsv,
  FaFilePdf,
  FaFileExcel,
  FaCalendarAlt,
  FaUserCircle,
  FaRegBuilding,
  FaSeedling,
  FaLeaf,
  FaWater,
  FaUsers,
  FaRegHeart,
  FaRegFileAlt,
  FaRegChartBar,
  FaRegLightbulb,
  FaRegMoneyBillAlt,
  FaRegCreditCard
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface ServiceRegistration {
  id: number;
  service_id: number;
  service_name: string;
  service_category: string;
  center_id: number;
  center_name: string;
  center_region: string;
  user_id: number | null;
  full_name: string;
  email: string;
  phone: string;
  farm_location: string;
  farm_size: string;
  crop_type: string;
  livestock_type: string;
  preferred_date: string;
  preferred_time: string;
  additional_notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: number;
  name: string;
  category: string;
}

interface Center {
  id: number;
  name: string;
  region: string;
}

interface RegistrationStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  byService: { name: string; count: number }[];
  byCenter: { name: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

interface FilterOptions {
  status: string;
  service_id: string;
  center_id: string;
  from_date: string;
  to_date: string;
  search: string;
}

// ==================== REGISTRATION DETAILS MODAL ====================

// ==================== REGISTRATION DETAILS MODAL ====================

interface RegistrationDetailsModalProps {
  registration: ServiceRegistration | null;
  onClose: () => void;
  onUpdate: (id: number, status: string, adminNotes: string) => Promise<void>;
}

const RegistrationDetailsModal = ({ registration, onClose, onUpdate }: RegistrationDetailsModalProps) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>(
    (registration?.status as 'pending' | 'confirmed' | 'completed' | 'cancelled') || 'pending'
  );
  const [adminNotes, setAdminNotes] = useState(registration?.admin_notes || '');
  const [loading, setLoading] = useState(false);

  if (!registration) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(registration.id, status, adminNotes);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled';
    setStatus(value);
  };

  const getStatusIcon = () => {
    switch (registration.status) {
      case 'pending': return <FaHourglassHalf className="text-yellow-500 text-2xl" />;
      case 'confirmed': return <FaCheckCircle className="text-blue-500 text-2xl" />;
      case 'completed': return <FaCheckCircle className="text-green-500 text-2xl" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500 text-2xl" />;
      default: return <FaInfoCircle className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-4 ${
                registration.status === 'pending' ? 'bg-yellow-100' :
                registration.status === 'confirmed' ? 'bg-blue-100' :
                registration.status === 'completed' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
                {getStatusIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Registration #{registration.id}
                </h2>
                <p className="text-gray-500">Created: {new Date(registration.created_at).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaSeedling className="mr-2 text-green-600" />
                Service Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Service:</span> {registration.service_name}</p>
                <p><span className="text-gray-500">Category:</span> {registration.service_category}</p>
                <p><span className="text-gray-500">Center:</span> {registration.center_name}</p>
                <p><span className="text-gray-500">Region:</span> {registration.center_region}</p>
              </div>
            </div>

            {/* Farmer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaUser className="mr-2 text-green-600" />
                Farmer Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {registration.full_name}</p>
                <p><span className="text-gray-500">Email:</span> {registration.email}</p>
                <p><span className="text-gray-500">Phone:</span> {registration.phone}</p>
                <p><span className="text-gray-500">Farm Location:</span> {registration.farm_location}</p>
              </div>
            </div>

            {/* Farm Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-600" />
                Farm Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Farm Size:</span> {registration.farm_size || 'Not specified'}</p>
                <p><span className="text-gray-500">Crop Type:</span> {registration.crop_type || 'Not specified'}</p>
                <p><span className="text-gray-500">Livestock:</span> {registration.livestock_type || 'Not specified'}</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaCalendarAlt className="mr-2 text-green-600" />
                Preferred Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Date:</span> {new Date(registration.preferred_date).toLocaleDateString()}</p>
                <p><span className="text-gray-500">Time:</span> {registration.preferred_time}</p>
              </div>
            </div>

            {/* Additional Notes */}
            {registration.additional_notes && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FaInfoCircle className="mr-2 text-green-600" />
                  Farmer's Notes
                </h3>
                <p className="text-sm text-gray-700">{registration.additional_notes}</p>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Admin Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this registration..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update Registration
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 text-xs text-gray-400 flex justify-between">
            <span>Created: {new Date(registration.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(registration.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== BULK ACTION MODAL ====================

interface BulkActionModalProps {
  selectedIds: number[];
  onClose: () => void;
  onConfirm: (status: string, notes: string) => Promise<void>;
}

const BulkActionModal = ({ selectedIds, onClose, onConfirm }: BulkActionModalProps) => {
  const [status, setStatus] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(status, notes);
      onClose();
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Update Registrations</h2>
          <p className="text-sm text-gray-600 mb-4">
            You are about to update {selectedIds.length} registration(s).
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (applies to all)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes for these registrations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update All'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STATISTICS CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-2xl ${color}`} />
      </div>
    </div>
  </div>
);

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<ServiceRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<ServiceRegistration[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    byService: [],
    byCenter: [],
    byStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<ServiceRegistration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    service_id: 'all',
    center_id: 'all',
    from_date: '',
    to_date: '',
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState<keyof ServiceRegistration>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [registrations, filters, sortField, sortDirection]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredRegistrations.length / itemsPerPage));
  }, [filteredRegistrations, itemsPerPage]);

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

      setUser(parsedUser);
      
      // Fetch real data from API
      await fetchRegistrations(token);
      
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch registrations, services, centers, and stats in parallel
      const [registrationsRes, servicesRes, centersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/service-registrations`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_URL}/api/services`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_URL}/api/tinkhundla`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_URL}/api/admin/service-registrations/stats`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      if (registrationsRes.data.success) {
        // Type assertion to ensure status matches the expected union type
        const typedRegistrations: ServiceRegistration[] = registrationsRes.data.registrations.map((reg: any) => ({
          ...reg,
          status: reg.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
        }));
        setRegistrations(typedRegistrations);
        setFilteredRegistrations(typedRegistrations);
      }
      
      if (servicesRes.data.success) {
        setServices(servicesRes.data.services);
      }
      
      if (centersRes.data.success) {
        setCenters(centersRes.data.centers);
      } else if (Array.isArray(centersRes.data)) {
        // Handle legacy format
        setCenters(centersRes.data);
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats || statsRes.data);
      }

    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch data from server');
    }
  };

  const applyFilters = () => {
    let filtered = [...registrations];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    // Service filter
    if (filters.service_id !== 'all') {
      filtered = filtered.filter(r => r.service_id === parseInt(filters.service_id));
    }

    // Center filter
    if (filters.center_id !== 'all') {
      filtered = filtered.filter(r => r.center_id === parseInt(filters.center_id));
    }

    // Date range filter
    if (filters.from_date) {
      filtered = filtered.filter(r => new Date(r.preferred_date) >= new Date(filters.from_date));
    }
    if (filters.to_date) {
      filtered = filtered.filter(r => new Date(r.preferred_date) <= new Date(filters.to_date));
    }

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.full_name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.includes(term) ||
        r.farm_location.toLowerCase().includes(term) ||
        r.service_name.toLowerCase().includes(term) ||
        r.center_name.toLowerCase().includes(term)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof ServiceRegistration) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof ServiceRegistration) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-green-600" /> : <FaSortDown className="text-green-600" />;
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
      setSelectAll(false);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdate = async (status: string, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Update each selected registration
      await Promise.all(selectedIds.map(id =>
        axios.put(
          `${API_URL}/api/admin/service-registrations/${id}`,
          { status, admin_notes: notes },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));

      toast.success(`Successfully updated ${selectedIds.length} registrations`);
      
      // Refresh data
      if (token) await fetchRegistrations(token);
      
      setSelectedIds([]);
      setSelectAll(false);
      
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update some registrations');
    }
  };

  const handleUpdateRegistration = async (id: number, status: string, adminNotes: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.put(
        `${API_URL}/api/admin/service-registrations/${id}`,
        { status, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Registration updated successfully');
        
        // Refresh data
        if (token) await fetchRegistrations(token);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update registration');
      throw error;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Farmer Name', 'Email', 'Phone', 'Service', 'Center', 'Farm Location', 'Farm Size', 'Crop Type', 'Livestock', 'Preferred Date', 'Preferred Time', 'Status', 'Admin Notes', 'Created At'];
    const data = filteredRegistrations.map(r => [
      r.id,
      r.full_name,
      r.email,
      r.phone,
      r.service_name,
      r.center_name,
      r.farm_location,
      r.farm_size,
      r.crop_type,
      r.livestock_type,
      r.preferred_date,
      r.preferred_time,
      r.status,
      r.admin_notes,
      new Date(r.created_at).toLocaleString()
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export started');
  };

  const exportToPDF = () => {
    toast.success('PDF export feature coming soon');
  };

  const exportToExcel = () => {
    toast.success('Excel export feature coming soon');
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      service_id: 'all',
      center_id: 'all',
      from_date: '',
      to_date: '',
      search: ''
    });
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRegistrations.slice(startIndex, endIndex);
  };

  const currentItems = getCurrentPageItems();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaHourglassHalf },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    
    const { color, icon: Icon } = config[status] || config.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${color}`}>
        <Icon className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="hover:text-green-200 transition flex items-center">
                <FaTachometerAlt className="mr-2" />
                Dashboard
              </Link>
              <span className="text-green-300">/</span>
              <span className="font-semibold">Service Registrations</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-200">
                {filteredRegistrations.length} registrations
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={FaRegFileAlt}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={FaHourglassHalf}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={FaCheckCircle}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={FaCheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={FaTimesCircle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search and Export Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 flex items-center space-x-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, location..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Bulk Update ({selectedIds.length})
                  </button>
                )}
                <div className="relative group">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center">
                    <FaFileExport className="mr-2" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block z-10">
                    <button
                      onClick={exportToCSV}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <FaFileCsv className="mr-2 text-green-600" />
                      Export as CSV
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <FaFileExcel className="mr-2 text-green-600" />
                      Export as Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <FaFilePdf className="mr-2 text-green-600" />
                      Export as PDF
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <FaPrint className="mr-2" />
                  Print
                </button>
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
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.service_id}
                onChange={(e) => setFilters({ ...filters, service_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>

              <select
                value={filters.center_id}
                onChange={(e) => setFilters({ ...filters, center_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Centers</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="From Date"
              />

              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="To Date"
              />
            </div>

            {(filters.status !== 'all' || filters.service_id !== 'all' || filters.center_id !== 'all' || filters.from_date || filters.to_date || filters.search) && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{currentItems.length}</span> of{' '}
            <span className="font-bold">{filteredRegistrations.length}</span> registrations
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                      <div className="flex items-center">
                        ID {getSortIcon('id')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('full_name')}>
                      <div className="flex items-center">
                        Farmer {getSortIcon('full_name')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('service_name')}>
                      <div className="flex items-center">
                        Service {getSortIcon('service_name')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('center_name')}>
                      <div className="flex items-center">
                        Center {getSortIcon('center_name')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('preferred_date')}>
                      <div className="flex items-center">
                        Preferred Date {getSortIcon('preferred_date')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        Status {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(registration.id)}
                          onChange={() => handleSelectOne(registration.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{registration.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registration.full_name}</div>
                        <div className="text-xs text-gray-500">{registration.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{registration.phone}</div>
                        <div className="text-xs text-gray-500">{registration.farm_location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.center_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(registration.preferred_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetailsModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {currentItems.length === 0 && (
              <div className="text-center py-12">
                <FaRegFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No registrations found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredRegistrations.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FaChevronLeft />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((registration) => (
              <div key={registration.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{registration.full_name}</h3>
                      <p className="text-sm text-gray-500">{registration.email}</p>
                    </div>
                    {getStatusBadge(registration.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <FaPhone className="text-green-600 mr-2" />
                      {registration.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <FaSeedling className="text-green-600 mr-2" />
                      {registration.service_name}
                    </div>
                    <div className="flex items-center text-sm">
                      <FaMapMarkerAlt className="text-green-600 mr-2" />
                      {registration.center_name} - {registration.center_region}
                    </div>
                    <div className="flex items-center text-sm">
                      <FaCalendarAlt className="text-green-600 mr-2" />
                      {new Date(registration.preferred_date).toLocaleDateString()} at {registration.preferred_time}
                    </div>
                    {registration.farm_size && (
                      <div className="flex items-center text-sm">
                        <FaTractor className="text-green-600 mr-2" />
                        {registration.farm_size}
                      </div>
                    )}
                  </div>

                  {registration.additional_notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 italic">"{registration.additional_notes}"</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center"
                    >
                      <FaEye className="mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Services */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
            <div className="space-y-3">
              {stats.byService.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Centers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Centers</h3>
            <div className="space-y-3">
              {stats.byCenter.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedRegistration && (
        <RegistrationDetailsModal
          registration={selectedRegistration}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRegistration(null);
          }}
          onUpdate={handleUpdateRegistration}
        />
      )}

      {showBulkModal && (
        <BulkActionModal
          selectedIds={selectedIds}
          onClose={() => setShowBulkModal(false)}
          onConfirm={handleBulkUpdate}
        />
      )}
    </div>
  );
}