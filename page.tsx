'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaTractor, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaChevronRight,
  FaChevronLeft,
  FaEnvelope, 
  FaClock,
  FaArrowRight,
  FaUsers,
  FaLeaf,
  FaWater,
  FaSeedling,
  FaHandHoldingHeart,
  FaUserPlus,
  FaSignInAlt,
  FaCalendarCheck,
  FaStar,
  FaQuoteLeft,
  FaQuoteRight,
  FaGlobeAfrica,
  FaMountain,
  FaTree,
  FaSearch,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaRegBuilding,
  FaRegMap,
  FaRegClock,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';

import { IconType } from 'react-icons';

// ==================== TYPES ====================

interface Testimonial {
  id: number;
  name: string;
  location: string;
  image: string;
  quote: string;
  rating: number;
  crop: string;
}

interface Statistic {
  value: string;
  label: string;
  icon: IconType;
}

interface Feature {
  icon: IconType;
  title: string;
  description: string;
  color: string;
}

interface Region {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  color: string;
}

// ==================== SAMPLE DATA ====================

const STATISTICS: Statistic[] = [
  { value: '59+', label: 'Tinkhundla Centers', icon: FaMapMarkerAlt },
  { value: '1000+', label: 'Happy Farmers', icon: FaUsers },
  { value: '50+', label: 'Modern Tractors', icon: FaTractor },
  { value: '24/7', label: 'Support Available', icon: FaClock },
];

const FEATURES: Feature[] = [
  { 
    icon: FaTractor, 
    title: 'Tractor Hiring', 
    description: 'Access modern tractors at affordable rates (E400/hour) for ploughing, harrowing, and planting.',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    icon: FaSeedling, 
    title: 'Quality Inputs', 
    description: 'Get certified seeds, fertilizers, and agricultural inputs at subsidized prices.',
    color: 'from-green-500 to-green-600'
  },
  { 
    icon: FaWater, 
    title: 'Irrigation Support', 
    description: 'Expert irrigation solutions to maximize your farm\'s potential year-round.',
    color: 'from-cyan-500 to-cyan-600'
  },
  { 
    icon: FaUsers, 
    title: 'Farmer Training', 
    description: 'Regular workshops on modern farming techniques and business management.',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    icon: FaHandHoldingHeart, 
    title: 'Financial Services', 
    description: 'Access loans, insurance, and financial planning tailored for farmers.',
    color: 'from-pink-500 to-pink-600'
  },
  { 
    icon: FaLeaf, 
    title: 'Sustainable Farming', 
    description: 'Promoting eco-friendly practices for long-term agricultural success.',
    color: 'from-emerald-500 to-emerald-600'
  },
];

const REGIONS: Region[] = [
  { 
    id: 'hhohho', 
    name: 'Hhohho Region', 
    description: 'Northern highlands, home to Mbabane, the capital city with lush mountains and fertile valleys.',
    image: '/images/hhohho.jpg',
    count: 15,
    color: 'from-blue-600 to-blue-800'
  },
  { 
    id: 'manzini', 
    name: 'Manzini Region', 
    description: 'Central industrial hub, economic heart of Eswatini with thriving commercial farms.',
    image: '/images/manzini.jpg',
    count: 18,
    color: 'from-green-600 to-green-800'
  },
  { 
    id: 'shiselweni', 
    name: 'Shiselweni Region', 
    description: 'Southern agricultural belt, known for livestock and crop farming.',
    image: '/images/shiselweni.jpg',
    count: 15,
    color: 'from-yellow-600 to-yellow-800'
  },
  { 
    id: 'lubombo', 
    name: 'Lubombo Region', 
    description: 'Eastern lowveld, famous for sugar cane plantations and stunning mountain views.',
    image: '/images/lubombo.jpg',
    count: 11,
    color: 'from-red-600 to-red-800'
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'James Dlamini',
    location: 'Malkerns, Manzini',
    image: '/testimonials/farmer1.jpg',
    quote: 'The RDA tractor service transformed my maize farming. I now plant 5 hectares in just 2 days! The online booking is so convenient.',
    rating: 5,
    crop: 'Maize Farmer'
  },
  {
    id: 2,
    name: 'Siphiwe Nkosi',
    location: 'Nhlangano, Shiselweni',
    image: '/testimonials/farmer2.jpg',
    quote: 'Easy online booking and reliable service. The operators are skilled and professional. My cattle farm has never been better.',
    rating: 5,
    crop: 'Livestock Farmer'
  },
  {
    id: 3,
    name: 'Thabo Mamba',
    location: 'Siteki, Lubombo',
    image: '/testimonials/farmer3.jpg',
    quote: 'Affordable rates and excellent customer support. My sugarcane yield has increased significantly since using their services.',
    rating: 5,
    crop: 'Sugarcane Farmer'
  },
  {
    id: 4,
    name: 'Mary Nkosi',
    location: 'Piggs Peak, Hhohho',
    image: '/testimonials/farmer4.jpg',
    quote: 'The training workshops taught me modern farming techniques. Now I\'m producing organic vegetables for the local market.',
    rating: 5,
    crop: 'Vegetable Farmer'
  }
];

