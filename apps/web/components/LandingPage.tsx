"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, X, MapPin, Calendar, DollarSign } from "lucide-react";

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

function useEvents(
  filters: {
    search?: string;
    category?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    dateStart?: string;
    dateEnd?: string;
    page?: number;
    limit?: number;
  } = {},
) {
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
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/events${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
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
  }, [
    filters.search,
    filters.category,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.dateStart,
    filters.dateEnd,
    filters.page,
  ]);

  return { events, pagination, loading, error, refetch: fetchEvents };
}

// Components
const EnhancedSearchStrip = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  isSearching,
  onClearFilters,
  hasActiveFilters,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  isSearching: boolean;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const cities = [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Yogyakarta",
    "Bali",
    "Medan",
    "Semarang",
    "Palembang",
  ];
  const categories = [
    "All Categories",
    "Business & Professional",
    "Music",
    "Food & Drink",
    "Arts & Culture",
    "Technology",
    "Sports & Fitness",
    "Health & Wellness",
    "Education",
  ];

  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 border hairline rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Search Input */}
        <div className="booking-field relative">
          <span className="booking-label">What</span>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="booking-value bg-transparent border-none outline-none w-full pl-6"
            />
            {isSearching && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="booking-field border-t md:border-t-0 md:border-l hairline">
          <span className="booking-label">Where</span>
          <div className="relative">
            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="booking-value bg-transparent border-none outline-none w-full pl-6 appearance-none"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="booking-field border-t md:border-t-0 md:border-l hairline">
          <span className="booking-label">Category</span>
          <select
            value={filters.category}
            onChange={(e) =>
              updateFilter(
                "category",
                e.target.value === "All Categories" ? "" : e.target.value,
              )
            }
            className="booking-value bg-transparent border-none outline-none w-full appearance-none"
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category === "All Categories" ? "" : category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="booking-field border-t md:border-t-0 md:border-l hairline">
          <span className="booking-label">When</span>
          <div className="relative">
            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="date"
              value={filters.dateStart}
              onChange={(e) => updateFilter("dateStart", e.target.value)}
              className="booking-value bg-transparent border-none outline-none w-full pl-6"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="md:border-l hairline p-2 flex gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 rounded-lg border transition-colors ${showAdvancedFilters ? "bg-sky-500 text-white border-sky-500" : "bg-white text-gray-700 border-gray-200"}`}
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="card p-4 bg-mint-tint border-mint-500/20">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range (IDR)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
                <span className="text-gray-400 py-2">-</span>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) => updateFilter("dateEnd", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Quick Filters
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      updateFilter("minPrice", e.target.checked ? "0" : "")
                    }
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  Free Events Only
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const today = new Date().toISOString().split("T")[0];
                      const nextWeek = new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000,
                      )
                        .toISOString()
                        .split("T")[0];
                      if (e.target.checked) {
                        updateFilter("dateStart", today);
                        updateFilter("dateEnd", nextWeek);
                      } else {
                        updateFilter("dateStart", "");
                        updateFilter("dateEnd", "");
                      }
                    }}
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  This Week
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-mint-100 text-mint-800 rounded-full text-sm">
              {filters.category}
              <button onClick={() => updateFilter("category", "")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm">
              {filters.location}
              <button onClick={() => updateFilter("location", "")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-banana-100 text-yellow-800 rounded-full text-sm">
              Price: {filters.minPrice || "0"} - {filters.maxPrice || "∞"}
              <button
                onClick={() => {
                  updateFilter("minPrice", "");
                  updateFilter("maxPrice", "");
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  const router = useRouter();

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `IDR ${(price / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatLocation = (location: string) => {
    const parts = location.split(",");
    return parts[0].trim();
  };

  // Dynamic chip color based on availability
  const getAvailabilityChip = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return "status-available";
    if (ratio > 0.2) return "status-limited";
    return "status-sold-out";
  };

  // Cycle through tint backgrounds
  const getTintClass = (id: string) => {
    const tints = [
      "bg-rose-tint",
      "bg-banana-tint",
      "bg-mint-tint",
      "bg-sky-tint",
    ];
    const hash = id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return tints[hash % 4];
  };

  const handleCardClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div
      className="card overflow-hidden hover-lift group cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
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
        <div className="text-muted text-sm mb-1">
          {formatDate(event.startDate)}
        </div>
        <div className="text-muted text-sm mb-3">
          {formatLocation(event.location)}
        </div>
        <div className="flex items-center justify-between">
          <span className="chip">{event.category}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getAvailabilityChip(event.availableSeats, event.totalSeats)}`}
          >
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
  onCategorySelect,
}: {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}) => (
  <ul className="space-y-3 text-[1.05rem]">
    {categories.map((category) => (
      <li key={category} className="flex items-center justify-between py-4">
        <button
          onClick={() => onCategorySelect(category)}
          className={`hover:text-[var(--text)] transition-colors ${
            selectedCategory === category ? "font-semibold" : ""
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

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    dateStart: "",
    dateEnd: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use real API data
  const { events, pagination, loading, error } = useEvents({
    search: debouncedSearch,
    category: filters.category,
    location: filters.location === "" ? "" : filters.location,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    dateStart: filters.dateStart,
    dateEnd: filters.dateEnd,
    page: currentPage,
    limit: 6,
  });

  const categories = [
    "Business & Professional",
    "Music",
    "Food & Drink",
    "Arts & Culture",
    "Technology",
    "Sports & Fitness",
  ];

  const handleCategorySelect = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      dateStart: "",
      dateEnd: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      debouncedSearch.length > 0 ||
      filters.category !== "" ||
      filters.location !== "" ||
      filters.minPrice !== "" ||
      filters.maxPrice !== "" ||
      filters.dateStart !== "" ||
      filters.dateEnd !== ""
    );
  };

  return (
    <main>
      {/* Search strip */}
      <section className="bg-cream border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <EnhancedSearchStrip
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            isSearching={loading}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters()}
          />
        </div>
      </section>

      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid">
            <h1 className="hero-title">
              Discover Events.
              <br /> Easy Booking.
            </h1>
            <p className="text-muted mt-4 text-lg max-w-2xl">
              Find and book the best events in your city. From conferences to
              concerts, workshops to festivals.
            </p>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <section className="border-t hairline border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
          {/* Categories sidebar */}
          <div className="pr-0 lg:pr-8 lg:w-1/4">
            <h2 className="text-xl font-semibold mb-6">Browse Categories</h2>
            <CategoryList
              categories={categories}
              selectedCategory={filters.category}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Events grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {filters.category
                    ? `${filters.category} Events`
                    : debouncedSearch
                      ? `Results for "${debouncedSearch}"`
                      : `Events${filters.location ? ` in ${filters.location}` : ""}`}
                </h2>
                <p className="text-muted mt-1">
                  {loading
                    ? "Loading events..."
                    : events.length === 0
                      ? "No events found"
                      : pagination
                        ? `${pagination.totalEvents} events found`
                        : `${events.length} events`}
                </p>
              </div>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && <LoadingGrid />}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">
                  Error loading events
                </div>
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={!pagination.hasPrevPage}
                        className="btn btn-ghost disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`btn ${currentPage === page ? "btn-primary" : "btn-ghost"}`}
                            >
                              {page}
                            </button>
                          );
                        },
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, pagination.totalPages),
                          )
                        }
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
                <p className="text-muted mb-6">
                  Try adjusting your search criteria
                </p>
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
                <span className="inline-grid place-items-center h-6 w-6 rounded-full border hairline mr-1">
                  ↗
                </span>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
