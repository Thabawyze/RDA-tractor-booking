'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, FaHandHoldingUsd, FaSeedling, FaTractor, FaFileAlt, 
  FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaExternalLinkAlt,
  FaFilter, FaSearch, FaDownload, FaPrint, FaShare, FaBuilding,
  FaUsers, FaLandmark, FaUniversity, FaChartLine, FaShieldAlt,
  FaInfoCircle, FaPercent, FaWallet, FaRegClock, FaFileInvoice
} from 'react-icons/fa';

interface Subsidy {
  id: number;
  name: string;
  provider: string;
  provider_type: 'government' | 'fincorp' | 'bank' | 'ngo' | 'international';
  scheme_name: string;
  description: string;
  eligibility_criteria: string[];
  required_documents: string[];
  subsidy_percentage: number;
  max_amount: number;
  min_amount?: number;
  interest_rate?: number;
  repayment_period?: string;
  application_deadline: string;
  status: 'active' | 'upcoming' | 'closed' | 'limited';
  category: 'crops' | 'livestock' | 'equipment' | 'irrigation' | 'training' | 'general';
  region: string[];
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  application_process: string[];
  benefits: string[];
}

interface Application {
  id: number;
  subsidy_id: number;
  farmer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  applied_date: string;
  amount_requested: number;
}

const SubsidiesPage = () => {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [filteredSubsidies, setFilteredSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'fincorp' | 'government' | 'banks'>('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Eswatini-specific subsidies data including FINCORP
  const eswatiniSubsidies: Subsidy[] = [
    {
      id: 1,
      name: "Young Farmer Financing Scheme",
      provider: "FINCORP Eswatini",
      provider_type: "fincorp",
      scheme_name: "Youth in Agriculture",
      description: "Special financing facility for young farmers aged 18-35 to start or expand agricultural operations. Includes flexible repayment terms and reduced interest rates.",
      eligibility_criteria: [
        "Age between 18-35 years",
        "Eswatini citizen",
        "Completed basic agricultural training",
        "Have access to at least 0.5 hectares of land",
        "Business plan required"
      ],
      required_documents: [
        "Valid national ID card",
        "Proof of residence",
        "Land ownership/lease agreement",
        "Detailed business plan",
        "Bank statements (last 6 months)",
        "Two reference letters"
      ],
      subsidy_percentage: 0,
      max_amount: 500000,
      min_amount: 50000,
      interest_rate: 5,
      repayment_period: "5 years",
      application_deadline: "2025-12-31",
      status: "active",
      category: "general",
      region: ["All regions of Eswatini"],
      contact_person: "Nomsa Dlamini",
      contact_phone: "+268 2404 6000",
      contact_email: "youth@fincorp.co.sz",
      website: "https://www.fincorp.co.sz",
      application_process: [
        "Complete application form online or at any FINCORP branch",
        "Submit required documents",
        "Business plan review and assessment",
        "Interview with credit committee",
        "Approval and disbursement"
      ],
      benefits: [
        "Reduced interest rate (5%)",
        "Grace period of 6 months",
        "Technical assistance provided",
        "Mentorship program included",
        "Access to FINCORP farmer network"
      ]
    },
    {
      id: 2,
      name: "Women in Agriculture Empowerment Fund",
      provider: "FINCORP Eswatini",
      provider_type: "fincorp",
      scheme_name: "Gender Equality in Farming",
      description: "Dedicated financing for female farmers to support agricultural enterprises, from subsistence to commercial farming.",
      eligibility_criteria: [
        "Female farmers aged 21-60",
        "Eswatini citizen",
        "Member of a farming cooperative (preferred)",
        "Minimum 1 year farming experience",
        "Valid business registration"
      ],
      required_documents: [
        "National ID",
        "Marriage certificate (if applicable)",
        "Farm registration documents",
        "Business plan",
        "Cooperative membership proof",
        "Tax clearance certificate"
      ],
      subsidy_percentage: 10,
      max_amount: 750000,
      min_amount: 100000,
      interest_rate: 4.5,
      repayment_period: "7 years",
      application_deadline: "2025-10-31",
      status: "active",
      category: "general",
      region: ["All regions"],
      contact_person: "Thandiwe Mamba",
      contact_phone: "+268 2404 6001",
      contact_email: "women@fincorp.co.sz",
      website: "https://www.fincorp.co.sz",
      application_process: [
        "Women in Ag info session attendance",
        "Application submission",
        "Document verification",
        "Farm visit and assessment",
        "Approval and fund disbursement"
      ],
      benefits: [
        "10% subsidy on principal amount",
        "Lower interest rate (4.5%)",
        "Business development training",
        "Networking opportunities",
        "Market linkage support"
      ]
    },
    {
      id: 3,
      name: "Smallholder Farmer Input Subsidy",
      provider: "Ministry of Agriculture - Eswatini Government",
      provider_type: "government",
      scheme_name: "National Agricultural Input Voucher Scheme",
      description: "Government subsidy program providing vouchers for seeds, fertilizers, and other agricultural inputs to smallholder farmers.",
      eligibility_criteria: [
        "Smallholder farmer with <5 hectares",
        "Registered with local chiefdom",
        "Priority to vulnerable households",
        "Must demonstrate farming activity"
      ],
      required_documents: [
        "Chiefdom registration letter",
        "National ID",
        "Land allocation letter",
        "Previous season harvest records"
      ],
      subsidy_percentage: 70,
      max_amount: 25000,
      application_deadline: "2025-08-31",
      status: "active",
      category: "crops",
      region: ["All 4 regions: Hhohho, Manzini, Lubombo, Shiselweni"],
      contact_person: "Agricultural Extension Officer",
      contact_phone: "+268 2404 2731",
      contact_email: "agriculture@gov.sz",
      website: "https://www.gov.sz/agriculture",
      application_process: [
        "Visit nearest agricultural extension office",
        "Complete registration form",
        "Verification by extension officer",
        "Receive input voucher",
        "Redeem at approved agro-dealers"
      ],
      benefits: [
        "70% subsidy on inputs",
        "Free technical advice",
        "Access to improved seeds",
        "Farmer training sessions"
      ]
    },
    {
      id: 4,
      name: "Irrigation Infrastructure Development",
      provider: "National Agricultural Marketing Board (NAMBoard)",
      provider_type: "government",
      scheme_name: "Water for Food",
      description: "Support for farmers to install or improve irrigation systems, including drip irrigation, sprinklers, and water harvesting structures.",
      eligibility_criteria: [
        "Commercial or emerging farmer",
        "Access to water source",
        "Minimum 2 hectares of cultivated land",
        "Matching contribution required (30%)"
      ],
      required_documents: [
        "Farm ownership proof",
        "Water rights permit",
        "Irrigation plan from engineer",
        "Quotes from suppliers",
        "Environmental impact assessment"
      ],
      subsidy_percentage: 40,
      max_amount: 1500000,
      application_deadline: "2025-09-30",
      status: "active",
      category: "irrigation",
      region: ["All regions", "Priority to drought-prone areas"],
      contact_person: "Irrigation Department",
      contact_phone: "+268 2404 2876",
      contact_email: "irrigation@namboard.sz",
      website: "https://www.namboard.co.sz",
      application_process: [
        "Submit concept note",
        "Technical assessment",
        "Matching fund verification",
        "Approval and fund release",
        "Implementation and monitoring"
      ],
      benefits: [
        "40% capital cost subsidy",
        "Technical support",
        "Reduced water usage",
        "Increased crop yields"
      ]
    },
    {
      id: 5,
      name: "Livestock Development Scheme",
      provider: "Eswatini Bank",
      provider_type: "bank",
      scheme_name: "Cattle and Goat Farming Support",
      description: "Financing for livestock farmers to purchase animals, build kraals, and invest in veterinary services.",
      eligibility_criteria: [
        "Registered livestock farmer",
        "Minimum 10 cattle or 30 goats",
        "Dipping compliance certificate",
        "Land for grazing"
      ],
      required_documents: [
        "Farm registration",
        "Veterinary health certificate",
        "Land lease/ownership",
        "2 years tax returns",
        "Livestock inventory"
      ],
      subsidy_percentage: 0,
      max_amount: 1000000,
      min_amount: 200000,
      interest_rate: 8.5,
      repayment_period: "8 years",
      application_deadline: "2025-11-30",
      status: "active",
      category: "livestock",
      region: ["Manzini", "Lubombo", "Shiselweni"],
      contact_person: "Agricultural Banking Unit",
      contact_phone: "+268 2407 3000",
      contact_email: "agribusiness@eswatibank.co.sz",
      application_process: [
        "Business plan submission",
        "Veterinary assessment",
        "Credit evaluation",
        "Security perfection",
        "Disbursement"
      ],
      benefits: [
        "Flexible repayment structure",
        "Insurance included",
        "Veterinary support",
        "Market access assistance"
      ]
    },
    {
      id: 6,
      name: "Farm Mechanization Program",
      provider: "FINCORP Eswatini",
      provider_type: "fincorp",
      scheme_name: "Tractors and Equipment Financing",
      description: "Financing for purchase of tractors, harvesters, planters, and other farm machinery with subsidized interest rates.",
      eligibility_criteria: [
        "Commercial farmer or cooperative",
        "Minimum 5 hectares cultivated",
        "Machinery maintenance plan",
        "Training certificate for operation"
      ],
      required_documents: [
        "Farm business plan",
        "Machinery quotes",
        "Proof of land ownership",
        "Tax clearance",
        "Two years financial statements"
      ],
      subsidy_percentage: 15,
      max_amount: 2500000,
      min_amount: 300000,
      interest_rate: 6,
      repayment_period: "5 years",
      application_deadline: "2025-12-31",
      status: "active",
      category: "equipment",
      region: ["All regions"],
      contact_person: "Muzi Simelane",
      contact_phone: "+268 2404 6002",
      contact_email: "mechanization@fincorp.co.sz",
      application_process: [
        "Equipment needs assessment",
        "Supplier quotation submission",
        "Credit assessment",
        "Deposit payment (15%)",
        "Disbursement to supplier"
      ],
      benefits: [
        "15% government subsidy on machinery",
        "Insurance coverage included",
        "Operator training provided",
        "Maintenance support"
      ]
    },
    {
      id: 7,
      name: "Climate-Smart Agriculture Grant",
      provider: "UNDP Eswatini",
      provider_type: "international",
      scheme_name: "Climate Resilience Fund",
      description: "Grant funding for farmers adopting climate-smart agricultural practices including conservation agriculture, agroforestry, and drought-resistant crops.",
      eligibility_criteria: [
        "Smallholder farmer",
        "Located in climate-vulnerable area",
        "Willing to adopt new practices",
        "Part of farmer group (preferred)"
      ],
      required_documents: [
        "Farm assessment report",
        "Climate vulnerability assessment",
        "Proposed intervention plan",
        "Group registration (if applicable)"
      ],
      subsidy_percentage: 100,
      max_amount: 50000,
      application_deadline: "2025-07-31",
      status: "upcoming",
      category: "crops",
      region: ["Drought-prone areas", "Lubombo", "Shiselweni"],
      contact_person: "Climate Resilience Officer",
      contact_phone: "+268 2404 2301",
      contact_email: "climate@undp.org.sz",
      application_process: [
        "Expression of interest",
        "Site visit and assessment",
        "Training attendance",
        "Implementation plan approval",
        "Grant disbursement in phases"
      ],
      benefits: [
        "Full grant (no repayment)",
        "Technical support",
        "Climate monitoring tools",
        "Access to climate information"
      ]
    },
    {
      id: 8,
      name: "Cooperative Development Fund",
      provider: "Ministry of Commerce - Cooperatives Unit",
      provider_type: "government",
      scheme_name: "Co-op Enterprise Support",
      description: "Support for agricultural cooperatives including working capital, equipment, and training.",
      eligibility_criteria: [
        "Registered agricultural cooperative",
        "Minimum 10 members",
        "Operational for at least 6 months",
        "Regular meeting minutes available"
      ],
      required_documents: [
        "Cooperative registration certificate",
        "Member list",
        "Constitution",
        "Business plan",
        "Audited accounts (if available)"
      ],
      subsidy_percentage: 50,
      max_amount: 500000,
      application_deadline: "2025-10-31",
      status: "active",
      category: "general",
      region: ["All regions"],
      contact_person: "Cooperatives Registrar",
      contact_phone: "+268 2404 2663",
      contact_email: "cooperatives@gov.sz",
      application_process: [
        "Cooperative registration verification",
        "Business plan submission",
        "Assessment by Cooperatives Unit",
        "Approval and training",
        "Fund disbursement"
      ],
      benefits: [
        "50% matching grant",
        "Business management training",
        "Audit support",
        "Market linkage"
      ]
    },
    {
      id: 9,
      name: "Agri-Processing Equipment Loan",
      provider: "Eswatini Development Finance Corporation (EDFC)",
      provider_type: "bank",
      scheme_name: "Value Addition Facility",
      description: "Financing for agro-processing equipment including mills, packaging machines, cold storage, and processing units.",
      eligibility_criteria: [
        "Agri-processing enterprise",
        "Valid trading license",
        "Environmental compliance",
        "Quality control systems in place"
      ],
      required_documents: [
        "Business registration",
        "Equipment quotes",
        "Market study",
        "3 years projections",
        "Collateral documentation"
      ],
      subsidy_percentage: 0,
      max_amount: 5000000,
      min_amount: 500000,
      interest_rate: 7.5,
      repayment_period: "10 years",
      application_deadline: "2025-12-31",
      status: "active",
      category: "equipment",
      region: ["All regions"],
      contact_person: "Business Development Manager",
      contact_phone: "+268 2404 5000",
      contact_email: "agribusiness@edfc.co.sz",
      application_process: [
        "Pre-application consultation",
        "Business plan and feasibility study",
        "Credit assessment",
        "Legal documentation",
        "Disbursement and monitoring"
      ],
      benefits: [
        "Long repayment period",
        "Interest rate subsidy available",
        "Technical advisory services",
        "Export assistance"
      ]
    },
    {
      id: 10,
      name: "Youth Agri-Entrepreneurship Bootcamp",
      provider: "FINCORP Eswatini",
      provider_type: "fincorp",
      scheme_name: "Start and Grow",
      description: "Training + seed funding for young agri-entrepreneurs. Includes 2-week intensive bootcamp followed by mentorship and financing.",
      eligibility_criteria: [
        "Age 18-30",
        "Completed secondary education",
        "Innovative agribusiness idea",
        "Passion for agriculture",
        "Available for full-time training"
      ],
      required_documents: [
        "Application form",
        "Business idea summary",
        "Academic certificates",
        "Recommendation letter",
        "ID copy"
      ],
      subsidy_percentage: 30,
      max_amount: 150000,
      min_amount: 30000,
      interest_rate: 3,
      repayment_period: "3 years",
      application_deadline: "2025-09-15",
      status: "upcoming",
      category: "training",
      region: ["All regions"],
      contact_person: "Youth Program Coordinator",
      contact_phone: "+268 2404 6003",
      contact_email: "youthagri@fincorp.co.sz",
      application_process: [
        "Online application",
        "Pitch competition",
        "Bootcamp attendance",
        "Business plan development",
        "Seed funding disbursement"
      ],
      benefits: [
        "Intensive training (2 weeks)",
        "Seed funding up to E150,000",
        "One-year mentorship",
        "Coworking space access",
        "Investor demo day opportunity"
      ]
    }
  ];

  useEffect(() => {
    // Fetch from API if available, otherwise use local data
    const fetchSubsidies = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/advisory/subsidies`).catch(() => ({ data: { success: false } }));
        if (response.data.success && response.data.subsidies.length > 0) {
          setSubsidies(response.data.subsidies);
          setFilteredSubsidies(response.data.subsidies);
        } else {
          setSubsidies(eswatiniSubsidies);
          setFilteredSubsidies(eswatiniSubsidies);
        }
      } catch (error) {
        console.error('Error fetching subsidies:', error);
        setSubsidies(eswatiniSubsidies);
        setFilteredSubsidies(eswatiniSubsidies);
        toast.info('Showing sample Eswatini subsidies data');
      } finally {
        setLoading(false);
      }
    };
    fetchSubsidies();
  }, []);

  useEffect(() => {
    let filtered = [...subsidies];

    // Filter by provider tab
    if (activeTab === 'fincorp') {
      filtered = filtered.filter(s => s.provider_type === 'fincorp');
    } else if (activeTab === 'government') {
      filtered = filtered.filter(s => s.provider_type === 'government');
    } else if (activeTab === 'banks') {
      filtered = filtered.filter(s => s.provider_type === 'bank' || s.provider_type === 'international');
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.scheme_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubsidies(filtered);
  }, [activeTab, selectedCategory, searchTerm, subsidies]);

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'fincorp': return 'bg-blue-600';
      case 'government': return 'bg-green-600';
      case 'bank': return 'bg-purple-600';
      case 'international': return 'bg-teal-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium"><FaCheckCircle size={12} /> Active</span>;
      case 'upcoming': return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium"><FaClock size={12} /> Upcoming</span>;
      case 'closed': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium"><FaTimesCircle size={12} /> Closed</span>;
      case 'limited': return <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded-full text-xs font-medium"><FaInfoCircle size={12} /> Limited Slots</span>;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crops': return <FaSeedling className="text-green-600" />;
      case 'livestock': return <FaTractor className="text-brown-600" />;
      case 'equipment': return <FaTractor className="text-blue-600" />;
      case 'irrigation': return <FaHandHoldingUsd className="text-cyan-600" />;
      case 'training': return <FaFileAlt className="text-purple-600" />;
      default: return <FaHandHoldingUsd className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Eswatini agricultural subsidies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-green-800 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/advisory" className="hover:bg-white/20 p-2 rounded-lg transition">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Agricultural Subsidies & Financing</h1>
                <p className="text-blue-100 mt-1">Eswatini - Government, FINCORP, and Development Partners</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <FaDownload size={14} /> Download Guide
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <FaPrint size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Schemes</p>
                <p className="text-2xl font-bold text-gray-900">{subsidies.length}</p>
              </div>
              <FaHandHoldingUsd className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">FINCORP Schemes</p>
                <p className="text-2xl font-bold text-blue-600">{subsidies.filter(s => s.provider_type === 'fincorp').length}</p>
              </div>
              <FaBuilding className="text-3xl text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Programs</p>
                <p className="text-2xl font-bold text-green-600">{subsidies.filter(s => s.status === 'active').length}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Max Funding</p>
                <p className="text-2xl font-bold text-purple-600">E5M+</p>
              </div>
              <FaChartLine className="text-3xl text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* FINCORP Spotlight */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaBuilding className="text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">FINCORP Eswatini</h2>
                <p className="text-blue-100 mt-1">Your Partner in Agricultural Development</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="https://www.fincorp.co.sz" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition flex items-center gap-2">
                Visit Website <FaExternalLinkAlt size={12} />
              </a>
              <a href="tel:+26824046000" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <FaPhoneAlt /> Contact
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">Interest Rates</p>
              <p className="text-xl font-bold">From 3%</p>
              <p className="text-xs opacity-75">For youth & women</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">Loan Amount</p>
              <p className="text-xl font-bold">Up to E2.5M</p>
              <p className="text-xs opacity-75">For machinery</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">Repayment</p>
              <p className="text-xl font-bold">Up to 10 Years</p>
              <p className="text-xs opacity-75">Flexible terms</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 pb-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'all' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Schemes
              </button>
              <button
                onClick={() => setActiveTab('fincorp')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'fincorp' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaBuilding className="inline mr-1" /> FINCORP
              </button>
              <button
                onClick={() => setActiveTab('government')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'government' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaLandmark className="inline mr-1" /> Government
              </button>
              <button
                onClick={() => setActiveTab('banks')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'banks' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaUniversity className="inline mr-1" /> Banks & Partners
              </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                <option value="crops">Crops</option>
                <option value="livestock">Livestock</option>
                <option value="equipment">Equipment</option>
                <option value="irrigation">Irrigation</option>
                <option value="training">Training</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">Found {filteredSubsidies.length} schemes available</p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Subsidies Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredSubsidies.map((subsidy) => (
            <div key={subsidy.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
              <div className={`${getProviderColor(subsidy.provider_type)} h-2`} />
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${getProviderColor(subsidy.provider_type)} bg-opacity-10 p-3 rounded-full`}>
                      {subsidy.provider_type === 'fincorp' ? <FaBuilding className={`text-${getProviderColor(subsidy.provider_type).replace('bg-', '')}`} /> : <FaHandHoldingUsd className={`text-${getProviderColor(subsidy.provider_type).replace('bg-', '')}`} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{subsidy.name}</h3>
                      <p className="text-gray-500">{subsidy.provider} • {subsidy.scheme_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(subsidy.status)}
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                      {getCategoryIcon(subsidy.category)} {subsidy.category.charAt(0).toUpperCase() + subsidy.category.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{subsidy.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Funding Amount</p>
                    <p className="font-semibold text-gray-900">
                      {subsidy.min_amount ? `E${subsidy.min_amount.toLocaleString()} - ` : ''}E{subsidy.max_amount.toLocaleString()}
                    </p>
                    {subsidy.subsidy_percentage > 0 && (
                      <p className="text-xs text-green-600">{subsidy.subsidy_percentage}% subsidy available</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Interest Rate / Terms</p>
                    <p className="font-semibold text-gray-900">
                      {subsidy.interest_rate ? `${subsidy.interest_rate}%` : 'Grant / Subsidy'}
                    </p>
                    {subsidy.repayment_period && (
                      <p className="text-xs text-gray-500">Repayment: {subsidy.repayment_period}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Application Deadline</p>
                    <p className="font-semibold text-gray-900">{new Date(subsidy.application_deadline).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Regions: {subsidy.region.join(', ')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedSubsidy(subsidy);
                      setShowModal(true);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    View Details & Apply
                  </button>
                  {subsidy.website && (
                    <a
                      href={subsidy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                    >
                      Provider Website <FaExternalLinkAlt size={12} />
                    </a>
                  )}
                  <button className="text-gray-500 hover:text-gray-700 px-3 py-2">
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Application Tips */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-yellow-600" />
            Tips for Successful Application
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-gray-800">1. Prepare Your Documents</p>
              <p className="text-sm text-gray-600">Have all required documents ready and organized before applying.</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">2. Write a Clear Business Plan</p>
              <p className="text-sm text-gray-600">Include realistic projections, market analysis, and implementation timeline.</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">3. Follow Up</p>
              <p className="text-sm text-gray-600">Contact the provider after submission to confirm receipt and timeline.</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-green-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Need Assistance?</h3>
          <p className="text-gray-600 mb-4">Contact the Agricultural Advisory Service for help with applications</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="tel:+26824042731" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
              <FaPhoneAlt /> Call Agricultural Hotline
            </a>
            <a href="mailto:advisory@agriculture.gov.sz" className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition flex items-center gap-2">
              <FaEnvelope /> Email Advisory Service
            </a>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {showModal && selectedSubsidy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedSubsidy.name}</h3>
                <p className="text-gray-500 text-sm">{selectedSubsidy.provider}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 mb-4">{selectedSubsidy.description}</p>

                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                    {selectedSubsidy.eligibility_criteria.map((criterion, idx) => (
                      <li key={idx}>{criterion}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                    {selectedSubsidy.required_documents.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                    {selectedSubsidy.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold text-gray-900 mb-2">Application Process</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 mb-4">
                    {selectedSubsidy.application_process.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>

                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-gray-600 mb-4">
                    {selectedSubsidy.contact_person && <p><span className="font-medium">Contact Person:</span> {selectedSubsidy.contact_person}</p>}
                    {selectedSubsidy.contact_phone && <p><span className="font-medium">Phone:</span> <a href={`tel:${selectedSubsidy.contact_phone}`} className="text-blue-600">{selectedSubsidy.contact_phone}</a></p>}
                    {selectedSubsidy.contact_email && <p><span className="font-medium">Email:</span> <a href={`mailto:${selectedSubsidy.contact_email}`} className="text-blue-600">{selectedSubsidy.contact_email}</a></p>}
                    {selectedSubsidy.website && <p><span className="font-medium">Website:</span> <a href={selectedSubsidy.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{selectedSubsidy.website}</a></p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">
                  Start Application
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubsidiesPage;