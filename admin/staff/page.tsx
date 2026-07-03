'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { toast, Toaster } from 'react-hot-toast';
import { 
  FaUsers,
  FaUserPlus,
  FaUserEdit,
  FaUserTimes,
  FaUserCheck,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaRegBuilding,
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
  FaHandsHelping
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface Staff {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  center_id: number;
  center_name: string;
  center_region: string;
  hire_date: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  supervisor_id?: number;
  supervisor_name?: string;
  qualifications: string[];
  specializations: string[];
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  city: string;
  postal_code: string;
  profile_image?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface StaffFilters {
  search: string;
  center_id: string;
  role: string;
  department: string;
  status: string;
  employment_type: string;
  region: string;
}

interface Stats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  terminated: number;
  byCenter: { center_name: string; count: number }[];
  byRole: { role: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  recentHires: Staff[];
}

interface Center {
  id: number;
  name: string;
  region: string;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_STAFF: Staff[] = [
  {
    id: 1,
    full_name: 'Dr. James Dlamini',
    email: 'james.dlamini@rda.co.sz',
    phone: '+268 7612 3001',
    role: 'Center Manager',
    department: 'Management',
    position: 'Senior Manager',
    center_id: 1,
    center_name: 'Mbabane East',
    center_region: 'Hhohho',
    hire_date: '2020-03-15',
    employment_type: 'full-time',
    status: 'active',
    supervisor_id: 5,
    supervisor_name: 'Thabo Mamba',
    qualifications: ['MBA', 'BSc Agriculture'],
    specializations: ['Farm Management', 'Operations'],
    emergency_contact: {
      name: 'Mary Dlamini',
      relationship: 'Spouse',
      phone: '+268 7612 4001'
    },
    address: '123 Green Valley',
    city: 'Mbabane',
    postal_code: 'H100',
    last_login: '2024-03-12T08:30:00Z',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-03-01T10:15:00Z'
  },
  {
    id: 2,
    full_name: 'Sipho Nkosi',
    email: 'sipho.nkosi@rda.co.sz',
    phone: '+268 7612 3002',
    role: 'Tractor Operator',
    department: 'Operations',
    position: 'Senior Operator',
    center_id: 1,
    center_name: 'Mbabane East',
    center_region: 'Hhohho',
    hire_date: '2021-06-10',
    employment_type: 'full-time',
    status: 'active',
    qualifications: ['Tractor License', 'Mechanical Certification'],
    specializations: ['Tractor Operation', 'Maintenance'],
    emergency_contact: {
      name: 'Nosipho Nkosi',
      relationship: 'Spouse',
      phone: '+268 7612 4002'
    },
    address: '456 Hill Street',
    city: 'Mbabane',
    postal_code: 'H101',
    last_login: '2024-03-12T07:45:00Z',
    created_at: '2021-01-01T00:00:00Z',
    updated_at: '2024-02-15T14:20:00Z'
  },
  {
    id: 3,
    full_name: 'Mary Mamba',
    email: 'mary.mamba@rda.co.sz',
    phone: '+268 7612 3003',
    role: 'Agricultural Officer',
    department: 'Extension Services',
    position: 'Senior Officer',
    center_id: 2,
    center_name: 'Manzini North',
    center_region: 'Manzini',
    hire_date: '2019-11-05',
    employment_type: 'full-time',
    status: 'active',
    qualifications: ['BSc Agriculture', 'Diploma in Extension'],
    specializations: ['Crop Production', 'Farmer Training'],
    emergency_contact: {
      name: 'Peter Mamba',
      relationship: 'Spouse',
      phone: '+268 7612 4003'
    },
    address: '789 Industrial Road',
    city: 'Manzini',
    postal_code: 'M200',
    last_login: '2024-03-11T16:20:00Z',
    created_at: '2019-01-01T00:00:00Z',
    updated_at: '2024-03-10T09:30:00Z'
  },
  {
    id: 4,
    full_name: 'Thabo Mamba',
    email: 'thabo.mamba@rda.co.sz',
    phone: '+268 7612 3004',
    role: 'Regional Coordinator',
    department: 'Management',
    position: 'Regional Manager',
    center_id: 3,
    center_name: 'Nhlangano',
    center_region: 'Shiselweni',
    hire_date: '2018-08-20',
    employment_type: 'full-time',
    status: 'active',
    qualifications: ['MSc Agriculture', 'MBA'],
    specializations: ['Regional Planning', 'Team Leadership'],
    emergency_contact: {
      name: 'Nomsa Mamba',
      relationship: 'Spouse',
      phone: '+268 7612 4004'
    },
    address: '321 Valley View',
    city: 'Nhlangano',
    postal_code: 'S300',
    last_login: '2024-03-12T09:15:00Z',
    created_at: '2018-01-01T00:00:00Z',
    updated_at: '2024-03-05T11:45:00Z'
  },
  {
    id: 5,
    full_name: 'Nosipho Dlamini',
    email: 'nosipho.dlamini@rda.co.sz',
    phone: '+268 7612 3005',
    role: 'Veterinary Officer',
    department: 'Veterinary Services',
    position: 'Senior Veterinarian',
    center_id: 4,
    center_name: 'Siteki',
    center_region: 'Lubombo',
    hire_date: '2020-01-15',
    employment_type: 'full-time',
    status: 'on-leave',
    qualifications: ['DVM', 'MSc Animal Science'],
    specializations: ['Livestock Health', 'Vaccination Programs'],
    emergency_contact: {
      name: 'Sipho Dlamini',
      relationship: 'Spouse',
      phone: '+268 7612 4005'
    },
    address: '654 Eastern Road',
    city: 'Siteki',
    postal_code: 'L400',
    last_login: '2024-03-10T13:30:00Z',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-03-08T08:20:00Z'
  },
  {
    id: 6,
    full_name: 'Peter Nkosi',
    email: 'peter.nkosi@rda.co.sz',
    phone: '+268 7612 3006',
    role: 'Equipment Technician',
    department: 'Maintenance',
    position: 'Technician',
    center_id: 2,
    center_name: 'Manzini North',
    center_region: 'Manzini',
    hire_date: '2022-03-01',
    employment_type: 'full-time',
    status: 'active',
    qualifications: ['Mechanical Engineering Diploma'],
    specializations: ['Tractor Repair', 'Equipment Maintenance'],
    emergency_contact: {
      name: 'Thandi Nkosi',
      relationship: 'Spouse',
      phone: '+268 7612 4006'
    },
    address: '987 Workshop Street',
    city: 'Manzini',
    postal_code: 'M201',
    last_login: '2024-03-11T10:45:00Z',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2024-02-28T15:30:00Z'
  }
];

const SAMPLE_CENTERS: Center[] = [
  { id: 1, name: 'Mbabane East', region: 'Hhohho' },
  { id: 2, name: 'Mbabane West', region: 'Hhohho' },
  { id: 3, name: 'Manzini North', region: 'Manzini' },
  { id: 4, name: 'Manzini South', region: 'Manzini' },
  { id: 5, name: 'Nhlangano', region: 'Shiselweni' },
  { id: 6, name: 'Hlatikhulu', region: 'Shiselweni' },
  { id: 7, name: 'Siteki', region: 'Lubombo' },
  { id: 8, name: 'Mhlume', region: 'Lubombo' }
];

const SAMPLE_STATS: Stats = {
  totalStaff: 87,
  activeStaff: 72,
  onLeave: 8,
  terminated: 7,
  byCenter: [
    { center_name: 'Mbabane East', count: 12 },
    { center_name: 'Manzini North', count: 10 },
    { center_name: 'Nhlangano', count: 8 },
    { center_name: 'Siteki', count: 7 }
  ],
  byRole: [
    { role: 'Center Manager', count: 15 },
    { role: 'Tractor Operator', count: 24 },
    { role: 'Agricultural Officer', count: 18 },
    { role: 'Veterinary Officer', count: 12 }
  ],
  byDepartment: [
    { department: 'Management', count: 8 },
    { department: 'Operations', count: 32 },
    { department: 'Extension Services', count: 24 },
    { department: 'Veterinary Services', count: 15 }
  ],
  recentHires: SAMPLE_STAFF.slice(0, 3)
};

const DEPARTMENTS = [
  'Management',
  'Operations',
  'Extension Services',
  'Veterinary Services',
  'Maintenance',
  'Administration',
  'Finance',
  'Human Resources',
  'IT Support'
];

const ROLES = [
  'Center Manager',
  'Regional Coordinator',
  'Tractor Operator',
  'Agricultural Officer',
  'Veterinary Officer',
  'Equipment Technician',
  'Administrative Assistant',
  'Finance Officer',
  'HR Officer',
  'IT Specialist'
];

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'temporary'
];

const STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'on-leave', label: 'On Leave', color: 'yellow' },
  { value: 'terminated', label: 'Terminated', color: 'red' }
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
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>}
  </div>
);

// ==================== STAFF CARD COMPONENT ====================

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onView: (staff: Staff) => void;
}

const StaffCard = ({ staff, onEdit, onDelete, onView }: StaffCardProps) => {
  const getStatusColor = () => {
    switch (staff.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = () => {
    switch (staff.employment_type) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'temporary': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {staff.profile_image ? (
            <img
              src={staff.profile_image}
              alt={staff.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {staff.full_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{staff.full_name}</h3>
              <p className="text-sm text-gray-500">{staff.position}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {staff.status.replace('-', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor()}`}>
                {staff.employment_type.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm text-gray-600">
              <FaBuilding className="mr-2 text-gray-400" />
              {staff.center_name}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              {staff.center_region}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaPhone className="mr-2 text-gray-400" />
              {staff.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaEnvelope className="mr-2 text-gray-400" />
              <span className="truncate">{staff.email}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {staff.specializations.slice(0, 2).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
            {staff.specializations.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{staff.specializations.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onView(staff)}
            className="p-2 text-gray-400 hover:text-blue-600 transition"
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(staff)}
            className="p-2 text-gray-400 hover:text-green-600 transition"
            title="Edit Staff"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(staff)}
            className="p-2 text-gray-400 hover:text-red-600 transition"
            title="Delete Staff"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Hired: {new Date(staff.hire_date).toLocaleDateString()}</span>
        {staff.last_login && (
          <span>Last login: {new Date(staff.last_login).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

// ==================== STAFF DETAILS MODAL ====================

interface StaffDetailsModalProps {
  staff: Staff | null;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
}

const StaffDetailsModal = ({ staff, onClose, onEdit }: StaffDetailsModalProps) => {
  if (!staff) return null;

  const getStatusColor = () => {
    switch (staff.status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'on-leave': return 'text-yellow-600 bg-yellow-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              {staff.profile_image ? (
                <img
                  src={staff.profile_image}
                  alt={staff.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {staff.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{staff.full_name}</h2>
                <p className="text-gray-500">{staff.position} • {staff.department}</p>
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {staff.status.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {staff.employment_type.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              ID: #{staff.id}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaUserCircle className="mr-2 text-green-600" />
                Personal Information
              </h3>
              <div className="space-y-2 text-sm text-black">
                <p><span className="text-gray-500">Full Name:</span> {staff.full_name}</p>
                <p><span className="text-gray-500">Email:</span> {staff.email}</p>
                <p><span className="text-gray-500">Phone:</span> {staff.phone}</p>
                <p><span className="text-gray-500">Address:</span> {staff.address}, {staff.city} {staff.postal_code}</p>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaBriefcase className="mr-2 text-green-600" />
                Employment Details
              </h3>
              <div className="space-y-2 text-sm text-black">
                <p><span className="text-gray-500">Role:</span> {staff.role}</p>
                <p><span className="text-gray-500">Department:</span> {staff.department}</p>
                <p><span className="text-gray-500">Position:</span> {staff.position}</p>
                <p><span className="text-gray-500">Hire Date:</span> {new Date(staff.hire_date).toLocaleDateString()}</p>
                <p><span className="text-gray-500">Employment Type:</span> {staff.employment_type.replace('-', ' ')}</p>
                {staff.supervisor_name && (
                  <p><span className="text-gray-500">Supervisor:</span> {staff.supervisor_name}</p>
                )}
              </div>
            </div>

            {/* Center Assignment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaBuilding className="mr-2 text-green-600" />
                Center Assignment
              </h3>
              <div className="space-y-2 text-sm text-black">
                <p><span className="text-gray-500">Center:</span> {staff.center_name}</p>
                <p><span className="text-gray-500">Region:</span> {staff.center_region}</p>
                <p><span className="text-gray-500">Center ID:</span> {staff.center_id}</p>
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaGraduationCap className="mr-2 text-green-600" />
                Qualifications
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Education:</span></p>
                <ul className="list-disc list-inside pl-2">
                  {staff.qualifications.map((qual, index) => (
                    <li key={index} className="text-gray-700">{qual}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaStar className="mr-2 text-green-600" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaHeart className="mr-2 text-green-600" />
                Emergency Contact
              </h3>
              <div className="space-y-2 text-sm text-black">
                <p><span className="text-gray-500">Name:</span> {staff.emergency_contact.name}</p>
                <p><span className="text-gray-500">Relationship:</span> {staff.emergency_contact.relationship}</p>
                <p><span className="text-gray-500">Phone:</span> {staff.emergency_contact.phone}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
            <span>Created: {new Date(staff.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(staff.updated_at).toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit(staff);
                onClose();
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF FORM MODAL ====================

interface StaffFormModalProps {
  staff: Staff | null;
  onClose: () => void;
  onSave: (staff: Staff) => void;
}

const StaffFormModal = ({ staff, onClose, onSave }: StaffFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Staff>>(
    staff || {
      full_name: '',
      email: '',
      phone: '',
      role: 'Tractor Operator',
      department: 'Operations',
      position: '',
      center_id: 1,
      center_name: 'Mbabane East',
      center_region: 'Hhohho',
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: 'full-time',
      status: 'active',
      qualifications: [],
      specializations: [],
      emergency_contact: {
        name: '',
        relationship: '',
        phone: ''
      },
      address: '',
      city: '',
      postal_code: ''
    }
  );
  const [loading, setLoading] = useState(false);
  const [newQualification, setNewQualification] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergency_contact: {
        ...(prev.emergency_contact || { name: '', relationship: '', phone: '' }),
        [name]: value
      }
    }));
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStaff: Staff = {
        id: staff?.id || Math.floor(Math.random() * 1000) + 100,
        full_name: formData.full_name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        role: formData.role || 'Tractor Operator',
        department: formData.department || 'Operations',
        position: formData.position || formData.role || '',
        center_id: formData.center_id || 1,
        center_name: formData.center_name || 'Mbabane East',
        center_region: formData.center_region || 'Hhohho',
        hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
        employment_type: formData.employment_type as any || 'full-time',
        status: formData.status as any || 'active',
        supervisor_id: formData.supervisor_id,
        supervisor_name: formData.supervisor_name,
        qualifications: formData.qualifications || [],
        specializations: formData.specializations || [],
        emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
        address: formData.address || '',
        city: formData.city || '',
        postal_code: formData.postal_code || '',
        created_at: staff?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onSave(newStaff);
      toast.success(staff ? 'Staff updated successfully' : 'Staff added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {staff ? 'Edit Staff' : 'Add New Staff'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaUserCircle className="mr-2 text-green-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-green-600" />
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Senior Manager"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    {EMPLOYMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Center Assignment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaBuilding className="mr-2 text-green-600" />
                Center Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center
                  </label>
                  <select
                    name="center_id"
                    value={formData.center_id}
                    onChange={(e) => {
                      const centerId = parseInt(e.target.value);
                      const center = SAMPLE_CENTERS.find(c => c.id === centerId);
                      setFormData(prev => ({
                        ...prev,
                        center_id: centerId,
                        center_name: center?.name || '',
                        center_region: center?.region || ''
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  >
                    {SAMPLE_CENTERS.map(center => (
                      <option key={center.id} value={center.id}>{center.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-600" />
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-green-600" />
                Qualifications
              </h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="Add qualification (e.g., BSc Agriculture)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.qualifications?.map((qual, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaStar className="mr-2 text-green-600" />
                Specializations
              </h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add specialization (e.g., Tractor Operation)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations?.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialization(index)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaHeart className="mr-2 text-green-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.emergency_contact?.name}
                    onChange={handleEmergencyContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.emergency_contact?.relationship}
                    onChange={handleEmergencyContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.emergency_contact?.phone}
                    onChange={handleEmergencyContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {staff ? 'Update Staff' : 'Add Staff'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================

interface DeleteConfirmModalProps {
  staff: Staff | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ staff, onClose, onConfirm }: DeleteConfirmModalProps) => {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Staff</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {staff.full_name}? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminStaffPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [staff, setStaff] = useState<Staff[]>(SAMPLE_STAFF);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(SAMPLE_STAFF);
  const [stats, setStats] = useState<Stats>(SAMPLE_STATS);
  const [centers, setCenters] = useState<Center[]>(SAMPLE_CENTERS);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    center_id: 'all',
    role: 'all',
    department: 'all',
    status: 'all',
    employment_type: 'all',
    region: 'all'
  });
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staff, filters]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredStaff.length / itemsPerPage));
  }, [filteredStaff, itemsPerPage]);

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
      await fetchStaffData(token);
      
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch staff data
      const staffRes = await axios.get(`${API_URL}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (staffRes.data?.staff) {
        setStaff(staffRes.data.staff);
        setFilteredStaff(staffRes.data.staff);
      }

      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/api/admin/staff/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.data) {
        setStats(statsRes.data);
      }

    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.success('Using sample data (API connection failed)');
    }
  };

  const applyFilters = () => {
    let filtered = [...staff];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.full_name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.includes(term) ||
        s.role.toLowerCase().includes(term) ||
        s.department.toLowerCase().includes(term)
      );
    }

    // Center filter
    if (filters.center_id !== 'all') {
      filtered = filtered.filter(s => s.center_id === parseInt(filters.center_id));
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(s => s.role === filters.role);
    }

    // Department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(s => s.department === filters.department);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    // Employment type filter
    if (filters.employment_type !== 'all') {
      filtered = filtered.filter(s => s.employment_type === filters.employment_type);
    }

    // Region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter(s => s.center_region === filters.region);
    }

    setFilteredStaff(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      center_id: 'all',
      role: 'all',
      department: 'all',
      status: 'all',
      employment_type: 'all',
      region: 'all'
    });
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaff([newStaff, ...staff]);
    toast.success('Staff added successfully');
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    toast.success('Staff updated successfully');
  };

  const handleDeleteStaff = () => {
    if (selectedStaff) {
      setStaff(staff.filter(s => s.id !== selectedStaff.id));
      toast.success('Staff deleted successfully');
      setShowDeleteModal(false);
      setSelectedStaff(null);
    }
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDetailsModal(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowFormModal(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Center', 'Region', 'Status', 'Hire Date'];
    const data = filteredStaff.map(s => [
      s.id,
      s.full_name,
      s.email,
      s.phone,
      s.role,
      s.department,
      s.center_name,
      s.center_region,
      s.status,
      new Date(s.hire_date).toLocaleDateString()
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Staff data exported');
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  };

  const currentItems = getCurrentPageItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <FaUsers className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-2xl animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg mt-4">Loading staff data...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-sm text-gray-500">Manage center staff and personnel</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={() => {
                  setSelectedStaff(null);
                  setShowFormModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm"
              >
                <FaUserPlus className="mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Staff"
            value={stats.totalStaff}
            icon={FaUsers}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend={5}
            trendLabel="vs last month"
          />
          <StatCard
            title="Active Staff"
            value={stats.activeStaff}
            icon={FaUserCheck}
            color="text-green-600"
            bgColor="bg-green-100"
            trend={3}
            trendLabel="vs last month"
          />
          <StatCard
            title="On Leave"
            value={stats.onLeave}
            icon={FaClock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
          <StatCard
            title="Terminated"
            value={stats.terminated}
            icon={FaUserTimes}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {(filters.search || filters.center_id !== 'all' || filters.role !== 'all' || filters.status !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
            </div>

            {/* Center Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Center
              </label>
              <select
                value={filters.center_id}
                onChange={(e) => setFilters({ ...filters, center_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Centers</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Roles</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
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
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Employment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={filters.employment_type}
                onChange={(e) => setFilters({ ...filters, employment_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Types</option>
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              >
                <option value="all">All Regions</option>
                <option value="Hhohho">Hhohho</option>
                <option value="Manzini">Manzini</option>
                <option value="Shiselweni">Shiselweni</option>
                <option value="Lubombo">Lubombo</option>
              </select>
            </div>

            {/* View Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold">{currentItems.length}</span> of{' '}
            <span className="font-bold">{filteredStaff.length}</span> staff members
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            >
              <option value="9">9</option>
              <option value="18">18</option>
              <option value="27">27</option>
              <option value="36">36</option>
            </select>
          </div>
        </div>

        {/* Staff Grid/Table */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Staff Found</h3>
            <p className="text-gray-500 mb-6">No staff members match your current filters.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map(staff => (
              <StaffCard
                key={staff.id}
                staff={staff}
                onView={handleViewStaff}
                onEdit={handleEditStaff}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {staff.profile_image ? (
                              <img
                                src={staff.profile_image}
                                alt={staff.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {staff.full_name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.full_name}</div>
                            <div className="text-sm text-gray-500">{staff.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.phone}</div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.role}</div>
                        <div className="text-sm text-gray-500">{staff.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.center_name}</div>
                        <div className="text-sm text-gray-500">{staff.center_region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          staff.status === 'active' ? 'bg-green-100 text-green-800' :
                          staff.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          staff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {staff.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(staff.hire_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewStaff(staff)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditStaff(staff)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(staff)}
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
        )}

        {/* Pagination */}
        {filteredStaff.length > 0 && (
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

      {/* Modals */}
      {showDetailsModal && selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStaff(null);
          }}
          onEdit={handleEditStaff}
        />
      )}

      {showFormModal && (
        <StaffFormModal
          staff={selectedStaff}
          onClose={() => {
            setShowFormModal(false);
            setSelectedStaff(null);
          }}
          onSave={(staff) => {
            if (selectedStaff) {
              handleUpdateStaff(staff);
            } else {
              handleAddStaff(staff);
            }
          }}
        />
      )}

      {showDeleteModal && selectedStaff && (
        <DeleteConfirmModal
          staff={selectedStaff}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStaff(null);
          }}
          onConfirm={handleDeleteStaff}
        />
      )}
    </div>
  );
}