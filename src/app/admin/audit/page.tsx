'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { toast, Toaster } from 'react-hot-toast';
import { 
  FaHistory,
  FaUser,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaTractor,
  FaSeedling,
  FaLeaf,
  FaWater,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCheck,
  FaSpinner,
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
  FaClock,
  FaShieldAlt,
  FaCog,
  FaPlus,
  FaMinus,
  FaToggleOn,
  FaToggleOff,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBriefcase,
  FaGraduationCap,
  FaStar,
  FaHeart,
  FaHandsHelping,
  FaUserPlus,
  FaUserEdit,
  FaUserTimes,
  FaUserCheck,
  FaLock,
  FaUnlock,
  FaKey,
  FaSignInAlt,
  FaSignOutAlt,
  FaUpload,
  FaDownload as FaDownloadIcon,
  FaFile,
  FaFileAlt,
  FaFilePdf as FaFilePdfIcon,
  FaFileExcel as FaFileExcelIcon,
  FaFileCsv as FaFileCsvIcon,
  FaFileImage,
  FaFileArchive,
  FaFolder,
  FaFolderOpen,
  FaDatabase,
  FaServer,
  FaCloud,
  FaWifi,
  FaPlug,
  FaPowerOff,
  FaSync,
  FaSyncAlt,
  FaRedo,
  FaUndo,
  FaCopy,
  FaCut,
  FaPaste,
  FaLink,
  FaUnlink,
  FaPaperPlane,
  FaEnvelopeOpen,
  FaEnvelopeOpenText,
  FaInbox,
  FaTrashAlt,
  FaArchive,
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

// ==================== TYPES ====================

interface AuditLog {
  id: number;
  timestamp: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: 'admin' | 'farmer' | 'staff';
  action_type: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import' | 'download' | 'upload' | 'approve' | 'reject' | 'cancel' | 'complete' | 'pending' | 'confirm' | 'assign' | 'unassign' | 'enable' | 'disable' | 'lock' | 'unlock' | 'reset' | 'change' | 'custom';
  action_category: 'user' | 'booking' | 'service' | 'center' | 'staff' | 'payment' | 'report' | 'system' | 'security' | 'configuration';
  target_type: 'user' | 'booking' | 'service' | 'center' | 'staff' | 'payment' | 'report' | 'setting' | 'file' | 'permission';
  target_id: number;
  target_name: string;
  description: string;
  details: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  status: 'success' | 'failure' | 'pending';
  severity: 'info' | 'warning' | 'error' | 'critical';
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
  metadata?: Record<string, any>;
}

interface AuditFilters {
  search: string;
  dateRange: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';
  startDate: string;
  endDate: string;
  user_id: string;
  user_role: string;
  action_type: string;
  action_category: string;
  target_type: string;
  status: string;
  severity: string;
}

interface AuditStats {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  criticalCount: number;
  byUser: { user_name: string; count: number }[];
  byAction: { action_type: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byHour: { hour: number; count: number }[];
  topUsers: { user_name: string; count: number }[];
  recentActivities: AuditLog[];
}

// ==================== SAMPLE DATA ====================

const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    timestamp: '2024-03-13T08:30:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'login',
    action_category: 'security',
    target_type: 'user',
    target_id: 1,
    target_name: 'Admin User',
    description: 'User logged in successfully',
    details: 'Login from 192.168.1.100 using Chrome on Windows',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info'
  },
  {
    id: 2,
    timestamp: '2024-03-13T08:35:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'create',
    action_category: 'user',
    target_type: 'user',
    target_id: 5,
    target_name: 'John Dlamini',
    description: 'New farmer account created',
    details: 'Created account for John Dlamini (john.dlamini@example.com)',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info',
    changes: [
      { field: 'full_name', old_value: null, new_value: 'John Dlamini' },
      { field: 'email', old_value: null, new_value: 'john.dlamini@example.com' },
      { field: 'role', old_value: null, new_value: 'farmer' }
    ]
  },
  {
    id: 3,
    timestamp: '2024-03-13T09:15:00Z',
    user_id: 2,
    user_name: 'John Dlamini',
    user_email: 'john.dlamini@example.com',
    user_role: 'farmer',
    action_type: 'create',
    action_category: 'booking',
    target_type: 'booking',
    target_id: 123,
    target_name: 'Booking #123',
    description: 'New booking created',
    details: 'Created booking for tractor service at Mbabane East',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info'
  },
  {
    id: 4,
    timestamp: '2024-03-13T09:45:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'update',
    action_category: 'booking',
    target_type: 'booking',
    target_id: 123,
    target_name: 'Booking #123',
    description: 'Booking status updated',
    details: 'Changed booking status from pending to confirmed',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info',
    changes: [
      { field: 'status', old_value: 'pending', new_value: 'confirmed' },
      { field: 'admin_notes', old_value: null, new_value: 'Tractor assigned: RDA-001' }
    ]
  },
  {
    id: 5,
    timestamp: '2024-03-13T10:00:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'export',
    action_category: 'report',
    target_type: 'report',
    target_id: 1,
    target_name: 'Monthly Report',
    description: 'Report exported',
    details: 'Exported monthly summary report as PDF',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info'
  },
  {
    id: 6,
    timestamp: '2024-03-13T10:30:00Z',
    user_id: 2,
    user_name: 'John Dlamini',
    user_email: 'john.dlamini@example.com',
    user_role: 'farmer',
    action_type: 'view',
    action_category: 'booking',
    target_type: 'booking',
    target_id: 123,
    target_name: 'Booking #123',
    description: 'Booking viewed',
    details: 'Viewed booking details',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info'
  },
  {
    id: 7,
    timestamp: '2024-03-13T11:00:00Z',
    user_id: 3,
    user_name: 'Mary Nkosi',
    user_email: 'mary.nkosi@example.com',
    user_role: 'farmer',
    action_type: 'login',
    action_category: 'security',
    target_type: 'user',
    target_id: 3,
    target_name: 'Mary Nkosi',
    description: 'Failed login attempt',
    details: 'Invalid password entered',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Android; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0',
    location: 'Manzini, Eswatini',
    status: 'failure',
    severity: 'warning'
  },
  {
    id: 8,
    timestamp: '2024-03-13T11:30:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'delete',
    action_category: 'user',
    target_type: 'user',
    target_id: 6,
    target_name: 'Test User',
    description: 'User account deleted',
    details: 'Deleted inactive user account',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'warning',
    changes: [
      { field: 'status', old_value: 'active', new_value: 'deleted' }
    ]
  },
  {
    id: 9,
    timestamp: '2024-03-13T12:00:00Z',
    user_id: 4,
    user_name: 'Peter Mamba',
    user_email: 'peter.mamba@example.com',
    user_role: 'staff',
    action_type: 'create',
    action_category: 'service',
    target_type: 'service',
    target_id: 25,
    target_name: 'Irrigation Service',
    description: 'New service created',
    details: 'Added irrigation installation service',
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: 'Siteki, Eswatini',
    status: 'success',
    severity: 'info'
  },
  {
    id: 10,
    timestamp: '2024-03-13T12:30:00Z',
    user_id: 1,
    user_name: 'Admin User',
    user_email: 'admin@rda.co.sz',
    user_role: 'admin',
    action_type: 'update',
    action_category: 'center',
    target_type: 'center',
    target_id: 1,
    target_name: 'Mbabane East',
    description: 'Center information updated',
    details: 'Updated contact number and email',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info',
    changes: [
      { field: 'contact_number', old_value: '+268 2404 5678', new_value: '+268 2404 5679' },
      { field: 'email', old_value: 'mbabane.east@old.co.sz', new_value: 'mbabane.east@rda.co.sz' }
    ]
  },
  {
    id: 11,
    timestamp: '2024-03-13T13:00:00Z',
    user_id: 5,
    user_name: 'System',
    user_email: 'system@rda.co.sz',
    user_role: 'admin',
    action_type: 'custom',
    action_category: 'system',
    target_type: 'setting',
    target_id: 1,
    target_name: 'System Backup',
    description: 'Automatic backup completed',
    details: 'System backup completed successfully',
    ip_address: '127.0.0.1',
    user_agent: 'System Cron Job',
    status: 'success',
    severity: 'info'
  },
  {
    id: 12,
    timestamp: '2024-03-13T14:00:00Z',
    user_id: 2,
    user_name: 'John Dlamini',
    user_email: 'john.dlamini@example.com',
    user_role: 'farmer',
    action_type: 'download',
    action_category: 'user',
    target_type: 'file',
    target_id: 45,
    target_name: 'Invoice #123',
    description: 'Invoice downloaded',
    details: 'Downloaded booking invoice as PDF',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    location: 'Mbabane, Eswatini',
    status: 'success',
    severity: 'info'
  }
];

const SAMPLE_STATS: AuditStats = {
  totalLogs: 1250,
  successCount: 1150,
  failureCount: 75,
  pendingCount: 25,
  infoCount: 950,
  warningCount: 200,
  errorCount: 80,
  criticalCount: 20,
  byUser: [
    { user_name: 'Admin User', count: 450 },
    { user_name: 'John Dlamini', count: 180 },
    { user_name: 'Mary Nkosi', count: 120 },
    { user_name: 'Peter Mamba', count: 95 },
    { user_name: 'System', count: 85 }
  ],
  byAction: [
    { action_type: 'login', count: 320 },
    { action_type: 'view', count: 280 },
    { action_type: 'create', count: 210 },
    { action_type: 'update', count: 185 },
    { action_type: 'delete', count: 75 }
  ],
  byCategory: [
    { category: 'user', count: 380 },
    { category: 'booking', count: 320 },
    { category: 'security', count: 210 },
    { category: 'center', count: 150 },
    { category: 'service', count: 120 }
  ],
  byHour: [
    { hour: 8, count: 85 },
    { hour: 9, count: 120 },
    { hour: 10, count: 145 },
    { hour: 11, count: 130 },
    { hour: 12, count: 95 },
    { hour: 13, count: 80 },
    { hour: 14, count: 110 },
    { hour: 15, count: 125 },
    { hour: 16, count: 140 },
    { hour: 17, count: 90 }
  ],
  topUsers: [
    { user_name: 'Admin User', count: 450 },
    { user_name: 'John Dlamini', count: 180 },
    { user_name: 'Mary Nkosi', count: 120 }
  ],
  recentActivities: SAMPLE_AUDIT_LOGS.slice(0, 5)
};

