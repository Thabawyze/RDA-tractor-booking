'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import MoMoPayment from '../../components/MoMoPayment'; // Adjust path as needed

export default function TestPaymentPage() {
  const [showPayment, setShowPayment] = useState(false);
  
  // Sample booking data for testing
  const testBooking = {
    id: 123,
    total_amount: 1600,
    booking_reference: 'TEST-001'
  };

  const handleSuccess = () => {
    console.log('✅ Payment successful!');
    setShowPayment(false);
    // You can redirect or show success message
    alert('Payment successful! Booking confirmed.');
  };

  const handleCancel = () => {
    console.log('❌ Payment cancelled');
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test MoMo Payment</h1>
        
        {!showPayment ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Test Booking #{testBooking.id}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Amount: <span className="font-bold text-green-600">E{testBooking.total_amount}</span>
            </p>
            <button
              onClick={() => setShowPayment(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Pay with MoMo
            </button>
          </div>
        ) : (
          <MoMoPayment
            booking={testBooking}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}