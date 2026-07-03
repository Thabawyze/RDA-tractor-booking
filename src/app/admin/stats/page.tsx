'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
// import { toast, Toaster } from 'react-hot-toast';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCalendarAlt,
  FaDownload,
  FaArrowRight,
  FaPrint,
  FaSpinner,
  FaTractor,
  FaUsers,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFileExport,
  FaFileCsv,
  FaFilePdf,
  FaFileExcel,
  FaSync,
  FaFilter,
  FaSearch,
  FaHome,
  FaTachometerAlt,
  FaSeedling,
  FaLeaf,
  FaWater,
  FaHandHoldingHeart,
  FaRegBuilding,
  FaUserPlus,
  FaUserCheck,
  FaUserClock,
  FaCheckDouble,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

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
  recentBookings: RecentBooking[];
}

interface RecentBooking {
  id: number;
  full_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

interface CenterStats {
  id: number;
  name: string;
  region: string;
  bookingCount: number;
  revenue: number;
}

interface ServiceStats {
  id: number;
  name: string;
  category: string;
  bookingCount: number;
  revenue: number;
}

interface TimeRange {
  value: string;
  label: string;
}

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  color: string;
  bgColor: string;
  trend?: number;
  trendLabel?: string;
  prefix?: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendLabel, prefix = '' }: StatCardProps) => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">
        {prefix}{formattedValue}
      </p>
      {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
    </div>
  );
};

// ==================== CHART CARD COMPONENT ====================

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const ChartCard = ({ title, children, action }: ChartCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ==================== PROGRESS BAR COMPONENT ====================

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  bgColor: string;
  suffix?: string;
}

