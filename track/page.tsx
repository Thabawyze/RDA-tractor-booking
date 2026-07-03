'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FaTractor, FaSearch, FaSpinner, FaCheckCircle, FaClock,
  FaTimesCircle, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCalendarAlt, FaMoneyBillWave, FaInfoCircle,
  FaWhatsapp, FaHashtag, FaClipboardCheck, FaTools,
  FaShareAlt, FaStar,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface BookingDetail {
  id: number;
  reference_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  full_name: string;
  contact_number: string;
  email?: string;
  location_description: string;
  available_time: string;
  hours_booked: number;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  tractor_assigned?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  estimated_arrival?: string;
}

// ─────────────────────────────────────────────────────────────
//  Status config
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: FaClock,
    iconColor: 'text-yellow-500',
    description: 'Your booking has been received and is awaiting review by an RDA officer.',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-800',
    icon: FaCheckCircle,
    iconColor: 'text-green-500',
    description: 'Your booking has been confirmed. A tractor has been assigned to your service.',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800',
    icon: FaTools,
    iconColor: 'text-blue-500',
    description: 'Your tractor service is currently in progress at your location.',
  },
  completed: {
    label: 'Completed',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800',
    icon: FaClipboardCheck,
    iconColor: 'text-purple-500',
    description: 'Your tractor service has been completed successfully. We hope it was helpful!',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-800',
    icon: FaTimesCircle,
    iconColor: 'text-red-500',
    description: 'This booking has been cancelled. Please contact RDA for assistance.',
  },
};

// ─────────────────────────────────────────────────────────────
//  Status timeline stepper
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'pending',     label: 'Submitted',  icon: FaHashtag },
  { key: 'confirmed',   label: 'Confirmed',  icon: FaCheckCircle },
  { key: 'in_progress', label: 'In Progress',icon: FaTools },
  { key: 'completed',   label: 'Completed',  icon: FaClipboardCheck },
];

const stepIndex = (status: string) =>
  STEPS.findIndex((s) => s.key === status);

