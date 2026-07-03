'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

import { 
  FaTractor,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaPrint,
  FaDownload,
  FaShare,
  FaStar,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegBuilding,
  FaFileInvoice,
  FaReceipt,
  FaCommentDots,
  FaUserCheck,
  FaUserClock,
  FaCheckDouble,
  FaCreditCard,
  FaMobile,
  FaCashRegister,
  FaHome,
  FaHistory,
  FaCalendarCheck,
  FaUndo
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==================== TYPES ====================

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
  proof_of_payment: string | null;
  payment_status: 'paid' | 'unpaid' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  tractor_assigned: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  center_name?: string;
  center_location?: string;
  center_contact?: string;
  user_id?: number;
  momo_transaction_id?: string;
}

// ==================== STATUS BADGE ====================

interface StatusBadgeProps {
  status: Booking['status'];
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: FaHourglassHalf,
      label: 'Pending'
    },
    confirmed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FaCheckCircle,
      label: 'Confirmed'
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: FaCheckDouble,
      label: 'Completed'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: FaTimesCircle,
      label: 'Cancelled'
    }
  };

  const { color, icon: Icon, label } = config[status] || config.pending;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${color} ${sizeClasses[size]} font-medium`}>
      <Icon className={`mr-1 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`} />
      {label}
    </span>
  );
};

// ==================== PAYMENT STATUS BADGE ====================

interface PaymentStatusBadgeProps {
  status: string;
  paymentMethod?: string;
}

const PaymentStatusBadge = ({ status, paymentMethod }: PaymentStatusBadgeProps) => {
  // For MoMo payments, always show as paid if the booking is confirmed or completed
  const isMoMo = paymentMethod?.toLowerCase().includes('momo');
  const isBankTransfer = paymentMethod?.toLowerCase().includes('bank') || paymentMethod?.toLowerCase().includes('transfer');
  
  let displayStatus = status;
  
  // Auto-set MoMo payments to paid when booking is confirmed or completed
  if (isMoMo && (status === 'unpaid' || status === 'pending')) {
    displayStatus = 'paid';
  }
  
  const config = {
    paid: {
      color: 'bg-green-100 text-green-800',
      icon: FaCheckCircle,
      label: 'Paid'
    },
    unpaid: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: FaHourglassHalf,
      label: isBankTransfer ? 'Awaiting Upload' : 'Payment Pending'
    },
    refunded: {
      color: 'bg-purple-100 text-purple-800',
      icon: FaUndo,
      label: 'Refunded'
    }
  };

  const { color, icon: Icon, label } = config[displayStatus as keyof typeof config] || config.unpaid;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="mr-1 text-xs" />
      {label}
    </span>
  );
};

// ==================== PAYMENT METHOD ICON ====================

interface PaymentMethodIconProps {
  method: string;
}

const PaymentMethodIcon = ({ method }: PaymentMethodIconProps) => {
  const methodLower = method?.toLowerCase() || '';
  
  if (methodLower.includes('momo') || methodLower.includes('mobile')) {
    return <FaMobile className="text-green-600" />;
  } else if (methodLower.includes('cash')) {
    return <FaCashRegister className="text-green-600" />;
  } else if (methodLower.includes('card') || methodLower.includes('credit')) {
    return <FaCreditCard className="text-green-600" />;
  } else if (methodLower.includes('bank') || methodLower.includes('transfer')) {
    return <FaReceipt className="text-green-600" />;
  } else {
    return <FaMoneyBillWave className="text-green-600" />;
  }
};

// ==================== INFO CARD ====================

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard = ({ icon: Icon, title, children, className = '' }: InfoCardProps) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Icon className="mr-2 text-green-600" />
      {title}
    </h3>
    {children}
  </div>
);

// ==================== INFO ROW ====================

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}

const InfoRow = ({ label, value, icon: Icon }: InfoRowProps) => (
  <div className="flex py-2 border-b border-gray-100 last:border-0">
    <dt className="w-1/3 text-sm text-gray-500 flex items-center">
      {Icon && <Icon className="mr-2 text-gray-400 text-xs" />}
      {label}:
    </dt>
    <dd className="w-2/3 text-sm font-medium text-gray-900">{value || '—'}</dd>
  </div>
);

// ==================== TIMELINE STEP ====================

interface TimelineStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  timestamp?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

const TimelineStep = ({ 
  icon: Icon, 
  title, 
  description, 
  timestamp, 
  isActive, 
  isCompleted, 
  isLast 
}: TimelineStepProps) => {
  return (
    <div className="relative flex items-start space-x-3">
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCompleted 
            ? 'bg-green-100 text-green-600' 
            : isActive 
              ? 'bg-blue-100 text-blue-600 animate-pulse'
              : 'bg-gray-100 text-gray-400'
        }`}>
          <Icon />
        </div>
        {!isLast && (
          <div className={`absolute top-10 left-1/2 w-0.5 h-12 -translate-x-1/2 ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </div>
      
      <div className="flex-1 pb-8">
        <p className={`font-medium ${
          isCompleted ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-700'
        }`}>
          {title}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [center, setCenter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundPhone, setRefundPhone] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Fetching booking details...');
      console.log('Booking ID:', bookingId);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Response data:', response.data);

      if (response.data.success) {
        const bookingData = response.data.booking;
        
        const totalAmount = typeof bookingData.total_amount === 'string' 
          ? parseFloat(bookingData.total_amount) 
          : bookingData.total_amount;

        // Auto-set payment status for MoMo payments
        let paymentStatus = bookingData.payment_status || 'unpaid';
        const isMoMo = bookingData.payment_method?.toLowerCase().includes('momo');
        
        if (isMoMo && bookingData.status !== 'cancelled') {
          // For MoMo, automatically mark as paid when booking is confirmed or completed
          if (bookingData.status === 'confirmed' || bookingData.status === 'completed') {
            paymentStatus = 'paid';
            // Update payment status in backend if needed
            if (bookingData.payment_status !== 'paid') {
              await updatePaymentStatus(bookingData.id, 'paid');
            }
          }
        }

        setBooking({
          ...bookingData,
          total_amount: totalAmount || 0,
          payment_status: paymentStatus
        });

        if (bookingData.center_id) {
          try {
            const centerResponse = await axios.get(`${API_URL}/api/tinkhundla/${bookingData.center_id}`);
            if (centerResponse.data.success) {
              setCenter(centerResponse.data.center);
            }
          } catch (centerError) {
            console.log('Center info not available');
          }
        }
        
        toast.success('Booking loaded successfully');
      } else {
        setError('Booking not found');
      }
    } catch (error: any) {
      console.error('❌ Error fetching booking:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this booking.');
        toast.error('You can only view your own bookings');
        setTimeout(() => router.push('/dashboard'), 3000);
      } else if (error.response?.status === 404) {
        setError('Booking not found');
        toast.error('Booking not found');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the server is running.');
        toast.error('Network error. Please check your connection.');
      } else {
        setError('Failed to load booking details');
        toast.error(error.response?.data?.error || 'Failed to load booking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/bookings/${id}/payment-status`,
        { payment_status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const processRefund = async () => {
    setRefunding(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/payments/momo/refund/${bookingId}`,
        {
          amount: booking?.total_amount,
          reason: cancelReason,
          phoneNumber: refundPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await axios.put(
          `${API_URL}/api/bookings/${bookingId}/payment-status`,
          { payment_status: 'refunded' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Refund processed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('Failed to process refund. Please contact support.');
      throw error;
    } finally {
      setRefunding(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (booking?.payment_status === 'paid') {
      setShowCancelModal(false);
      setShowRefundModal(true);
      return;
    }

    await processCancellation();
  };

  const processCancellation = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/api/bookings/${bookingId}/status`,
        { 
          status: 'cancelled',
          admin_notes: `Cancelled by farmer: ${cancelReason}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false);
        setShowRefundModal(false);
        fetchBookingDetails();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleRefundAndCancel = async () => {
    if (!refundPhone.trim()) {
      toast.error('Please provide a phone number for refund');
      return;
    }

    const phoneRegex = /^(76|78)\d{6}$/;
    const cleanedPhone = refundPhone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      toast.error('Please enter a valid MTN phone number (76XXXXXX or 78XXXXXX)');
      return;
    }

    setRefunding(true);
    try {
      const token = localStorage.getItem('token');
      
      const refundResponse = await axios.post(
        `${API_URL}/api/payments/momo/refund/${bookingId}`,
        {
          amount: booking?.total_amount,
          reason: cancelReason,
          phoneNumber: cleanedPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (refundResponse.data.success) {
        const cancelResponse = await axios.put(
          `${API_URL}/api/bookings/${bookingId}/status`,
          { 
            status: 'cancelled',
            admin_notes: `Cancelled by farmer: ${cancelReason} | Refund processed to: ${cleanedPhone}`
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (cancelResponse.data.success) {
          await axios.put(
            `${API_URL}/api/bookings/${bookingId}/payment-status`,
            { payment_status: 'refunded' },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success('Booking cancelled and refund processed successfully!');
          setShowCancelModal(false);
          setShowRefundModal(false);
          fetchBookingDetails();
        }
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund. Please contact support.');
    } finally {
      setRefunding(false);
    }
  };

  const generateReceiptHTML = (customAmount?: number) => {
    const totalAmount = customAmount !== undefined ? customAmount : 
      (typeof booking?.total_amount === 'string' ? parseFloat(booking.total_amount) : booking?.total_amount || 0);
    
    // Determine payment method display
    const isMoMo = booking?.payment_method?.toLowerCase().includes('momo');
    const paymentMethodDisplay = isMoMo ? 'MoMo Payment' : (booking?.payment_method?.toUpperCase() || 'Not specified');
    const paymentStatusDisplay = isMoMo ? 'PAID' : (booking?.payment_status === 'paid' ? 'PAID' : booking?.payment_status === 'refunded' ? 'REFUNDED' : 'PENDING');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>RDA Tractor Booking Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #10b981; }
          .receipt-number { font-size: 12px; color: #666; margin-top: 5px; }
          .details { margin-bottom: 30px; }
          .details table { width: 100%; border-collapse: collapse; }
          .details td { padding: 8px; border-bottom: 1px solid #eee; }
          .details td:first-child { font-weight: bold; width: 40%; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #10b981; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .refund-note { background-color: #f3e8ff; border: 1px solid #c084fc; padding: 15px; margin: 20px 0; border-radius: 8px; color: #6b21a5; }
          .paid-note { background-color: #d1fae5; border: 1px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 8px; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RDA TRACTOR BOOKING SYSTEM</div>
          <div class="receipt-number">Receipt #: INV-${booking?.id}-${new Date().getFullYear()}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>
        
        ${isMoMo && booking?.status !== 'cancelled' ? `
        <div class="paid-note">
          <strong>✅ Payment Confirmed</strong><br>
          This booking has been paid via MoMo Mobile Money.
        </div>
        ` : ''}
        
        <div class="details">
          <h3>Booking Details</h3>
           <table>
            <tr><td>Booking ID:</td><td>#${booking?.id}</td></tr>
            <tr><td>Farmer Name:</td><td>${booking?.full_name || 'N/A'}</td></tr>
            <tr><td>Contact Number:</td><td>${booking?.contact_number || 'N/A'}</td></tr>
            <tr><td>Email:</td><td>${booking?.email || 'Not provided'}</td></tr>
            <tr><td>Service Hours:</td><td>${booking?.hours_booked || 0} hours</td></tr>
            <tr><td>Rate per Hour:</td><td>E400.00</td></tr>
            <tr><td>Booking Date:</td><td>${booking?.available_time ? new Date(booking.available_time).toLocaleDateString() : 'N/A'}</td></tr>
            <tr><td>Booking Time:</td><td>${booking?.available_time ? new Date(booking.available_time).toLocaleTimeString() : 'N/A'}</td></tr>
            <tr><td>Location:</td><td>${booking?.location_description || 'N/A'}</td></tr>
            <tr><td>Payment Method:</td><td>${paymentMethodDisplay}</td></tr>
            <tr><td>Payment Status:</td><td>${paymentStatusDisplay}</td></tr>
            ${booking?.tractor_assigned ? `<tr><td>Tractor Assigned:</td><td>${booking.tractor_assigned}</td></tr>` : ''}
          </table>
        </div>
        
        ${booking?.payment_status === 'refunded' ? `
        <div class="refund-note">
          <strong>💰 Refund Information</strong><br>
          This booking has been cancelled and fully refunded.<br>
          Amount: E${totalAmount.toFixed(2)}<br>
          Refund Date: ${new Date().toLocaleDateString()}
        </div>
        ` : ''}
        
        <div class="total">
          Total Amount: E${totalAmount.toFixed(2)}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing RDA Tractor Services</p>
          <p>For inquiries, contact: +268 2404 1234 | support@rda.co.sz</p>
          <p>This is a computer-generated receipt. No signature required.</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const totalAmount = typeof booking?.total_amount === 'string' 
        ? parseFloat(booking.total_amount) 
        : booking?.total_amount || 0;
      
      const receiptHTML = generateReceiptHTML(totalAmount);
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      iframe.contentDocument?.write(receiptHTML);
      iframe.contentDocument?.close();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = iframe.contentDocument?.body;
      if (element) {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`RDA_Receipt_${booking?.id}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Receipt downloaded successfully');
      }
      
      document.body.removeChild(iframe);
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const totalAmount = typeof booking?.total_amount === 'string' 
      ? parseFloat(booking.total_amount) 
      : booking?.total_amount || 0;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML(totalAmount));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Booking #${bookingId}`,
        text: `Tractor booking for ${booking?.full_name}`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', title: 'Booking Submitted', description: 'Your booking has been received' },
      { status: 'confirmed', title: 'Booking Confirmed', description: 'Admin has confirmed your booking' },
      { status: 'completed', title: 'Service Completed', description: 'Tractor service has been completed' }
    ];

    const currentStatus = booking?.status || 'pending';
    const currentIndex = steps.findIndex(s => s.status === currentStatus);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index < currentIndex && currentStatus !== 'cancelled',
      isActive: index === currentIndex && currentStatus !== 'cancelled',
      timestamp: index === 0 ? new Date(booking?.created_at || '').toLocaleString() : undefined
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Determine if payment is considered paid
  const isPaymentPaid = () => {
    const isMoMo = booking?.payment_method?.toLowerCase().includes('momo');
    const isBankTransfer = booking?.payment_method?.toLowerCase().includes('bank') || booking?.payment_method?.toLowerCase().includes('transfer');
    
    if (isMoMo && booking?.status !== 'cancelled') {
      return true; // MoMo payments are considered paid once booking is confirmed
    }
    
    return booking?.payment_status === 'paid';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <FaInfoCircle className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && booking.payment_status !== 'refunded';
  const isMoMoPayment = booking.payment_method?.toLowerCase().includes('momo');
  const isBankTransferPayment = booking.payment_method?.toLowerCase().includes('bank') || booking.payment_method?.toLowerCase().includes('transfer');
  const isPaid = isPaymentPaid();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ToastContainer position="top-right" />

      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-green-700 rounded-lg transition">
                <FaArrowLeft className="text-xl" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
                <p className="text-green-100 mt-1">View and manage your tractor booking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handlePrint} className="p-2 hover:bg-green-700 rounded-lg transition" title="Print Receipt">
                <FaPrint className="text-xl" />
              </button>
              <button onClick={handleDownloadReceipt} disabled={downloading} className="p-2 hover:bg-green-700 rounded-lg transition disabled:opacity-50" title="Download Receipt">
                {downloading ? <FaSpinner className="animate-spin text-xl" /> : <FaDownload className="text-xl" />}
              </button>
              <button onClick={handleShare} className="p-2 hover:bg-green-700 rounded-lg transition" title="Share">
                <FaShare className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <StatusBadge status={booking.status} size="lg" />
              <PaymentStatusBadge status={booking.payment_status || 'unpaid'} paymentMethod={booking.payment_method} />
              <span className="text-sm text-gray-500">
                Last updated: {formatDate(booking.updated_at)}
              </span>
            </div>
            <div className="flex space-x-3">
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling || refunding}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 flex items-center"
                >
                  {(cancelling || refunding) ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
              <button
                onClick={handleDownloadReceipt}
                disabled={downloading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center"
              >
                {downloading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaDownload className="mr-2" />
                )}
                Download Receipt
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <InfoCard icon={FaHistory} title="Booking Timeline">
              <div className="space-y-2">
                {booking.status === 'cancelled' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center text-red-600 mb-2">
                      <FaTimesCircle className="mr-2" />
                      <span className="font-medium">Booking Cancelled</span>
                    </div>
                    <p className="text-sm text-red-700">
                      This booking was cancelled on {formatDate(booking.updated_at)}
                    </p>
                    {booking.admin_notes && (
                      <p className="text-sm text-red-600 mt-2 bg-red-100 p-2 rounded">
                        Reason: {booking.admin_notes}
                      </p>
                    )}
                    {booking.payment_status === 'refunded' && (
                      <p className="text-sm text-purple-600 mt-2 bg-purple-100 p-2 rounded flex items-center">
                        <FaUndo className="mr-2" />
                        Refund has been processed to your original payment method
                      </p>
                    )}
                  </div>
                ) : (
                  statusSteps.map((step, index) => (
                    <TimelineStep
                      key={step.status}
                      icon={step.status === 'pending' ? FaHourglassHalf : 
                            step.status === 'confirmed' ? FaCheckCircle : 
                            FaCheckDouble}
                      title={step.title}
                      description={step.description}
                      timestamp={step.timestamp}
                      isActive={step.isActive}
                      isCompleted={step.isCompleted}
                      isLast={index === statusSteps.length - 1}
                    />
                  ))
                )}
              </div>
            </InfoCard>

            <InfoCard icon={FaTractor} title="Service Details">
              <dl className="divide-y divide-gray-100">
                <InfoRow label="Service Type" value="Tractor Hiring Service" icon={FaTractor} />
                <InfoRow label="Hours Booked" value={`${booking.hours_booked} hour${booking.hours_booked !== 1 ? 's' : ''}`} icon={FaClock} />
                <InfoRow label="Preferred Date" value={new Date(booking.available_time).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })} icon={FaCalendarAlt} />
                <InfoRow label="Preferred Time" value={formatTime(booking.available_time.split('T')[1] || booking.available_time)} icon={FaRegClock} />
                <InfoRow label="Location" value={booking.location_description} icon={FaMapMarkerAlt} />
              </dl>
            </InfoCard>

            <InfoCard icon={FaUser} title="Farmer Information">
              <dl className="divide-y divide-gray-100">
                <InfoRow label="Full Name" value={booking.full_name} icon={FaUser} />
                <InfoRow label="Email" value={booking.email || 'Not provided'} icon={FaEnvelope} />
                <InfoRow label="Phone" value={booking.contact_number} icon={FaPhone} />
              </dl>
            </InfoCard>

            {center && (
              <InfoCard icon={FaRegBuilding} title="Service Center">
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Center Name" value={center.name} icon={FaRegBuilding} />
                  <InfoRow label="Location" value={center.location} icon={FaMapMarkerAlt} />
                  <InfoRow label="Contact" value={center.contact_number} icon={FaPhone} />
                  <InfoRow label="Email" value={center.email} icon={FaEnvelope} />
                </dl>
              </InfoCard>
            )}
          </div>

          {/* Right Column - Payment & Admin Info */}
          <div className="space-y-8">
            <InfoCard icon={FaMoneyBillWave} title="Payment Summary" className="sticky top-24">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2 text-black">
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-medium">{booking.hours_booked} hours</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-black">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">E400/hour</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-green-600">E{booking.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <PaymentMethodIcon method={booking.payment_method} />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {booking.payment_method === 'momo' ? 'MoMo Mobile Money' : 
                       booking.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
                       booking.payment_method || 'Payment method not specified'}
                    </span>
                  </div>
                  <PaymentStatusBadge status={booking.payment_status || 'unpaid'} paymentMethod={booking.payment_method} />
                </div>

                {/* MoMo Payment Info */}
                {isMoMoPayment && isPaid && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-800 text-sm">
                      <FaCheckCircle className="mr-2 text-green-600" />
                      <span>✓ Payment confirmed via MoMo</span>
                    </div>
                    {booking.momo_transaction_id && (
                      <p className="text-xs text-green-600 mt-1">
                        Transaction ID: {booking.momo_transaction_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Bank Transfer Upload Info */}
                {isBankTransferPayment && booking.proof_of_payment && (
                  <div className="mt-4">
                    <a href={`${API_URL}/uploads/proofs/${booking.proof_of_payment}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <FaFileInvoice className="mr-2" />
                      View Proof of Payment Upload
                    </a>
                  </div>
                )}

                {isBankTransferPayment && !booking.proof_of_payment && booking.payment_status !== 'paid' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <FaInfoCircle className="text-yellow-600 mr-2 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Payment Pending</p>
                        <p className="text-xs mt-1">Please upload your proof of payment to complete the booking.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            <InfoCard icon={FaUserCheck} title="Admin Information">
              <dl className="divide-y divide-gray-100">
                <InfoRow label="Tractor Assigned" value={booking.tractor_assigned || 'Not assigned yet'} icon={FaTractor} />
                <InfoRow label="Admin Notes" value={booking.admin_notes || 'No notes'} icon={FaCommentDots} />
                <InfoRow label="Booking Created" value={formatDate(booking.created_at)} icon={FaRegCalendarAlt} />
              </dl>
            </InfoCard>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/bookings?status=${booking.status}`} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-sm font-medium text-gray-700">View similar bookings</span>
                  <FaArrowRight className="text-gray-400" />
                </Link>
                <Link href="/booking" className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-sm font-medium text-gray-700">Book another tractor</span>
                  <FaArrowRight className="text-gray-400" />
                </Link>
                <Link href="/contact" className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-sm font-medium text-gray-700">Contact support</span>
                  <FaArrowRight className="text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel booking #{booking.id}?
              {booking.payment_status === 'paid' && (
                <span className="block mt-2 text-purple-600">You will be asked to provide refund details.</span>
              )}
              This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                placeholder="Please provide a reason for cancellation..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                Keep Booking
              </button>
              <button onClick={handleCancelBooking} disabled={cancelling || !cancelReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center">
                {cancelling ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Refund Information</h3>
              <button onClick={() => { setShowRefundModal(false); setShowCancelModal(true); }} className="text-gray-400 hover:text-gray-600">
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FaInfoCircle className="text-purple-600 mr-3 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold">Refund Details</p>
                  <p className="mt-1">Amount to refund: <strong>E{booking?.total_amount?.toFixed(2)}</strong></p>
                  <p className="mt-1">Refund will be processed to your MTN Mobile Money account.</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MTN Mobile Money Number for Refund <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">+268</span>
                </div>
                <input
                  type="tel"
                  value={refundPhone}
                  onChange={(e) => setRefundPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="76 123 456"
                  className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your MTN number (76XXXXXX or 78XXXXXX) to receive the refund
              </p>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => { setShowRefundModal(false); setShowCancelModal(true); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                Back
              </button>
              <button onClick={handleRefundAndCancel} disabled={refunding || !refundPhone.trim()} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 flex items-center justify-center">
                {refunding ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing Refund...
                  </>
                ) : (
                  'Confirm Refund & Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}