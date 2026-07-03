'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaClock, FaEye, FaSearch, FaArrowLeft, FaFilter, FaDownload, FaBookOpen } from 'react-icons/fa';

const allArticles = [
  {
    id: 1,
    title: "Maize Planting Guide 2026/27: Region-Specific Recommendations",
    slug: "maize-planting-guide-2026-27",
    summary: "Best varieties, planting windows, fertilizer rates and pest management for Highveld, Middleveld, Lowveld and Lubombo.",
    category: "Crop Production",
    estimated_read_time: 12,
    view_count: 1240,
    published_at: "2026-05-01",
    regions: "All Regions"
  },
  {
    id: 2,
    title: "Drought Resilience Strategies for Lowveld & Dry Middleveld Farmers",
    slug: "drought-resilience-lowveld-middleveld",
    summary: "Practical techniques including water harvesting, drought-tolerant crops, mulching and contingency planning.",
    category: "Weather & Climate",
    estimated_read_time: 10,
    view_count: 890,
    published_at: "2026-04-28",
    regions: "Lowveld, Middleveld"
  },
  {
    id: 3,
    title: "Vegetable Production Calendar & Best Practices 2026",
    slug: "vegetable-production-calendar",
    summary: "Monthly planting guide for tomato, cabbage, spinach, onion and other vegetables by region.",
    category: "Crop Production",
    estimated_read_time: 8,
    view_count: 543,
    published_at: "2026-04-20",
    regions: "All Regions"
  },
  {
    id: 4,
    title: "Soil Fertility Management Across Eswatini’s Regions",
    slug: "soil-fertility-management-eswatini",
    summary: "Liming recommendations, compost making, and nutrient management for different soil types.",
    category: "Soil & Fertility",
    estimated_read_time: 9,
    view_count: 670,
    published_at: "2026-04-15",
    regions: "All Regions"
  },
  {
    id: 5,
    title: "Cattle & Goat Management – Seasonal Guide",
    slug: "livestock-management-guide",
    summary: "Feeding calendar, disease control, dipping schedule and dry season strategies.",
    category: "Livestock",
    estimated_read_time: 11,
    view_count: 412,
    published_at: "2026-04-10",
    regions: "All Regions"
  },
  {
    id: 6,
    title: "Fall Armyworm and Major Pests Management",
    slug: "fall-armyworm-management",
    summary: "Early detection, cultural methods and control options for maize and vegetables.",
    category: "Pest & Disease",
    estimated_read_time: 7,
    view_count: 678,
    published_at: "2026-05-05",
    regions: "All Regions"
  },
];

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Crop Production', 'Soil & Fertility', 'Weather & Climate', 'Livestock', 'Pest & Disease'];

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/advisory" className="text-green-600 hover:text-green-700">
              <FaArrowLeft size={22} />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">All Articles</h1>
          </div>
          <p className="text-gray-600 hidden md:block">Practical guides for Eswatini farmers</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-4 rounded-3xl shadow-sm">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500 text-black "
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500 bg-white text-black"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition group">
                <div className="h-52 bg-gradient-to-br from-green-100 to-emerald-100 relative">
                  <span className="absolute top-4 left-4 bg-white/95 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-xl leading-tight mb-3 group-hover:text-green-600 transition line-clamp-2 text-black">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                    <span><FaClock className="inline mr-1" /> {article.estimated_read_time} min</span>
                    <span><FaEye className="inline mr-1" /> {article.view_count}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/advisory/article/${article.slug}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-2xl transition font-medium flex items-center justify-center gap-2"
                    >
                      <FaBookOpen /> Read Full Article
                    </Link>
                    
                    <Link
                      href={`/advisory/article/${article.slug}`}
                      className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:border-green-600 rounded-2xl transition"
                    >
                      <FaDownload className="text-gray-600" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No articles found. Try different search terms.</p>
          </div>
        )}

        <div className="text-center mt-16">
          <Link 
            href="/advisory" 
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-lg"
          >
            ← Back to Advisory Home
          </Link>
        </div>
      </div>
    </div>
  );
}