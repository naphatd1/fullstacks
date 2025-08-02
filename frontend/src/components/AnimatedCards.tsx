'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, Heart, Eye, Calendar, Tag, ArrowUpRight, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  description: string;
  image: string;
  badges: string[];
  stats: {
    views: number;
    likes: number;
    rating: number;
  };
  date: string;
  category: string;
}

const mockCards: CardData[] = [
  // Page 1
  {
    id: 1,
    title: "Beautiful Mountain Landscape",
    description: "Experience the breathtaking views of mountain peaks during golden hour. Perfect for nature lovers and photography enthusiasts.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Popular", "Featured"],
    stats: { views: 2547, likes: 189, rating: 4.8 },
    date: "2024-01-15",
    category: "Nature"
  },
  {
    id: 2,
    title: "Modern Architecture Design",
    description: "Stunning contemporary building with unique geometric patterns and innovative structural elements that redefine urban skylines.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Trending", "New"],
    stats: { views: 1832, likes: 145, rating: 4.6 },
    date: "2024-01-12",
    category: "Architecture"
  },
  {
    id: 3,
    title: "Serene Ocean Waves",
    description: "Calming ocean waves meeting pristine sandy beaches. The perfect escape for meditation and peaceful contemplation.",
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Peaceful", "Premium"],
    stats: { views: 3156, likes: 234, rating: 4.9 },
    date: "2024-01-10",
    category: "Beach"
  },
  // Page 2
  {
    id: 4,
    title: "Urban City Lights",
    description: "Dynamic cityscape with vibrant neon lights and bustling energy. Capturing the essence of modern metropolitan life.",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Urban", "Night"],
    stats: { views: 1967, likes: 167, rating: 4.7 },
    date: "2024-01-08",
    category: "Urban"
  },
  {
    id: 5,
    title: "Ancient Forest Path",
    description: "Mystical forest trail surrounded by towering trees and dappled sunlight. A journey into nature's ancient wisdom.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Adventure", "Mystical"],
    stats: { views: 2234, likes: 178, rating: 4.8 },
    date: "2024-01-05",
    category: "Forest"
  },
  {
    id: 6,
    title: "Desert Sunset Glory",
    description: "Magnificent desert landscape painted with warm sunset colors. Experience the tranquil beauty of endless horizons.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Sunset", "Majestic"],
    stats: { views: 2892, likes: 201, rating: 4.9 },
    date: "2024-01-03",
    category: "Desert"
  },
  // Page 3
  {
    id: 7,
    title: "Snowy Winter Wonderland",
    description: "Pristine snow-covered landscape with frosted trees creating a magical winter scene that captures the season's pure beauty.",
    image: "https://images.unsplash.com/photo-1478827217976-6e0d033b7dda?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Winter", "Magic"],
    stats: { views: 2156, likes: 198, rating: 4.7 },
    date: "2024-01-02",
    category: "Winter"
  },
  {
    id: 8,
    title: "Tropical Paradise Beach",
    description: "Crystal clear waters and swaying palm trees create the perfect tropical getaway. Paradise found in its purest form.",
    image: "https://images.unsplash.com/photo-1573935713146-80f2ba93ff1c?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Tropical", "Paradise"],
    stats: { views: 3421, likes: 267, rating: 4.9 },
    date: "2023-12-28",
    category: "Tropical"
  },
  {
    id: 9,
    title: "Vibrant Flower Garden",
    description: "Colorful blooms in full spring glory, showcasing nature's artistry in a symphony of colors and fragrances.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Spring", "Colorful"],
    stats: { views: 1876, likes: 156, rating: 4.6 },
    date: "2023-12-25",
    category: "Garden"
  },
  // Page 4
  {
    id: 10,
    title: "Majestic Waterfall",
    description: "Powerful cascading water falls through rocky cliffs, creating a mesmerizing display of nature's raw power and beauty.",
    image: "https://images.unsplash.com/photo-1432889490240-84df33d47091?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Power", "Natural"],
    stats: { views: 2678, likes: 221, rating: 4.8 },
    date: "2023-12-22",
    category: "Waterfall"
  },
  {
    id: 11,
    title: "Starry Night Sky",
    description: "Billions of stars illuminate the night sky above a silhouetted landscape, revealing the universe's infinite beauty.",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Night", "Cosmic"],
    stats: { views: 3987, likes: 312, rating: 4.9 },
    date: "2023-12-20",
    category: "Astronomy"
  },
  {
    id: 12,
    title: "Golden Wheat Fields",
    description: "Endless golden wheat swaying in the gentle breeze, representing abundance and the beauty of agricultural landscapes.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&crop=entropy&auto=format",
    badges: ["Golden", "Harvest"],
    stats: { views: 1543, likes: 134, rating: 4.5 },
    date: "2023-12-18",
    category: "Agriculture"
  }
];

