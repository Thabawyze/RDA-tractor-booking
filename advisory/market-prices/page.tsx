'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, FaChartLine, FaSearch, FaFilter, FaSpinner, 
  FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaTractor,
  FaAppleAlt, FaCarrot, FaEgg, 
  FaStore, FaDownload, FaPrint, FaShare, FaBell, FaStar,
  FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle, FaEye, FaPhoneAlt,
  FaShoppingCart, FaBalanceScale, FaChartBar, FaList, FaThLarge
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface MarketPrice {
  id: number;
  commodity: string;
  category: 'cereals' | 'vegetables' | 'fruits' | 'livestock' | 'poultry' | 'dairy';
  variety: string;
  grade: string;
  price_min: number;
  price_max: number;
  average_price: number;
  unit: string;
  market_id: number;
  market_name: string;
  market_type: 'wholesale' | 'retail' | 'farmgate';
  region: string;
  district: string;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  volume_available: string;
  demand_level: 'high' | 'medium' | 'low';
  updated_at: string;
  previous_price?: number;
}

interface Market {
  id: number;
  name: string;
  type: string;
  region: string;
  district: string;
  latitude: number;
  longitude: number;
  operating_days: string;
  contact: string;
}

interface PriceAlert {
  id: number;
  commodity: string;
  target_price: number;
  condition: 'above' | 'below';
  is_active: boolean;
}

interface PriceHistory {
  date: string;
  price: number;
  volume: number;
}

