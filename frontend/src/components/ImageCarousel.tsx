'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface ImageFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isSwipingRight, setIsSwipingRight] = useState(false);

  // Mock data for now since backend isn't running
  const mockImages = [
    {
      id: '1',
      filename: 'house1.jpg',
      originalName: 'Beautiful Modern House',
      path: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop',
      mimetype: 'image/jpeg',
      size: 1024,
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      filename: 'house2.jpg',
      originalName: 'Luxury Villa',
      path: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop',
      mimetype: 'image/jpeg',
      size: 1024,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      filename: 'house3.jpg', 
      originalName: 'Cozy Family Home',
      path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop',
      mimetype: 'image/jpeg',
      size: 1024,
      createdAt: new Date().toISOString()
    }
  ];

  // Optimized fetch with better caching
  const { data: imagesData, isLoading } = useQuery({
    queryKey: ['public-carousel-images'],
    queryFn: async () => {
      try {
        return await publicAPI.getPublicImages();
      } catch (error) {
        // Fallback to mock data if API fails
        console.log('Using mock data for carousel');
        return { data: mockImages };
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1, // Only retry once
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch if cached
  });

  const images = imagesData?.data || [];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Provide visual feedback during swipe
    if (touchStart && Math.abs(touchStart - currentTouch) > 20) {
      const distance = touchStart - currentTouch;
      if (distance > 0) {
        setIsSwipingLeft(true);
        setIsSwipingRight(false);
      } else {
        setIsSwipingLeft(false);
        setIsSwipingRight(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwipingLeft(false);
    setIsSwipingRight(false);
  };

  // Mouse drag handlers for desktop (optional)
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwipingLeft(false);
    setIsSwipingRight(false);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] xs:h-[72vh] sm:h-[74vh] md:h-[76vh] lg:h-[76vh] xl:h-[78vh] 2xl:h-[80vh] 3xl:h-[82vh] 4xl:h-[84vh] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-500" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[70vh] xs:h-[72vh] sm:h-[74vh] md:h-[76vh] lg:h-[76vh] xl:h-[78vh] 2xl:h-[80vh] 3xl:h-[82vh] 4xl:h-[84vh] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-responsive-subtitle text-gray-900 dark:text-white mb-2">No Images Available</h3>
          <p className="text-responsive-body text-gray-600 dark:text-gray-400">Upload some images to see them in the carousel</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      className="relative w-full h-[70vh] xs:h-[72vh] sm:h-[74vh] md:h-[76vh] lg:h-[76vh] xl:h-[78vh] 2xl:h-[80vh] 3xl:h-[82vh] 4xl:h-[84vh] rounded-2xl overflow-hidden shadow-2xl group cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setTouchStart(null);
        setTouchEnd(null);
        setIsSwipingLeft(false);
        setIsSwipingRight(false);
      }}
    >
      {/* Main Image Container with Enhanced Effects */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Background Blur Layer for Depth */}
        <div 
          className="absolute inset-0 w-full h-full scale-110 blur-sm opacity-30 transition-all duration-700"
          style={{
            backgroundImage: `url(${currentImage?.path || '/api/placeholder/800/400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <img
          src={currentImage?.path || '/api/placeholder/800/400'}
          alt={currentImage?.originalName || 'Carousel image'}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zODQgMjA4SDQxNlYyNDBIMzg0VjIwOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTM2OCAyMjRIMzg0VjI0MEgzNjhWMjI0WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNDE2IDIyNEg0MzJWMjQwSDQxNlYyMjRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zNTIgMjQwSDM2OFYyNTZIMzUyVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+CjwvcGF0aD4KPC9zdmc+';
          }}
        />
        
        {/* Enhanced Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        {/* Ambient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1500"></div>
        </div>

        {/* Swipe Visual Feedback */}
        {isSwipingLeft && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/20 pointer-events-none transition-opacity duration-200">
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80">
              <ChevronRight className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        )}
        
        {isSwipingRight && (
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-500/20 pointer-events-none transition-opacity duration-200">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80">
              <ChevronLeft className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Enhanced Image Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 sm:p-6 lg:p-8">
          <h3 className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl 4k:text-8xl font-bold mb-2 text-truncate drop-shadow-lg">
            {currentImage?.originalName}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-white/90 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4k:text-5xl font-medium drop-shadow-md">
              Uploaded {new Date(currentImage?.createdAt).toLocaleDateString()}
            </p>
            {/* Swipe Hint - Only show on touch devices */}
            {images.length > 1 && (
              <div className="hidden xs:flex md:hidden items-center text-white/70 text-xs font-medium bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Swipe to navigate
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-3 xs:left-4 sm:left-6 lg:left-8 xl:left-10 2xl:left-12 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 xs:p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-7 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20 items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 text-white drop-shadow-md" />
          </button>
          
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-3 xs:right-4 sm:right-6 lg:right-8 xl:right-10 2xl:right-12 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 xs:p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-7 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20 items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 text-white drop-shadow-md" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {images.length > 1 && (
        <button
          onClick={togglePlayPause}
          className="absolute top-3 xs:top-4 sm:top-6 lg:top-8 xl:top-10 2xl:top-12 right-3 xs:right-4 sm:right-6 lg:right-8 xl:right-10 2xl:right-12 bg-white/25 hover:bg-white/40 backdrop-blur-md rounded-full p-2 xs:p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-7 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl border border-white/20"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9 text-white drop-shadow-md" />
          ) : (
            <Play className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9 text-white drop-shadow-md" />
          )}
        </button>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 xs:bottom-6 sm:bottom-8 lg:bottom-12 xl:bottom-16 2xl:bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 xs:space-x-3 lg:space-x-4 bg-black/30 backdrop-blur-md rounded-full px-3 xs:px-4 lg:px-6 py-1.5 xs:py-2 lg:py-3 border border-white/20">
          {images.map((_image: ImageFile, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 xs:w-3 xs:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 xs:top-4 sm:top-6 lg:top-8 xl:top-10 2xl:top-12 left-3 xs:left-4 sm:left-6 lg:left-8 xl:left-10 2xl:left-12 bg-black/40 backdrop-blur-md rounded-xl xs:rounded-2xl px-3 xs:px-4 lg:px-5 xl:px-6 py-1.5 xs:py-2 lg:py-3 text-white text-xs xs:text-sm lg:text-base xl:text-lg 2xl:text-xl font-semibold shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-blue-300">{currentIndex + 1}</span>
          <span className="text-white/70 mx-1">/</span>
          <span className="text-white/90">{images.length}</span>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;