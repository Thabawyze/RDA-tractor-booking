'use client';
import { useState } from 'react';
import { FaTimes, FaTractor, FaCalendarAlt, FaClock, FaMoneyBillWave, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface BookingModalProps {
  tractor: {
    id: string;
    model: string;
    tractor_number: string;
    hourly_rate: string | number;
    inkhundla_name: string;
    image_url?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ tractor, onClose, onSuccess }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    farmerName: '',
    farmerPhone: '',
    farmerEmail: '',
    address: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total hours and cost
  const calculateBookingDetails = () => {
    if (!bookingData.startDate || !bookingData.endDate || !bookingData.startTime || !bookingData.endTime) {
      return { totalHours: 0, totalCost: 0 };
    }

    const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
    const totalCost = totalHours * parseFloat(tractor.hourly_rate.toString());

    return { totalHours, totalCost };
  };

  const { totalHours, totalCost } = calculateBookingDetails();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.startDate) newErrors.startDate = 'Start date is required';
    if (!bookingData.endDate) newErrors.endDate = 'End date is required';
    if (!bookingData.startTime) newErrors.startTime = 'Start time is required';
    if (!bookingData.endTime) newErrors.endTime = 'End time is required';
    
    // Validate that end date is after start date
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Validate that end time is after start time on same day
    if (bookingData.startDate === bookingData.endDate && 
        bookingData.startTime && bookingData.endTime) {
      if (bookingData.endTime <= bookingData.startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    // Check minimum hours (2 hours minimum)
    if (totalHours > 0 && totalHours < 2) {
      newErrors.endTime = 'Minimum booking is 2 hours';
    }

    // Check maximum hours (12 hours per day)
    if (totalHours > 12) {
      newErrors.endTime = 'Maximum booking is 12 hours per day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.farmerName) newErrors.farmerName = 'Full name is required';
    if (!bookingData.farmerPhone) newErrors.farmerPhone = 'Phone number is required';
    if (!bookingData.farmerEmail) newErrors.farmerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(bookingData.farmerEmail)) {
      newErrors.farmerEmail = 'Email is invalid';
    }
    if (!bookingData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make your actual API call
      // await axios.post('/api/bookings', {
      //   tractor_id: tractor.id,
      //   ...bookingData,
      //   total_hours: totalHours,
      //   total_cost: totalCost
      // });
      
      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: 'Failed to create booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get max date (30 days from today)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Book Tractor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Tractor Summary */}
        <div className="bg-green-50 p-6 border-b border-green-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {tractor.image_url ? (
                <img src={tractor.image_url} alt={tractor.model} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <FaTractor className="text-white text-4xl" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{tractor.model}</h3>
              <p className="text-sm text-gray-600 mb-2">#{tractor.tractor_number}</p>
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-1 text-green-600" />
                {tractor.inkhundla_name}
              </div>
              <div className="flex items-center mt-2 text-green-700 font-semibold">
                <FaMoneyBillWave className="mr-1" />
                E{parseFloat(tractor.hourly_rate.toString()).toFixed(2)} / hour
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Booking Details</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${
              step >= 2 ? 'bg-green-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Your Information</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Booking Dates & Times</h3>
              
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="startDate"
                    value={bookingData.startDate}
                    onChange={handleChange}
                    min={today}
                    max={maxDateStr}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="startTime"
                    value={bookingData.startTime}
                    onChange={handleChange}
                    min="07:00"
                    max="16:30"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Operating hours: 7:30 AM - 4:30 PM</p>
                {errors.startTime && (
                  <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="endDate"
                    value={bookingData.endDate}
                    onChange={handleChange}
                    min={bookingData.startDate || today}
                    max={maxDateStr}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="endTime"
                    value={bookingData.endTime}
                    onChange={handleChange}
                    min="07:00"
                    max="16:30"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.endTime && (
                  <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Booking
                </label>
                <select
                  name="purpose"
                  value={bookingData.purpose}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select purpose...</option>
                  <option value="ploughing">Land Ploughing</option>
                  <option value="planting">Planting</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Booking Summary */}
              {totalHours > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Booking Summary</h4>
                  <div className="flex justify-between text-sm text-blue-800 mb-1">
                    <span>Total Hours:</span>
                    <span className="font-semibold">{totalHours.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-800">
                    <span>Total Cost:</span>
                    <span className="font-semibold">E{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contact Information</h3>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="farmerName"
                    value={bookingData.farmerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.farmerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.farmerName && (
                  <p className="mt-1 text-xs text-red-600">{errors.farmerName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="farmerPhone"
                    value={bookingData.farmerPhone}
                    onChange={handleChange}
                    placeholder="e.g., +268 7612 3456"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.farmerPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.farmerPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.farmerPhone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="farmerEmail"
                  value={bookingData.farmerEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.farmerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.farmerEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.farmerEmail}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm/Field Address *
                </label>
                <textarea
                  name="address"
                  value={bookingData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter the location where tractor services are needed"
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="additionalNotes"
                  value={bookingData.additionalNotes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any special requirements or instructions"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Booking Summary */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p><span className="font-medium">Tractor:</span> {tractor.model}</p>
                  <p><span className="font-medium">Duration:</span> {totalHours.toFixed(1)} hours</p>
                  <p><span className="font-medium">Total Cost:</span> E{totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : step === 1 ? (
                'Continue'
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            By confirming this booking, you agree to our terms of service and cancellation policy.
            You can cancel for free up to 24 hours before the booking starts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;