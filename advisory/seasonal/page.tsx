'use client';

import Link from 'next/link';
import { FaCalendarAlt, FaCloudSun, FaSeedling, FaArrowLeft } from 'react-icons/fa';

const seasonalGuides = [
  {
    title: "2026/27 Main Cropping Season Guide",
    period: "October 2026 - April 2027",
    description: "Comprehensive guide for the main rainy season including planting windows, expected rainfall, and risk management.",
    region: "All Regions",
    icon: FaCalendarAlt,
    color: "green",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Lowveld & Dry Middleveld - Drought Preparedness",
    period: "May - October 2026",
    description: "Special guide for drier regions focusing on drought-tolerant crops, water harvesting, and livestock strategies.",
    region: "Lowveld, Middleveld",
    icon: FaCloudSun,
    color: "amber",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Highveld & Lubombo Winter Vegetable Guide",
    period: "May - August 2026",
    description: "What to plant during the cooler months in higher rainfall areas.",
    region: "Highveld, Lubombo",
    icon: FaSeedling,
    color: "emerald",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Current Planting Advisory (May 2026)",
    period: "Immediate",
    description: "What farmers should be doing right now across all regions.",
    region: "All Regions",
    icon: FaCalendarAlt,
    color: "blue",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
];

export default function SeasonalPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/advisory" className="text-green-600 hover:text-green-700">
            <FaArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Seasonal Guides</h1>
            <p className="text-gray-600 mt-1">Timely agricultural advice based on seasons and regions</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-3xl p-8 mb-12">
          <div className="flex items-center gap-4">
            <FaCalendarAlt className="text-5xl" />
            <div>
              <h2 className="text-2xl font-semibold">2026/27 Farming Season</h2>
              <p className="text-green-100 mt-2">Early planting is recommended in the Highveld due to good soil moisture.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {seasonalGuides.map((guide, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl shadow hover:shadow-xl transition p-8 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${guide.color}-100 flex items-center justify-center mb-6`}>
                <guide.icon className={`text-3xl text-${guide.color}-600`} />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{guide.title}</h3>
              <p className="text-green-600 font-medium mb-3">{guide.period}</p>
              
              <p className="text-gray-700 leading-relaxed mb-6">{guide.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  {guide.region}
                </span>
                <a
                  href={guide.downloadLink}
                  target="_blank"
                  download
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl transition"
                >
                  <FaCalendarAlt /> Download Guide
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-3xl p-10 border border-gray-100">
          <h3 className="text-2xl font-semibold mb-6 text-black">How to Use Seasonal Guides</h3>
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">1. Choose Your Region</h4>
              <p className="text-gray-600">Select guides relevant to Highveld, Middleveld, Lowveld or Lubombo.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">2. Check Planting Windows</h4>
              <p className="text-gray-600">Follow recommended dates for best results.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">3. Prepare in Advance</h4>
              <p className="text-gray-600">Get seeds, fertilizer, and equipment ready before the season starts.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/advisory" 
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Advisory Home
          </Link>
        </div>
      </div>
    </div>
  );
}