'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, FaSearch, FaSpinner, FaBug, FaSeedling, 
  FaLeaf, FaTractor, FaAppleAlt, FaCarrot, FaInfoCircle,
  FaCheckCircle, FaExclamationTriangle, FaFlask, FaBook,
  FaImage, FaUpload, FaCamera, FaMicroscope, FaSyringe,
  FaHeartbeat, FaCalendarAlt, FaUserMd, FaFileAlt,
  FaDownload, FaShare, FaPrint, FaEye, FaClock,
  FaTemperatureHigh, FaCloudRain, FaWind, FaSun
} from 'react-icons/fa';

interface Disease {
  id: number;
  name: string;
  scientific_name: string;
  crop_type: string;
  crop_family: string;
  symptoms: string[];
  cause: string;
  transmission: string;
  favorable_conditions: string[];
  treatment: string[];
  prevention: string[];
  organic_treatment: string[];
  chemical_treatment: string[];
  image_url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prevalence: 'common' | 'seasonal' | 'rare' | 'epidemic';
  affected_regions: string[];
  season: string[];
  economic_impact: string;
  response_time: string;
}

interface SymptomMatch {
  disease_id: number;
  disease_name: string;
  match_percentage: number;
  matched_symptoms: string[];
}

interface DiseaseReport {
  id: number;
  farmer_name: string;
  location: string;
  crop_type: string;
  symptoms_description: string;
  images: string[];
  reported_date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  diagnosis?: string;
  recommendations?: string;
}

