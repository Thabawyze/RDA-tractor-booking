'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  FaStar, FaTractor, FaCheckCircle, FaSpinner,
  FaThumbsUp, FaLeaf, FaCommentDots, FaSmile,
  FaMeh, FaFrown, FaPhone, FaWhatsapp, FaEnvelope,
  FaArrowLeft, FaCamera,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface FeedbackFormData {
  overall_rating: number;
  service_quality: number;
  punctuality: number;
  operator_conduct: number;
  would_recommend: boolean | null;
  comments: string;
  improvement_suggestions: string;
  issues_encountered: string;
}

// ─────────────────────────────────────────────────────────────
//  Star rating component
// ─────────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  size = 'md',
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' };
  const labels: Record<number, string> = {
    1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent',
  };

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`${sizes[size]} transition-transform hover:scale-110 focus:outline-none`}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <FaStar
              className={
                star <= (hovered || value)
                  ? 'text-yellow-400 drop-shadow'
                  : 'text-gray-200'
              }
            />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-600">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Sentiment selector
// ─────────────────────────────────────────────────────────────
function SentimentSelector({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-4">
      {[
        { val: true,  Icon: FaThumbsUp, label: 'Yes, definitely!', color: 'green' },
        { val: false, Icon: FaFrown,    label: 'No, not likely',    color: 'red'   },
      ].map(({ val, Icon, label, color }) => (
        <button
          key={String(val)}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition
            ${value === val
              ? color === 'green'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'}`}
        >
          <Icon className="text-2xl" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Success screen
// ─────────────────────────────────────────────────────────────
function SuccessScreen({ refNumber }: { refNumber: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <FaCheckCircle className="text-green-600 text-5xl" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Thank You! 🌾</h2>
        <p className="text-gray-500 text-lg mb-2">
          Your feedback has been submitted successfully.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Reference: <span className="font-mono font-semibold text-green-600">{refNumber}</span>
        </p>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <FaLeaf className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Your feedback helps the RDA improve tractor services for all farmers in Eswatini.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FaStar className="text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Your rating has been recorded. Highly rated operators receive priority assignments.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FaCommentDots className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Your suggestions have been forwarded to the RDA management team for review.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/bookings"
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold
              hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <FaTractor /> Book Again
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 border-2 border-green-600 text-green-700 rounded-xl
              font-semibold hover:bg-green-50 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Inner feedback form (uses useSearchParams — must be in Suspense)
// ─────────────────────────────────────────────────────────────
function FeedbackForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const refNumber = searchParams.get('ref') || '';
  const bookingId = searchParams.get('id')  || '';

  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState<1 | 2 | 3>(1);

  const [form, setForm] = useState<FeedbackFormData>({
    overall_rating:        0,
    service_quality:       0,
    punctuality:           0,
    operator_conduct:      0,
    would_recommend:       null,
    comments:              '',
    improvement_suggestions: '',
    issues_encountered:    '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const setRating = (field: keyof FeedbackFormData, val: number) =>
    setForm((f) => ({ ...f, [field]: val }));

  const canProceedStep1 = form.overall_rating > 0;
  const canProceedStep2 = form.service_quality > 0 && form.punctuality > 0 && form.operator_conduct > 0;
  const canSubmit       = form.would_recommend !== null;

  const handleSubmit = async () => {
    if (!canSubmit) { toast.error('Please tell us if you would recommend this service.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/bookings/${bookingId}/feedback`, {
        ...form,
        reference_number: refNumber,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessScreen refNumber={refNumber} />;

  const overallEmoji =
    form.overall_rating >= 4 ? '😊' :
    form.overall_rating === 3 ? '😐' :
    form.overall_rating > 0  ? '😟' : '⭐';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaStar className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Rate Your Service</h1>
          {refNumber && (
            <p className="mt-2 text-sm text-gray-400 font-mono">
              Booking reference: <span className="text-green-600 font-semibold">{refNumber}</span>
            </p>
          )}
          <p className="mt-1 text-gray-500">
            Your feedback helps us deliver better tractor services to all farmers in Eswatini
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition
                ${s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-green-600 text-white ring-4 ring-green-100' :
                  'bg-gray-200 text-gray-400'}`}>
                {s < step ? <FaCheckCircle className="text-sm" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Overall rating ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-7 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-3">{overallEmoji}</div>
              <h2 className="text-xl font-bold text-gray-900">Overall, how was your experience?</h2>
              <p className="text-sm text-gray-400 mt-1">Step 1 of 3 — Overall satisfaction</p>
            </div>

            <div className="flex justify-center">
              <StarRating
                value={form.overall_rating}
                onChange={(v) => setRating('overall_rating', v)}
                size="lg"
              />
            </div>

            {form.overall_rating > 0 && (
              <div className={`rounded-xl p-4 text-center animate-[fadeIn_.3s_ease]
                ${form.overall_rating >= 4 ? 'bg-green-50 text-green-700' :
                  form.overall_rating === 3 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'}`}>
                <p className="font-semibold text-lg">
                  {form.overall_rating === 5 && 'Excellent! We\'re glad you loved it! 🌟'}
                  {form.overall_rating === 4 && 'Great! Thank you for the positive rating! 👍'}
                  {form.overall_rating === 3 && 'Thank you. We\'ll work to improve! 🌱'}
                  {form.overall_rating === 2 && 'We\'re sorry it wasn\'t better. We\'ll improve! 🙏'}
                  {form.overall_rating === 1 && 'We sincerely apologise. Your feedback matters! 💙'}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold
                hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next — Rate specific aspects →
            </button>
          </div>
        )}

        {/* ── STEP 2: Specific ratings ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-7 space-y-7">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Rate specific aspects</h2>
              <p className="text-sm text-gray-400">Step 2 of 3 — Detailed service feedback</p>
            </div>

            {[
              { field: 'service_quality'  as const, label: '🌾 Quality of tractor service', hint: 'Was the ploughing/harrowing done to your satisfaction?' },
              { field: 'punctuality'      as const, label: '⏰ Punctuality & timeliness',   hint: 'Did the tractor arrive at the agreed time?' },
              { field: 'operator_conduct' as const, label: '👷 Operator professionalism',   hint: 'Was the tractor operator respectful and helpful?' },
            ].map(({ field, label, hint }) => (
              <div key={field} className="pb-5 border-b border-gray-100 last:border-0">
                <StarRating
                  value={form[field] as number}
                  onChange={(v) => setRating(field, v)}
                  label={label}
                />
                <p className="text-xs text-gray-400 mt-1">{hint}</p>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold
                  hover:bg-gray-50 transition flex items-center gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold
                  hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next — Final comments →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Comments + recommendation ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-7 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Final comments</h2>
              <p className="text-sm text-gray-400">Step 3 of 3 — Share your thoughts</p>
            </div>

            {/* Would recommend */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Would you recommend RDA tractor services to other farmers? <span className="text-red-500">*</span>
              </p>
              <SentimentSelector
                value={form.would_recommend}
                onChange={(v) => setForm((f) => ({ ...f, would_recommend: v }))}
              />
            </div>

            {/* General comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCommentDots className="inline mr-1 text-green-600" />
                General comments <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                rows={3}
                placeholder="Tell us about your overall experience with the service…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Issues encountered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any problems or issues encountered? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.issues_encountered}
                onChange={(e) => setForm((f) => ({ ...f, issues_encountered: e.target.value }))}
                rows={2}
                placeholder="e.g. Tractor arrived late, fuel issues, incomplete work…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Improvement suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How can we improve? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.improvement_suggestions}
                onChange={(e) => setForm((f) => ({ ...f, improvement_suggestions: e.target.value }))}
                rows={2}
                placeholder="Your suggestions are valuable to us…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Summary of ratings */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your ratings summary</p>
              <div className="space-y-2">
                {[
                  ['Overall experience',     form.overall_rating],
                  ['Service quality',        form.service_quality],
                  ['Punctuality',            form.punctuality],
                  ['Operator professionalism', form.operator_conduct],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <FaStar key={s} className={`text-sm ${s <= Number(val) ? 'text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold
                  hover:bg-gray-50 transition flex items-center gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-base
                  hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition
                  flex items-center justify-center gap-2 shadow-md"
              >
                {loading
                  ? <><FaSpinner className="animate-spin" /> Submitting…</>
                  : <><FaCheckCircle /> Submit Feedback</>}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Your feedback is confidential and used only to improve RDA services
            </p>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Need assistance?</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { Icon: FaPhone,    label: 'Call',      value: '+268 2404 1234' },
              { Icon: FaWhatsapp, label: 'WhatsApp',  value: '+268 76123456'  },
              { Icon: FaEnvelope, label: 'Email',     value: 'support@rda.co.sz' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="p-2 hover:bg-gray-50 rounded-xl transition">
                <Icon className="mx-auto text-green-600 text-lg mb-1" />
                <p className="text-xs font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Default export — wrapped in Suspense for useSearchParams
// ─────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
      </div>
    }>
      <FeedbackForm />
    </Suspense>
  );
}