function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') return null;
  const current = stepIndex(status);
  return (
    <div className="flex items-center justify-between w-full mt-2 mb-1">
      {STEPS.map((step, i) => {
        const done    = i <= current;
        const active  = i === current;
        const Icon    = step.icon;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center w-full">
              {i > 0 && (
                <div className={`absolute left-0 right-1/2 h-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
              {i < STEPS.length - 1 && (
                <div className={`absolute left-1/2 right-0 h-1 ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
              <div className={`relative z-10 mx-auto w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                ${done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                ${active ? 'ring-4 ring-green-100' : ''}`}>
                <Icon className="text-sm" />
              </div>
            </div>
            <span className={`mt-2 text-xs font-medium text-center ${done ? 'text-green-700' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Detail row helper
// ─────────────────────────────────────────────────────────────
function DetailRow({ label, value, alt }: { label: string; value: React.ReactNode; alt?: boolean }) {
  return (
    <div className={`px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${alt ? 'bg-gray-50' : 'bg-white'}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────
export default function TrackBookingPage() {
  const [searchValue, setSearchValue]     = useState('');
  const [searchType, setSearchType]       = useState<'reference' | 'id'>('reference');
  const [booking, setBooking]             = useState<BookingDetail | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [searched, setSearched]           = useState(false);
  const inputRef                          = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'PPpp'); } catch { return 'N/A'; }
  };

  const handleSearch = async () => {
    const val = searchValue.trim();
    if (!val) { setError('Please enter a booking reference or booking number.'); return; }

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    try {
      const endpoint = searchType === 'reference'
        ? `${API_URL}/api/auth/bookings/track?ref=${encodeURIComponent(val)}`
        : `${API_URL}/api/auth/bookings/track?id=${encodeURIComponent(val)}`;

      const res = await axios.get(endpoint);
      if (res.data.success && res.data.booking) {
        setBooking(res.data.booking);
      } else {
        setError('No booking found. Please check your reference number and try again.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No booking found with that reference. Please check and try again.');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleShare = () => {
    if (!booking) return;
    const text = `My RDA tractor booking (${booking.reference_number}) status: ${booking.status.toUpperCase()}. Track yours at rda-portal.vercel.app/track`;
    if (navigator.share) {
      navigator.share({ title: 'RDA Booking Status', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Booking status copied to clipboard!');
    }
  };

  const cfg = booking ? STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaSearch className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Track Your Booking</h1>
          <p className="mt-2 text-gray-500 text-lg">
            Enter your booking reference number to check your tractor service status
          </p>
        </div>

        {/* ── Search card ── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-2 mb-4">
            {[
              { key: 'reference', label: '🔖 Reference No. (RDA-XXXXXX)' },
              { key: 'id',        label: '🔢 Booking ID' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setSearchType(t.key as any); setSearchValue(''); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition
                  ${searchType === t.key
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaHashtag className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder={searchType === 'reference' ? 'e.g. RDA-784321' : 'e.g. 42'}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                text-lg font-mono tracking-wider placeholder-gray-300"
            />
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
              <FaTimesCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading || !searchValue.trim()}
            className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50
              disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base
              flex items-center justify-center gap-2 transition shadow"
          >
            {loading
              ? <><FaSpinner className="animate-spin" /> Searching…</>
              : <><FaSearch /> Track Booking</>}
          </button>

          <p className="mt-3 text-xs text-center text-gray-400">
            Your reference number was shown on your booking confirmation screen (format: RDA-XXXXXX)
          </p>
        </div>

        {/* ── Result ── */}
        {booking && cfg && (
          <div className="space-y-6 animate-[fadeIn_.4s_ease]">

            {/* Status banner */}
            <div className={`rounded-2xl border-2 p-5 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <cfg.icon className={`text-3xl flex-shrink-0 ${cfg.iconColor}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Booking Status</p>
                    <h2 className={`text-2xl font-bold ${cfg.color}`}>{cfg.label}</h2>
                    <p className="text-sm text-gray-600 mt-1">{cfg.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex-shrink-0 p-2 rounded-lg bg-white border border-gray-200
                    text-gray-500 hover:text-green-600 hover:border-green-300 transition"
                  title="Share booking status"
                >
                  <FaShareAlt />
                </button>
              </div>

              {/* Progress stepper */}
              <div className="mt-5 px-2">
                <StatusTimeline status={booking.status} />
              </div>
            </div>

            {/* Reference + quick info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-xs font-medium uppercase tracking-wider">Reference Number</p>
                  <p className="text-white text-2xl font-bold font-mono tracking-widest mt-0.5">
                    {booking.reference_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-200 text-xs">Booking ID</p>
                  <p className="text-white font-semibold">#{booking.id}</p>
                </div>
              </div>

              <dl className="divide-y divide-gray-100">
                <DetailRow alt label="Farmer Name"      value={booking.full_name} />
                <DetailRow     label="Contact Number"   value={booking.contact_number} />
                <DetailRow alt label="Service Location" value={booking.location_description} />
                <DetailRow     label="Preferred Date"   value={
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-green-500 flex-shrink-0" />
                    {formatDate(booking.available_time)}
                  </span>
                } />
                <DetailRow alt label="Service Hours"    value={`${booking.hours_booked} hour${booking.hours_booked !== 1 ? 's' : ''}`} />
                <DetailRow     label="Total Amount"     value={
                  <span className="font-bold text-green-700 text-base">E{Number(booking.total_amount).toFixed(2)}</span>
                } />
                <DetailRow alt label="Payment Method"   value={
                  <span className="capitalize">{booking.payment_method?.replace('_', ' ')}</span>
                } />
                {booking.payment_status && (
                  <DetailRow label="Payment Status" value={
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {booking.payment_status === 'paid' ? <FaCheckCircle /> : <FaClock />}
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </span>
                  } />
                )}
                {booking.tractor_assigned && (
                  <DetailRow alt label="Tractor Assigned" value={
                    <span className="flex items-center gap-1 font-medium text-blue-700">
                      <FaTractor /> {booking.tractor_assigned}
                    </span>
                  } />
                )}
                {booking.estimated_arrival && (
                  <DetailRow label="Estimated Arrival" value={formatDate(booking.estimated_arrival)} />
                )}
                {booking.admin_notes && (
                  <DetailRow alt label="RDA Officer Notes" value={
                    <span className="italic text-gray-700">"{booking.admin_notes}"</span>
                  } />
                )}
                <DetailRow label="Booking Submitted" value={formatDate(booking.created_at)} />
                {booking.updated_at && (
                  <DetailRow alt label="Last Updated" value={formatDate(booking.updated_at)} />
                )}
              </dl>
            </div>

            {/* Completed — invite feedback */}
            {booking.status === 'completed' && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaStar className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900">How was your service?</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Your tractor service is complete. Please take a moment to share your experience — your feedback helps us improve.
                  </p>
                  <Link
                    href={`/feedback?ref=${booking.reference_number}&id=${booking.id}`}
                    className="mt-3 inline-flex items-center gap-2 bg-purple-600 text-white
                      px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    <FaStar /> Leave Feedback
                  </Link>
                </div>
              </div>
            )}

            {/* Cancelled — rebook */}
            {booking.status === 'cancelled' && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <p className="text-sm text-orange-700 mb-3">
                  This booking was cancelled. Would you like to make a new booking?
                </p>
                <Link
                  href="/bookings"
                  className="inline-flex items-center gap-2 bg-green-600 text-white
                    px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  <FaTractor /> Make a New Booking
                </Link>
              </div>
            )}

            {/* Search another */}
            <button
              onClick={() => { setBooking(null); setSearchValue(''); setSearched(false); setError(null); inputRef.current?.focus(); }}
              className="w-full py-3 border-2 border-green-600 text-green-700 font-semibold
                rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2"
            >
              <FaSearch /> Track Another Booking
            </button>
          </div>
        )}

        {/* No result state */}
        {searched && !loading && !booking && !error && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <FaInfoCircle className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No booking found.</p>
            <p className="text-gray-400 text-sm mt-1">Check your reference number and try again.</p>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-green-600" /> Need Help?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { Icon: FaPhone,    label: 'Call Us',   value: '+268 2404 1234' },
              { Icon: FaWhatsapp, label: 'WhatsApp',  value: '+268 76123456'  },
              { Icon: FaEnvelope, label: 'Email',     value: 'support@rda.co.sz' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="p-3 hover:bg-gray-50 rounded-xl transition">
                <Icon className="mx-auto text-green-600 text-xl mb-1" />
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
