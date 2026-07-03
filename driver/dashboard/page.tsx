'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaTractor,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCamera,
  FaUpload,
  FaImage,
  FaLocationArrow,
  FaCheckDouble,
  FaHourglassHalf,
  FaArrowRight,
  FaArrowLeft,
  FaStar,
  FaComment,
  FaWifi,
  FaSync,
  FaTrash,
  FaPlus,
  
  FaRegClock,
  FaList,
  FaThLarge,
  FaDownload,
} from 'react-icons/fa';

// ==================== TYPES ====================

interface Assignment {
  id: number;
  booking_id: number;
  farmer_name: string;
  farmer_phone: string;
  farmer_email: string;
  location: string;
  location_lat?: number;
  location_lng?: number;
  scheduled_date: string;
  scheduled_time: string;
  service_type: string;
  hours_booked: number;
  tractor_model: string;
  tractor_registration: string;
  status: 'assigned' | 'accepted' | 'dispatched' | 'arrived' | 'in_progress' | 'completed_pending' | 'completed' | 'rejected';
  assigned_at: string;
  accepted_at?: string;
  dispatched_at?: string;
  arrived_at?: string;
  started_at?: string;
  completed_at?: string;
  admin_notes?: string;
  special_instructions?: string;
}

interface CompletionReport {
  booking_id: number;
  before_photos: File[];
  after_photos: File[];
  before_previews: string[];
  after_previews: string[];
  completion_notes: string;
  issues_encountered: string;
  additional_materials_used: string;
  service_duration: number;
  fuel_used?: number;
  odometer_reading?: number;
}

interface DriverProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  assigned_tractor: string;
  vehicle_registration: string;
  current_location?: {
    lat: number;
    lng: number;
    address: string;
  };
  availability: 'available' | 'busy' | 'off_duty';
  rating: number;
  total_completed_jobs: number;
}

// ==================== COMPONENTS ====================

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    assigned: { color: 'bg-blue-100 text-blue-800', icon: FaHourglassHalf, label: 'New Assignment' },
    accepted: { color: 'bg-indigo-100 text-indigo-800', icon: FaCheckCircle, label: 'Accepted' },
    dispatched: { color: 'bg-purple-100 text-purple-800', icon: FaTractor, label: 'Dispatched' },
    arrived: { color: 'bg-green-100 text-green-800', icon: FaMapMarkerAlt, label: 'Arrived' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: FaSpinner, label: 'In Progress' },
    completed_pending: { color: 'bg-orange-100 text-orange-800', icon: FaUpload, label: 'Pending Review' },
    completed: { color: 'bg-green-100 text-green-800', icon: FaCheckDouble, label: 'Completed' },
    rejected: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, label: 'Rejected' },
  };

  const { color, icon: Icon, label } = config[status] || config.assigned;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="mr-1 text-xs" /> {label}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================