const AnimatedCards: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(mockCards.length / cardsPerPage);

  const getCurrentPageCards = (): CardData[] => {
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    return mockCards.slice(startIndex, endIndex);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to cards section
      const element = document.getElementById('cards-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToPrevious = () => {
    goToPage(currentPage - 1);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };

  const openModal = (card: CardData) => {
    console.log('openModal called with:', card.title);
    setSelectedCard(card);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // Add a history entry for the modal
    history.pushState({ modalOpen: true, cardId: card.id }, '', `#card-${card.id}`);
  };

  const closeModal = (fromHistory = false) => {
    setIsModalOpen(false);
    setSelectedCard(null);
    document.body.style.overflow = 'unset'; // Restore scroll
    
    // Remove the modal from history if it exists and not already from history navigation
    if (!fromHistory && window.location.hash.startsWith('#card-')) {
      history.back();
    }
  };

  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Handle browser back button for modal
  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.modalOpen) {
        // Browser is going forward to a modal state
        const cardId = e.state.cardId;
        const card = mockCards.find(c => c.id === cardId);
        if (card) {
          setSelectedCard(card);
          setIsModalOpen(true);
          document.body.style.overflow = 'hidden';
        }
      } else if (isModalOpen) {
        // Browser is going back and modal is open, close it
        closeModal(true); // Pass true to indicate this is from history navigation
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isModalOpen]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getBadgeStyle = (badge: string): string => {
    const badgeStyles: { [key: string]: string } = {
      'Popular': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
      'Featured': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      'Trending': 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      'New': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'Peaceful': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'Premium': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
      'Urban': 'bg-gradient-to-r from-gray-600 to-gray-800 text-white',
      'Night': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
      'Adventure': 'bg-gradient-to-r from-teal-500 to-green-500 text-white',
      'Mystical': 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      'Sunset': 'bg-gradient-to-r from-orange-400 to-pink-500 text-white',
      'Majestic': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
    };
    return badgeStyles[badge] || 'bg-gray-500 text-white';
  };

  const currentCards = getCurrentPageCards();

  // Debug logging
  console.log('Modal state:', { isModalOpen, selectedCard: selectedCard?.title || 'none' });


  return (
    <div id="cards-section" className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Featured Collections
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover stunning visuals and inspiring content curated just for you
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Page {currentPage} of {totalPages}</span>
            <span>•</span>
            <span>{mockCards.length} total items</span>
          </div>
        </div>

        {/* Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {currentCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Image Container - Responsive height */}
              <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-48 xl:h-52 overflow-hidden flex-shrink-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {card.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-105 ${getBadgeStyle(badge)}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    <Tag className="w-3 h-3 mr-1" />
                    {card.category}
                  </div>
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Content - Flexible height */}
              <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                  {card.title}
                </h3>

                {/* Description - Truncated */}
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-1">
                  {card.description}
                </p>

                {/* Stats Row - Compact */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatNumber(card.stats.views)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatNumber(card.stats.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                      <span>{card.stats.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Date + Read More */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>{formatDate(card.date)}</span>
                  </div>
                  
                  {/* Read More Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Read More clicked for:', card.title);
                      openModal(card);
                    }}
                    className="group/btn relative px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1 z-10"
                  >
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 transition-colors duration-300"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-center justify-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`group relative flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1 mx-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`relative w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-110'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  {page}
                  {currentPage === page && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 to-blue-500/30 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`group relative flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Page Info */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-cyan-600 dark:text-cyan-400">{(currentPage - 1) * cardsPerPage + 1}</span> to{' '}
              <span className="font-medium text-cyan-600 dark:text-cyan-400">{Math.min(currentPage * cardsPerPage, mockCards.length)}</span> of{' '}
              <span className="font-medium text-cyan-600 dark:text-cyan-400">{mockCards.length}</span> results
            </p>
          </div>
        </div>
      </div>

      {/* Debug Modal State */}
      {isModalOpen && (
        <div className="fixed top-4 right-4 z-[9998] bg-red-500 text-white p-2 rounded text-xs">
          Modal is open: {selectedCard?.title || 'No card'}
        </div>
      )}

      {/* Modal for Card Details */}
      {isModalOpen && selectedCard && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => closeModal()}
        >
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => closeModal()}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[400px] overflow-hidden lg:rounded-l-2xl rounded-t-2xl lg:rounded-tr-none">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {selectedCard.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`px-3 py-1 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm ${getBadgeStyle(badge)}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Tag className="w-4 h-4 mr-1" />
                    {selectedCard.category}
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(selectedCard.stats.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                        <Heart className="w-4 h-4" />
                        <span>{formatNumber(selectedCard.stats.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{selectedCard.stats.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {selectedCard.title}
                </h2>

                {/* Description */}
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-1">
                  {selectedCard.description}
                </p>

                {/* Additional Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCard.category}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Views</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(selectedCard.stats.views)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Likes</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(selectedCard.stats.likes)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCard.stats.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selectedCard.date)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    View Full Content
                  </button>
                  <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
          opacity: 1 !important;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AnimatedCards;