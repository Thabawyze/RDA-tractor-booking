'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaTractor,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobile,
  FaUpload,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaShieldAlt,
  FaTimesCircle,
  FaWhatsapp,
} from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface BookingFormData {
  full_name: string;
  contact_number: string;
  email?: string;
  location_description: string;
  available_time: string;
}

interface MoMoPaymentModalProps {
  bookingId: number;
  amount: number | string;
  farmerName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─────────────────────────────────────────────────────────────
//  Phone notification SVG icons
// ─────────────────────────────────────────────────────────────
const PhoneHomeApps = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '0 4px' }}>
    {[
      { bg: '#1a6b3c', label: 'RDA', icon: '🌿' },
      { bg: '#185FA5', label: 'Calls', icon: '📞' },
      { bg: '#854F0B', label: 'SMS', icon: '💬' },
      { bg: '#534AB7', label: 'Wallet', icon: '💳' },
      { bg: '#993C1D', label: 'Camera', icon: '📷' },
      { bg: '#0F6E56', label: 'Maps', icon: '🗺️' },
      { bg: '#444441', label: 'Settings', icon: '⚙️' },
      { bg: '#185FA5', label: 'Weather', icon: '🌤️' },
    ].map((app) => (
      <div key={app.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          {app.icon}
        </div>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>{app.label}</span>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  MoMo Payment Modal — integrated phone simulation
// ─────────────────────────────────────────────────────────────
const MoMoPaymentModal = ({ bookingId, amount, farmerName, onSuccess, onCancel }: MoMoPaymentModalProps) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Portal form state
  const [portalPhone, setPortalPhone] = useState('');
  const [portalPhoneError, setPortalPhoneError] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Phone simulation state
  type PhoneScreen = 'home' | 'notification' | 'pin' | 'processing' | 'success' | 'declined';
  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('home');
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [txRef, setTxRef] = useState('');

  // Countdown for push notification auto-dismiss (30s)
  const [notifCountdown, setNotifCountdown] = useState(30);
  const notifTimerRef = useRef<NodeJS.Timeout | null>(null);

  const CORRECT_PIN = '12345';
  const MAX_ATTEMPTS = 3;

  const validatePhone = (p: string) => /^(76|78)\d{6}$/.test(p.replace(/\D/g, ''));

  const formatPhone = (p: string) => {
    const c = p.replace(/\D/g, '');
    if (c.length === 8) return `${c.slice(0, 2)} ${c.slice(2, 5)} ${c.slice(5)}`;
    return p;
  };

  const generateRef = () => 'RDA-' + Math.floor(100000 + Math.random() * 900000);

  // Start notification countdown
  useEffect(() => {
    if (phoneScreen === 'notification') {
      setNotifCountdown(30);
      notifTimerRef.current = setInterval(() => {
        setNotifCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(notifTimerRef.current!);
            // Auto-expire notification
            handlePhoneDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (notifTimerRef.current) clearInterval(notifTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneScreen]);

  const handleSendRequest = () => {
    const cleaned = portalPhone.replace(/\D/g, '');
    if (!validatePhone(cleaned)) {
      setPortalPhoneError('Invalid number. Use format 76XXXXXX or 78XXXXXX');
      return;
    }
    setPortalPhoneError('');
    setSendingRequest(true);

    // Simulate API call delay then show notification on phone
    setTimeout(() => {
      setSendingRequest(false);
      setTxRef(generateRef());
      setPhoneScreen('notification');
      toast.success(`Payment request sent to +268 ${formatPhone(cleaned)}`, { autoClose: 3000 });
    }, 1800);
  };

  const handlePhoneApprove = () => {
    if (notifTimerRef.current) clearInterval(notifTimerRef.current);
    setPinValue('');
    setPinError('');
    setPhoneScreen('pin');
  };

  const handlePhoneDecline = () => {
    if (notifTimerRef.current) clearInterval(notifTimerRef.current);
    setPhoneScreen('declined');
  };

  const handlePinPress = (digit: string) => {
    if (pinValue.length >= 5) return;
    const newPin = pinValue + digit;
    setPinValue(newPin);
    setPinError('');
    if (newPin.length === 5) {
      setTimeout(() => checkPin(newPin), 200);
    }
  };

  const handlePinDelete = () => {
    setPinValue((p) => p.slice(0, -1));
    setPinError('');
  };

  const checkPin = (pin: string) => {
    if (pin === CORRECT_PIN) {
      setPhoneScreen('processing');
      setTimeout(() => {
        setPhoneScreen('success');
        setTimeout(() => onSuccess(), 2200);
      }, 1500);
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      setPinValue('');
      if (attempts >= MAX_ATTEMPTS) {
        setPinError('Too many attempts. Request cancelled.');
        setTimeout(() => setPhoneScreen('declined'), 1800);
      } else {
        setPinError(`Wrong PIN. ${MAX_ATTEMPTS - attempts} attempt${MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} left.`);
      }
    }
  };

  const handleReset = () => {
    setPhoneScreen('home');
    setPortalPhone('');
    setPinValue('');
    setPinError('');
    setPinAttempts(0);
    setTxRef('');
  };

  // ── Phone screen renderers ──────────────────────────────
  const renderPhoneContent = () => {
    switch (phoneScreen) {
      case 'home':
        return (
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', textAlign: 'center', margin: '8px 0 2px' }}>09:41</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 12 }}>
              {new Date().toLocaleDateString('en-SZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <PhoneHomeApps />
            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', paddingTop: 8 }}>
              Waiting for payment request…
            </div>
          </div>
        );

      case 'notification':
        return (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', padding: '10px 8px', zIndex: 10, animation: 'rdaFadeIn .3s ease' }}>
            {/* Dimmed home behind */}
            <div style={{ flex: 1, padding: 12, opacity: 0.25 }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: '#fff', textAlign: 'center', marginBottom: 8 }}>09:41</div>
              <PhoneHomeApps />
            </div>
            {/* Notification card */}
            <div style={{ background: 'rgba(20,20,40,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, animation: 'rdaSlide .35s cubic-bezier(.34,1.56,.64,1)', position: 'absolute', top: 10, left: 8, right: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#1a6b3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>💸</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>RDA Mobile Money</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>now · {notifCountdown}s</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 3 }}>Payment Request — E{numericAmount.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: 10 }}>
                {farmerName || 'Farmer'}, RDA Portal requests E{numericAmount.toFixed(2)} for tractor booking. Tap to confirm.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handlePhoneApprove} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: '#1a6b3c', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
                  Approve
                </button>
                <button onClick={handlePhoneDecline} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 11, cursor: 'pointer' }}>
                  Decline
                </button>
              </div>
            </div>
          </div>
        );

      case 'pin':
        return (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🔐</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 3, textAlign: 'center' }}>Enter 5-digit PIN</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 14, textAlign: 'center' }}>
              Confirm E{numericAmount.toFixed(2)} to RDA Portal
            </div>
            {/* PIN dots */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', background: i < pinValue.length ? '#1a6b3c' : 'transparent', borderColor: i < pinValue.length ? '#1a6b3c' : 'rgba(255,255,255,0.4)', transition: 'all .1s' }} />
              ))}
            </div>
            {/* PIN pad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, width: 160 }}>
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <button key={d} onClick={() => handlePinPress(d)} style={{ height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>
                  {d}
                </button>
              ))}
              <div />
              <button onClick={() => handlePinPress('0')} style={{ height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>0</button>
              <button onClick={handlePinDelete} style={{ height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>⌫</button>
            </div>
            {pinError && (
              <div style={{ fontSize: 11, color: '#f87171', marginTop: 10, textAlign: 'center', animation: 'rdaShake .3s' }}>{pinError}</div>
            )}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>Hint: correct PIN is 12345</div>
          </div>
        );

      case 'processing':
        return (
          <div style={{ position: 'absolute', inset: 0, background: '#0f1a12', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 30 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #1a6b3c', animation: 'rdaSpin 1s linear infinite' }} />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Processing payment…</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Please wait</div>
          </div>
        );

      case 'success':
        return (
          <div style={{ position: 'absolute', inset: 0, background: '#0a1f0f', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 30, animation: 'rdaFadeIn .4s' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#1a6b3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Payment successful!</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 14 }}>{txRef}</div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 10 }}>
              {[
                ['Amount paid', `E${numericAmount.toFixed(2)}`],
                ['Service', 'Tractor booking'],
                ['To', 'RDA Portal'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
                  <span style={{ color: '#fff' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Redirecting to confirmation…</div>
          </div>
        );

      case 'declined':
        return (
          <div style={{ position: 'absolute', inset: 0, background: '#1a0a0a', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 30, animation: 'rdaFadeIn .4s' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>✗</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 6 }}>Payment declined</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 16 }}>You declined this payment request.</div>
            <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.8)', padding: '8px 20px', fontSize: 12, cursor: 'pointer' }}>
              Try again
            </button>
          </div>
        );
    }
  };

  // ── Modal layout ────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes rdaSlide{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rdaFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes rdaShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        @keyframes rdaSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

          {/* Modal header */}
          <div className="bg-green-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaMobile className="text-white text-2xl" />
              <div>
                <h3 className="text-lg font-bold text-white">MoMo Payment Simulation</h3>
                <p className="text-green-200 text-xs">Booking #{bookingId} · E{numericAmount.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={onCancel} className="text-green-200 hover:text-white transition text-xl font-bold">✕</button>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col sm:flex-row">

            {/* ── Left: Portal side ── */}
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">RDA Portal — Payment request</p>

              {/* Amount */}
              <div className="bg-green-50 rounded-xl p-4 mb-5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Amount due</p>
                  <p className="text-2xl font-bold text-green-700">E{numericAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="text-sm font-medium text-gray-700">Tractor booking</p>
                </div>
              </div>

              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farmer MoMo number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">+268</span>
                  <input
                    type="tel"
                    value={portalPhone}
                    onChange={(e) => {
                      setPortalPhone(e.target.value.replace(/\D/g, '').slice(0, 8));
                      setPortalPhoneError('');
                    }}
                    placeholder="76 123 456"
                    disabled={phoneScreen !== 'home'}
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Format: 76XXXXXX or 78XXXXXX (Eswatini Mobile)</p>
                {portalPhoneError && <p className="text-xs text-red-600 mt-1">{portalPhoneError}</p>}
              </div>

              {/* Send button */}
              <button
                onClick={handleSendRequest}
                disabled={sendingRequest || phoneScreen !== 'home' || portalPhone.length < 8}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                {sendingRequest ? (
                  <><FaSpinner className="animate-spin" /> Sending request…</>
                ) : phoneScreen !== 'home' ? (
                  <><FaCheckCircle /> Request sent to phone</>
                ) : (
                  <><FaMobile /> Send payment request</>
                )}
              </button>

              {/* Status tracker */}
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Payment request sent', done: phoneScreen !== 'home' },
                  { label: 'Farmer approved on phone', done: phoneScreen === 'pin' || phoneScreen === 'processing' || phoneScreen === 'success' },
                  { label: 'PIN verified', done: phoneScreen === 'processing' || phoneScreen === 'success' },
                  { label: 'Payment confirmed', done: phoneScreen === 'success' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${s.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                      {s.done ? '✓' : '○'}
                    </div>
                    <span className={`text-sm ${s.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-start gap-2">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                  <span>Watch the phone simulation on the right. The farmer approves the notification and enters PIN <strong>12345</strong> to complete payment.</span>
                </p>
              </div>
            </div>

            {/* ── Right: Phone simulation ── */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 gap-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-start">Farmer&apos;s phone</p>

              {/* Phone device frame */}
              <div style={{ width: 200, background: '#111', borderRadius: 32, padding: 10, boxShadow: '0 0 0 1px #333, 0 8px 32px rgba(0,0,0,0.35)', position: 'relative' }}>
                <div style={{ background: '#1a1a2e', borderRadius: 24, overflow: 'hidden', minHeight: 360, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Notch */}
                  <div style={{ width: 60, height: 18, background: '#111', borderRadius: '0 0 10px 10px', margin: '0 auto 0' }} />
                  {/* Status bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 12px', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                    <span>Eswatini Mobile</span>
                    <span>🔋</span>
                  </div>
                  {/* Screen content */}
                  {renderPhoneContent()}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center max-w-[180px]">
                {phoneScreen === 'home' && 'Enter phone number and send request'}
                {phoneScreen === 'notification' && 'Farmer received push notification'}
                {phoneScreen === 'pin' && 'Farmer entering 5-digit PIN'}
                {phoneScreen === 'processing' && 'Processing payment…'}
                {phoneScreen === 'success' && 'Payment confirmed ✓'}
                {phoneScreen === 'declined' && 'Farmer declined payment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
//  Main Booking Page
// ─────────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  const [hours, setHours] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const ratePerHour = 400;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<BookingFormData>({
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      contact_number: '',
      email: '',
      location_description: '',
      available_time: '',
    },
  });

  const watchedName = watch('full_name');

  const calculateTotal = () => hours * ratePerHour;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) { toast.error('Invalid file type. Use PDF, JPG, or PNG.'); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); e.target.value = ''; return; }
    setProofFile(file);
    toast.success(`"${file.name}" uploaded`);
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('contact_number', data.contact_number);
      if (data.email) formData.append('email', data.email);
      formData.append('location_description', data.location_description);
      formData.append('available_time', data.available_time);
      formData.append('hours_booked', hours.toString());
      formData.append('payment_method', paymentMethod);
      if (proofFile) formData.append('proof_of_payment', proofFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/bookings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        if (paymentMethod === 'momo') {
          setPendingBooking(response.data.booking);
          setShowPaymentModal(true);
        } else {
          setBookingId(response.data.booking.id);
          setSubmitted(true);
          toast.success('Booking submitted successfully!');
          reset();
          setHours(2);
          setPaymentMethod('momo');
          setProofFile(null);
        }
      }
    } catch (error: any) {
      let msg = 'Error submitting booking. Please try again.';
      if (error.response) msg = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
      else if (error.request) msg = 'Cannot connect to server. Please check if the server is running.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setBookingId(pendingBooking?.id ?? null);
    setSubmitted(true);
    toast.success('Payment successful! Booking confirmed.');
    reset();
    setHours(2);
    setPaymentMethod('momo');
    setProofFile(null);
    setPendingBooking(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPendingBooking(null);
    toast.info('Payment cancelled. You can try again later.');
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString().slice(0, 16);
  };

  // ── Success screen ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4">
        <ToastContainer />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-green-600 px-6 py-8 text-center">
              <FaCheckCircle className="mx-auto text-white text-6xl mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-white">Booking Successful!</h2>
              <p className="text-green-100 mt-2">Your booking has been confirmed</p>
            </div>
            <div className="px-6 py-8">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 flex items-start gap-3">
                <FaInfoCircle className="text-green-600 text-xl mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Booking Reference: #{bookingId}</p>
                  <p className="text-green-700 text-sm mt-1">Save this reference number to track your booking status.</p>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-4">
                {[
                  ['Booking Confirmed', 'Your payment has been received and booking is confirmed.'],
                  ['Tractor Assignment', "We'll assign a tractor and notify you via SMS."],
                  ['Service Delivery', 'Tractor will arrive at your location at the scheduled time.'],
                ].map(([title, desc], i) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-medium flex-shrink-0">{i + 1}</div>
                    <div>
                      <p className="text-gray-700 font-medium">{title}</p>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <button onClick={() => router.push('/')} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">Go to Home</button>
                <button onClick={() => { setSubmitted(false); setBookingId(null); }} className="flex-1 bg-white text-green-600 border-2 border-green-600 py-3 rounded-lg hover:bg-green-50 transition font-medium">Book Another</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />

      {showPaymentModal && pendingBooking && (
        <MoMoPaymentModal
          bookingId={pendingBooking.id}
          amount={pendingBooking.total_amount}
          farmerName={watchedName}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaTractor className="text-5xl text-green-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Book Tractor Service</h1>
          <p className="mt-3 text-lg text-gray-600">Fill in your details to book tractor services at E{ratePerHour}/hour</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
            <FaInfoCircle className="text-green-600 mr-2" />
            <span className="text-green-800 text-sm font-medium">
              {paymentMethod === 'momo'
                ? 'You will receive a MoMo push notification to confirm payment on your phone'
                : 'Your booking will be confirmed by admin within 24 hours'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Personal Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FaUser className="text-green-600 mr-2" /> Personal Details
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" {...register('full_name', { required: 'Full name is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                        className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black" placeholder="Enter your name" />
                    </div>
                    {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" {...register('contact_number', { required: 'Contact number is required', pattern: { value: /^[0-9+\-\s()]{10,15}$/, message: 'Invalid phone number format' } })}
                        className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black" placeholder="+268 76123456" />
                    </div>
                    {errors.contact_number && <p className="mt-1 text-sm text-red-600">{errors.contact_number.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" {...register('email', { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email address' } })}
                        className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black" placeholder="youremail@example.com" />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FaMapMarkerAlt className="text-green-600 mr-2" /> Service Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Description <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea {...register('location_description', { required: 'Location is required', minLength: { value: 10, message: 'At least 10 characters' } })}
                        rows={3} className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        placeholder="Provide detailed location including landmarks…" />
                    </div>
                    {errors.location_description && <p className="mt-1 text-sm text-red-600">{errors.location_description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hours Required <span className="text-red-500">*</span></label>
                      <div className="flex items-center space-x-4">
                        <input type="range" min="1" max="24" value={hours} onChange={(e) => setHours(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                        <span className="text-lg font-semibold text-green-600 min-w-[4rem] text-center">{hours}h</span>
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-500"><span>1 hour</span><span>24 hours</span></div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="datetime-local" {...register('available_time', {
                          required: 'Preferred time is required',
                          validate: (v) => {
                            const s = new Date(v); const n = new Date(); n.setHours(n.getHours() + 2);
                            return s > n || 'Select a time at least 2 hours from now';
                          }
                        })} min={getMinDateTime()}
                          className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black" />
                      </div>
                      {errors.available_time && <p className="mt-1 text-sm text-red-600">{errors.available_time.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FaMoneyBillWave className="text-green-600 mr-2" /> Payment Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: 'momo', icon: <FaMobile className={`text-2xl mr-3 ${paymentMethod === 'momo' ? 'text-green-600' : 'text-gray-400'}`} />, label: 'MoMo Payment', sub: 'Phone push notification + PIN' },
                        { value: 'bank_transfer', icon: <FaCreditCard className={`text-2xl mr-3 ${paymentMethod === 'bank_transfer' ? 'text-green-600' : 'text-gray-400'}`} />, label: 'Payment slip', sub: 'Upload proof of payment' },
                      ].map((m) => (
                        <label key={m.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === m.value ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <input type="radio" value={m.value} checked={paymentMethod === m.value} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                          {m.icon}
                          <div>
                            <span className="block font-medium text-black">{m.label}</span>
                            <span className="text-sm text-gray-500">{m.sub}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'momo' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FaInfoCircle className="text-yellow-600 text-xl mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">MoMo Payment Process</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            1. Enter your Eswatini Mobile number (76x or 78x)<br />
                            2. A push notification appears on your phone<br />
                            3. Approve it and enter your 5-digit PIN<br />
                            4. Amount <strong>E{calculateTotal()}.00</strong> will be deducted from your wallet
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Payment</label>
                      <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="file-upload" />
                      <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition cursor-pointer">
                        <FaUpload className="text-gray-400 mr-2" />
                        <span className="text-gray-600">{proofFile ? proofFile.name : 'Click to upload bank transfer receipt'}</span>
                      </label>
                      <p className="mt-2 text-xs text-gray-500">Accepted: PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  {[
                    ['Service Hours', `${hours} hour${hours !== 1 ? 's' : ''}`],
                    ['Rate per Hour', `E${ratePerHour}.00`],
                    ['Payment Method', paymentMethod === 'momo' ? 'MoMo Payment' : 'Bank Transfer'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-gray-600">{l}:</span>
                      <span className="font-medium text-black capitalize">{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-green-200 pt-3 mt-3 flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">E{calculateTotal()}.00</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {loading ? (
                  <><FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" /> Processing…</>
                ) : (
                  paymentMethod === 'momo' ? 'Proceed to MoMo Payment' : 'Submit Booking'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                By submitting, you agree to our{' '}
                <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { Icon: FaPhone, label: 'Call Us', value: '+268 2404 1234' },
              { Icon: FaWhatsapp, label: 'WhatsApp', value: '+268 76123456' },
              { Icon: FaEnvelope, label: 'Email', value: 'support@rda.co.sz' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="p-3 hover:bg-gray-50 rounded-lg transition">
                <Icon className="mx-auto text-green-600 text-2xl mb-2" />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-500">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
