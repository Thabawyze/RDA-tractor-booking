'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaSeedling, FaPiggyBank, FaLeaf, FaCloudSun, FaWater, FaBug, FaWarehouse, FaClipboardList,
  FaNewspaper, FaDownload, FaQuestionCircle, FaCalendarAlt, FaExclamationTriangle,
  FaArrowRight, FaSearch, FaSpinner, FaStar, FaClock, FaEye, FaHeart, FaDollarSign,
  FaTractor, FaFlask, FaHandHoldingUsd, FaChartLine, FaMicroscope, FaMoneyBillWave,FaSnowflake,
  FaStore, FaTruck, FaShieldAlt, FaBook, FaVial, FaRegCalendarAlt
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  article_count: number;
  resource_count: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  estimated_read_time: number;
  view_count: number;
  published_at: string;
  category_name: string;
  category_slug: string;
}

interface WeatherAlert {
  id: number;
  title: string;
  alert_type: string;
  severity: string;
  region: string;
  message: string;
  start_date: string;
  end_date: string;
}

interface Subsidy {
  id: number;
  name: string;
  scheme_name: string;
  description: string;
  eligibility: string;
  subsidy_percentage: number;
  max_amount: number;
  deadline: string;
  status: 'active' | 'upcoming' | 'closed';
  category: string;
}

interface MarketPrice {
  id: number;
  commodity: string;
  variety: string;
  price_min: number;
  price_max: number;
  unit: string;
  market: string;
  state: string;
  district: string;
  trend: 'up' | 'down' | 'stable';
  updated_at: string;
}

interface CropDisease {
  id: number;
  name: string;
  crop_type: string;
  symptoms: string[];
  cause: string;
  treatment: string[];
  prevention: string[];
  image_url: string;
  severity: 'low' | 'medium' | 'high';
}

interface FertilizerRecommendation {
  id: number;
  crop_type: string;
  soil_type: string;
  growth_stage: string;
  fertilizer_name: string;
  npk_ratio: string;
  application_rate: string;
  application_method: string;
  timing: string;
  organic_alternative: string;
}

const categoryIcons: Record<string, any> = {
  FaSeedling, FaPiggyBank, FaLeaf, FaCloudSun, FaWater, FaBug, FaWarehouse, FaClipboardList
};

export default function AdvisoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [cropDiseases, setCropDiseases] = useState<CropDisease[]>([]);
  const [fertilizerRecs, setFertilizerRecs] = useState<FertilizerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [priceSearchTerm, setPriceSearchTerm] = useState('');
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<CropDisease | null>(null);
  const [diseaseSymptoms, setDiseaseSymptoms] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        categoriesRes, featuredRes, recentRes, alertsRes,
        subsidiesRes, marketRes, diseasesRes, fertilizerRes
      ] = await Promise.all([
        axios.get(`${API_URL}/api/advisory/categories`),
        axios.get(`${API_URL}/api/advisory/articles?featured=true&limit=3`),
        axios.get(`${API_URL}/api/advisory/articles?limit=6`),
        axios.get(`${API_URL}/api/advisory/weather-alerts`),
        axios.get(`${API_URL}/api/advisory/subsidies?limit=4`),
        axios.get(`${API_URL}/api/advisory/market-prices?limit=8`),
        axios.get(`${API_URL}/api/advisory/crop-diseases?limit=4`),
        axios.get(`${API_URL}/api/advisory/fertilizer-recommendations?limit=3`)
      ]);

      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      if (featuredRes.data.success) setFeaturedArticles(featuredRes.data.articles);
      if (recentRes.data.success) setRecentArticles(recentRes.data.articles);
      if (alertsRes.data.success) setWeatherAlerts(alertsRes.data.alerts);
      if (subsidiesRes.data.success) setSubsidies(subsidiesRes.data.subsidies);
      if (marketRes.data.success) setMarketPrices(marketRes.data.prices);
      if (diseasesRes.data.success) setCropDiseases(diseasesRes.data.diseases);
      if (fertilizerRes.data.success) setFertilizerRecs(fertilizerRes.data.recommendations);
    } catch (error) {
      console.error('Error fetching advisory data:', error);
      toast.error('Failed to load advisory content');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <FaChartLine className="text-green-600" />;
      case 'down': return <FaChartLine className="text-red-600 transform rotate-180" />;
      default: return <FaChartLine className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPrices = marketPrices.filter(price => 
    price.commodity.toLowerCase().includes(priceSearchTerm.toLowerCase()) ||
    price.market.toLowerCase().includes(priceSearchTerm.toLowerCase())
  );

  // Chart data for market trends
  const marketChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tomato (₹/kg)',
        data: [25, 28, 30, 35, 32, 38],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Potato (₹/kg)',
        data: [20, 22, 25, 23, 26, 28],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading agricultural information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Agricultural Advisory</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Expert guidance on crops, livestock, soil management, and climate-smart agriculture
            </p>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-600 text-xl mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800">Weather Alerts</h3>
                <div className="space-y-2 mt-2">
                  {weatherAlerts.map(alert => (
                    <div key={alert.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-2">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">Region: {alert.region}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Government Subsidies Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaHandHoldingUsd className="mr-2 text-green-600" />
                Government Subsidies & Schemes
              </h2>
              <p className="text-gray-600 mt-1">Available financial assistance for farmers</p>
            </div>
            <Link href="/advisory/subsidies" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              View All Schemes <FaArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subsidies.map(subsidy => (
              <div key={subsidy.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(subsidy.status)}`}>
                      {subsidy.status.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-green-600">{subsidy.subsidy_percentage}% Subsidy</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{subsidy.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subsidy.description}</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Scheme:</span> {subsidy.scheme_name}</p>
                    <p><span className="font-medium">Max Amount:</span> ₹{subsidy.max_amount.toLocaleString()}</p>
                    <p><span className="font-medium">Deadline:</span> {new Date(subsidy.deadline).toLocaleDateString()}</p>
                  </div>
                  <button className="mt-4 w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition font-medium text-sm">
                    Check Eligibility
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Prices Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaMoneyBillWave className="mr-2 text-blue-600" />
                Live Market Prices
              </h2>
              <p className="text-gray-600 mt-1">Real-time commodity prices across markets</p>
            </div>
            <Link href="/advisory/market-prices" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              View Full Market <FaArrowRight className="ml-1" />
            </Link>
          </div>

          {/* Market Price Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends (Last 6 Months)</h3>
            <div className="h-64">
              <Line data={marketChartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by commodity or market..."
                value={priceSearchTerm}
                onChange={(e) => setPriceSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commodity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPrices.slice(0, 6).map(price => (
                  <tr key={price.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{price.commodity}</p>
                        <p className="text-xs text-gray-500">{price.variety}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{price.market}</p>
                      <p className="text-xs text-gray-500">{price.district}, {price.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">₹{price.price_min} - ₹{price.price_max}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{price.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(price.trend)}
                        <span className="text-sm capitalize">{price.trend}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(price.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crop Disease Identification Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaMicroscope className="mr-2 text-purple-600" />
                Crop Disease Identification
              </h2>
              <p className="text-gray-600 mt-1">Identify and treat common crop diseases</p>
            </div>
            <Link href="/advisory/diseases" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              All Diseases <FaArrowRight className="ml-1" />
            </Link>
          </div>

          {/* Disease Symptom Checker */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Disease Symptom Checker</h3>
            <p className="text-sm text-gray-600 mb-4">Describe the symptoms you're seeing on your crops</p>
            <div className="flex gap-3">
              <textarea
                value={diseaseSymptoms}
                onChange={(e) => setDiseaseSymptoms(e.target.value)}
                placeholder="e.g., Yellow spots on leaves, white powdery coating, wilting stems..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium h-fit">
                Identify Disease
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cropDiseases.map(disease => (
              <div
                key={disease.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedDisease(disease);
                  setShowDiseaseModal(true);
                }}
              >
                {disease.image_url && (
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${API_URL}${disease.image_url})` }} />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{disease.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      disease.severity === 'high' ? 'bg-red-100 text-red-800' :
                      disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {disease.severity} severity
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Crop: {disease.crop_type}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{disease.symptoms[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fertilizer Recommendations Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaFlask className="mr-2 text-orange-600" />
                Smart Fertilizer Recommendations
              </h2>
              <p className="text-gray-600 mt-1">Personalized fertilizer advice based on crop and soil type</p>
            </div>
            <Link href="/advisory/fertilizers" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              More Recommendations <FaArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fertilizerRecs.map(rec => (
              <div key={rec.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2">
                  <h3 className="text-white font-semibold">{rec.crop_type}</h3>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600"><span className="font-medium">Soil Type:</span> {rec.soil_type}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Growth Stage:</span> {rec.growth_stage}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="font-medium text-green-800">{rec.fertilizer_name}</p>
                    <p className="text-sm text-green-700">NPK Ratio: {rec.npk_ratio}</p>
                  </div>
                  <p className="text-sm text-gray-600"><span className="font-medium">Application:</span> {rec.application_rate}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Method:</span> {rec.application_method}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Timing:</span> {rec.timing}</p>
                  <p className="text-sm text-green-700 mt-2"><span className="font-medium">Organic Alternative:</span> {rec.organic_alternative}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(category => {
              const IconComponent = categoryIcons[category.icon] || FaSeedling;
              return (
                <Link
                  key={category.id}
                  href={`/advisory/category/${category.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 text-center group"
                >
                  <div className={`w-12 h-12 rounded-full bg-${category.color}-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                    <IconComponent className={`text-2xl text-${category.color}-600`} />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.article_count} articles</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Soil Preparation Tips Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaTractor className="mr-2 text-brown-600" />
            Soil Preparation Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center mb-4">
                <FaSeedling className="text-xl text-brown-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Soil Testing</h3>
              <p className="text-sm text-gray-600">Test your soil pH, nutrient levels, and organic matter content before planting. Ideal pH range: 6.0-7.0 for most crops.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center mb-4">
                <FaWater className="text-xl text-brown-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Tilling & Plowing</h3>
              <p className="text-sm text-gray-600">Proper tilling depth: 6-8 inches for shallow-rooted crops, 12-15 inches for deep-rooted crops. Avoid over-tilling.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center mb-4">
                <FaLeaf className="text-xl text-brown-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Organic Matter Addition</h3>
              <p className="text-sm text-gray-600">Add compost or well-rotted manure (5-10 tons/hectare) to improve soil structure and water retention.</p>
            </div>
          </div>
        </div>

        {/* Vegetable Farming Guide Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBook className="mr-2 text-green-600" />
                Vegetable Farming Guide
              </h2>
              <p className="text-gray-600 mt-1">Complete guide for seasonal vegetable cultivation</p>
            </div>
            <Link href="/advisory/vegetable-guide" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              Full Guide <FaArrowRight className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Summer Vegetables */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FaCloudSun className="mr-2 text-orange-600" />
                Summer Vegetables
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Tomato (Feb-Mar sowing)</li>
                <li>• Brinjal (Jan-Feb sowing)</li>
                <li>• Cucumber (Feb-Mar sowing)</li>
                <li>• Bitter Gourd (Feb-Mar sowing)</li>
                <li>• Okra (Feb-Apr sowing)</li>
              </ul>
            </div>

            {/* Winter Vegetables */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FaSnowflake className="mr-2 text-blue-600" />
                Winter Vegetables
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Cauliflower (Jul-Sep sowing)</li>
                <li>• Cabbage (Aug-Oct sowing)</li>
                <li>• Peas (Oct-Nov sowing)</li>
                <li>• Carrot (Sep-Oct sowing)</li>
                <li>• Spinach (Oct-Nov sowing)</li>
              </ul>
            </div>

            {/* Monsoon Vegetables */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FaWater className="mr-2 text-teal-600" />
                Monsoon Vegetables
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Pumpkin (May-Jun sowing)</li>
                <li>• Ridge Gourd (May-Jun sowing)</li>
                <li>• Cluster Beans (Jun-Jul sowing)</li>
                <li>• Sweet Corn (Jun-Jul sowing)</li>
                <li>• Chilli (May-Jun sowing)</li>
              </ul>
            </div>

            {/* Year-round Vegetables */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <FaRegCalendarAlt className="mr-2 text-purple-600" />
                Year-round Vegetables
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Coriander</li>
                <li>• Mint</li>
                <li>• Green Chilli</li>
                <li>• Curry Leaves</li>
                <li>• Fenugreek</li>
              </ul>
            </div>
          </div>

          {/* Quick Tips Card */}
          <div className="mt-6 bg-green-600 text-white rounded-xl p-5">
            <div className="flex items-start gap-4">
              <FaStar className="text-2xl" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Pro Tip for Vegetable Farming</h3>
                <p className="text-green-100">Practice crop rotation to prevent soil-borne diseases. Avoid planting same family vegetables in the same spot for consecutive seasons. Maintain 2-3 year rotation cycle for best results.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/advisory/article/${article.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition group"
                >
                  {article.featured_image && (
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${API_URL}${article.featured_image})` }} />
                  )}
                  <div className="p-5">
                    <span className="text-xs text-green-600 font-medium">{article.category_name}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2 group-hover:text-green-600 transition">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FaClock className="mr-1" /> {article.estimated_read_time} min read
                      </span>
                      <span className="flex items-center">
                        <FaEye className="mr-1" /> {article.view_count} views
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/advisory/selling"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-center"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStore className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Selling & Marketing</h3>
            <p className="text-sm text-gray-600">Best practices for selling produce, market linkages, and pricing strategies</p>
          </Link>

          <Link
            href="/advisory/resources"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaDownload className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources & Manuals</h3>
            <p className="text-sm text-gray-600">Download training materials, guides, and brochures</p>
          </Link>

          <Link
            href="/advisory/faqs"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaQuestionCircle className="text-2xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-sm text-gray-600">Find answers to common farming questions</p>
          </Link>
        </div>
      </div>

      {/* Disease Modal */}
      {showDiseaseModal && selectedDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDiseaseModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{selectedDisease.name}</h3>
              <button onClick={() => setShowDiseaseModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDisease.severity === 'high' ? 'bg-red-100 text-red-800' :
                  selectedDisease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedDisease.severity.toUpperCase()} Severity
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Symptoms</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedDisease.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cause</h4>
                  <p className="text-gray-600">{selectedDisease.cause}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Treatment</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedDisease.treatment.map((treatment, idx) => (
                      <li key={idx}>{treatment}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prevention</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedDisease.prevention.map((prevention, idx) => (
                      <li key={idx}>{prevention}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}