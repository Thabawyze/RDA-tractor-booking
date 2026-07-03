'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

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
  FaTimesCircle,
  FaTimes,
  FaSpinner,
  FaRegBuilding,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegCreditCard,
  FaRegHeart,
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
  FaSignOutAlt,
  FaChartPie,
  FaChartLine,
  FaChartBar,
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaEnvelopeOpenText,
  FaBell,
  FaShieldAlt,
  FaUserCog,
  FaWrench,
  FaTools,
  FaBoxes,
  FaClipboardList,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
  FaLandmark,
  FaTree,
  FaMountain,
  FaGlobeAfrica
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'farmer';
  created_at: string;
  is_active?: boolean;
}

interface Booking {
  id: number;
  full_name: string;
  email: string | null;
  contact_number: string;
  location_description: string;
  available_time: string;
  hours_booked: number;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  tractor_assigned?: string;
}

interface TinkhundlaCenter {
  id: number;
  name: string;
  region: string;
  location: string;
  chiefdoms: number;
  contact_number: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  service_count?: number;
  staff_count?: number;
  established?: string;
}

interface ServiceOffering {
  id: number;
  name: string;
  category: string;
  category_name?: string;
  description: string;
  cost: string;
  duration: string;
  availability: string;
  is_active: boolean;
  center_count?: number;
  registration_count?: number;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  contact_number: string;
  email: string;
  center_id: number;
  center_name?: string;
  is_active: boolean;
}

interface ServiceRegistration {
  id: number;
  service_name: string;
  center_name: string;
  full_name: string;
  phone: string;
  email: string;
  preferred_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalFarmers: number;
  totalAdmins: number;
  totalCenters: number;
  totalServices: number;
  totalStaff: number;
  pendingRegistrations: number;
  recentBookings: Booking[];
  recentRegistrations: ServiceRegistration[];
}

interface ActivityLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'booking' | 'user' | 'center' | 'service' | 'staff' | 'system';
}

// ==================== SAMPLE DATA (will be replaced with API calls) ====================

const SAMPLE_STATS: DashboardStats = {
  totalBookings: 156,
  pendingBookings: 23,
  confirmedBookings: 45,
  completedBookings: 78,
  cancelledBookings: 10,
  totalRevenue: 62400,
  totalUsers: 342,
  totalFarmers: 338,
  totalAdmins: 4,
  totalCenters: 59,
  totalServices: 24,
  totalStaff: 87,
  pendingRegistrations: 15,
  recentBookings: [
    { id: 1, full_name: 'John Dlamini', email: 'john@example.com', contact_number: '+268 7612 3456', location_description: 'Malkerns', available_time: '09:00', hours_booked: 4, total_amount: 1600, payment_method: 'momo', status: 'pending', created_at: '2024-03-12T08:30:00Z', updated_at: '2024-03-12T08:30:00Z' },
    { id: 2, full_name: 'Mary Nkosi', email: 'mary@example.com', contact_number: '+268 7612 3457', location_description: 'Nhlangano', available_time: '10:30', hours_booked: 3, total_amount: 1200, payment_method: 'cash', status: 'confirmed', created_at: '2024-03-12T09:15:00Z', updated_at: '2024-03-12T09:15:00Z' },
    { id: 3, full_name: 'Peter Mamba', email: 'peter@example.com', contact_number: '+268 7612 3458', location_description: 'Siteki', available_time: '14:00', hours_booked: 6, total_amount: 2400, payment_method: 'momo', status: 'completed', created_at: '2024-03-11T11:20:00Z', updated_at: '2024-03-11T11:20:00Z' },
  ],
  recentRegistrations: [
    { id: 1, service_name: 'Tractor Hiring', center_name: 'Mbabane East', full_name: 'John Dlamini', phone: '+268 7612 3456', email: 'john@example.com', preferred_date: '2024-03-15', status: 'pending', created_at: '2024-03-12T08:30:00Z' },
    { id: 2, service_name: 'Seed Distribution', center_name: 'Manzini North', full_name: 'Mary Nkosi', phone: '+268 7612 3457', email: 'mary@example.com', preferred_date: '2024-03-16', status: 'confirmed', created_at: '2024-03-12T09:15:00Z' },
  ]
};

const SAMPLE_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 1, action: 'New Booking Created', user: 'John Dlamini', timestamp: '2024-03-12T08:30:00Z', details: 'Booking #123 for tractor service', type: 'booking' },
  { id: 2, action: 'Booking Status Updated', user: 'Admin', timestamp: '2024-03-12T09:00:00Z', details: 'Booking #122 marked as confirmed', type: 'booking' },
  { id: 3, action: 'New User Registered', user: 'Mary Nkosi', timestamp: '2024-03-12T07:45:00Z', details: 'New farmer registered', type: 'user' },
  { id: 4, action: 'Center Updated', user: 'Admin', timestamp: '2024-03-11T16:20:00Z', details: 'Mbabane East contact info updated', type: 'center' },
  { id: 5, action: 'Service Added', user: 'Admin', timestamp: '2024-03-11T14:10:00Z', details: 'New irrigation service added', type: 'service' },
];

// ==================== QUICK ACTION COMPONENTS ====================

interface QuickActionProps {
  icon: IconType;
  title: string;
  description: string;
  href: string;
  color: string;
  count?: number;
}

const QuickActionCard = ({ icon: Icon, title, description, href, color, count }: QuickActionProps) => (
  <Link href={href} className="block group">
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Icon className="text-3xl text-white" />
          </div>
          {count !== undefined && (
            <span className="bg-white bg-opacity-30 text-white px-3 py-1 rounded-full text-sm font-bold">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white text-opacity-90 text-sm mb-4">{description}</p>
        <div className="flex items-center text-white text-sm font-medium group-hover:translate-x-2 transition-transform">
          <span>Quick Access</span>
          <FaArrowRight className="ml-2" />
        </div>
      </div>
    </div>
  </Link>
);

// ==================== STATISTICS CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
  trend?: number;
  trendLabel?: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendLabel }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-2xl ${color}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium`}>
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          <FaArrowRight className={`ml-1 transform ${trend >= 0 ? '' : 'rotate-90'}`} />
        </div>
      )}
    </div>
    <p className="text-gray-500 text-sm mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
  </div>
);

// ==================== RECENT ACTIVITY COMPONENT ====================

const ActivityLogItem = ({ log }: { log: ActivityLog }) => {
  const getIcon = () => {
    switch (log.type) {
      case 'booking': return FaCalendarCheck;
      case 'user': return FaUserPlus;
      case 'center': return FaMapMarkerAlt;
      case 'service': return FaSeedling;
      case 'staff': return FaUsers;
      default: return FaInfoCircle;
    }
  };

  const getColor = () => {
    switch (log.type) {
      case 'booking': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      case 'center': return 'text-purple-600 bg-purple-100';
      case 'service': return 'text-orange-600 bg-orange-100';
      case 'staff': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const Icon = getIcon();
  const colorClass = getColor();

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
        <Icon className="text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{log.action}</p>
        <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
        <div className="flex items-center mt-1 text-xs text-gray-400">
          <span>{log.user}</span>
          <span className="mx-1">•</span>
          <span>{new Date(log.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>(SAMPLE_STATS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(SAMPLE_ACTIVITY_LOGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

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

      setUser(parsedUser);
      
      // Fetch real data from API
      await fetchDashboardData(token);
      
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch all dashboard data in parallel
      const [statsRes, bookingsRes, registrationsRes, centersRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/bookings?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/service-registrations?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/tinkhundla-centers/enhanced`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/services`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Update stats with real data
      setStats(prev => ({
        ...prev,
        ...statsRes.data,
        recentBookings: bookingsRes.data.bookings || prev.recentBookings,
        recentRegistrations: registrationsRes.data.registrations || prev.recentRegistrations,
        totalCenters: centersRes.data.centers?.length || prev.totalCenters,
        totalServices: servicesRes.data.services?.length || prev.totalServices
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use sample data as fallback
      toast.success('Using sample data (API connection failed)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'today': return "Today's";
      case 'week': return "This Week's";
      case 'month': return "This Month's";
      case 'year': return "This Year's";
      default: return "Overall";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      

      {/* ==================== TOP NAVIGATION BAR ==================== */}
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <FaTractor className="text-2xl" />
              <div>
                <h1 className="text-xl font-bold">RDA Admin</h1>
                <p className="text-xs text-green-200">Management Dashboard</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/admin" className="hover:text-green-200 transition flex items-center">
                <FaHome className="mr-1" />
                Home
              </Link>
              <Link href="/dashboard" className="text-green-200 border-b-2 border-white pb-1 flex items-center">
                <FaTachometerAlt className="mr-1" />
                Dashboard
              </Link>
              <Link href="/admin/bookings" className="hover:text-green-200 transition flex items-center">
                <FaCalendarCheck className="mr-1" />
                Bookings
              </Link>
              <Link href="/admin/services" className="hover:text-green-200 transition flex items-center">
                <FaSeedling className="mr-1" />
                Services
              </Link>
              <Link href="/admin/services" className="hover:text-green-200 transition flex items-center">
                <FaMapMarkerAlt className="mr-1" />
                Centers
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-green-700 rounded-lg transition"
                >
                  <FaBell className="text-xl" />
                  {stats.pendingBookings + stats.pendingRegistrations > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stats.pendingBookings + stats.pendingRegistrations}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {stats.pendingBookings > 0 && (
                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <p className="text-sm text-gray-900">
                            <span className="font-bold">{stats.pendingBookings}</span> pending bookings
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Requires your attention</p>
                        </div>
                      )}
                      {stats.pendingRegistrations > 0 && (
                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <p className="text-sm text-gray-900">
                            <span className="font-bold">{stats.pendingRegistrations}</span> pending service registrations
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                        </div>
                      )}
                      {stats.pendingBookings === 0 && stats.pendingRegistrations === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FaCheckCircle className="text-3xl mx-auto mb-2 text-green-500" />
                          <p className="text-sm">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.full_name || 'Admin'}</p>
                  <p className="text-xs text-green-200">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-green-700 rounded-lg transition"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}!
              </h2>
              <p className="text-blue-100">
                Here's what's happening with your RDA Tractor Booking System today.
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-sm opacity-90">Last login</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* ==================== QUICK ACTIONS SECTION ==================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="flex space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={FaCalendarCheck}
              title="Manage Bookings"
              description="View and update farmer bookings, track status"
              href="/admin/bookings"
              color="from-blue-600 to-blue-800"
              count={stats.pendingBookings}
            />
            <QuickActionCard
              icon={FaSeedling}
              title="Manage Services"
              description="Add, edit, or remove agricultural services"
              href="/admin/services"
              color="from-green-600 to-green-800"
              count={stats.totalServices}
            />
            <QuickActionCard
              icon={FaMapMarkerAlt}
              title="Manage Centers"
              description="Update Tinkhundla center information"
              href="/admin/services"
              color="from-purple-600 to-purple-800"
              count={stats.totalCenters}
            />
            <QuickActionCard
              icon={FaUsers}
              title="Manage Users"
              description="View and manage farmers and staff"
              href="/adminuserspage"
              color="from-orange-600 to-orange-800"
              count={stats.totalUsers}
            />
            <QuickActionCard
              icon={FaRegBuilding}
              title="Manage Staff"
              description="Assign roles and manage center staff"
              href="/admin/staff"
              color="from-pink-600 to-pink-800"
              count={stats.totalStaff}
            />
            <QuickActionCard
              icon={FaFileExport}
              title="Generate Reports"
              description="Create and export system reports"
              href="/admin/reports"
              color="from-indigo-600 to-indigo-800"
            />
            <QuickActionCard
              icon={FaCog}
              title="System Settings"
              description="Configure system parameters"
              href="/admin/settings"
              color="from-gray-600 to-gray-800"
            />
            <QuickActionCard
              icon={FaClipboardList}
              title="Audit Logs"
              description="View system activity and logs"
              href="/admin/audit"
              color="from-red-600 to-red-800"
            />
          </div>
        </div>

        {/* ==================== STATISTICS SECTION ==================== */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={FaCalendarCheck}
              color="text-blue-600"
              bgColor="bg-blue-100"
              trend={12}
              trendLabel="vs last month"
            />
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={FaMoneyBillWave}
              color="text-green-600"
              bgColor="bg-green-100"
              trend={8}
              trendLabel="vs last month"
            />
            <StatCard
              title="Registered Farmers"
              value={stats.totalFarmers}
              icon={FaUsers}
              color="text-purple-600"
              bgColor="bg-purple-100"
              trend={5}
              trendLabel="new this month"
            />
            <StatCard
              title="Active Centers"
              value={stats.totalCenters}
              icon={FaMapMarkerAlt}
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Pending Bookings</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                  Requires Action
                </span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${(stats.pendingBookings / stats.totalBookings) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Confirmed Bookings</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.confirmedBookings}</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(stats.confirmedBookings / stats.totalBookings) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Completed Bookings</span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                  Done
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.completedBookings}</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(stats.completedBookings / stats.totalBookings) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Service Registrations</span>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                  Pending: {stats.pendingRegistrations}
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.totalServices}</p>
              <p className="text-xs text-gray-400 mt-2">Total services available</p>
            </div>
          </div>
        </div>

        {/* ==================== RECENT ACTIVITY & CHARTS SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Activity Log */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link href="/admin/audit" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
                  View All
                  <FaArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {activityLogs.map(log => (
                <ActivityLogItem key={log.id} log={log} />
              ))}
            </div>
          </div>

          {/* Pending Actions Summary */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Pending Bookings</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.pendingBookings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Service Registrations</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.pendingRegistrations}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Center Updates</span>
                  </div>
                  <span className="font-bold text-purple-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">New User Approvals</span>
                  </div>
                  <span className="font-bold text-green-600">2</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                    <p className="text-xs text-gray-500">Staff Members</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
                    <p className="text-xs text-gray-500">Admins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RECENT BOOKINGS & REGISTRATIONS ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <Link href="/admin/bookings" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
                  View All
                  <FaArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.full_name}</div>
                        <div className="text-xs text-gray-500">{booking.contact_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.hours_booked} hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        E {booking.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Service Registrations */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Service Registrations</h3>
                <Link href="/admin/registrations" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
                  View All
                  <FaArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                        <div className="text-xs text-gray-500">{reg.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.center_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reg.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          reg.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/registrations/${reg.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==================== SYSTEM HEALTH & QUICK LINKS ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Health */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">API Status</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Database</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="text-yellow-600 font-medium">75% Used</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Server Load</span>
                  <span className="text-green-600 font-medium">23%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '23%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Useful Links</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/settings/general" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaCog className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">General Settings</span>
              </Link>
              <Link href="/admin/settings/payment" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaCreditCard className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Payment Methods</span>
              </Link>
              <Link href="/admin/settings/notifications" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaBell className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Notifications</span>
              </Link>
              <Link href="/admin/settings/backup" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaSave className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Backup & Restore</span>
              </Link>
              <Link href="/admin/help" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaQuestionCircle className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Help & Support</span>
              </Link>
              <Link href="/admin/documentation" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaRegFileAlt className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Documentation</span>
              </Link>
              <Link href="/admin/api" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaTools className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">API Settings</span>
              </Link>
              <Link href="/admin/security" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
                <FaShieldAlt className="text-2xl text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Security</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>RDA Tractor Booking System v2.0 | &copy; {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </div>
  );
}