export default function DriverDashboard() {
  const router = useRouter();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'active' | 'history'>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [completionReport, setCompletionReport] = useState<CompletionReport>({
    booking_id: 0,
    before_photos: [],
    after_photos: [],
    before_previews: [],
    after_previews: [],
    completion_notes: '',
    issues_encountered: '',
    additional_materials_used: '',
    service_duration: 0,
    fuel_used: 0,
    odometer_reading: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);
  const cameraInputBeforeRef = useRef<HTMLInputElement>(null);
  const cameraInputAfterRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Load driver data and assignments
  useEffect(() => {
    loadDriverData();
    checkOfflineStatus();
    
    // Set up real-time updates (WebSocket)
    setupWebSocket();
    
    return () => {
      // Cleanup WebSocket
    };
  }, []);

  const checkOfflineStatus = () => {
    if (!navigator.onLine) {
      setOfflineMode(true);
      toast.warning('You are offline. Changes will sync when connection returns.');
      
      // Load cached assignments from localStorage
      loadCachedAssignments();
    } else {
      setOfflineMode(false);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const handleOnline = () => {
    setOfflineMode(false);
    toast.success('Back online! Syncing data...');
    syncOfflineData();
    loadDriverData();
  };

  const handleOffline = () => {
    setOfflineMode(true);
    toast.warning('You are offline. Changes will be saved locally.');
  };

  const loadCachedAssignments = () => {
    const cached = localStorage.getItem('driver_assignments');
    if (cached) {
      setAssignments(JSON.parse(cached));
    }
  };

  const syncOfflineData = async () => {
    setSyncing(true);
    try {
      const pendingReports = localStorage.getItem('pending_completion_reports');
      if (pendingReports) {
        const reports = JSON.parse(pendingReports);
        for (const report of reports) {
          await submitCompletionReportSync(report);
        }
        localStorage.removeItem('pending_completion_reports');
      }
      await loadDriverData();
      toast.success('Sync completed!');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const setupWebSocket = () => {
    // WebSocket for real-time updates from admin
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // WebSocket connection would go here
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'new_assignment') {
    //     toast.info('New assignment received!');
    //     loadDriverData();
    //   }
    // };
  };

  const loadDriverData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/driver/login');
        return;
      }

      // Get driver profile
      const profileResponse = await axios.get(`${API_URL}/api/driver/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileResponse.data.success) {
        setDriver(profileResponse.data.driver);
      }

      // Get assignments
      const assignmentsResponse = await axios.get(`${API_URL}/api/driver/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (assignmentsResponse.data.success) {
        setAssignments(assignmentsResponse.data.assignments);
        // Cache assignments for offline
        localStorage.setItem('driver_assignments', JSON.stringify(assignmentsResponse.data.assignments));
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
      if (!offlineMode) {
        toast.error('Failed to load assignments. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: number, status: string, location?: any) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/driver/assignments/${assignmentId}/status`,
        { status, location, timestamp: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Status updated to ${status}`);
        loadDriverData(); // Refresh
        return true;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAcceptAssignment = async (assignment: Assignment) => {
    const success = await updateAssignmentStatus(assignment.id, 'accepted');
    if (success) {
      // Send notification to admin
      await axios.post(`${API_URL}/api/notifications/send`, {
        type: 'assignment_accepted',
        assignment_id: assignment.id,
        driver_id: driver?.id
      });
    }
  };

  const handleDispatch = async (assignment: Assignment) => {
    // Get current location (GPS)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        await updateAssignmentStatus(assignment.id, 'dispatched', location);
      }, async () => {
        await updateAssignmentStatus(assignment.id, 'dispatched');
      });
    } else {
      await updateAssignmentStatus(assignment.id, 'dispatched');
    }
  };

  const handleArrived = async (assignment: Assignment) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'At farmer\'s location',
          timestamp: new Date().toISOString()
        };
        await updateAssignmentStatus(assignment.id, 'arrived', location);
        
        // Send notification to farmer
        await axios.post(`${API_URL}/api/notifications/send`, {
          type: 'driver_arrived',
          assignment_id: assignment.id,
          farmer_phone: assignment.farmer_phone
        });
      });
    } else {
      await updateAssignmentStatus(assignment.id, 'arrived');
    }
  };

  const handleStartService = async (assignment: Assignment) => {
    await updateAssignmentStatus(assignment.id, 'in_progress');
  };

  const handlePhotoUpload = (type: 'before' | 'after', files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const previews: string[] = [];
    
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === fileArray.length) {
          if (type === 'before') {
            setCompletionReport(prev => ({
              ...prev,
              before_photos: [...prev.before_photos, ...fileArray],
              before_previews: [...prev.before_previews, ...previews]
            }));
          } else {
            setCompletionReport(prev => ({
              ...prev,
              after_photos: [...prev.after_photos, ...fileArray],
              after_previews: [...prev.after_previews, ...previews]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setCompletionReport(prev => ({
        ...prev,
        before_photos: prev.before_photos.filter((_, i) => i !== index),
        before_previews: prev.before_previews.filter((_, i) => i !== index)
      }));
    } else {
      setCompletionReport(prev => ({
        ...prev,
        after_photos: prev.after_photos.filter((_, i) => i !== index),
        after_previews: prev.after_previews.filter((_, i) => i !== index)
      }));
    }
  };

  const submitCompletionReportSync = async (report: any) => {
    const formData = new FormData();
    formData.append('booking_id', report.booking_id.toString());
    formData.append('completion_notes', report.completion_notes);
    formData.append('issues_encountered', report.issues_encountered);
    formData.append('additional_materials_used', report.additional_materials_used);
    formData.append('service_duration', report.service_duration.toString());
    formData.append('fuel_used', report.fuel_used?.toString() || '0');
    formData.append('odometer_reading', report.odometer_reading?.toString() || '0');
    
    report.before_photos.forEach((photo: File, index: number) => {
      formData.append(`before_photos[]`, photo);
    });
    report.after_photos.forEach((photo: File, index: number) => {
      formData.append(`after_photos[]`, photo);
    });
    
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/driver/submit-completion`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  };

  const handleSubmitCompletion = async () => {
    if (completionReport.before_photos.length === 0) {
      toast.error('Please take before-service photos');
      return;
    }
    if (completionReport.after_photos.length === 0) {
      toast.error('Please take after-service photos');
      return;
    }
    if (!completionReport.completion_notes) {
      toast.error('Please provide completion notes');
      return;
    }

    setSubmitting(true);
    
    try {
      if (offlineMode) {
        // Store in localStorage for later sync
        const pendingReports = localStorage.getItem('pending_completion_reports');
        const reports = pendingReports ? JSON.parse(pendingReports) : [];
        reports.push({
          ...completionReport,
          booking_id: selectedAssignment?.booking_id,
          submitted_at: new Date().toISOString()
        });
        localStorage.setItem('pending_completion_reports', JSON.stringify(reports));
        
        toast.success('Report saved locally. Will sync when online.');
        setShowCompletionModal(false);
        loadDriverData();
      } else {
        await submitCompletionReportSync(completionReport);
        
        toast.success('Completion report submitted for review!');
        setShowCompletionModal(false);
        loadDriverData();
      }
      
      // Reset form
      setCompletionReport({
        booking_id: 0,
        before_photos: [],
        after_photos: [],
        before_previews: [],
        after_previews: [],
        completion_notes: '',
        issues_encountered: '',
        additional_materials_used: '',
        service_duration: 0,
        fuel_used: 0,
        odometer_reading: 0,
      });
    } catch (error) {
      console.error('Error submitting completion:', error);
      toast.error('Failed to submit completion report');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        toast.success(`Location captured: ${position.coords.latitude}, ${position.coords.longitude}`);
        // Update driver location in backend
        updateDriverLocation(position.coords.latitude, position.coords.longitude);
      }, () => {
        toast.error('Unable to get location');
      });
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const updateDriverLocation = async (lat: number, lng: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/driver/location`, 
        { lat, lng, timestamp: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const openNavigation = (assignment: Assignment) => {
    const address = encodeURIComponent(assignment.location);
    window.open(`https://maps.google.com?q=${address}`, '_blank');
  };

  const getFilteredAssignments = () => {
    const now = new Date();
    if (activeTab === 'assignments') {
      return assignments.filter(a => 
        ['assigned', 'accepted'].includes(a.status) &&
        new Date(a.scheduled_date) >= new Date(now.setHours(0, 0, 0, 0))
      );
    } else if (activeTab === 'active') {
      return assignments.filter(a => 
        ['dispatched', 'arrived', 'in_progress', 'completed_pending'].includes(a.status)
      );
    } else {
      return assignments.filter(a => 
        ['completed', 'rejected'].includes(a.status)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaTractor className="text-3xl" />
              <div>
                <h1 className="text-2xl font-bold">Driver Portal</h1>
                <p className="text-green-100 text-sm">
                  {driver?.name} • {driver?.assigned_tractor} • {driver?.vehicle_registration}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {offlineMode && (
                <span className="flex items-center gap-1 bg-yellow-600 px-3 py-1 rounded-full text-sm">
                  <FaWifi /> Offline Mode
                </span>
              )}
              {syncing && (
                <span className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded-full text-sm">
                  <FaSync className="animate-spin" /> Syncing
                </span>
              )}
              <button
                onClick={getCurrentLocation}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-3 py-2 rounded-lg transition"
                title="Share Location"
              >
                <FaLocationArrow /> Location
              </button>
              <button
                onClick={() => router.push('/driver/logout')}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Driver Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{driver?.total_completed_jobs || 0}</div>
            <div className="text-sm text-gray-600">Completed Jobs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{driver?.rating || 0}★</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {assignments.filter(a => a.status === 'assigned').length}
            </div>
            <div className="text-sm text-gray-600">New Assignments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{driver?.availability || 'Available'}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border-b">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'assignments' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaList className="inline mr-2" /> New & Accepted ({filteredAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'active' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaSpinner className="inline mr-2 animate-spin" /> Active Jobs
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'history' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCheckDouble className="inline mr-2" /> History
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2 px-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Grid/List */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FaTractor className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500">No assignments found</p>
              <p className="text-sm text-gray-400 mt-2">Check back later for new assignments</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`border rounded-lg p-4 hover:shadow-lg transition ${
                    viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col md:flex-row md:items-center justify-between'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-gray-600">#{assignment.booking_id}</span>
                      <StatusBadge status={assignment.status} />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">{assignment.farmer_name}</h3>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-green-600" /> {assignment.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-green-600" /> {new Date(assignment.scheduled_date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaClock className="text-green-600" /> {assignment.scheduled_time}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaTractor className="text-green-600" /> {assignment.tractor_model} ({assignment.tractor_registration})
                      </p>
                      <p className="flex items-center gap-2">
                        <FaPhone className="text-green-600" /> {assignment.farmer_phone}
                      </p>
                    </div>
                    
                    {assignment.special_instructions && (
                      <div className="mt-2 bg-yellow-50 p-2 rounded text-sm text-yellow-800">
                        <strong>Note:</strong> {assignment.special_instructions}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex gap-2 mt-4 ${viewMode === 'grid' ? '' : 'md:ml-4 md:mt-0'}`}>
                    {/* Action buttons based on status */}
                    {assignment.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleAcceptAssignment(assignment)}
                          disabled={updatingStatus}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openNavigation(assignment)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <FaLocationArrow />
                        </button>
                      </>
                    )}
                    
                    {assignment.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => handleDispatch(assignment)}
                          disabled={updatingStatus}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Start Dispatch
                        </button>
                        <button
                          onClick={() => openNavigation(assignment)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <FaLocationArrow />
                        </button>
                      </>
                    )}
                    
                    {assignment.status === 'dispatched' && (
                      <button
                        onClick={() => handleArrived(assignment)}
                        disabled={updatingStatus}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Mark Arrived
                      </button>
                    )}
                    
                    {assignment.status === 'arrived' && (
                      <button
                        onClick={() => handleStartService(assignment)}
                        disabled={updatingStatus}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Start Service
                      </button>
                    )}
                    
                    {assignment.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setCompletionReport(prev => ({ ...prev, booking_id: assignment.booking_id }));
                          setShowCompletionModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <FaCamera className="inline mr-1" /> Complete Job
                      </button>
                    )}
                    
                    {assignment.status === 'completed_pending' && (
                      <div className="text-center text-sm text-orange-600">
                        <FaUpload className="inline mr-1 animate-pulse" />
                        Waiting for admin review
                      </div>
                    )}
                    
                    {assignment.status === 'completed' && (
                      <div className="text-center text-sm text-green-600">
                        <FaCheckDouble className="inline mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion Report Modal */}
      {showCompletionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaCamera className="text-green-600" /> Complete Service Report
              </h3>
              <button onClick={() => setShowCompletionModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Booking #{selectedAssignment.booking_id}</p>
                <p className="font-medium">{selectedAssignment.farmer_name}</p>
                <p className="text-sm">{selectedAssignment.location}</p>
              </div>
              
              {/* Before Service Photos */}
              <div>
                <label className="block font-semibold mb-2">
                  Before Service Photos <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {completionReport.before_previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Before ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <button
                        onClick={() => removePhoto('before', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-green-500 transition"
                  >
                    <FaPlus className="text-gray-400" />
                    <span className="text-xs text-gray-500">Upload</span>
                  </button>
                  <button
                    onClick={() => cameraInputBeforeRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-green-500 transition"
                  >
                    <FaCamera className="text-gray-400" />
                    <span className="text-xs text-gray-500">Camera</span>
                  </button>
                </div>
                <input
                  ref={fileInputBeforeRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('before', e.target.files)}
                />
                <input
                  ref={cameraInputBeforeRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('before', e.target.files)}
                />
              </div>
              
              {/* After Service Photos */}
              <div>
                <label className="block font-semibold mb-2">
                  After Service Photos <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {completionReport.after_previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`After ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <button
                        onClick={() => removePhoto('after', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-green-500 transition"
                  >
                    <FaPlus className="text-gray-400" />
                    <span className="text-xs text-gray-500">Upload</span>
                  </button>
                  <button
                    onClick={() => cameraInputAfterRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-green-500 transition"
                  >
                    <FaCamera className="text-gray-400" />
                    <span className="text-xs text-gray-500">Camera</span>
                  </button>
                </div>
                <input
                  ref={fileInputAfterRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('after', e.target.files)}
                />
                <input
                  ref={cameraInputAfterRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('after', e.target.files)}
                />
              </div>
              
              {/* Service Duration */}
              <div>
                <label className="block font-semibold mb-2">Service Duration (minutes)</label>
                <input
                  type="number"
                  value={completionReport.service_duration}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, service_duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., 120"
                />
              </div>
              
              {/* Fuel Used */}
              <div>
                <label className="block font-semibold mb-2">Fuel Used (liters) - Optional</label>
                <input
                  type="number"
                  step="0.1"
                  value={completionReport.fuel_used}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, fuel_used: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., 15.5"
                />
              </div>
              
              {/* Odometer Reading */}
              <div>
                <label className="block font-semibold mb-2">Odometer Reading (km) - Optional</label>
                <input
                  type="number"
                  value={completionReport.odometer_reading}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, odometer_reading: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., 12500"
                />
              </div>
              
              {/* Issues Encountered */}
              <div>
                <label className="block font-semibold mb-2">Issues Encountered</label>
                <textarea
                  value={completionReport.issues_encountered}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, issues_encountered: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="Any issues during service? (e.g., difficult terrain, equipment problems)"
                />
              </div>
              
              {/* Materials Used */}
              <div>
                <label className="block font-semibold mb-2">Additional Materials Used</label>
                <textarea
                  value={completionReport.additional_materials_used}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, additional_materials_used: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., 5L oil, new spark plugs, etc."
                />
              </div>
              
              {/* Completion Notes */}
              <div>
                <label className="block font-semibold mb-2">
                  Completion Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completionReport.completion_notes}
                  onChange={(e) => setCompletionReport(prev => ({ ...prev, completion_notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="Describe the work completed..."
                  required
                />
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmitCompletion}
                disabled={submitting}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {submitting ? (
                  <><FaSpinner className="inline animate-spin mr-2" /> Submitting...</>
                ) : offlineMode ? (
                  <><FaDownload className="inline mr-2" /> Save for Later (Offline)</>
                ) : (
                  <><FaUpload className="inline mr-2" /> Submit for Review</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}