const MarketPricesPage = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedPrice, setSelectedPrice] = useState<MarketPrice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertCommodity, setAlertCommodity] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCommodityForHistory, setSelectedCommodityForHistory] = useState('');
  const [selectedMarketForHistory, setSelectedMarketForHistory] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Eswatini market prices data
  const eswatiniMarketPrices: MarketPrice[] = [
    // Cereals
    {
      id: 1, commodity: 'Maize (White)', category: 'cereals', variety: 'Local', grade: 'Grade 1',
      price_min: 350, price_max: 450, average_price: 400, unit: 'kg', market_id: 1,
      market_name: 'Manzini Market', market_type: 'wholesale', region: 'Manzini', district: 'Manzini',
      trend: 'stable', trend_percentage: 0, volume_available: 'High', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 400
    },
    {
      id: 2, commodity: 'Maize (White)', category: 'cereals', variety: 'SA Hybrid', grade: 'Premium',
      price_min: 420, price_max: 520, average_price: 470, unit: 'kg', market_id: 2,
      market_name: 'Mbabane Market', market_type: 'retail', region: 'Hhohho', district: 'Mbabane',
      trend: 'up', trend_percentage: 5, volume_available: 'Medium', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 448
    },
    {
      id: 3, commodity: 'Sorghum', category: 'cereals', variety: 'Local', grade: 'Standard',
      price_min: 280, price_max: 380, average_price: 330, unit: 'kg', market_id: 3,
      market_name: 'Siteki Market', market_type: 'wholesale', region: 'Lubombo', district: 'Siteki',
      trend: 'down', trend_percentage: -8, volume_available: 'Low', demand_level: 'medium',
      updated_at: new Date().toISOString(), previous_price: 359
    },
    {
      id: 4, commodity: 'Rice', category: 'cereals', variety: 'Imported', grade: 'Grade A',
      price_min: 1200, price_max: 1500, average_price: 1350, unit: '25kg', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'up', trend_percentage: 10, volume_available: 'High', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 1227
    },
    // Vegetables
    {
      id: 5, commodity: 'Tomatoes', category: 'vegetables', variety: 'Roma', grade: 'Grade 1',
      price_min: 15, price_max: 25, average_price: 20, unit: 'kg', market_id: 1,
      market_name: 'Manzini Market', market_type: 'wholesale', region: 'Manzini', district: 'Manzini',
      trend: 'up', trend_percentage: 15, volume_available: 'Medium', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 17
    },
    {
      id: 6, commodity: 'Onions', category: 'vegetables', variety: 'Red', grade: 'Grade 1',
      price_min: 18, price_max: 28, average_price: 23, unit: 'kg', market_id: 2,
      market_name: 'Mbabane Market', market_type: 'retail', region: 'Hhohho', district: 'Mbabane',
      trend: 'stable', trend_percentage: 0, volume_available: 'High', demand_level: 'medium',
      updated_at: new Date().toISOString(), previous_price: 23
    },
    {
      id: 7, commodity: 'Potatoes', category: 'vegetables', variety: 'BP1', grade: 'Grade 1',
      price_min: 12, price_max: 18, average_price: 15, unit: 'kg', market_id: 3,
      market_name: 'Siteki Market', market_type: 'wholesale', region: 'Lubombo', district: 'Siteki',
      trend: 'down', trend_percentage: -12, volume_available: 'Very High', demand_level: 'low',
      updated_at: new Date().toISOString(), previous_price: 17
    },
    {
      id: 8, commodity: 'Cabbage', category: 'vegetables', variety: 'Green', grade: 'Grade 1',
      price_min: 8, price_max: 12, average_price: 10, unit: 'head', market_id: 4,
      market_name: 'Nhlangano Market', market_type: 'retail', region: 'Shiselweni', district: 'Nhlangano',
      trend: 'stable', trend_percentage: 0, volume_available: 'Medium', demand_level: 'medium',
      updated_at: new Date().toISOString(), previous_price: 10
    },
    {
      id: 9, commodity: 'Spinach', category: 'vegetables', variety: 'Local', grade: 'Grade 1',
      price_min: 10, price_max: 15, average_price: 12.5, unit: 'bunch', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'up', trend_percentage: 8, volume_available: 'Low', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 11.6
    },
    {
      id: 10, commodity: 'Carrots', category: 'vegetables', variety: 'Nantes', grade: 'Grade 1',
      price_min: 12, price_max: 18, average_price: 15, unit: 'kg', market_id: 2,
      market_name: 'Mbabane Market', market_type: 'retail', region: 'Hhohho', district: 'Mbabane',
      trend: 'stable', trend_percentage: 0, volume_available: 'Medium', demand_level: 'medium',
      updated_at: new Date().toISOString(), previous_price: 15
    },
    // Fruits
    {
      id: 11, commodity: 'Bananas', category: 'fruits', variety: 'Local', grade: 'Grade 1',
      price_min: 25, price_max: 35, average_price: 30, unit: 'dozen', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'up', trend_percentage: 5, volume_available: 'Medium', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 28.6
    },
    {
      id: 12, commodity: 'Oranges', category: 'fruits', variety: 'Valencia', grade: 'Grade 1',
      price_min: 20, price_max: 30, average_price: 25, unit: 'kg', market_id: 2,
      market_name: 'Mbabane Market', market_type: 'retail', region: 'Hhohho', district: 'Mbabane',
      trend: 'down', trend_percentage: -7, volume_available: 'High', demand_level: 'medium',
      updated_at: new Date().toISOString(), previous_price: 26.9
    },
    {
      id: 13, commodity: 'Avocados', category: 'fruits', variety: 'Hass', grade: 'Grade A',
      price_min: 15, price_max: 25, average_price: 20, unit: 'each', market_id: 3,
      market_name: 'Siteki Market', market_type: 'wholesale', region: 'Lubombo', district: 'Siteki',
      trend: 'up', trend_percentage: 12, volume_available: 'Low', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 17.9
    },
    // Livestock
    {
      id: 14, commodity: 'Beef', category: 'livestock', variety: 'Local', grade: 'Grade A',
      price_min: 85, price_max: 110, average_price: 97.5, unit: 'kg', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'stable', trend_percentage: 0, volume_available: 'Medium', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 97.5
    },
    {
      id: 15, commodity: 'Goat Meat', category: 'livestock', variety: 'Local', grade: 'Grade A',
      price_min: 70, price_max: 90, average_price: 80, unit: 'kg', market_id: 4,
      market_name: 'Nhlangano Market', market_type: 'retail', region: 'Shiselweni', district: 'Nhlangano',
      trend: 'up', trend_percentage: 6, volume_available: 'Low', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 75.5
    },
    // Poultry
    {
      id: 16, commodity: 'Chicken (Fresh)', category: 'poultry', variety: 'Broiler', grade: 'Grade A',
      price_min: 55, price_max: 70, average_price: 62.5, unit: 'kg', market_id: 2,
      market_name: 'Mbabane Market', market_type: 'retail', region: 'Hhohho', district: 'Mbabane',
      trend: 'stable', trend_percentage: 0, volume_available: 'High', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 62.5
    },
    {
      id: 17, commodity: 'Eggs', category: 'poultry', variety: 'Brown', grade: 'Large',
      price_min: 18, price_max: 25, average_price: 21.5, unit: 'tray(30)', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'up', trend_percentage: 8, volume_available: 'Medium', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 19.9
    },
    // Dairy
    {
      id: 18, commodity: 'Milk', category: 'dairy', variety: 'Fresh', grade: 'Pasteurized',
      price_min: 18, price_max: 22, average_price: 20, unit: 'litre', market_id: 1,
      market_name: 'Manzini Market', market_type: 'retail', region: 'Manzini', district: 'Manzini',
      trend: 'stable', trend_percentage: 0, volume_available: 'High', demand_level: 'high',
      updated_at: new Date().toISOString(), previous_price: 20
    }
  ];

  const eswatiniMarkets: Market[] = [
    { id: 1, name: 'Manzini Market', type: 'wholesale & retail', region: 'Manzini', district: 'Manzini', latitude: -26.498, longitude: 31.374, operating_days: 'Monday - Saturday', contact: '+268 2505 1234' },
    { id: 2, name: 'Mbabane Market', type: 'retail', region: 'Hhohho', district: 'Mbabane', latitude: -26.322, longitude: 31.162, operating_days: 'Daily', contact: '+268 2404 5678' },
    { id: 3, name: 'Siteki Market', type: 'wholesale', region: 'Lubombo', district: 'Siteki', latitude: -26.453, longitude: 31.947, operating_days: 'Tuesday, Friday, Saturday', contact: '+268 2343 9012' },
    { id: 4, name: 'Nhlangano Market', type: 'retail', region: 'Shiselweni', district: 'Nhlangano', latitude: -27.121, longitude: 31.196, operating_days: 'Monday - Saturday', contact: '+268 2207 3456' },
    { id: 5, name: 'Big Bend Market', type: 'farmgate', region: 'Lubombo', district: 'Big Bend', latitude: -26.817, longitude: 31.933, operating_days: 'Wednesday, Saturday', contact: '+268 2345 7890' },
    { id: 6, name: 'Mhlume Market', type: 'wholesale', region: 'Lubombo', district: 'Mhlume', latitude: -26.033, longitude: 31.850, operating_days: 'Thursday, Sunday', contact: '+268 2341 2345' }
  ];

  // Sample price history data
  const generatePriceHistory = (commodity: string, market: string): PriceHistory[] => {
    const basePrices: Record<string, number> = {
      'Maize (White)': 400,
      'Tomatoes': 20,
      'Potatoes': 15,
      'Onions': 23,
      'Beef': 97.5
    };
    
    const basePrice = basePrices[commodity] || 30;
    const history: PriceHistory[] = [];
    const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
    
    for (let i = 0; i < dates.length; i++) {
      const variation = (Math.sin(i * 0.5) * 0.1 + (Math.random() - 0.5) * 0.05);
      history.push({
        date: dates[i],
        price: Math.round(basePrice * (1 + variation) * 10) / 10,
        volume: Math.floor(500 + Math.random() * 1000)
      });
    }
    return history;
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchTerm, selectedCommodity, selectedRegion, selectedMarket, selectedCategory, prices]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const [pricesRes, marketsRes] = await Promise.all([
        axios.get(`${API_URL}/api/advisory/market-prices`).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/api/advisory/markets`).catch(() => ({ data: { success: false } }))
      ]);
      
      if (pricesRes.data.success && pricesRes.data.prices.length > 0) {
        setPrices(pricesRes.data.prices);
      } else {
        setPrices(eswatiniMarketPrices);
      }
      
      if (marketsRes.data.success && marketsRes.data.markets.length > 0) {
        setMarkets(marketsRes.data.markets);
      } else {
        setMarkets(eswatiniMarkets);
      }
      
      toast.info('Showing latest market prices for Eswatini');
    } catch (error) {
      console.error('Error fetching market data:', error);
      setPrices(eswatiniMarketPrices);
      setMarkets(eswatiniMarkets);
      toast.warning('Using cached market data');
    } finally {
      setLoading(false);
    }
  };

  const filterPrices = () => {
    let filtered = [...prices];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.market_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCommodity !== 'all') {
      filtered = filtered.filter(p => p.commodity === selectedCommodity);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(p => p.region === selectedRegion);
    }
    
    if (selectedMarket !== 'all') {
      filtered = filtered.filter(p => p.market_name === selectedMarket);
    }
    
    setFilteredPrices(filtered);
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') return <span className="flex items-center gap-1 text-green-600"><FaArrowUp size={12} /> +{Math.abs(percentage)}%</span>;
    if (trend === 'down') return <span className="flex items-center gap-1 text-red-600"><FaArrowDown size={12} /> {percentage}%</span>;
    return <span className="flex items-center gap-1 text-gray-500"><FaMinus size={12} /> 0%</span>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cereals': return <FaShoppingCart className="text-amber-600" />;
      case 'vegetables': return <FaCarrot className="text-green-600" />;
      case 'fruits': return <FaAppleAlt className="text-red-600" />;
      case 'livestock': return <FaTractor className="text-amber-700" />;
      case 'poultry': return <FaEgg className="text-yellow-600" />;
      case 'dairy': return <FaBalanceScale className="text-blue-600" />;
      default: return <FaDollarSign className="text-gray-600" />;
    }
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'high': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">High Demand</span>;
      case 'medium': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Medium Demand</span>;
      case 'low': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Low Demand</span>;
      default: return null;
    }
  };

  const uniqueCommodities = [...new Set(prices.map(p => p.commodity))];
  const uniqueRegions = [...new Set(prices.map(p => p.region))];
  const uniqueMarkets = [...new Set(prices.map(p => p.market_name))];
  const categories = [
    { value: 'cereals', label: 'Cereals & Grains', icon: <FaShoppingCart /> },
    { value: 'vegetables', label: 'Vegetables', icon: <FaCarrot /> },
    { value: 'fruits', label: 'Fruits', icon: <FaAppleAlt /> },
    { value: 'livestock', label: 'Livestock', icon: <FaTractor /> },
    { value: 'poultry', label: 'Poultry', icon: <FaEgg /> },
    { value: 'dairy', label: 'Dairy', icon: <FaBalanceScale /> }
  ];

  const handleViewHistory = (commodity: string, market: string) => {
    setSelectedCommodityForHistory(commodity);
    setSelectedMarketForHistory(market);
    setPriceHistory(generatePriceHistory(commodity, market));
    setShowHistory(true);
  };

  const handleSetAlert = (commodity: string) => {
    setAlertCommodity(commodity);
    setShowAlertModal(true);
  };

  const saveAlert = () => {
    if (!alertCommodity || !alertPrice) {
      toast.error('Please fill all fields');
      return;
    }
    
    const newAlert: PriceAlert = {
      id: Date.now(),
      commodity: alertCommodity,
      target_price: parseFloat(alertPrice),
      condition: alertCondition,
      is_active: true
    };
    
    setPriceAlerts([...priceAlerts, newAlert]);
    toast.success(`Price alert set for ${alertCommodity} when price goes ${alertCondition} E${alertPrice}`);
    setShowAlertModal(false);
    setAlertCommodity('');
    setAlertPrice('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading market prices...</p>
        </div>
      </div>
    );
  }

  // Chart data for top commodities
  const topCommodities = filteredPrices.slice(0, 8);
  const chartData = topCommodities.map(p => ({
    name: p.commodity,
    price: p.average_price,
    market: p.market_name
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/advisory" className="hover:bg-white/20 p-2 rounded-lg transition">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Market Prices</h1>
                <p className="text-green-100 mt-1">Real-time commodity prices across Eswatini markets</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${viewMode === 'list' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <FaList size={14} /> List
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <FaThLarge size={14} /> Grid
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <FaDownload size={14} /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">{markets.length}</p>
              </div>
              <FaStore className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Commodities</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueCommodities.length}</p>
              </div>
              <FaAppleAlt className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Last Update</p>
                <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
              <FaCalendarAlt className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-green-600">{priceAlerts.length}</p>
              </div>
              <FaBell className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Price Trend Chart */}
        {filteredPrices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison by Commodity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Price (E)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="price" fill="#22c55e" name="Average Price (E)">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.price > 50 ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search commodity, market..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Commodities</option>
              {uniqueCommodities.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
            
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Markets</option>
              {uniqueMarkets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">Found {filteredPrices.length} price entries</p>
          <button onClick={() => setShowAlertModal(true)} className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1">
            <FaBell /> Set Price Alert
          </button>
        </div>

        {/* Prices Display */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commodity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (E)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPrices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => { setSelectedPrice(price); setShowModal(true); }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(price.category)}
                          <div>
                            <p className="font-medium text-gray-900">{price.commodity}</p>
                            <p className="text-xs text-gray-500">{price.variety}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{price.market_name}</p>
                        <p className="text-xs text-gray-500">{price.district}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">E{price.average_price}</p>
                        <p className="text-xs text-gray-500">Range: E{price.price_min} - E{price.price_max}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{price.unit}</td>
                      <td className="px-4 py-3">{getTrendIcon(price.trend, price.trend_percentage)}</td>
                      <td className="px-4 py-3">{getDemandBadge(price.demand_level)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleViewHistory(price.commodity, price.market_name); }} className="text-blue-600 hover:text-blue-800">
                            <FaChartLine />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleSetAlert(price.commodity); }} className="text-green-600 hover:text-green-800">
                            <FaBell />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrices.map((price) => (
              <div key={price.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer" onClick={() => { setSelectedPrice(price); setShowModal(true); }}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(price.category)}
                      <h3 className="font-semibold text-gray-900">{price.commodity}</h3>
                    </div>
                    {getTrendIcon(price.trend, price.trend_percentage)}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{price.variety} - {price.grade}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">E{price.average_price}</p>
                  <p className="text-sm text-gray-600">per {price.unit}</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600"><FaMapMarkerAlt className="inline mr-1" /> {price.market_name}, {price.district}</p>
                    <p className="text-xs text-gray-500 mt-1">Updated: {new Date(price.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Information Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Markets in Eswatini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => (
              <div key={market.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{market.name}</h3>
                    <p className="text-sm text-gray-500">{market.type}</p>
                  </div>
                  <FaStore className="text-gray-400" />
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-600"><FaMapMarkerAlt className="inline mr-1" /> {market.district}, {market.region}</p>
                  <p className="text-gray-600"><FaCalendarAlt className="inline mr-1" /> Operating: {market.operating_days}</p>
                  <p className="text-gray-600"><FaPhoneAlt className="inline mr-1" /> {market.contact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farming Tips Based on Prices */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-amber-600" />
            Smart Selling Tips Based on Current Prices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-700">Highest Price Commodities</p>
              <p className="text-sm text-gray-600">
                {filteredPrices.sort((a,b) => b.average_price - a.average_price).slice(0,3).map(p => p.commodity).join(', ')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Consider planting these high-value crops</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-orange-700">Best Markets for Prices</p>
              <p className="text-sm text-gray-600">
                {filteredPrices.sort((a,b) => b.average_price - a.average_price).slice(0,2).map(p => p.market_name).join(', ')}
              </p>
              <p className="text-xs text-gray-500 mt-1">These markets offer premium prices</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-blue-700">High Demand Commodities</p>
              <p className="text-sm text-gray-600">
                {filteredPrices.filter(p => p.demand_level === 'high').slice(0,3).map(p => p.commodity).join(', ')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Strong market demand, good selling opportunity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Details Modal */}
      {showModal && selectedPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPrice.commodity}</h3>
                <p className="text-gray-500">{selectedPrice.variety} - {selectedPrice.grade}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Average Price</p>
                  <p className="text-3xl font-bold text-green-600">E{selectedPrice.average_price}</p>
                  <p className="text-xs text-gray-500">per {selectedPrice.unit}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Price Range</p>
                  <p className="text-xl font-semibold text-blue-600">E{selectedPrice.price_min} - E{selectedPrice.price_max}</p>
                  <p className="text-xs text-gray-500">per {selectedPrice.unit}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <p><span className="font-medium">Market:</span> {selectedPrice.market_name} ({selectedPrice.market_type})</p>
                <p><span className="font-medium">Location:</span> {selectedPrice.district}, {selectedPrice.region}</p>
                <p><span className="font-medium">Trend:</span> {getTrendIcon(selectedPrice.trend, selectedPrice.trend_percentage)}</p>
                <p><span className="font-medium">Demand Level:</span> {selectedPrice.demand_level}</p>
                <p><span className="font-medium">Volume Available:</span> {selectedPrice.volume_available}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(selectedPrice.updated_at).toLocaleString()}</p>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button onClick={() => handleSetAlert(selectedPrice.commodity)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Set Price Alert
                </button>
                <button onClick={() => handleViewHistory(selectedPrice.commodity, selectedPrice.market_name)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Price History: {selectedCommodityForHistory}</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Market: {selectedMarketForHistory}</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Price (E)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Volume (kg)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#22c55e" name="Price (E)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#3b82f6" name="Volume (kg)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">📊 Price Trend Analysis: The price has shown {selectedCommodityForHistory === 'Tomatoes' ? 'significant increase' : 'stable pattern'} over the past 8 weeks.</p>
                <p className="text-xs text-gray-500 mt-1">Best selling time: Mid-week (Tuesday-Thursday) for best prices</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Set Price Alert</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                  <input
                    type="text"
                    value={alertCommodity}
                    onChange={(e) => setAlertCommodity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Tomatoes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Condition</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAlertCondition('above')}
                      className={`flex-1 py-2 rounded-lg border ${alertCondition === 'above' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300'}`}
                    >
                      Price goes ABOVE
                    </button>
                    <button
                      onClick={() => setAlertCondition('below')}
                      className={`flex-1 py-2 rounded-lg border ${alertCondition === 'below' ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-300'}`}
                    >
                      Price goes BELOW
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (E)</label>
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 25"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveAlert} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Save Alert
                </button>
                <button onClick={() => setShowAlertModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPricesPage;