'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaFileExport, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv,
  FaFileAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaTractor,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaDownload,
  FaPrint,
  FaEye,
  FaFilter,
  FaSearch,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaRegBuilding,
  FaSeedling,
  FaWater,
  FaLeaf,
  FaBoxes,
  FaClipboardList,
  FaChartArea
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface ReportFilters {
  dateRange: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';
  startDate: string;
  endDate: string;
  reportType: 'summary' | 'detailed' | 'financial' | 'activity' | 'centers' | 'services' | 'users';
  format: 'pdf' | 'excel' | 'csv' | 'html';
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'region' | 'center' | 'service';
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  format: string;
  size: string;
  url: string;
}

interface SummaryStats {
  totalBookings: number;
  totalRevenue: number;
  totalFarmers: number;
  totalCenters: number;
  totalServices: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  topRegion: string;
  topCenter: string;
  topService: string;
  busiestDay: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface ActivityItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_SUMMARY: SummaryStats = {
  totalBookings: 1247,
  totalRevenue: 498800,
  totalFarmers: 856,
  totalCenters: 59,
  totalServices: 24,
  pendingBookings: 43,
  completedBookings: 1102,
  cancelledBookings: 102,
  averageBookingValue: 400,
  topRegion: 'Manzini',
  topCenter: 'Manzini North',
  topService: 'Tractor Hiring',
  busiestDay: 'Friday'
};

const SAMPLE_RECENT_REPORTS: ReportData[] = [
  { id: '1', name: 'Monthly Summary - February 2024', type: 'summary', generatedAt: '2024-03-01T09:00:00Z', format: 'pdf', size: '1.2 MB', url: '#' },
  { id: '2', name: 'Financial Report Q1 2024', type: 'financial', generatedAt: '2024-03-01T10:30:00Z', format: 'excel', size: '856 KB', url: '#' },
  { id: '3', name: 'Center Performance - Manzini', type: 'centers', generatedAt: '2024-02-28T14:15:00Z', format: 'csv', size: '234 KB', url: '#' },
  { id: '4', name: 'Service Utilization Analysis', type: 'services', generatedAt: '2024-02-27T11:45:00Z', format: 'pdf', size: '1.5 MB', url: '#' },
  { id: '5', name: 'User Activity Log - February', type: 'activity', generatedAt: '2024-02-26T16:20:00Z', format: 'excel', size: '1.1 MB', url: '#' },
];

const SAMPLE_ACTIVITY: ActivityItem[] = [
  { id: 1, action: 'Report Generated', user: 'Admin User', timestamp: '2024-03-01T09:00:00Z', details: 'Monthly Summary - February 2024' },
  { id: 2, action: 'Report Exported', user: 'Admin User', timestamp: '2024-03-01T10:30:00Z', details: 'Financial Report Q1 2024 (Excel)' },
  { id: 3, action: 'Report Downloaded', user: 'Admin User', timestamp: '2024-02-29T15:45:00Z', details: 'Center Performance Report' },
  { id: 4, action: 'Report Scheduled', user: 'Admin User', timestamp: '2024-02-29T11:20:00Z', details: 'Weekly summary every Monday' },
  { id: 5, action: 'Report Shared', user: 'Admin User', timestamp: '2024-02-28T09:15:00Z', details: 'Shared via email with management' },
];

// ==================== DATE RANGE OPTIONS ====================

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

const REPORT_TYPES = [
  { value: 'summary', label: 'Executive Summary', icon: FaFileAlt, description: 'High-level overview of key metrics' },
  { value: 'detailed', label: 'Detailed Report', icon: FaClipboardList, description: 'Comprehensive data with all details' },
  { value: 'financial', label: 'Financial Report', icon: FaMoneyBillWave, description: 'Revenue, payments, and financial analysis' },
  { value: 'activity', label: 'Activity Log', icon: FaClock, description: 'User actions and system events' },
  { value: 'centers', label: 'Centers Report', icon: FaMapMarkerAlt, description: 'Performance by Tinkhundla center' },
  { value: 'services', label: 'Services Report', icon: FaSeedling, description: 'Service utilization and popularity' },
  { value: 'users', label: 'Users Report', icon: FaUsers, description: 'Farmer registration and activity' },
];

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF Document', icon: FaFilePdf, color: 'text-red-500' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: FaFileExcel, color: 'text-green-600' },
  { value: 'csv', label: 'CSV File', icon: FaFileCsv, color: 'text-blue-500' },
  { value: 'html', label: 'HTML Page', icon: FaFileAlt, color: 'text-purple-500' },
];

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'By Day' },
  { value: 'week', label: 'By Week' },
  { value: 'month', label: 'By Month' },
  { value: 'quarter', label: 'By Quarter' },
  { value: 'year', label: 'By Year' },
  { value: 'region', label: 'By Region' },
  { value: 'center', label: 'By Center' },
  { value: 'service', label: 'By Service' },
];

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
  bgColor: string;
  trend?: number;
  trendLabel?: string;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendLabel }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-xl ${color}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          {trend >= 0 ? <FaArrowRight className="ml-1 rotate-45" /> : <FaArrowRight className="ml-1 -rotate-45" />}
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
  </div>
);

// ==================== REPORT CARD COMPONENT ====================

interface ReportCardProps {
  report: ReportData;
  onDownload: (report: ReportData) => void;
  onView: (report: ReportData) => void;
}

const ReportCard = ({ report, onDownload, onView }: ReportCardProps) => {
  const getIcon = () => {
    switch (report.format) {
      case 'pdf': return FaFilePdf;
      case 'excel': return FaFileExcel;
      case 'csv': return FaFileCsv;
      default: return FaFileAlt;
    }
  };

  const getColor = () => {
    switch (report.format) {
      case 'pdf': return 'text-red-500';
      case 'excel': return 'text-green-600';
      case 'csv': return 'text-blue-500';
      default: return 'text-purple-500';
    }
  };

  const Icon = getIcon();
  const color = getColor();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className={`p-3 bg-gray-50 rounded-lg ${color}`}>
          <Icon className="text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{report.name}</h3>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
            <span className="capitalize">{report.type}</span>
            <span>•</span>
            <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{report.size}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(report)}
            className="p-2 text-gray-400 hover:text-blue-600 transition"
            title="View Report"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onDownload(report)}
            className="p-2 text-gray-400 hover:text-green-600 transition"
            title="Download Report"
          >
            <FaDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    reportType: 'summary',
    format: 'pdf',
    groupBy: 'month',
    includeCharts: true,
    includeTables: true,
    includeSummary: true
  });
  const [summary, setSummary] = useState<SummaryStats>(SAMPLE_SUMMARY);
  const [recentReports, setRecentReports] = useState<ReportData[]>(SAMPLE_RECENT_REPORTS);
  const [activity, setActivity] = useState<ActivityItem[]>(SAMPLE_ACTIVITY);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'recent' | 'scheduled'>('generate');

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
      await fetchReportData(token);
      
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch summary stats
      const summaryRes = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (summaryRes.data) {
        setSummary(prev => ({
          ...prev,
          ...summaryRes.data
        }));
      }

      // Fetch recent reports
      const reportsRes = await axios.get(`${API_URL}/api/admin/reports/recent`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (reportsRes.data?.reports) {
        setRecentReports(reportsRes.data.reports);
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.success('Using sample data (API connection failed)');
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Prepare report parameters
      const params = {
        ...filters,
        startDate: filters.dateRange === 'custom' ? filters.startDate : undefined,
        endDate: filters.dateRange === 'custom' ? filters.endDate : undefined,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      toast.success(`Report generated successfully! Format: ${filters.format.toUpperCase()}`);
      
      // Add to recent reports
      const newReport: ReportData = {
        id: Date.now().toString(),
        name: `${REPORT_TYPES.find(t => t.value === filters.reportType)?.label} - ${new Date().toLocaleDateString()}`,
        type: filters.reportType,
        generatedAt: new Date().toISOString(),
        format: filters.format,
        size: '1.2 MB',
        url: '#'
      };
      
      setRecentReports([newReport, ...recentReports].slice(0, 10));

    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = (report: ReportData) => {
    toast.success(`Downloading ${report.name}...`);
    // In production, trigger actual download
  };

  const handleViewReport = (report: ReportData) => {
    toast.success(`Opening ${report.name}...`);
    // In production, open report viewer
  };

  const handleExportData = () => {
    toast.success('Exporting data...');
  };

  const handleScheduleReport = () => {
    toast.success('Report scheduled successfully');
  };

  const getDateRangeDisplay = () => {
    const range = DATE_RANGES.find(r => r.value === filters.dateRange);
    if (!range) return 'Select Date Range';
    
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`;
    }
    
    return range.label;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <FaFileAlt className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-2xl animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg mt-4">Loading reports dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Toaster position="top-right" /> */}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500">Generate and manage system reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
              >
                <FaDownload className="mr-2" />
                Export Data
              </button>
              <button
                onClick={handleScheduleReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm"
              >
                <FaClock className="mr-2" />
                Schedule Report
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'generate'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Generate Reports
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'recent'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Reports
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'scheduled'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Scheduled Reports
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={summary.totalBookings.toLocaleString()}
            icon={FaClipboardList}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend={12}
            trendLabel="vs last month"
          />
          <StatCard
            title="Total Revenue"
            value={`E ${summary.totalRevenue.toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="text-green-600"
            bgColor="bg-green-100"
            trend={8}
            trendLabel="vs last month"
          />
          <StatCard
            title="Active Farmers"
            value={summary.totalFarmers.toLocaleString()}
            icon={FaUsers}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend={5}
            trendLabel="new this month"
          />
          <StatCard
            title="Service Centers"
            value={summary.totalCenters}
            icon={FaMapMarkerAlt}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Main Content */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Configuration */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h2>

                <div className="space-y-6">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => {
                        const value = e.target.value as ReportFilters['dateRange'];
                        setFilters({ ...filters, dateRange: value });
                        setShowCustomDate(value === 'custom');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {DATE_RANGES.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Date Range */}
                  {showCustomDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Report Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Report Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {REPORT_TYPES.map(type => (
                        <label
                          key={type.value}
                          className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                            filters.reportType === type.value
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reportType"
                            value={type.value}
                            checked={filters.reportType === type.value}
                            onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
                            className="sr-only"
                          />
                          <div className="flex items-start space-x-3">
                            <type.icon className={`text-xl ${
                              filters.reportType === type.value ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className={`font-medium ${
                                filters.reportType === type.value ? 'text-green-600' : 'text-gray-900'
                              }`}>{type.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Export Format
                    </label>
                    <div className="flex space-x-3">
                      {FORMAT_OPTIONS.map(format => (
                        <label
                          key={format.value}
                          className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                            filters.format === format.value
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format.value}
                            checked={filters.format === format.value}
                            onChange={(e) => setFilters({ ...filters, format: e.target.value as any })}
                            className="sr-only"
                          />
                          <format.icon className={`text-2xl mx-auto mb-2 ${
                            filters.format === format.value ? format.color : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            filters.format === format.value ? 'text-green-600' : 'text-gray-700'
                          }`}>{format.label}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Group By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Results By
                    </label>
                    <select
                      value={filters.groupBy}
                      onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {GROUP_BY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Report Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Report Options
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.includeCharts}
                          onChange={(e) => setFilters({ ...filters, includeCharts: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include charts and graphs</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.includeTables}
                          onChange={(e) => setFilters({ ...filters, includeTables: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include data tables</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.includeSummary}
                          onChange={(e) => setFilters({ ...filters, includeSummary: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include executive summary</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {generating ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FaFileAlt className="mr-2" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Preview</h2>
                
                <div className="space-y-4">
                  {/* Selected Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Options</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date Range:</span>
                        <span className="font-medium text-gray-900">{getDateRangeDisplay()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Report Type:</span>
                        <span className="font-medium text-gray-900">
                          {REPORT_TYPES.find(t => t.value === filters.reportType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span className="font-medium text-gray-900 uppercase">{filters.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Group By:</span>
                        <span className="font-medium text-gray-900 capitalize">{filters.groupBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-3">Quick Stats</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Total Records:</span>
                        <span className="font-medium text-green-900">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Est. File Size:</span>
                        <span className="font-medium text-green-900">~2.5 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Est. Time:</span>
                        <span className="font-medium text-green-900">~30 seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Preview */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Preview</h3>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Preview of report format</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Reports List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {recentReports.map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onDownload={handleDownloadReport}
                      onView={handleViewReport}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  {activity.map(item => (
                    <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FaFileAlt className="text-gray-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <span>{item.user}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
            <p className="text-gray-500 mb-6">You haven't scheduled any reports yet.</p>
            <button
              onClick={handleScheduleReport}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Schedule Your First Report
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Reports are generated based on available data. Large date ranges may take longer to process.</p>
        </div>
      </div>
    </div>
  );
}