const CropDiseasesPage = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [symptomMatches, setSymptomMatches] = useState<SymptomMatch[]>([]);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    farmer_name: '',
    location: '',
    crop_type: '',
    symptoms_description: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Eswatini-specific crop diseases data
  const eswatiniDiseases: Disease[] = [
    {
      id: 1,
      name: "Maize Lethal Necrosis",
      scientific_name: "Maize lethal necrosis virus (MLNV)",
      crop_type: "Maize",
      crop_family: "Cereals",
      symptoms: [
        "Rapid yellowing and drying of leaves",
        "Necrotic (dead) patches on leaves",
        "Stunted plant growth",
        "Poor or no ear formation",
        "Premature plant death"
      ],
      cause: "Co-infection of Maize chlorotic mottle virus (MCMV) and Sugarcane mosaic virus (SCMV)",
      transmission: "Insect vectors (thrips, aphids), infected seeds, mechanical tools",
      favorable_conditions: [
        "Warm temperatures (25-30°C)",
        "High insect populations",
        "Continuous maize cropping",
        "Presence of alternative hosts"
      ],
      treatment: [
        "Remove and destroy infected plants immediately",
        "Practice strict field sanitation",
        "Use certified disease-free seeds",
        "Apply recommended insecticides for vector control"
      ],
      prevention: [
        "Plant resistant maize varieties",
        "Practice crop rotation with non-host crops",
        "Control insect vectors early in season",
        "Use barrier crops around maize fields",
        "Maintain 3-4 year rotation cycle"
      ],
      organic_treatment: [
        "Neem oil spray (5ml/L) every 7 days",
        "Garlic-chili extract for insect control",
        "Companion planting with repellent crops",
        "Use of yellow sticky traps for thrips"
      ],
      chemical_treatment: [
        "Imidacloprid seed treatment",
        "Cypermethrin foliar spray at first sign",
        "Lambda-cyhalothrin for vector control",
        "Soil drench with systemic insecticides"
      ],
      image_url: "",
      severity: "high",
      prevalence: "seasonal",
      affected_regions: ["Lubombo", "Hhohho", "Manzini"],
      season: ["December", "January", "February", "March"],
      economic_impact: "Can cause 50-100% yield loss",
      response_time: "Act within 7-10 days of first symptoms"
    },
    {
      id: 2,
      name: "Tomato Late Blight",
      scientific_name: "Phytophthora infestans",
      crop_type: "Tomato",
      crop_family: "Solanaceae",
      symptoms: [
        "Dark, water-soaked lesions on leaves",
        "White fuzzy growth on leaf undersides",
        "Brown-black patches on stems",
        "Dark, greasy spots on fruit",
        "Rapid plant collapse in wet conditions"
      ],
      cause: "Oomycete pathogen thriving in cool, moist conditions",
      transmission: "Wind-blown spores, rain splash, infected plant debris",
      favorable_conditions: [
        "Cool temperatures (15-22°C)",
        "High humidity (>90%)",
        "Prolonged leaf wetness",
        "Dense plant canopy"
      ],
      treatment: [
        "Remove and destroy infected plant parts",
        "Improve air circulation",
        "Apply copper-based fungicides",
        "Avoid overhead irrigation"
      ],
      prevention: [
        "Use resistant tomato varieties",
        "Practice crop rotation (3-4 years)",
        "Apply preventive fungicides before rainy season",
        "Space plants properly for air flow",
        "Water at base of plants only"
      ],
      organic_treatment: [
        "Copper hydroxide spray (Bordeaux mixture)",
        "Baking soda solution (1 tbsp/L water)",
        "Compost tea as foliar spray",
        "Milk spray (1:9 ratio with water)"
      ],
      chemical_treatment: [
        "Mancozeb (every 7-10 days)",
        "Chlorothalonil",
        "Metalaxyl for severe infections",
        "Famoxadone + Cymoxanil"
      ],
      image_url: "",
      severity: "high",
      prevalence: "common",
      affected_regions: ["All regions", "Especially Manzini", "Hhohho"],
      season: ["November", "December", "January", "February"],
      economic_impact: "30-70% yield loss if uncontrolled",
      response_time: "Treat within 5-7 days"
    },
    {
      id: 3,
      name: "Cassava Mosaic Disease",
      scientific_name: "Cassava mosaic geminivirus (CMG)",
      crop_type: "Cassava",
      crop_family: "Euphorbiaceae",
      symptoms: [
        "Yellow-green mosaic pattern on leaves",
        "Distorted, curled leaves",
        "Stunted plant growth",
        "Reduced root size and quality",
        "Leaf chlorosis and malformation"
      ],
      cause: "Geminivirus transmitted by whiteflies",
      transmission: "Whitefly vectors (Bemisia tabaci), infected cuttings",
      favorable_conditions: [
        "Dry conditions favoring whitefly populations",
        "Use of infected planting material",
        "Presence of alternative weed hosts",
        "High temperature (25-35°C)"
      ],
      treatment: [
        "Uproot and destroy infected plants",
        "Use only virus-free planting material",
        "Control whitefly populations",
        "Roguing (removal of infected plants)"
      ],
      prevention: [
        "Plant resistant/tolerant varieties",
        "Use certified disease-free cuttings",
        "Intercrop with repellent crops",
        "Regular field scouting",
        "Remove alternative hosts (weeds)"
      ],
      organic_treatment: [
        "Neem oil for whitefly control",
        "Yellow sticky traps for monitoring",
        "Reflective mulches to repel whiteflies",
        "Release beneficial insects (ladybugs)"
      ],
      chemical_treatment: [
        "Imidacloprid soil application",
        "Buprofezin for whitefly control",
        "Pymetrozine as foliar spray"
      ],
      image_url: "",
      severity: "high",
      prevalence: "common",
      affected_regions: ["Lubombo", "Shiselweni", "Manzini"],
      season: ["September", "October", "November", "April", "May"],
      economic_impact: "20-90% yield loss depending on variety",
      response_time: "Remove infected plants immediately"
    },
    {
      id: 4,
      name: "Citrus Greening (Huanglongbing)",
      scientific_name: "Candidatus Liberibacter asiaticus",
      crop_type: "Citrus",
      crop_family: "Rutaceae",
      symptoms: [
        "Yellow shoots on branches",
        "Blotchy mottled leaves",
        "Lopsided, small, bitter fruits",
        "Premature fruit drop",
        "Stunted tree growth"
      ],
      cause: "Bacteria transmitted by Asian citrus psyllid",
      transmission: "Citrus psyllid insect vector, infected graft wood",
      favorable_conditions: [
        "Warm temperatures (25-30°C)",
        "Flushing of new growth",
        "Presence of psyllid populations",
        "Poor orchard management"
      ],
      treatment: [
        "Remove and destroy infected trees",
        "Control psyllid populations aggressively",
        "Use disease-free nursery stock",
        "Apply antibiotics in severe cases"
      ],
      prevention: [
        "Plant certified disease-free trees",
        "Regular psyllid monitoring",
        "Apply systemic insecticides",
        "Remove alternative host plants",
        "Use reflective mulch"
      ],
      organic_treatment: [
        "Kaolin clay spray as repellent",
        "Neem oil (weekly application)",
        "Release Tamarixia radiata (parasitic wasp)",
        "Garlic and chili pepper spray"
      ],
      chemical_treatment: [
        "Imidacloprid soil drench",
        "Spirotetramat for psyllid control",
        "Cyantraniliprole foliar spray",
        "Fenpropathrin during flush growth"
      ],
      image_url: "",
      severity: "critical",
      prevalence: "seasonal",
      affected_regions: ["Lubombo", "Manzini"],
      season: ["October", "November", "December", "January"],
      economic_impact: "100% yield loss over 3-5 years",
      response_time: "Immediate action required"
    },
    {
      id: 5,
      name: "Bean Rust",
      scientific_name: "Uromyces appendiculatus",
      crop_type: "Beans",
      crop_family: "Fabaceae",
      symptoms: [
        "Small reddish-brown pustules on leaves",
        "Yellow halos around pustules",
        "Premature leaf drop",
        "Reduced pod fill",
        "Stunted plant growth"
      ],
      cause: "Fungal pathogen",
      transmission: "Wind-borne spores, infected crop debris",
      favorable_conditions: [
        "Moderate temperatures (18-25°C)",
        "High humidity",
        "Prolonged leaf wetness",
        "Dense plant spacing"
      ],
      treatment: [
        "Remove infected lower leaves",
        "Apply fungicides at first sign",
        "Improve air circulation",
        "Avoid overhead irrigation"
      ],
      prevention: [
        "Plant resistant bean varieties",
        "Practice crop rotation (2-3 years)",
        "Use disease-free seeds",
        "Space plants properly",
        "Apply preventive fungicides"
      ],
      organic_treatment: [
        "Sulfur dust (every 7-10 days)",
        "Baking soda and oil spray",
        "Compost tea application",
        "Serenade (Bacillus subtilis)"
      ],
      chemical_treatment: [
        "Chlorothalonil",
        "Mancozeb",
        "Tebuconazole",
        "Azoxystrobin"
      ],
      image_url: "",
      severity: "medium",
      prevalence: "common",
      affected_regions: ["All bean-growing regions"],
      season: ["February", "March", "April", "September", "October"],
      economic_impact: "20-40% yield loss",
      response_time: "Treat within 10-14 days"
    },
    {
      id: 6,
      name: "Banana Bunchy Top",
      scientific_name: "Banana bunchy top virus (BBTV)",
      crop_type: "Banana",
      crop_family: "Musaceae",
      symptoms: [
        "Dark green streaks on leaves and stems",
        "Narrow, upright leaves (bunchy appearance)",
        "Stunted growth",
        "No fruit production",
        "Jagged leaf margins"
      ],
      cause: "Virus transmitted by banana aphids",
      transmission: "Banana aphid (Pentalonia nigronervosa), infected suckers",
      favorable_conditions: [
        "Presence of aphid vectors",
        "Use of infected planting material",
        "Warm, humid conditions",
        "Poor field hygiene"
      ],
      treatment: [
        "Destroy entire infected mat including roots",
        "Remove all volunteer banana plants",
        "Control aphid populations",
        "Quarantine affected area"
      ],
      prevention: [
        "Use tissue-culture plantlets only",
        "Regular aphid monitoring",
        "Apply systemic insecticides",
        "Remove alternative hosts",
        "Establish buffer zones"
      ],
      organic_treatment: [
        "Neem oil for aphid control",
        "Insecticidal soap spray",
        "Release ladybugs",
        "Reflective mulches"
      ],
      chemical_treatment: [
        "Imidacloprid soil application",
        "Dimethoate foliar spray",
        "Pirimicarb for aphid control"
      ],
      image_url: "",
      severity: "critical",
      prevalence: "rare",
      affected_regions: ["Lubombo", "Hhohho"],
      season: ["Year-round", "Peak in rainy season"],
      economic_impact: "100% crop loss",
      response_time: "Immediate eradication required"
    },
    {
      id: 7,
      name: "Groundnut Rosette",
      scientific_name: "Groundnut rosette virus (GRV)",
      crop_type: "Groundnut",
      crop_family: "Fabaceae",
      symptoms: [
        "Severe stunting of plants",
        "Yellowing and mottling of leaves",
        "Distorted, rosette-like growth",
        "Reduced pod formation",
        "Chlorotic rings on leaves"
      ],
      cause: "Virus complex transmitted by aphids",
      transmission: "Aphid vectors (Aphis craccivora)",
      favorable_conditions: [
        "Dry conditions favoring aphids",
        "Late planting",
        "High aphid populations",
        "Continuous groundnut cropping"
      ],
      treatment: [
        "Uproot and destroy infected plants",
        "Control aphid vectors",
        "Use virus-free seeds",
        "Practice field sanitation"
      ],
      prevention: [
        "Plant resistant varieties",
        "Early planting to avoid aphid peak",
        "Intercrop with cereals",
        "Regular field scouting",
        "Apply insecticides at emergence"
      ],
      organic_treatment: [
        "Neem oil spray (weekly)",
        "Aloe vera extract",
        "Soap solution for aphids",
        "Yellow sticky traps"
      ],
      chemical_treatment: [
        "Imidacloprid seed treatment",
        "Lambda-cyhalothrin foliar spray",
        "Dimethoate for severe infestations"
      ],
      image_url: "",
      severity: "high",
      prevalence: "seasonal",
      affected_regions: ["Shiselweni", "Lubombo"],
      season: ["November", "December", "January"],
      economic_impact: "50-80% yield loss",
      response_time: "Act within 14 days"
    },
    {
      id: 8,
      name: "Coffee Berry Borer",
      scientific_name: "Hypothenemus hampei",
      crop_type: "Coffee",
      crop_family: "Rubiaceae",
      symptoms: [
        "Small holes in coffee berries",
        "Premature berry drop",
        "Discolored, damaged beans",
        "Reduced bean quality",
        "Visible beetles in damaged berries"
      ],
      cause: "Insect borer pest",
      transmission: "Adult beetles flying between berries, infested berries",
      favorable_conditions: [
        "Warm, humid conditions",
        "Shaded coffee plantations",
        "Incomplete harvesting",
        "Presence of leftover berries"
      ],
      treatment: [
        "Remove and destroy infested berries",
        "Harvest all berries completely",
        "Apply recommended insecticides",
        "Introduce natural predators"
      ],
      prevention: [
        "Regular field sanitation",
        "Trapping with alcohol-based lures",
        "Biological control with Beauveria bassiana",
        "Shade management",
        "Complete strip picking"
      ],
      organic_treatment: [
        "Beauveria bassiana fungus spray",
        "Boric acid bait traps",
        "Neem cake application",
        "Release of parasitoid wasps"
      ],
      chemical_treatment: [
        "Endosulfan (banned in some areas)",
        "Chlorpyrifos",
        "Cypermethrin"
      ],
      image_url: "",
      severity: "medium",
      prevalence: "seasonal",
      affected_regions: ["Lubombo"],
      season: ["March", "April", "May", "June"],
      economic_impact: "30-50% quality and yield loss",
      response_time: "Monitor and treat during flowering"
    }
  ];

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [searchTerm, selectedCrop, selectedSeverity, selectedSeason, diseases]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/advisory/crop-diseases`).catch(() => ({ data: { success: false } }));
      
      if (response.data.success && response.data.diseases.length > 0) {
        setDiseases(response.data.diseases);
      } else {
        setDiseases(eswatiniDiseases);
      }
      toast.info('Showing crop disease information for Eswatini');
    } catch (error) {
      console.error('Error fetching diseases:', error);
      setDiseases(eswatiniDiseases);
      toast.warning('Using cached disease data');
    } finally {
      setLoading(false);
    }
  };

  const filterDiseases = () => {
    let filtered = [...diseases];
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCrop !== 'all') {
      filtered = filtered.filter(d => d.crop_type === selectedCrop);
    }
    
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(d => d.severity === selectedSeverity);
    }
    
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(d => d.season.includes(selectedSeason));
    }
    
    setFilteredDiseases(filtered);
  };

  const analyzeSymptoms = () => {
    if (!symptomsInput.trim()) {
      toast.warning('Please describe the symptoms');
      return;
    }
    
    const inputLower = symptomsInput.toLowerCase();
    const matches: SymptomMatch[] = [];
    
    diseases.forEach(disease => {
      let matchedCount = 0;
      const matchedSymptoms: string[] = [];
      
      disease.symptoms.forEach(symptom => {
        if (inputLower.includes(symptom.toLowerCase()) || 
            symptom.toLowerCase().split(' ').some(word => inputLower.includes(word))) {
          matchedCount++;
          matchedSymptoms.push(symptom);
        }
      });
      
      if (matchedCount > 0) {
        const percentage = (matchedCount / disease.symptoms.length) * 100;
        matches.push({
          disease_id: disease.id,
          disease_name: disease.name,
          match_percentage: Math.round(percentage),
          matched_symptoms: matchedSymptoms
        });
      }
    });
    
    matches.sort((a, b) => b.match_percentage - a.match_percentage);
    setSymptomMatches(matches.slice(0, 5));
    setShowSymptomChecker(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-700 text-white';
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPrevalenceBadge = (prevalence: string) => {
    switch (prevalence) {
      case 'common': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Common</span>;
      case 'seasonal': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Seasonal</span>;
      case 'rare': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Rare</span>;
      case 'epidemic': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Epidemic Risk</span>;
      default: return null;
    }
  };

  const uniqueCrops = [...new Set(diseases.map(d => d.crop_type))];
  const seasons = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Disease report submitted successfully! An expert will review it shortly.');
    setShowReportForm(false);
    setReportForm({
      farmer_name: '',
      location: '',
      crop_type: '',
      symptoms_description: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading crop disease information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/advisory" className="hover:bg-white/20 p-2 rounded-lg transition">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Crop Disease Identification</h1>
                <p className="text-purple-100 mt-1">Identify, prevent, and manage crop diseases in Eswatini</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-4 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                Grid View
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-4 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                List View
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <FaDownload size={14} /> Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 cursor-pointer hover:shadow-md transition" onClick={() => setShowSymptomChecker(true)}>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-full">
                <FaMicroscope className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Symptom Checker</h3>
                <p className="text-sm text-gray-600">Describe symptoms to identify disease</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 cursor-pointer hover:shadow-md transition" onClick={() => setShowReportForm(true)}>
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-full">
                <FaFileAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Report Disease</h3>
                <p className="text-sm text-gray-600">Submit crop disease report</p>
              </div>
            </div>
          </div>
          <Link href="/advisory/expert-consultation" className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-3 rounded-full">
                <FaUserMd className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Expert Consultation</h3>
                <p className="text-sm text-gray-600">Connect with agricultural experts</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Diseases</p>
                <p className="text-2xl font-bold text-gray-900">{diseases.length}</p>
              </div>
              <FaBug className="text-3xl text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Crops Covered</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueCrops.length}</p>
              </div>
              <FaSeedling className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">High Severity</p>
                <p className="text-2xl font-bold text-red-600">{diseases.filter(d => d.severity === 'high' || d.severity === 'critical').length}</p>
              </div>
              <FaExclamationTriangle className="text-3xl text-red-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Reports</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <FaEye className="text-3xl text-blue-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search diseases, crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Crops</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Seasons</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">Found {filteredDiseases.length} diseases</p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Diseases Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => { setSelectedDisease(disease); setShowModal(true); }}
              >
                <div className={`${getSeverityColor(disease.severity)} h-2`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaBug className="text-purple-600" />
                      <h3 className="font-semibold text-gray-900">{disease.name}</h3>
                    </div>
                    {getPrevalenceBadge(disease.prevalence)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Crop:</span> {disease.crop_type}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    <span className="font-medium">Symptoms:</span> {disease.symptoms[0]}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(disease.severity)} bg-opacity-20 text-${disease.severity === 'critical' ? 'red-700' : disease.severity === 'high' ? 'red-600' : disease.severity === 'medium' ? 'yellow-700' : 'green-700'}`}>
                      {disease.severity.toUpperCase()} severity
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {disease.season[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disease</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Symptoms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDiseases.map((disease) => (
                    <tr key={disease.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{disease.name}</p>
                          <p className="text-xs text-gray-500 italic">{disease.scientific_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{disease.crop_type}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(disease.severity)}`}>
                          {disease.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{disease.symptoms[0]}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {disease.season.slice(0, 2).map(s => (
                            <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelectedDisease(disease); setShowModal(true); }}
                          className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seasonal Disease Calendar */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" />
            Seasonal Disease Calendar for Eswatini
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Summer (Nov-Feb)', 'Autumn (Mar-May)', 'Winter (Jun-Aug)', 'Spring (Sep-Oct)'].map((season, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-2">{season}</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {diseases.filter(d => {
                    if (season.includes('Summer')) return d.season.some(s => ['November', 'December', 'January', 'February'].includes(s));
                    if (season.includes('Autumn')) return d.season.some(s => ['March', 'April', 'May'].includes(s));
                    if (season.includes('Winter')) return d.season.some(s => ['June', 'July', 'August'].includes(s));
                    if (season.includes('Spring')) return d.season.some(s => ['September', 'October'].includes(s));
                    return false;
                  }).slice(0, 3).map(d => (
                    <li key={d.id}>• {d.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            General Disease Prevention Tips for Eswatini Farmers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-700">1. Crop Rotation</p>
              <p className="text-sm text-gray-600">Rotate crops every 2-3 years to break disease cycles. Avoid planting same crop family in same field consecutively.</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-700">2. Use Resistant Varieties</p>
              <p className="text-sm text-gray-600">Plant disease-resistant varieties recommended for Eswatini conditions.</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-700">3. Field Sanitation</p>
              <p className="text-sm text-gray-600">Remove crop residues, control weeds, and clean tools between fields.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Details Modal */}
      {showModal && selectedDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedDisease.name}</h3>
                <p className="text-gray-500 italic">{selectedDisease.scientific_name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedDisease.severity)}`}>
                  {selectedDisease.severity.toUpperCase()} Severity
                </span>
                {getPrevalenceBadge(selectedDisease.prevalence)}
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  <FaSeedling className="inline mr-1" /> {selectedDisease.crop_type}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FaBug className="text-purple-600" /> Symptoms
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedDisease.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Cause & Transmission</h4>
                    <p className="text-gray-600 mb-2"><span className="font-medium">Cause:</span> {selectedDisease.cause}</p>
                    <p className="text-gray-600"><span className="font-medium">Transmission:</span> {selectedDisease.transmission}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Favorable Conditions</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedDisease.favorable_conditions.map((condition, idx) => (
                        <li key={idx}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FaFlask className="text-blue-600" /> Treatment Options
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-green-700">Organic Treatment:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedDisease.organic_treatment.map((treatment, idx) => (
                            <li key={idx}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-orange-700">Chemical Treatment:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedDisease.chemical_treatment.map((treatment, idx) => (
                            <li key={idx}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prevention</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedDisease.prevention.map((prevention, idx) => (
                        <li key={idx}>{prevention}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm"><span className="font-medium">📊 Economic Impact:</span> {selectedDisease.economic_impact}</p>
                    <p className="text-sm mt-1"><span className="font-medium">⏱️ Response Time:</span> {selectedDisease.response_time}</p>
                    <p className="text-sm mt-1"><span className="font-medium">📍 Affected Regions:</span> {selectedDisease.affected_regions.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                  <FaDownload className="inline mr-2" /> Download Treatment Guide
                </button>
                <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  <FaShare className="inline mr-2" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Checker Modal */}
      {showSymptomChecker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => { setShowSymptomChecker(false); setSymptomMatches([]); }}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaMicroscope className="text-purple-600" /> Disease Symptom Checker
              </h3>
              <button onClick={() => { setShowSymptomChecker(false); setSymptomMatches([]); }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the symptoms you're seeing on your crops:
                </label>
                <textarea
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Example: Leaves have yellow spots with dark brown edges, plants are wilting, there's white powdery substance on leaf surfaces..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={5}
                />
                <button
                  onClick={analyzeSymptoms}
                  className="mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Analyze Symptoms
                </button>
              </div>

              {symptomMatches.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Possible Diseases ({symptomMatches.length} matches):</h4>
                  <div className="space-y-3">
                    {symptomMatches.map((match) => {
                      const disease = diseases.find(d => d.id === match.disease_id);
                      return (
                        <div key={match.disease_id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedDisease(disease!); setShowModal(true); setShowSymptomChecker(false); }}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900">{match.disease_name}</h5>
                            <span className="text-sm font-medium text-purple-600">{match.match_percentage}% match</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${match.match_percentage}%` }} />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Matched symptoms:</span> {match.matched_symptoms.join(', ')}
                          </p>
                          {disease && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Treatment:</span> {disease.treatment[0]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {symptomMatches.length === 0 && symptomsInput && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">No matching diseases found. Please try describing more specific symptoms or contact an agricultural expert.</p>
                  <button className="mt-3 text-purple-600 hover:text-purple-700">Contact Expert →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Disease Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowReportForm(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaFileAlt className="text-green-600" /> Report Crop Disease
              </h3>
              <button onClick={() => setShowReportForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
                  <input
                    type="text"
                    value={reportForm.farmer_name}
                    onChange={(e) => setReportForm({...reportForm, farmer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Region, Chiefdom)</label>
                  <input
                    type="text"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <input
                    type="text"
                    value={reportForm.crop_type}
                    onChange={(e) => setReportForm({...reportForm, crop_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms Description</label>
                  <textarea
                    value={reportForm.symptoms_description}
                    onChange={(e) => setReportForm({...reportForm, symptoms_description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500">
                    <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-500">Click or drag photos here</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Submit Report
                </button>
                <button type="button" onClick={() => setShowReportForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDiseasesPage;