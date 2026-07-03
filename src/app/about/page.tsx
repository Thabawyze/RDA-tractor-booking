'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaTractor, 
  FaUsers, 
  FaLeaf, 
  FaUser,
  FaHandHoldingHeart,
  FaStar,
  FaAward,
  FaGlobeAfrica,
  FaCalendarAlt,
  FaChartLine,
  FaRegSmile,
  FaRegHeart,
  FaRegClock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheckCircle,
  FaBullhorn,
  FaSeedling,
  FaWater,
  FaSun,
  FaCloudSun,
  FaTree,
  FaMountain,
  FaHandsHelping,
  FaUniversity,
  FaBuilding,
  FaUsers as FaUsersIcon,
  FaTruck,
  FaWarehouse,
  FaTools,
  FaClipboardList
} from 'react-icons/fa';

// ==================== TYPES ====================

interface Milestone {
  year: number;
  title: string;
  description: string;
  icon: any;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
  icon: any;
}

interface Value {
  title: string;
  description: string;
  icon: any;
  color: string;
}

// ==================== DATA ====================

const milestones: Milestone[] = [
  {
    year: 1978,
    title: 'RDA Established',
    description: 'The Rural Development Authority (RDA) was established to support agricultural development across Eswatini.',
    icon: FaBuilding
  },
  {
    year: 1993,
    title: 'Tinkhundla Expansion',
    description: 'Expanded to 55 Tinkhundla centers across all four regions of Eswatini.',
    icon: FaMapMarkerAlt
  },
  {
    year: 2008,
    title: 'Digital Transformation',
    description: 'Began digitizing agricultural services and farmer records.',
    icon: FaChartLine
  },
  {
    year: 2020,
    title: 'Online Booking Launch',
    description: 'Launched online tractor booking system for easier access to services.',
    icon: FaTractor
  },
  {
    year: 2024,
    title: 'Mobile App Release',
    description: 'Released mobile application for offline access to agricultural information.',
    icon: FaGlobeAfrica
  }
];

const coreValues: Value[] = [
  {
    title: 'Empowerment',
    description: 'Empowering Eswatini farmers with accessible tools and knowledge to improve their livelihoods.',
    icon: FaHandHoldingHeart,
    color: 'from-green-600 to-green-700'
  },
  {
    title: 'Innovation',
    description: 'Continuously innovating to bring modern agricultural solutions to traditional farming communities.',
    icon: FaSeedling,
    color: 'from-blue-600 to-blue-700'
  },
  {
    title: 'Sustainability',
    description: 'Promoting sustainable farming practices that protect the environment for future generations.',
    icon: FaLeaf,
    color: 'from-emerald-600 to-emerald-700'
  },
  {
    title: 'Community',
    description: 'Building strong farming communities through collaboration, training, and support.',
    icon: FaUsers,
    color: 'from-purple-600 to-purple-700'
  }
];

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Dr. James Dlamini',
    role: 'Director of Agriculture',
    bio: 'Over 20 years of experience in agricultural development and policy implementation across Southern Africa.',
    icon: FaUser
  },
  {
    id: 2,
    name: 'Sipho Nkosi',
    role: 'Operations Manager',
    bio: 'Expert in logistics and tractor fleet management with a passion for rural development.',
    icon: FaUser
  },
  {
    id: 3,
    name: 'Mary Mamba',
    role: 'Extension Services Lead',
    bio: 'Agricultural extension specialist focused on farmer training and capacity building.',
    icon: FaUser
  },
  {
    id: 4,
    name: 'Thabo Dlamini',
    role: 'IT Director',
    bio: 'Technology innovator driving digital transformation in agricultural services.',
    icon: FaUser
  }
];

const stats = [
  { value: '59', label: 'Tinkhundla Centers', icon: FaMapMarkerAlt },
  { value: '50+', label: 'Modern Tractors', icon: FaTractor },
  { value: '1000+', label: 'Happy Farmers', icon: FaRegSmile },
  { value: '24/7', label: 'Support Available', icon: FaRegClock }
];

// ==================== STAT CARD COMPONENT ====================

const StatCard = ({ stat }: { stat: typeof stats[0] }) => (
  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <stat.icon className="text-2xl text-green-600" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
  </div>
);

// ==================== MILESTONE COMPONENT ====================

