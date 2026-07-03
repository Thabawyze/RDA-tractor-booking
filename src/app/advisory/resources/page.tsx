'use client';

import Link from 'next/link';
import { FaDownload, FaFilePdf } from 'react-icons/fa';

const resources = [
  {
    title: "2026/27 National Maize Planting Calendar",
    description: "Planting windows and recommended varieties for all 4 regions",
    type: "Calendar",
    size: "2.4 MB",
    region: "All Regions",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Maize Production Manual for Smallholder Farmers",
    description: "Step-by-step guide from land preparation to harvest",
    type: "Manual",
    size: "8.7 MB",
    region: "All Regions",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Vegetable Production Guide & Monthly Calendar",
    description: "Tomato, cabbage, spinach, onion and more",
    type: "Guide",
    size: "5.1 MB",
    region: "All Regions",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Drought Resilience & Water Harvesting Techniques",
    description: "Practical methods for Lowveld and Middleveld",
    type: "Booklet",
    size: "3.9 MB",
    region: "Lowveld, Middleveld",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Soil Testing & Fertility Management Guide",
    description: "Liming rates and compost making",
    type: "Guide",
    size: "4.2 MB",
    region: "All Regions",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    title: "Livestock Health Calendar (Cattle & Goats)",
    description: "Vaccination, dipping and feeding schedule",
    type: "Calendar",
    size: "2.8 MB",
    region: "All Regions",
    downloadLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Resources & Downloads</h1>
          <p className="text-xl text-gray-700 mt-3">Free practical materials for Eswatini farmers</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl p-8 shadow hover:shadow-xl transition border border-gray-100"
            >
              <div className="flex justify-between items-start mb-6">
                <FaFilePdf className="text-4xl text-red-600" />
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  {resource.size}
                </span>
              </div>

              <h3 className="font-semibold text-xl leading-tight mb-3 text-gray-900">
                {resource.title}
              </h3>
              
              <p className="text-gray-700 text-[15.5px] leading-relaxed mb-6">
                {resource.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-green-700 font-medium text-sm">
                  {resource.region}
                </span>
                
                <a 
                  href={resource.downloadLink} 
                  target="_blank"
                  download
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl transition font-medium"
                >
                  <FaDownload /> Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">More resources are added regularly. Check back often.</p>
          <Link 
            href="/advisory" 
            className="inline-block mt-6 text-green-600 hover:text-green-700 font-medium text-lg"
          >
            ← Back to Advisory Home
          </Link>
        </div>
      </div>
    </div>
  );
}