const ProgressBar = ({ label, value, max, color, bgColor, suffix = '' }: ProgressBarProps) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value.toLocaleString()}{suffix}
        </span>
      </div>
      <div className={`h-2 ${bgColor} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ==================== TIME RANGE SELECTOR ====================

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeRange[];
}

const TimeRangeSelector = ({ value, onChange, options }: TimeRangeSelectorProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminStatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalFarmers: 0,
    totalAdmins: 0,
    totalCenters: 0,
    recentBookings: []
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [centerStats, setCenterStats] = useState<CenterStats[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const timeRangeOptions: TimeRange[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    checkAuthAndFetchData();
  }, [timeRange]);

  const checkAuthAndFetchData = async () => {
    setLoading(true);
    setError(null);

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

      await fetchDashboardStats(token);
      await fetchMonthlyData(token);
      await fetchCenterStats(token);
      await fetchServiceStats(token);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setStats({
          totalBookings: response.data.totalBookings || 0,
          pendingBookings: response.data.pendingBookings || 0,
          confirmedBookings: response.data.confirmedBookings || 0,
          completedBookings: response.data.completedBookings || 0,
          cancelledBookings: response.data.cancelledBookings || 0,
          totalRevenue: response.data.totalRevenue || 0,
          totalUsers: response.data.totalUsers || 0,
          totalFarmers: response.data.totalFarmers || 0,
          totalAdmins: response.data.totalAdmins || 0,
          totalCenters: response.data.totalCenters || 0,
          recentBookings: response.data.recentBookings || []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const fetchMonthlyData = async (token: string) => {
    try {
      // This endpoint would need to be implemented
      // For now, using sample data
      const sampleData: MonthlyData[] = [
        { month: 'Jan', bookings: 45, revenue: 18000 },
        { month: 'Feb', bookings: 52, revenue: 20800 },
        { month: 'Mar', bookings: 48, revenue: 19200 },
        { month: 'Apr', bookings: 61, revenue: 24400 },
        { month: 'May', bookings: 55, revenue: 22000 },
        { month: 'Jun', bookings: 67, revenue: 26800 }
      ];
      setMonthlyData(sampleData);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchCenterStats = async (token: string) => {
    try {
      // This endpoint would need to be implemented
      // For now, using sample data
      const sampleData: CenterStats[] = [
        { id: 1, name: 'Mbabane East', region: 'Hhohho', bookingCount: 45, revenue: 18000 },
        { id: 2, name: 'Manzini North', region: 'Manzini', bookingCount: 38, revenue: 15200 },
        { id: 3, name: 'Nhlangano', region: 'Shiselweni', bookingCount: 27, revenue: 10800 },
        { id: 4, name: 'Siteki', region: 'Lubombo', bookingCount: 22, revenue: 8800 }
      ];
      setCenterStats(sampleData);
    } catch (error) {
      console.error('Error fetching center stats:', error);
    }
  };

  const fetchServiceStats = async (token: string) => {
    try {
      // This endpoint would need to be implemented
      // For now, using sample data
      const sampleData: ServiceStats[] = [
        { id: 1, name: 'Tractor Hiring', category: 'tractor', bookingCount: 78, revenue: 31200 },
        { id: 2, name: 'Seed Distribution', category: 'seeds', bookingCount: 45, revenue: 2250 },
        { id: 3, name: 'Fertilizer Supply', category: 'fertilizer', bookingCount: 34, revenue: 10200 },
        { id: 4, name: 'Irrigation Installation', category: 'irrigation', bookingCount: 12, revenue: 60000 }
      ];
      setServiceStats(sampleData);
    } catch (error) {
      console.error('Error fetching service stats:', error);
    }
  };

  const handleRefresh = () => {
    checkAuthAndFetchData();
    toast.success('Stats refreshed');
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // In a real app, implement actual export logic
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const maxBookingValue = Math.max(...centerStats.map(c => c.bookingCount), 1);
  const maxRevenueValue = Math.max(...centerStats.map(c => c.revenue), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Toaster position="top-right" /> */}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-green-700 rounded-lg transition"
              >
                <FaTachometerAlt className="text-xl" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
                <p className="text-green-100 mt-1">Comprehensive system analytics and metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TimeRangeSelector
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
              />
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-green-700 rounded-lg transition"
                title="Refresh"
              >
                <FaSync className="text-xl" />
              </button>
              <div className="relative group">
                <button className="p-2 hover:bg-green-700 rounded-lg transition">
                  <FaDownload className="text-xl" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                  >
                    <FaFileCsv className="mr-2 text-green-600" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                  >
                    <FaFileExcel className="mr-2 text-green-600" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                  >
                    <FaFilePdf className="mr-2 text-green-600" />
                    Export as PDF
                  </button>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 hover:bg-green-700 rounded-lg transition"
                title="Print"
              >
                <FaPrint className="text-xl" />
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-200 flex items-center">
            <FaInfoCircle className="mr-2" />
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={FaChartBar}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend={12}
            trendLabel="vs last period"
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={FaMoneyBillWave}
            color="text-green-600"
            bgColor="bg-green-100"
            trend={8}
            trendLabel="vs last period"
            prefix="E "
          />
          <StatCard
            title="Active Farmers"
            value={stats.totalFarmers}
            icon={FaUsers}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend={5}
            trendLabel="new this month"
          />
          <StatCard
            title="Service Centers"
            value={stats.totalCenters}
            icon={FaMapMarkerAlt}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Booking Status">
            <div className="space-y-4">
              <ProgressBar
                label="Pending"
                value={stats.pendingBookings}
                max={stats.totalBookings}
                color="bg-yellow-500"
                bgColor="bg-yellow-100"
              />
              <ProgressBar
                label="Confirmed"
                value={stats.confirmedBookings}
                max={stats.totalBookings}
                color="bg-blue-500"
                bgColor="bg-blue-100"
              />
              <ProgressBar
                label="Completed"
                value={stats.completedBookings}
                max={stats.totalBookings}
                color="bg-green-500"
                bgColor="bg-green-100"
              />
              <ProgressBar
                label="Cancelled"
                value={stats.cancelledBookings}
                max={stats.totalBookings}
                color="bg-red-500"
                bgColor="bg-red-100"
              />
            </div>
          </ChartCard>

          <ChartCard title="Monthly Trend">
            <div className="h-64 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => {
                const maxBookings = Math.max(...monthlyData.map(d => d.bookings), 1);
                const height = (data.bookings / maxBookings) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full">
                      <div 
                        className="w-full bg-green-500 rounded-t-lg transition-all duration-300 group-hover:bg-green-600"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {data.bookings} bookings - E{data.revenue.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Center Performance */}
        <ChartCard 
          title="Center Performance" 
          action={
            <Link
              href="/admin/centers"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View All Centers
              <FaArrowRight className="ml-1" />
            </Link>
          }
        >
          <div className="space-y-4">
            {centerStats.map(center => (
              <div key={center.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{center.name}</span>
                    <span className="text-gray-500 ml-2">({center.region})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">{center.bookingCount} bookings</span>
                    <span className="text-gray-500 ml-2">E{center.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(center.bookingCount / maxBookingValue) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(center.revenue / maxRevenueValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Service Popularity */}
        <ChartCard 
          title="Service Popularity"
          action={
            <Link
              href="/admin/services"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View All Services
              <FaArrowRight className="ml-1" />
            </Link>
          }
        >
          <div className="space-y-4">
            {serviceStats.map(service => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {service.category === 'tractor' && <FaTractor className="text-green-600" />}
                    {service.category === 'seeds' && <FaSeedling className="text-green-600" />}
                    {service.category === 'fertilizer' && <FaLeaf className="text-green-600" />}
                    {service.category === 'irrigation' && <FaWater className="text-green-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.bookingCount} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">E{service.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Bookings */}
        <ChartCard 
          title="Recent Bookings"
          action={
            <Link
              href="/admin/bookings"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View All
              <FaArrowRight className="ml-1" />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">#{booking.id}</td>
                    <td className="py-3 text-gray-700">{booking.full_name}</td>
                    <td className="py-3 font-medium text-gray-900">E{booking.total_amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Quick Stats Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-600">Administrators</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalFarmers}</p>
              <p className="text-sm text-gray-600">Registered Farmers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.totalCenters}</p>
              <p className="text-sm text-gray-600">Service Centers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}