const MilestoneTimeline = () => {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-green-200 hidden md:block" />
      
      <div className="space-y-8 md:space-y-0">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.year}
            className={`relative flex flex-col md:flex-row items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Timeline Dot */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full hidden md:block" />
            
            {/* Content */}
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12'}`}>
              <div 
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                onMouseEnter={() => setActiveMilestone(index)}
                onMouseLeave={() => setActiveMilestone(null)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <milestone.icon className="text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">{milestone.year}</span>
                  </div>
                  {activeMilestone === index && (
                    <FaArrowRight className="text-green-600 animate-pulse" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-gray-600 text-sm">{milestone.description}</p>
              </div>
            </div>
            
            {/* Empty spacer for other side */}
            <div className="md:w-1/2 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== VALUE CARD COMPONENT ====================

const ValueCard = ({ value }: { value: Value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition group">
    <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
      <value.icon className="text-2xl text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
    <p className="text-gray-600 text-sm">{value.description}</p>
  </div>
);

// ==================== TEAM CARD COMPONENT ====================

const TeamCard = ({ member }: { member: TeamMember }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
    <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <member.icon className="text-3xl text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
    <p className="text-sm text-green-600 font-medium mb-2">{member.role}</p>
    <p className="text-gray-600 text-sm">{member.bio}</p>
  </div>
);

// ==================== PARTNER LOGO COMPONENT ====================

const PartnerLogo = ({ name, icon: Icon }: { name: string; icon: any }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition">
    <Icon className="text-4xl text-gray-400 mb-3" />
    <span className="text-sm text-gray-600">{name}</span>
  </div>
);

// ==================== MAIN PAGE COMPONENT ====================

export default function AboutPage() {
  const [showFullHistory, setShowFullHistory] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About RDA Tractor Booking System</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Empowering Eswatini farmers with accessible, affordable, and reliable tractor services since 1978
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <FaTractor className="text-2xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To provide Eswatini farmers with reliable, affordable, and accessible tractor services 
              and agricultural support that enhances productivity, promotes sustainable farming practices, 
              and improves rural livelihoods.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <FaGlobeAfrica className="text-2xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To be the leading agricultural service provider in Eswatini, transforming farming through 
              technology, innovation, and farmer-centric solutions that drive food security and economic growth.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Who We Are Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The Rural Development Authority (RDA) is a government agency dedicated to supporting 
              agricultural development across all four regions of Eswatini through our network of 59 Tinkhundla centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <FaLeaf className="mr-2" /> Our Approach
              </h3>
              <p className="text-gray-700 mb-4">
                We combine traditional farming knowledge with modern technology to deliver effective 
                agricultural solutions. Our integrated approach includes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <FaCheckCircle className="text-green-600 mr-2 text-sm" />
                  Modern tractor fleet management
                </li>
                <li className="flex items-center text-gray-700">
                  <FaCheckCircle className="text-green-600 mr-2 text-sm" />
                  Digital booking and payment systems
                </li>
                <li className="flex items-center text-gray-700">
                  <FaCheckCircle className="text-green-600 mr-2 text-sm" />
                  Farmer training and extension services
                </li>
                <li className="flex items-center text-gray-700">
                  <FaCheckCircle className="text-green-600 mr-2 text-sm" />
                  Agricultural input supply and support
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <FaCloudSun className="mr-2" /> Our Coverage
              </h3>
              <p className="text-gray-700 mb-4">
                We serve farmers across all four regions of Eswatini through our extensive network:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Hhohho Region</p>
                  <p className="text-sm text-gray-600">15 Centers</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manzini Region</p>
                  <p className="text-sm text-gray-600">18 Centers</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Shiselweni Region</p>
                  <p className="text-sm text-gray-600">15 Centers</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Lubombo Region</p>
                  <p className="text-sm text-gray-600">11 Centers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at RDA
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>
        </div>

        {/* History Timeline Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              A legacy of service to Eswatini farmers
            </p>
          </div>
          <MilestoneTimeline />
        </div>

        {/* Leadership Team Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals behind RDA
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map(member => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Partners</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Working together to serve Eswatini farmers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PartnerLogo name="Ministry of Agriculture" icon={FaBuilding} />
            <PartnerLogo name="Eswatini Water Authority" icon={FaWater} />
            <PartnerLogo name="Farmers Association" icon={FaUsersIcon} />
            <PartnerLogo name="MTN Eswatini" icon={FaGlobeAfrica} />
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join the RDA Family</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Whether you're a farmer looking for tractor services or a partner interested in working with us, 
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-green-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
            >
              Register as Farmer
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition"
            >
              Contact Us
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}