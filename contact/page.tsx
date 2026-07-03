'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaLinkedin,
  FaYoutube,
  FaPaperPlane,
  FaUser,
  FaComment,
  FaBuilding,
  FaHeadset,
  FaGlobe,
  FaFax,
  FaMobile,
  FaArrowRight,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaRegClock,
  FaRegEnvelope,
  FaRegBuilding
} from 'react-icons/fa';

// ==================== TYPES ====================

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface Office {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapUrl?: string;
}

// ==================== OFFICE LOCATIONS ====================

const offices: Office[] = [
  {
    name: 'Head Office - Mbabane',
    address: 'Plot 123, Mbabane Industrial Area, Mbabane, Eswatini',
    phone: '+268 2404 1234',
    email: 'info@rda.co.sz',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
    mapUrl: 'https://maps.google.com/?q=Mbabane,Eswatini'
  },
  {
    name: 'Manzini Regional Office',
    address: 'Plot 45, Manzini Industrial Area, Manzini, Eswatini',
    phone: '+268 2505 5678',
    email: 'manzini@rda.co.sz',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM'
  },
  {
    name: 'Nhlangano Regional Office',
    address: 'Plot 78, Nhlangano Town, Nhlangano, Eswatini',
    phone: '+268 2207 1234',
    email: 'nhlangano@rda.co.sz',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM'
  },
  {
    name: 'Siteki Regional Office',
    address: 'Plot 34, Siteki Town, Siteki, Eswatini',
    phone: '+268 2343 1234',
    email: 'siteki@rda.co.sz',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM'
  }
];

// ==================== FAQ ITEMS ====================

const faqItems = [
  {
    question: 'How do I book a tractor?',
    answer: 'You can book a tractor by creating an account and navigating to the booking page. Select your preferred date, time, and duration, then complete the payment process.'
  },
  {
    question: 'What is the cost of tractor services?',
    answer: 'The standard rate is E400 per hour with a minimum booking of 2 hours. The total cost will be calculated based on the hours you select.'
  },
  {
    question: 'How do I pay for the service?',
    answer: 'We accept MTN MoMo, credit cards, and cash payments. For MoMo payments, you will receive an OTP to complete the transaction.'
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking from your dashboard. If you have already paid, a refund will be processed to your original payment method.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us through this contact form, call our helpline at +268 2404 1234, or visit any of our regional offices.'
  }
];

// ==================== CONTACT FORM COMPONENT ====================

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Send contact message to backend
      await axios.post(`${API_URL}/api/contact`, formData);
      
      setSubmitted(true);
      toast.success('Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Enter name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="enter email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="+268 7612 3456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <div className="relative">
            <FaComment className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            >
              <option value="">Select a subject</option>
              <option value="Booking Inquiry">Booking Inquiry</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Technical Support">Technical Support</option>
              <option value="General Question">General Question</option>
              <option value="Feedback">Feedback</option>
              <option value="Complaint">Complaint</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          placeholder="Please describe your inquiry in detail..."
        />
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <FaCheckCircle className="text-green-500 mr-3 text-xl" />
          <div>
            <p className="text-green-800 font-medium">Message Sent Successfully!</p>
            <p className="text-green-600 text-sm">We'll get back to you within 24 hours.</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <FaPaperPlane className="ml-2" />
          </>
        )}
      </button>
    </form>
  );
};

// ==================== OFFICE CARD COMPONENT ====================

const OfficeCard = ({ office }: { office: Office }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6">
    <div className="flex items-start mb-4">
      <div className="p-3 bg-green-100 rounded-lg mr-4">
        <FaBuilding className="text-green-600 text-xl" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{office.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{office.address}</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center text-sm text-gray-600">
        <FaPhone className="text-green-600 mr-3 text-sm" />
        <a href={`tel:${office.phone}`} className="hover:text-green-600">
          {office.phone}
        </a>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <FaEnvelope className="text-green-600 mr-3 text-sm" />
        <a href={`mailto:${office.email}`} className="hover:text-green-600">
          {office.email}
        </a>
      </div>
      <div className="flex items-start text-sm text-gray-600">
        <FaRegClock className="text-green-600 mr-3 text-sm mt-0.5" />
        <span>{office.hours}</span>
      </div>
    </div>

    {office.mapUrl && (
      <a
        href={office.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-700"
      >
        View on Map
        <FaArrowRight className="ml-1 text-xs" />
      </a>
    )}
  </div>
);

// ==================== FAQ ACCORDION COMPONENT ====================

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqItems.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition flex justify-between items-center"
          >
            <span className="font-medium text-gray-900">{faq.question}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Have questions? We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhone className="text-2xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2">Monday to Friday, 8am - 5pm</p>
            <a href="tel:+26824041234" className="text-green-600 font-medium hover:text-green-700">
              +268 2404 1234
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2">We'll respond within 24 hours</p>
            <a href="mailto:info@rda.co.sz" className="text-green-600 font-medium hover:text-green-700">
              info@rda.co.sz
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWhatsapp className="text-2xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-2">Quick support via WhatsApp</p>
            <a href="https://wa.me/26876123456" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:text-green-700">
              +268 7612 3456
            </a>
          </div>
        </div>

        {/* Contact Form and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>
            <ContactForm />
          </div>

          {/* Support Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <FaHeadset className="text-3xl text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Customer Support</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Our dedicated support team is available to assist you with any questions or concerns.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaClock className="text-green-600 mr-3" />
                  <span className="text-gray-700">Support Hours: 24/7 Emergency Support</span>
                </div>
                <div className="flex items-center">
                  <FaRegEnvelope className="text-green-600 mr-3" />
                  <a href="mailto:support@rda.co.sz" className="text-gray-700 hover:text-green-600">
                    support@rda.co.sz
                  </a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-green-600 mr-3" />
                  <a href="tel:+26824041234" className="text-gray-700 hover:text-green-600">
                    +268 2404 1234 (24/7 Helpline)
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <FaFacebook className="text-white text-xl" />
                </a>
                <a href="#" className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition">
                  <FaTwitter className="text-white text-xl" />
                </a>
                <a href="#" className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                  <FaInstagram className="text-white text-xl" />
                </a>
                <a href="#" className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition">
                  <FaWhatsapp className="text-white text-xl" />
                </a>
                <a href="#" className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition">
                  <FaLinkedin className="text-white text-xl" />
                </a>
                <a href="#" className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                  <FaYoutube className="text-white text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Office Locations</h2>
            <p className="text-gray-600">Visit us at any of our regional offices across Eswatini</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, index) => (
              <OfficeCard key={index} office={office} />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions</p>
          </div>
          <FAQAccordion />
        </div>

        {/* Emergency Contact Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaInfoCircle className="text-red-500 text-2xl mr-2" />
            <h3 className="text-xl font-semibold text-red-800">Emergency Support</h3>
          </div>
          <p className="text-red-700 mb-4">
            For urgent tractor breakdowns or emergency agricultural assistance, call our 24/7 emergency helpline.
          </p>
          <a
            href="tel:+26824041234"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            <FaPhone className="mr-2" />
            Emergency Hotline: +268 2404 1234
          </a>
        </div>
      </div>
    </div>
  );
}