// ==================== HERO SECTION ====================

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Eswatini\'s Green Valleys',
      subtitle: 'Fertile lands waiting to be cultivated'
    },
    {
      url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Modern Tractors at Work',
      subtitle: 'Efficient farming solutions'
    },
    {
      url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Happy Farmers, Bountiful Harvests',
      subtitle: 'Join the RDA community today'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, heroImages.length]);

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden">
      {/* Background Images with Crossfade */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center bg-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 mb-8 animate-fade-in-down">
            <FaLeaf className="text-green-400 mr-2 animate-pulse" />
            <span className="text-sm font-medium tracking-wider">🇸🇿 EMPOWERING ESWATINI FARMERS SINCE 1978</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="block">Grow More with</span>
            <span className="bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
              RDA Tractor Services
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200 animate-fade-in-up animation-delay-200">
            Access modern tractors, quality inputs, and expert support at your nearest Tinkhundla center. 
            Join thousands of farmers transforming their harvests.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-400">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-green-900 font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center text-lg overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <FaUserPlus className="mr-3 text-xl" />
                Register as Farmer
                <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center text-lg"
            >
              <FaSignInAlt className="mr-3" />
              Login to Account
            </Link>

            <Link
              href="/center_services"
              className="px-8 py-4 bg-green-600/30 backdrop-blur-md border-2 border-green-400/50 text-white font-bold rounded-xl hover:bg-green-600/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center text-lg"
            >
              <FaMapMarkerAlt className="mr-3" />
              Browse Tinkhundla
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-fade-in-up animation-delay-600">
            {STATISTICS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300 flex items-center justify-center">
                  <stat.icon className="mr-2 text-green-400" />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll" />
            </div>
          </div>

          {/* Hero Controls */}
          <div className="absolute bottom-8 right-8 flex space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition"
            >
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Why Choose RDA Services?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive agricultural support designed to help Eswatini farmers thrive
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-3xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Rate Card */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-1">
            <div className="bg-white rounded-xl px-8 py-6">
              <p className="text-2xl font-bold text-green-800">
                Standard Tractor Rate: <span className="text-4xl text-yellow-600">E400</span> per hour
              </p>
              <p className="text-gray-600 mt-2">Minimum booking: 2 hours • Professional operators included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== REGIONS SECTION ====================

const RegionsSection = () => {
  const router = useRouter();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Find Your Tinkhundla Center
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select your region to access tractor services and agricultural support at your nearest center
          </p>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REGIONS.map((region) => (
            <div
              key={region.id}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500"
              onClick={() => router.push(`/tinkhundla?region=${region.id}`)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-90 group-hover:opacity-70 transition-opacity duration-500`} />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">{region.name}</h3>
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{region.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {region.count} Centers
                  </span>
                  <button className="bg-white text-green-800 p-2 rounded-full transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              {/* Decorative Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* Browse All Link */}
        <div className="text-center mt-12">
          <Link
            href="/center_services"
            className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
          >
            <FaMapMarkerAlt className="mr-3" />
            Browse All Tinkhundla Centers
            <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ==================== TESTIMONIALS SECTION ====================

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            What Farmers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from farmers across Eswatini who transformed their farming with RDA
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <FaQuoteLeft className="text-6xl text-green-200 mb-6" />

            <div className="relative min-h-[200px]">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-700 absolute inset-0 ${
                    index === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <p className="text-xl md:text-2xl text-gray-700 italic mb-8">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-gray-500">{testimonial.crop} • {testimonial.location}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="text-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition"
          >
            <FaChevronLeft className="text-green-600" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition"
          >
            <FaChevronRight className="text-green-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-green-600'
                    : 'bg-gray-300 hover:bg-green-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== CALL TO ACTION SECTION ====================

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with Parallax Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L0 30L30 60L60 30L30 0z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Transform Your Farming?
        </h2>
        <p className="text-xl md:text-2xl mb-12 text-green-100 max-w-3xl mx-auto">
          Join thousands of Eswatini farmers who have increased their productivity with RDA tractor services. 
          Register today and start your journey to better harvests.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/register"
            className="group px-8 py-4 bg-yellow-500 text-green-900 font-bold rounded-xl hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center text-lg"
          >
            <FaUserPlus className="mr-3" />
            Register Now - It's Free!
            <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
          </Link>

          <Link
            href="/center_services"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center text-lg"
          >
            <FaMapMarkerAlt className="mr-3" />
            Find Your Center
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-70">
          <span className="text-sm tracking-wider">TRUSTED BY</span>
          <span className="text-xl font-bold">Ministry of Agriculture</span>
          <span className="text-xl font-bold">Eswatini Water Authority</span>
          <span className="text-xl font-bold">Farmers Association</span>
          <span className="text-xl font-bold">MTN Eswatini</span>
        </div>
      </div>
    </section>
  );
};

// ==================== FOOTER ====================

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center mb-6">
              <FaTractor className="text-3xl text-green-400 mr-3" />
              <span className="text-2xl font-bold">RDA Tractor</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering Eswatini farmers with accessible tractor services and agricultural support since 1978.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-400 transition flex items-center">
                  <FaArrowRight className="mr-2 text-xs" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-green-400 transition flex items-center">
                  <FaArrowRight className="mr-2 text-xs" />
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-green-400 transition flex items-center">
                  <FaArrowRight className="mr-2 text-xs" />
                  Login
                </Link>
              </li>
              <li>
                <Link href="/center_services" className="text-gray-400 hover:text-green-400 transition flex items-center">
                  <FaArrowRight className="mr-2 text-xs" />
                  Tinkhundla Centers
                </Link>
              </li>
              <li>
                <Link href="/center_services" className="text-gray-400 hover:text-green-400 transition flex items-center">
                  <FaArrowRight className="mr-2 text-xs" />
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mr-3 text-green-400 mt-1 flex-shrink-0" />
                <span>RDA Headquarters, Mbabane, Eswatini</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-green-400 flex-shrink-0" />
                <span>+268 2404 1234</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-green-400 flex-shrink-0" />
                <span>info@rda.co.sz</span>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-3 text-green-400 flex-shrink-0" />
                <span>Mon-Fri: 8AM - 5PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for farming tips and service updates.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="px-4 py-3 bg-green-600 rounded-r-lg hover:bg-green-700 transition">
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RDA Tractor Booking System. All rights reserved.</p>
          <p className="text-sm mt-2">
            <Link href="/privacy" className="hover:text-green-400 transition">Privacy Policy</Link>
            {' • '}
            <Link href="/terms" className="hover:text-green-400 transition">Terms of Service</Link>
            {' • '}
            <Link href="/faq" className="hover:text-green-400 transition">FAQ</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 text-white">
             <div className="relative w-16 h-16">
    <Image 
      src="/rda logo.png"  // Put your logo in the public folder
      alt="RDA Tractor Logo"
      fill
      className="h-32 w-auto"
      
    />
  </div>
              {/* <FaTractor className="text-2xl" /> */}
              <span className="font-bold text-xl">RDA Eswatini</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/center_services" className="text-white hover:text-green-200 transition font-medium">
                Tinkhundla Centers
              </Link>
              <Link href="/center_services" className="text-white hover:text-green-200 transition font-medium">
                Services
              </Link>
              <Link href="/about" className="text-white hover:text-green-200 transition font-medium">
                About
              </Link>
              <Link href="/contact" className="text-white hover:text-green-200 transition font-medium">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-yellow-500 text-green-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
               null
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Regions Section */}
      <RegionsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition z-50 animate-bounce"
        >
          <FaChevronUp />
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/26824041234"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-50 animate-pulse"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  );
}