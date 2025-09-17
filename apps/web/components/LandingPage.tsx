'use client';

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, ChevronDown, User, Menu } from 'lucide-react';
import { useEvents } from '@/hooks/useEvent';
import { Event } from '@/types';

// Category configuration
const categories = ['Business & Professional', 'Music', 'Food & Drink', 'Sports & Fitness', 'Arts & Culture', 'Education', 'Health & Wellness', 'Technology'];

const categoryIcons: { [key: string]: string } = {
  'Business & Professional': '■',
  'Music': '♪',
  'Food & Drink': '◉',
  'Sports & Fitness': '▲',
  'Arts & Culture': '●',
  'Education': '□',
  'Health & Wellness': '◇',
  'Technology': '⬢'
};

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Header Component
const Header = () => {
  return (
    <header className="bg-gradient-to-r from-sky-400 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-500 font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold">Enjoyor</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-1 hover:text-blue-100">
              <span>My Orders</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden md:block">Guest User</span>
            </div>
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop)'
        }}
      />
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[0, 1, 2, 3, 4].map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
      
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
        ←
      </button>
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
        →
      </button>
      
      <div className="relative h-full flex items-center justify-center text-white text-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Event booking made easy with
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-yellow-300">
            Enjoyor
          </h2>
        </div>
      </div>
    </section>
  );
};

// Category Selector
const CategorySelector = ({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  return (
    <section className="bg-white py-8 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="text-3xl mb-2 font-bold text-gray-700">
                {categoryIcons[category] || '●'}
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// Event Card Component
const EventCard = ({ event }: { event: Event }) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop'} 
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {event.category}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {event.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.startDate)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {event.availableSeats} tickets available
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(event.price)}
            </div>
            <div className="text-xs text-gray-500">per person</div>
          </div>
          
          <button className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-sky-500 hover:to-blue-600 transition-all">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function IntegratedLandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Use real API data
  const { events, pagination, loading, error } = useEvents({
    search: debouncedSearch,
    category: selectedCategory,
    page: currentPage,
    limit: 12
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error loading events</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection onSearch={setSearchTerm} />
      <CategorySelector 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {/* Search Bar */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">
              {events.length > 0 ? "It's more than just an event" : "No events found"}
            </h2>
            {pagination && (
              <p className="text-gray-600">
                Showing {events.length} of {pagination.totalEvents} events
              </p>
            )}
          </div>
          
          {events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-4xl mb-4">No Results</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg"
              >
                Show all events
              </button>
            </div>
          )}
        </div>
      </section>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Enjoyor. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}