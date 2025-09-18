'use client';

import React, { useState, useEffect } from 'react';

// Types
interface Event {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  imageUrl?: string;
  organizerId: string;
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  averageRating?: number;
  totalReviews?: number;
  totalBookings?: number;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Custom hooks
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function useEvents(filters: {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
} = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/events${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.search, filters.category, filters.location, filters.page]);

  return { events, pagination, loading, error, refetch: fetchEvents };
}

// Components
const SearchStrip = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  locationFilter, 
  setLocationFilter,
  onSearch 
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  onSearch: () => void;
}) => {
  const cities = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali", "Medan"];
  const categories = ["All Categories", "Business & Professional", "Music", "Food & Drink", "Arts & Culture", "Technology", "Sports & Fitness", "Health & Wellness", "Education"];

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-5 border hairline rounded-xl overflow-hidden bg-white">
      <div className="booking-field">
        <span className="booking-label">What</span>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="booking-value bg-transparent border-none outline-none w-full"
        />
      </div>
      
      <div className="booking-field border-t md:border-t-0 md:border-l hairline">
        <span className="booking-label">Where</span>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="booking-value bg-transparent border-none outline-none w-full"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      
      <div className="booking-field border-t md:border-t-0 md:border-l hairline">
        <span className="booking-label">Category</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="booking-value bg-transparent border-none outline-none w-full"
        >
          {categories.map(category => (
            <option key={category} value={category === 'All Categories' ? '' : category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="booking-field border-t md:border-t-0 md:border-l hairline">
        <span className="booking-label">When</span>
        <span className="booking-value">Any date</span>
      </div>
      
      <div className="md:border-l hairline p-2 flex">
        <button onClick={onSearch} className="btn btn-primary w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          Find Events
        </button>
      </div>
    </div>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `IDR ${(price / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatLocation = (location: string) => {
    const parts = location.split(',');
    return parts[0].trim();
  };

  // Dynamic chip color based on availability
  const getAvailabilityChip = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'status-available';
    if (ratio > 0.2) return 'status-limited';
    return 'status-sold-out';
  };

  // Cycle through tint backgrounds
  const getTintClass = (id: string) => {
    const tints = ['bg-rose-tint', 'bg-banana-tint', 'bg-mint-tint', 'bg-sky-tint'];
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return tints[hash % 4];
  };

  return (
    <div className="card overflow-hidden hover-lift group">
      <div className="relative aspect-[5/3]">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 ${getTintClass(event.id)}`} />
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1 mr-2 group-hover:text-gradient transition-all duration-200">
            {event.name}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="font-semibold">{formatPrice(event.price)}</div>
          </div>
        </div>
        <div className="text-muted text-sm mb-1">{formatDate(event.startDate)}</div>
        <div className="text-muted text-sm mb-3">{formatLocation(event.location)}</div>
        <div className="flex items-center justify-between">
          <span className="chip">{event.category}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityChip(event.availableSeats, event.totalSeats)}`}>
            {event.availableSeats} left
          </span>
        </div>
      </div>
    </div>
  );
};

const CategoryList = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}) => (
  <ul className="divide-y hairline text-[1.05rem]">
    {categories.map((category) => (
      <li key={category} className="flex items-center justify-between py-4">
        <button
          onClick={() => onCategorySelect(category)}
          className={`hover:text-[var(--text)] transition-colors ${
            selectedCategory === category ? 'font-semibold' : ''
          }`}
        >
          {category}
        </button>
        <span aria-hidden>→</span>
      </li>
    ))}
  </ul>
);

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="card overflow-hidden animate-pulse">
        <div className="aspect-[5/3] bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function EnjoyorNewDesign() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationFilter, setLocationFilter] = useState('Jakarta');
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Use real API data
  const { events, pagination, loading, error } = useEvents({
    search: debouncedSearch,
    category: selectedCategory,
    location: locationFilter === 'Jakarta' ? '' : locationFilter,
    page: currentPage,
    limit: 6
  });

  const categories = ["Business & Professional", "Music", "Food & Drink", "Arts & Culture", "Technology", "Sports & Fitness"];

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setLocationFilter('Jakarta');
    setCurrentPage(1);
  };

  return (
    <main>
      {/* Search strip */}
      <section className="bg-cream border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <SearchStrip
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid">
            <h1 className="hero-title">
              Discover Events.<br /> Easy Booking.
            </h1>
            <p className="text-muted mt-4 text-lg max-w-2xl">
              Find and book the best events in your city. From conferences to concerts, workshops to festivals.
            </p>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <section className="border-t hairline border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
          {/* Categories sidebar */}
          <div className="lg:border-r hairline pr-0 lg:pr-8">
            <h2 className="text-xl font-semibold mb-6">Browse Categories</h2>
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Events grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedCategory ? `${selectedCategory} Events` : 
                   debouncedSearch ? `Results for "${debouncedSearch}"` : 
                   `Events in ${locationFilter}`}
                </h2>
                <p className="text-muted mt-1">
                  {loading ? 'Loading events...' : 
                   events.length === 0 ? 'No events found' :
                   pagination ? `${pagination.totalEvents} events found` : 
                   `${events.length} events`}
                </p>
              </div>
              {(selectedCategory || debouncedSearch) && (
                <button onClick={clearFilters} className="btn btn-ghost text-sm">
                  Clear filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && <LoadingGrid />}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">Error loading events</div>
                <p className="text-muted mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Events Grid */}
            {!loading && !error && events.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrevPage}
                        className="btn btn-ghost disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={!pagination.hasNextPage}
                        className="btn btn-ghost disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && events.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted mb-6">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Show all events
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured cities or news section */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card overflow-hidden p-0">
                <div className="relative aspect-[5/3]">
                  <div className="absolute inset-0 bg-[rgba(189,227,195,0.35)]" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Upcoming Events This Month
                  </h3>
                  <p className="text-muted">
                    Don't miss out on the hottest events happening in your city.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-[1.6rem] leading-tight mb-4">
                New Event Categories Added: Technology & Health Workshops
              </h3>
              <button className="btn btn-ghost w-fit">
                <span className="inline-grid place-items-center h-6 w-6 rounded-full border hairline mr-1">↗</span>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}