const ACTION_TYPES = [
  'create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import',
  'download', 'upload', 'approve', 'reject', 'cancel', 'complete', 'pending',
  'confirm', 'assign', 'unassign', 'enable', 'disable', 'lock', 'unlock',
  'reset', 'change', 'custom'
];

const ACTION_CATEGORIES = [
  'user', 'booking', 'service', 'center', 'staff', 'payment', 'report',
  'system', 'security', 'configuration'
];

const TARGET_TYPES = [
  'user', 'booking', 'service', 'center', 'staff', 'payment', 'report',
  'setting', 'file', 'permission'
];

const SEVERITY_LEVELS = [
  { value: 'info', label: 'Info', color: 'blue' },
  { value: 'warning', label: 'Warning', color: 'yellow' },
  { value: 'error', label: 'Error', color: 'red' },
  { value: 'critical', label: 'Critical', color: 'purple' }
];

const STATUS_OPTIONS = [
  { value: 'success', label: 'Success', color: 'green' },
  { value: 'failure', label: 'Failure', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' }
];

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

// ==================== STAT CARD COMPONENT ====================

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
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`text-xl ${color}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          <FaArrowRight className={`ml-1 ${trend >= 0 ? 'rotate-45' : '-rotate-45'}`} />
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
    <p className="text-sm text-gray-500">{title}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
  </div>
);

// ==================== AUDIT LOG DETAILS MODAL ====================

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

const AuditLogDetailsModal = ({ log, onClose }: AuditLogDetailsModalProps) => {
  if (!log) return null;

  const getSeverityColor = () => {
    switch (log.severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    switch (log.status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = () => {
    switch (log.action_type) {
      case 'create': return <FaPlus className="text-green-600" />;
      case 'update': return <FaEdit className="text-blue-600" />;
      case 'delete': return <FaTrash className="text-red-600" />;
      case 'view': return <FaEye className="text-gray-600" />;
      case 'login': return <FaSignInAlt className="text-green-600" />;
      case 'logout': return <FaSignOutAlt className="text-orange-600" />;
      case 'export': return <FaDownload className="text-purple-600" />;
      case 'download': return <FaDownloadIcon className="text-indigo-600" />;
      case 'upload': return <FaUpload className="text-cyan-600" />;
      default: return <FaHistory className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                log.severity === 'critical' ? 'bg-purple-100' :
                log.severity === 'error' ? 'bg-red-100' :
                log.severity === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {getActionIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Log Details</h2>
                <p className="text-gray-500">Log ID: #{log.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex space-x-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor()}`}>
              {log.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {log.status}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {log.action_type}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {log.action_category}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-green-600" />
                Basic Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Description:</span> {log.description}</p>
                <p><span className="text-gray-500">Details:</span> {log.details}</p>
                <p><span className="text-gray-500">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}</p>
                <p><span className="text-gray-500">Target:</span> {log.target_name} (ID: {log.target_id})</p>
                <p><span className="text-gray-500">Target Type:</span> {log.target_type}</p>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaUser className="mr-2 text-green-600" />
                User Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {log.user_name}</p>
                <p><span className="text-gray-500">Email:</span> {log.user_email}</p>
                <p><span className="text-gray-500">Role:</span> {log.user_role}</p>
                <p><span className="text-gray-500">User ID:</span> {log.user_id}</p>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-600" />
                Location Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">IP Address:</span> {log.ip_address}</p>
                {log.location && <p><span className="text-gray-500">Location:</span> {log.location}</p>}
                <p><span className="text-gray-500">User Agent:</span> <span className="text-xs">{log.user_agent}</span></p>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaDatabase className="mr-2 text-green-600" />
                Metadata
              </h3>
              <div className="space-y-2 text-sm">
                {log.metadata && Object.entries(log.metadata).map(([key, value]) => (
                  <p key={key}><span className="text-gray-500">{key}:</span> {String(value)}</p>
                ))}
                {!log.metadata && <p className="text-gray-400">No additional metadata</p>}
              </div>
            </div>
          </div>

          {/* Changes */}
          {log.changes && log.changes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Changes Made</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {log.changes.map((change, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                      <p className="text-sm font-medium text-gray-700 mb-2">{change.field}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Old Value:</p>
                          <p className="text-gray-900 bg-white p-2 rounded mt-1">
                            {change.old_value !== null ? String(change.old_value) : '<empty>'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">New Value:</p>
                          <p className="text-gray-900 bg-white p-2 rounded mt-1">
                            {change.new_value !== null ? String(change.new_value) : '<empty>'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminAuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>(SAMPLE_AUDIT_LOGS);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(SAMPLE_AUDIT_LOGS);
  const [stats, setStats] = useState<AuditStats>(SAMPLE_STATS);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    user_id: 'all',
    user_role: 'all',
    action_type: 'all',
    action_category: 'all',
    target_type: 'all',
    status: 'all',
    severity: 'all'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredLogs.length / itemsPerPage));
  }, [filteredLogs, itemsPerPage]);

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
      await fetchAuditData(token);
      
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch audit logs
      const logsRes = await axios.get(`${API_URL}/api/admin/audit/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (logsRes.data?.logs) {
        setLogs(logsRes.data.logs);
        setFilteredLogs(logsRes.data.logs);
      }

      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/api/admin/audit/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.data) {
        setStats(statsRes.data);
      }

    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.success('Using sample data (API connection failed)');
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.user_name.toLowerCase().includes(term) ||
        log.user_email.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.target_name.toLowerCase().includes(term) ||
        log.ip_address.includes(term)
      );
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(log => new Date(log.timestamp) >= today);
        break;
      case 'yesterday':
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= yesterday && logDate < today;
        });
        break;
      case 'thisWeek':
        filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(weekAgo);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= lastWeekStart && logDate < weekAgo;
        });
        break;
      case 'thisMonth':
        filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(monthAgo);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= lastMonthStart && logDate < monthAgo;
        });
        break;
      case 'thisYear':
        filtered = filtered.filter(log => new Date(log.timestamp) >= yearAgo);
        break;
      case 'lastYear':
        const lastYearStart = new Date(yearAgo);
        lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= lastYearStart && logDate < yearAgo;
        });
        break;
      case 'custom':
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
          });
        }
        break;
    }

    // User role filter
    if (filters.user_role !== 'all') {
      filtered = filtered.filter(log => log.user_role === filters.user_role);
    }

    // Action type filter
    if (filters.action_type !== 'all') {
      filtered = filtered.filter(log => log.action_type === filters.action_type);
    }

    // Action category filter
    if (filters.action_category !== 'all') {
      filtered = filtered.filter(log => log.action_category === filters.action_category);
    }

    // Target type filter
    if (filters.target_type !== 'all') {
      filtered = filtered.filter(log => log.target_type === filters.target_type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: 'thisMonth',
      startDate: '',
      endDate: '',
      user_id: 'all',
      user_role: 'all',
      action_type: 'all',
      action_category: 'all',
      target_type: 'all',
      status: 'all',
      severity: 'all'
    });
    setShowCustomDate(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Email', 'Role', 'Action', 'Category', 'Target', 'Description', 'Status', 'Severity', 'IP Address'];
    const data = filteredLogs.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString(),
      log.user_name,
      log.user_email,
      log.user_role,
      log.action_type,
      log.action_category,
      log.target_name,
      log.description,
      log.status,
      log.severity,
      log.ip_address
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  const exportToPDF = () => {
    toast.success('PDF export feature coming soon');
  };

  const exportToExcel = () => {
    toast.success('Excel export feature coming soon');
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800'
    };
    return config[severity as keyof typeof config] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const config = {
      success: 'bg-green-100 text-green-800',
      failure: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return config[status as keyof typeof config] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <FaPlus className="text-green-600" />;
      case 'update': return <FaEdit className="text-blue-600" />;
      case 'delete': return <FaTrash className="text-red-600" />;
      case 'login': return <FaSignInAlt className="text-green-600" />;
      case 'logout': return <FaSignOutAlt className="text-orange-600" />;
      case 'export': return <FaDownload className="text-purple-600" />;
      case 'download': return <FaDownloadIcon className="text-indigo-600" />;
      case 'upload': return <FaUpload className="text-cyan-600" />;
      default: return <FaHistory className="text-gray-600" />;
    }
  };

  const currentItems = getCurrentPageItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <FaHistory className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-2xl animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg mt-4">Loading audit logs...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-sm text-gray-500">Track all system activities and changes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
              >
                <FaFileCsv className="mr-2" />
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
              >
                <FaFileExcel className="mr-2" />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
              >
                <FaFilePdf className="mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Logs"
            value={stats.totalLogs}
            icon={FaHistory}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Success"
            value={stats.successCount}
            icon={FaCheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Failures"
            value={stats.failureCount}
            icon={FaTimesCircle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            title="Critical"
            value={stats.criticalCount}
            icon={FaExclamationTriangle}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {(filters.search || filters.dateRange !== 'thisMonth' || filters.user_role !== 'all' || 
              filters.action_type !== 'all' || filters.status !== 'all' || filters.severity !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, email, description, IP..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => {
                    const value = e.target.value as AuditFilters['dateRange'];
                    setFilters({ ...filters, dateRange: value });
                    setShowCustomDate(value === 'custom');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  {DATE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {showCustomDate && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={filters.user_role}
                  onChange={(e) => setFilters({ ...filters, user_role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="farmer">Farmer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={filters.action_type}
                  onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Actions</option>
                  {ACTION_TYPES.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.action_category}
                  onChange={(e) => setFilters({ ...filters, action_category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Categories</option>
                  {ACTION_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Type
                </label>
                <select
                  value={filters.target_type}
                  onChange={(e) => setFilters({ ...filters, target_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Targets</option>
                  {TARGET_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Severity</option>
                  {SEVERITY_LEVELS.map(sev => (
                    <option key={sev.value} value={sev.value}>{sev.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{currentItems.length}</span> of{' '}
            <span className="font-bold">{filteredLogs.length}</span> audit logs
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
            <p className="text-gray-500 mb-6">No logs match your current filters.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {log.user_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                            <div className="text-xs text-gray-500">{log.user_role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getActionIcon(log.action_type)}</span>
                          <span className="text-sm text-gray-900">{log.action_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.action_category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.target_name}</div>
                        <div className="text-xs text-gray-500">{log.target_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
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

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}